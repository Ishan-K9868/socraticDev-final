"""Integration tests for embedding generation workflow."""

import pytest
from unittest.mock import patch

from src.services.gemini_client import GeminiClient
from src.models.base import CodeEntity, EntityType, Language


class TestEmbeddingGenerationWorkflow:
    """Integration tests for complete embedding generation workflow."""
    
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
    async def test_complete_embedding_workflow(self, client, mock_genai):
        """Test complete workflow: raw text, code entity, and batch generation."""
        # Mock the API response
        mock_embedding = [0.1] * 768
        mock_genai.embed_content.return_value = {"embedding": mock_embedding}
        
        # 1. Generate embedding for raw text
        text_embedding = await client.generate_embedding("test text")
        assert len(text_embedding) == 768
        
        # 2. Generate embedding for code entity
        entity = CodeEntity(
            project_id="test-project",
            entity_type=EntityType.FUNCTION,
            name="test_function",
            file_path="test.py",
            start_line=1,
            end_line=5,
            signature="def test_function(x: int) -> int",
            docstring="Test function.",
            body="def test_function(x: int) -> int:\n    return x * 2",
            language=Language.PYTHON
        )
        
        code_embedding = await client.generate_code_embedding(entity)
        assert len(code_embedding) == 768
        
        # 3. Generate embeddings in batch
        texts = ["text 1", "text 2", "text 3"]
        batch_embeddings = await client.batch_generate_embeddings(texts)
        assert len(batch_embeddings) == 3
        assert all(len(emb) == 768 for emb in batch_embeddings)
        
        # Verify all methods were called
        assert mock_genai.embed_content.call_count == 5  # 1 + 1 + 3
    
    @pytest.mark.asyncio
    async def test_multiple_entity_types(self, client, mock_genai):
        """Test generating embeddings for different entity types."""
        # Mock the API response
        mock_embedding = [0.1] * 768
        mock_genai.embed_content.return_value = {"embedding": mock_embedding}
        
        # Create entities of different types
        entities = [
            CodeEntity(
                project_id="test-project",
                entity_type=EntityType.FUNCTION,
                name="my_function",
                file_path="test.py",
                start_line=1,
                end_line=3,
                signature="def my_function()",
                body="def my_function(): pass",
                language=Language.PYTHON
            ),
            CodeEntity(
                project_id="test-project",
                entity_type=EntityType.CLASS,
                name="MyClass",
                file_path="test.py",
                start_line=5,
                end_line=10,
                docstring="A test class.",
                body="class MyClass:\n    def method(self): pass",
                language=Language.PYTHON
            ),
            CodeEntity(
                project_id="test-project",
                entity_type=EntityType.VARIABLE,
                name="MY_CONSTANT",
                file_path="test.py",
                start_line=12,
                end_line=12,
                body="MY_CONSTANT = 42",
                language=Language.PYTHON
            )
        ]
        
        # Generate embeddings for all entities
        embeddings = []
        for entity in entities:
            embedding = await client.generate_code_embedding(entity)
            embeddings.append(embedding)
        
        # Verify all embeddings were generated
        assert len(embeddings) == 3
        assert all(len(emb) == 768 for emb in embeddings)
        assert mock_genai.embed_content.call_count == 3
    
    @pytest.mark.asyncio
    async def test_embedding_format_validation(self, client, mock_genai):
        """Test that embeddings are formatted correctly for different entity types."""
        # Mock the API response
        mock_embedding = [0.1] * 768
        mock_genai.embed_content.return_value = {"embedding": mock_embedding}
        
        # Test function formatting
        function_entity = CodeEntity(
            project_id="test-project",
            entity_type=EntityType.FUNCTION,
            name="calculate",
            file_path="test.py",
            start_line=1,
            end_line=5,
            signature="def calculate(a, b)",
            docstring="Calculate something.",
            body="def calculate(a, b):\n    return a + b",
            language=Language.PYTHON
        )
        
        await client.generate_code_embedding(function_entity)
        
        # Verify the formatted text
        call_args = mock_genai.embed_content.call_args
        formatted_text = call_args[1]["content"]
        
        # Check all required parts are present
        assert "Function: calculate" in formatted_text
        assert "Signature: def calculate(a, b)" in formatted_text
        assert "Docstring: Calculate something." in formatted_text
        assert "Body:" in formatted_text
        
        # Test class formatting
        mock_genai.embed_content.reset_mock()
        
        class_entity = CodeEntity(
            project_id="test-project",
            entity_type=EntityType.CLASS,
            name="Calculator",
            file_path="test.py",
            start_line=1,
            end_line=10,
            docstring="A calculator class.",
            body="class Calculator:\n    def add(self, a, b):\n        return a + b",
            language=Language.PYTHON
        )
        
        await client.generate_code_embedding(class_entity)
        
        # Verify the formatted text
        call_args = mock_genai.embed_content.call_args
        formatted_text = call_args[1]["content"]
        
        # Check all required parts are present
        assert "Class: Calculator" in formatted_text
        assert "Docstring: A calculator class." in formatted_text
        assert "Methods:" in formatted_text
        assert "add" in formatted_text
