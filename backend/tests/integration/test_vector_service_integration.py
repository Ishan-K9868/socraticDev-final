"""Integration tests for Vector Service with real Chroma instance.

These tests verify Vector Service operations against a real Chroma database.
Requires Chroma to be running (via docker-compose).
"""

import pytest
from typing import List

from backend.src.services.vector_service import VectorService
from backend.src.services.chroma_manager import ChromaConnectionManager
from backend.src.utils.errors import DatabaseQueryError


@pytest.fixture(scope="module")
def chroma_manager():
    """Create a Chroma connection manager for testing."""
    manager = ChromaConnectionManager()
    try:
        manager.connect()
        yield manager
    finally:
        # Clean up test collections
        try:
            collections = manager.list_collections()
            for collection in collections:
                if collection.name.startswith("project_test_"):
                    manager.delete_collection(collection.name)
        except Exception:
            pass
        manager.close()


@pytest.fixture
def vector_service(chroma_manager):
    """Create a Vector Service with real Chroma connection."""
    return VectorService(chroma_manager=chroma_manager)


@pytest.fixture
def sample_embedding():
    """Create a sample 768-dimensional embedding."""
    return [0.1 * i for i in range(768)]


@pytest.fixture
def sample_metadata():
    """Create sample metadata for testing."""
    return {
        "entity_type": "function",
        "file_path": "src/test.py",
        "name": "test_function",
        "project_id": "test_proj_123"
    }


@pytest.fixture(autouse=True)
def cleanup_test_collections(chroma_manager):
    """Clean up test collections after each test."""
    yield
    # Clean up after test
    try:
        collections = chroma_manager.list_collections()
        for collection in collections:
            if collection.name.startswith("project_test_"):
                chroma_manager.delete_collection(collection.name)
    except Exception:
        pass


