"""Unit tests for transaction management with rollback.

Validates: Requirements 12.5
"""

import pytest
from unittest.mock import AsyncMock, MagicMock
from src.services.neo4j_manager import Neo4jConnectionManager
from src.utils.errors import DatabaseQueryError


@pytest.fixture
def mock_driver():
    driver = MagicMock()
    driver.close = AsyncMock()
    return driver


@pytest.fixture
def mock_session():
    session = MagicMock()
    session.close = AsyncMock()
    session.run = AsyncMock()
    session.begin_transaction = AsyncMock()
    return session


@pytest.fixture
def mock_transaction():
    tx = MagicMock()
    tx.run = AsyncMock()
    tx.commit = AsyncMock()
    tx.rollback = AsyncMock()
    return tx


@pytest.fixture
def neo4j_manager(mock_driver):
    manager = Neo4jConnectionManager()
    manager._driver = mock_driver
    manager._is_connected = True
    return manager


class TestTransactionContextManager:
    """Test the transaction context manager."""
    
    @pytest.mark.asyncio
    async def test_transaction_commit_on_success(self, neo4j_manager, mock_driver, mock_session, mock_transaction):
        """Test that transaction commits on successful execution."""
        mock_driver.session.return_value.__aenter__.return_value = mock_session
        mock_driver.session.return_value.__aexit__.return_value = AsyncMock()
        mock_session.begin_transaction.return_value = mock_transaction
        
        mock_result = MagicMock()
        mock_result.data = AsyncMock(return_value=[{"id": "123"}])
        mock_transaction.run.return_value = mock_result
        
        async with neo4j_manager.transaction() as tx:
            result = await tx.run("CREATE (n:Node {id: })", {"id": "123"})
            await result.data()
        
        # Verify transaction was committed and not rolled back
        mock_transaction.commit.assert_called_once()
        mock_transaction.rollback.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_transaction_rollback_on_error(self, neo4j_manager, mock_driver, mock_session, mock_transaction):
        """Test that transaction rolls back on error."""
        mock_driver.session.return_value.__aenter__.return_value = mock_session
        mock_driver.session.return_value.__aexit__.return_value = AsyncMock()
        mock_session.begin_transaction.return_value = mock_transaction
        mock_transaction.run.side_effect = Exception("Query failed")
        
        # The transaction should rollback even if error is caught
        try:
            async with neo4j_manager.transaction() as tx:
                await tx.run("CREATE (n:Node {id: })", {"id": "123"})
        except (DatabaseQueryError, Exception):
            pass  # Error may or may not be raised
        
        # Verify rollback was called and commit was not
        mock_transaction.rollback.assert_called_once()
        mock_transaction.commit.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_transaction_multiple_operations(self, neo4j_manager, mock_driver, mock_session, mock_transaction):
        """Test transaction with multiple operations."""
        mock_driver.session.return_value.__aenter__.return_value = mock_session
        mock_driver.session.return_value.__aexit__.return_value = AsyncMock()
        mock_session.begin_transaction.return_value = mock_transaction
        
        mock_result = MagicMock()
        mock_result.data = AsyncMock(return_value=[])
        mock_transaction.run.return_value = mock_result
        
        async with neo4j_manager.transaction() as tx:
            await tx.run("CREATE (n:Node {id: })", {"id": "1"})
            await tx.run("CREATE (m:Node {id: })", {"id": "2"})
            await tx.run("MATCH (n {id: }), (m {id: }) CREATE (n)-[:RELATES]->(m)", 
                        {"id1": "1", "id2": "2"})
        
        # All operations should be in same transaction
        assert mock_transaction.run.call_count == 3
        mock_transaction.commit.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_transaction_rollback_on_partial_failure(self, neo4j_manager, mock_driver, mock_session, mock_transaction):
        """Test that all operations roll back if one fails."""
        mock_driver.session.return_value.__aenter__.return_value = mock_session
        mock_driver.session.return_value.__aexit__.return_value = AsyncMock()
        mock_session.begin_transaction.return_value = mock_transaction
        
        mock_result = MagicMock()
        mock_result.data = AsyncMock(return_value=[])
        
        # First two operations succeed, third fails
        mock_transaction.run.side_effect = [
            mock_result,
            mock_result,
            Exception("Third operation failed")
        ]
        
        try:
            async with neo4j_manager.transaction() as tx:
                await tx.run("CREATE (n:Node {id: })", {"id": "1"})
                await tx.run("CREATE (m:Node {id: })", {"id": "2"})
                await tx.run("CREATE (x:Node {id: })", {"id": "3"})
        except (DatabaseQueryError, Exception):
            pass  # Error may or may not be raised
        
        # Verify rollback was called (undoing all operations)
        mock_transaction.rollback.assert_called_once()
        mock_transaction.commit.assert_not_called()


