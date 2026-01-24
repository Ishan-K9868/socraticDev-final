# GraphRAG System Backend

FastAPI backend for the Graph Retrieval-Augmented Generation (GraphRAG) system.

## Features

- **Code Parsing**: Multi-language AST parsing using Tree-sitter (Python, JavaScript, TypeScript, Java)
- **Graph Database**: Neo4j for storing code structure and relationships
- **Vector Database**: Chroma for semantic code search
- **Caching**: Redis for query result caching
- **Async Processing**: Celery + RabbitMQ for background task processing
- **AI Integration**: Gemini API for embeddings and chat

## Project Structure

```
backend/
├── src/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config/              # Configuration management
│   │   ├── __init__.py
│   │   └── settings.py
│   ├── models/              # Data models
│   │   ├── __init__.py
│   │   ├── base.py          # Core models and enums
│   │   └── api.py           # API request/response models
│   ├── utils/               # Utilities
│   │   ├── __init__.py
│   │   ├── logging.py       # Logging configuration
│   │   └── errors.py        # Custom exceptions
│   ├── services/            # Business logic services (TODO)
│   └── api/                 # API routers (TODO)
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Pytest configuration
│   └── unit/                # Unit tests
├── config/                  # Configuration files
├── docker-compose.yml       # Docker services
├── Dockerfile              # Backend container
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
└── README.md              # This file
```

## Prerequisites

- Python 3.11+
- Docker and Docker Compose
- Gemini API key (for embeddings)

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd backend
```

### 2. Create virtual environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

```bash
cp .env.example .env
# Edit .env and add your configuration
```

Required environment variables:
- `GEMINI_API_KEY`: Your Gemini API key
- Database connection strings (if not using Docker defaults)

### 5. Start infrastructure services

```bash
docker-compose up -d
```

This starts:
- Neo4j (ports 7474, 7687)
- PostgreSQL (port 5432)
- Chroma (port 8001)
- ClickHouse (ports 8123, 9000)
- Redis (port 6379)
- RabbitMQ (ports 5672, 15672)

### 6. Run the application

```bash
# Development mode with auto-reload
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Or using Python
python -m src.main
```

The API will be available at:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Docker Services

### Neo4j
- HTTP: http://localhost:7474
- Bolt: bolt://localhost:7687
- Username: neo4j
- Password: password

### RabbitMQ Management
- UI: http://localhost:15672
- Username: guest
- Password: guest

### Chroma
- API: http://localhost:8001

### Redis
- Port: 6379

## Development

### Running tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/unit/test_config.py

# Run with verbose output
pytest -v
```

### Code formatting

```bash
# Format code with black
black src/ tests/

# Sort imports
isort src/ tests/

# Lint with flake8
flake8 src/ tests/

# Type checking with mypy
mypy src/
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json

## Environment Variables

See `.env.example` for all available configuration options.

Key settings:
- `DEBUG`: Enable debug mode (default: false)
- `LOG_LEVEL`: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- `LOG_FORMAT`: Log format (json, text)
- `MAX_UPLOAD_FILES`: Maximum files per upload (default: 10000)
- `DEFAULT_TOKEN_BUDGET`: Token budget for context retrieval (default: 8000)

## Logging

The application uses structured logging with JSON format by default. Logs include:
- Timestamp
- Log level
- Logger name
- Message
- Request ID (for API requests)
- Additional context (user_id, project_id, etc.)

Configure logging via environment variables:
```bash
LOG_LEVEL=INFO
LOG_FORMAT=json
LOG_FILE=logs/app.log  # Optional file output
```

## Error Handling

The API uses standardized error responses:

```json
{
  "error_code": "PROJECT_NOT_FOUND",
  "message": "Project with ID 'abc123' not found",
  "details": {"project_id": "abc123"},
  "timestamp": "2024-01-01T12:00:00Z",
  "request_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

Error codes:
- `PARSE_ERROR`: Code parsing failed
- `DB_CONNECTION_ERROR`: Database connection failed
- `DB_QUERY_TIMEOUT`: Query exceeded timeout
- `RATE_LIMIT_EXCEEDED`: API rate limit reached
- `INVALID_REQUEST`: Request validation failed
- `PROJECT_NOT_FOUND`: Project does not exist
- `ENTITY_NOT_FOUND`: Entity does not exist
- `FILE_SIZE_EXCEEDED`: Upload exceeds size limit
- `INTERNAL_ERROR`: Unexpected server error

## Health Checks

Health check endpoint: `GET /health`

Returns:
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "environment": "development"
}
```

## Next Steps

This is the initial infrastructure setup. Next tasks will implement:
1. Neo4j Graph Service
2. Chroma Vector Service
3. Code Parser Service
4. Upload Service with async processing
5. Query Service
6. Context Retriever
7. API endpoints

See `.kiro/specs/graphrag-system/tasks.md` for the complete implementation plan.

## License

[Your License Here]
