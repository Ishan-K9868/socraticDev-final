"""Pytest configuration and fixtures."""

import pytest
from typing import Generator
from fastapi.testclient import TestClient

from src.main import app
from src.config import settings


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """Create a test client for the FastAPI application."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def test_settings():
    """Provide test settings."""
    return settings


@pytest.fixture(autouse=True)
def reset_settings():
    """Reset settings after each test."""
    yield
    # Reset any modified settings here if needed
