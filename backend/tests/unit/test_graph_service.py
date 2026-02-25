"""Unit tests for Graph Service.

Tests the Graph Service operations including:
- Project creation
- Entity creation (files, functions, classes, variables, imports)
- Relationship creation
- Graph queries (callers, dependencies, class hierarchy)
- Impact analysis with cycle detection
- Graph visualization data retrieval
"""

import pytest
from datetime import datetime
from typing import List
from unittest.mock import AsyncMock, MagicMock, patch

from src.services.graph_service import GraphService, ClassHierarchy
from src.services.neo4j_manager import Neo4jConnectionManager
from src.models import (
    Project,
    CodeEntity,
    CodeRelationship,
    EntityType,
    RelationshipType,
    Language,
    DependencyTree,
    DependencyNode,
    GraphVisualizationData,
    GraphFilters,
)
from src.utils.errors import DatabaseQueryError


@pytest.fixture
def mock_neo4j_manager():
    """Create a mock Neo4j connection manager."""
    manager = MagicMock(spec=Neo4jConnectionManager)
    manager.execute_with_retry = AsyncMock()
    manager.execute_write_with_retry = AsyncMock()
    return manager


@pytest.fixture
def graph_service(mock_neo4j_manager):
    """Create a Graph Service instance with mocked Neo4j manager."""
    return GraphService(mock_neo4j_manager)


@pytest.fixture
def sample_project():
    """Create a sample project for testing."""
    return Project(
        id="project-123",
        name="Test Project",
        user_id="user-456",
        created_at=datetime.utcnow(),
        file_count=0,
        entity_count=0,
        status="active"
    )


@pytest.fixture
def sample_entities():
    """Create sample code entities for testing."""
    return [
        CodeEntity(
            id="file-1",
            project_id="project-123",
            entity_type=EntityType.FILE,
            name="main.py",
            file_path="/src/main.py",
            start_line=1,
            end_line=100,
            language=Language.PYTHON
        ),
        CodeEntity(
            id="func-1",
            project_id="project-123",
            entity_type=EntityType.FUNCTION,
            name="calculate",
            file_path="/src/main.py",
            start_line=10,
            end_line=20,
            signature="def calculate(x: int) -> int",
            docstring="Calculate something",
            language=Language.PYTHON
        ),
        CodeEntity(
            id="class-1",
            project_id="project-123",
            entity_type=EntityType.CLASS,
            name="Calculator",
            file_path="/src/main.py",
            start_line=25,
            end_line=50,
            docstring="Calculator class",
            language=Language.PYTHON
        ),
    ]


@pytest.fixture
def sample_relationships():
    """Create sample code relationships for testing."""
    return [
        CodeRelationship(
            source_id="func-1",
            target_id="func-2",
            relationship_type=RelationshipType.CALLS
        ),
        CodeRelationship(
            source_id="file-1",
            target_id="func-1",
            relationship_type=RelationshipType.DEFINES
        ),
    ]


class TestGraphServiceInitialization:
    """Test Graph Service initialization."""
    
    def test_initialization(self, mock_neo4j_manager):
        """Test that Graph Service initializes correctly."""
        service = GraphService(mock_neo4j_manager)
        assert service.neo4j == mock_neo4j_manager
    
    @pytest.mark.asyncio
    async def test_initialize_indexes(self, graph_service, mock_neo4j_manager):
        """Test that database indexes are created."""
        mock_neo4j_manager.execute_write_with_retry.return_value = []
        
        await graph_service.initialize_indexes()
        
        # Should create multiple indexes
        assert mock_neo4j_manager.execute_write_with_retry.call_count >= 8


