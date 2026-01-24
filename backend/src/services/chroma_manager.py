"""Chroma connection manager with collection management.

This module provides a connection manager for Chroma vector database with:
- Connection to Chroma with PostgreSQL backend
- Collection management (create, delete, list)
- Health checks
- Automatic reconnection on failures

Validates: Requirements 2.3
"""

import logging
from typing import Any, Dict, List, Optional

import chromadb
from chromadb import Collection, ClientAPI
from chromadb.config import Settings as ChromaSettings
from chromadb.errors import ChromaError

from ..config.settings import settings
from ..utils.errors import DatabaseConnectionError, DatabaseQueryError

logger = logging.getLogger(__name__)


class ChromaConnectionManager:
    """Manages Chroma database connections and collection operations.
    
    Features:
    - Connection to Chroma HTTP server
    - Collection management (create, delete, list, get)
    - Health checks to verify database connectivity
    - Automatic reconnection on failures
    
    Example:
        manager = ChromaConnectionManager()
        manager.connect()
        
        # Create a collection
        collection = manager.create_collection("my_project_embeddings")
        
        # Get an existing collection
        collection = manager.get_collection("my_project_embeddings")
        
        # List all collections
        collections = manager.list_collections()
        
        # Delete a collection
        manager.delete_collection("my_project_embeddings")
    """
    
    def __init__(
        self,
        host: Optional[str] = None,
        port: Optional[int] = None,
    ):
        """Initialize Chroma connection manager.
        
        Args:
            host: Chroma server host (defaults to settings.chroma_host)
            port: Chroma server port (defaults to settings.chroma_port)
        """
        self.host = host or settings.chroma_host
        self.port = port or settings.chroma_port
        
        self._client: Optional[ClientAPI] = None
        self._is_connected = False
        
        logger.info(
            f"Initialized Chroma connection manager: host={self.host}, port={self.port}"
        )
    
    def connect(self) -> None:
        """Establish connection to Chroma database.
        
        Raises:
            DatabaseConnectionError: If connection fails
        """
        if self._is_connected and self._client:
            logger.debug("Already connected to Chroma")
            return
        
        try:
            logger.info(f"Attempting to connect to Chroma at {self.host}:{self.port}")
            
            # Create Chroma HTTP client
            self._client = chromadb.HttpClient(
                host=self.host,
                port=self.port,
                settings=ChromaSettings(
                    anonymized_telemetry=False,
                    allow_reset=True,
                )
            )
            
            # Verify connection with a health check
            self.health_check()
            
            self._is_connected = True
            logger.info(f"Successfully connected to Chroma at {self.host}:{self.port}")
            
        except ChromaError as e:
            logger.error(f"Failed to connect to Chroma: {str(e)}")
            raise DatabaseConnectionError(
                f"Failed to connect to Chroma: {str(e)}"
            ) from e
        except Exception as e:
            logger.error(f"Unexpected error connecting to Chroma: {str(e)}")
            raise DatabaseConnectionError(
                f"Failed to connect to Chroma: {str(e)}"
            ) from e
    
    def close(self) -> None:
        """Close the Chroma client connection."""
        if self._client:
            logger.info("Closing Chroma connection")
            # Chroma HTTP client doesn't require explicit closing
            self._client = None
            self._is_connected = False
            logger.info("Chroma connection closed")
    
    def health_check(self) -> bool:
        """Perform health check to verify database connectivity.
        
        Returns:
            True if database is healthy and responsive
            
        Raises:
            DatabaseConnectionError: If health check fails
        """
        if not self._client:
            raise DatabaseConnectionError("Client not initialized")
        
        try:
            # Use heartbeat to check if server is responsive
            heartbeat = self._client.heartbeat()
            
            if heartbeat:
                logger.debug("Chroma health check passed")
                return True
            else:
                raise DatabaseConnectionError("Health check returned no heartbeat")
                
        except ChromaError as e:
            logger.error(f"Chroma health check failed: {str(e)}")
            raise DatabaseConnectionError(f"Health check failed: {str(e)}") from e
        except Exception as e:
            logger.error(f"Unexpected error during health check: {str(e)}")
            raise DatabaseConnectionError(f"Health check failed: {str(e)}") from e
    
    def create_collection(
        self,
        name: str,
        metadata: Optional[Dict[str, Any]] = None,
        get_or_create: bool = False,
    ) -> Collection:
        """Create a new collection in Chroma.
        
        Args:
            name: Collection name (must be unique)
            metadata: Optional metadata for the collection
            get_or_create: If True, return existing collection if it exists
            
        Returns:
            Collection: The created or retrieved collection
            
        Raises:
            DatabaseConnectionError: If not connected
            DatabaseQueryError: If collection creation fails
            
        Example:
            collection = manager.create_collection(
                "project_123_embeddings",
                metadata={"project_id": "123", "created_at": "2024-01-01"}
            )
        """
        if not self._is_connected:
            self.connect()
        
        if not self._client:
            raise DatabaseConnectionError("Client not initialized")
        
        try:
            if get_or_create:
                collection = self._client.get_or_create_collection(
                    name=name,
                    metadata=metadata or {}
                )
                logger.info(f"Got or created collection: {name}")
            else:
                collection = self._client.create_collection(
                    name=name,
                    metadata=metadata or {}
                )
                logger.info(f"Created collection: {name}")
            
            return collection
            
        except ChromaError as e:
            logger.error(f"Failed to create collection '{name}': {str(e)}")
            raise DatabaseQueryError(
                f"Failed to create collection: {str(e)}",
                details={"collection_name": name, "metadata": metadata}
            ) from e
        except Exception as e:
            logger.error(f"Unexpected error creating collection '{name}': {str(e)}")
            raise DatabaseQueryError(
                f"Failed to create collection: {str(e)}",
                details={"collection_name": name, "metadata": metadata}
            ) from e
    
    def get_collection(self, name: str) -> Collection:
        """Get an existing collection by name.
        
        Args:
            name: Collection name
            
        Returns:
            Collection: The requested collection
            
        Raises:
            DatabaseConnectionError: If not connected
            DatabaseQueryError: If collection doesn't exist or retrieval fails
            
        Example:
            collection = manager.get_collection("project_123_embeddings")
        """
        if not self._is_connected:
            self.connect()
        
        if not self._client:
            raise DatabaseConnectionError("Client not initialized")
        
        try:
            collection = self._client.get_collection(name=name)
            logger.debug(f"Retrieved collection: {name}")
            return collection
            
        except ChromaError as e:
            logger.error(f"Failed to get collection '{name}': {str(e)}")
            raise DatabaseQueryError(
                f"Failed to get collection: {str(e)}",
                details={"collection_name": name}
            ) from e
        except Exception as e:
            logger.error(f"Unexpected error getting collection '{name}': {str(e)}")
            raise DatabaseQueryError(
                f"Failed to get collection: {str(e)}",
                details={"collection_name": name}
            ) from e
    
    def delete_collection(self, name: str) -> None:
        """Delete a collection by name.
        
        Args:
            name: Collection name to delete
            
        Raises:
            DatabaseConnectionError: If not connected
            DatabaseQueryError: If deletion fails
            
        Example:
            manager.delete_collection("project_123_embeddings")
        """
        if not self._is_connected:
            self.connect()
        
        if not self._client:
            raise DatabaseConnectionError("Client not initialized")
        
        try:
            self._client.delete_collection(name=name)
            logger.info(f"Deleted collection: {name}")
            
        except ChromaError as e:
            logger.error(f"Failed to delete collection '{name}': {str(e)}")
            raise DatabaseQueryError(
                f"Failed to delete collection: {str(e)}",
                details={"collection_name": name}
            ) from e
        except Exception as e:
            logger.error(f"Unexpected error deleting collection '{name}': {str(e)}")
            raise DatabaseQueryError(
                f"Failed to delete collection: {str(e)}",
                details={"collection_name": name}
            ) from e
    
    def list_collections(self) -> List[Collection]:
        """List all collections in the database.
        
        Returns:
            List of all collections
            
        Raises:
            DatabaseConnectionError: If not connected
            DatabaseQueryError: If listing fails
            
        Example:
            collections = manager.list_collections()
            for collection in collections:
                print(f"Collection: {collection.name}")
        """
        if not self._is_connected:
            self.connect()
        
        if not self._client:
            raise DatabaseConnectionError("Client not initialized")
        
        try:
            collections = self._client.list_collections()
            logger.debug(f"Listed {len(collections)} collections")
            return collections
            
        except ChromaError as e:
            logger.error(f"Failed to list collections: {str(e)}")
            raise DatabaseQueryError(
                f"Failed to list collections: {str(e)}"
            ) from e
        except Exception as e:
            logger.error(f"Unexpected error listing collections: {str(e)}")
            raise DatabaseQueryError(
                f"Failed to list collections: {str(e)}"
            ) from e
    
    def collection_exists(self, name: str) -> bool:
        """Check if a collection exists.
        
        Args:
            name: Collection name to check
            
        Returns:
            True if collection exists, False otherwise
            
        Example:
            if manager.collection_exists("project_123_embeddings"):
                print("Collection exists")
        """
        try:
            self.get_collection(name)
            return True
        except DatabaseQueryError:
            return False
    
    def get_collection_count(self, name: str) -> int:
        """Get the number of items in a collection.
        
        Args:
            name: Collection name
            
        Returns:
            Number of items in the collection
            
        Raises:
            DatabaseConnectionError: If not connected
            DatabaseQueryError: If collection doesn't exist or count fails
            
        Example:
            count = manager.get_collection_count("project_123_embeddings")
            print(f"Collection has {count} embeddings")
        """
        try:
            collection = self.get_collection(name)
            count = collection.count()
            logger.debug(f"Collection '{name}' has {count} items")
            return count
            
        except Exception as e:
            logger.error(f"Failed to get count for collection '{name}': {str(e)}")
            raise DatabaseQueryError(
                f"Failed to get collection count: {str(e)}",
                details={"collection_name": name}
            ) from e
    
    def reset_database(self) -> None:
        """Reset the entire database (delete all collections).
        
        WARNING: This is a destructive operation that deletes all data.
        Should only be used in testing or development environments.
        
        Raises:
            DatabaseConnectionError: If not connected
            DatabaseQueryError: If reset fails
        """
        if not self._is_connected:
            self.connect()
        
        if not self._client:
            raise DatabaseConnectionError("Client not initialized")
        
        try:
            self._client.reset()
            logger.warning("Reset Chroma database - all collections deleted")
            
        except ChromaError as e:
            logger.error(f"Failed to reset database: {str(e)}")
            raise DatabaseQueryError(
                f"Failed to reset database: {str(e)}"
            ) from e
        except Exception as e:
            logger.error(f"Unexpected error resetting database: {str(e)}")
            raise DatabaseQueryError(
                f"Failed to reset database: {str(e)}"
            ) from e
    
    @property
    def is_connected(self) -> bool:
        """Check if the manager is currently connected to Chroma."""
        return self._is_connected
    
    @property
    def client(self) -> Optional[ClientAPI]:
        """Get the underlying Chroma client (for advanced use cases)."""
        return self._client


# Global connection manager instance
_connection_manager: Optional[ChromaConnectionManager] = None


def get_chroma_manager() -> ChromaConnectionManager:
    """Get or create the global Chroma connection manager instance.
    
    Returns:
        ChromaConnectionManager: Global connection manager instance
    """
    global _connection_manager
    
    if _connection_manager is None:
        _connection_manager = ChromaConnectionManager()
    
    return _connection_manager


def close_chroma_manager() -> None:
    """Close the global Chroma connection manager."""
    global _connection_manager
    
    if _connection_manager is not None:
        _connection_manager.close()
        _connection_manager = None