class TestVectorServiceIntegration:
    """Integration tests for Vector Service."""
    
    def test_store_and_retrieve_embedding(
        self, vector_service, sample_embedding, sample_metadata
    ):
        """Test storing and retrieving an embedding."""
        # Store embedding
        entity_id = vector_service.store_embedding(
            entity_id="test_func_1",
            embedding=sample_embedding,
            metadata=sample_metadata
        )
        
        assert entity_id == "test_func_1"
        
        # Retrieve embedding
        result = vector_service.get_embedding(
            entity_id="test_func_1",
            project_id="test_proj_123"
        )
        
        assert result is not None
        assert result["id"] == "test_func_1"
        assert len(result["embedding"]) == 768
        assert result["metadata"]["name"] == "test_function"
    
    def test_semantic_search_with_real_embeddings(
        self, vector_service, sample_embedding
    ):
        """Test semantic search with real embeddings."""
        project_id = "test_proj_456"
        
        # Store multiple embeddings with different vectors
        embeddings_data = [
            {
                "id": "func_1",
                "embedding": [0.1 * i for i in range(768)],
                "metadata": {
                    "entity_type": "function",
                    "file_path": "src/auth.py",
                    "name": "login",
                    "project_id": project_id
                }
            },
            {
                "id": "func_2",
                "embedding": [0.2 * i for i in range(768)],
                "metadata": {
                    "entity_type": "function",
                    "file_path": "src/auth.py",
                    "name": "logout",
                    "project_id": project_id
                }
            },
            {
                "id": "func_3",
                "embedding": [0.3 * i for i in range(768)],
                "metadata": {
                    "entity_type": "function",
                    "file_path": "src/user.py",
                    "name": "get_user",
                    "project_id": project_id
                }
            }
        ]
        
        for data in embeddings_data:
            vector_service.store_embedding(
                entity_id=data["id"],
                embedding=data["embedding"],
                metadata=data["metadata"]
            )
        
        # Search with query similar to func_1
        query_embedding = [0.1 * i for i in range(768)]
        
        results = vector_service.semantic_search(
            query_embedding=query_embedding,
            project_ids=[project_id],
            top_k=10,
            similarity_threshold=0.0  # Low threshold to get all results
        )
        
        # Should return all 3 results
        assert len(results) == 3
        
        # Results should be sorted by similarity
        assert results[0]["similarity"] >= results[1]["similarity"]
        assert results[1]["similarity"] >= results[2]["similarity"]
        
        # Most similar should be func_1
        assert results[0]["id"] == "func_1"
    
    def test_semantic_search_with_threshold(
        self, vector_service
    ):
        """Test semantic search filters by similarity threshold."""
        project_id = "test_proj_789"
        
        # Store embeddings with very different vectors
        vector_service.store_embedding(
            entity_id="similar_func",
            embedding=[0.1] * 768,
            metadata={
                "entity_type": "function",
                "file_path": "test.py",
                "name": "similar",
                "project_id": project_id
            }
        )
        
        vector_service.store_embedding(
            entity_id="different_func",
            embedding=[0.9] * 768,
            metadata={
                "entity_type": "function",
                "file_path": "test.py",
                "name": "different",
                "project_id": project_id
            }
        )
        
        # Search with query similar to first embedding
        query_embedding = [0.1] * 768
        
        results = vector_service.semantic_search(
            query_embedding=query_embedding,
            project_ids=[project_id],
            top_k=10,
            similarity_threshold=0.95  # High threshold
        )
        
        # Should only return the very similar one
        assert len(results) >= 1
        assert results[0]["id"] == "similar_func"
        assert results[0]["similarity"] >= 0.95
    
    def test_find_similar_entities_real(
        self, vector_service
    ):
        """Test finding similar entities with real embeddings."""
        project_id = "test_proj_similar"
        
        # Store multiple related embeddings
        embeddings = [
            ("target_func", [0.5] * 768),
            ("similar_1", [0.51] * 768),
            ("similar_2", [0.52] * 768),
            ("different", [0.9] * 768)
        ]
        
        for entity_id, embedding in embeddings:
            vector_service.store_embedding(
                entity_id=entity_id,
                embedding=embedding,
                metadata={
                    "entity_type": "function",
                    "file_path": "test.py",
                    "name": entity_id,
                    "project_id": project_id
                }
            )
        
        # Find similar to target_func
        results = vector_service.find_similar_entities(
            entity_id="target_func",
            project_id=project_id,
            top_k=5
        )
        
        # Should not include target_func itself
        assert "target_func" not in [r["id"] for r in results]
        
        # Should return other entities
        assert len(results) >= 2
        
        # Most similar should be similar_1 or similar_2
        assert results[0]["id"] in ["similar_1", "similar_2"]
    
    def test_delete_project_embeddings_real(
        self, vector_service, sample_embedding
    ):
        """Test deleting all embeddings for a project."""
        project_id = "test_proj_delete"
        
        # Store multiple embeddings
        for i in range(5):
            vector_service.store_embedding(
                entity_id=f"func_{i}",
                embedding=sample_embedding,
                metadata={
                    "entity_type": "function",
                    "file_path": "test.py",
                    "name": f"func_{i}",
                    "project_id": project_id
                }
            )
        
        # Verify embeddings exist
        result = vector_service.get_embedding("func_0", project_id)
        assert result is not None
        
        # Delete all embeddings
        count = vector_service.delete_project_embeddings(project_id)
        
        assert count == 5
        
        # Verify embeddings are gone
        result = vector_service.get_embedding("func_0", project_id)
        assert result is None
    
    def test_batch_store_embeddings_real(
        self, vector_service
    ):
        """Test batch storing embeddings."""
        project_id = "test_proj_batch"
        
        entity_ids = [f"func_{i}" for i in range(10)]
        embeddings = [[0.1 * i] * 768 for i in range(10)]
        metadatas = [
            {
                "entity_type": "function",
                "file_path": "test.py",
                "name": f"func_{i}",
                "project_id": project_id
            }
            for i in range(10)
        ]
        
        count = vector_service.batch_store_embeddings(
            entity_ids=entity_ids,
            embeddings=embeddings,
            metadatas=metadatas
        )
        
        assert count == 10
        
        # Verify all embeddings were stored
        for entity_id in entity_ids:
            result = vector_service.get_embedding(entity_id, project_id)
            assert result is not None
    
    def test_multi_project_search_real(
        self, vector_service
    ):
        """Test semantic search across multiple projects."""
        # Store embeddings in two different projects
        projects = ["test_proj_multi_1", "test_proj_multi_2"]
        
        for i, project_id in enumerate(projects):
            vector_service.store_embedding(
                entity_id=f"func_{i}",
                embedding=[0.1 * (i + 1)] * 768,
                metadata={
                    "entity_type": "function",
                    "file_path": "test.py",
                    "name": f"func_{i}",
                    "project_id": project_id
                }
            )
        
        # Search across both projects
        query_embedding = [0.1] * 768
        
        results = vector_service.semantic_search(
            query_embedding=query_embedding,
            project_ids=projects,
            top_k=10,
            similarity_threshold=0.0
        )
        
        # Should return results from both projects
        assert len(results) == 2
        
        # Results should be merged and sorted
        project_ids_in_results = [r["metadata"]["project_id"] for r in results]
        assert "test_proj_multi_1" in project_ids_in_results
        assert "test_proj_multi_2" in project_ids_in_results
    
    def test_error_handling_nonexistent_entity(
        self, vector_service
    ):
        """Test error handling for nonexistent entity."""
        with pytest.raises(DatabaseQueryError, match="not found"):
            vector_service.find_similar_entities(
                entity_id="nonexistent",
                project_id="test_proj_123",
                top_k=10
            )
    
    def test_store_embedding_validates_metadata(
        self, vector_service, sample_embedding
    ):
        """Test that storing embedding validates required metadata fields."""
        incomplete_metadata = {
            "entity_type": "function",
            "name": "test"
            # Missing file_path and project_id
        }
        
        with pytest.raises(ValueError, match="Missing required metadata fields"):
            vector_service.store_embedding(
                entity_id="test_func",
                embedding=sample_embedding,
                metadata=incomplete_metadata
            )


