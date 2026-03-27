# External Integrations

**Analysis Date:** 2026-03-27

## APIs & External Services

**AI providers:**
- Google Gemini - browser chat/flashcard generation in `frontend/src/services/gemini.ts` and backend embedding generation in `backend/src/services/gemini_client.py`
  - SDK/Client: `@google/generative-ai` in `frontend/package.json`, `google-generativeai` in `backend/requirements.txt`
  - Auth: `VITE_GEMINI_API_KEY`, backend Gemini key field loaded by `backend/src/config/settings.py`
- AWS Bedrock Runtime - optional browser-side model provider in `frontend/src/services/gemini.ts`
  - SDK/Client: `@aws-sdk/client-bedrock-runtime`
  - Auth: `VITE_AWS_REGION`, `VITE_AWS_ACCESS_KEY_ID`, `VITE_AWS_SECRET_ACCESS_KEY`, `VITE_BEDROCK_MODEL_ID`

**Source-code ingestion:**
- GitHub repositories - backend clones public repos for upload processing in `backend/src/services/upload_service.py`
  - SDK/Client: system `git` via `subprocess.run(...)`
  - Auth: no GitHub token integration detected; only normalized `https://github.com/{owner}/{repo}.git` URLs are accepted

**Internal HTTP integration:**
- Frontend -> GraphRAG API - browser calls backend endpoints through Axios in `frontend/src/services/graphrag-api.ts`
  - SDK/Client: `axios`
  - Auth: optional bearer token support in `frontend/src/services/graphrag-api.ts`; no token issuance flow wired from frontend routes was detected

## Data Storage

**Databases:**
- Neo4j graph database
  - Connection: settings fields in `backend/src/config/settings.py` (`neo4j_uri`, `neo4j_user`, `neo4j_password`, `neo4j_database`)
  - Client: official async Neo4j driver in `backend/src/services/neo4j_manager.py`
- Chroma vector database over HTTP
  - Connection: `chroma_host`, `chroma_port`, `chroma_persist_directory` in `backend/src/config/settings.py`
  - Client: `chromadb.HttpClient` in `backend/src/services/chroma_manager.py`
- PostgreSQL
  - Connection: `postgres_host`, `postgres_port`, `postgres_user`, `postgres_password`, `postgres_db` in `backend/src/config/settings.py`
  - Client: `psycopg2-binary` dependency is present in `backend/requirements.txt`, but direct application usage in `backend/src/` was not detected

**File Storage:**
- Local filesystem for upload temp data and persisted upload session JSON in `backend/src/config/settings.py` and `backend/src/services/upload_service.py`
- Browser `localStorage` for onboarding, dojo stats, analytics, gamification, and SRS state in `frontend/src/pages/AppPage.tsx`, `frontend/src/features/dojo/DojoPage.tsx`, `frontend/src/features/analytics/useAnalytics.ts`, `frontend/src/features/gamification/useGamification.ts`, and `frontend/src/features/srs/useSRS.ts`

**Caching:**
- Redis cache for query results and metrics in `backend/src/services/cache_service.py`

## Authentication & Identity

**Auth Provider:**
- Custom JWT utilities only
  - Implementation: token creation/verification helpers in `backend/src/api/auth.py` using `HTTPBearer` and `python-jose`

## Monitoring & Observability

**Error Tracking:**
- Dedicated external error tracking service not detected

**Logs:**
- Structured backend logging is configured in `backend/src/main.py` and `backend/src/utils/logging.py`
- Health and metrics endpoints are exposed from `backend/src/api/health.py`

## CI/CD & Deployment

**Hosting:**
- Frontend static deployment targets: Vercel in `frontend/vercel.json` and Netlify in `frontend/netlify.toml`
- Backend container target: Docker image from `backend/Dockerfile`

**CI Pipeline:**
- None detected in repository files; `.github/` workflows were not found

## Environment Configuration

**Required env vars:**
- Frontend API and AI integration keys are referenced in `frontend/src/services/graphrag-api.ts` and `frontend/src/services/gemini.ts`: `VITE_API_BASE_URL`, `VITE_AI_PROVIDER`, `VITE_GEMINI_API_KEY`, `VITE_GEMINI_MODEL`, `VITE_AWS_REGION`, `VITE_AWS_ACCESS_KEY_ID`, `VITE_AWS_SECRET_ACCESS_KEY`, `VITE_BEDROCK_MODEL_ID`
- Backend service connections and auth fields are centralized in `backend/src/config/settings.py`: Neo4j, Chroma, Redis, RabbitMQ/Celery, PostgreSQL, Gemini, upload, visualizer, and JWT settings

**Secrets location:**
- Backend reads `.env` through `backend/src/config/settings.py`
- Frontend expects `.env.local` / build environment variables through Vite in `frontend/src/services/gemini.ts` and `frontend/src/services/graphrag-api.ts`
- Secret file contents were not read

## Webhooks & Callbacks

**Incoming:**
- None detected; backend routes in `backend/src/api/` expose standard request/response endpoints only

**Outgoing:**
- GitHub clone requests initiated by local `git` in `backend/src/services/upload_service.py`
- Gemini and Bedrock API calls from `frontend/src/services/gemini.ts`
- Gemini embedding API calls from `backend/src/services/gemini_client.py`

## Notable Unknowns

- `backend/README.md` mentions ClickHouse as a Docker service, but no runtime code in `backend/src/` references a ClickHouse client
- RabbitMQ is configured through Celery settings in `backend/src/config/settings.py`, but deployment orchestration beyond local Compose files is not present
- JWT helpers exist in `backend/src/api/auth.py`, but protected endpoint usage is not wired into the visible API routers

---

*Integration audit: 2026-03-27*
