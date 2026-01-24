"""Core data models for the GraphRAG system."""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class EntityType(str, Enum):
    """Types of code entities that can be extracted."""
    FILE = "file"
    FUNCTION = "function"
    CLASS = "class"
    VARIABLE = "variable"
    IMPORT = "import"


class RelationshipType(str, Enum):
    """Types of relationships between code entities."""
    DEFINES = "DEFINES"
    CALLS = "CALLS"
    IMPORTS = "IMPORTS"
    EXTENDS = "EXTENDS"
    IMPLEMENTS = "IMPLEMENTS"
    USES = "USES"
    TESTS = "TESTS"


class Language(str, Enum):
    """Supported programming languages."""
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    TYPESCRIPT = "typescript"
    JAVA = "java"


class CodeEntity(BaseModel):
    """Represents a code entity (file, function, class, variable, import)."""
    id: Optional[str] = None
    project_id: str
    entity_type: EntityType
    name: str
    file_path: str
    start_line: int
    end_line: int
    signature: Optional[str] = None
    docstring: Optional[str] = None
    body: Optional[str] = None
    language: Language
    metadata: Dict[str, Any] = Field(default_factory=dict)


class CodeRelationship(BaseModel):
    """Represents a relationship between two code entities."""
    source_id: str
    target_id: str
    relationship_type: RelationshipType
    metadata: Dict[str, Any] = Field(default_factory=dict)


class Project(BaseModel):
    """Represents a code project."""
    id: str
    name: str
    user_id: str
    created_at: datetime
    file_count: int = 0
    entity_count: int = 0
    status: str = "active"


class UploadSession(BaseModel):
    """Represents an upload session for tracking async processing."""
    session_id: str
    project_id: str
    status: str  # "pending", "processing", "completed", "failed"
    progress: float = 0.0
    files_processed: int = 0
    total_files: int = 0
    entities_extracted: int = 0
    errors: List[str] = Field(default_factory=list)
    statistics: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime


class ParseResult(BaseModel):
    """Result of parsing a single file."""
    file_path: str
    entities: List[CodeEntity]
    relationships: List[CodeRelationship]
    errors: List[str] = Field(default_factory=list)
    parse_time_ms: float


class SearchResult(BaseModel):
    """Result from semantic search."""
    entity: CodeEntity
    similarity_score: float
    snippet: str


class ScoredEntity(BaseModel):
    """Entity with relevance scoring for context retrieval."""
    entity: CodeEntity
    relevance_score: float
    similarity_score: float
    graph_distance: Optional[int] = None


class ContextResult(BaseModel):
    """Result of context retrieval for AI prompts."""
    context_text: str
    entities: List[ScoredEntity]
    token_count: int
    token_budget: int


class DependencyNode(BaseModel):
    """Node in a dependency tree."""
    entity: CodeEntity
    depth: int
    path: List[str]


class DependencyTree(BaseModel):
    """Tree of dependencies for impact analysis."""
    root: CodeEntity
    dependencies: List[DependencyNode]
    max_depth: int
    truncated: bool = False
    circular_dependencies: List[List[str]] = Field(default_factory=list)


class GraphNode(BaseModel):
    """Node in graph visualization."""
    id: str
    label: str
    type: EntityType
    file_path: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class GraphEdge(BaseModel):
    """Edge in graph visualization."""
    source: str
    target: str
    type: RelationshipType
    label: str


class GraphVisualizationData(BaseModel):
    """Data for graph visualization."""
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    layout: str = "hierarchical"


class GraphFilters(BaseModel):
    """Filters for graph visualization."""
    entity_types: Optional[List[EntityType]] = None
    languages: Optional[List[Language]] = None
    file_pattern: Optional[str] = None
    max_nodes: int = 500