class TestVectorServiceEdgeCases:
    """Test edge cases and boundary conditions."""
    
    def test_empty_search_results(self, vector_service):
        """Test search with no matching results."""
        results = vector_service.semantic_search(
            query_embedding=[0.1] * 768,
            project_ids=["nonexistent_project"],
            top_k=10,
            similarity_threshold=0.7
        )
        
        assert results == []
    
    def test_search_with_high_threshold(self, vector_service):
        """Test search with very high similarity threshold."""
        project_id = "test_proj_high_threshold"
        
        # Store an embedding
        vector_service.store_embedding(
            entity_id="func_1",
            embedding=[0.5] * 768,
            metadata={
                "entity_type": "function",
                "file_path": "test.py",
                "name": "func_1",
                "project_id": project_id
            }
        )
        
        # Search with different embedding and very high threshold
        results = vector_service.semantic_search(
            query_embedding=[0.9] * 768,
            project_ids=[project_id],
            top_k=10,
            similarity_threshold=0.99  # Very high
        )
        
        # Should return no results (not similar enough)
        assert len(results) == 0
    
    def test_top_k_limits_results(self, vector_service):
        """Test that top_k properly limits results."""
        project_id = "test_proj_top_k"
        
        # Store 20 embeddings
        for i in range(20):
            vector_service.store_embedding(
                entity_id=f"func_{i}",
                embedding=[0.1 * i] * 768,
                metadata={
                    "entity_type": "function",
                    "file_path": "test.py",
                    "name": f"func_{i}",
                    "project_id": project_id
                }
            )
        
        # Search with top_k=5
        results = vector_service.semantic_search(
            query_embedding=[0.1] * 768,
            project_ids=[project_id],
            top_k=5,
            similarity_threshold=0.0
        )
        
        # Should return exactly 5 results
        assert len(results) == 5
