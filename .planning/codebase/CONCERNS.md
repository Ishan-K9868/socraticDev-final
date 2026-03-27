# Codebase Concerns

**Analysis Date:** 2026-03-27

## Tech Debt

**Backend service wiring is internally inconsistent:**
- Issue: multiple services and routers instantiate `GraphService()` without the required `Neo4jConnectionManager`, while the class constructor currently requires one positional dependency.
- Files: `backend/src/services/graph_service.py`, `backend/src/api/projects.py`, `backend/src/services/project_service.py`, `backend/src/services/context_retriever.py`
- Impact: project listing, project detail, project update/delete, and context retrieval paths are at risk of failing before any database work begins.
- Fix approach: add a single factory for `GraphService` creation and route all service construction through it; keep constructor signatures and tests aligned.

**Backend query contracts drift from their callers:**
- Issue: `frontend/src/services/graphrag-api.ts` sends `entity_name` for callers/dependencies/impact requests, while `backend/src/api/query.py` expects `function_id`; the search API also expects `project_ids`/`top_k` but the frontend client exposes `project_id`/`limit`.
- Files: `frontend/src/services/graphrag-api.ts`, `backend/src/api/query.py`
- Impact: query features can fail at runtime or silently return unusable payloads even when the UI typechecks.
- Fix approach: define one shared API contract source, then update both request DTOs and response adapters together.

**Async backend endpoints call async services without awaiting them:**
- Issue: query endpoints return coroutine objects because `query_service.find_callers(...)`, `find_dependencies(...)`, `impact_analysis(...)`, and `semantic_search(...)` are invoked without `await`.
- Files: `backend/src/api/query.py`, `backend/src/services/query_service.py`
- Impact: core query endpoints are unreliable and can break serialization or surface misleading 500 errors.
- Fix approach: await async service methods, add API-level tests for each route, and validate serialized response shapes.

**Large files concentrate too much behavior in single modules:**
- Issue: parser, graph, upload, and several frontend feature files exceed comfortable maintenance size; the largest are `backend/src/services/code_parser.py` (1712 lines), `backend/src/services/graph_service.py` (1227 lines), `frontend/src/features/upload/ProjectUpload.tsx` (752 lines), and `frontend/src/store/useStore.ts` (632 lines).
- Files: `backend/src/services/code_parser.py`, `backend/src/services/graph_service.py`, `frontend/src/features/upload/ProjectUpload.tsx`, `frontend/src/store/useStore.ts`
- Impact: change risk is high, review is slow, and bugs are easier to introduce across unrelated responsibilities.
- Fix approach: split by workflow boundary: parsing phases, graph query families, upload orchestration, and store slices/selectors.

## Known Bugs

**Project routes appear non-functional in current source:**
- Symptoms: list/get/update/delete project routes depend on invalid `GraphService()` construction and on methods not clearly present on the service (`get_project_stats` is referenced but not defined in the inspected class).
- Files: `backend/src/api/projects.py`, `backend/src/services/graph_service.py`
- Trigger: calling `/api/projects`, `/api/projects/{id}`, or project mutation routes.
- Workaround: none detected in code; these routes need implementation alignment.

**Impact analysis returns incomplete structure by design:**
- Symptoms: `ImpactResult.dependency_tree` is always `{}` even after graph traversal succeeds.
- Files: `backend/src/services/query_service.py:252`, `backend/src/services/query_service.py:255`
- Trigger: calling impact analysis paths that expect a dependency tree for UI or downstream reasoning.
- Workaround: consumers can only use the flat `affected_entities` list and cycle metadata.

**GitHub uploads lose file contents in the UI:**
- Symptoms: GitHub-imported projects are hydrated from graph nodes into placeholder file entries with `// File content preview is unavailable for GitHub uploads in this prototype.`
- Files: `frontend/src/features/upload/ProjectUpload.tsx:113`, `frontend/src/features/upload/ProjectUpload.tsx:186`
- Trigger: completing a GitHub upload and then opening files in the explorer.
- Workaround: graph/query views remain available, but source preview/editing is not.

## Security Considerations

**Secrets and credentials are configured client-side and with insecure defaults:**
- Risk: browser builds can expose AI and Bedrock credentials; backend settings ship with default database passwords and JWT secret placeholders.
- Files: `frontend/src/services/gemini.ts`, `backend/src/config/settings.py`
- Current mitigation: env-based configuration exists, but no server-side secret brokering is enforced.
- Recommendations: move all model access behind the backend, fail startup on unsafe defaults outside local development, and rotate any credentials already used with this layout.

**Backend endpoints are effectively unauthenticated:**
- Risk: upload, query, visualization, and project routes accept requests without verified identity even though JWT helpers exist.
- Files: `backend/src/api/auth.py`, `backend/src/api/upload.py`, `backend/src/api/query.py`, `backend/src/api/projects.py`, `backend/src/api/visualization.py`
- Current mitigation: none detected beyond optional helper code in `backend/src/api/auth.py`.
- Recommendations: require auth dependencies on mutating and data-bearing routes and connect `user_id` to verified claims instead of form defaults.

**Error responses can leak internals:**
- Risk: several routes wrap exceptions as `HTTPException(detail=str(e))`, and upload status failures print traceback details directly.
- Files: `backend/src/api/upload.py`, `backend/src/api/query.py`, `backend/src/api/projects.py`, `backend/src/api/visualization.py`
- Current mitigation: top-level FastAPI exception handlers exist in `backend/src/main.py`, but these route-local catches bypass the normalized error model.
- Recommendations: raise typed domain errors instead of raw exception strings and remove direct traceback printing from request handlers.

