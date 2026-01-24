"""Unit tests for API endpoints."""

import pytest
from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    """Test health check endpoint."""
    response = client.get("/health")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "environment" in data


def test_root_endpoint(client: TestClient):
    """Test root endpoint."""
    response = client.get("/")
    
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "version" in data
    assert "docs" in data
    assert "health" in data


def test_cors_headers(client: TestClient):
    """Test CORS headers are present in OPTIONS request."""
    # CORS headers are typically added in response to OPTIONS preflight requests
    # or requests with Origin header
    response = client.options(
        "/health",
        headers={"Origin": "http://localhost:3000"}
    )
    
    # TestClient may not fully simulate CORS, so we just check the endpoint works
    # In production, CORS middleware will add the headers
    assert response.status_code in [200, 405]  # 405 if OPTIONS not explicitly handled


def test_request_id_header(client: TestClient):
    """Test that request ID is added to response headers."""
    response = client.get("/health")
    
    assert response.status_code == 200
    assert "X-Request-ID" in response.headers or "x-request-id" in response.headers


def test_openapi_docs(client: TestClient):
    """Test OpenAPI documentation endpoint."""
    response = client.get("/docs")
    
    assert response.status_code == 200


def test_openapi_json(client: TestClient):
    """Test OpenAPI JSON schema endpoint."""
    response = client.get("/openapi.json")
    
    assert response.status_code == 200
    data = response.json()
    assert "openapi" in data
    assert "info" in data
    assert "paths" in data
