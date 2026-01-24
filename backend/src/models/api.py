"""API request and response models."""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from fastapi import UploadFile

from .base import GraphFilters, EntityType, Language


class UploadProjectRequest(BaseModel):
    """Request model for project upload."""
    project_name: str


class UploadFromGitHubRequest(BaseModel):
    """Request model for GitHub project upload."""
    project_name: str
    github_url: str
    branch: str = "main"


class SemanticSearchRequest(BaseModel):
    """Request model for semantic search."""
    query: str
    project_ids: List[str]
    top_k: int = 20
    similarity_threshold: float = 0.7


class FindCallersRequest(BaseModel):
    """Request model for finding function callers."""
    function_id: str
    project_id: str


class FindDependenciesRequest(BaseModel):
    """Request model for finding function dependencies."""
    function_id: str
    project_id: str


class ImpactAnalysisRequest(BaseModel):
    """Request model for impact analysis."""
    function_id: str
    project_id: str
    max_depth: int = 5


class ContextRetrievalRequest(BaseModel):
    """Request model for context retrieval."""
    query: str
    project_id: str
    token_budget: int = 8000
    manual_entity_ids: Optional[List[str]] = None


class GraphVisualizationRequest(BaseModel):
    """Request model for graph visualization."""
    project_id: str
    filters: GraphFilters


class ErrorResponse(BaseModel):
    """Standard error response format."""
    error_code: str
    message: str
    details: Optional[dict] = None
    timestamp: datetime
    request_id: str
