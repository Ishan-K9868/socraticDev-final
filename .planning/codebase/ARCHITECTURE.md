# Architecture

**Analysis Date:** 2026-03-27

## Pattern Overview

**Overall:** Full-stack modular monolith with a React SPA in `frontend/src/` and a FastAPI + Celery backend in `backend/src/`.

**Key Characteristics:**
- The frontend owns user experience, routing, local learning state, and direct AI chat/card generation through `frontend/src/App.tsx`, `frontend/src/store/useStore.ts`, and `frontend/src/services/gemini.ts`.
- The backend owns project ingestion, graph/vector persistence, retrieval, and deterministic visualization through `backend/src/main.py`, `backend/src/tasks/upload_tasks.py`, and `backend/src/services/*.py`.
- The system boundary is split: GraphRAG and code visualization go through HTTP APIs in `backend/src/api/`, while conversational AI still bypasses the backend and runs from the browser in `frontend/src/features/chat/useChat.ts` and `frontend/src/services/gemini.ts`.

## Layers

**Frontend application layer:**
- Purpose: Render pages, route between product surfaces, and compose feature modules.
- Location: `frontend/src/App.tsx`, `frontend/src/pages/`
- Contains: Route definitions, landing pages, app shells, learning hub, build mode, visualizer, and informational pages.
- Depends on: `frontend/src/features/`, `frontend/src/components/`, `frontend/src/store/useStore.ts`
- Used by: `frontend/src/main.tsx`

**Frontend state and client orchestration layer:**
- Purpose: Hold persistent client state and coordinate chat, upload, editor, graph, analytics, and SRS flows.
- Location: `frontend/src/store/useStore.ts`, `frontend/src/features/*/use*.ts`, `frontend/src/services/`
- Contains: Zustand store, localStorage-backed analytics/SRS hooks, API clients, and AI service wrappers.
- Depends on: Browser storage, `frontend/src/utils/projectAnalyzer.ts`, backend HTTP endpoints, and external AI SDKs.
- Used by: Feature components in `frontend/src/features/` and pages in `frontend/src/pages/`.

**Backend API layer:**
- Purpose: Expose HTTP contracts for upload, query, project management, visualization, and health checks.
- Location: `backend/src/main.py`, `backend/src/api/upload.py`, `backend/src/api/query.py`, `backend/src/api/projects.py`, `backend/src/api/visualization.py`, `backend/src/api/health.py`
- Contains: FastAPI app setup, CORS, request-id middleware, exception handlers, and route handlers.
- Depends on: `backend/src/config/settings.py`, `backend/src/services/`, `backend/src/models/`
- Used by: `frontend/src/services/graphrag-api.ts` and ops/monitoring callers.

**Backend domain/service layer:**
- Purpose: Implement ingestion, parsing, graph queries, vector search, context retrieval, project lifecycle, and deterministic code analysis.
- Location: `backend/src/services/`, `backend/src/tasks/upload_tasks.py`
- Contains: `UploadService`, `GraphService`, `VectorService`, `QueryService`, `ProjectService`, `ContextRetriever`, `VisualizerAIService`, parser and DB managers.
- Depends on: Neo4j, Chroma, Redis, Celery/RabbitMQ, filesystem session storage, and parser/AI libraries.
- Used by: FastAPI routers and Celery workers.

**Persistence and background processing layer:**
- Purpose: Store structural and semantic project knowledge and process uploads asynchronously.
- Location: `backend/src/celery_app.py`, `backend/src/tasks/upload_tasks.py`, `backend/src/services/neo4j_manager.py`, `backend/src/services/chroma_manager.py`, `backend/src/services/cache_service.py`, `backend/upload_sessions/`
- Contains: Celery app wiring, queue processing, file-based upload session records, graph/vector/cache adapters.
- Depends on: Environment settings from `backend/src/config/settings.py`
- Used by: Backend service layer.

## Data Flow

**Project ingestion flow:**

1. `frontend/src/features/upload/ProjectUpload.tsx` builds a local preview tree, computes a browser-side dependency graph, and sends selected files or a GitHub URL through `frontend/src/services/graphrag-api.ts`.
2. `backend/src/api/upload.py` creates an upload session through `backend/src/services/upload_service.py`, which persists session JSON in `backend/upload_sessions/` and dispatches `backend/src/tasks/upload_tasks.py` through Celery or a local thread fallback.
3. `backend/src/tasks/upload_tasks.py` parses files, adds file entities plus resolved import relationships, stores projects/entities/relationships in Neo4j via `backend/src/services/graph_service.py`, stores embeddings in Chroma via `backend/src/services/vector_service.py`, and updates session progress for polling.

**Graph/query flow:**

1. `frontend/src/features/graph/GraphPanel.tsx` requests graph data from `POST /api/visualization/graph` through `frontend/src/services/graphrag-api.ts`.
2. `backend/src/api/visualization.py` maps request filters into `GraphFilters` and delegates to `backend/src/services/query_service.py`.
3. `backend/src/services/query_service.py` reads structural data from `backend/src/services/graph_service.py`, optionally combines it with vector/cache services for other query endpoints, and returns graph-ready node/edge payloads.

**Deterministic visualizer flow:**