class TestProjectOperations:
    """Test project-related operations."""
    
    @pytest.mark.asyncio
    async def test_create_project(self, graph_service, mock_neo4j_manager):
        """Test creating a project."""
        mock_neo4j_manager.execute_write_with_retry.return_value = [
            {"p": {"id": "project-123", "name": "Test Project"}}
        ]
        
        project = await graph_service.create_project(
            project_id="project-123",
            name="Test Project",
            user_id="user-456"
        )
        
        assert project.id == "project-123"
        assert project.name == "Test Project"
        assert project.user_id == "user-456"
        assert project.status == "active"
        
        # Verify query was called
        mock_neo4j_manager.execute_write_with_retry.assert_called_once()
        call_args = mock_neo4j_manager.execute_write_with_retry.call_args
        assert "CREATE (p:Project" in call_args[0][0]
    
    @pytest.mark.asyncio
    async def test_create_project_with_metadata(self, graph_service, mock_neo4j_manager):
        """Test creating a project with metadata."""
        mock_neo4j_manager.execute_write_with_retry.return_value = [{}]
        
        metadata = {"language": "python", "version": "3.11"}
        project = await graph_service.create_project(
            project_id="project-123",
            name="Test Project",
            user_id="user-456",
            metadata=metadata
        )
        
        assert project.id == "project-123"
    
    @pytest.mark.asyncio
    async def test_create_project_failure(self, graph_service, mock_neo4j_manager):
        """Test project creation failure handling."""
        mock_neo4j_manager.execute_write_with_retry.side_effect = Exception("Database error")
        
        with pytest.raises(DatabaseQueryError, match="Failed to create project"):
            await graph_service.create_project(
                project_id="project-123",
                name="Test Project",
                user_id="user-456"
            )


class TestEntityOperations:
    """Test entity-related operations."""
    
    @pytest.mark.asyncio
    async def test_create_entities_empty_list(self, graph_service):
        """Test creating entities with empty list."""
        result = await graph_service.create_entities("project-123", [])
        assert result == []
    
    @pytest.mark.asyncio
    async def test_create_entities(self, graph_service, mock_neo4j_manager, sample_entities):
        """Test creating multiple entities."""
        # Mock responses for batch creation
        mock_neo4j_manager.execute_write_with_retry.side_effect = [
            [{"node_id": 1}],  # File
            [{"node_id": 2}],  # Function
            [{"node_id": 3}],  # Class
            [],  # Update project counts
        ]
        
        result = await graph_service.create_entities("project-123", sample_entities)
        
        assert len(result) == 3
        assert result == ["1", "2", "3"]
    
    @pytest.mark.asyncio
    async def test_create_entities_with_optional_fields(self, graph_service, mock_neo4j_manager):
        """Test creating entities with all optional fields."""
        entity = CodeEntity(
            id="func-1",
            project_id="project-123",
            entity_type=EntityType.FUNCTION,
            name="test_func",
            file_path="/test.py",
            start_line=1,
            end_line=10,
            signature="def test_func()",
            docstring="Test function",
            body="return True",
            language=Language.PYTHON,
            metadata={"complexity": 5}
        )
        
        mock_neo4j_manager.execute_write_with_retry.side_effect = [
            [{"node_id": 1}],
            [],  # Update counts
        ]
        
        result = await graph_service.create_entities("project-123", [entity])
        assert len(result) == 1
    
    @pytest.mark.asyncio
    async def test_create_entities_batch_by_type(self, graph_service, mock_neo4j_manager):
        """Test that entities are batched by type."""
        entities = [
            CodeEntity(
                id=f"func-{i}",
                project_id="project-123",
                entity_type=EntityType.FUNCTION,
                name=f"func_{i}",
                file_path="/test.py",
                start_line=i,
                end_line=i+5,
                language=Language.PYTHON
            )
            for i in range(3)
        ]
        
        mock_neo4j_manager.execute_write_with_retry.side_effect = [
            [{"node_id": i} for i in range(3)],
            [],  # Update counts
        ]
        
        result = await graph_service.create_entities("project-123", entities)
        
        # Should batch all functions in one call
        assert len(result) == 3
        # First call should be for creating functions
        call_args = mock_neo4j_manager.execute_write_with_retry.call_args_list[0]
        assert "UNWIND $entities" in call_args[0][0]


