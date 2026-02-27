# GraphRAG System Deployment Guide

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Deployment](#deployment)
5. [API Usage](#api-usage)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

## System Requirements

### Hardware Requirements
- **CPU**: 4+ cores recommended
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 50GB+ for databases and embeddings
- **Network**: Stable internet connection for Gemini API

### Software Requirements
- **Docker**: 20.10+ and Docker Compose 2.0+
- **Python**: 3.9+ (for local development)
- **Node.js**: 16+ (for frontend)

### External Services
- **Google Gemini API**: API key required for embeddings
- **Neo4j**: Graph database (included in Docker Compose)
- **ChromaDB**: Vector database (included in Docker Compose)
- **Redis**: Cache layer (included in Docker Compose)
- **RabbitMQ**: Message broker (included in Docker Compose)
- **PostgreSQL**: Metadata storage (included in Docker Compose)

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd graphrag-system
```

### 2. Set Up Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=text-embedding-004
GEMINI_RATE_LIMIT=1500  # requests per minute

# Neo4j Configuration
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_secure_password
NEO4J_DATABASE=neo4j

# ChromaDB Configuration
CHROMA_HOST=chroma
CHROMA_PORT=8000
CHROMA_PERSIST_DIRECTORY=/chroma/data

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=your_redis_password

# RabbitMQ Configuration
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=your_rabbitmq_password

# PostgreSQL Configuration (for Chroma)
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=chroma
POSTGRES_USER=chroma
POSTGRES_PASSWORD=your_postgres_password

# Celery Configuration
CELERY_BROKER_URL=amqp://admin:your_rabbitmq_password@rabbitmq:5672//
CELERY_RESULT_BACKEND=redis://:your_redis_password@redis:6379/1

# Upload Configuration
MAX_UPLOAD_SIZE=104857600  # 100MB
MAX_FILES_PER_PROJECT=10000

# Token Budget
DEFAULT_TOKEN_BUDGET=8000
MAX_TOKEN_BUDGET=32000

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# JWT Authentication
JWT_SECRET_KEY=your_jwt_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440  # 24 hours

# Logging
LOG_LEVEL=INFO
```

### 3. Install Dependencies

#### Backend
```bash
cd backend
pip install -r requirements.txt
```

#### Frontend
```bash
cd frontend
npm install
```

## Configuration

### Database Optimization

The system includes several database optimizations. Review `backend/OPTIMIZATION_GUIDE.md` for:
- Neo4j index recommendations
- Query optimization strategies
- Connection pooling configuration
- Cache tuning

### Connection Pooling

Connection pools are pre-configured:
- **Neo4j**: Max 50 connections
- **Redis**: Connection pooling with health checks
- **PostgreSQL**: Default pooling via SQLAlchemy

Adjust in `backend/src/config/settings.py` if needed.

### Rate Limiting

Gemini API rate limiting is configured via token bucket algorithm:
- Default: 1500 requests/minute
- Configurable via `GEMINI_RATE_LIMIT` environment variable

## Deployment

### AWS Load Balancer Choice (Important)

- For this project, use an **Application Load Balancer (ALB)** in front of backend services.
- Do **not** use API Gateway for upload endpoints, because API Gateway request payload limits are too small for the current upload flow.
- Keep uploads routed through ALB -> backend service.

### Development Deployment

```bash
cd backend
docker-compose up -d
```

This starts:
- FastAPI backend (port 8000)
- Neo4j (ports 7474, 7687)
- ChromaDB (port 8001)
- Redis (port 6379)
- RabbitMQ (ports 5672, 15672)
- PostgreSQL (port 5432)
- Celery worker

### Production Deployment

```bash
cd backend
docker-compose -f docker-compose.prod.yml up -d
```

Production configuration includes:
- Resource limits for all services
- Health checks
- Restart policies
- Volume persistence
- Network isolation

### Scaling

#### Scale Celery Workers
```bash
docker-compose -f docker-compose.prod.yml up -d --scale celery-worker=4
```

#### Scale API Workers
Adjust `API_WORKERS` in `.env` file.

### Health Checks

The system provides health check endpoints:

```bash
# Basic health check
curl http://localhost:8000/health

# Detailed health check
curl http://localhost:8000/health/detailed

# Metrics
curl http://localhost:8000/health/metrics
```

## API Usage

### Authentication

Most endpoints require JWT authentication:

```bash
# Get access token (implement your auth endpoint)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "password": "pass"}'

# Use token in requests
curl -X GET http://localhost:8000/api/projects \
  -H "Authorization: Bearer <your_token>"
```

### Upload Project

#### From Local Files
```bash
curl -X POST http://localhost:8000/api/upload/project \
  -H "Authorization: Bearer <token>" \
  -F "files=@file1.py" \
  -F "files=@file2.py" \
  -F "project_name=my-project"
```

#### From GitHub
```bash
curl -X POST http://localhost:8000/api/upload/github \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "github_url": "https://github.com/user/repo",
    "project_name": "my-project"
  }'
```

#### Check Upload Status
```bash
curl -X GET http://localhost:8000/api/upload/status/<session_id> \
  -H "Authorization: Bearer <token>"
```

### Query Operations

#### Semantic Search
```bash
curl -X POST http://localhost:8000/api/query/search \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "project-uuid",
    "query": "authentication logic",
    "limit": 20
  }'
```

#### Find Callers
```bash
curl -X POST http://localhost:8000/api/query/callers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "project-uuid",
    "entity_name": "MyClass.myMethod"
  }'
```

#### Find Dependencies
```bash
curl -X POST http://localhost:8000/api/query/dependencies \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "project-uuid",
    "entity_name": "MyClass.myMethod"
  }'
```

#### Impact Analysis
```bash
curl -X POST http://localhost:8000/api/query/impact \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "project-uuid",
    "entity_name": "MyClass.myMethod"
  }'
```

#### Context Retrieval
```bash
curl -X POST http://localhost:8000/api/query/context \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "project-uuid",
    "query": "how does authentication work",
    "token_budget": 8000
  }'
```

### Project Management

#### List Projects
```bash
curl -X GET http://localhost:8000/api/projects \
  -H "Authorization: Bearer <token>"
```

#### Get Project Details
```bash
curl -X GET http://localhost:8000/api/projects/<project_id> \
  -H "Authorization: Bearer <token>"
```

#### Update Project
```bash
curl -X PUT http://localhost:8000/api/projects/<project_id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "updated-name"
  }'
```

#### Delete Project
```bash
curl -X DELETE http://localhost:8000/api/projects/<project_id> \
  -H "Authorization: Bearer <token>"
```

### Graph Visualization
```bash
curl -X POST http://localhost:8000/api/visualization/graph \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "project-uuid",
    "entity_name": "MyClass",
    "depth": 2
  }'
```

### API Documentation

Interactive API documentation is available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Monitoring

### Logs

View logs for each service:

```bash
# API logs
docker-compose logs -f api

# Celery worker logs
docker-compose logs -f celery-worker

# Neo4j logs
docker-compose logs -f neo4j

# All logs
docker-compose logs -f
```

### Metrics

Access metrics via health endpoints:

```bash
curl http://localhost:8000/health/metrics
```

Returns:
- Cache hit rate
- Cache size
- Query performance metrics
- Service status

### RabbitMQ Management

Access RabbitMQ management UI:
- URL: http://localhost:15672
- Default credentials: admin / your_rabbitmq_password

### Neo4j Browser

Access Neo4j browser:
- URL: http://localhost:7474
- Credentials: neo4j / your_secure_password

## Troubleshooting

### Common Issues

#### 1. Gemini API Rate Limiting
**Symptom**: 429 errors in logs
**Solution**: 
- Reduce `GEMINI_RATE_LIMIT` in `.env`
- Increase delay between requests
- Check Gemini API quota

#### 2. Out of Memory
**Symptom**: Services crashing, OOM errors
**Solution**:
- Increase Docker memory limits
- Reduce `API_WORKERS` count
- Scale down Celery workers
- Optimize query complexity

#### 3. Slow Queries
**Symptom**: Timeouts, slow responses
**Solution**:
- Review `OPTIMIZATION_GUIDE.md`
- Add missing Neo4j indexes
- Enable query caching
- Reduce query depth

#### 4. Connection Errors
**Symptom**: Cannot connect to databases
**Solution**:
- Check service health: `docker-compose ps`
- Verify network connectivity
- Check firewall rules
- Review connection pool settings

#### 5. Upload Failures
**Symptom**: Upload stuck or fails
**Solution**:
- Check Celery worker logs
- Verify RabbitMQ is running
- Check file size limits
- Ensure sufficient disk space

### Debug Mode

Enable debug logging:

```bash
# In .env
LOG_LEVEL=DEBUG
```

Restart services:
```bash
docker-compose restart api celery-worker
```

### Database Maintenance

#### Backup Neo4j
```bash
docker exec neo4j neo4j-admin dump --database=neo4j --to=/backups/neo4j-backup.dump
```

#### Backup ChromaDB
```bash
docker exec chroma tar -czf /backups/chroma-backup.tar.gz /chroma/data
```

#### Clear Cache
```bash
docker exec redis redis-cli FLUSHDB
```

### Performance Tuning

1. **Neo4j**: Adjust heap size in `docker-compose.prod.yml`
2. **Redis**: Configure maxmemory and eviction policy
3. **Celery**: Tune worker concurrency and prefetch
4. **API**: Adjust worker count and timeout settings

## Security Considerations

1. **Change Default Passwords**: Update all passwords in `.env`
2. **Use HTTPS**: Configure reverse proxy (nginx/traefik)
3. **Firewall**: Restrict access to internal ports
4. **JWT Secret**: Use strong, random JWT secret key
5. **API Rate Limiting**: Implement rate limiting at reverse proxy
6. **Input Validation**: All inputs are validated server-side
7. **CORS**: Configure appropriate CORS origins

## Support

For issues and questions:
1. Check logs: `docker-compose logs`
2. Review health endpoints
3. Consult `OPTIMIZATION_GUIDE.md`
4. Check GitHub issues
5. Contact support team

## Version Information

- **API Version**: 1.0.0
- **Python**: 3.9+
- **FastAPI**: 0.104+
- **Neo4j**: 5.x
- **ChromaDB**: 0.4+
- **Redis**: 7.x
