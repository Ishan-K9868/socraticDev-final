"""Gemini API client with rate limiting for embedding generation."""

import asyncio
import time
from typing import List, Optional
from collections import deque
import logging

import google.generativeai as genai

from ..config.settings import settings
from ..utils.errors import EmbeddingGenerationError, RateLimitError


logger = logging.getLogger(__name__)


class TokenBucket:
    """Token bucket algorithm for rate limiting.
    
    The token bucket allows bursts of requests up to the bucket capacity,
    while maintaining an average rate over time.
    """
    
    def __init__(self, rate_per_minute: int):
        """Initialize token bucket.
        
        Args:
            rate_per_minute: Maximum number of requests allowed per minute
        """
        self.capacity = rate_per_minute
        self.tokens = rate_per_minute
        self.rate_per_second = rate_per_minute / 60.0
        self.last_update = time.time()
        self._lock = asyncio.Lock()
    
    async def acquire(self, tokens: int = 1) -> bool:
        """Attempt to acquire tokens from the bucket.
        
        Args:
            tokens: Number of tokens to acquire (default: 1)
            
        Returns:
            True if tokens were acquired, False if bucket is empty
        """
        async with self._lock:
            now = time.time()
            elapsed = now - self.last_update
            
            # Refill tokens based on elapsed time
            self.tokens = min(
                self.capacity,
                self.tokens + elapsed * self.rate_per_second
            )
            self.last_update = now
            
            # Check if we have enough tokens
            if self.tokens >= tokens:
                self.tokens -= tokens
                return True
            
            return False
    
    async def wait_for_token(self) -> None:
        """Wait until a token becomes available."""
        while not await self.acquire():
            # Calculate wait time until next token
            wait_time = 1.0 / self.rate_per_second
            await asyncio.sleep(wait_time)
    
    def get_available_tokens(self) -> float:
        """Get the current number of available tokens."""
        now = time.time()
        elapsed = now - self.last_update
        return min(
            self.capacity,
            self.tokens + elapsed * self.rate_per_second
        )


class RequestQueue:
    """Queue for managing requests when rate limited."""
    
    def __init__(self):
        """Initialize request queue."""
        self.queue: deque = deque()
        self._lock = asyncio.Lock()
        self._processing = False
    
    async def enqueue(self, request_data: dict) -> asyncio.Future:
        """Add a request to the queue.
        
        Args:
            request_data: Dictionary containing request parameters
            
        Returns:
            Future that will be resolved when the request is processed
        """
        future = asyncio.Future()
        async with self._lock:
            self.queue.append((request_data, future))
        return future
    
    async def dequeue(self) -> Optional[tuple]:
        """Remove and return the next request from the queue.
        
        Returns:
            Tuple of (request_data, future) or None if queue is empty
        """
        async with self._lock:
            if self.queue:
                return self.queue.popleft()
            return None
    
    def size(self) -> int:
        """Get the current queue size."""
        return len(self.queue)
    
    def is_empty(self) -> bool:
        """Check if the queue is empty."""
        return len(self.queue) == 0