class TestRelationshipOperations:
    """Test relationship-related operations."""
    
    @pytest.mark.asyncio
    async def test_create_relationships_empty_list(self, graph_service):
        """Test creating relationships with empty list."""
        result = await graph_service.create_relationships([])
        assert result == 0
    
    @pytest.mark.asyncio
    async def test_create_relationships(self, graph_service, mock_neo4j_manager, sample_relationships):
        """Test creating multiple relationships."""
        mock_neo4j_manager.execute_write_with_retry.side_effect = [
            [{"count": 1}],  # CALLS
            [{"count": 1}],  # DEFINES
        ]
        
        result = await graph_service.create_relationships(sample_relationships)
        
        assert result == 2
        assert mock_neo4j_manager.execute_write_with_retry.call_count == 2
    
    @pytest.mark.asyncio
    async def test_create_relationships_with_metadata(self, graph_service, mock_neo4j_manager):
        """Test creating relationships with metadata."""
        rel = CodeRelationship(
            source_id="func-1",
            target_id="func-2",
            relationship_type=RelationshipType.CALLS,
            metadata={"line": 15}
        )
        
        mock_neo4j_manager.execute_write_with_retry.return_value = [{"count": 1}]
        
        result = await graph_service.create_relationships([rel])
        assert result == 1

    @pytest.mark.asyncio
    async def test_create_import_relationships_supports_internal_and_external_targets(
        self, graph_service, mock_neo4j_manager
    ):
        """Test IMPORTS relationships preserve internal targets and external modules."""
        relationships = [
            CodeRelationship(
                source_id="file-1",
                target_id="external:react",
                relationship_type=RelationshipType.IMPORTS,
            ),
            CodeRelationship(
                source_id="file-1",
                target_id="file-2",
                relationship_type=RelationshipType.IMPORTS,
            ),
        ]

        mock_neo4j_manager.execute_write_with_retry.side_effect = [
            [{"count": 1}],
            [{"count": 1}],
        ]

        result = await graph_service.create_relationships(relationships)

        assert result == 2
        assert mock_neo4j_manager.execute_write_with_retry.call_count == 2
        queries = [call.args[0] for call in mock_neo4j_manager.execute_write_with_retry.call_args_list]
        assert any("MERGE (target:ExternalModule" in query for query in queries)
        assert any("MATCH (target {id: rel.target_id})" in query for query in queries)
    
    @pytest.mark.asyncio
    async def test_create_relationships_batch_by_type(self, graph_service, mock_neo4j_manager):
        """Test that relationships are batched by type."""
        relationships = [
            CodeRelationship(
                source_id=f"func-{i}",
                target_id=f"func-{i+1}",
                relationship_type=RelationshipType.CALLS
            )
            for i in range(3)
        ]
        
        mock_neo4j_manager.execute_write_with_retry.return_value = [{"count": 3}]
        
        result = await graph_service.create_relationships(relationships)
        
        assert result == 3
        # Should batch all CALLS in one query
        assert mock_neo4j_manager.execute_write_with_retry.call_count == 1


