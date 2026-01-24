"""Unit tests for Vector Service.

Tests the Vector Service operations:
- Store embeddings with metadata
- Semantic search with similarity threshold
- Find similar entities
- Delete project embeddings
- Batch operations
"""

import pytest
from typing import List, Dict, Any
from unittest.mock import Mock, MagicMock, patch

from src.services.vector_service import VectorService
from src.utils.errors import DatabaseConnectionError, DatabaseQueryError


@pytest.fixture
def mock_chroma_manager():
    """Create a mock Chroma connection manager."""
    manager = Mock()
    manager.is_connected = True
    return manager


@pytest.fixture
def mock_collection():
    """Create a mock Chroma collection."""
    collection = Mock()
    collection.name = "project_test_embeddings"
    collection.count = Mock(return_value=0)
    return collection


@pytest.fixture
def vector_service(mock_chroma_manager):
    """Create a Vector Service with mocked Chroma manager."""
    return VectorService(chroma_manager=mock_chroma_manager)


@pytest.fixture
def sample_embedding():
    """Create a sample 768-dimensional embedding."""
    return [0.1] * 768


@pytest.fixture
def sample_metadata():
    """Create sample metadata for an entity."""
    return {
        "entity_type": "function",
        "file_path": "src/auth.py",
        "name": "authenticate_user",
        "project_id": "proj_123"
    }


class TestVectorServiceInit:
    """Tests for Vector Service initialization."""
    
    def test_init_with_manager(self, mock_chroma_manager):
        """Test initialization with provided manager."""
        service = VectorService(chroma_manager=mock_chroma_manager)
        assert service.chroma_manager == mock_chroma_manager
    
    def test_init_without_manager(self):
        """Test initialization without manager uses global."""
        with patch('src.services.vector_service.get_chroma_manager') as mock_get:
            mock_manager = Mock()
            mock_get.return_value = mock_manager
            
            service = VectorService()
            assert service.chroma_manager == mock_manager
            mock_get.assert_called_once()


class TestCollectionManagement:
    """Tests for collection name and management."""
    
    def test_get_collection_name(self, vector_service):
        """Test collection name generation."""
        name = vector_service._get_collection_name("proj_123")
        assert name == "project_proj_123_embeddings"
    
    def test_ensure_collection_creates_new(self, vector_service, mock_collection):
        """Test ensuring collection creates new collection."""
        vector_service.chroma_manager.create_collection = Mock(return_value=mock_collection)
        
        collection = vector_service._ensure_collection("proj_123")
        
        assert collection == mock_collection
        vector_service.chroma_manager.create_collection.assert_called_once_with(
            name="project_proj_123_embeddings",
            metadata={"project_id": "proj_123"},
            get_or_create=True
        )
    
    def test_ensure_collection_handles_error(self, vector_service):
        """Test ensuring collection handles errors."""
        vector_service.chroma_manager.create_collection = Mock(
            side_effect=Exception("Connection failed")
        )
        
        with pytest.raises(Exception, match="Connection failed"):
            vector_service._ensure_collection("proj_123")


class TestStoreEmbedding:
    """Tests for storing embeddings."""
    
    def test_store_embedding_success(
        self, vector_service, mock_collection, sample_embedding, sample_metadata
    ):
        """Test successfully storing an embedding."""
        vector_service._ensure_collection = Mock(return_value=mock_collection)
        
        result = vector_service.store_embedding(
            entity_id="func_123",
            embedding=sample_embedding,
            metadata=sample_metadata
        )
        
        assert result == "func_123"
        mock_collection.add.assert_called_once_with(
            ids=["func_123"],
            embeddings=[sample_embedding],
            metadatas=[sample_metadata]
        )
    
    def test_store_embedding_missing_metadata_fields(
        self, vector_service, sample_embedding
    ):
        """Test storing embedding with missing required metadata fields."""
        incomplete_metadata = {
            "entity_type": "function",
            "name": "test_func"
            # Missing file_path and project_id
        }
        
        with pytest.raises(ValueError, match="Missing required metadata fields"):
            vector_service.store_embedding(
                entity_id="func_123",
                embedding=sample_embedding,
                metadata=incomplete_metadata
            )
    
    def test_store_embedding_handles_chroma_error(
        self, vector_service, mock_collection, sample_embedding, sample_metadata
    ):
        """Test storing embedding handles Chroma errors."""
        from chromadb.errors import ChromaError
        
        vector_service._ensure_collection = Mock(return_value=mock_collection)
        mock_collection.add = Mock(side_effect=ChromaError("Storage failed"))
        
        with pytest.raises(DatabaseQueryError, match="Failed to store embedding"):
            vector_service.store_embedding(
                entity_id="func_123",
                embedding=sample_embedding,
                metadata=sample_metadata
            )
    
    def test_store_embedding_validates_all_required_fields(
        self, vector_service, sample_embedding
    ):
        """Test that all required metadata fields are validated."""
        required_fields = ["entity_type", "file_path", "name", "project_id"]
        
        for field in required_fields:
            metadata = {
                "entity_type": "function",
                "file_path": "test.py",
                "name": "test",
                "project_id": "proj_1"
            }
            del metadata[field]
            
            with pytest.raises(ValueError, match=f"Missing required metadata fields.*{field}"):
                vector_service.store_embedding(
                    entity_id="func_123",
                    embedding=sample_embedding,
                    metadata=metadata
                )


