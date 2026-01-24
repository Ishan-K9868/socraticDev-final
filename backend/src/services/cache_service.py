"""Cache Service using Redis for query result caching.

This module provides caching functionality to improve query performance
by storing frequently accessed results in Redis.
"""

import logging
import json
import redis
from typing import Optional, Any, Dict
from datetime import timedelta

from ..config.settings import settings

logger = logging.getLogger(__name__)


class RedisConnectionManager:
    """Manager for Redis connections with health checks."""
    
    def __init__(self):
        """Initialize Redis connection manager."""
        self.client: Optional[redis.Redis] = None
        self._connect()
    
    def _connect(self):
        """Establish connection to Redis."""
        try:
            self.client = redis.Redis(
                host=settings.redis_host,
                port=settings.redis_port,
                db=settings.redis_db,
                password=settings.redis_password,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True,
                health_check_interval=30
            )
            
            # Test connection
            self.client.ping()
            logger.info(f"Connected to Redis at {settings.redis_host}:{settings.redis_port}")
            
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.client = None
            raise
    
    def health_check(self) -> bool:
        """Check if Redis connection is healthy.
        
        Returns:
            True if connection is healthy, False otherwise
        """
        try:
            if self.client:
                self.client.ping()
                return True
            return False
        except Exception as e:
            logger.error(f"Redis health check failed: {e}")
            return False
    
    def reconnect(self):
        """Reconnect to Redis."""
        logger.info("Reconnecting to Redis...")
        try:
            if self.client:
                self.client.close()
        except:
            pass
        
        self._connect()
    
    def close(self):
        """Close Redis connection."""
        if self.client:
            try:
                self.client.close()
                logger.info("Redis connection closed")
            except Exception as e:
                logger.error(f"Error closing Redis connection: {e}")


