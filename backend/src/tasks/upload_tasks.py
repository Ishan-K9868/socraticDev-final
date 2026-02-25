"""Celery tasks for project upload and processing."""

import logging
import json
from pathlib import PurePosixPath
from typing import List, Tuple
from datetime import datetime
from typing import Dict, Optional, Set

from ..celery_app import celery_app
from ..services.code_parser import CodeParserService
from ..services.graph_service import GraphService
from ..services.vector_service import VectorService
from ..services.gemini_client import GeminiClient
from ..services.upload_service import get_upload_service
from ..models.base import CodeEntity, CodeRelationship, RelationshipType, EntityType

logger = logging.getLogger(__name__)


def _resolve_import_to_project_file(
    source_file_path: str,
    module_name: str,
    files_by_path: Dict[str, CodeEntity],
    files_by_stem: Dict[str, List[CodeEntity]],
    path_aliases: List[Tuple[str, str]],
) -> Optional[CodeEntity]:
    """Resolve JS/TS import modules to internal project files when possible."""
    if not module_name:
        return None

    normalized_source = source_file_path.replace("\\", "/")
    source_dir = str(PurePosixPath(normalized_source).parent)

    candidates: List[str] = []
    if module_name.startswith("."):
        base = str(PurePosixPath(source_dir).joinpath(module_name))
        candidates.extend(
            [
                base,
                f"{base}.ts",
                f"{base}.tsx",
                f"{base}.js",
                f"{base}.jsx",
                f"{base}.py",
                f"{base}/index.ts",
                f"{base}/index.tsx",
                f"{base}/index.js",
                f"{base}/index.jsx",
            ]
        )
    else:
        candidates.extend(
            [module_name, f"{module_name}.ts", f"{module_name}.tsx", f"{module_name}.js", f"{module_name}.jsx"]
        )
        for alias_prefix, target_prefix in path_aliases:
            if module_name.startswith(alias_prefix):
                mapped = f"{target_prefix}{module_name[len(alias_prefix):]}"
                candidates.extend(
                    [
                        mapped,
                        f"{mapped}.ts",
                        f"{mapped}.tsx",
                        f"{mapped}.js",
                        f"{mapped}.jsx",
                        f"{mapped}/index.ts",
                        f"{mapped}/index.tsx",
                        f"{mapped}/index.js",
                        f"{mapped}/index.jsx",
                    ]
                )

    for candidate in candidates:
        normalized = str(PurePosixPath(candidate)).replace("\\", "/")
        if normalized in files_by_path:
            return files_by_path[normalized]
        if normalized.startswith("./"):
            normalized = normalized[2:]
            if normalized in files_by_path:
                return files_by_path[normalized]

    stem = module_name.split("/")[-1]
    if stem in files_by_stem and len(files_by_stem[stem]) == 1:
        return files_by_stem[stem][0]
    return None


def _enrich_relationships_for_visualization(
    entities: List[CodeEntity],
    relationships: List[CodeRelationship],
    files: List[Tuple[str, str]],
) -> List[CodeRelationship]:
    """Add file->file IMPORTS relationships resolved from JS/TS module imports."""
    file_entities = [entity for entity in entities if entity.entity_type.value == "file" and entity.id]
    if not file_entities:
        return relationships

    files_by_path = {entity.file_path.replace("\\", "/"): entity for entity in file_entities}
    files_by_stem: Dict[str, List[CodeEntity]] = {}
    for entity in file_entities:
        files_by_stem.setdefault(PurePosixPath(entity.file_path.replace("\\", "/")).stem, []).append(entity)

    import_entities_by_file: Dict[str, List[CodeEntity]] = {}
    for entity in entities:
        if entity.entity_type.value == "import":
            import_entities_by_file.setdefault(entity.file_path.replace("\\", "/"), []).append(entity)
    path_aliases = _collect_ts_path_aliases(files)
    symbols_by_file_and_name: Dict[Tuple[str, str], List[CodeEntity]] = {}
    for entity in entities:
        if entity.entity_type.value in {"function", "class", "variable"}:
            key = (entity.file_path.replace("\\", "/"), entity.name)
            symbols_by_file_and_name.setdefault(key, []).append(entity)

    existing: Set[Tuple[str, str, str]] = {
        (rel.source_id, rel.target_id, rel.relationship_type.value) for rel in relationships
    }
    enriched = list(relationships)

    for source_file_path, import_entities in import_entities_by_file.items():
        source_file = files_by_path.get(source_file_path)
        if not source_file or not source_file.id:
            continue

        for import_entity in import_entities:
            module_name = (import_entity.metadata or {}).get("module_name", "")
            target_file = _resolve_import_to_project_file(
                source_file_path,
                module_name,
                files_by_path,
                files_by_stem,
                path_aliases,
            )
            if not target_file or not target_file.id:
                continue

            rel_key = (source_file.id, target_file.id, RelationshipType.IMPORTS.value)
            if rel_key in existing:
                continue

            enriched.append(
                CodeRelationship(
                    source_id=source_file.id,
                    target_id=target_file.id,
                    relationship_type=RelationshipType.IMPORTS,
                    metadata={"resolved_from_module": module_name, "resolution": "file_match"},
                )
            )
            existing.add(rel_key)

            imported_names = (import_entity.metadata or {}).get("imported_names", [])
            if import_entity.id and isinstance(imported_names, list):
                for symbol_name in imported_names:
                    key = (target_file.file_path.replace("\\", "/"), symbol_name)
                    for target_symbol in symbols_by_file_and_name.get(key, []):
                        if not target_symbol.id:
                            continue
                        symbol_rel_key = (import_entity.id, target_symbol.id, RelationshipType.USES.value)
                        if symbol_rel_key in existing:
                            continue
                        enriched.append(
                            CodeRelationship(
                                source_id=import_entity.id,
                                target_id=target_symbol.id,
                                relationship_type=RelationshipType.USES,
                                metadata={"resolution": "import_symbol_match", "symbol": symbol_name},
                            )
                        )
                        existing.add(symbol_rel_key)

    return enriched