class GeminiClient:
    """Client for Gemini API with rate limiting and request queueing.
    
    This client implements:
    - Token bucket rate limiting to respect API limits
    - Request queueing when rate limited
    - Automatic retry with exponential backoff
    - Batch embedding generation
    """
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        rate_limit_per_minute: Optional[int] = None
    ):
        """Initialize Gemini client.
        
        Args:
            api_key: Gemini API key (defaults to settings.gemini_api_key)
            model_name: Embedding model name (defaults to settings.gemini_embedding_model)
            rate_limit_per_minute: Rate limit (defaults to settings.gemini_rate_limit_per_minute)
        """
        self.api_key = api_key or settings.gemini_api_key
        self.model_name = model_name or settings.gemini_embedding_model
        self.rate_limit = rate_limit_per_minute or settings.gemini_rate_limit_per_minute
        
        if not self.api_key:
            raise ValueError("Gemini API key is required")
        
        # Configure Gemini API
        genai.configure(api_key=self.api_key)
        
        # Initialize rate limiting
        self.token_bucket = TokenBucket(self.rate_limit)
        self.request_queue = RequestQueue()
        
        # Start background queue processor
        self._queue_processor_task: Optional[asyncio.Task] = None
        self._shutdown = False
        
        logger.info(
            f"Initialized Gemini client with model={self.model_name}, "
            f"rate_limit={self.rate_limit}/min"
        )
    
    async def start_queue_processor(self) -> None:
        """Start the background queue processor."""
        if self._queue_processor_task is None:
            self._queue_processor_task = asyncio.create_task(
                self._process_queue()
            )
            logger.info("Started Gemini request queue processor")
    
    async def stop_queue_processor(self) -> None:
        """Stop the background queue processor."""
        self._shutdown = True
        if self._queue_processor_task:
            await self._queue_processor_task
            self._queue_processor_task = None
            logger.info("Stopped Gemini request queue processor")
    
    async def _process_queue(self) -> None:
        """Background task to process queued requests."""
        while not self._shutdown:
            try:
                # Check if there are queued requests
                if self.request_queue.is_empty():
                    await asyncio.sleep(0.1)
                    continue
                
                # Wait for rate limit token
                await self.token_bucket.wait_for_token()
                
                # Dequeue and process request
                item = await self.request_queue.dequeue()
                if item:
                    request_data, future = item
                    try:
                        result = await self._generate_embedding_internal(
                            request_data["text"]
                        )
                        future.set_result(result)
                    except Exception as e:
                        future.set_exception(e)
            
            except Exception as e:
                logger.error(f"Error in queue processor: {e}")
                await asyncio.sleep(1)
    
    async def _generate_embedding_internal(self, text: str) -> List[float]:
        """Internal method to generate embedding without rate limiting.
        
        Args:
            text: Text to generate embedding for
            
        Returns:
            List of embedding values (768 dimensions)
            
        Raises:
            EmbeddingGenerationError: If embedding generation fails
        """
        try:
            # Use the embedding model
            result = genai.embed_content(
                model=f"models/{self.model_name}",
                content=text,
                task_type="retrieval_document"
            )
            
            # Extract embedding from response
            if isinstance(result, dict) and "embedding" in result:
                embedding = result["embedding"]
            elif hasattr(result, "embedding"):
                embedding = result.embedding
            else:
                raise EmbeddingGenerationError(
                    f"Unexpected response format from Gemini API: {type(result)}"
                )
            
            # Validate embedding dimensions
            if len(embedding) != 768:
                raise EmbeddingGenerationError(
                    f"Expected 768 dimensions, got {len(embedding)}"
                )
            
            return embedding
        
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            raise EmbeddingGenerationError(f"Embedding generation failed: {str(e)}")
    
    async def generate_embedding(
        self,
        text: str,
        wait_if_rate_limited: bool = True
    ) -> List[float]:
        """Generate embedding for text with rate limiting.
        
        Args:
            text: Text to generate embedding for
            wait_if_rate_limited: If True, wait for rate limit; if False, queue request
            
        Returns:
            List of embedding values (768 dimensions)
            
        Raises:
            EmbeddingGenerationError: If embedding generation fails
            RateLimitError: If rate limited and wait_if_rate_limited is False
        """
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")
        
        # Try to acquire rate limit token
        if await self.token_bucket.acquire():
            # Token acquired, generate embedding immediately
            return await self._generate_embedding_internal(text)
        
        # Rate limited
        if wait_if_rate_limited:
            # Wait for token and generate
            await self.token_bucket.wait_for_token()
            return await self._generate_embedding_internal(text)
        else:
            # Queue the request
            logger.info(
                f"Rate limited, queueing request. Queue size: {self.request_queue.size()}"
            )
            
            # Ensure queue processor is running
            await self.start_queue_processor()
            
            # Enqueue request and wait for result
            future = await self.request_queue.enqueue({"text": text})
            return await future
    
    async def generate_code_embedding(self, entity) -> List[float]:
        """Generate embedding for a code entity with formatting.
        
        Formats the entity according to its type:
        - Functions: name, signature, docstring, body (first 500 chars)
        - Classes: name, docstring, method names
        
        Args:
            entity: CodeEntity object to generate embedding for
            
        Returns:
            List of embedding values (768 dimensions)
            
        Raises:
            EmbeddingGenerationError: If embedding generation fails
        """
        from ..models.base import EntityType
        
        # Format entity based on type
        if entity.entity_type == EntityType.FUNCTION:
            # Format function entity
            parts = [f"Function: {entity.name}"]
            
            if entity.signature:
                parts.append(f"Signature: {entity.signature}")
            
            if entity.docstring:
                parts.append(f"Docstring: {entity.docstring}")
            
            if entity.body:
                # Include first 500 characters of body
                body_preview = entity.body[:500]
                parts.append(f"Body: {body_preview}")
            
            text = "\n".join(parts)
        
        elif entity.entity_type == EntityType.CLASS:
            # Format class entity
            parts = [f"Class: {entity.name}"]
            
            if entity.docstring:
                parts.append(f"Docstring: {entity.docstring}")
            
            # Extract method names from body if available
            if entity.body:
                # Simple extraction of method names (lines starting with 'def ')
                method_lines = [
                    line.strip() for line in entity.body.split('\n')
                    if line.strip().startswith('def ')
                ]
                if method_lines:
                    method_names = [
                        line.split('(')[0].replace('def ', '').strip()
                        for line in method_lines
                    ]
                    parts.append(f"Methods: {', '.join(method_names)}")
            
            text = "\n".join(parts)
        
        else:
            # For other entity types, use name and body
            parts = [f"{entity.entity_type.value.capitalize()}: {entity.name}"]
            
            if entity.body:
                body_preview = entity.body[:500]
                parts.append(f"Content: {body_preview}")
            
            text = "\n".join(parts)
        
        # Generate embedding for formatted text
        return await self.generate_embedding(text)
    
    async def generate_query_embedding(self, query: str) -> List[float]:
        """Generate embedding for a search query.
        
        Args:
            query: Search query text
            
        Returns:
            List of embedding values (768 dimensions)
        """
        try:
            # Use retrieval_query task type for queries
            result = genai.embed_content(
                model=f"models/{self.model_name}",
                content=query,
                task_type="retrieval_query"
            )
            
            # Extract embedding from response
            if isinstance(result, dict) and "embedding" in result:
                embedding = result["embedding"]
            elif hasattr(result, "embedding"):
                embedding = result.embedding
            else:
                raise EmbeddingGenerationError(
                    f"Unexpected response format from Gemini API: {type(result)}"
                )
            
            # Validate embedding dimensions
            if len(embedding) != 768:
                raise EmbeddingGenerationError(
                    f"Expected 768 dimensions, got {len(embedding)}"
                )
            
            return embedding
        
        except Exception as e:
            logger.error(f"Failed to generate query embedding: {e}")
            raise EmbeddingGenerationError(f"Query embedding generation failed: {str(e)}")
    
    async def batch_generate_embeddings(
        self,
        texts: List[str],
        batch_size: int = 50
    ) -> List[List[float]]:
        """Generate embeddings for multiple texts in batches.
        
        Args:
            texts: List of texts to generate embeddings for
            batch_size: Number of texts to process in each batch
            
        Returns:
            List of embeddings, one for each input text
            
        Raises:
            EmbeddingGenerationError: If any embedding generation fails
        """
        if not texts:
            return []
        
        embeddings = []
        
        # Process in batches
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            
            # Generate embeddings for batch
            batch_embeddings = []
            for text in batch:
                try:
                    embedding = await self.generate_embedding(text)
                    batch_embeddings.append(embedding)
                except Exception as e:
                    logger.error(f"Failed to generate embedding for text: {e}")
                    raise
            
            embeddings.extend(batch_embeddings)
            
            logger.info(
                f"Generated {len(batch_embeddings)} embeddings "
                f"({len(embeddings)}/{len(texts)} total)"
            )
        
        return embeddings
    
    def get_queue_size(self) -> int:
        """Get the current size of the request queue.
        
        Returns:
            Number of requests in the queue
        """
        return self.request_queue.size()
    
    def get_available_tokens(self) -> float:
        """Get the current number of available rate limit tokens.
        
        Returns:
            Number of available tokens
        """
        return self.token_bucket.get_available_tokens()
    
    async def __aenter__(self):
        """Async context manager entry."""
        await self.start_queue_processor()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.stop_queue_processor()


# Global client instance
_gemini_client: Optional[GeminiClient] = None


def get_gemini_client() -> GeminiClient:
    """Get or create the global Gemini client instance.
    
    Returns:
        GeminiClient instance
    """
    global _gemini_client
    if _gemini_client is None:
        _gemini_client = GeminiClient()
    return _gemini_client


async def shutdown_gemini_client() -> None:
    """Shutdown the global Gemini client instance."""
    global _gemini_client
    if _gemini_client is not None:
        await _gemini_client.stop_queue_processor()
        _gemini_client = None
