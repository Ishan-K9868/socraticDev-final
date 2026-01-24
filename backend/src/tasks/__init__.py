"""Celery tasks for async processing."""

from .upload_tasks import process_project_upload

__all__ = ['process_project_upload']
