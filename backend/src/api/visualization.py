"""Visualization API endpoints."""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Literal

from ..services.query_service import get_query_service, GraphFilters
from ..services.visualizer_ai_service import get_visualizer_ai_service
from ..models.base import EntityType
from ..config import settings

logger = logging.getLogger(__name__)

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
    allow_execution: Optional[bool] = None


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
        raise HTTPException(status_code=400, detail={"error_code": "invalid_request", "message": "Code is required"})

    if len(request.code) > settings.visualizer_max_code_chars:
        logger.warning("Visualizer analyze rejected: code too large", extra={"mode": request.mode, "size": len(request.code)})
        raise HTTPException(
            status_code=400,
            detail={
                "error_code": "invalid_request",
                "message": f"Code is too large (max {settings.visualizer_max_code_chars} characters)",
            },
        )

    execution_requested = request.mode == "execution"
    execution_enabled = settings.visualizer_execution_enabled and (
        settings.environment.lower() != "production" or settings.visualizer_execution_allow_in_production
    )
    if execution_requested and request.allow_execution is False:
        logger.warning("Visualizer execution rejected: allow_execution=false", extra={"mode": request.mode})
        raise HTTPException(
            status_code=400,
            detail={"error_code": "invalid_request", "message": "Execution mode was explicitly disabled by request"},
        )
    if execution_requested and not execution_enabled:
        logger.warning(
            "Visualizer execution blocked by server policy",
            extra={"environment": settings.environment, "mode": request.mode},
        )
        raise HTTPException(
            status_code=403,
            detail={
                "error_code": "sandbox_blocked",
                "message": "Execution trace is disabled by server policy in this environment",
            },
        )

    try:
        service = get_visualizer_ai_service()
        payload = await service.analyze(
            mode=request.mode,
            code=request.code,
            language=request.language,
            max_steps=request.max_steps,
            timeout_ms=request.timeout_ms,
        )
        meta = payload.get("meta") if isinstance(payload, dict) else None
        if isinstance(meta, dict):
            meta["policy"] = {
                "execution_enabled": execution_enabled,
                "isolation_mode": settings.visualizer_isolation_mode,
            }
        logger.info("Visualizer analyze succeeded", extra={"mode": request.mode, "language": request.language})
        return payload
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error_code": "invalid_request", "message": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error_code": "internal_error", "message": str(e)})