class TestGraphQueries:
    """Test graph traversal queries."""
    
    @pytest.mark.asyncio
    async def test_find_callers(self, graph_service, mock_neo4j_manager):
        """Test finding callers of a function."""
        mock_neo4j_manager.execute_with_retry.return_value = [
            {
                "caller": {
                    "id": "func-1",
                    "project_id": "project-123",
                    "name": "caller_func",
                    "file_path": "/test.py",
                    "start_line": 1,
                    "end_line": 10,
                    "language": "python",
                    "labels": ["Function"]
                }
            }
        ]
        
        callers = await graph_service.find_callers("func-2")
        
        assert len(callers) == 1
        assert callers[0].name == "caller_func"
        assert callers[0].entity_type == EntityType.FUNCTION
        
        # Verify query
        call_args = mock_neo4j_manager.execute_with_retry.call_args
        assert "MATCH (caller)-[:CALLS]->(target" in call_args[0][0]
    
    @pytest.mark.asyncio
    async def test_find_callers_no_results(self, graph_service, mock_neo4j_manager):
        """Test finding callers when none exist."""
        mock_neo4j_manager.execute_with_retry.return_value = []
        
        callers = await graph_service.find_callers("func-1")
        assert callers == []
    
    @pytest.mark.asyncio
    async def test_find_dependencies(self, graph_service, mock_neo4j_manager):
        """Test finding dependencies of a function."""
        mock_neo4j_manager.execute_with_retry.return_value = [
            {
                "dep": {
                    "id": "func-2",
                    "project_id": "project-123",
                    "name": "dependency_func",
                    "file_path": "/test.py",
                    "start_line": 20,
                    "end_line": 30,
                    "language": "python",
                    "labels": ["Function"]
                }
            }
        ]
        
        deps = await graph_service.find_dependencies("func-1")
        
        assert len(deps) == 1
        assert deps[0].name == "dependency_func"
        
        # Verify query uses CALLS|USES
        call_args = mock_neo4j_manager.execute_with_retry.call_args
        assert "[:CALLS|USES]" in call_args[0][0]
    
    @pytest.mark.asyncio
    async def test_get_class_hierarchy(self, graph_service, mock_neo4j_manager):
        """Test getting class hierarchy."""
        # Mock root class
        mock_neo4j_manager.execute_with_retry.side_effect = [
            # Root query
            [{
                "c": {
                    "id": "class-1",
                    "project_id": "project-123",
                    "name": "MyClass",
                    "file_path": "/test.py",
                    "start_line": 1,
                    "end_line": 50,
                    "language": "python",
                    "labels": ["Class"]
                }
            }],
            # Parents query
            [{
                "parent": {
                    "id": "class-0",
                    "project_id": "project-123",
                    "name": "BaseClass",
                    "file_path": "/base.py",
                    "start_line": 1,
                    "end_line": 30,
                    "language": "python",
                    "labels": ["Class"]
                }
            }],
            # Children query
            [{
                "child": {
                    "id": "class-2",
                    "project_id": "project-123",
                    "name": "ChildClass",
                    "file_path": "/child.py",
                    "start_line": 1,
                    "end_line": 40,
                    "language": "python",
                    "labels": ["Class"]
                }
            }],
        ]
        
        hierarchy = await graph_service.get_class_hierarchy("class-1")
        
        assert hierarchy.root.name == "MyClass"
        assert len(hierarchy.parents) == 1
        assert hierarchy.parents[0].name == "BaseClass"
        assert len(hierarchy.children) == 1
        assert hierarchy.children[0].name == "ChildClass"
    
    @pytest.mark.asyncio
    async def test_get_class_hierarchy_not_found(self, graph_service, mock_neo4j_manager):
        """Test getting hierarchy for non-existent class."""
        mock_neo4j_manager.execute_with_retry.return_value = []
        
        with pytest.raises(DatabaseQueryError, match="Class .* not found"):
            await graph_service.get_class_hierarchy("nonexistent")


