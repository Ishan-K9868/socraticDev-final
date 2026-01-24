"""Custom exception classes for the GraphRAG system."""

from typing import Optional, Dict, Any


class GraphRAGException(Exception):
    """Base exception for all GraphRAG errors."""
    
    def __init__(
        self,
        message: str,
        error_code: str,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.details = details or {}


class ParseError(GraphRAGException):
    """Exception raised when code parsing fails."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "PARSE_ERROR", details)


class DatabaseConnectionError(GraphRAGException):
    """Exception raised when database connection fails."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "DB_CONNECTION_ERROR", details)


class DatabaseQueryError(GraphRAGException):
    """Exception raised when database query fails."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "DB_QUERY_ERROR", details)


class DatabaseQueryTimeoutError(GraphRAGException):
    """Exception raised when database query times out."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "DB_QUERY_TIMEOUT", details)


class RateLimitExceededError(GraphRAGException):
    """Exception raised when API rate limit is exceeded."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "RATE_LIMIT_EXCEEDED", details)


class InvalidRequestError(GraphRAGException):
    """Exception raised when request validation fails."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "INVALID_REQUEST", details)


class ProjectNotFoundError(GraphRAGException):
    """Exception raised when project is not found."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "PROJECT_NOT_FOUND", details)


class EntityNotFoundError(GraphRAGException):
    """Exception raised when entity is not found."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "ENTITY_NOT_FOUND", details)


class FileSizeExceededError(GraphRAGException):
    """Exception raised when file size limit is exceeded."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "FILE_SIZE_EXCEEDED", details)


class InternalError(GraphRAGException):
    """Exception raised for unexpected internal errors."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "INTERNAL_ERROR", details)


class EmbeddingGenerationError(GraphRAGException):
    """Exception raised when embedding generation fails."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "EMBEDDING_GENERATION_ERROR", details)


class RateLimitError(GraphRAGException):
    """Exception raised when rate limit is reached."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "RATE_LIMIT_ERROR", details)
