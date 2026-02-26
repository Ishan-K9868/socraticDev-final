"""Application settings and configuration management."""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    # Application settings
    app_name: str = "GraphRAG System"
    app_version: str = "0.1.0"
    debug: bool = False
    environment: str = "development"
    
    # API settings
    api_host: str = "0.0.0.0"
    api_port: int = 8002
    api_prefix: str = "/api"
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]
    cors_origin_regex: str = r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"
    
    # Neo4j settings
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "password"
    neo4j_database: str = "neo4j"
    neo4j_max_connection_pool_size: int = 50
    neo4j_connection_timeout: int = 30
    
    # Chroma settings
    chroma_host: str = "localhost"
    chroma_port: int = 8001
    chroma_persist_directory: str = "./chroma_data"
    
    # Redis settings
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    redis_password: Optional[str] = None
    redis_cache_ttl: int = 300  # 5 minutes
    
    # RabbitMQ settings
    rabbitmq_host: str = "localhost"
    rabbitmq_port: int = 5672
    rabbitmq_user: str = "guest"
    rabbitmq_password: str = "guest"
    rabbitmq_vhost: str = "/"
    
    # Celery settings
    celery_broker_url: str = "amqp://guest:guest@localhost:5672/"
    celery_result_backend: str = "redis://localhost:6379/0"
    
    # PostgreSQL settings (for Chroma metadata)
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_user: str = "postgres"
    postgres_password: str = "password"
    postgres_db: str = "chroma"
    
    # Gemini API settings
    gemini_api_key: str = ""
    gemini_embedding_model: str = "text-embedding-004"
    gemini_text_model: str = "gemini-2.0-flash"
    gemini_rate_limit_per_minute: int = 60
    visualizer_ai_fallback_enabled: bool = False
    visualizer_execution_enabled: bool = True
    visualizer_execution_allow_in_production: bool = False
    visualizer_max_code_chars: int = 50000
    visualizer_isolation_mode: str = "subprocess"
    visualizer_default_max_steps: int = 1000
    visualizer_max_steps_cap: int = 5000
    visualizer_default_timeout_ms: int = 3000
    visualizer_max_timeout_ms: int = 10000
    
    # Upload settings
    max_upload_files: int = 10000
    max_files_per_project: int = 10000
    max_file_size_mb: int = 100
    upload_temp_dir: str = "./uploads"
    
    # Processing settings
    parsing_batch_size: int = 100
    embedding_batch_size: int = 50
    
    # Query settings
    default_search_top_k: int = 20
    default_similarity_threshold: float = 0.7
    default_token_budget: int = 8000
    query_timeout_seconds: int = 30
    graph_view_mode_default: str = "file"
    graph_include_external_default: bool = True
    graph_include_isolated_default: bool = True
    
    # Logging settings
    log_level: str = "INFO"
    log_format: str = "json"
    log_file: Optional[str] = None
    
    # JWT settings
    jwt_secret_key: str = "your-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 60


# Global settings instance
settings = Settings()