## Performance Bottlenecks

**Upload processing is mostly sequential and per-entity:**
- Problem: parsing loops file-by-file, embedding generation loops entity-by-entity, and Chroma storage loops embedding-by-embedding.
- Files: `backend/src/tasks/upload_tasks.py`
- Cause: the pipeline uses nested serial loops rather than batch APIs or bounded concurrency.
- Improvement path: batch embeddings and vector writes, persist progress per batch, and add backpressure for large projects.

**Frontend persists large project payloads to local storage:**
- Problem: project context, project files, dependency graph, editor documents, and chat snippets are all included in persisted Zustand state.
- Files: `frontend/src/store/useStore.ts:615`
- Cause: the `persist` partializer stores heavy project artifacts, not just lightweight user preferences.
- Improvement path: persist only preferences and small UX state; keep project content/session artifacts in memory or indexed storage.

## Fragile Areas

**Upload session storage is file-based and repository-local:**
- Files: `backend/src/services/upload_service.py`, `backend/upload_sessions/`
- Why fragile: session JSON files live on local disk, are updated from background threads, and the current ignore rule in `backend/.gitignore` targets `backend/upload_sessions/` rather than the actual relative path `upload_sessions/`.
- Safe modification: treat session storage as temporary infrastructure, add locking or transactional writes before expanding status fields, and fix ignore rules before more artifacts accumulate.
- Test coverage: `backend/tests/unit/test_upload_tasks.py` exercises task helpers, but no test covers concurrent session file updates or crash recovery.

**Query and project APIs lack end-to-end coverage:**
- Files: `backend/tests/unit/test_api.py`, `backend/src/api/query.py`, `backend/src/api/projects.py`
- Why fragile: existing API tests only cover root/docs/health/request-id behavior, while the highest-risk routes are unverified.
- Safe modification: add request/response tests around upload, query, visualization, and project endpoints before refactoring service wiring.
- Test coverage: backend service tests exist, but route contract coverage is thin and frontend has no detected automated test suite.

## Scaling Limits

**Current upload and graph defaults assume moderate project sizes only:**
- Current capacity: `max_files_per_project=10000`, `max_file_size_mb=100`, `max_nodes=500`, and `max_edges=2000` by default.
- Limit: large repositories can parse slowly, generate many embeddings, and still end in truncated visualization responses that hide graph completeness.
- Scaling path: add ingestion quotas by deployment tier, async batch telemetry, and pagination/streaming for graph and search results.

## Missing Critical Features

**Observability is shallow for background and client workflows:**
- Problem: logs exist, but there is no metrics, tracing, job dashboard integration, or client error reporting path; many failures only hit `console.error` or plain logs.
- Blocks: reliable diagnosis of upload failures, model/provider instability, and production regressions.
- Files: `backend/src/utils/logging.py`, `backend/src/tasks/upload_tasks.py`, `frontend/src/components/AppErrorBoundary.tsx`, `frontend/src/services/gemini.ts`

**Ownership and lifecycle boundaries are unclear:**
- Problem: user identity defaults to `default_user` on uploads, project ownership is not enforced at the API layer, and there is no visible source of truth for who can read or delete a project.
- Blocks: multi-user safety, auditability, and any future hosted deployment.
- Files: `backend/src/api/upload.py:34`, `backend/src/api/upload.py:61`, `backend/src/services/graph_service.py:118`

## Test Coverage Gaps

**Frontend behavior is untested:**
- What's not tested: upload polling, graph visualization UI, persisted state behavior, and AI provider switching.
- Files: `frontend/package.json`, `frontend/src/features/upload/ProjectUpload.tsx`, `frontend/src/services/gemini.ts`, `frontend/src/store/useStore.ts`
- Risk: UI/runtime contract breaks can ship unnoticed because no frontend test runner or test files were detected.
- Priority: High

**Backend route contracts and integration edges are under-tested:**
- What's not tested: actual `/api/query/*`, `/api/projects/*`, `/api/upload/*`, and visualization request/response behavior under realistic service mocks.
- Files: `backend/tests/unit/test_api.py`, `backend/src/api/query.py`, `backend/src/api/projects.py`, `backend/src/api/upload.py`, `backend/src/api/visualization.py`
- Risk: constructor drift, missing `await`, and DTO mismatches can survive service-level tests and only fail in runtime integration.
- Priority: High

## Planning-Sensitive Unknowns

**Production deployment assumptions are unresolved:**
- Problem: current code supports browser-direct AI calls, backend AI usage, local fallback threads when Celery is absent, and multiple storage systems, but the intended production path is not encoded in one place.
- Blocks: safe planning for auth, quota enforcement, reliability, and incident handling.
- Files: `frontend/src/services/gemini.ts`, `backend/src/services/upload_service.py`, `backend/src/tasks/upload_tasks.py`, `backend/src/config/settings.py`

**Repository hygiene rules are inconsistent with current tracked artifacts:**
- Problem: `backend/src/__pycache__/` files and `backend/upload_sessions/session_*.json` artifacts are present in the repository view even though they look generated.
- Blocks: trustworthy diff review and clean environment assumptions for future automation.
- Files: `backend/src/__pycache__/`, `backend/src/api/__pycache__/`, `backend/src/services/__pycache__/`, `backend/upload_sessions/`, `backend/.gitignore`

---

*Concerns audit: 2026-03-27*
