"""Unit tests for error handling."""

import pytest
from src.utils.errors import (
    GraphRAGException,
    ParseError,
    DatabaseConnectionError,
    DatabaseQueryTimeoutError,
    RateLimitExceededError,
    InvalidRequestError,
    ProjectNotFoundError,
    EntityNotFoundError,
    FileSizeExceededError,
    InternalError,
)


def test_graphrag_exception():
    """Test base GraphRAGException."""
    exc = GraphRAGException(
        message="Test error",
        error_code="TEST_ERROR",
        details={"key": "value"}
    )
    
    assert str(exc) == "Test error"
    assert exc.message == "Test error"
    assert exc.error_code == "TEST_ERROR"
    assert exc.details == {"key": "value"}


def test_parse_error():
    """Test ParseError exception."""
    exc = ParseError("Failed to parse file", details={"file": "test.py"})
    
    assert exc.error_code == "PARSE_ERROR"
    assert exc.message == "Failed to parse file"
    assert exc.details["file"] == "test.py"


def test_database_connection_error():
    """Test DatabaseConnectionError exception."""
    exc = DatabaseConnectionError("Failed to connect to Neo4j")
    
    assert exc.error_code == "DB_CONNECTION_ERROR"
    assert exc.message == "Failed to connect to Neo4j"


def test_database_query_timeout_error():
    """Test DatabaseQueryTimeoutError exception."""
    exc = DatabaseQueryTimeoutError("Query timed out after 30s")
    
    assert exc.error_code == "DB_QUERY_TIMEOUT"
    assert exc.message == "Query timed out after 30s"


def test_rate_limit_exceeded_error():
    """Test RateLimitExceededError exception."""
    exc = RateLimitExceededError("API rate limit exceeded")
    
    assert exc.error_code == "RATE_LIMIT_EXCEEDED"
    assert exc.message == "API rate limit exceeded"


def test_invalid_request_error():
    """Test InvalidRequestError exception."""
    exc = InvalidRequestError("Invalid project name")
    
    assert exc.error_code == "INVALID_REQUEST"
    assert exc.message == "Invalid project name"


def test_project_not_found_error():
    """Test ProjectNotFoundError exception."""
    exc = ProjectNotFoundError("Project not found", details={"project_id": "123"})
    
    assert exc.error_code == "PROJECT_NOT_FOUND"
    assert exc.message == "Project not found"
    assert exc.details["project_id"] == "123"


def test_entity_not_found_error():
    """Test EntityNotFoundError exception."""
    exc = EntityNotFoundError("Entity not found", details={"entity_id": "456"})
    
    assert exc.error_code == "ENTITY_NOT_FOUND"
    assert exc.message == "Entity not found"
    assert exc.details["entity_id"] == "456"


def test_file_size_exceeded_error():
    """Test FileSizeExceededError exception."""
    exc = FileSizeExceededError("File size exceeds limit")
    
    assert exc.error_code == "FILE_SIZE_EXCEEDED"
    assert exc.message == "File size exceeds limit"


def test_internal_error():
    """Test InternalError exception."""
    exc = InternalError("Unexpected error occurred")
    
    assert exc.error_code == "INTERNAL_ERROR"
    assert exc.message == "Unexpected error occurred"


def test_exception_with_empty_details():
    """Test exception with no details."""
    exc = ParseError("Test error")
    
    assert exc.details == {}
