"""Unit tests for Chroma connection manager.

Tests connection management, collection operations, and error handling.
"""

import pytest
from unittest.mock import Mock, MagicMock, patch
from chromadb.errors import ChromaError

from src.services.chroma_manager import ChromaConnectionManager, get_chroma_manager, close_chroma_manager
from src.utils.errors import DatabaseConnectionError, DatabaseQueryError


class TestChromaConnectionManager:
    """Test suite for ChromaConnectionManager."""
    
    @pytest.fixture
    def manager(self):
        """Create a ChromaConnectionManager instance for testing."""
        return ChromaConnectionManager(host="localhost", port=8001)
    
    @pytest.fixture
    def mock_client(self):
        """Create a mock Chroma client."""
        client = MagicMock()
        client.heartbeat.return_value = 123456789
        return client
    
    def test_init(self, manager):
        """Test manager initialization."""
        assert manager.host == "localhost"
        assert manager.port == 8001
        assert not manager.is_connected
        assert manager.client is None
    
    def test_init_with_defaults(self):
        """Test manager initialization with default settings."""
        with patch("src.services.chroma_manager.settings") as mock_settings:
            mock_settings.chroma_host = "test-host"
            mock_settings.chroma_port = 9999
            
            manager = ChromaConnectionManager()
            assert manager.host == "test-host"
            assert manager.port == 9999
    
    @patch("src.services.chroma_manager.chromadb.HttpClient")
    def test_connect_success(self, mock_http_client, manager, mock_client):
        """Test successful connection to Chroma."""
        mock_http_client.return_value = mock_client
        
        manager.connect()
        
        assert manager.is_connected
        assert manager.client is not None
        mock_http_client.assert_called_once()
        mock_client.heartbeat.assert_called_once()
    
    @patch("src.services.chroma_manager.chromadb.HttpClient")
    def test_connect_already_connected(self, mock_http_client, manager, mock_client):
        """Test connecting when already connected."""
        mock_http_client.return_value = mock_client
        
        manager.connect()
        manager.connect()  # Second call should be no-op
        
        # Should only call HttpClient once
        assert mock_http_client.call_count == 1
    
    @patch("src.services.chroma_manager.chromadb.HttpClient")
    def test_connect_failure(self, mock_http_client, manager):
        """Test connection failure."""
        mock_http_client.side_effect = ChromaError("Connection failed")
        
        with pytest.raises(DatabaseConnectionError) as exc_info:
            manager.connect()
        
        assert "Failed to connect to Chroma" in str(exc_info.value)
        assert not manager.is_connected
    
    @patch("src.services.chroma_manager.chromadb.HttpClient")
    def test_connect_unexpected_error(self, mock_http_client, manager):
        """Test connection with unexpected error."""
        mock_http_client.side_effect = Exception("Unexpected error")
        
        with pytest.raises(DatabaseConnectionError) as exc_info:
            manager.connect()
        
        assert "Failed to connect to Chroma" in str(exc_info.value)
        assert not manager.is_connected
    
    def test_close(self, manager, mock_client):
        """Test closing connection."""
        manager._client = mock_client
        manager._is_connected = True
        
        manager.close()
        
        assert not manager.is_connected
        assert manager.client is None
    
    def test_health_check_success(self, manager, mock_client):
        """Test successful health check."""
        manager._client = mock_client
        
        result = manager.health_check()
        
        assert result is True
        mock_client.heartbeat.assert_called_once()
    
    def test_health_check_no_client(self, manager):
        """Test health check without client."""
        with pytest.raises(DatabaseConnectionError) as exc_info:
            manager.health_check()
        
        assert "Client not initialized" in str(exc_info.value)
    
    def test_health_check_failure(self, manager, mock_client):
        """Test health check failure."""
        manager._client = mock_client
        mock_client.heartbeat.side_effect = ChromaError("Health check failed")
        
        with pytest.raises(DatabaseConnectionError) as exc_info:
            manager.health_check()
        
        assert "Health check failed" in str(exc_info.value)
    
    def test_health_check_no_heartbeat(self, manager, mock_client):
        """Test health check with no heartbeat."""
        manager._client = mock_client
        mock_client.heartbeat.return_value = None
        
        with pytest.raises(DatabaseConnectionError) as exc_info:
            manager.health_check()
        
        assert "no heartbeat" in str(exc_info.value)
    
    def test_create_collection_success(self, manager, mock_client):
        """Test successful collection creation."""
        manager._client = mock_client
        manager._is_connected = True
        
        mock_collection = MagicMock()
        mock_client.create_collection.return_value = mock_collection
        
        result = manager.create_collection("test_collection", metadata={"key": "value"})
        
        assert result == mock_collection
        mock_client.create_collection.assert_called_once_with(
            name="test_collection",
            metadata={"key": "value"}
        )
    
    def test_create_collection_get_or_create(self, manager, mock_client):
        """Test collection creation with get_or_create."""
        manager._client = mock_client
        manager._is_connected = True
        
        mock_collection = MagicMock()
        mock_client.get_or_create_collection.return_value = mock_collection
        
        result = manager.create_collection("test_collection", get_or_create=True)
        
        assert result == mock_collection
        mock_client.get_or_create_collection.assert_called_once()
    
    @patch.object(ChromaConnectionManager, "connect")
    def test_create_collection_auto_connect(self, mock_connect, manager, mock_client):
        """Test automatic connection when creating collection."""
        manager._client = mock_client
        
        mock_collection = MagicMock()
        mock_client.create_collection.return_value = mock_collection
        
        manager.create_collection("test_collection")
        
        mock_connect.assert_called_once()
    
    def test_create_collection_failure(self, manager, mock_client):
        """Test collection creation failure."""
        manager._client = mock_client
        manager._is_connected = True
        
        mock_client.create_collection.side_effect = ChromaError("Creation failed")
        
        with pytest.raises(DatabaseQueryError) as exc_info:
            manager.create_collection("test_collection")
        
        assert "Failed to create collection" in str(exc_info.value)
    
    def test_get_collection_success(self, manager, mock_client):
        """Test successful collection retrieval."""
        manager._client = mock_client
        manager._is_connected = True
        
        mock_collection = MagicMock()
        mock_client.get_collection.return_value = mock_collection
        
        result = manager.get_collection("test_collection")
        
        assert result == mock_collection
        mock_client.get_collection.assert_called_once_with(name="test_collection")
    
    def test_get_collection_not_found(self, manager, mock_client):
        """Test getting non-existent collection."""
        manager._client = mock_client
        manager._is_connected = True
        
        mock_client.get_collection.side_effect = ChromaError("Collection not found")
        
        with pytest.raises(DatabaseQueryError) as exc_info:
            manager.get_collection("nonexistent")
        
        assert "Failed to get collection" in str(exc_info.value)
    
    def test_delete_collection_success(self, manager, mock_client):
        """Test successful collection deletion."""
        manager._client = mock_client
        manager._is_connected = True
        
        manager.delete_collection("test_collection")
        
        mock_client.delete_collection.assert_called_once_with(name="test_collection")
    
    def test_delete_collection_failure(self, manager, mock_client):
        """Test collection deletion failure."""
        manager._client = mock_client
        manager._is_connected = True
        
        mock_client.delete_collection.side_effect = ChromaError("Deletion failed")
        
        with pytest.raises(DatabaseQueryError) as exc_info:
            manager.delete_collection("test_collection")
        
        assert "Failed to delete collection" in str(exc_info.value)
    
    def test_list_collections_success(self, manager, mock_client):
        """Test successful collection listing."""
        manager._client = mock_client
        manager._is_connected = True
        
        mock_collections = [MagicMock(), MagicMock()]
        mock_client.list_collections.return_value = mock_collections
        
        result = manager.list_collections()
        
        assert result == mock_collections
        assert len(result) == 2
        mock_client.list_collections.assert_called_once()
    
    def test_list_collections_empty(self, manager, mock_client):
        """Test listing collections when none exist."""
        manager._client = mock_client
        manager._is_connected = True
        
        mock_client.list_collections.return_value = []
        
        result = manager.list_collections()
        
        assert result == []
    
    def test_list_collections_failure(self, manager, mock_client):
        """Test collection listing failure."""
        manager._client = mock_client
        manager._is_connected = True
        
        mock_client.list_collections.side_effect = ChromaError("Listing failed")
        
        with pytest.raises(DatabaseQueryError) as exc_info:
            manager.list_collections()
        
        assert "Failed to list collections" in str(exc_info.value)
    
    def test_collection_exists_true(self, manager, mock_client):
        """Test checking if collection exists (true case)."""
        manager._client = mock_client
        manager._is_connected = True
        
        mock_collection = MagicMock()
        mock_client.get_collection.return_value = mock_collection
        
        result = manager.collection_exists("test_collection")
        
        assert result is True
    
    def test_collection_exists_false(self, manager, mock_client):
        """Test checking if collection exists (false case)."""
        manager._client = mock_client
        manager._is_connected = True
        
        mock_client.get_collection.side_effect = ChromaError("Not found")
        
        result = manager.collection_exists("nonexistent")
        
        assert result is False
    
    def test_get_collection_count_success(self, manager, mock_client):
        """Test getting collection count."""
        manager._client = mock_client
        manager._is_connected = True
        
        mock_collection = MagicMock()
        mock_collection.count.return_value = 42
        mock_client.get_collection.return_value = mock_collection
        
        result = manager.get_collection_count("test_collection")
        
        assert result == 42
        mock_collection.count.assert_called_once()
    
    def test_get_collection_count_failure(self, manager, mock_client):
        """Test getting collection count failure."""
        manager._client = mock_client
        manager._is_connected = True
        
        mock_client.get_collection.side_effect = ChromaError("Collection not found")
        
        with pytest.raises(DatabaseQueryError) as exc_info:
            manager.get_collection_count("nonexistent")
        
        assert "Failed to get collection count" in str(exc_info.value)
    
    def test_reset_database_success(self, manager, mock_client):
        """Test database reset."""
        manager._client = mock_client
        manager._is_connected = True
        
        manager.reset_database()
        
        mock_client.reset.assert_called_once()
    
    def test_reset_database_failure(self, manager, mock_client):
        """Test database reset failure."""
        manager._client = mock_client
        manager._is_connected = True
        
        mock_client.reset.side_effect = ChromaError("Reset failed")
        
        with pytest.raises(DatabaseQueryError) as exc_info:
            manager.reset_database()
        
        assert "Failed to reset database" in str(exc_info.value)


