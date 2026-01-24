"""Unit tests for data models."""

import pytest
from datetime import datetime
from src.models import (
    EntityType,
    RelationshipType,
    Language,
    CodeEntity,
    CodeRelationship,
    Project,
    UploadSession,
)


def test_entity_type_enum():
    """Test EntityType enum values."""
    assert EntityType.FILE == "file"
    assert EntityType.FUNCTION == "function"
    assert EntityType.CLASS == "class"
    assert EntityType.VARIABLE == "variable"
    assert EntityType.IMPORT == "import"


def test_relationship_type_enum():
    """Test RelationshipType enum values."""
    assert RelationshipType.DEFINES == "DEFINES"
    assert RelationshipType.CALLS == "CALLS"
    assert RelationshipType.IMPORTS == "IMPORTS"
    assert RelationshipType.EXTENDS == "EXTENDS"
    assert RelationshipType.IMPLEMENTS == "IMPLEMENTS"
    assert RelationshipType.USES == "USES"
    assert RelationshipType.TESTS == "TESTS"


def test_language_enum():
    """Test Language enum values."""
    assert Language.PYTHON == "python"
    assert Language.JAVASCRIPT == "javascript"
    assert Language.TYPESCRIPT == "typescript"
    assert Language.JAVA == "java"


def test_code_entity_creation():
    """Test CodeEntity model creation."""
    entity = CodeEntity(
        project_id="test-project",
        entity_type=EntityType.FUNCTION,
        name="test_function",
        file_path="test.py",
        start_line=1,
        end_line=10,
        signature="def test_function():",
        language=Language.PYTHON
    )
    
    assert entity.project_id == "test-project"
    assert entity.entity_type == EntityType.FUNCTION
    assert entity.name == "test_function"
    assert entity.file_path == "test.py"
    assert entity.start_line == 1
    assert entity.end_line == 10
    assert entity.signature == "def test_function():"
    assert entity.language == Language.PYTHON
    assert entity.metadata == {}


def test_code_relationship_creation():
    """Test CodeRelationship model creation."""
    relationship = CodeRelationship(
        source_id="entity-1",
        target_id="entity-2",
        relationship_type=RelationshipType.CALLS
    )
    
    assert relationship.source_id == "entity-1"
    assert relationship.target_id == "entity-2"
    assert relationship.relationship_type == RelationshipType.CALLS
    assert relationship.metadata == {}


def test_project_creation():
    """Test Project model creation."""
    now = datetime.utcnow()
    project = Project(
        id="project-1",
        name="Test Project",
        user_id="user-1",
        created_at=now,
        file_count=10,
        entity_count=100
    )
    
    assert project.id == "project-1"
    assert project.name == "Test Project"
    assert project.user_id == "user-1"
    assert project.created_at == now
    assert project.file_count == 10
    assert project.entity_count == 100
    assert project.status == "active"


def test_upload_session_creation():
    """Test UploadSession model creation."""
    now = datetime.utcnow()
    session = UploadSession(
        session_id="session-1",
        project_id="project-1",
        status="pending",
        created_at=now,
        updated_at=now
    )
    
    assert session.session_id == "session-1"
    assert session.project_id == "project-1"
    assert session.status == "pending"
    assert session.progress == 0.0
    assert session.files_processed == 0
    assert session.total_files == 0
    assert session.entities_extracted == 0
    assert session.errors == []
    assert session.created_at == now
    assert session.updated_at == now


def test_code_entity_with_metadata():
    """Test CodeEntity with custom metadata."""
    entity = CodeEntity(
        project_id="test-project",
        entity_type=EntityType.CLASS,
        name="TestClass",
        file_path="test.py",
        start_line=1,
        end_line=20,
        language=Language.PYTHON,
        metadata={"is_abstract": True, "methods": ["method1", "method2"]}
    )
    
    assert entity.metadata["is_abstract"] is True
    assert entity.metadata["methods"] == ["method1", "method2"]
