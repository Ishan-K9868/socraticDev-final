"""Unit tests for Gemini API client with rate limiting."""

import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from typing import List

from src.services.gemini_client import (
    GeminiClient,
    TokenBucket,
    RequestQueue,
    get_gemini_client,
    shutdown_gemini_client
)
from src.utils.errors import EmbeddingGenerationError


class TestTokenBucket:
    """Tests for TokenBucket rate limiter."""
    
    @pytest.mark.asyncio
    async def test_token_bucket_initialization(self):
        """Test token bucket initializes with correct capacity."""
        bucket = TokenBucket(rate_per_minute=60)
        
        assert bucket.capacity == 60
        assert bucket.tokens == 60
        assert bucket.rate_per_second == 1.0
    
    @pytest.mark.asyncio
    async def test_acquire_token_success(self):
        """Test acquiring token when bucket has tokens."""
        bucket = TokenBucket(rate_per_minute=60)
        
        result = await bucket.acquire(1)
        
        assert result is True
        assert bucket.tokens == 59
    
    @pytest.mark.asyncio
    async def test_acquire_token_failure(self):
        """Test acquiring token when bucket is empty."""
        bucket = TokenBucket(rate_per_minute=60)
        bucket.tokens = 0
        
        result = await bucket.acquire(1)
        
        assert result is False
    
    @pytest.mark.asyncio
    async def test_token_refill_over_time(self):
        """Test tokens refill over time."""
        bucket = TokenBucket(rate_per_minute=60)
        bucket.tokens = 0
        
        # Wait for tokens to refill
        await asyncio.sleep(1.1)
        
        result = await bucket.acquire(1)
        assert result is True
    
    @pytest.mark.asyncio
    async def test_wait_for_token(self):
        """Test waiting for token when bucket is empty."""
        bucket = TokenBucket(rate_per_minute=60)
        bucket.tokens = 0
        
        # This should wait and then succeed
        await bucket.wait_for_token()
        
        # Token should have been acquired
        assert bucket.tokens < 60
    
    @pytest.mark.asyncio
    async def test_get_available_tokens(self):
        """Test getting available tokens."""
        bucket = TokenBucket(rate_per_minute=60)
        
        available = bucket.get_available_tokens()
        
        assert available == 60


class TestRequestQueue:
    """Tests for RequestQueue."""
    
    @pytest.mark.asyncio
    async def test_queue_initialization(self):
        """Test queue initializes empty."""
        queue = RequestQueue()
        
        assert queue.is_empty() is True
        assert queue.size() == 0
    
    @pytest.mark.asyncio
    async def test_enqueue_request(self):
        """Test enqueueing a request."""
        queue = RequestQueue()
        
        future = await queue.enqueue({"text": "test"})
        
        assert queue.size() == 1
        assert queue.is_empty() is False
        assert isinstance(future, asyncio.Future)
    
    @pytest.mark.asyncio
    async def test_dequeue_request(self):
        """Test dequeueing a request."""
        queue = RequestQueue()
        
        future = await queue.enqueue({"text": "test"})
        item = await queue.dequeue()
        
        assert item is not None
        request_data, returned_future = item
        assert request_data == {"text": "test"}
        assert returned_future is future
        assert queue.is_empty() is True
    
    @pytest.mark.asyncio
    async def test_dequeue_empty_queue(self):
        """Test dequeueing from empty queue."""
        queue = RequestQueue()
        
        item = await queue.dequeue()
        
        assert item is None


