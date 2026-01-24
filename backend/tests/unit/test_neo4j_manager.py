"""Unit tests for Neo4j connection manager.

Tests connection pooling, health checks, and retry logic with exponential backoff.
"""

import asyncio
import pytest
from unittest.mock import AsyncMock, MagicMock, patch, call
from neo4j.exceptions import ServiceUnavailable, SessionExpired, TransientError

from src.services.neo4j_manager import (
    Neo4jConnectionManager,
    get_neo4j_manager,
    close_neo4j_manager,
)
from src.utils.errors import DatabaseConnectionError, DatabaseQueryError


@pytest.fixture
def mock_driver():
    """Create a mock Neo4j driver."""
    driver = AsyncMock()
    driver.close = AsyncMock()
    return driver


@pytest.fixture
def mock_session():
    """Create a mock Neo4j session."""
    session = AsyncMock()
    session.close = AsyncMock()
    session.run = AsyncMock()
    session.__aenter__ = AsyncMock(return_value=session)
    session.__aexit__ = AsyncMock(return_value=None)
    return session


@pytest.fixture
def connection_manager():
    """Create a Neo4j connection manager for testing."""
    return Neo4jConnectionManager(
        uri="bolt://localhost:7687",
        user="neo4j",
        password="password",
        database="neo4j",
        max_retries=3,
        initial_retry_delay=0.1,  # Faster for tests
    )


