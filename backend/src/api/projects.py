"""Project management API endpoints."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from ..services.project_service import get_project_service
from ..services.graph_service import GraphService

router = APIRouter(prefix="/projects", tags=["projects"])


class ProjectResponse(BaseModel):
    id: str
    name: str
    file_count: int
    entity_count: int
    status: str


class UpdateProjectRequest(BaseModel):
    changed_files: List[dict]
    deleted_files: List[str]


@router.get("/", response_model=List[ProjectResponse])
async def list_projects():
    """List all projects."""
    graph_service = GraphService()
    
    try:
        # Query all projects from Neo4j
        query = """
        MATCH (p:Project)
        OPTIONAL MATCH (p)<-[:BELONGS_TO]-(f:File)
        WITH p, count(DISTINCT f) AS file_count
        OPTIONAL MATCH (e)
        WHERE e.project_id = p.id
          AND (e:Function OR e:Class OR e:Variable OR e:Import)
        WITH p, file_count, count(e) AS entity_count
        RETURN p.id AS id, p.name AS name, file_count, entity_count, p.status AS status
        """
        
        result = await graph_service.neo4j.execute_with_retry(query, {})
        
        projects = [
            ProjectResponse(
                id=record["id"],
                name=record["name"],
                file_count=record["file_count"] or 0,
                entity_count=record["entity_count"] or 0,
                status=record.get("status", "active")
            )
            for record in result
        ]
        
        return projects
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str):
    """Get project details."""
    graph_service = GraphService()
    
    try:
        stats = await graph_service.get_project_stats(project_id)
        
        if not stats:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return ProjectResponse(
            id=project_id,
            name=stats.get("name", "Unknown"),
            file_count=stats.get("file_count", 0),
            entity_count=stats.get("entity_count", 0),
            status=stats.get("status", "active")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{project_id}")
async def update_project(project_id: str, request: UpdateProjectRequest):
    """Update project with changed files."""
    project_service = get_project_service()
    
    try:
        # Convert request data to proper format
        # This is simplified - in production, you'd parse the changed_files properly
        changed_files = []  # List of (file_path, entities, relationships)
        deleted_files = request.deleted_files
        
        stats = await project_service.update_project(
            project_id=project_id,
            changed_files=changed_files,
            deleted_files=deleted_files
        )
        
        return {"message": "Project updated successfully", "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{project_id}")
async def delete_project(project_id: str):
    """Delete a project and all its data."""
    project_service = get_project_service()
    
    try:
        stats = await project_service.delete_project(project_id)
        return {"message": "Project deleted successfully", "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
