"""Unit tests for configuration management."""

import pytest
from src.config import settings


def test_settings_loaded():
    """Test that settings are loaded correctly."""
    assert settings.app_name == "GraphRAG System"
    assert settings.app_version == "0.1.0"
    assert isinstance(settings.api_port, int)
    assert settings.api_port > 0


def test_database_connection_config():
    """Test database connection configuration."""
    # Neo4j
    assert settings.neo4j_uri.startswith("bolt://")
    assert settings.neo4j_user is not None
    assert settings.neo4j_password is not None
    
    # Redis
    assert settings.redis_host is not None
    assert settings.redis_port > 0
    
    # PostgreSQL
    assert settings.postgres_host is not None
    assert settings.postgres_port > 0


def test_api_settings():
    """Test API configuration."""
    assert settings.api_host is not None
    assert settings.api_port > 0
    assert settings.api_prefix.startswith("/")
    assert isinstance(settings.cors_origins, list)


def test_upload_limits():
    """Test upload limit configuration."""
    assert settings.max_upload_files > 0
    assert settings.max_file_size_mb > 0
    assert settings.upload_temp_dir is not None


def test_query_settings():
    """Test query configuration."""
    assert settings.default_search_top_k > 0
    assert 0 < settings.default_similarity_threshold <= 1.0
    assert settings.default_token_budget > 0
    assert settings.query_timeout_seconds > 0


def test_logging_settings():
    """Test logging configuration."""
    assert settings.log_level in ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
    assert settings.log_format in ["json", "text"]
