"""Neo4j connection manager with retry logic and health checks.

This module provides a connection manager for Neo4j database with:
- Connection pooling
- Health checks
- Exponential backoff retry logic (3 retries)
- Automatic reconnection on failures

Validates: Requirements 10.2
"""

import asyncio
import logging
import time
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional

from neo4j import AsyncGraphDatabase, AsyncDriver, AsyncSession
from neo4j.exceptions import (
    ServiceUnavailable,
    SessionExpired,
    TransientError,
    Neo4jError,
    DriverError,
)

from ..config.settings import settings
from ..utils.errors import DatabaseConnectionError, DatabaseQueryError

logger = logging.getLogger(__name__)


class Neo4jConnectionManager:
    """Manages Neo4j database connections with retry logic and health checks.
    
    Features:
    - Connection pooling with configurable pool size
    - Health checks to verify database connectivity
    - Exponential backoff retry logic (3 retries)
    - Automatic reconnection on transient failures
    - Context manager support for sessions
    
    Example:
        manager = Neo4jConnectionManager()
        await manager.connect()
        
        async with manager.session() as session:
            result = await session.run("MATCH (n) RETURN count(n)")
            count = await result.single()
        
        await manager.close()
    """
    
    def __init__(
        self,
        uri: Optional[str] = None,
        user: Optional[str] = None,
        password: Optional[str] = None,
        database: Optional[str] = None,
        max_connection_pool_size: Optional[int] = None,
        connection_timeout: Optional[int] = None,
        max_retries: int = 3,
        initial_retry_delay: float = 1.0,
    ):
        """Initialize Neo4j connection manager.
        
        Args:
            uri: Neo4j connection URI (defaults to settings.neo4j_uri)
            user: Neo4j username (defaults to settings.neo4j_user)
            password: Neo4j password (defaults to settings.neo4j_password)
            database: Neo4j database name (defaults to settings.neo4j_database)
            max_connection_pool_size: Maximum connection pool size
            connection_timeout: Connection timeout in seconds
            max_retries: Maximum number of retry attempts (default: 3)
            initial_retry_delay: Initial delay between retries in seconds (default: 1.0)
        """
        self.uri = uri or settings.neo4j_uri
        self.user = user or settings.neo4j_user
        self.password = password or settings.neo4j_password
        self.database = database or settings.neo4j_database
        self.max_connection_pool_size = (
            max_connection_pool_size or settings.neo4j_max_connection_pool_size
        )
        self.connection_timeout = (
            connection_timeout or settings.neo4j_connection_timeout
        )
        self.max_retries = max_retries
        self.initial_retry_delay = initial_retry_delay
        
        self._driver: Optional[AsyncDriver] = None
        self._is_connected = False
        
        logger.info(
            f"Initialized Neo4j connection manager: uri={self.uri}, "
            f"database={self.database}, max_pool_size={self.max_connection_pool_size}"
        )
    
    async def connect(self) -> None:
        """Establish connection to Neo4j database with retry logic.
        
        Attempts to connect to Neo4j with exponential backoff retry logic.
        Retries up to max_retries times with exponentially increasing delays.
        
        Raises:
            DatabaseConnectionError: If connection fails after all retries
        """
        if self._is_connected and self._driver:
            logger.debug("Already connected to Neo4j")
            return
        
        last_error = None
        retry_delay = self.initial_retry_delay
        
        for attempt in range(1, self.max_retries + 1):
            try:
                logger.info(
                    f"Attempting to connect to Neo4j (attempt {attempt}/{self.max_retries})"
                )
                
                self._driver = AsyncGraphDatabase.driver(
                    self.uri,
                    auth=(self.user, self.password),
                    max_connection_pool_size=self.max_connection_pool_size,
                    connection_timeout=self.connection_timeout,
                )
                
                # Verify connection with a simple query
                await self.health_check()
                
                self._is_connected = True
                logger.info(f"Successfully connected to Neo4j at {self.uri}")
                return
                
            except (ServiceUnavailable, SessionExpired, TransientError) as e:
                last_error = e
                logger.warning(
                    f"Connection attempt {attempt} failed: {str(e)}. "
                    f"Retrying in {retry_delay:.1f}s..."
                )
                
                if attempt < self.max_retries:
                    await asyncio.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                    
            except Exception as e:
                # Non-retryable error
                logger.error(f"Non-retryable error connecting to Neo4j: {str(e)}")
                raise DatabaseConnectionError(
                    f"Failed to connect to Neo4j: {str(e)}"
                ) from e
        
        # All retries exhausted
        error_msg = (
            f"Failed to connect to Neo4j after {self.max_retries} attempts. "
            f"Last error: {str(last_error)}"
        )
        logger.error(error_msg)
        raise DatabaseConnectionError(error_msg) from last_error
    
    async def close(self) -> None:
        """Close the Neo4j driver and all connections."""
        if self._driver:
            logger.info("Closing Neo4j connection")
            await self._driver.close()
            self._driver = None
            self._is_connected = False
            logger.info("Neo4j connection closed")
    
    async def health_check(self) -> bool:
        """Perform health check to verify database connectivity.
        
        Returns:
            True if database is healthy and responsive
            
        Raises:
            DatabaseConnectionError: If health check fails
        """
        if not self._driver:
            raise DatabaseConnectionError("Driver not initialized")
        
        try:
            async with self._driver.session(database=self.database) as session:
                result = await session.run("RETURN 1 AS health")
                record = await result.single()
                
                if record and record["health"] == 1:
                    logger.debug("Neo4j health check passed")
                    return True
                else:
                    raise DatabaseConnectionError("Health check returned unexpected result")
                    
        except (Neo4jError, DriverError) as e:
            logger.error(f"Neo4j health check failed: {str(e)}")
            raise DatabaseConnectionError(f"Health check failed: {str(e)}") from e
    
    @asynccontextmanager
    async def session(self, **kwargs) -> AsyncSession:
        """Create a Neo4j session with automatic connection management.
        
        This is a context manager that ensures the session is properly closed
        after use. If the connection is not established, it will attempt to
        connect first.
        
        Args:
            **kwargs: Additional arguments to pass to driver.session()
            
        Yields:
            AsyncSession: Neo4j async session
            
        Raises:
            DatabaseConnectionError: If connection cannot be established
            
        Example:
            async with manager.session() as session:
                result = await session.run("MATCH (n) RETURN n LIMIT 10")
                records = await result.data()
        """
        if not self._is_connected:
            await self.connect()
        
        if not self._driver:
            raise DatabaseConnectionError("Driver not initialized")
        
        # Set default database if not specified
        if "database" not in kwargs:
            kwargs["database"] = self.database
        
        session = self._driver.session(**kwargs)
        try:
            yield session
        finally:
            await session.close()
    
    @asynccontextmanager
    async def transaction(self, **session_kwargs):
        """Create a Neo4j transaction with automatic rollback on failure.
        
        This context manager provides atomic transaction support. If any
        exception occurs within the transaction block, all changes are
        automatically rolled back. Otherwise, changes are committed.
        
        Args:
            **session_kwargs: Additional arguments for session creation
            
        Yields:
            AsyncTransaction: Neo4j async transaction
            
        Raises:
            DatabaseConnectionError: If connection cannot be established
            DatabaseQueryError: If transaction fails
            
        Example:
            async with manager.transaction() as tx:
                await tx.run("CREATE (n:Node {id: $id})", {"id": "123"})
                await tx.run("CREATE (m:Node {id: $id})", {"id": "456"})
                # Both operations committed together, or both rolled back on error
                
        Validates: Requirements 12.5
        """
        if not self._is_connected:
            await self.connect()
        
        if not self._driver:
            raise DatabaseConnectionError("Driver not initialized")
        
        # Set default database if not specified
        if "database" not in session_kwargs:
            session_kwargs["database"] = self.database
        
        async with self._driver.session(**session_kwargs) as session:
            tx = await session.begin_transaction()
            try:
                yield tx
                await tx.commit()
                logger.debug("Transaction committed successfully")
            except Exception as e:
                await tx.rollback()
                logger.warning(f"Transaction rolled back due to error: {str(e)}")
                raise DatabaseQueryError(
                    f"Transaction failed and was rolled back: {str(e)}"
                ) from e
    
    async def execute_with_retry(
        self,
        query: str,
        parameters: Optional[Dict[str, Any]] = None,
        **session_kwargs,
    ) -> List[Dict[str, Any]]:
        """Execute a Cypher query with retry logic.
        
        Executes a query with exponential backoff retry logic for transient errors.
        This is useful for queries that may fail due to temporary network issues
        or database load.
        
        Args:
            query: Cypher query string
            parameters: Query parameters (default: None)
            **session_kwargs: Additional arguments for session creation
            
        Returns:
            List of result records as dictionaries
            
        Raises:
            DatabaseQueryError: If query fails after all retries
        """
        if parameters is None:
            parameters = {}
        
        last_error = None
        retry_delay = self.initial_retry_delay
        
        for attempt in range(1, self.max_retries + 1):
            try:
                async with self.session(**session_kwargs) as session:
                    result = await session.run(query, parameters)
                    records = await result.data()
                    logger.debug(
                        f"Query executed successfully: {query[:100]}... "
                        f"(returned {len(records)} records)"
                    )
                    return records
                    
            except (ServiceUnavailable, SessionExpired, TransientError) as e:
                last_error = e
                logger.warning(
                    f"Query attempt {attempt} failed: {str(e)}. "
                    f"Retrying in {retry_delay:.1f}s..."
                )
                
                if attempt < self.max_retries:
                    await asyncio.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                    
                    # Try to reconnect if connection was lost
                    if isinstance(e, (ServiceUnavailable, SessionExpired)):
                        self._is_connected = False
                        try:
                            await self.connect()
                        except DatabaseConnectionError:
                            logger.warning("Reconnection failed, will retry query")
                            
            except Neo4jError as e:
                # Non-retryable Neo4j error (e.g., syntax error, constraint violation)
                logger.error(f"Non-retryable query error: {str(e)}")
                raise DatabaseQueryError(
                    f"Query failed: {str(e)}",
                    details={"query": query, "parameters": parameters}
                ) from e
                
            except Exception as e:
                # Unexpected error
                logger.error(f"Unexpected error executing query: {str(e)}")
                raise DatabaseQueryError(
                    f"Unexpected query error: {str(e)}",
                    details={"query": query, "parameters": parameters}
                ) from e
        
        # All retries exhausted
        error_msg = (
            f"Query failed after {self.max_retries} attempts. "
            f"Last error: {str(last_error)}"
        )
        logger.error(error_msg)
        raise DatabaseQueryError(
            error_msg,
            details={"query": query, "parameters": parameters}
        ) from last_error
    
    async def execute_write_with_retry(
        self,
        query: str,
        parameters: Optional[Dict[str, Any]] = None,
        **session_kwargs,
    ) -> List[Dict[str, Any]]:
        """Execute a write query with retry logic in a write transaction.
        
        Similar to execute_with_retry but uses a write transaction for
        better consistency guarantees.
        
        Args:
            query: Cypher query string
            parameters: Query parameters (default: None)
            **session_kwargs: Additional arguments for session creation
            
        Returns:
            List of result records as dictionaries
            
        Raises:
            DatabaseQueryError: If query fails after all retries
        """
        if parameters is None:
            parameters = {}
        
        async def _execute_write(tx):
            result = await tx.run(query, parameters)
            return await result.data()
        
        last_error = None
        retry_delay = self.initial_retry_delay
        
        for attempt in range(1, self.max_retries + 1):
            try:
                async with self.session(**session_kwargs) as session:
                    records = await session.execute_write(_execute_write)
                    logger.debug(
                        f"Write query executed successfully: {query[:100]}... "
                        f"(returned {len(records)} records)"
                    )
                    return records
                    
            except (ServiceUnavailable, SessionExpired, TransientError) as e:
                last_error = e
                logger.warning(
                    f"Write query attempt {attempt} failed: {str(e)}. "
                    f"Retrying in {retry_delay:.1f}s..."
                )
                
                if attempt < self.max_retries:
                    await asyncio.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                    
                    # Try to reconnect if connection was lost
                    if isinstance(e, (ServiceUnavailable, SessionExpired)):
                        self._is_connected = False
                        try:
                            await self.connect()
                        except DatabaseConnectionError:
                            logger.warning("Reconnection failed, will retry query")
                            
            except Neo4jError as e:
                logger.error(f"Non-retryable write query error: {str(e)}")
                raise DatabaseQueryError(
                    f"Write query failed: {str(e)}",
                    details={"query": query, "parameters": parameters}
                ) from e
                
            except Exception as e:
                logger.error(f"Unexpected error executing write query: {str(e)}")
                raise DatabaseQueryError(
                    f"Unexpected write query error: {str(e)}",
                    details={"query": query, "parameters": parameters}
                ) from e
        
        # All retries exhausted
        error_msg = (
            f"Write query failed after {self.max_retries} attempts. "
            f"Last error: {str(last_error)}"
        )
        logger.error(error_msg)
        raise DatabaseQueryError(
            error_msg,
            details={"query": query, "parameters": parameters}
        ) from last_error
    
    async def execute_atomic_write(
        self,
        operations: List[tuple[str, Dict[str, Any]]],
        **session_kwargs,
    ) -> List[List[Dict[str, Any]]]:
        """Execute multiple write operations atomically with automatic rollback.
        
        All operations are executed within a single transaction. If any operation
        fails, all changes are rolled back automatically. This ensures atomicity
        across multiple Neo4j operations.
        
        Args:
            operations: List of (query, parameters) tuples to execute
            **session_kwargs: Additional arguments for session creation
            
        Returns:
            List of result lists, one for each operation
            
        Raises:
            DatabaseQueryError: If any operation fails (all changes rolled back)
            
        Example:
            operations = [
                ("CREATE (n:Node {id: $id})", {"id": "123"}),
                ("CREATE (m:Node {id: $id})", {"id": "456"}),
                ("CREATE (n)-[:RELATES]->(m)", {}),
            ]
            results = await manager.execute_atomic_write(operations)
            
        Validates: Requirements 12.5
        """
        if not operations:
            return []
        
        try:
            results = []
            async with self.transaction(**session_kwargs) as tx:
                for query, parameters in operations:
                    result = await tx.run(query, parameters)
                    records = await result.data()
                    results.append(records)
                    logger.debug(
                        f"Atomic operation executed: {query[:100]}... "
                        f"(returned {len(records)} records)"
                    )
            
            logger.info(f"Successfully executed {len(operations)} operations atomically")
            return results
            
        except Exception as e:
            logger.error(
                f"Atomic write failed, all changes rolled back: {str(e)}"
            )
            raise DatabaseQueryError(
                f"Atomic write operation failed: {str(e)}",
                details={"operation_count": len(operations)}
            ) from e
    
    @property
    def is_connected(self) -> bool:
        """Check if the manager is currently connected to Neo4j."""
        return self._is_connected
    
    @property
    def driver(self) -> Optional[AsyncDriver]:
        """Get the underlying Neo4j driver (for advanced use cases)."""
        return self._driver


# Global connection manager instance
_connection_manager: Optional[Neo4jConnectionManager] = None


def get_neo4j_manager() -> Neo4jConnectionManager:
    """Get or create the global Neo4j connection manager instance.
    
    Returns:
        Neo4jConnectionManager: Global connection manager instance
    """
    global _connection_manager
    
    if _connection_manager is None:
        _connection_manager = Neo4jConnectionManager()
    
    return _connection_manager


async def close_neo4j_manager() -> None:
    """Close the global Neo4j connection manager."""
    global _connection_manager
    
    if _connection_manager is not None:
        await _connection_manager.close()
        _connection_manager = None