class TestSemanticSearch:
    """Tests for semantic search."""
    
    def test_semantic_search_single_project(
        self, vector_service, mock_collection, sample_embedding
    ):
        """Test semantic search in a single project."""
        # Mock collection exists and query results
        vector_service.chroma_manager.collection_exists = Mock(return_value=True)
        vector_service.chroma_manager.get_collection = Mock(return_value=mock_collection)
        
        mock_collection.query = Mock(return_value={
            "ids": [["func_1", "func_2"]],
            "distances": [[0.1, 0.2]],
            "metadatas": [[
                {"name": "func1", "entity_type": "function"},
                {"name": "func2", "entity_type": "function"}
            ]]
        })
        
        results = vector_service.semantic_search(
            query_embedding=sample_embedding,
            project_ids=["proj_123"],
            top_k=20,
            similarity_threshold=0.7
        )
        
        assert len(results) == 2
        assert results[0]["id"] == "func_1"
        assert results[0]["similarity"] == 0.9  # 1.0 - 0.1
        assert results[1]["id"] == "func_2"
        assert results[1]["similarity"] == 0.8  # 1.0 - 0.2
        
        # Verify results are sorted by similarity (descending)
        assert results[0]["similarity"] > results[1]["similarity"]
    
    def test_semantic_search_filters_by_threshold(
        self, vector_service, mock_collection, sample_embedding
    ):
        """Test semantic search filters results by similarity threshold."""
        vector_service.chroma_manager.collection_exists = Mock(return_value=True)
        vector_service.chroma_manager.get_collection = Mock(return_value=mock_collection)
        
        mock_collection.query = Mock(return_value={
            "ids": [["func_1", "func_2", "func_3"]],
            "distances": [[0.1, 0.4, 0.6]],  # Similarities: 0.9, 0.6, 0.4
            "metadatas": [[
                {"name": "func1"},
                {"name": "func2"},
                {"name": "func3"}
            ]]
        })
        
        results = vector_service.semantic_search(
            query_embedding=sample_embedding,
            project_ids=["proj_123"],
            top_k=20,
            similarity_threshold=0.7
        )
        
        # Only func_1 with similarity 0.9 should pass threshold
        assert len(results) == 1
        assert results[0]["id"] == "func_1"
        assert results[0]["similarity"] >= 0.7
    
    def test_semantic_search_multiple_projects(
        self, vector_service, sample_embedding
    ):
        """Test semantic search across multiple projects."""
        mock_collection1 = Mock()
        mock_collection2 = Mock()
        
        vector_service.chroma_manager.collection_exists = Mock(return_value=True)
        vector_service.chroma_manager.get_collection = Mock(
            side_effect=[mock_collection1, mock_collection2]
        )
        
        mock_collection1.query = Mock(return_value={
            "ids": [["func_1"]],
            "distances": [[0.1]],
            "metadatas": [[{"name": "func1", "project_id": "proj_1"}]]
        })
        
        mock_collection2.query = Mock(return_value={
            "ids": [["func_2"]],
            "distances": [[0.05]],  # More similar
            "metadatas": [[{"name": "func2", "project_id": "proj_2"}]]
        })
        
        results = vector_service.semantic_search(
            query_embedding=sample_embedding,
            project_ids=["proj_1", "proj_2"],
            top_k=20,
            similarity_threshold=0.7
        )
        
        # Results should be merged and sorted by similarity
        assert len(results) == 2
        assert results[0]["id"] == "func_2"  # More similar (0.95)
        assert results[1]["id"] == "func_1"  # Less similar (0.9)
    
    def test_semantic_search_limits_to_top_k(
        self, vector_service, mock_collection, sample_embedding
    ):
        """Test semantic search limits results to top_k."""
        vector_service.chroma_manager.collection_exists = Mock(return_value=True)
        vector_service.chroma_manager.get_collection = Mock(return_value=mock_collection)
        
        # Return 10 results
        mock_collection.query = Mock(return_value={
            "ids": [[f"func_{i}" for i in range(10)]],
            "distances": [[0.1 * i for i in range(10)]],
            "metadatas": [[{"name": f"func{i}"} for i in range(10)]]
        })
        
        results = vector_service.semantic_search(
            query_embedding=sample_embedding,
            project_ids=["proj_123"],
            top_k=5,
            similarity_threshold=0.0
        )
        
        # Should only return top 5
        assert len(results) == 5
    
    def test_semantic_search_empty_project_ids(
        self, vector_service, sample_embedding
    ):
        """Test semantic search with empty project IDs."""
        results = vector_service.semantic_search(
            query_embedding=sample_embedding,
            project_ids=[],
            top_k=20,
            similarity_threshold=0.7
        )
        
        assert results == []
    
    def test_semantic_search_nonexistent_collection(
        self, vector_service, sample_embedding
    ):
        """Test semantic search skips nonexistent collections."""
        vector_service.chroma_manager.collection_exists = Mock(return_value=False)
        
        results = vector_service.semantic_search(
            query_embedding=sample_embedding,
            project_ids=["nonexistent_proj"],
            top_k=20,
            similarity_threshold=0.7
        )
        
        assert results == []
    
    def test_semantic_search_handles_chroma_error(
        self, vector_service, mock_collection, sample_embedding
    ):
        """Test semantic search handles Chroma errors."""
        from chromadb.errors import ChromaError
        
        vector_service.chroma_manager.collection_exists = Mock(return_value=True)
        vector_service.chroma_manager.get_collection = Mock(
            side_effect=ChromaError("Query failed")
        )
        
        with pytest.raises(DatabaseQueryError, match="Failed to perform semantic search"):
            vector_service.semantic_search(
                query_embedding=sample_embedding,
                project_ids=["proj_123"],
                top_k=20,
                similarity_threshold=0.7
            )


