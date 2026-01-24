"""Query API endpoints."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from ..services.query_service import get_query_service
from ..services.context_retriever import get_context_retriever

router = APIRouter(prefix="/query", tags=["query"])


class FindCallersRequest(BaseModel):
    function_id: str
    project_id: str


class FindDependenciesRequest(BaseModel):
    function_id: str
    project_id: str


class ImpactAnalysisRequest(BaseModel):
    function_id: str
    project_id: str
    max_depth: int = 5


class SemanticSearchRequest(BaseModel):
    query: str
    project_ids: List[str]
    top_k: int = 20


class ContextRetrievalRequest(BaseModel):
    query: str
    project_id: str
    token_budget: int = 8000
    manual_entity_ids: Optional[List[str]] = None


@router.post("/callers")
async def find_callers(request: FindCallersRequest):
    """Find all functions that call the specified function."""
    query_service = get_query_service()
    
    try:
        result = query_service.find_callers(
            function_id=request.function_id,
            project_id=request.project_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/dependencies")
async def find_dependencies(request: FindDependenciesRequest):
    """Find all dependencies of the specified function."""
    query_service = get_query_service()
    
    try:
        result = query_service.find_dependencies(
            function_id=request.function_id,
            project_id=request.project_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/impact")
async def impact_analysis(request: ImpactAnalysisRequest):
    """Perform impact analysis for a function."""
    query_service = get_query_service()
    
    try:
        result = query_service.impact_analysis(
            function_id=request.function_id,
            project_id=request.project_id,
            max_depth=request.max_depth
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search")
async def semantic_search(request: SemanticSearchRequest):
    """Perform semantic code search."""
    query_service = get_query_service()
    
    try:
        results = query_service.semantic_search(
            query=request.query,
            project_ids=request.project_ids,
            top_k=request.top_k
        )
        return {"results": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/context")
async def retrieve_context(request: ContextRetrievalRequest):
    """Retrieve relevant code context for AI prompts."""
    context_retriever = get_context_retriever()
    
    try:
        result = context_retriever.retrieve_context(
            query=request.query,
            project_id=request.project_id,
            token_budget=request.token_budget,
            manual_entity_ids=request.manual_entity_ids
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
