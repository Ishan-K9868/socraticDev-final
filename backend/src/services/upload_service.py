"""Upload Service for handling project uploads and coordinating parsing workflow."""

import asyncio
import uuid
import json
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
from pathlib import Path

from ..models.base import UploadSession, Project, ParseResult
from ..config.settings import settings
from ..utils.errors import InvalidRequestError, FileSizeExceededError

logger = logging.getLogger(__name__)

# Session storage directory
SESSION_STORAGE_DIR = Path("./upload_sessions")
SESSION_STORAGE_DIR.mkdir(exist_ok=True)


class UploadService:
    """Service for handling project uploads and coordinating parsing workflow."""
    
    def __init__(self):
        """Initialize the upload service."""
        logger.info("Initialized Upload Service with file-based session storage")
    
    def _get_session_file(self, session_id: str) -> Path:
        """Get the file path for a session."""
        return SESSION_STORAGE_DIR / f"{session_id}.json"
    
    def _save_session(self, session: UploadSession) -> None:
        """Save session to file."""
        session_file = self._get_session_file(session.session_id)
        session_dict = session.dict()
        # Convert datetime to ISO format
        session_dict['created_at'] = session.created_at.isoformat()
        session_dict['updated_at'] = session.updated_at.isoformat()
        
        with open(session_file, 'w') as f:
            json.dump(session_dict, f)
    
    def _load_session(self, session_id: str) -> Optional[UploadSession]:
        """Load session from file."""
        session_file = self._get_session_file(session_id)
        if not session_file.exists():
            return None
        
        try:
            with open(session_file, 'r') as f:
                session_dict = json.load(f)
            
            # Convert ISO format back to datetime
            session_dict['created_at'] = datetime.fromisoformat(session_dict['created_at'])
            session_dict['updated_at'] = datetime.fromisoformat(session_dict['updated_at'])
            
            return UploadSession(**session_dict)
        except Exception as e:
            logger.error(f"Failed to load session {session_id}: {e}")
            return None
    
    def upload_project(
        self,
        project_name: str,
        files: List[tuple],  # List of (filename, content) tuples
        user_id: str
    ) -> UploadSession:
        """Initiate project upload and parsing.
        
        Args:
            project_name: Name of the project
            files: List of (filename, content) tuples
            user_id: User identifier
            
        Returns:
            UploadSession with session_id for status polling
            
        Raises:
            InvalidRequestError: If project name is invalid
            FileSizeExceededError: If file count exceeds limit
        """
        if not project_name or not project_name.strip():
            raise InvalidRequestError("Project name cannot be empty")
        
        if len(files) > settings.max_files_per_project:
            raise FileSizeExceededError(
                f"Project exceeds maximum file limit of {settings.max_files_per_project}"
            )
        
        # Create project and session
        project_id = f"proj_{uuid.uuid4().hex[:12]}"
        session_id = f"session_{uuid.uuid4().hex[:12]}"
        
        session = UploadSession(
            session_id=session_id,
            project_id=project_id,
            status="pending",
            progress=0.0,
            files_processed=0,
            total_files=len(files),
            entities_extracted=0,
            errors=[],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        self._save_session(session)
        
        logger.info(
            f"Created upload session {session_id} for project {project_name} "
            f"with {len(files)} files"
        )
        
        # Queue the processing task with Celery
        from ..tasks.upload_tasks import process_project_upload
        
        # Convert UploadFile objects to (filename, content) tuples
        file_data = []
        for file in files:
            # Read file content
            content = file.file.read()
            if isinstance(content, bytes):
                content = content.decode('utf-8', errors='ignore')
            file_data.append((file.filename, content))
            # Reset file pointer
            file.file.seek(0)
        
        # Trigger async processing
        logger.info(f"Queueing Celery task for session {session_id}")
        task = process_project_upload.delay(
            session_id=session_id,
            project_id=project_id,
            project_name=project_name,
            files=file_data,
            user_id=user_id
        )
        logger.info(f"Celery task queued with ID: {task.id}")
        
        return session
    
    def upload_from_github(
        self,
        project_name: str,
        github_url: str,
        user_id: str,
        branch: str = "main"
    ) -> UploadSession:
        """Upload project from GitHub repository.
        
        Args:
            project_name: Name for the project
            github_url: GitHub repository URL
            user_id: User identifier
            branch: Branch name (default: main)
            
        Returns:
            UploadSession with session_id for status polling
            
        Raises:
            InvalidRequestError: If GitHub URL is invalid
        """
        if not github_url or not github_url.startswith("https://github.com/"):
            raise InvalidRequestError("Invalid GitHub URL")
        
        # Use provided project name instead of extracting from URL
        if not project_name or not project_name.strip():
            # Fallback: extract from URL if not provided
            parts = github_url.rstrip('/').split('/')
            project_name = parts[-1] if parts else "unknown"
        
        # Create session
        project_id = f"proj_{uuid.uuid4().hex[:12]}"
        session_id = f"session_{uuid.uuid4().hex[:12]}"
        
        session = UploadSession(
            session_id=session_id,
            project_id=project_id,
            status="pending",
            progress=0.0,
            files_processed=0,
            total_files=0,  # Will be determined after cloning
            entities_extracted=0,
            errors=[],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        self._save_session(session)
        
        logger.info(
            f"Created upload session {session_id} for GitHub project {github_url}"
        )
        
        # Queue the GitHub cloning and processing task
        # Will be implemented with Celery in task 7.4
        
        return session
    
    def get_upload_status(self, session_id: str) -> Optional[UploadSession]:
        """Get the status of an upload session.
        
        Args:
            session_id: Session identifier
            
        Returns:
            UploadSession if found, None otherwise
        """
        return self._load_session(session_id)
    
    def update_session_status(
        self,
        session_id: str,
        status: Optional[str] = None,
        progress: Optional[float] = None,
        files_processed: Optional[int] = None,
        entities_extracted: Optional[int] = None,
        errors: Optional[List[str]] = None,
        statistics: Optional[Dict[str, Any]] = None
    ) -> None:
        """Update the status of an upload session.
        
        Args:
            session_id: Session identifier
            status: New status (pending, processing, completed, failed)
            progress: Progress percentage (0.0 to 1.0)
            files_processed: Number of files processed
            entities_extracted: Number of entities extracted
            errors: List of error messages
            statistics: Processing statistics
        """
        session = self._load_session(session_id)
        if not session:
            logger.warning(f"Session {session_id} not found")
            return
        
        if status is not None:
            session.status = status
        if progress is not None:
            session.progress = progress
        if files_processed is not None:
            session.files_processed = files_processed
        if entities_extracted is not None:
            session.entities_extracted = entities_extracted
        if errors is not None:
            session.errors.extend(errors)
        if statistics is not None:
            session.statistics = statistics
        
        session.updated_at = datetime.utcnow()
        
        # Save the updated session back to file
        self._save_session(session)
        
        logger.debug(
            f"Updated session {session_id}: status={session.status}, "
            f"progress={session.progress:.1%}"
        )


# Global service instance
_upload_service: Optional[UploadService] = None


def get_upload_service() -> UploadService:
    """Get or create the global upload service instance."""
    global _upload_service
    if _upload_service is None:
        _upload_service = UploadService()
    return _upload_service
