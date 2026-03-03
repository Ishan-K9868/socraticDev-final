"""Unit tests for upload task helper functions."""

import json
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest
from src.models.base import CodeEntity, CodeRelationship, EntityType, Language, RelationshipType
from src.services.code_parser import CodeParserService
from src.tasks import upload_tasks
from src.tasks.upload_tasks import _build_file_entities, _enrich_relationships_for_visualization


def test_build_file_entities_generates_unique_ids_for_same_filename():
    parser = CodeParserService()
    files = [
        ("src/feature_a/index.ts", "export const a = 1;"),
        ("src/feature_b/index.ts", "export const b = 2;"),
    ]

    entities = _build_file_entities(files, "proj_test", parser)
    ids = [entity.id for entity in entities]

    assert len(ids) == 2
    assert len(set(ids)) == 2


def test_enrich_relationships_resolves_ts_alias_import_to_project_file():
    parser = CodeParserService()
    files = [
        ("src/main.ts", "import { helper } from '@app/helper'"),
        ("src/utils/helper.ts", "export const helper = () => 1;"),
        (
            "tsconfig.json",
            json.dumps(
                {
                    "compilerOptions": {
                        "baseUrl": "src",
                        "paths": {"@app/*": ["utils/*"]},
                    }
                }
            ),
        ),
    ]
    file_entities = _build_file_entities(files, "proj_test", parser)
    file_by_path = {entity.file_path: entity for entity in file_entities}

    import_entity = CodeEntity(
        id="proj_test_import_main_1",
        project_id="proj_test",
        entity_type=EntityType.IMPORT,
        name="@app/helper",
        file_path="src/main.ts",
        start_line=1,
        end_line=1,
        signature="import { helper } from '@app/helper'",
        language=Language.TYPESCRIPT,
        metadata={"module_name": "@app/helper", "imported_names": ["helper"]},
    )
    relationships = [
        CodeRelationship(
            source_id=file_by_path["src/main.ts"].id,
            target_id="external:@app/helper",
            relationship_type=RelationshipType.IMPORTS,
        )
    ]

    enriched = _enrich_relationships_for_visualization(
        entities=[*file_entities, import_entity],
        relationships=relationships,
        files=files,
    )

    assert any(
        rel.relationship_type == RelationshipType.IMPORTS
        and rel.source_id == file_by_path["src/main.ts"].id
        and rel.target_id == file_by_path["src/utils/helper.ts"].id
        for rel in enriched
    )


def _setup_upload_task_mocks(monkeypatch, create_project_side_effect=None):
    upload_service = MagicMock()
    upload_service.update_session_status = MagicMock()
    monkeypatch.setattr(upload_tasks, "get_upload_service", lambda: upload_service)

    parser_instance = MagicMock()
    parser_instance.parse_file.return_value = SimpleNamespace(entities=[], relationships=[], errors=[])
    parser_instance.language_detector.detect_language.return_value = None
    monkeypatch.setattr(upload_tasks, "CodeParserService", lambda: parser_instance)

    graph_service = MagicMock()
    graph_service.create_project = AsyncMock(side_effect=create_project_side_effect)
    graph_service.create_entities = AsyncMock()
    graph_service.create_relationships = AsyncMock()
    monkeypatch.setattr(upload_tasks, "GraphService", lambda manager: graph_service)

    vector_service = MagicMock()
    vector_service.store_embedding = MagicMock()
    monkeypatch.setattr(upload_tasks, "VectorService", lambda: vector_service)

    gemini_client = MagicMock()
    gemini_client.generate_code_embedding = AsyncMock(return_value=[0.1])
    monkeypatch.setattr(upload_tasks, "GeminiClient", lambda: gemini_client)

    manager_instance = MagicMock()
    manager_instance.close = AsyncMock()
    manager_ctor = MagicMock(return_value=manager_instance)
    monkeypatch.setattr("src.services.neo4j_manager.Neo4jConnectionManager", manager_ctor)

    forbidden_getter = MagicMock(side_effect=AssertionError("get_neo4j_manager should not be used"))
    monkeypatch.setattr("src.services.neo4j_manager.get_neo4j_manager", forbidden_getter)

    return {
        "upload_service": upload_service,
        "graph_service": graph_service,
        "manager_instance": manager_instance,
        "manager_ctor": manager_ctor,
    }


@pytest.mark.asyncio
async def test_upload_task_uses_fresh_neo4j_manager(monkeypatch):
    mocks = _setup_upload_task_mocks(monkeypatch)

    await upload_tasks._process_project_upload_async(
        session_id="session_1",
        project_id="proj_1",
        project_name="Demo",
        files=[("src/main.py", "print('ok')")],
        user_id="user_1",
    )

    mocks["manager_ctor"].assert_called_once()


@pytest.mark.asyncio
async def test_upload_task_closes_neo4j_manager_on_success(monkeypatch):
    mocks = _setup_upload_task_mocks(monkeypatch)

    await upload_tasks._process_project_upload_async(
        session_id="session_1",
        project_id="proj_1",
        project_name="Demo",
        files=[("src/main.py", "print('ok')")],
        user_id="user_1",
    )

    mocks["manager_instance"].close.assert_awaited_once()


@pytest.mark.asyncio
async def test_upload_task_closes_neo4j_manager_on_exception(monkeypatch):
    mocks = _setup_upload_task_mocks(monkeypatch, create_project_side_effect=RuntimeError("boom"))

    with pytest.raises(RuntimeError, match="boom"):
        await upload_tasks._process_project_upload_async(
            session_id="session_1",
            project_id="proj_1",
            project_name="Demo",
            files=[("src/main.py", "print('ok')")],
            user_id="user_1",
        )

    mocks["manager_instance"].close.assert_awaited_once()
