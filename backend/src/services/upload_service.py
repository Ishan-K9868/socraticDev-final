"""Upload Service for handling project uploads and coordinating parsing workflow."""

import asyncio
import uuid
import json
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
from pathlib import Path
import threading
import shutil
import subprocess
import tempfile

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

    def _has_active_celery_workers(self) -> bool:
        """Return True when at least one Celery worker is reachable."""
        try:
            from ..celery_app import celery_app

            inspector = celery_app.control.inspect(timeout=1)
            ping_result = inspector.ping() if inspector else None
            return bool(ping_result)
        except Exception as e:
            logger.warning(f"Could not inspect Celery workers: {e}")
            return False

    def _start_local_processing(
        self,
        session_id: str,
        project_id: str,
        project_name: str,
        files: List[tuple],
        user_id: str,
    ) -> None:
        """Fallback processing path when Celery workers are unavailable."""

        def _runner():
            try:
                from ..tasks.upload_tasks import _process_project_upload_async

                asyncio.run(
                    _process_project_upload_async(
                        session_id=session_id,
                        project_id=project_id,
                        project_name=project_name,
                        files=files,
                        user_id=user_id,
                    )
                )
            except Exception as e:
                logger.error(f"Local upload processing failed for {session_id}: {e}", exc_info=True)
                self.update_session_status(
                    session_id=session_id,
                    status="failed",
                    errors=[f"Processing failed: {str(e)}"],
                )

        worker_thread = threading.Thread(
            target=_runner,
            daemon=True,
            name=f"upload-local-{session_id}",
        )
        worker_thread.start()

    def _dispatch_processing_task(
        self,
        session_id: str,
        project_id: str,
        project_name: str,
        file_data: List[tuple],
        user_id: str,
    ) -> None:
        """Dispatch processing through Celery, with local fallback."""
        from ..tasks.upload_tasks import process_project_upload

        queued_with_celery = False
        if self._has_active_celery_workers():
            try:
                logger.info(f"Queueing Celery task for session {session_id}")
                task = process_project_upload.delay(
                    session_id=session_id,
                    project_id=project_id,
                    project_name=project_name,
                    files=file_data,
                    user_id=user_id
                )
                logger.info(f"Celery task queued with ID: {task.id}")
                queued_with_celery = True
            except Exception as e:
                logger.warning(f"Celery dispatch failed for session {session_id}: {e}")

        if not queued_with_celery:
            logger.warning(
                f"No active Celery worker for session {session_id}; using local background processing fallback"
            )
            self.update_session_status(session_id=session_id, status="processing", progress=0.0)
            self._start_local_processing(
                session_id=session_id,
                project_id=project_id,
                project_name=project_name,
                files=file_data,
                user_id=user_id,
            )

    def _normalize_github_repo_url(self, github_url: str) -> str:
        """Validate and normalize GitHub URL to clone form."""
        cleaned = (github_url or "").strip()
        if not cleaned.startswith("https://github.com/"):
            raise InvalidRequestError("Invalid GitHub URL")

        cleaned = cleaned.rstrip("/")
        if cleaned.endswith(".git"):
            cleaned = cleaned[:-4]

        parts = cleaned.split("/")
        # https://github.com/{owner}/{repo}
        if len(parts) < 5 or not parts[3] or not parts[4]:
            raise InvalidRequestError("Invalid GitHub URL")

        owner = parts[3]
        repo = parts[4].split("?")[0].split("#")[0]
        if not owner or not repo:
            raise InvalidRequestError("Invalid GitHub URL")

        return f"https://github.com/{owner}/{repo}.git"

    def _collect_repository_files(self, repo_dir: Path) -> List[tuple]:
        """Collect UTF-8 source files from cloned repo as (path, content)."""
        skip_dirs = {
            ".git",
            "node_modules",
            ".venv",
            "venv",
            "__pycache__",
            "dist",
            "build",
            ".next",
            ".idea",
            ".vscode",
        }

        max_file_size_bytes = settings.max_file_size_mb * 1024 * 1024
        collected: List[tuple] = []

        for path in repo_dir.rglob("*"):
            if not path.is_file():
                continue

            rel_parts = set(path.relative_to(repo_dir).parts)
            if rel_parts & skip_dirs:
                continue

            if len(collected) >= settings.max_files_per_project:
                raise FileSizeExceededError(
                    f"Project exceeds maximum file limit of {settings.max_files_per_project}"
                )

            try:
                if path.stat().st_size > max_file_size_bytes:
                    logger.debug(f"Skipping large file: {path}")
                    continue
            except OSError:
                continue

            try:
                content = path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                # Skip binary/non-utf8 files.
                continue
            except OSError:
                continue

            relative = path.relative_to(repo_dir).as_posix()
            collected.append((relative, content))

        return collected

    def _start_github_processing(
        self,
        session_id: str,
        project_id: str,
        project_name: str,
        github_url: str,
        user_id: str,
        branch: str,
    ) -> None:
        """Clone GitHub repo in background and dispatch regular processing."""

        def _runner():
            temp_root = Path(tempfile.mkdtemp(prefix="socraticdev-github-"))
            clone_dir = temp_root / "repo"
            try:
                clone_url = self._normalize_github_repo_url(github_url)
                self.update_session_status(session_id=session_id, status="processing", progress=0.05)

                clone_cmd = [
                    "git",
                    "clone",
                    "--depth",
                    "1",
                    "--single-branch",
                    "--branch",
                    branch,
                    clone_url,
                    str(clone_dir),
                ]
                result = subprocess.run(clone_cmd, capture_output=True, text=True, check=False)
                if result.returncode != 0:
                    # Fallback to default branch if requested branch fails.
                    fallback_cmd = ["git", "clone", "--depth", "1", clone_url, str(clone_dir)]
                    result = subprocess.run(fallback_cmd, capture_output=True, text=True, check=False)
                    if result.returncode != 0:
                        stderr = (result.stderr or "").strip()
                        raise InvalidRequestError(f"Failed to clone repository: {stderr or 'unknown git error'}")

                file_data = self._collect_repository_files(clone_dir)
                if not file_data:
                    raise InvalidRequestError("No readable source files found in repository")

                self.update_session_status(
                    session_id=session_id,
                    progress=0.1,
                    total_files=len(file_data),
                )
                self._dispatch_processing_task(
                    session_id=session_id,
                    project_id=project_id,
                    project_name=project_name,
                    file_data=file_data,
                    user_id=user_id,
                )
            except Exception as e:
                logger.error(f"GitHub upload processing failed for {session_id}: {e}", exc_info=True)
                self.update_session_status(
                    session_id=session_id,
                    status="failed",
                    errors=[f"GitHub processing failed: {str(e)}"],
                )
            finally:
                shutil.rmtree(temp_root, ignore_errors=True)

        worker_thread = threading.Thread(
            target=_runner,
            daemon=True,
            name=f"upload-github-{session_id}",
        )
        worker_thread.start()
    
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

        self._dispatch_processing_task(
            session_id=session_id,
            project_id=project_id,
            project_name=project_name,
            file_data=file_data,
            user_id=user_id,
        )
        
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
        if not github_url:
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
            status="processing",
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

        self._start_github_processing(
            session_id=session_id,
            project_id=project_id,
            project_name=project_name,
            github_url=github_url,
            user_id=user_id,
            branch=branch,
        )
        
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
        total_files: Optional[int] = None,
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
        if total_files is not None:
            session.total_files = total_files
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