1. `frontend/src/features/visualizer/CodeVisualizer.tsx` and `frontend/src/features/visualizer/useCodeAnalysis.ts` send code to `POST /api/visualization/analyze`.
2. `backend/src/api/visualization.py` enforces execution policy from `backend/src/config/settings.py`.
3. `backend/src/services/visualizer_ai_service.py` returns call graph or execution trace data for frontend rendering in `frontend/src/features/visualizer/CallGraphView.tsx` and `frontend/src/features/visualizer/ExecutionAnimator.tsx`.

**Chat and learning telemetry flow:**

1. `frontend/src/features/chat/useChat.ts` reads conversation state and optional uploaded project metadata from `frontend/src/store/useStore.ts`.
2. `frontend/src/services/gemini.ts` sends prompts directly to Gemini or Bedrock from the browser; this path does not pass through `backend/src/api/`.
3. `frontend/src/features/analytics/useAnalytics.ts` and `frontend/src/features/srs/useSRS.ts` persist analytics, flashcards, and review history in browser `localStorage`, so these learning systems remain frontend-owned.

**State Management:**
- Use `frontend/src/store/useStore.ts` for cross-feature UI/app state.
- Use local hook state for page-local interactions in files like `frontend/src/pages/AppPage.tsx` and `frontend/src/features/graph/GraphPanel.tsx`.
- Use browser `localStorage` for durable user progress in `frontend/src/features/analytics/useAnalytics.ts` and `frontend/src/features/srs/useSRS.ts`.
- Use backend persistence only for uploaded-project knowledge, not for user learning history.

## Key Abstractions

**Project context:**
- Purpose: Represent the uploaded codebase currently loaded into the UI.
- Examples: `frontend/src/store/useStore.ts`, `frontend/src/features/upload/ProjectUpload.tsx`
- Pattern: Client-side aggregate object containing project metadata, file tree, selected file, dependency graph, and stats.

**Code entities and relationships:**
- Purpose: Represent parsed source structure across files and languages.
- Examples: `backend/src/models/base.py`, `backend/src/tasks/upload_tasks.py`, `backend/src/services/graph_service.py`
- Pattern: Pydantic models mapped into Neo4j nodes/edges and reused for visualization/query operations.

**Service-per-capability backend:**
- Purpose: Separate major backend responsibilities by storage or workflow boundary.
- Examples: `backend/src/services/upload_service.py`, `backend/src/services/query_service.py`, `backend/src/services/vector_service.py`, `backend/src/services/project_service.py`
- Pattern: Thin API router -> service object -> manager/storage adapter.

**Feature-sliced frontend:**
- Purpose: Group UI and behavior by product capability instead of by technical layer only.
- Examples: `frontend/src/features/chat/`, `frontend/src/features/upload/`, `frontend/src/features/graph/`, `frontend/src/features/visualizer/`, `frontend/src/features/srs/`, `frontend/src/features/dojo/`
- Pattern: Each feature owns components, hooks, types, and index exports.

## Entry Points

**Frontend SPA bootstrap:**
- Location: `frontend/src/main.tsx`
- Triggers: Vite loads the browser app.
- Responsibilities: Mount React, load global CSS, and render `frontend/src/App.tsx`.

**Frontend route shell:**
- Location: `frontend/src/App.tsx`
- Triggers: Browser navigation.
- Responsibilities: Set theme/cursor behavior, wrap with error boundary, and map URLs to product surfaces.

**Backend HTTP app:**
- Location: `backend/src/main.py`
- Triggers: Uvicorn startup or module execution.
- Responsibilities: Configure middleware, exception handling, health/root routes, and router registration.

**Background ingestion worker:**
- Location: `backend/src/tasks/upload_tasks.py`
- Triggers: Celery queue dispatch from `backend/src/services/upload_service.py` or local fallback thread.
- Responsibilities: Parse files, enrich relationships, persist graph/vector data, and update upload session progress.

## Error Handling

**Strategy:** Centralized FastAPI exception handling at the app boundary, plus local try/except blocks inside routers and service workflows.

**Patterns:**
- `backend/src/main.py` maps `GraphRAGException` and unexpected exceptions into structured JSON responses with request IDs.
- Most routers in `backend/src/api/*.py` catch broad exceptions and translate them to `HTTPException`, which keeps endpoints simple but duplicates boundary handling.
- Frontend API failures are normalized in `frontend/src/services/graphrag-api.ts`; frontend chat failures are surfaced as synthetic assistant messages in `frontend/src/features/chat/useChat.ts`.

## Cross-Cutting Concerns

**Logging:** Structured backend logging is initialized in `backend/src/main.py` via `backend/src/utils/logging.py`; frontend mostly uses local `console` logging in feature code such as `frontend/src/features/upload/ProjectUpload.tsx` and `frontend/src/features/graph/GraphPanel.tsx`.
**Validation:** Backend request validation relies on Pydantic models in `backend/src/api/*.py` and shared models in `backend/src/models/`; frontend validates mostly with imperative checks in components and hooks.
**Authentication:** JWT helpers exist in `backend/src/api/auth.py`, but active routers in `backend/src/main.py` do not attach auth dependencies, and `frontend/src/services/graphrag-api.ts` carries only an optional bearer token setter.

---

*Architecture analysis: 2026-03-27*
