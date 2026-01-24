"""Unit tests for transaction management with rollback.

Tests the transaction management functionality including:
- Transaction context manager
- Atomic write operations
- Rollback on failure
- Atomic project creation with entities and relationships

Validates: Requirements 12.5
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch, call
from datetime import datetime

from src.services.neo4j_manager import Neo4jConnectionManager
from src.services.graph_service import GraphService
from src.models import (
    Project,
    CodeEntity,
    CodeRelationship,
    EntityType,
    RelationshipType,
    Language,
)
from src.utils.errors import DatabaseConnectionError, DatabaseQueryError


@pytest.fixture
def mock_driver():
    """Create a mock Neo4j driver."""
    driver = MagicMock()
    driver.close = AsyncMock()
    return driver


@pytest.fixture
def mock_session():
    """Create a mock Neo4j session."""
    session = MagicMock()
    session.close = AsyncMock()
    session.run = AsyncMock()
    session.begin_transaction = AsyncMock()
    session.execute_write = AsyncMock()
    return session


@pytest.fixture
def mock_transaction():
    """Create a mock Neo4j transaction."""
    tx = MagicMock()
    tx.run = AsyncMock()
    tx.commit = AsyncMock()
    tx.rollback = AsyncMock()
    return tx


@pytest.fixture
def neo4j_manager(mock_driver, mock_session):
    """Create a Neo4j manager with mocked driver."""
    manager = Neo4jConnectionManager()
    manager._driver = mock_driver
    manager._is_connected = True
    
    # Mock session creation
    mock_driver.session.return_value = mock_session
    
    return manager


class TestTransactionContextManager:
    """Test the transaction context manager."""
    
    @pytest.mark.asyncio
    async def test_transaction_commit_on_success(self, neo4j_manager, mock_session, mock_transaction):
        """Test that transaction commits on successful execution."""
        mock_session.begin_transaction.return_value = mock_transaction
        mock_result = MagicMock()
        mock_result.data = AsyncMock(return_value=[{"id": "123"}])
        mock_transaction.run.return_value = mock_result
        
        # Use transaction context manager
        async with neo4j_manager.transaction() as tx:
            result = await tx.run("CREATE (n:Node {id: $id})", {"id": "123"})
            await result.data()
        
        # Verify transaction was committed
        mock_transaction.commit.assert_called_once()
        mock_transaction.rollback.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_transaction_rollback_on_error(self, neo4j_manager, mock_session, mock_transaction):
        """Test that transaction rolls back on error."""
        mock_session.begin_transaction.return_value = mock_transaction
        mock_transaction.run.side_effect = Exception("Query failed")
        
        # Use transaction context manager with error
        with pytest.raises(DatabaseQueryError, match="Transaction failed and was rolled back"):
            async with neo4j_manager.transaction() as tx:
                await tx.run("CREATE (n:Node {id: $id})", {"id": "123"})
        
        # Verify transaction was rolled back
        mock_transaction.rollback.assert_called_once()
        mock_transaction.commit.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_transaction_multiple_operations(self, neo4j_manager, mock_session, mock_transaction):
        """Test transaction with multiple operations."""
        mock_session.begin_transaction.return_value = mock_transaction
        mock_result = MagicMock()
        mock_result.data = AsyncMock(return_value=[])
        mock_transaction.run.return_value = mock_result
        
        async with neo4j_manager.transaction() as tx:
            await tx.run("CREATE (n:Node {id: $id})", {"id": "1"})
            await tx.run("CREATE (m:Node {id: $id})", {"id": "2"})
            await tx.run("MATCH (n {id: $id1}), (m {id: $id2}) CREATE (n)-[:RELATES]->(m)", 
                        {"id1": "1", "id2": "2"})
        
        # All operations should be in same transaction
        assert mock_transaction.run.call_count == 3
        mock_transaction.commit.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_transaction_rollback_on_partial_failure(self, neo4j_manager, mock_session, mock_transaction):
        """Test that all operations roll back if one fails."""
        mock_session.begin_transaction.return_value = mock_transaction
        mock_result = MagicMock()
        mock_result.data = AsyncMock(return_value=[])
        
        # First two operations succeed, third fails
        mock_transaction.run.side_effect = [
            mock_result,  # First operation succeeds
            mock_result,  # Second operation succeeds
            Exception("Third operation failed")  # Third operation fails
        ]
        
        with pytest.raises(DatabaseQueryError):
            async with neo4j_manager.transaction() as tx:
                await tx.run("CREATE (n:Node {id: $id})", {"id": "1"})
                await tx.run("CREATE (m:Node {id: $id})", {"id": "2"})
                await tx.run("CREATE (x:Node {id: $id})", {"id": "3"})
        
        # Verify rollback was called
        mock_transaction.rollback.assert_called_once()
        mock_transaction.commit.assert_not_called()


class TestAtomicWriteOperations:
    """Test atomic write operations."""
    
    @pytest.mark.asyncio
    async def test_execute_atomic_write_success(self, neo4j_manager, mock_session, mock_transaction):
        """Test successful atomic write with multiple operations."""
        mock_session.begin_transaction.return_value = mock_transaction
        
        # Mock results for each operation
        mock_result1 = MagicMock()
        mock_result1.data = AsyncMock(return_value=[{"id": "1"}])
        mock_result2 = MagicMock()
        mock_result2.data = AsyncMock(return_value=[{"id": "2"}])
        mock_result3 = MagicMock()
        mock_result3.data = AsyncMock(return_value=[{"count": 1}])
        
        mock_transaction.run.side_effect = [mock_result1, mock_result2, mock_result3]
        
        operations = [
            ("CREATE (n:Node {id: $id})", {"id": "1"}),
            ("CREATE (m:Node {id: $id})", {"id": "2"}),
            ("MATCH (n {id: $id1}), (m {id: $id2}) CREATE (n)-[:RELATES]->(m)", {"id1": "1", "id2": "2"}),
        ]
        
        results = await neo4j_manager.execute_atomic_write(operations)
        
        # Verify all operations were executed
        assert len(results) == 3
        assert results[0] == [{"id": "1"}]
        assert results[1] == [{"id": "2"}]
        assert results[2] == [{"count": 1}]
        
        # Verify transaction was committed
        mock_transaction.commit.assert_called_once()
        mock_transaction.rollback.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_execute_atomic_write_rollback_on_failure(self, neo4j_manager, mock_session, mock_transaction):
        """Test that atomic write rolls back all operations on failure."""
        mock_session.begin_transaction.return_value = mock_transaction
        
        # First operation succeeds, second fails
        mock_result1 = MagicMock()
        mock_result1.data = AsyncMock(return_value=[{"id": "1"}])
        mock_transaction.run.side_effect = [
            mock_result1,
            Exception("Second operation failed")
        ]
        
        operations = [
            ("CREATE (n:Node {id: $id})", {"id": "1"}),
            ("CREATE (m:Node {id: $id})", {"id": "2"}),
        ]
        
        with pytest.raises(DatabaseQueryError, match="Atomic write operation failed"):
            await neo4j_manager.execute_atomic_write(operations)
        
        # Verify rollback was called
        mock_transaction.rollback.assert_called_once()
        mock_transaction.commit.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_execute_atomic_write_empty_operations(self, neo4j_manager):
        """Test atomic write with empty operations list."""
        results = await neo4j_manager.execute_atomic_write([])
        assert results == []