class CacheService:
    """Service for caching query results in Redis."""
    
    def __init__(self, connection_manager: Optional[RedisConnectionManager] = None):
        """Initialize cache service.
        
        Args:
            connection_manager: Optional Redis connection manager
        """
        self.connection_manager = connection_manager or RedisConnectionManager()
        self.default_ttl = 300  # 5 minutes in seconds
    
    @property
    def client(self) -> redis.Redis:
        """Get Redis client.
        
        Returns:
            Redis client instance
        """
        if not self.connection_manager.client:
            self.connection_manager.reconnect()
        return self.connection_manager.client
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            Cached value if found, None otherwise
        """
        try:
            value = self.client.get(key)
            if value:
                logger.debug(f"Cache hit for key: {key}")
                # Deserialize JSON
                return json.loads(value)
            else:
                logger.debug(f"Cache miss for key: {key}")
                return None
        except Exception as e:
            logger.error(f"Failed to get from cache: {e}")
            return None
    
    def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None
    ) -> bool:
        """Set value in cache with TTL.
        
        Args:
            key: Cache key
            value: Value to cache (will be JSON serialized)
            ttl: Time to live in seconds (default: 5 minutes)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            ttl = ttl or self.default_ttl
            
            # Serialize to JSON
            serialized_value = json.dumps(value, default=str)
            
            # Set with expiration
            self.client.setex(
                name=key,
                time=timedelta(seconds=ttl),
                value=serialized_value
            )
            
            logger.debug(f"Cached value for key: {key} with TTL: {ttl}s")
            return True
            
        except Exception as e:
            logger.error(f"Failed to set cache: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            True if successful, False otherwise
        """
        try:
            self.client.delete(key)
            logger.debug(f"Deleted cache key: {key}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete from cache: {e}")
            return False
    
    def invalidate_project(self, project_id: str) -> int:
        """Invalidate all cache entries for a project.
        
        Args:
            project_id: Project identifier
            
        Returns:
            Number of keys deleted
        """
        try:
            # Find all keys for this project
            pattern = f"*:project:{project_id}:*"
            keys = list(self.client.scan_iter(match=pattern))
            
            if keys:
                deleted = self.client.delete(*keys)
                logger.info(f"Invalidated {deleted} cache entries for project: {project_id}")
                return deleted
            else:
                logger.debug(f"No cache entries found for project: {project_id}")
                return 0
                
        except Exception as e:
            logger.error(f"Failed to invalidate project cache: {e}")
            return 0
    
    def invalidate_pattern(self, pattern: str) -> int:
        """Invalidate all cache entries matching a pattern.
        
        Args:
            pattern: Redis key pattern (e.g., "query:*")
            
        Returns:
            Number of keys deleted
        """
        try:
            keys = list(self.client.scan_iter(match=pattern))
            
            if keys:
                deleted = self.client.delete(*keys)
                logger.info(f"Invalidated {deleted} cache entries matching pattern: {pattern}")
                return deleted
            else:
                logger.debug(f"No cache entries found for pattern: {pattern}")
                return 0
                
        except Exception as e:
            logger.error(f"Failed to invalidate cache pattern: {e}")
            return 0
    
    def clear_all(self) -> bool:
        """Clear all cache entries.
        
        WARNING: This clears the entire Redis database.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            self.client.flushdb()
            logger.warning("Cleared all cache entries")
            return True
        except Exception as e:
            logger.error(f"Failed to clear cache: {e}")
            return False
    
    # Cache key builders for different query types
    
    def build_callers_key(self, function_id: str, project_id: str) -> str:
        """Build cache key for find_callers query.
        
        Args:
            function_id: Function identifier
            project_id: Project identifier
            
        Returns:
            Cache key string
        """
        return f"query:callers:project:{project_id}:function:{function_id}"
    
    def build_dependencies_key(self, function_id: str, project_id: str) -> str:
        """Build cache key for find_dependencies query.
        
        Args:
            function_id: Function identifier
            project_id: Project identifier
            
        Returns:
            Cache key string
        """
        return f"query:dependencies:project:{project_id}:function:{function_id}"
    
    def build_impact_key(self, function_id: str, project_id: str) -> str:
        """Build cache key for impact_analysis query.
        
        Args:
            function_id: Function identifier
            project_id: Project identifier
            
        Returns:
            Cache key string
        """
        return f"query:impact:project:{project_id}:function:{function_id}"
    
    def build_search_key(self, query: str, project_ids: list) -> str:
        """Build cache key for semantic_search query.
        
        Args:
            query: Search query string
            project_ids: List of project identifiers
            
        Returns:
            Cache key string
        """
        # Sort project IDs for consistent key
        sorted_projects = sorted(project_ids)
        projects_str = ",".join(sorted_projects)
        
        # Hash the query to keep key length reasonable
        import hashlib
        query_hash = hashlib.md5(query.encode()).hexdigest()[:16]
        
        return f"query:search:projects:{projects_str}:query:{query_hash}"
    
    def build_graph_key(self, project_id: str, filters_hash: str) -> str:
        """Build cache key for graph visualization query.
        
        Args:
            project_id: Project identifier
            filters_hash: Hash of filters applied
            
        Returns:
            Cache key string
        """
        return f"query:graph:project:{project_id}:filters:{filters_hash}"
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics.
        
        Returns:
            Dictionary with cache statistics
        """
        try:
            info = self.client.info()
            
            return {
                'connected': True,
                'used_memory': info.get('used_memory_human'),
                'total_keys': self.client.dbsize(),
                'hits': info.get('keyspace_hits', 0),
                'misses': info.get('keyspace_misses', 0),
                'hit_rate': (
                    info.get('keyspace_hits', 0) /
                    (info.get('keyspace_hits', 0) + info.get('keyspace_misses', 1))
                    * 100
                )
            }
        except Exception as e:
            logger.error(f"Failed to get cache stats: {e}")
            return {'connected': False, 'error': str(e)}


def get_cache_service() -> CacheService:
    """Get a cache service instance.
    
    Returns:
        CacheService instance
    """
    return CacheService()
