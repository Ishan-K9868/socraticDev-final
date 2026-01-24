"""Visualization API endpoints."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from ..services.query_service import get_query_service, GraphFilters
from ..models.base import EntityType, Language

router = APIRouter(prefix="/visualization", tags=["visualization"])


class GraphVisualizationRequest(BaseModel):
    project_id: str
    entity_types: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    file_patterns: Optional[List[str]] = None
    max_nodes: int = 500


@router.post("/graph")
async def get_graph_visualization(request: GraphVisualizationRequest):
    """Get graph visualization data for ReactFlow."""
    query_service = get_query_service()
    
    try:
        # Convert string entity types to EntityType enums
        entity_types = None
        if request.entity_types:
            entity_types = [EntityType(et) for et in request.entity_types]
        
        # Create filters
        filters = GraphFilters(
            entity_types=entity_types,
            languages=request.languages,
            file_patterns=request.file_patterns,
            max_nodes=request.max_nodes
        )
        
        # Get visualization data
        viz_data = await query_service.get_graph_visualization(
            project_id=request.project_id,
            filters=filters
        )
        
        # Convert dataclass to dict for JSON serialization
        from dataclasses import asdict
        return asdict(viz_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