def _collect_ts_path_aliases(files: List[Tuple[str, str]]) -> List[Tuple[str, str]]:
    """Parse tsconfig path aliases into simple prefix mappings."""
    tsconfig_content = None
    for file_path, content in files:
        normalized = file_path.replace("\\", "/").lower()
        if normalized.endswith("tsconfig.json"):
            tsconfig_content = content
            break

    if not tsconfig_content:
        return []

    try:
        data = json.loads(tsconfig_content)
    except Exception:
        return []

    compiler_options = data.get("compilerOptions", {})
    base_url = compiler_options.get("baseUrl", "")
    paths = compiler_options.get("paths", {})
    aliases: List[Tuple[str, str]] = []
    for raw_alias, targets in paths.items():
        if not isinstance(targets, list) or not targets:
            continue
        alias_prefix = raw_alias.replace("*", "")
        target_prefix = str(targets[0]).replace("*", "")
        if base_url:
            target_prefix = f"{base_url.rstrip('/')}/{target_prefix.lstrip('/')}"
        aliases.append((alias_prefix, target_prefix))
    return aliases


def _build_file_entities(
    files: List[Tuple[str, str]],
    project_id: str,
    parser: CodeParserService,
) -> List[CodeEntity]:
    """Create FILE entities so file-level graph view has complete node coverage."""
    file_entities: List[CodeEntity] = []
    for file_path, content in files:
        language = parser.language_detector.detect_language(file_path)
        if language is None:
            continue
        file_name = PurePosixPath(file_path.replace("\\", "/")).name
        line_count = len(content.splitlines()) if content else 0
        entity = CodeEntity(
            id=parser.build_entity_id(
                project_id=project_id,
                entity_type=EntityType.FILE,
                name=file_name,
                start_line=1,
                file_path=file_path.replace("\\", "/"),
            ),
            project_id=project_id,
            entity_type=EntityType.FILE,
            name=file_name,
            file_path=file_path.replace("\\", "/"),
            start_line=1,
            end_line=max(1, line_count),
            signature=None,
            docstring=None,
            body=None,
            language=language,
            metadata={"full_path": file_path.replace("\\", "/")},
        )
        file_entities.append(entity)
    return file_entities


@celery_app.task(bind=True, name='tasks.process_project_upload')
def process_project_upload(
    self,
    session_id: str,
    project_id: str,
    project_name: str,
    files: List[Tuple[str, str]],  # List of (file_path, content) tuples
    user_id: str
):
    """Process uploaded project: parse, extract entities, generate embeddings, store in databases.
    
    Args:
        self: Celery task instance
        session_id: Upload session identifier
        project_id: Project identifier
        project_name: Project name
        files: List of (file_path, content) tuples
        user_id: User identifier
    """
    import asyncio
    import nest_asyncio
    
    # Allow nested event loops (needed for Celery + asyncio)
    nest_asyncio.apply()
    
    # Get or create event loop
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    # Run the async processing function
    return loop.run_until_complete(_process_project_upload_async(
        session_id, project_id, project_name, files, user_id
    ))