class TestFindSimilarEntities:
    """Tests for finding similar entities."""
    
    def test_find_similar_entities_success(
        self, vector_service, mock_collection, sample_embedding
    ):
        """Test successfully finding similar entities."""
        vector_service.chroma_manager.collection_exists = Mock(return_value=True)
        vector_service.chroma_manager.get_collection = Mock(return_value=mock_collection)
        
        # Mock getting the entity's embedding
        mock_collection.get = Mock(return_value={
            "ids": ["func_123"],
            "embeddings": [sample_embedding]
        })
        
        # Mock query results (includes the entity itself)
        mock_collection.query = Mock(return_value={
            "ids": [["func_123", "func_456", "func_789"]],
            "distances": [[0.0, 0.1, 0.2]],
            "metadatas": [[
                {"name": "func123"},
                {"name": "func456"},
                {"name": "func789"}
            ]]
        })
        
        results = vector_service.find_similar_entities(
            entity_id="func_123",
            project_id="proj_123",
            top_k=10
        )
        
        # Should exclude the entity itself
        assert len(results) == 2
        assert results[0]["id"] == "func_456"
        assert results[1]["id"] == "func_789"
        assert "func_123" not in [r["id"] for r in results]
    
    def test_find_similar_entities_nonexistent_collection(
        self, vector_service
    ):
        """Test finding similar entities in nonexistent collection."""
        vector_service.chroma_manager.collection_exists = Mock(return_value=False)
        
        with pytest.raises(DatabaseQueryError, match="does not exist"):
            vector_service.find_similar_entities(
                entity_id="func_123",
                project_id="nonexistent_proj",
                top_k=10
            )
    
    def test_find_similar_entities_nonexistent_entity(
        self, vector_service, mock_collection
    ):
        """Test finding similar entities for nonexistent entity."""
        vector_service.chroma_manager.collection_exists = Mock(return_value=True)
        vector_service.chroma_manager.get_collection = Mock(return_value=mock_collection)
        
        # Entity not found
        mock_collection.get = Mock(return_value={
            "ids": [],
            "embeddings": []
        })
        
        with pytest.raises(DatabaseQueryError, match="not found"):
            vector_service.find_similar_entities(
                entity_id="nonexistent_func",
                project_id="proj_123",
                top_k=10
            )
    
    def test_find_similar_entities_limits_results(
        self, vector_service, mock_collection, sample_embedding
    ):
        """Test finding similar entities limits results to top_k."""
        vector_service.chroma_manager.collection_exists = Mock(return_value=True)
        vector_service.chroma_manager.get_collection = Mock(return_value=mock_collection)
        
        mock_collection.get = Mock(return_value={
            "ids": ["func_123"],
            "embeddings": [sample_embedding]
        })
        
        # Return many results
        mock_collection.query = Mock(return_value={
            "ids": [[f"func_{i}" for i in range(20)]],
            "distances": [[0.1 * i for i in range(20)]],
            "metadatas": [[{"name": f"func{i}"} for i in range(20)]]
        })
        
        results = vector_service.find_similar_entities(
            entity_id="func_0",
            project_id="proj_123",
            top_k=5
        )
        
        # Should return at most 5 (excluding the entity itself)
        assert len(results) <= 5


