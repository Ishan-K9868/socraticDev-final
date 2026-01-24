"""Vector Service for managing Chroma vector database operations.

This module provides the Vector Service for semantic search operations:
- Store embeddings with metadata
- Semantic search with similarity threshold
- Find similar entities
- Delete project embeddings

Validates: Requirements 3.1, 3.2, 3.3
"""

import logging
from typing import Any, Dict, List, Optional

from chromadb import Collection
from chromadb.errors import ChromaError

from ..models.base import CodeEntity, SearchResult
from ..utils.errors import DatabaseConnectionError, DatabaseQueryError
from .chroma_manager import ChromaConnectionManager, get_chroma_manager

logger = logging.getLogger(__name__)


class VectorService:
    """Service for managing vector embeddings and semantic search.
    
    Features:
    - Store embeddings with metadata linking to Neo4j entities
    - Semantic search with similarity threshold filtering
    - Find similar entities based on vector similarity
    - Delete all embeddings for a project
    
    Example:
        service = VectorService()
        
        # Store an embedding
        embedding_id = service.store_embedding(
            entity_id="func_123",
            embedding=[0.1, 0.2, ...],  # 768 dimensions
            metadata={
                "entity_type": "function",
                "file_path": "src/main.py",
                "name": "authenticate_user",
                "project_id": "proj_456"
            }
        )
        
        # Semantic search
        results = service.semantic_search(
            query="user authentication",
            project_ids=["proj_456"],
            top_k=20,
            similarity_threshold=0.7
        )
        
        # Find similar entities
        similar = service.find_similar_entities(
            entity_id="func_123",
            top_k=10
        )
        
        # Delete project embeddings
        count = service.delete_project_embeddings("proj_456")
    """
    
    def __init__(self, chroma_manager: Optional[ChromaConnectionManager] = None):
        """Initialize Vector Service.
        
        Args:
            chroma_manager: Optional Chroma connection manager (uses global if not provided)
        """
        self.chroma_manager = chroma_manager or get_chroma_manager()
        logger.info("Initialized Vector Service")
    
    def _get_collection_name(self, project_id: str) -> str:
        """Get collection name for a project.
        
        Args:
            project_id: Project ID
            
        Returns:
            Collection name in format: project_{project_id}_embeddings
        """
        return f"project_{project_id}_embeddings"
    
    def _ensure_collection(self, project_id: str) -> Collection:
        """Ensure collection exists for a project, creating if necessary.
        
        Args:
            project_id: Project ID
            
        Returns:
            Collection for the project
            
        Raises:
            DatabaseConnectionError: If connection fails
            DatabaseQueryError: If collection creation fails
        """
        collection_name = self._get_collection_name(project_id)
        
        try:
            # Get or create collection
            collection = self.chroma_manager.create_collection(
                name=collection_name,
                metadata={"project_id": project_id},
                get_or_create=True
            )
            
            logger.debug(f"Ensured collection exists: {collection_name}")
            return collection
            
        except Exception as e:
            logger.error(f"Failed to ensure collection for project {project_id}: {str(e)}")
            raise
    
    def store_embedding(
        self,
        entity_id: str,
        embedding: List[float],
        metadata: Dict[str, Any]
    ) -> str:
        """Store vector embedding in Chroma with metadata.
        
        Args:
            entity_id: Unique entity ID (links to Neo4j node)
            embedding: Vector embedding (768 dimensions for Gemini)
            metadata: Metadata dict containing:
                - entity_type: Type of entity (function, class, etc.)
                - file_path: Path to source file
                - name: Entity name
                - project_id: Project ID
                - Additional optional fields
                
        Returns:
            Entity ID of stored embedding
            
        Raises:
            DatabaseConnectionError: If connection fails
            DatabaseQueryError: If storage fails
            ValueError: If metadata is missing required fields
            
        Example:
            embedding_id = service.store_embedding(
                entity_id="func_123",
                embedding=[0.1, 0.2, ...],
                metadata={
                    "entity_type": "function",
                    "file_path": "src/auth.py",
                    "name": "login",
                    "project_id": "proj_456"
                }
            )
        """
        # Validate required metadata fields
        required_fields = ["entity_type", "file_path", "name", "project_id"]
        missing_fields = [field for field in required_fields if field not in metadata]
        
        if missing_fields:
            raise ValueError(
                f"Missing required metadata fields: {', '.join(missing_fields)}"
            )
        
        project_id = metadata["project_id"]
        
        try:
            # Ensure collection exists
            collection = self._ensure_collection(project_id)
            
            # Store embedding
            collection.add(
                ids=[entity_id],
                embeddings=[embedding],
                metadatas=[metadata]
            )
            
            logger.info(
                f"Stored embedding for entity {entity_id} in project {project_id}"
            )
            
            return entity_id
            
        except ChromaError as e:
            logger.error(f"Failed to store embedding for entity {entity_id}: {str(e)}")
            raise DatabaseQueryError(
                f"Failed to store embedding: {str(e)}",
                details={
                    "entity_id": entity_id,
                    "project_id": project_id,
                    "metadata": metadata
                }
            ) from e
        except Exception as e:
            logger.error(
                f"Unexpected error storing embedding for entity {entity_id}: {str(e)}"
            )
            raise DatabaseQueryError(
                f"Failed to store embedding: {str(e)}",
                details={
                    "entity_id": entity_id,
                    "project_id": project_id,
                    "metadata": metadata
                }
            ) from e
    
    def semantic_search(
        self,
        query_embedding: List[float],
        project_ids: List[str],
        top_k: int = 20,
        similarity_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Perform semantic similarity search across projects.
        
        Args:
            query_embedding: Query vector embedding (768 dimensions)
            project_ids: List of project IDs to search
            top_k: Maximum number of results to return (default: 20)
            similarity_threshold: Minimum similarity score (default: 0.7)
            
        Returns:
            List of search results, each containing:
                - id: Entity ID
                - metadata: Entity metadata
                - distance: Distance score (lower is more similar)
                - similarity: Similarity score (1 - distance, higher is more similar)
            Results are sorted by similarity score (descending)
            
        Raises:
            DatabaseConnectionError: If connection fails
            DatabaseQueryError: If search fails
            
        Example:
            results = service.semantic_search(
                query_embedding=[0.1, 0.2, ...],
                project_ids=["proj_456"],
                top_k=20,
                similarity_threshold=0.7
            )
            
            for result in results:
                print(f"Entity: {result['metadata']['name']}")
                print(f"Similarity: {result['similarity']:.3f}")
        """
        if not project_ids:
            logger.warning("No project IDs provided for semantic search")
            return []
        
        all_results = []
        
        try:
            # Search each project collection
            for project_id in project_ids:
                collection_name = self._get_collection_name(project_id)
                
                # Check if collection exists
                if not self.chroma_manager.collection_exists(collection_name):
                    logger.debug(f"Collection {collection_name} does not exist, skipping")
                    continue
                
                # Get collection
                collection = self.chroma_manager.get_collection(collection_name)
                
                # Perform query
                results = collection.query(
                    query_embeddings=[query_embedding],
                    n_results=top_k,
                    include=["metadatas", "distances"]
                )
                
                # Process results
                if results and results["ids"] and results["ids"][0]:
                    for i, entity_id in enumerate(results["ids"][0]):
                        distance = results["distances"][0][i]
                        similarity = 1.0 - distance  # Convert distance to similarity
                        
                        # Filter by similarity threshold
                        if similarity >= similarity_threshold:
                            all_results.append({
                                "id": entity_id,
                                "metadata": results["metadatas"][0][i],
                                "distance": distance,
                                "similarity": similarity
                            })
            
            # Sort all results by similarity (descending)
            all_results.sort(key=lambda x: x["similarity"], reverse=True)
            
            # Limit to top_k
            all_results = all_results[:top_k]
            
            logger.info(
                f"Semantic search found {len(all_results)} results "
                f"across {len(project_ids)} projects"
            )
            
            return all_results
            
        except ChromaError as e:
            logger.error(f"Failed to perform semantic search: {str(e)}")
            raise DatabaseQueryError(
                f"Failed to perform semantic search: {str(e)}",
                details={
                    "project_ids": project_ids,
                    "top_k": top_k,
                    "similarity_threshold": similarity_threshold
                }
            ) from e
        except Exception as e:
            logger.error(f"Unexpected error during semantic search: {str(e)}")
            raise DatabaseQueryError(
                f"Failed to perform semantic search: {str(e)}",
                details={
                    "project_ids": project_ids,
                    "top_k": top_k,
                    "similarity_threshold": similarity_threshold
                }
            ) from e
    
    def find_similar_entities(
        self,
        entity_id: str,
        project_id: str,
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """Find entities similar to the given entity.
        
        Args:
            entity_id: Entity ID to find similar entities for
            project_id: Project ID containing the entity
            top_k: Maximum number of similar entities to return (default: 10)
            
        Returns:
            List of similar entities with metadata and similarity scores
            
        Raises:
            DatabaseConnectionError: If connection fails
            DatabaseQueryError: If search fails or entity not found
            
        Example:
            similar = service.find_similar_entities(
                entity_id="func_123",
                project_id="proj_456",
                top_k=10
            )
            
            for entity in similar:
                print(f"Similar: {entity['metadata']['name']}")
                print(f"Similarity: {entity['similarity']:.3f}")
        """
        try:
            collection_name = self._get_collection_name(project_id)
            
            # Check if collection exists
            if not self.chroma_manager.collection_exists(collection_name):
                raise DatabaseQueryError(
                    f"Collection for project {project_id} does not exist",
                    details={"project_id": project_id}
                )
            
            # Get collection
            collection = self.chroma_manager.get_collection(collection_name)
            
            # Get the entity's embedding
            entity_data = collection.get(
                ids=[entity_id],
                include=["embeddings"]
            )
            
            if not entity_data["ids"] or not entity_data["embeddings"]:
                raise DatabaseQueryError(
                    f"Entity {entity_id} not found in project {project_id}",
                    details={"entity_id": entity_id, "project_id": project_id}
                )
            
            entity_embedding = entity_data["embeddings"][0]
            
            # Find similar entities (top_k + 1 to exclude the entity itself)
            results = collection.query(
                query_embeddings=[entity_embedding],
                n_results=top_k + 1,
                include=["metadatas", "distances"]
            )
            
            # Process results, excluding the entity itself
            similar_entities = []
            
            if results and results["ids"] and results["ids"][0]:
                for i, result_id in enumerate(results["ids"][0]):
                    # Skip the entity itself
                    if result_id == entity_id:
                        continue
                    
                    distance = results["distances"][0][i]
                    similarity = 1.0 - distance
                    
                    similar_entities.append({
                        "id": result_id,
                        "metadata": results["metadatas"][0][i],
                        "distance": distance,
                        "similarity": similarity
                    })
                    
                    # Stop if we have enough results
                    if len(similar_entities) >= top_k:
                        break
            
            logger.info(
                f"Found {len(similar_entities)} similar entities for {entity_id}"
            )
            
            return similar_entities
            
        except ChromaError as e:
            logger.error(
                f"Failed to find similar entities for {entity_id}: {str(e)}"
            )
            raise DatabaseQueryError(
                f"Failed to find similar entities: {str(e)}",
                details={
                    "entity_id": entity_id,
                    "project_id": project_id,
                    "top_k": top_k
                }
            ) from e
        except DatabaseQueryError:
            # Re-raise our own errors
            raise
        except Exception as e:
            logger.error(
                f"Unexpected error finding similar entities for {entity_id}: {str(e)}"
            )
            raise DatabaseQueryError(
                f"Failed to find similar entities: {str(e)}",
                details={
                    "entity_id": entity_id,
                    "project_id": project_id,
                    "top_k": top_k
                }
            ) from e
    
    def delete_project_embeddings(self, project_id: str) -> int:
        """Delete all embeddings for a project.
        
        Args:
            project_id: Project ID to delete embeddings for
            
        Returns:
            Number of embeddings deleted
            
        Raises:
            DatabaseConnectionError: If connection fails
            DatabaseQueryError: If deletion fails
            
        Example:
            count = service.delete_project_embeddings("proj_456")
            print(f"Deleted {count} embeddings")
        """
        try:
            collection_name = self._get_collection_name(project_id)
            
            # Check if collection exists
            if not self.chroma_manager.collection_exists(collection_name):
                logger.info(
                    f"Collection {collection_name} does not exist, nothing to delete"
                )
                return 0
            
            # Get count before deletion
            count = self.chroma_manager.get_collection_count(collection_name)
            
            # Delete the entire collection
            self.chroma_manager.delete_collection(collection_name)
            
            logger.info(
                f"Deleted {count} embeddings for project {project_id}"
            )
            
            return count
            
        except ChromaError as e:
            logger.error(
                f"Failed to delete embeddings for project {project_id}: {str(e)}"
            )
            raise DatabaseQueryError(
                f"Failed to delete project embeddings: {str(e)}",
                details={"project_id": project_id}
            ) from e
        except Exception as e:
            logger.error(
                f"Unexpected error deleting embeddings for project {project_id}: {str(e)}"
            )
            raise DatabaseQueryError(
                f"Failed to delete project embeddings: {str(e)}",
                details={"project_id": project_id}
            ) from e
    
    def get_embedding(
        self,
        entity_id: str,
        project_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get embedding and metadata for a specific entity.
        
        Args:
            entity_id: Entity ID
            project_id: Project ID
            
        Returns:
            Dict containing embedding and metadata, or None if not found
            
        Raises:
            DatabaseConnectionError: If connection fails
            DatabaseQueryError: If retrieval fails
            
        Example:
            data = service.get_embedding("func_123", "proj_456")
            if data:
                print(f"Embedding: {data['embedding']}")
                print(f"Metadata: {data['metadata']}")
        """
        try:
            collection_name = self._get_collection_name(project_id)
            
            # Check if collection exists
            if not self.chroma_manager.collection_exists(collection_name):
                logger.debug(f"Collection {collection_name} does not exist")
                return None
            
            # Get collection
            collection = self.chroma_manager.get_collection(collection_name)
            
            # Get entity data
            result = collection.get(
                ids=[entity_id],
                include=["embeddings", "metadatas"]
            )
            
            if not result["ids"]:
                logger.debug(f"Entity {entity_id} not found in project {project_id}")
                return None
            
            return {
                "id": result["ids"][0],
                "embedding": result["embeddings"][0],
                "metadata": result["metadatas"][0]
            }
            
        except ChromaError as e:
            logger.error(
                f"Failed to get embedding for entity {entity_id}: {str(e)}"
            )
            raise DatabaseQueryError(
                f"Failed to get embedding: {str(e)}",
                details={"entity_id": entity_id, "project_id": project_id}
            ) from e
        except Exception as e:
            logger.error(
                f"Unexpected error getting embedding for entity {entity_id}: {str(e)}"
            )
            raise DatabaseQueryError(
                f"Failed to get embedding: {str(e)}",
                details={"entity_id": entity_id, "project_id": project_id}
            ) from e
    
    def batch_store_embeddings(
        self,
        entity_ids: List[str],
        embeddings: List[List[float]],
        metadatas: List[Dict[str, Any]]
    ) -> int:
        """Store multiple embeddings in batch for efficiency.
        
        Args:
            entity_ids: List of entity IDs
            embeddings: List of embeddings (same length as entity_ids)
            metadatas: List of metadata dicts (same length as entity_ids)
            
        Returns:
            Number of embeddings stored
            
        Raises:
            DatabaseConnectionError: If connection fails
            DatabaseQueryError: If storage fails
            ValueError: If input lists have different lengths
            
        Example:
            count = service.batch_store_embeddings(
                entity_ids=["func_1", "func_2", "func_3"],
                embeddings=[[0.1, ...], [0.2, ...], [0.3, ...]],
                metadatas=[
                    {"entity_type": "function", "name": "f1", "project_id": "p1", ...},
                    {"entity_type": "function", "name": "f2", "project_id": "p1", ...},
                    {"entity_type": "function", "name": "f3", "project_id": "p1", ...}
                ]
            )
        """
        if not (len(entity_ids) == len(embeddings) == len(metadatas)):
            raise ValueError(
                "entity_ids, embeddings, and metadatas must have the same length"
            )
        
        if not entity_ids:
            logger.warning("No embeddings to store")
            return 0
        
        # Group by project_id
        project_groups: Dict[str, Dict[str, List]] = {}
        
        for entity_id, embedding, metadata in zip(entity_ids, embeddings, metadatas):
            # Validate metadata
            if "project_id" not in metadata:
                raise ValueError(f"Metadata for {entity_id} missing project_id")
            
            project_id = metadata["project_id"]
            
            if project_id not in project_groups:
                project_groups[project_id] = {
                    "ids": [],
                    "embeddings": [],
                    "metadatas": []
                }
            
            project_groups[project_id]["ids"].append(entity_id)
            project_groups[project_id]["embeddings"].append(embedding)
            project_groups[project_id]["metadatas"].append(metadata)
        
        # Store embeddings for each project
        total_stored = 0
        
        try:
            for project_id, data in project_groups.items():
                collection = self._ensure_collection(project_id)
                
                collection.add(
                    ids=data["ids"],
                    embeddings=data["embeddings"],
                    metadatas=data["metadatas"]
                )
                
                total_stored += len(data["ids"])
                
                logger.info(
                    f"Stored {len(data['ids'])} embeddings for project {project_id}"
                )
            
            logger.info(f"Batch stored {total_stored} embeddings total")
            
            return total_stored
            
        except ChromaError as e:
            logger.error(f"Failed to batch store embeddings: {str(e)}")
            raise DatabaseQueryError(
                f"Failed to batch store embeddings: {str(e)}",
                details={"num_embeddings": len(entity_ids)}
            ) from e
        except Exception as e:
            logger.error(f"Unexpected error batch storing embeddings: {str(e)}")
            raise DatabaseQueryError(
                f"Failed to batch store embeddings: {str(e)}",
                details={"num_embeddings": len(entity_ids)}
            ) from e


# Global service instance
_vector_service: Optional[VectorService] = None


def get_vector_service() -> VectorService:
    """Get or create the global Vector Service instance.
    
    Returns:
        VectorService: Global service instance
    """
    global _vector_service
    
    if _vector_service is None:
        _vector_service = VectorService()
    
    return _vector_service


def close_vector_service() -> None:
    """Close the global Vector Service."""
    global _vector_service
    _vector_service = None
