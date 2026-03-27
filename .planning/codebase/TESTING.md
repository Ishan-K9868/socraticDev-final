# Testing Patterns

**Analysis Date:** 2026-03-27

## Test Framework

**Runner:**
- Backend uses `pytest 7.4.3` with `pytest-asyncio`, `pytest-cov`, and `pytest-mock` declared in `backend/requirements.txt:38`.
- Config: `backend/pytest.ini`.

**Assertion Library:**
- Plain `assert` statements and `pytest.raises` in backend tests such as `backend/tests/unit/test_api.py`, `backend/tests/unit/test_vector_service.py`, and `backend/tests/unit/test_gemini_client.py`.

**Run Commands:**
```bash
pytest                             # Run all backend tests
pytest -v                          # Verbose backend test run
pytest --cov=src --cov-report=html # Coverage report for backend source
```

## Test File Organization

**Location:**
- Backend tests live under `backend/tests/` with `unit/`, `integration/`, and shared fixtures in `backend/tests/conftest.py`.
- No automated frontend unit, integration, or E2E test directory was detected under `frontend/`.

**Naming:**
- Pytest naming is enforced in `backend/pytest.ini:2`: files `test_*.py`, classes `Test*`, functions `test_*`.
- Examples: `backend/tests/unit/test_graph_service.py` and `backend/tests/integration/test_vector_service_integration.py`.

**Structure:**
```
backend/tests/
backend/tests/conftest.py
backend/tests/unit/test_*.py
backend/tests/integration/test_*.py
```

## Test Structure

**Suite Organization:**
```python
@pytest.fixture
def vector_service(mock_chroma_manager):
    return VectorService(chroma_manager=mock_chroma_manager)


class TestStoreEmbedding:
    def test_store_embedding_success(
        self, vector_service, mock_collection, sample_embedding, sample_metadata
    ):
        vector_service._ensure_collection = Mock(return_value=mock_collection)

        result = vector_service.store_embedding(
            entity_id="func_123",
            embedding=sample_embedding,
            metadata=sample_metadata,
        )

        assert result == "func_123"
```
Source: `backend/tests/unit/test_vector_service.py:19`.

**Patterns:**
- Tests are grouped by class per feature area, then use descriptive `test_*` methods, as shown in `backend/tests/unit/test_graph_service.py` and `backend/tests/unit/test_gemini_client.py`.
- Shared app fixtures stay in `backend/tests/conftest.py`; module-specific fixtures stay near the suite.
- Async tests use `@pytest.mark.asyncio`, for example throughout `backend/tests/unit/test_gemini_client.py` and `backend/tests/unit/test_graph_service.py`.
- Assertions favor direct field checks over helper abstractions, as shown in `backend/tests/unit/test_api.py`.

## Mocking

**Framework:**
- `unittest.mock` is the dominant mocking tool via `Mock`, `MagicMock`, `AsyncMock`, and `patch`.

**Patterns:**
```python
@pytest.fixture
def mock_neo4j_manager():
    manager = MagicMock(spec=Neo4jConnectionManager)
    manager.execute_with_retry = AsyncMock()
    manager.execute_write_with_retry = AsyncMock()
    return manager


with patch('src.services.gemini_client.genai') as mock:
    yield mock
```
Sources: `backend/tests/unit/test_graph_service.py:34`, `backend/tests/unit/test_gemini_client.py:133`.

**What to Mock:**
- External services and transport layers are mocked in unit tests: Chroma in `backend/tests/unit/test_vector_service.py`, Neo4j in `backend/tests/unit/test_neo4j_manager.py`, and Gemini client internals in `backend/tests/unit/test_gemini_client.py`.
- FastAPI endpoint tests use the real app with `TestClient` from `backend/tests/conftest.py`.

**What NOT to Mock:**
- The one true integration slice uses a real Chroma connection in `backend/tests/integration/test_vector_service_integration.py`.
- No equivalent real-service integration coverage was found for frontend behavior, browser interaction, or end-to-end flows.

## Fixtures and Factories

**Test Data:**
```python
@pytest.fixture
def sample_metadata():
    return {
        "entity_type": "function",
        "file_path": "src/auth.py",
        "name": "authenticate_user",
        "project_id": "proj_123",
    }
```
Source: `backend/tests/unit/test_vector_service.py:48`.

**Location:**
- Global fixtures: `backend/tests/conftest.py`.
- Per-file fixtures: each unit or integration file defines its own samples and mocks.
- Dedicated factories or fixture libraries were not detected.

## Coverage

**Requirements:**
- No enforced coverage threshold was detected in `backend/pytest.ini`, `backend/Makefile`, or repository CI config.
- Coverage generation exists as an optional local command in `backend/Makefile:23` and `backend/README.md:141`.

**View Coverage:**
```bash
pytest --cov=src --cov-report=html
```

## Test Types

**Unit Tests:**
- Backend unit tests heavily cover service and utility behavior, including error paths, such as `backend/tests/unit/test_vector_service.py`, `backend/tests/unit/test_chroma_manager.py`, `backend/tests/unit/test_gemini_client.py`, and `backend/tests/unit/test_errors.py`.
- API smoke coverage exists for basic app routes in `backend/tests/unit/test_api.py`.

**Integration Tests:**
- Integration coverage is narrow and infrastructure-dependent: `backend/tests/integration/test_vector_service_integration.py` uses a real Chroma instance, and `backend/tests/integration/test_embedding_generation.py` covers embedding flow behavior.
- Integration tests rely on local services or Docker-backed dependencies per `backend/README.md:135` and `backend/tests/integration/test_vector_service_integration.py:4`.

**E2E Tests:**
- Not used. No Playwright, Cypress, or browser E2E config was detected.
- Frontend has only a manual script `frontend/test_bedrock.ts`, which logs to console, injects fake env values, and exits the process; it is not wired into `frontend/package.json`.

## Common Patterns

**Async Testing:**
```python
@pytest.mark.asyncio
async def test_generate_embedding_success(self, client, mock_genai):
    mock_genai.embed_content.return_value = {"embedding": [0.1] * 768}
    result = await client.generate_embedding("test text")
    assert len(result) == 768
```
Source: `backend/tests/unit/test_gemini_client.py:169`.

**Error Testing:**
```python
with pytest.raises(DatabaseQueryError, match="Failed to store embedding"):
    vector_service.store_embedding(
        entity_id="func_123",
        embedding=sample_embedding,
        metadata=sample_metadata,
    )
```
Source: `backend/tests/unit/test_vector_service.py:148`.

## Reliability Risks

- `frontend/` has no automated test framework or CI-facing test command in `frontend/package.json`; regressions in routing, UI state, and API integration are currently caught only by manual runs.
- Backend custom markers `unit`, `integration`, `property`, and `slow` are declared in `backend/pytest.ini:10`, but no actual uses of those markers were detected in `backend/tests`; selective suite execution is not standardized.
- `hypothesis` and `testcontainers` are declared in `backend/requirements.txt:43`, but repository tests do not currently use them; the intended stronger property and containerized integration coverage is absent.
- Integration coverage is skewed toward vector storage; no full-path tests were found for upload orchestration, frontend-backend interaction, or user-critical browser flows.
- `backend/tests/integration/test_vector_service_integration.py` imports from `backend.src...`, while most tests import from `src...`; test import style is inconsistent and may be sensitive to how `PYTHONPATH` is set.

---

*Testing analysis: 2026-03-27*