class TestDeleteProjectEmbeddings:
    """Tests for deleting project embeddings."""
    
    def test_delete_project_embeddings_success(self, vector_service):
        """Test successfully deleting project embeddings."""
        vector_service.chroma_manager.collection_exists = Mock(return_value=True)
        vector_service.chroma_manager.get_collection_count = Mock(return_value=42)
        vector_service.chroma_manager.delete_collection = Mock()
        
        count = vector_service.delete_project_embeddings("proj_123")
        
        assert count == 42
        vector_service.chroma_manager.delete_collection.assert_called_once_with(
            "project_proj_123_embeddings"
        )
    
    def test_delete_project_embeddings_nonexistent_collection(
        self, vector_service
    ):
        """Test deleting embeddings for nonexistent collection."""
        vector_service.chroma_manager.collection_exists = Mock(return_value=False)
        
        count = vector_service.delete_project_embeddings("nonexistent_proj")
        
        assert count == 0
        # Should not attempt to delete
        vector_service.chroma_manager.delete_collection.assert_not_called()
    
    def test_delete_project_embeddings_handles_error(self, vector_service):
        """Test deleting embeddings handles errors."""
        from chromadb.errors import ChromaError
        
        vector_service.chroma_manager.collection_exists = Mock(return_value=True)
        vector_service.chroma_manager.get_collection_count = Mock(return_value=10)
        vector_service.chroma_manager.delete_collection = Mock(
            side_effect=ChromaError("Deletion failed")
        )
        
        with pytest.raises(DatabaseQueryError, match="Failed to delete project embeddings"):
            vector_service.delete_project_embeddings("proj_123")


class TestGetEmbedding:
    """Tests for getting embeddings."""
    
    def test_get_embedding_success(
        self, vector_service, mock_collection, sample_embedding, sample_metadata
    ):
        """Test successfully getting an embedding."""
        vector_service.chroma_manager.collection_exists = Mock(return_value=True)
        vector_service.chroma_manager.get_collection = Mock(return_value=mock_collection)
        
        mock_collection.get = Mock(return_value={
            "ids": ["func_123"],
            "embeddings": [sample_embedding],
            "metadatas": [sample_metadata]
        })
        
        result = vector_service.get_embedding("func_123", "proj_123")
        
        assert result is not None
        assert result["id"] == "func_123"
        assert result["embedding"] == sample_embedding
        assert result["metadata"] == sample_metadata
    
    def test_get_embedding_nonexistent_collection(self, vector_service):
        """Test getting embedding from nonexistent collection."""
        vector_service.chroma_manager.collection_exists = Mock(return_value=False)
        
        result = vector_service.get_embedding("func_123", "nonexistent_proj")
        
        assert result is None
    
    def test_get_embedding_nonexistent_entity(
        self, vector_service, mock_collection
    ):
        """Test getting nonexistent embedding."""
        vector_service.chroma_manager.collection_exists = Mock(return_value=True)
        vector_service.chroma_manager.get_collection = Mock(return_value=mock_collection)
        
        mock_collection.get = Mock(return_value={
            "ids": [],
            "embeddings": [],
            "metadatas": []
        })
        
        result = vector_service.get_embedding("nonexistent_func", "proj_123")
        
        assert result is None


