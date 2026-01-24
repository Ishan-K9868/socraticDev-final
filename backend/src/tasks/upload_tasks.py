"""Celery tasks for project upload and processing."""

import logging
from typing import List, Tuple
from datetime import datetime

from ..celery_app import celery_app
from ..services.code_parser import CodeParserService
from ..services.graph_service import GraphService
from ..services.vector_service import VectorService
from ..services.gemini_client import GeminiClient
from ..services.upload_service import get_upload_service
from ..models.base import CodeEntity, CodeRelationship

logger = logging.getLogger(__name__)


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
