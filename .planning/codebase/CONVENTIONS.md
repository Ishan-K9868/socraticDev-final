# Coding Conventions

**Analysis Date:** 2026-03-27

## Naming Patterns

**Files:**
- Frontend React components and pages use `PascalCase.tsx` files such as `frontend/src/App.tsx`, `frontend/src/pages/LandingPage.tsx`, and `frontend/src/components/AppErrorBoundary.tsx`.
- Frontend hooks use `useX.ts` naming such as `frontend/src/features/chat/useChat.ts` and `frontend/src/hooks/useReducedMotion.ts`.
- Frontend barrels use `index.ts` such as `frontend/src/features/dojo/index.ts` and `frontend/src/ui/index.ts`.
- Backend Python modules use `snake_case.py` such as `backend/src/services/vector_service.py`, `backend/src/api/query.py`, and `backend/src/utils/errors.py`.
- Backend tests mirror the target module with `test_*.py` names such as `backend/tests/unit/test_vector_service.py` and `backend/tests/integration/test_vector_service_integration.py`.

**Functions:**
- Frontend functions use `camelCase` or React hook naming, for example `formatSnippetContext` in `frontend/src/features/chat/useChat.ts` and `sanitizeFilename` in `frontend/src/store/useStore.ts`.
- Backend functions and methods use `snake_case`, for example `health_check` in `backend/src/main.py`, `find_callers` in `backend/src/api/query.py`, and `store_embedding` in `backend/src/services/vector_service.py`.

**Variables:**
- Frontend local variables and state use `camelCase`, such as `prefersReducedMotion` in `frontend/src/App.tsx` and `currentConversationId` in `frontend/src/store/useStore.ts`.
- Backend local variables and fields use `snake_case`, such as `request_id` in `backend/src/main.py` and `similarity_threshold` in `backend/src/services/vector_service.py`.

**Types:**
- Frontend TypeScript types and interfaces use `PascalCase`, such as `ButtonProps` in `frontend/src/ui/Button.tsx` and `ProjectContext` in `frontend/src/store/useStore.ts`.
- Backend Pydantic models, enums, and exceptions use `PascalCase`, such as `ErrorResponse` in `backend/src/models/api.py`, `CodeEntity` in `backend/src/models/base.py`, and `DatabaseQueryError` in `backend/src/utils/errors.py`.

## Code Style

**Formatting:**
- Frontend has no Prettier or Biome config detected in `frontend/`; formatting is effectively driven by existing file style plus TypeScript compilation in `frontend/package.json` and `frontend/tsconfig.json`.
- Frontend source currently uses 4-space indentation and single quotes in files such as `frontend/src/main.tsx`, `frontend/src/App.tsx`, and `frontend/src/ui/Button.tsx`.
- Backend formatting tools are `black` and `isort`, invoked from `backend/Makefile:30` and documented in `backend/README.md:151`.
- Backend source follows Black-style 4-space indentation, trailing commas in multiline calls, and wrapped argument lists in files such as `backend/src/main.py` and `backend/src/services/vector_service.py`.

**Linting:**
- Frontend lint entry point is `npm run lint` in `frontend/package.json:9`; active flat config is `frontend/eslint.config.js` and a legacy `.eslintrc.cjs` still exists.
- Frontend ESLint enforces React Hooks rules, warns on unused vars unless prefixed with `_`, and warns on `any` in `frontend/eslint.config.js:20`.
- Frontend TypeScript strictness is enabled in `frontend/tsconfig.json:18` with `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch`.
- Backend lint/type-check commands are `flake8 src/ tests/` and `mypy src/` in `backend/Makefile:26`; no dedicated `.flake8` or `mypy.ini` config was detected.
- Backend dependency list declares `black`, `flake8`, `mypy`, and `isort` in `backend/requirements.txt:47`.

## Import Organization

**Order:**
1. Backend modules usually import standard library first, then third-party packages, then local packages, as shown in `backend/src/main.py`, `backend/src/utils/logging.py`, and `backend/src/services/vector_service.py`.
2. Frontend modules usually import React or vendor packages first, then local relative modules, as shown in `frontend/src/App.tsx`, `frontend/src/features/chat/useChat.ts`, and `frontend/src/ui/Button.tsx`.
3. Types are commonly imported inline with values instead of via `import type`, for example `frontend/src/ui/Button.tsx:1` and `backend/src/api/query.py:4`.

