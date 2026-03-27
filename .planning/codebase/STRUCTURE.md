# Codebase Structure

**Analysis Date:** 2026-03-27

## Directory Layout

```text
[project-root]/
├── `frontend/`              # React/Vite SPA, feature modules, browser AI clients
├── `backend/`               # FastAPI API, services, Celery tasks, tests, infra config
├── `deploy/`                # Deployment-facing config such as Nginx
├── `.planning/codebase/`    # Generated codebase maps for future planning
├── `.kiro/`                 # Product/spec artifacts, not runtime code
├── `README.md`              # Repository-level overview and manual operating notes
├── `start.bat`              # Local orchestration script
└── `stop.bat`               # Local shutdown script
```

## Directory Purposes

**`frontend/src/`:**
- Purpose: Own all browser runtime code.
- Contains: `pages/`, `features/`, `components/`, `services/`, `store/`, `ui/`, `styles/`, `utils/`.
- Key files: `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/src/store/useStore.ts`

**`frontend/src/features/`:**
- Purpose: Group product capabilities by domain.
- Contains: Chat, upload, graph, visualizer, dojo, SRS, analytics, editor, explorer, mode, onboarding, metrics, context, and gamification modules.
- Key files: `frontend/src/features/chat/useChat.ts`, `frontend/src/features/upload/ProjectUpload.tsx`, `frontend/src/features/graph/GraphPanel.tsx`, `frontend/src/features/visualizer/CodeVisualizer.tsx`

**`frontend/src/services/`:**
- Purpose: Hold external client adapters.
- Contains: Browser AI client and backend API client.
- Key files: `frontend/src/services/gemini.ts`, `frontend/src/services/graphrag-api.ts`, `frontend/src/services/index.ts`

**`backend/src/`:**
- Purpose: Own all Python application runtime code.
- Contains: `api/`, `services/`, `models/`, `config/`, `utils/`, `tasks/`, plus `main.py` and `celery_app.py`.
- Key files: `backend/src/main.py`, `backend/src/celery_app.py`

**`backend/src/api/`:**
- Purpose: HTTP boundary layer.
- Contains: Upload, query, project, visualization, health, and auth modules.
- Key files: `backend/src/api/upload.py`, `backend/src/api/query.py`, `backend/src/api/projects.py`, `backend/src/api/visualization.py`, `backend/src/api/health.py`

**`backend/src/services/`:**
- Purpose: Business logic and storage integrations.
- Contains: Parser, upload orchestration, graph/vector/cache/project/query/context services, DB managers, and visualizer analysis.
- Key files: `backend/src/services/upload_service.py`, `backend/src/services/graph_service.py`, `backend/src/services/vector_service.py`, `backend/src/services/query_service.py`

**`backend/tests/`:**
- Purpose: Backend verification only.
- Contains: `unit/`, `integration/`, `conftest.py`.
- Key files: `backend/tests/unit/test_api.py`, `backend/tests/unit/test_graph_service.py`, `backend/tests/integration/test_vector_service_integration.py`

## Key File Locations

**Entry Points:**
- `frontend/src/main.tsx`: Browser bootstrap for the SPA.
- `frontend/src/App.tsx`: Route composition and global UI wrappers.
- `backend/src/main.py`: FastAPI application entry point.
- `backend/src/celery_app.py`: Celery worker entry point.

**Configuration:**
- `frontend/package.json`: Frontend scripts and dependency manifest.
- `frontend/vite.config.ts`: Vite dev/build configuration.
- `backend/src/config/settings.py`: Runtime settings and environment-backed defaults.
- `backend/docker-compose.yml`: Local infra composition for backend dependencies.

**Core Logic:**
- `frontend/src/store/useStore.ts`: Shared app state and editor/chat/project coordination.
- `frontend/src/features/upload/ProjectUpload.tsx`: Upload orchestration and polling.
- `frontend/src/features/chat/useChat.ts`: Chat orchestration and AI prompt assembly.
- `backend/src/tasks/upload_tasks.py`: End-to-end ingestion workflow.
- `backend/src/services/query_service.py`: Query and visualization orchestration.
- `backend/src/services/visualizer_ai_service.py`: Deterministic code analysis.

**Testing:**
- `backend/tests/`: Pytest suite for services, API, models, and integration paths.

## Naming Conventions

**Files:**
- React components and pages use PascalCase filenames: `frontend/src/pages/AppPage.tsx`, `frontend/src/features/upload/ProjectUpload.tsx`.
- Frontend hooks use `useX` camelCase filenames: `frontend/src/features/chat/useChat.ts`, `frontend/src/hooks/useReducedMotion.ts`.
- Backend modules use snake_case filenames: `backend/src/services/upload_service.py`, `backend/src/api/visualization.py`.
- Barrel exports use `index.ts` or `__init__.py`: `frontend/src/features/srs/index.ts`, `backend/src/api/__init__.py`.

**Directories:**
- Frontend capability directories are lowercase singular/plural feature names: `frontend/src/features/chat/`, `frontend/src/features/visualizer/`.
- Backend layer directories are lowercase by responsibility: `backend/src/api/`, `backend/src/services/`, `backend/src/models/`.

## Where to Add New Code

**New Feature:**
- Primary code: Add a new domain folder under `frontend/src/features/` when the feature is user-facing, and add matching backend service/router modules under `backend/src/services/` and `backend/src/api/` when it needs server support.
- Tests: Add backend tests in `backend/tests/unit/` or `backend/tests/integration/`; no frontend test directory is established in current state.

**New Component/Module:**
- Implementation: Put reusable page-agnostic UI in `frontend/src/components/` or `frontend/src/ui/`; keep feature-specific UI inside its feature folder such as `frontend/src/features/graph/`.

**Utilities:**
- Shared helpers: Put browser-side helpers in `frontend/src/utils/`; put backend helpers in `backend/src/utils/`; put typed backend domain models in `backend/src/models/` instead of utility modules.

## Special Directories

**`frontend/dist/`:**
- Purpose: Built frontend assets.
- Generated: Yes
- Committed: Yes

**`backend/upload_sessions/`:**
- Purpose: File-based upload session state used by `backend/src/services/upload_service.py`.
- Generated: Yes
- Committed: Yes

**`backend/logs/`:**
- Purpose: Runtime logs and pid files from local backend processes.
- Generated: Yes
- Committed: Yes

**`backend/.venv/`:**
- Purpose: Local Python virtual environment.
- Generated: Yes
- Committed: No

**`.planning/codebase/`:**
- Purpose: Architecture/stack/convention maps consumed by planning commands.
- Generated: Yes
- Committed: Intended to be committed

**`.kiro/`:**
- Purpose: Product requirements/design/task artifacts that inform implementation but are outside runtime paths.
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-03-27*