class TestGeminiClient:
    """Tests for GeminiClient."""
    
    @pytest.fixture
    def mock_genai(self):
        """Mock google.generativeai module."""
        with patch('src.services.gemini_client.genai') as mock:
            yield mock
    
    @pytest.fixture
    def client(self, mock_genai):
        """Create a GeminiClient instance for testing."""
        return GeminiClient(
            api_key="test-api-key",
            model_name="text-embedding-004",
            rate_limit_per_minute=60
        )
    
    def test_client_initialization(self, client, mock_genai):
        """Test client initializes correctly."""
        assert client.api_key == "test-api-key"
        assert client.model_name == "text-embedding-004"
        assert client.rate_limit == 60
        assert client.token_bucket is not None
        assert client.request_queue is not None
        
        # Verify genai.configure was called
        mock_genai.configure.assert_called_once_with(api_key="test-api-key")
    
    def test_client_initialization_without_api_key(self, mock_genai):
        """Test client raises error without API key."""
        with patch('src.services.gemini_client.settings') as mock_settings:
            mock_settings.gemini_api_key = ""
            mock_settings.gemini_embedding_model = "text-embedding-004"
            mock_settings.gemini_rate_limit_per_minute = 60
            
            with pytest.raises(ValueError, match="Gemini API key is required"):
                GeminiClient()
    
    @pytest.mark.asyncio
    async def test_generate_embedding_success(self, client, mock_genai):
        """Test generating embedding successfully."""
        # Mock the API response
        mock_embedding = [0.1] * 768
        mock_genai.embed_content.return_value = {"embedding": mock_embedding}
        
        result = await client.generate_embedding("test text")
        
        assert result == mock_embedding
        assert len(result) == 768
        
        # Verify API was called correctly
        mock_genai.embed_content.assert_called_once_with(
            model="models/text-embedding-004",
            content="test text",
            task_type="retrieval_document"
        )
    
    @pytest.mark.asyncio
    async def test_generate_embedding_with_object_response(self, client, mock_genai):
        """Test generating embedding with object response."""
        # Mock the API response as an object
        mock_embedding = [0.1] * 768
        mock_response = Mock()
        mock_response.embedding = mock_embedding
        mock_genai.embed_content.return_value = mock_response
        
        result = await client.generate_embedding("test text")
        
        assert result == mock_embedding
        assert len(result) == 768
    
    @pytest.mark.asyncio
    async def test_generate_embedding_empty_text(self, client, mock_genai):
        """Test generating embedding with empty text raises error."""
        with pytest.raises(ValueError, match="Text cannot be empty"):
            await client.generate_embedding("")
    
    @pytest.mark.asyncio
    async def test_generate_embedding_wrong_dimensions(self, client, mock_genai):
        """Test generating embedding with wrong dimensions raises error."""
        # Mock the API response with wrong dimensions
        mock_embedding = [0.1] * 512  # Wrong size
        mock_genai.embed_content.return_value = {"embedding": mock_embedding}
        
        with pytest.raises(EmbeddingGenerationError, match="Expected 768 dimensions"):
            await client.generate_embedding("test text")
    
    @pytest.mark.asyncio
    async def test_generate_embedding_api_error(self, client, mock_genai):
        """Test generating embedding when API fails."""
        # Mock API error
        mock_genai.embed_content.side_effect = Exception("API error")
        
        with pytest.raises(EmbeddingGenerationError, match="Embedding generation failed"):
            await client.generate_embedding("test text")
    
    @pytest.mark.asyncio
    async def test_generate_query_embedding(self, client, mock_genai):
        """Test generating query embedding."""
        # Mock the API response
        mock_embedding = [0.1] * 768
        mock_genai.embed_content.return_value = {"embedding": mock_embedding}
        
        result = await client.generate_query_embedding("test query")
        
        assert result == mock_embedding
        assert len(result) == 768
        
        # Verify API was called with retrieval_query task type
        mock_genai.embed_content.assert_called_once_with(
            model="models/text-embedding-004",
            content="test query",
            task_type="retrieval_query"
        )
    
    @pytest.mark.asyncio
    async def test_rate_limiting(self, client, mock_genai):
        """Test rate limiting prevents too many requests."""
        # Mock the API response
        mock_embedding = [0.1] * 768
        mock_genai.embed_content.return_value = {"embedding": mock_embedding}
        
        # Set rate limit to 2 per minute
        client.token_bucket = TokenBucket(rate_per_minute=2)
        
        # First two requests should succeed immediately
        await client.generate_embedding("text 1")
        await client.generate_embedding("text 2")
        
        # Third request should be queued (not wait)
        start_time = asyncio.get_event_loop().time()
        
        # Start queue processor
        await client.start_queue_processor()
        
        # This should queue the request
        result = await client.generate_embedding("text 3", wait_if_rate_limited=False)
        
        end_time = asyncio.get_event_loop().time()
        
        # Should have been queued and processed
        assert result == mock_embedding
        
        # Clean up
        await client.stop_queue_processor()
    
    @pytest.mark.asyncio
    async def test_batch_generate_embeddings(self, client, mock_genai):
        """Test batch embedding generation."""
        # Mock the API response
        mock_embedding = [0.1] * 768
        mock_genai.embed_content.return_value = {"embedding": mock_embedding}
        
        texts = ["text 1", "text 2", "text 3"]
        results = await client.batch_generate_embeddings(texts, batch_size=2)
        
        assert len(results) == 3
        assert all(len(emb) == 768 for emb in results)
        assert mock_genai.embed_content.call_count == 3
    
    @pytest.mark.asyncio
    async def test_batch_generate_embeddings_empty_list(self, client, mock_genai):
        """Test batch embedding generation with empty list."""
        results = await client.batch_generate_embeddings([])
        
        assert results == []
        assert mock_genai.embed_content.call_count == 0
    
    @pytest.mark.asyncio
    async def test_batch_generate_embeddings_error(self, client, mock_genai):
        """Test batch embedding generation with error."""
        # Mock API error on second call
        mock_embedding = [0.1] * 768
        mock_genai.embed_content.side_effect = [
            {"embedding": mock_embedding},
            Exception("API error")
        ]
        
        texts = ["text 1", "text 2"]
        
        with pytest.raises(EmbeddingGenerationError):
            await client.batch_generate_embeddings(texts)
    
    @pytest.mark.asyncio
    async def test_queue_processor_start_stop(self, client):
        """Test starting and stopping queue processor."""
        await client.start_queue_processor()
        
        assert client._queue_processor_task is not None
        assert not client._shutdown
        
        await client.stop_queue_processor()
        
        assert client._shutdown is True
    
    @pytest.mark.asyncio
    async def test_context_manager(self, client, mock_genai):
        """Test using client as async context manager."""
        async with client as c:
            assert c._queue_processor_task is not None
        
        assert client._shutdown is True
    
    def test_get_queue_size(self, client):
        """Test getting queue size."""
        assert client.get_queue_size() == 0
    
    def test_get_available_tokens(self, client):
        """Test getting available tokens."""
        tokens = client.get_available_tokens()
        assert tokens > 0