**Path Aliases:**
- `@/* -> src/*` is configured in `frontend/tsconfig.json:22`.
- No usage of the `@/` alias was detected in `frontend/src`; current code uses relative imports such as `./pages/LandingPage` and `../../store/useStore`.

## Error Handling

**Patterns:**
- Backend core error model uses custom exceptions in `backend/src/utils/errors.py` and FastAPI exception handlers in `backend/src/main.py:68`.
- Backend services usually log and raise domain exceptions with `details`, as shown in `backend/src/services/vector_service.py:183`.
- Backend API routers are inconsistent: `backend/src/main.py` expects `GraphRAGException`, but `backend/src/api/query.py:47` catches broad `Exception` and rethrows raw `HTTPException(status_code=500, detail=str(e))`.
- Frontend hooks catch errors close to the UI, store a string message, and surface a fallback assistant message or inline state, as shown in `frontend/src/features/chat/useChat.ts:126`.
- Frontend top-level crash handling uses a React error boundary in `frontend/src/components/AppErrorBoundary.tsx`.

## Logging

**Framework:**
- Backend uses the standard `logging` module with custom JSON and text formatters in `backend/src/utils/logging.py`.
- Frontend uses `console.error`, `console.warn`, and `console.log` directly in files such as `frontend/src/services/gemini.ts`, `frontend/src/features/upload/ProjectUpload.tsx`, and `frontend/src/components/AppErrorBoundary.tsx`.

**Patterns:**
- Backend initializes logging at app startup in `backend/src/main.py:15` and includes structured extras such as `request_id`, `project_id`, and exception traces.
- Frontend logging is ad hoc and user-facing recovery is usually handled separately from the log call.

## Comments

**When to Comment:**
- Backend uses module docstrings, class docstrings, and method docstrings heavily, plus short inline comments for intent, as shown in `backend/src/main.py`, `backend/src/services/vector_service.py`, and `backend/tests/unit/test_graph_service.py`.
- Frontend comments are lighter and mostly mark UI sections or clarify non-obvious behavior, as shown in `frontend/src/App.tsx:20`, `frontend/src/App.tsx:88`, and `frontend/test_bedrock.ts:34`.

**JSDoc/TSDoc:**
- Not common in frontend `.ts` and `.tsx` files; exported types in `frontend/src/store/useStore.ts` and components in `frontend/src/ui/Button.tsx` rely on names instead of TSDoc.
- Standard Python docstrings are the documentation norm in backend source and tests.

## Function Design

**Size:**
- Frontend helper functions are usually short to medium and colocated near the hook or component, as shown in `frontend/src/features/chat/useChat.ts`.
- Backend service methods can be long and responsibility-heavy; `backend/src/services/vector_service.py` is a 686-line module with multiple multi-step methods.

**Parameters:**
- Frontend functions often accept typed option objects or typed payloads, such as `sendMessage` in `frontend/src/features/chat/useChat.ts:65` and `createScratchDocument` in `frontend/src/store/useStore.ts:164`.
- Backend APIs and models use Pydantic request bodies for validation, as shown in `backend/src/api/query.py` and `backend/src/api/upload.py`.

**Return Values:**
- Frontend hooks return plain objects containing state and actions, as shown in `frontend/src/features/chat/useChat.ts:157`.
- Backend services return Pydantic models, dictionaries, or primitive counts depending on the layer, as shown in `backend/src/services/vector_service.py` and `backend/src/main.py`.

## Module Design

**Exports:**
- Frontend components commonly default-export the main component, such as `frontend/src/App.tsx` and `frontend/src/ui/Button.tsx`.
- Frontend feature folders frequently expose named exports through `index.ts` barrels such as `frontend/src/features/dojo/index.ts` and `frontend/src/features/srs/index.ts`.
- Backend modules usually export concrete classes plus module-level singleton accessors like `get_vector_service` in `backend/src/services/vector_service.py:669`.

**Barrel Files:**
- Common in frontend feature and UI folders.
- Not used as a primary pattern in backend `backend/src/`; direct module imports are the norm.

---

*Convention analysis: 2026-03-27*