class TestImpactAnalysis:
    """Test impact analysis with cycle detection."""
    
    @pytest.mark.asyncio
    async def test_impact_analysis_simple(self, graph_service, mock_neo4j_manager):
        """Test simple impact analysis without cycles."""
        # Mock root function
        mock_neo4j_manager.execute_with_retry.side_effect = [
            # Root query
            [{
                "f": {
                    "id": "func-1",
                    "project_id": "project-123",
                    "name": "root_func",
                    "file_path": "/test.py",
                    "start_line": 1,
                    "end_line": 10,
                    "language": "python",
                    "labels": ["Function"]
                }
            }],
            # Dependencies query
            [
                {
                    "dep": {
                        "id": "func-2",
                        "project_id": "project-123",
                        "name": "dep_func",
                        "file_path": "/test.py",
                        "start_line": 20,
                        "end_line": 30,
                        "language": "python",
                        "labels": ["Function"]
                    },
                    "depth": 1,
                    "node_ids": ["func-1", "func-2"]
                }
            ]
        ]
        
        result = await graph_service.impact_analysis("func-1", max_depth=5)
        
        assert result.root.name == "root_func"
        assert len(result.dependencies) == 1
        assert result.dependencies[0].entity.name == "dep_func"
        assert result.dependencies[0].depth == 1
        assert result.max_depth == 5
        assert result.truncated is False
        assert len(result.circular_dependencies) == 0
    
    @pytest.mark.asyncio
    async def test_impact_analysis_with_cycle(self, graph_service, mock_neo4j_manager):
        """Test impact analysis with circular dependency."""
        mock_neo4j_manager.execute_with_retry.side_effect = [
            # Root query
            [{
                "f": {
                    "id": "func-1",
                    "project_id": "project-123",
                    "name": "func_a",
                    "file_path": "/test.py",
                    "start_line": 1,
                    "end_line": 10,
                    "language": "python",
                    "labels": ["Function"]
                }
            }],
            # Dependencies with cycle: func-1 -> func-2 -> func-3 -> func-1
            [
                {
                    "dep": {
                        "id": "func-2",
                        "project_id": "project-123",
                        "name": "func_b",
                        "file_path": "/test.py",
                        "start_line": 20,
                        "end_line": 30,
                        "language": "python",
                        "labels": ["Function"]
                    },
                    "depth": 1,
                    "node_ids": ["func-1", "func-2"]
                },
                {
                    "dep": {
                        "id": "func-3",
                        "project_id": "project-123",
                        "name": "func_c",
                        "file_path": "/test.py",
                        "start_line": 40,
                        "end_line": 50,
                        "language": "python",
                        "labels": ["Function"]
                    },
                    "depth": 2,
                    "node_ids": ["func-1", "func-2", "func-3"]
                },
                {
                    "dep": {
                        "id": "func-1",
                        "project_id": "project-123",
                        "name": "func_a",
                        "file_path": "/test.py",
                        "start_line": 1,
                        "end_line": 10,
                        "language": "python",
                        "labels": ["Function"]
                    },
                    "depth": 3,
                    "node_ids": ["func-1", "func-2", "func-3", "func-1"]
                }
            ]
        ]
        
        result = await graph_service.impact_analysis("func-1", max_depth=5)
        
        assert len(result.circular_dependencies) > 0
        # Should detect the cycle
        cycle = result.circular_dependencies[0]
        assert "func-1" in cycle
        assert "func-2" in cycle
        assert "func-3" in cycle
    
    @pytest.mark.asyncio
    async def test_impact_analysis_max_depth(self, graph_service, mock_neo4j_manager):
        """Test impact analysis respects max depth."""
        mock_neo4j_manager.execute_with_retry.side_effect = [
            [{
                "f": {
                    "id": "func-1",
                    "project_id": "project-123",
                    "name": "root",
                    "file_path": "/test.py",
                    "start_line": 1,
                    "end_line": 10,
                    "language": "python",
                    "labels": ["Function"]
                }
            }],
            [
                {
                    "dep": {
                        "id": f"func-{i}",
                        "project_id": "project-123",
                        "name": f"dep_{i}",
                        "file_path": "/test.py",
                        "start_line": i * 10,
                        "end_line": i * 10 + 10,
                        "language": "python",
                        "labels": ["Function"]
                    },
                    "depth": i,
                    "node_ids": [f"func-{j}" for j in range(i+1)]
                }
                for i in range(1, 6)
            ]
        ]
        
        result = await graph_service.impact_analysis("func-1", max_depth=5)
        
        # Should have dependencies at max depth
        assert any(d.depth == 5 for d in result.dependencies)
        assert result.truncated is True
    
    @pytest.mark.asyncio
    async def test_impact_analysis_function_not_found(self, graph_service, mock_neo4j_manager):
        """Test impact analysis for non-existent function."""
        mock_neo4j_manager.execute_with_retry.return_value = []
        
        with pytest.raises(DatabaseQueryError, match="Function .* not found"):
            await graph_service.impact_analysis("nonexistent")