class TestGlobalClient:
    """Tests for global client functions."""
    
    @pytest.mark.asyncio
    async def test_get_gemini_client(self):
        """Test getting global client instance."""
        with patch('src.services.gemini_client.GeminiClient') as mock_client_class:
            mock_instance = Mock()
            mock_client_class.return_value = mock_instance
            
            # Reset global client
            import src.services.gemini_client as gc
            gc._gemini_client = None
            
            client1 = get_gemini_client()
            client2 = get_gemini_client()
            
            # Should return same instance
            assert client1 is client2
            
            # Should only create once
            assert mock_client_class.call_count == 1
    
    @pytest.mark.asyncio
    async def test_shutdown_gemini_client(self):
        """Test shutting down global client."""
        with patch('src.services.gemini_client.GeminiClient') as mock_client_class:
            mock_instance = AsyncMock()
            mock_client_class.return_value = mock_instance
            
            # Reset global client
            import src.services.gemini_client as gc
            gc._gemini_client = None
            
            # Get client
            client = get_gemini_client()
            
            # Shutdown
            await shutdown_gemini_client()
            
            # Should call stop_queue_processor
            mock_instance.stop_queue_processor.assert_called_once()
            
            # Global client should be None
            assert gc._gemini_client is None


class TestCodeEmbedding:
    """Tests for generate_code_embedding method."""
    
    @pytest.fixture
    def mock_genai(self):
        """Mock google.generativeai module."""
        with patch('src.services.gemini_client.genai') as mock:
            yield mock
    
    @pytest.fixture
    def client(self, mock_genai):
        """Create a GeminiClient instance for testing."""
        return GeminiClient(
            api_key="test-api-key",
            model_name="text-embedding-004",
            rate_limit_per_minute=60
        )
    
    @pytest.mark.asyncio
    async def test_generate_code_embedding_function(self, client, mock_genai):
        """Test generating embedding for a function entity."""
        from src.models.base import CodeEntity, EntityType, Language
        
        # Create a function entity
        entity = CodeEntity(
            project_id="test-project",
            entity_type=EntityType.FUNCTION,
            name="calculate_sum",
            file_path="test.py",
            start_line=1,
            end_line=5,
            signature="def calculate_sum(a: int, b: int) -> int",
            docstring="Calculate the sum of two numbers.",
            body="def calculate_sum(a: int, b: int) -> int:\n    return a + b",
            language=Language.PYTHON
        )
        
        # Mock the API response
        mock_embedding = [0.1] * 768
        mock_genai.embed_content.return_value = {"embedding": mock_embedding}
        
        result = await client.generate_code_embedding(entity)
        
        assert result == mock_embedding
        assert len(result) == 768
        
        # Verify the formatted text includes all parts
        call_args = mock_genai.embed_content.call_args
        formatted_text = call_args[1]["content"]
        assert "Function: calculate_sum" in formatted_text
        assert "Signature: def calculate_sum(a: int, b: int) -> int" in formatted_text
        assert "Docstring: Calculate the sum of two numbers." in formatted_text
        assert "Body:" in formatted_text
    
    @pytest.mark.asyncio
    async def test_generate_code_embedding_function_without_docstring(self, client, mock_genai):
        """Test generating embedding for a function without docstring."""
        from src.models.base import CodeEntity, EntityType, Language
        
        entity = CodeEntity(
            project_id="test-project",
            entity_type=EntityType.FUNCTION,
            name="helper",
            file_path="test.py",
            start_line=1,
            end_line=3,
            signature="def helper(x)",
            body="def helper(x):\n    return x * 2",
            language=Language.PYTHON
        )
        
        # Mock the API response
        mock_embedding = [0.1] * 768
        mock_genai.embed_content.return_value = {"embedding": mock_embedding}
        
        result = await client.generate_code_embedding(entity)
        
        assert result == mock_embedding
        
        # Verify the formatted text
        call_args = mock_genai.embed_content.call_args
        formatted_text = call_args[1]["content"]
        assert "Function: helper" in formatted_text
        assert "Signature: def helper(x)" in formatted_text
        assert "Docstring:" not in formatted_text  # No docstring
    
    @pytest.mark.asyncio
    async def test_generate_code_embedding_class(self, client, mock_genai):
        """Test generating embedding for a class entity."""
        from src.models.base import CodeEntity, EntityType, Language
        
        entity = CodeEntity(
            project_id="test-project",
            entity_type=EntityType.CLASS,
            name="Calculator",
            file_path="test.py",
            start_line=1,
            end_line=10,
            docstring="A simple calculator class.",
            body="class Calculator:\n    def add(self, a, b):\n        return a + b\n    def subtract(self, a, b):\n        return a - b",
            language=Language.PYTHON
        )
        
        # Mock the API response
        mock_embedding = [0.1] * 768
        mock_genai.embed_content.return_value = {"embedding": mock_embedding}
        
        result = await client.generate_code_embedding(entity)
        
        assert result == mock_embedding
        assert len(result) == 768
        
        # Verify the formatted text includes class info and methods
        call_args = mock_genai.embed_content.call_args
        formatted_text = call_args[1]["content"]
        assert "Class: Calculator" in formatted_text
        assert "Docstring: A simple calculator class." in formatted_text
        assert "Methods:" in formatted_text
        assert "add" in formatted_text
        assert "subtract" in formatted_text
    
    @pytest.mark.asyncio
    async def test_generate_code_embedding_class_without_methods(self, client, mock_genai):
        """Test generating embedding for a class without methods."""
        from src.models.base import CodeEntity, EntityType, Language
        
        entity = CodeEntity(
            project_id="test-project",
            entity_type=EntityType.CLASS,
            name="EmptyClass",
            file_path="test.py",
            start_line=1,
            end_line=2,
            docstring="An empty class.",
            body="class EmptyClass:\n    pass",
            language=Language.PYTHON
        )
        
        # Mock the API response
        mock_embedding = [0.1] * 768
        mock_genai.embed_content.return_value = {"embedding": mock_embedding}
        
        result = await client.generate_code_embedding(entity)
        
        assert result == mock_embedding
        
        # Verify the formatted text
        call_args = mock_genai.embed_content.call_args
        formatted_text = call_args[1]["content"]
        assert "Class: EmptyClass" in formatted_text
        assert "Docstring: An empty class." in formatted_text
    
    @pytest.mark.asyncio
    async def test_generate_code_embedding_variable(self, client, mock_genai):
        """Test generating embedding for a variable entity."""
        from src.models.base import CodeEntity, EntityType, Language
        
        entity = CodeEntity(
            project_id="test-project",
            entity_type=EntityType.VARIABLE,
            name="MAX_SIZE",
            file_path="test.py",
            start_line=1,
            end_line=1,
            body="MAX_SIZE = 1000",
            language=Language.PYTHON
        )
        
        # Mock the API response
        mock_embedding = [0.1] * 768
        mock_genai.embed_content.return_value = {"embedding": mock_embedding}
        
        result = await client.generate_code_embedding(entity)
        
        assert result == mock_embedding
        
        # Verify the formatted text
        call_args = mock_genai.embed_content.call_args
        formatted_text = call_args[1]["content"]
        assert "Variable: MAX_SIZE" in formatted_text
        assert "Content: MAX_SIZE = 1000" in formatted_text
    
    @pytest.mark.asyncio
    async def test_generate_code_embedding_long_body(self, client, mock_genai):
        """Test generating embedding for entity with long body (>500 chars)."""
        from src.models.base import CodeEntity, EntityType, Language
        
        # Create a long body (>500 characters)
        long_body = "def long_function():\n" + "    # comment\n" * 100
        
        entity = CodeEntity(
            project_id="test-project",
            entity_type=EntityType.FUNCTION,
            name="long_function",
            file_path="test.py",
            start_line=1,
            end_line=100,
            signature="def long_function()",
            body=long_body,
            language=Language.PYTHON
        )
        
        # Mock the API response
        mock_embedding = [0.1] * 768
        mock_genai.embed_content.return_value = {"embedding": mock_embedding}
        
        result = await client.generate_code_embedding(entity)
        
        assert result == mock_embedding
        
        # Verify the body is truncated to 500 characters
        call_args = mock_genai.embed_content.call_args
        formatted_text = call_args[1]["content"]
        body_section = formatted_text.split("Body: ")[1]
        assert len(body_section) <= 500
    
    @pytest.mark.asyncio
    async def test_generate_code_embedding_import(self, client, mock_genai):
        """Test generating embedding for an import entity."""
        from src.models.base import CodeEntity, EntityType, Language
        
        entity = CodeEntity(
            project_id="test-project",
            entity_type=EntityType.IMPORT,
            name="os",
            file_path="test.py",
            start_line=1,
            end_line=1,
            body="import os",
            language=Language.PYTHON
        )
        
        # Mock the API response
        mock_embedding = [0.1] * 768
        mock_genai.embed_content.return_value = {"embedding": mock_embedding}
        
        result = await client.generate_code_embedding(entity)
        
        assert result == mock_embedding
        
        # Verify the formatted text
        call_args = mock_genai.embed_content.call_args
        formatted_text = call_args[1]["content"]
        assert "Import: os" in formatted_text
        assert "Content: import os" in formatted_text
    
    @pytest.mark.asyncio
    async def test_generate_code_embedding_file(self, client, mock_genai):
        """Test generating embedding for a file entity."""
        from src.models.base import CodeEntity, EntityType, Language
        
        entity = CodeEntity(
            project_id="test-project",
            entity_type=EntityType.FILE,
            name="main.py",
            file_path="src/main.py",
            start_line=1,
            end_line=50,
            body="# Main module\nimport os\n\ndef main():\n    pass",
            language=Language.PYTHON
        )
        
        # Mock the API response
        mock_embedding = [0.1] * 768
        mock_genai.embed_content.return_value = {"embedding": mock_embedding}
        
        result = await client.generate_code_embedding(entity)
        
        assert result == mock_embedding
        
        # Verify the formatted text
        call_args = mock_genai.embed_content.call_args
        formatted_text = call_args[1]["content"]
        assert "File: main.py" in formatted_text
        assert "Content:" in formatted_text
    
    @pytest.mark.asyncio
    async def test_generate_code_embedding_error(self, client, mock_genai):
        """Test error handling in generate_code_embedding."""
        from src.models.base import CodeEntity, EntityType, Language
        
        entity = CodeEntity(
            project_id="test-project",
            entity_type=EntityType.FUNCTION,
            name="test_func",
            file_path="test.py",
            start_line=1,
            end_line=3,
            body="def test_func(): pass",
            language=Language.PYTHON
        )
        
        # Mock API error
        mock_genai.embed_content.side_effect = Exception("API error")
        
        with pytest.raises(EmbeddingGenerationError):
            await client.generate_code_embedding(entity)


