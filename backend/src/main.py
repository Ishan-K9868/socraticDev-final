"""Main FastAPI application entry point."""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uuid
from datetime import datetime

from .config import settings
from .utils import setup_logging, get_logger, GraphRAGException
from .models.api import ErrorResponse


# Setup logging
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("Starting GraphRAG System", extra={
        "version": settings.app_version,
        "environment": settings.environment
    })
    yield
    logger.info("Shutting down GraphRAG System")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Graph Retrieval-Augmented Generation System for Code Analysis",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request ID middleware
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    """Add unique request ID to each request."""
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    # Add request ID to response headers
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    
    return response


# Exception handlers
@app.exception_handler(GraphRAGException)
async def graphrag_exception_handler(request: Request, exc: GraphRAGException):
    """Handle GraphRAG custom exceptions."""
    request_id = getattr(request.state, "request_id", "unknown")
    
    logger.error(
        f"GraphRAG error: {exc.message}",
        extra={
            "request_id": request_id,
            "error_code": exc.error_code,
            "details": exc.details
        },
        exc_info=True
    )
    
    error_response = ErrorResponse(
        error_code=exc.error_code,
        message=exc.message,
        details=exc.details,
        timestamp=datetime.utcnow(),
        request_id=request_id
    )
    
    # Map error codes to HTTP status codes
    status_code_map = {
        "PARSE_ERROR": status.HTTP_400_BAD_REQUEST,
        "DB_CONNECTION_ERROR": status.HTTP_503_SERVICE_UNAVAILABLE,
        "DB_QUERY_TIMEOUT": status.HTTP_504_GATEWAY_TIMEOUT,
        "RATE_LIMIT_EXCEEDED": status.HTTP_429_TOO_MANY_REQUESTS,
        "INVALID_REQUEST": status.HTTP_400_BAD_REQUEST,
        "PROJECT_NOT_FOUND": status.HTTP_404_NOT_FOUND,
        "ENTITY_NOT_FOUND": status.HTTP_404_NOT_FOUND,
        "FILE_SIZE_EXCEEDED": status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
        "INTERNAL_ERROR": status.HTTP_500_INTERNAL_SERVER_ERROR,
    }
    
    status_code = status_code_map.get(exc.error_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return JSONResponse(
        status_code=status_code,
        content=error_response.model_dump()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions."""
    request_id = getattr(request.state, "request_id", "unknown")
    
    logger.error(
        f"Unexpected error: {str(exc)}",
        extra={"request_id": request_id},
        exc_info=True
    )
    
    error_response = ErrorResponse(
        error_code="INTERNAL_ERROR",
        message="An unexpected error occurred. Please try again later.",
        details={"error": str(exc)} if settings.debug else {},
        timestamp=datetime.utcnow(),
        request_id=request_id
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response.model_dump(mode='json')
    )


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": settings.app_version,
        "environment": settings.environment
    }


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/health"
    }


# Import routers
from .api.upload import router as upload_router
from .api.query import router as query_router
from .api.projects import router as projects_router
from .api.visualization import router as visualization_router
from .api.health import router as health_router

# Include routers
app.include_router(upload_router, prefix=f"{settings.api_prefix}")
app.include_router(query_router, prefix=f"{settings.api_prefix}")
app.include_router(projects_router, prefix=f"{settings.api_prefix}")
app.include_router(visualization_router, prefix=f"{settings.api_prefix}")
app.include_router(health_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug
    )