async def _process_project_upload_async(
    session_id: str,
    project_id: str,
    project_name: str,
    files: List[Tuple[str, str]],
    user_id: str
):
    """Async implementation of project upload processing."""
    upload_service = get_upload_service()
    
    try:
        # Update session status to processing
        upload_service.update_session_status(
            session_id=session_id,
            status="processing",
            progress=0.0
        )
        
        logger.info(f"Starting processing for project {project_id} with {len(files)} files")
        
        # Step 1: Parse all files (20% of progress)
        parser = CodeParserService()
        
        all_entities = []
        all_relationships = []
        parse_errors = []
        
        for file_path, content in files:
            try:
                result = parser.parse_file(file_path, content, project_id=project_id)
                all_entities.extend(result.entities)
                all_relationships.extend(result.relationships)
                parse_errors.extend(result.errors)
            except Exception as e:
                error_msg = f"Failed to parse {file_path}: {str(e)}"
                logger.error(error_msg)
                parse_errors.append(error_msg)

        file_entities = _build_file_entities(files, project_id, parser)
        existing_entity_ids = {entity.id for entity in all_entities if entity.id}
        for file_entity in file_entities:
            if file_entity.id not in existing_entity_ids:
                all_entities.append(file_entity)

        all_relationships = _enrich_relationships_for_visualization(all_entities, all_relationships, files)
        
        upload_service.update_session_status(
            session_id=session_id,
            progress=0.2,
            files_processed=len(files),
            errors=parse_errors
        )
        
        logger.info(
            f"Parsed {len(files)} files: "
            f"{len(all_entities)} entities, {len(all_relationships)} relationships"
        )
        
        # Step 2: Store entities and relationships in Neo4j (40% of progress)
        from ..services.neo4j_manager import get_neo4j_manager
        neo4j_manager = get_neo4j_manager()
        graph_service = GraphService(neo4j_manager)
        
        # Create project
        await graph_service.create_project(
            project_id=project_id,
            name=project_name,
            user_id=user_id,
            metadata={'file_count': len(files)}
        )
        
        # Store entities
        if all_entities:
            await graph_service.create_entities(project_id, all_entities)
        
        # Store relationships
        if all_relationships:
            await graph_service.create_relationships(all_relationships)
        
        upload_service.update_session_status(
            session_id=session_id,
            progress=0.4,
            entities_extracted=len(all_entities)
        )
        
        logger.info(f"Stored {len(all_entities)} entities and {len(all_relationships)} relationships in Neo4j")
        
        # Step 3: Generate embeddings (70% of progress)
        gemini_client = GeminiClient()
        embeddings = []
        
        # Generate embeddings in batches
        batch_size = 50
        for i in range(0, len(all_entities), batch_size):
            batch = all_entities[i:i + batch_size]
            
            for entity in batch:
                try:
                    embedding = await gemini_client.generate_code_embedding(entity)
                    embeddings.append((entity, embedding))
                except Exception as e:
                    logger.error(f"Failed to generate embedding for {entity.name}: {e}")
            
            # Update progress
            progress = 0.4 + (0.3 * (i + len(batch)) / len(all_entities))
            upload_service.update_session_status(
                session_id=session_id,
                progress=progress
            )
        
        logger.info(f"Generated {len(embeddings)} embeddings")
        
        # Step 4: Store embeddings in Chroma (90% of progress)
        vector_service = VectorService()
        
        for entity, embedding in embeddings:
            try:
                vector_service.store_embedding(
                    entity_id=entity.id or f"{entity.file_path}:{entity.name}",
                    embedding=embedding,
                    metadata={
                        'entity_type': entity.entity_type.value,
                        'file_path': entity.file_path,
                        'name': entity.name,
                        'project_id': project_id
                    }
                )
            except Exception as e:
                logger.error(f"Failed to store embedding for {entity.name}: {e}")
        
        upload_service.update_session_status(
            session_id=session_id,
            progress=0.9
        )
        
        logger.info(f"Stored {len(embeddings)} embeddings in Chroma")
        
        # Step 5: Calculate statistics and complete (100%)
        statistics = {
            'file_count': len(files),
            'entity_count': len(all_entities),
            'relationship_count': len(all_relationships),
            'embedding_count': len(embeddings),
            'error_count': len(parse_errors)
        }
        
        upload_service.update_session_status(
            session_id=session_id,
            status="completed",
            progress=1.0,
            statistics=statistics
        )
        
        logger.info(f"Completed processing for project {project_id}: {statistics}")
        
        return {
            'status': 'completed',
            'statistics': statistics
        }
        
    except Exception as e:
        logger.error(f"Error processing project {project_id}: {e}", exc_info=True)
        
        upload_service.update_session_status(
            session_id=session_id,
            status="failed",
            errors=[f"Processing failed: {str(e)}"]
        )
        
        raise