class TestGlobalManager:
    """Test suite for global manager functions."""
    
    def teardown_method(self):
        """Clean up global manager after each test."""
        close_chroma_manager()
    
    def test_get_chroma_manager_singleton(self):
        """Test that get_chroma_manager returns singleton instance."""
        manager1 = get_chroma_manager()
        manager2 = get_chroma_manager()
        
        assert manager1 is manager2
    
    def test_close_chroma_manager(self):
        """Test closing global manager."""
        manager = get_chroma_manager()
        assert manager is not None
        
        close_chroma_manager()
        
        # Getting manager again should create new instance
        new_manager = get_chroma_manager()
        assert new_manager is not manager
    
    def test_close_chroma_manager_when_none(self):
        """Test closing manager when none exists."""
        close_chroma_manager()
        close_chroma_manager()  # Should not raise error


class TestEdgeCases:
    """Test edge cases and error conditions."""
    
    @pytest.fixture
    def manager(self):
        """Create a ChromaConnectionManager instance for testing."""
        return ChromaConnectionManager(host="localhost", port=8001)
    
    def test_operations_without_client(self, manager):
        """Test that operations fail gracefully without client."""
        with pytest.raises(DatabaseConnectionError):
            manager.health_check()
    
    def test_create_collection_with_empty_name(self, manager):
        """Test creating collection with empty name."""
        manager._client = MagicMock()
        manager._is_connected = True
        
        manager._client.create_collection.side_effect = ChromaError("Invalid name")
        
        with pytest.raises(DatabaseQueryError):
            manager.create_collection("")
    
    def test_create_collection_with_none_metadata(self, manager):
        """Test creating collection with None metadata."""
        manager._client = MagicMock()
        manager._is_connected = True
        
        mock_collection = MagicMock()
        manager._client.create_collection.return_value = mock_collection
        
        result = manager.create_collection("test", metadata=None)
        
        # Should pass empty dict instead of None
        manager._client.create_collection.assert_called_once_with(
            name="test",
            metadata={}
        )