class TestGraphVisualization:
    """Test graph visualization data retrieval."""
    
    @pytest.mark.asyncio
    async def test_get_project_graph_basic(self, graph_service, mock_neo4j_manager):
        """Test getting basic project graph."""
        mock_neo4j_manager.execute_with_retry.side_effect = [
            # Nodes query
            [
                {
                    "n": {
                        "id": "func-1",
                        "project_id": "project-123",
                        "name": "my_func",
                        "file_path": "/test.py",
                        "start_line": 1,
                        "end_line": 10,
                        "language": "python",
                        "labels": ["Function"]
                    }
                }
            ],
            # Edges query
            [
                {
                    "source_id": "func-1",
                    "target_id": "func-2",
                    "rel_type": "CALLS"
                }
            ]
        ]
        
        result = await graph_service.get_project_graph("project-123")
        
        assert len(result.nodes) == 1
        assert result.nodes[0].id == "func-1"
        assert result.nodes[0].label == "my_func"
        assert len(result.edges) == 1
        assert result.edges[0].source == "func-1"
        assert result.edges[0].target == "func-2"
    
    @pytest.mark.asyncio
    async def test_get_project_graph_with_filters(self, graph_service, mock_neo4j_manager):
        """Test getting project graph with filters."""
        filters = GraphFilters(
            entity_types=[EntityType.FUNCTION],
            languages=[Language.PYTHON],
            file_pattern=".*test.*",
            max_nodes=100
        )
        
        mock_neo4j_manager.execute_with_retry.side_effect = [[], []]
        
        result = await graph_service.get_project_graph("project-123", filters)
        
        # Verify filters were applied in query
        call_args = mock_neo4j_manager.execute_with_retry.call_args_list[0]
        query = call_args[0][0]
        params = call_args[0][1]
        
        assert "n.language IN $languages" in query
        assert "n.file_path =~ $file_pattern" in query
        assert params["languages"] == ["python"]
        assert params["file_pattern"] == ".*test.*"
        assert params["max_nodes"] == 100


class TestHelperMethods:
    """Test helper methods."""
    
    def test_extract_cycle(self, graph_service):
        """Test cycle extraction from path."""
        # Path with cycle: A -> B -> C -> B
        node_ids = ["func-a", "func-b", "func-c", "func-b"]
        cycle = graph_service._extract_cycle(node_ids)
        
        assert cycle == ["func-b", "func-c", "func-b"]
    
    def test_extract_cycle_no_cycle(self, graph_service):
        """Test cycle extraction with no cycle."""
        node_ids = ["func-a", "func-b", "func-c"]
        cycle = graph_service._extract_cycle(node_ids)
        
        assert cycle == []
    
    def test_entity_type_to_label(self, graph_service):
        """Test entity type to label conversion."""
        assert graph_service._entity_type_to_label(EntityType.FILE) == "File"
        assert graph_service._entity_type_to_label(EntityType.FUNCTION) == "Function"
        assert graph_service._entity_type_to_label(EntityType.CLASS) == "Class"
        assert graph_service._entity_type_to_label(EntityType.VARIABLE) == "Variable"
        assert graph_service._entity_type_to_label(EntityType.IMPORT) == "Import"
    
    def test_node_to_entity(self, graph_service):
        """Test converting Neo4j node to CodeEntity."""
        node = {
            "id": "func-1",
            "project_id": "project-123",
            "name": "test_func",
            "file_path": "/test.py",
            "start_line": 1,
            "end_line": 10,
            "signature": "def test_func()",
            "docstring": "Test function",
            "body": "return True",
            "language": "python",
            "metadata": '{"complexity": 5}',
            "labels": ["Function"]
        }
        
        entity = graph_service._node_to_entity(node)
        
        assert entity.id == "func-1"
        assert entity.name == "test_func"
        assert entity.entity_type == EntityType.FUNCTION
        assert entity.signature == "def test_func()"
        assert entity.metadata == {"complexity": 5}
    
    def test_node_to_graph_node(self, graph_service):
        """Test converting Neo4j node to GraphNode."""
        node = {
            "id": "func-1",
            "name": "test_func",
            "file_path": "/test.py",
            "metadata": '{"key": "value"}',
            "labels": ["Function"]
        }
        
        graph_node = graph_service._node_to_graph_node(node)
        
        assert graph_node.id == "func-1"
        assert graph_node.label == "test_func"
        assert graph_node.type == EntityType.FUNCTION
        assert graph_node.metadata == {"key": "value"}