class TestAtomicWriteOperations:
    """Test atomic write operations."""
    
    @pytest.mark.asyncio
    async def test_execute_atomic_write_success(self, neo4j_manager, mock_driver, mock_session, mock_transaction):
        """Test successful atomic write with multiple operations."""
        mock_driver.session.return_value.__aenter__.return_value = mock_session
        mock_driver.session.return_value.__aexit__.return_value = AsyncMock()
        mock_session.begin_transaction.return_value = mock_transaction
        
        mock_result1 = MagicMock()
        mock_result1.data = AsyncMock(return_value=[{"id": "1"}])
        mock_result2 = MagicMock()
        mock_result2.data = AsyncMock(return_value=[{"id": "2"}])
        
        mock_transaction.run.side_effect = [mock_result1, mock_result2]
        
        operations = [
            ("CREATE (n:Node {id: })", {"id": "1"}),
            ("CREATE (m:Node {id: })", {"id": "2"}),
        ]
        
        results = await neo4j_manager.execute_atomic_write(operations)
        
        # Verify all operations were executed
        assert len(results) == 2
        assert results[0] == [{"id": "1"}]
        assert results[1] == [{"id": "2"}]
        
        # Verify transaction was committed
        mock_transaction.commit.assert_called_once()
        mock_transaction.rollback.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_execute_atomic_write_rollback_on_failure(self, neo4j_manager, mock_driver, mock_session, mock_transaction):
        """Test that atomic write rolls back all operations on failure."""
        mock_driver.session.return_value.__aenter__.return_value = mock_session
        mock_driver.session.return_value.__aexit__.return_value = AsyncMock()
        mock_session.begin_transaction.return_value = mock_transaction
        
        mock_result1 = MagicMock()
        mock_result1.data = AsyncMock(return_value=[{"id": "1"}])
        mock_transaction.run.side_effect = [
            mock_result1,
            Exception("Second operation failed")
        ]
        
        operations = [
            ("CREATE (n:Node {id: })", {"id": "1"}),
            ("CREATE (m:Node {id: })", {"id": "2"}),
        ]
        
        # Execute and catch any error
        try:
            await neo4j_manager.execute_atomic_write(operations)
        except (DatabaseQueryError, Exception):
            pass  # Error may or may not be raised
        
        # Verify rollback was called (undoing the first operation)
        mock_transaction.rollback.assert_called_once()
        mock_transaction.commit.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_execute_atomic_write_empty_operations(self, neo4j_manager):
        """Test atomic write with empty operations list."""
        results = await neo4j_manager.execute_atomic_write([])
        assert results == []


class TestTransactionAtomicity:
    """Test transaction atomicity guarantees."""
    
    @pytest.mark.asyncio
    async def test_transaction_all_or_nothing(self, neo4j_manager, mock_driver, mock_session, mock_transaction):
        """Test that either all operations succeed or none do (atomicity)."""
        mock_driver.session.return_value.__aenter__.return_value = mock_session
        mock_driver.session.return_value.__aexit__.return_value = AsyncMock()
        mock_session.begin_transaction.return_value = mock_transaction
        
        # Simulate partial success followed by failure
        mock_result = MagicMock()
        mock_result.data = AsyncMock(return_value=[])
        mock_transaction.run.side_effect = [
            mock_result,  # First succeeds
            Exception("Second fails")  # Second fails
        ]
        
        operations = [
            ("CREATE (n:Node {id: })", {"id": "1"}),
            ("CREATE (m:Node {id: })", {"id": "2"}),
        ]
        
        # Execute and catch any error
        try:
            await neo4j_manager.execute_atomic_write(operations)
        except (DatabaseQueryError, Exception):
            pass
        
        # Verify rollback was called (undoing the first operation)
        # This ensures atomicity: either all operations succeed or none do
        mock_transaction.rollback.assert_called_once()
        mock_transaction.commit.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_transaction_isolation(self, neo4j_manager, mock_driver):
        """Test that transactions are isolated from each other."""
        # Create two separate sessions
        mock_session1 = MagicMock()
        mock_session1.close = AsyncMock()
        mock_session1.begin_transaction = AsyncMock()
        mock_tx1 = MagicMock()
        mock_tx1.run = AsyncMock()
        mock_tx1.commit = AsyncMock()
        mock_tx1.rollback = AsyncMock()
        mock_session1.begin_transaction.return_value = mock_tx1
        
        mock_session2 = MagicMock()
        mock_session2.close = AsyncMock()
        mock_session2.begin_transaction = AsyncMock()
        mock_tx2 = MagicMock()
        mock_tx2.run = AsyncMock()
        mock_tx2.commit = AsyncMock()
        mock_tx2.rollback = AsyncMock()
        mock_session2.begin_transaction.return_value = mock_tx2
        
        # Mock driver to return different sessions
        mock_driver.session.side_effect = [
            self._create_async_context_manager(mock_session1),
            self._create_async_context_manager(mock_session2)
        ]
        
        mock_result = MagicMock()
        mock_result.data = AsyncMock(return_value=[])
        mock_tx1.run.return_value = mock_result
        mock_tx2.run.return_value = mock_result
        
        # Execute two transactions
        async with neo4j_manager.transaction() as tx1:
            await tx1.run("CREATE (n:Node {id: })", {"id": "1"})
        
        async with neo4j_manager.transaction() as tx2:
            await tx2.run("CREATE (n:Node {id: })", {"id": "2"})
        
        # Verify both transactions committed independently
        mock_tx1.commit.assert_called_once()
        mock_tx2.commit.assert_called_once()
    
    def _create_async_context_manager(self, session):
        """Helper to create an async context manager for a session."""
        class AsyncContextManager:
            async def __aenter__(self):
                return session
            async def __aexit__(self, exc_type, exc_val, exc_tb):
                pass
        return AsyncContextManager()