class TestEdgeCases:
    """Tests for edge cases and error conditions."""
    
    @pytest.fixture
    def mock_genai(self):
        """Mock google.generativeai module."""
        with patch('src.services.gemini_client.genai') as mock:
            yield mock
    
    @pytest.mark.asyncio
    async def test_concurrent_requests(self, mock_genai):
        """Test handling concurrent requests."""
        client = GeminiClient(
            api_key="test-api-key",
            rate_limit_per_minute=60
        )
        
        # Mock the API response
        mock_embedding = [0.1] * 768
        mock_genai.embed_content.return_value = {"embedding": mock_embedding}
        
        # Make concurrent requests
        tasks = [
            client.generate_embedding(f"text {i}")
            for i in range(10)
        ]
        
        results = await asyncio.gather(*tasks)
        
        assert len(results) == 10
        assert all(len(emb) == 768 for emb in results)
    
    @pytest.mark.asyncio
    async def test_unexpected_response_format(self, mock_genai):
        """Test handling unexpected response format."""
        client = GeminiClient(
            api_key="test-api-key",
            rate_limit_per_minute=60
        )
        
        # Mock unexpected response
        mock_genai.embed_content.return_value = "unexpected"
        
        with pytest.raises(EmbeddingGenerationError, match="Unexpected response format"):
            await client.generate_embedding("test text")