class TestBatchStoreEmbeddings:
    """Tests for batch storing embeddings."""
    
    def test_batch_store_embeddings_success(
        self, vector_service, mock_collection
    ):
        """Test successfully batch storing embeddings."""
        vector_service._ensure_collection = Mock(return_value=mock_collection)
        
        entity_ids = ["func_1", "func_2", "func_3"]
        embeddings = [[0.1] * 768, [0.2] * 768, [0.3] * 768]
        metadatas = [
            {"entity_type": "function", "name": "f1", "project_id": "proj_1",
             "file_path": "test.py"},
            {"entity_type": "function", "name": "f2", "project_id": "proj_1",
             "file_path": "test.py"},
            {"entity_type": "function", "name": "f3", "project_id": "proj_1",
             "file_path": "test.py"}
        ]
        
        count = vector_service.batch_store_embeddings(
            entity_ids=entity_ids,
            embeddings=embeddings,
            metadatas=metadatas
        )
        
        assert count == 3
        mock_collection.add.assert_called_once()
    
    def test_batch_store_embeddings_multiple_projects(
        self, vector_service
    ):
        """Test batch storing embeddings across multiple projects."""
        mock_collection1 = Mock()
        mock_collection2 = Mock()
        
        vector_service._ensure_collection = Mock(
            side_effect=[mock_collection1, mock_collection2]
        )
        
        entity_ids = ["func_1", "func_2"]
        embeddings = [[0.1] * 768, [0.2] * 768]
        metadatas = [
            {"entity_type": "function", "name": "f1", "project_id": "proj_1",
             "file_path": "test.py"},
            {"entity_type": "function", "name": "f2", "project_id": "proj_2",
             "file_path": "test.py"}
        ]
        
        count = vector_service.batch_store_embeddings(
            entity_ids=entity_ids,
            embeddings=embeddings,
            metadatas=metadatas
        )
        
        assert count == 2
        # Should call add on both collections
        mock_collection1.add.assert_called_once()
        mock_collection2.add.assert_called_once()
    
    def test_batch_store_embeddings_mismatched_lengths(self, vector_service):
        """Test batch storing with mismatched input lengths."""
        with pytest.raises(ValueError, match="must have the same length"):
            vector_service.batch_store_embeddings(
                entity_ids=["func_1", "func_2"],
                embeddings=[[0.1] * 768],  # Only 1 embedding
                metadatas=[{"project_id": "proj_1"}]
            )
    
    def test_batch_store_embeddings_empty_input(self, vector_service):
        """Test batch storing with empty input."""
        count = vector_service.batch_store_embeddings(
            entity_ids=[],
            embeddings=[],
            metadatas=[]
        )
        
        assert count == 0
    
    def test_batch_store_embeddings_missing_project_id(self, vector_service):
        """Test batch storing with missing project_id in metadata."""
        with pytest.raises(ValueError, match="missing project_id"):
            vector_service.batch_store_embeddings(
                entity_ids=["func_1"],
                embeddings=[[0.1] * 768],
                metadatas=[{"entity_type": "function"}]  # Missing project_id
            )


class TestGlobalServiceInstance:
    """Tests for global service instance management."""
    
    def test_get_vector_service_creates_instance(self):
        """Test get_vector_service creates instance."""
        from src.services.vector_service import (
            get_vector_service,
            close_vector_service,
            _vector_service
        )
        
        # Clean up first
        close_vector_service()
        
        with patch('src.services.vector_service.get_chroma_manager'):
            service = get_vector_service()
            assert service is not None
            assert isinstance(service, VectorService)
    
    def test_get_vector_service_returns_same_instance(self):
        """Test get_vector_service returns same instance."""
        from src.services.vector_service import (
            get_vector_service,
            close_vector_service
        )
        
        close_vector_service()
        
        with patch('src.services.vector_service.get_chroma_manager'):
            service1 = get_vector_service()
            service2 = get_vector_service()
            assert service1 is service2
    
    def test_close_vector_service(self):
        """Test close_vector_service clears instance."""
        from src.services.vector_service import (
            get_vector_service,
            close_vector_service,
            _vector_service
        )
        
        with patch('src.services.vector_service.get_chroma_manager'):
            service = get_vector_service()
            assert service is not None
            
            close_vector_service()
            
            # Should create new instance
            new_service = get_vector_service()
            assert new_service is not service
