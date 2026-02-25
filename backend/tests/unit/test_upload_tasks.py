"""Unit tests for upload task helper functions."""

import json

from src.models.base import CodeEntity, CodeRelationship, EntityType, Language, RelationshipType
from src.services.code_parser import CodeParserService
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
