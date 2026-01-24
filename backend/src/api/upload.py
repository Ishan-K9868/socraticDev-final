"""Upload API endpoints."""

from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import List, Dict
from pydantic import BaseModel, Field

from ..services.upload_service import get_upload_service
from ..tasks.upload_tasks import process_project_upload

router = APIRouter(prefix="/upload", tags=["upload"])


class UploadResponse(BaseModel):
    session_id: str
    project_id: str
    status: str
    message: str


class UploadStatusResponse(BaseModel):
    session_id: str
    project_id: str
    status: str
    progress: float
    files_processed: int
    entities_extracted: int
    errors: List[str]
    statistics: Dict = Field(default_factory=dict)


@router.post("/project", response_model=UploadResponse)
async def upload_project(
    project_name: str = Form(...),
    files: List[UploadFile] = File(...),
    user_id: str = Form("default_user")
):
    """Upload project files for processing."""
    upload_service = get_upload_service()
    
    try:
        # Create upload session
        session = upload_service.upload_project(
            project_name=project_name,
            files=files,
            user_id=user_id
        )
        
        return UploadResponse(
            session_id=session.session_id,
            project_id=session.project_id,
            status=session.status,
            message=f"Upload initiated for project: {project_name}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/github", response_model=UploadResponse)
async def upload_from_github(
    project_name: str = Form(...),
    github_url: str = Form(...),
    user_id: str = Form("default_user")
):
    """Upload project from GitHub URL."""
    upload_service = get_upload_service()
    
    try:
        session = upload_service.upload_from_github(
            project_name=project_name,
            github_url=github_url,
            user_id=user_id
        )
        
        return UploadResponse(
            session_id=session.session_id,
            project_id=session.project_id,
            status=session.status,
            message=f"GitHub upload initiated for: {github_url}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{session_id}", response_model=UploadStatusResponse)
async def get_upload_status(session_id: str):
    """Get upload session status."""
    upload_service = get_upload_service()
    
    try:
        session = upload_service.get_upload_status(session_id)
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return UploadStatusResponse(
            session_id=session.session_id,
            project_id=session.project_id,
            status=session.status,
            progress=session.progress,
            files_processed=session.files_processed,
            entities_extracted=session.entities_extracted,
            errors=session.errors,
            statistics=session.statistics
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"ERROR in get_upload_status: {error_detail}")
        raise HTTPException(status_code=500, detail=str(e))
