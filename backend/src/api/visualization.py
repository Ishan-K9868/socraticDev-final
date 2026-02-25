"""Visualization API endpoints."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Literal

from ..services.query_service import get_query_service, GraphFilters
from ..services.visualizer_ai_service import get_visualizer_ai_service
from ..models.base import EntityType
from ..config import settings

router = APIRouter(prefix="/visualization", tags=["visualization"])


class GraphVisualizationRequest(BaseModel):
    project_id: str
    entity_types: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    file_patterns: Optional[List[str]] = None
    view_mode: Literal["file", "symbol"] = settings.graph_view_mode_default
    include_external: bool = settings.graph_include_external_default
    include_isolated: bool = settings.graph_include_isolated_default
    max_nodes: int = 500
    max_edges: int = 2000


class VisualizerAnalyzeRequest(BaseModel):
    mode: Literal["graph", "execution"]
    code: str
    language: str
    max_steps: int = settings.visualizer_default_max_steps
    timeout_ms: int = settings.visualizer_default_timeout_ms


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
            view_mode=request.view_mode,
            include_external=request.include_external,
            include_isolated=request.include_isolated,
            max_nodes=request.max_nodes,
            max_edges=request.max_edges,
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


@router.post("/analyze")
async def analyze_visualizer_code(request: VisualizerAnalyzeRequest):
    """Analyze code for call graph or execution trace using deterministic backend analysis."""
    if not request.code.strip():
        raise HTTPException(status_code=400, detail="Code is required")

    try:
        service = get_visualizer_ai_service()
        return await service.analyze(
            mode=request.mode,
            code=request.code,
            language=request.language,
            max_steps=request.max_steps,
            timeout_ms=request.timeout_ms,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
