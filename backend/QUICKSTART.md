# GraphRAG Backend - Quick Start Guide

## Prerequisites

- Python 3.11+ (Python 3.10 also works)
- Docker and Docker Compose
- Git

## Quick Setup (5 minutes)

### 1. Install Python Dependencies

```bash
cd backend
pip install fastapi uvicorn pydantic pydantic-settings pytest pytest-asyncio
```

### 2. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:
```
GEMINI_API_KEY=your-api-key-here
```

### 3. Start Infrastructure Services

```bash
docker-compose up -d
```

This starts:
- Neo4j (Graph Database)
- Chroma (Vector Database)
- Redis (Cache)
- RabbitMQ (Message Queue)
- PostgreSQL (Chroma metadata)
- ClickHouse (Chroma backend)

### 4. Run Tests

```bash
python -m pytest tests/unit/ -v
```

Expected output: All tests passing ✓

### 5. Start the API Server

```bash
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Access the API

- API: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

## Verify Installation

### Check Health Endpoint

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "environment": "development"
}
```

### Check Docker Services

```bash
docker-compose ps
```

All services should be "Up" and "healthy".

### Access Service UIs

- Neo4j Browser: http://localhost:7474 (neo4j/password)
- RabbitMQ Management: http://localhost:15672 (guest/guest)

## Project Structure

```
backend/
├── src/                    # Source code
│   ├── main.py            # FastAPI app
│   ├── config/            # Configuration
│   ├── models/            # Data models
│   └── utils/             # Utilities
├── tests/                 # Test suite
│   └── unit/             # Unit tests
├── docker-compose.yml    # Infrastructure
├── requirements.txt      # Dependencies
└── .env                  # Configuration
```

## Next Steps

Task 1 (Backend Infrastructure) is complete! ✓

The following are now ready:
- ✓ FastAPI project structure
- ✓ Docker Compose with all services
- ✓ Environment configuration
- ✓ Base models and enums
- ✓ Logging and error handling
- ✓ Unit tests

Next tasks will implement:
- Task 2: Neo4j Graph Service
- Task 3: Chroma Vector Service
- Task 4: Gemini Embedding Generator
- Task 6: Code Parser Service
- Task 7: Upload Service

## Troubleshooting

### Docker services won't start

```bash
# Stop all services
docker-compose down

# Remove volumes and restart
docker-compose down -v
docker-compose up -d
```

### Port conflicts

If ports are already in use, edit `docker-compose.yml` to change port mappings.

### Python version issues

The code works with Python 3.10+. If you have Python 3.11+, that's ideal.

## Development Commands

```bash
# Run tests
python -m pytest tests/unit/ -v

# Start dev server
python -m uvicorn src.main:app --reload

# View Docker logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Support

See the main README.md for detailed documentation.
