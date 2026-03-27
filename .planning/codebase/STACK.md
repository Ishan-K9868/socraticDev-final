# Technology Stack

**Analysis Date:** 2026-03-27

## Languages

**Primary:**
- TypeScript 5.x - browser frontend in `frontend/src/` with build config in `frontend/package.json` and `frontend/tsconfig.json`
- Python 3.11 - API, workers, parsing, and storage services in `backend/src/`, pinned by `backend/Dockerfile`

**Secondary:**
- CSS - global styling in `frontend/src/styles/globals.css`, with Tailwind/PostCSS dependencies declared in `frontend/package.json`
- Batch/Make - local startup automation in `start.bat` and `backend/Makefile`

## Runtime

**Environment:**
- Node.js 20 in hosted frontend builds via `frontend/netlify.toml`; local bootstrap accepts Node 18+ in `start.bat`
- Python 3.11-slim container runtime for backend in `backend/Dockerfile`

**Package Manager:**
- npm for frontend in `frontend/package.json`
- Lockfile: present in `frontend/package-lock.json` (lockfileVersion 3)
- pip + `requirements.txt` for backend in `backend/requirements.txt`

## Frameworks

**Core:**
- React 18.3.1 - SPA UI in `frontend/package.json`, mounted from `frontend/src/main.tsx`
- Vite 5.1.0 - frontend dev server and bundler in `frontend/package.json` and `frontend/vite.config.ts`
- FastAPI 0.104.1 - HTTP API in `backend/src/main.py`
- Celery 5.3.4 - background processing for uploads in `backend/src/celery_app.py` and `backend/src/tasks/upload_tasks.py`

**Testing:**
- pytest 7.4.3 with `pytest-asyncio`, `pytest-cov`, `pytest-mock`, `hypothesis`, and `testcontainers` in `backend/requirements.txt`
- Frontend test runner not detected; `frontend/package.json` exposes `dev`, `build`, `lint`, and `preview` only

**Build/Dev:**
- TypeScript compiler + Vite build pipeline in `frontend/package.json`
- ESLint 9 in `frontend/eslint.config.js` and `frontend/.eslintrc.cjs`
- Black, Flake8, mypy, and isort in `backend/requirements.txt` and `backend/Makefile`
- Docker / Docker Compose for local infra via `backend/Dockerfile`, `backend/docker-compose.yml`, and `backend/docker-compose.prod.yml`

## Key Dependencies

**Critical:**
- `@google/generative-ai` - direct browser Gemini chat/card generation in `frontend/src/services/gemini.ts`
- `@aws-sdk/client-bedrock-runtime` - browser Bedrock fallback/provider switch in `frontend/src/services/gemini.ts`
- `axios` - frontend API transport in `frontend/src/services/graphrag-api.ts`
- `google-generativeai` - backend embedding generation in `backend/src/services/gemini_client.py`
- `tree-sitter` plus language grammars - code parsing pipeline in `backend/requirements.txt` and `backend/src/services/code_parser.py`

**Infrastructure:**
- `neo4j` - graph storage access layer in `backend/src/services/neo4j_manager.py`
- `chromadb` - vector store access layer in `backend/src/services/chroma_manager.py` and `backend/src/services/vector_service.py`
- `redis` - cache and Celery result backend in `backend/src/services/cache_service.py` and `backend/src/config/settings.py`
- `psycopg2-binary` - PostgreSQL dependency retained for Chroma metadata/backend support in `backend/requirements.txt` and referenced in `backend/src/config/settings.py`
- `python-jose[cryptography]` and `passlib[bcrypt]` - JWT/password utility dependencies in `backend/requirements.txt` and `backend/src/api/auth.py`

## Configuration

**Environment:**
- Backend settings load from `.env` through Pydantic Settings in `backend/src/config/settings.py`
- Frontend build-time env access uses `import.meta.env` in `frontend/src/services/gemini.ts` and `frontend/src/services/graphrag-api.ts`
- Environment template files exist at `backend/.env.example`, `backend/.env`, `frontend/.env.example`, and `frontend/.env.local`; contents were not read

**Build:**
- Frontend aliasing, dev server, and manual chunking are configured in `frontend/vite.config.ts`
- Frontend deploy configs exist in `frontend/vercel.json` and `frontend/netlify.toml`
- Backend container build is defined in `backend/Dockerfile`

## Platform Requirements

**Development:**
- Docker + Compose are expected for Neo4j, Chroma, Redis, RabbitMQ, and related services per `start.bat`, `backend/README.md`, and compose file presence in `backend/`
- Local bootstrap path is Windows-first in `start.bat`; backend also exposes Make targets in `backend/Makefile`

**Production:**
- Frontend is prepared for static hosting on Vercel or Netlify via `frontend/vercel.json` and `frontend/netlify.toml`
- Backend is prepared as a containerized FastAPI service via `backend/Dockerfile`
- CI pipeline configuration was not detected; no `.github/` workflow files were found

## Notable Unknowns

- Exact production Node/npm versions outside Netlify are not pinned in repo-level tooling files
- `backend/README.md` documents ClickHouse in local Docker services, but no application imports or client dependencies reference it from `backend/src/`
- No backend dependency lockfile or `pyproject.toml` was detected, so Python installs are requirements-based rather than lockfile-reproducible

---

*Stack analysis: 2026-03-27*