class TestNeo4jConnectionManager:
    """Test suite for Neo4j connection manager."""
    
    @pytest.mark.asyncio
    async def test_initialization(self, connection_manager):
        """Test connection manager initialization."""
        assert connection_manager.uri == "bolt://localhost:7687"
        assert connection_manager.user == "neo4j"
        assert connection_manager.password == "password"
        assert connection_manager.database == "neo4j"
        assert connection_manager.max_retries == 3
        assert connection_manager.initial_retry_delay == 0.1
        assert not connection_manager.is_connected
        assert connection_manager.driver is None
    
    @pytest.mark.asyncio
    async def test_connect_success(self, connection_manager, mock_driver, mock_session):
        """Test successful connection to Neo4j."""
        # Mock health check
        mock_result = AsyncMock()
        mock_result.single = AsyncMock(return_value={"health": 1})
        mock_session.run = AsyncMock(return_value=mock_result)
        
        # Make driver.session() return the mock session as a context manager
        mock_driver.session = MagicMock(return_value=mock_session)
        
        with patch("src.services.neo4j_manager.AsyncGraphDatabase.driver", return_value=mock_driver):
            await connection_manager.connect()
        
        assert connection_manager.is_connected
        assert connection_manager.driver is not None
    
    @pytest.mark.asyncio
    async def test_connect_already_connected(self, connection_manager, mock_driver):
        """Test connecting when already connected."""
        connection_manager._driver = mock_driver
        connection_manager._is_connected = True
        
        await connection_manager.connect()
        
        # Should not create a new driver
        assert connection_manager.driver == mock_driver
    
    @pytest.mark.asyncio
    async def test_connect_retry_on_service_unavailable(self, connection_manager, mock_driver, mock_session):
        """Test retry logic when service is unavailable."""
        # Mock health check to succeed on third attempt
        mock_result = AsyncMock()
        mock_result.single = AsyncMock(return_value={"health": 1})
        mock_session.run = AsyncMock(return_value=mock_result)
        
        # Make driver.session() return the mock session as a context manager
        mock_driver.session = MagicMock(return_value=mock_session)
        
        call_count = 0
        
        def driver_side_effect(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count < 3:
                raise ServiceUnavailable("Service unavailable")
            return mock_driver
        
        with patch("src.services.neo4j_manager.AsyncGraphDatabase.driver", side_effect=driver_side_effect):
            await connection_manager.connect()
        
        assert connection_manager.is_connected
        assert call_count == 3  # Should retry twice before succeeding
    
    @pytest.mark.asyncio
    async def test_connect_exponential_backoff(self, connection_manager, mock_driver, mock_session):
        """Test exponential backoff in retry logic."""
        # Mock health check
        mock_result = AsyncMock()
        mock_result.single = AsyncMock(return_value={"health": 1})
        mock_session.run = AsyncMock(return_value=mock_result)
        
        # Make driver.session() return the mock session as a context manager
        mock_driver.session = MagicMock(return_value=mock_session)
        
        call_count = 0
        delays = []
        
        def driver_side_effect(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count < 3:
                raise ServiceUnavailable("Service unavailable")
            return mock_driver
        
        original_sleep = asyncio.sleep
        
        async def mock_sleep(delay):
            delays.append(delay)
            await original_sleep(0.01)  # Sleep briefly for test
        
        with patch("src.services.neo4j_manager.AsyncGraphDatabase.driver", side_effect=driver_side_effect):
            with patch("asyncio.sleep", side_effect=mock_sleep):
                await connection_manager.connect()
        
        # Verify exponential backoff: 0.1s, 0.2s
        assert len(delays) == 2
        assert delays[0] == pytest.approx(0.1, rel=0.01)
        assert delays[1] == pytest.approx(0.2, rel=0.01)
    
    @pytest.mark.asyncio
    async def test_connect_max_retries_exhausted(self, connection_manager):
        """Test connection failure after max retries."""
        with patch("src.services.neo4j_manager.AsyncGraphDatabase.driver", side_effect=ServiceUnavailable("Service unavailable")):
            with pytest.raises(DatabaseConnectionError) as exc_info:
                await connection_manager.connect()
            
            assert "Failed to connect to Neo4j after 3 attempts" in str(exc_info.value)
            assert not connection_manager.is_connected
    
    @pytest.mark.asyncio
    async def test_connect_non_retryable_error(self, connection_manager):
        """Test connection failure with non-retryable error."""
        with patch("src.services.neo4j_manager.AsyncGraphDatabase.driver", side_effect=ValueError("Invalid URI")):
            with pytest.raises(DatabaseConnectionError) as exc_info:
                await connection_manager.connect()
            
            assert "Failed to connect to Neo4j" in str(exc_info.value)
            assert not connection_manager.is_connected
    
    @pytest.mark.asyncio
    async def test_close(self, connection_manager, mock_driver):
        """Test closing the connection."""
        connection_manager._driver = mock_driver
        connection_manager._is_connected = True
        
        await connection_manager.close()
        
        mock_driver.close.assert_called_once()
        assert not connection_manager.is_connected
        assert connection_manager.driver is None
    
    @pytest.mark.asyncio
    async def test_close_when_not_connected(self, connection_manager):
        """Test closing when not connected."""
        await connection_manager.close()
        
        # Should not raise an error
        assert not connection_manager.is_connected
    
    @pytest.mark.asyncio
    async def test_health_check_success(self, connection_manager, mock_driver, mock_session):
        """Test successful health check."""
        mock_result = AsyncMock()
        mock_result.single = AsyncMock(return_value={"health": 1})
        mock_session.run = AsyncMock(return_value=mock_result)
        
        # Make driver.session() return the mock session as a context manager
        mock_driver.session = MagicMock(return_value=mock_session)
        
        connection_manager._driver = mock_driver
        
        result = await connection_manager.health_check()
        
        assert result is True
        mock_session.run.assert_called_once_with("RETURN 1 AS health")
    
    @pytest.mark.asyncio
    async def test_health_check_no_driver(self, connection_manager):
        """Test health check when driver is not initialized."""
        with pytest.raises(DatabaseConnectionError) as exc_info:
            await connection_manager.health_check()
        
        assert "Driver not initialized" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_health_check_failure(self, connection_manager, mock_driver, mock_session):
        """Test health check failure."""
        # Make the session.run raise an exception when called
        mock_session.run = AsyncMock(side_effect=ServiceUnavailable("Service unavailable"))
        
        # Make driver.session() return the mock session as a context manager
        mock_driver.session = MagicMock(return_value=mock_session)
        
        connection_manager._driver = mock_driver
        
        with pytest.raises(DatabaseConnectionError) as exc_info:
            await connection_manager.health_check()
        
        # The error message should contain information about the health check failure
        error_msg = str(exc_info.value)
        assert "Health check failed" in error_msg or "Service unavailable" in error_msg
    
    @pytest.mark.asyncio
    async def test_session_context_manager(self, connection_manager, mock_driver, mock_session):
        """Test session context manager."""
        # Mock health check
        mock_result = AsyncMock()
        mock_result.single = AsyncMock(return_value={"health": 1})
        mock_session.run = AsyncMock(return_value=mock_result)
        
        # Make driver.session() return the mock session as a context manager
        mock_driver.session = MagicMock(return_value=mock_session)
        
        with patch("src.services.neo4j_manager.AsyncGraphDatabase.driver", return_value=mock_driver):
            await connection_manager.connect()
        
        async with connection_manager.session() as session:
            assert session is not None
        
        mock_session.close.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_session_auto_connect(self, connection_manager, mock_driver, mock_session):
        """Test session auto-connects if not connected."""
        # Mock health check
        mock_result = AsyncMock()
        mock_result.single = AsyncMock(return_value={"health": 1})
        mock_session.run = AsyncMock(return_value=mock_result)
        
        # Make driver.session() return the mock session as a context manager
        mock_driver.session = MagicMock(return_value=mock_session)
        
        with patch("src.services.neo4j_manager.AsyncGraphDatabase.driver", return_value=mock_driver):
            async with connection_manager.session() as session:
                assert session is not None
        
        assert connection_manager.is_connected
    
    @pytest.mark.asyncio
    async def test_execute_with_retry_success(self, connection_manager, mock_driver, mock_session):
        """Test successful query execution with retry logic."""
        # Mock health check
        mock_health_result = AsyncMock()
        mock_health_result.single = AsyncMock(return_value={"health": 1})
        
        # Mock query result
        mock_query_result = AsyncMock()
        mock_query_result.data = AsyncMock(return_value=[{"n": 1}, {"n": 2}])
        
        async def run_side_effect(query, params=None):
            if "RETURN 1 AS health" in query:
                return mock_health_result
            return mock_query_result
        
        mock_session.run = AsyncMock(side_effect=run_side_effect)
        
        # Make driver.session() return the mock session as a context manager
        mock_driver.session = MagicMock(return_value=mock_session)
        
        with patch("src.services.neo4j_manager.AsyncGraphDatabase.driver", return_value=mock_driver):
            result = await connection_manager.execute_with_retry(
                "MATCH (n) RETURN n",
                {"limit": 10}
            )
        
        assert len(result) == 2
        assert result[0]["n"] == 1
        assert result[1]["n"] == 2
    
    @pytest.mark.asyncio
    async def test_execute_with_retry_transient_error(self, connection_manager, mock_driver, mock_session):
        """Test query retry on transient error."""
        # Mock health check
        mock_health_result = AsyncMock()
        mock_health_result.single = AsyncMock(return_value={"health": 1})
        
        # Mock query result
        mock_query_result = AsyncMock()
        mock_query_result.data = AsyncMock(return_value=[{"n": 1}])
        
        call_count = 0
        
        async def run_side_effect(query, params=None):
            nonlocal call_count
            if "RETURN 1 AS health" in query:
                return mock_health_result
            
            call_count += 1
            if call_count < 2:
                raise TransientError("Transient error")
            return mock_query_result
        
        mock_session.run = AsyncMock(side_effect=run_side_effect)
        
        # Make driver.session() return the mock session as a context manager
        mock_driver.session = MagicMock(return_value=mock_session)
        
        with patch("src.services.neo4j_manager.AsyncGraphDatabase.driver", return_value=mock_driver):
            result = await connection_manager.execute_with_retry("MATCH (n) RETURN n")
        
        assert len(result) == 1
        assert call_count == 2  # Should retry once
    
    @pytest.mark.asyncio
    async def test_execute_with_retry_max_retries_exhausted(self, connection_manager, mock_driver, mock_session):
        """Test query failure after max retries."""
        # Mock health check
        mock_health_result = AsyncMock()
        mock_health_result.single = AsyncMock(return_value={"health": 1})
        
        async def run_side_effect(query, params=None):
            if "RETURN 1 AS health" in query:
                return mock_health_result
            raise TransientError("Transient error")
        
        mock_session.run = AsyncMock(side_effect=run_side_effect)
        
        # Make driver.session() return the mock session as a context manager
        mock_driver.session = MagicMock(return_value=mock_session)
        
        with patch("src.services.neo4j_manager.AsyncGraphDatabase.driver", return_value=mock_driver):
            with pytest.raises(DatabaseQueryError) as exc_info:
                await connection_manager.execute_with_retry("MATCH (n) RETURN n")
            
            assert "Query failed after 3 attempts" in str(exc_info.value) or "Transient error" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_execute_write_with_retry_success(self, connection_manager, mock_driver, mock_session):
        """Test successful write query execution."""
        # Mock health check
        mock_health_result = AsyncMock()
        mock_health_result.single = AsyncMock(return_value={"health": 1})
        mock_session.run = AsyncMock(return_value=mock_health_result)
        
        # Mock write transaction
        async def execute_write_mock(func):
            return [{"created": 1}]
        
        mock_session.execute_write = AsyncMock(side_effect=execute_write_mock)
        
        # Make driver.session() return the mock session as a context manager
        mock_driver.session = MagicMock(return_value=mock_session)
        
        with patch("src.services.neo4j_manager.AsyncGraphDatabase.driver", return_value=mock_driver):
            result = await connection_manager.execute_write_with_retry(
                "CREATE (n:Node {name: $name}) RETURN n",
                {"name": "test"}
            )
        
        assert len(result) == 1
        assert result[0]["created"] == 1
    
    @pytest.mark.asyncio
    async def test_get_neo4j_manager_singleton(self):
        """Test global connection manager singleton."""
        manager1 = get_neo4j_manager()
        manager2 = get_neo4j_manager()
        
        assert manager1 is manager2
        
        # Clean up
        await close_neo4j_manager()
    
    @pytest.mark.asyncio
    async def test_close_neo4j_manager_global(self, mock_driver):
        """Test closing global connection manager."""
        manager = get_neo4j_manager()
        manager._driver = mock_driver
        manager._is_connected = True
        
        await close_neo4j_manager()
        
        mock_driver.close.assert_called_once()
        
        # Getting manager again should create a new instance
        new_manager = get_neo4j_manager()
        assert new_manager is not manager


class TestEdgeCases:
    """Test edge cases and error conditions."""
    
    @pytest.mark.asyncio
    async def test_empty_query_parameters(self, connection_manager, mock_driver, mock_session):
        """Test query execution with no parameters."""
        # Mock health check
        mock_health_result = AsyncMock()
        mock_health_result.single = AsyncMock(return_value={"health": 1})
        
        # Mock query result
        mock_query_result = AsyncMock()
        mock_query_result.data = AsyncMock(return_value=[])
        
        async def run_side_effect(query, params=None):
            if "RETURN 1 AS health" in query:
                return mock_health_result
            return mock_query_result
        
        mock_session.run = AsyncMock(side_effect=run_side_effect)
        
        # Make driver.session() return the mock session as a context manager
        mock_driver.session = MagicMock(return_value=mock_session)
        
        with patch("src.services.neo4j_manager.AsyncGraphDatabase.driver", return_value=mock_driver):
            result = await connection_manager.execute_with_retry("MATCH (n) RETURN n")
        
        assert result == []
    
    @pytest.mark.asyncio
    async def test_session_expired_reconnect(self, connection_manager, mock_driver, mock_session):
        """Test automatic reconnection on session expiry."""
        # Mock health check
        mock_health_result = AsyncMock()
        mock_health_result.single = AsyncMock(return_value={"health": 1})
        
        # Mock query result
        mock_query_result = AsyncMock()
        mock_query_result.data = AsyncMock(return_value=[{"n": 1}])
        
        call_count = 0
        
        async def run_side_effect(query, params=None):
            nonlocal call_count
            if "RETURN 1 AS health" in query:
                return mock_health_result
            
            call_count += 1
            if call_count == 1:
                raise SessionExpired("Session expired")
            return mock_query_result
        
        mock_session.run = AsyncMock(side_effect=run_side_effect)
        
        # Make driver.session() return the mock session as a context manager
        mock_driver.session = MagicMock(return_value=mock_session)
        
        with patch("src.services.neo4j_manager.AsyncGraphDatabase.driver", return_value=mock_driver):
            result = await connection_manager.execute_with_retry("MATCH (n) RETURN n")
        
        assert len(result) == 1
        # Should have attempted reconnection
        assert call_count == 2
