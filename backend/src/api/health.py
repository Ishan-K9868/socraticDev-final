"""Health check and monitoring endpoints."""

from fastapi import APIRouter
from typing import Dict, Any
import time

from ..services.neo4j_manager import Neo4jConnectionManager
from ..services.cache_service import CacheService
from ..config.settings import settings

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/")
async def health_check() -> Dict[str, Any]:
    """Basic health check."""
    return {
        "status": "healthy",
        "version": settings.app_version,
        "environment": settings.environment,
        "timestamp": time.time()
    }


@router.get("/detailed")
async def detailed_health_check() -> Dict[str, Any]:
    """Detailed health check with service status."""
    health_status = {
        "status": "healthy",
        "version": settings.app_version,
        "services": {}
    }
    
    # Check Neo4j
    try:
        neo4j = Neo4jConnectionManager()
        neo4j_healthy = neo4j.health_check()
        health_status["services"]["neo4j"] = {
            "status": "healthy" if neo4j_healthy else "unhealthy",
            "uri": settings.neo4j_uri
        }
    except Exception as e:
        health_status["services"]["neo4j"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_status["status"] = "degraded"
    
    # Check Redis
    try:
        cache = CacheService()
        redis_stats = cache.get_stats()
        health_status["services"]["redis"] = {
            "status": "healthy" if redis_stats.get("connected") else "unhealthy",
            "stats": redis_stats
        }
    except Exception as e:
        health_status["services"]["redis"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_status["status"] = "degraded"
    
    # Check Chroma (simplified - would need actual health check)
    health_status["services"]["chroma"] = {
        "status": "unknown",
        "host": settings.chroma_host,
        "port": settings.chroma_port
    }
    
    return health_status


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    """Get system metrics."""
    try:
        cache = CacheService()
        cache_stats = cache.get_stats()
        
        return {
            "cache": cache_stats,
            "timestamp": time.time()
        }
    except Exception as e:
        return {
            "error": str(e),
            "timestamp": time.time()
        }
