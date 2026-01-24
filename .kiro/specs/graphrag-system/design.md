# Design Document: GraphRAG System

## Overview

The GraphRAG (Graph Retrieval-Augmented Generation) system enhances the SocraticDev learning platform by providing persistent code storage, semantic search, and context-aware AI interactions. The system combines graph database technology (Neo4j) for structural code relationships with vector database technology (Chroma) for semantic similarity search, enabling developers to understand, navigate, and query their codebases effectively.

The architecture follows a microservices pattern with a FastAPI backend handling code parsing, graph operations, vector operations, and context retrieval. The React frontend integrates with this backend to provide interactive graph visualization, semantic search, and context-aware AI chat.

### Key Capabilities

1. **Persistent Code Storage**: Parse and store project structure in Neo4j graph database
2. **Semantic Search**: Find similar code patterns using vector embeddings and similarity search
3. **Context-Aware AI**: Automatically inject relevant code context into AI prompts
4. **Impact Analysis**: Trace dependencies and understand change impact through graph traversal
5. **Multi-Project Support**: Index and query multiple codebases simultaneously
6. **Interactive Visualization**: Explore code relationships through interactive graph visualization

## Architecture

### System Architecture

The GraphRAG system follows a layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Upload UI  │  │ Graph Viz    │  │  Chat UI     │      │
│  │              │  │ (ReactFlow)  │  │ + Context    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │ REST API
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Upload       │  │ Query        │  │ Context      │      │
│  │ Service      │  │ Service      │  │ Service      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Code Parser  │  │ Graph        │  │ Vector       │      │
│  │ (Tree-sitter)│  │ Service      │  │ Service      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ Embedding    │  │ Cache        │                         │
│  │ Generator    │  │ (Redis)      │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│              Data Layer & External Services                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Neo4j      │  │   Chroma     │  │  RabbitMQ    │      │
│  │   Graph DB   │  │   Vector DB  │  │  + Celery    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐                                            │
│  │ Gemini API   │                                            │
│  │ (Embeddings) │                                            │
│  └──────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend**:
- FastAPI 0.104+ (Python 3.11+)
- Neo4j 5.x (graph database)
- Chroma 0.4+ (vector database)
- Tree-sitter (multi-language AST parsing)
- Redis 7.x (caching)
- Celery + RabbitMQ (async task processing)
- Gemini API (embeddings and chat)

**Frontend**:
- React 18+
- ReactFlow (graph visualization)
- Axios (HTTP client)
- TailwindCSS (styling)

**Infrastructure**:
- Docker Compose (local development)
- PostgreSQL (Chroma metadata storage)

## Components and Interfaces

### 1. Upload Service

**Responsibility**: Handle project uploads and coordinate parsing workflow.

**Interface**:
```python
class UploadService:
    def upload_project(
        self, 
        project_name: str, 
        files: List[UploadFile], 
        user_id: str
    ) -> UploadSession:
        """
        Initiates asynchronous project upload and parsing.
        Returns UploadSession with session_id for status polling.
        """
        pass
    
    def get_upload_status(self, session_id: str) -> UploadStatus:
        """
        Returns current status of upload session.
        """
        pass
    
    def upload_from_github(
        self, 
        project_name: str, 
        github_url: str, 
        user_id: str
    ) -> UploadSession:
        """
        Clones GitHub repository and initiates parsing.
        """
        pass
```

**Key Operations**:
- Validate upload size (max 10,000 files)
- Extract files from zip or clone from GitHub
- Create Celery task for asynchronous processing
- Return session ID for status polling

### 2. Code Parser Service

**Responsibility**: Parse source code files into abstract syntax trees and extract code entities and relationships.

**Interface**:
```python
class CodeParserService:
    def parse_file(self, file_path: str, content: str, language: str) -> ParseResult:
        """
        Parses a single file and extracts entities and relationships.
        Returns ParseResult containing entities and relationships.
        """
        pass
    
    def parse_project(self, project_id: str, files: List[FileInfo]) -> ProjectParseResult:
        """
        Parses all files in a project.
        Returns aggregated parse results with statistics.
        """
        pass
    
    def extract_entities(self, ast: Tree) -> List[CodeEntity]:
        """
        Extracts code entities (functions, classes, variables) from AST.
        """
        pass
    
    def extract_relationships(self, ast: Tree, entities: List[CodeEntity]) -> List[CodeRelationship]:
        """
        Extracts relationships (calls, imports, extends) from AST.
        """
        pass
```

**Supported Languages**:
- Python (tree-sitter-python)
- JavaScript/TypeScript (tree-sitter-javascript, tree-sitter-typescript)
- Java (tree-sitter-java)

**Entity Types**:
- File: Represents a source file
- Function: Function or method definition
- Class: Class or interface definition
- Variable: Global or class-level variable
- Import: Import or require statement

**Relationship Types**:
- DEFINES: File defines Function/Class
- CALLS: Function calls another Function
- IMPORTS: File imports another File/Module
- EXTENDS: Class extends another Class
- IMPLEMENTS: Class implements Interface
- USES: Function uses Variable

### 3. Graph Service

**Responsibility**: Manage Neo4j graph database operations for storing and querying code structure.

**Interface**:
```python
class GraphService:
    def create_project(self, project_id: str, name: str, metadata: dict) -> Project:
        """
        Creates a project node in Neo4j.
        """
        pass
    
    def create_entities(self, project_id: str, entities: List[CodeEntity]) -> List[str]:
        """
        Creates entity nodes in Neo4j.
        Returns list of created node IDs.
        """
        pass
    
    def create_relationships(self, relationships: List[CodeRelationship]) -> int:
        """
        Creates relationship edges in Neo4j.
        Returns count of created relationships.
        """
        pass
    
    def find_callers(self, function_id: str) -> List[CodeEntity]:
        """
        Finds all functions that call the specified function.
        Executes Cypher query: MATCH (caller)-[:CALLS]->(target) WHERE id(target)=$id
        """
        pass
    
    def find_dependencies(self, function_id: str) -> List[CodeEntity]:
        """
        Finds all functions and variables that the specified function depends on.
        Executes Cypher query: MATCH (source)-[:CALLS|USES]->(dep) WHERE id(source)=$id
        """
        pass
    
    def impact_analysis(self, function_id: str, max_depth: int = 5) -> DependencyTree:
        """
        Performs transitive dependency analysis.
        Executes Cypher query with variable-length path matching.
        """
        pass
    
    def get_class_hierarchy(self, class_id: str) -> ClassHierarchy:
        """
        Gets inheritance tree for a class.
        Executes Cypher query: MATCH path=(c)-[:EXTENDS|IMPLEMENTS*]->(parent)
        """
        pass
    
    def get_project_graph(
        self, 
        project_id: str, 
        filters: GraphFilters
    ) -> GraphData:
        """
        Retrieves graph data for visualization with optional filters.
        """
        pass
```

**Neo4j Schema**:

Nodes:
- Project: {id, name, created_at, file_count, entity_count}
- File: {id, project_id, path, language, lines_of_code}
- Function: {id, project_id, file_id, name, signature, start_line, end_line, docstring}
- Class: {id, project_id, file_id, name, start_line, end_line, docstring}
- Variable: {id, project_id, file_id, name, type, scope}
- Import: {id, project_id, file_id, module_name, imported_names}

Relationships:
- (File)-[:DEFINES]->(Function|Class|Variable)
- (Function)-[:CALLS]->(Function)
- (File)-[:IMPORTS]->(File|Import)
- (Class)-[:EXTENDS]->(Class)
- (Class)-[:IMPLEMENTS]->(Class)
- (Function)-[:USES]->(Variable)
- (Function)-[:TESTS]->(Function)

**Indexes**:
```cypher
CREATE INDEX entity_name FOR (n:Function) ON (n.name)
CREATE INDEX entity_name FOR (n:Class) ON (n.name)
CREATE INDEX file_path FOR (n:File) ON (n.path)
CREATE INDEX project_id FOR (n:Function) ON (n.project_id)
CREATE INDEX project_id FOR (n:Class) ON (n.project_id)
CREATE INDEX project_id FOR (n:File) ON (n.project_id)
```

### 4. Vector Service

**Responsibility**: Manage Chroma vector database operations for semantic search.

**Interface**:
```python
class VectorService:
    def store_embedding(
        self, 
        entity_id: str, 
        embedding: List[float], 
        metadata: dict
    ) -> str:
        """
        Stores vector embedding in Chroma with metadata.
        """
        pass
    
    def semantic_search(
        self, 
        query: str, 
        project_ids: List[str], 
        top_k: int = 20,
        similarity_threshold: float = 0.7
    ) -> List[SearchResult]:
        """
        Performs semantic similarity search.
        Returns results ranked by cosine similarity.
        """
        pass
    
    def find_similar_entities(
        self, 
        entity_id: str, 
        top_k: int = 10
    ) -> List[SearchResult]:
        """
        Finds entities similar to the given entity.
        """
        pass
    
    def delete_project_embeddings(self, project_id: str) -> int:
        """
        Deletes all embeddings for a project.
        Returns count of deleted embeddings.
        """
        pass
```

**Chroma Collections**:
- Collection per project: `project_{project_id}_embeddings`
- Metadata stored: {entity_id, entity_type, file_path, name, project_id}

### 5. Embedding Generator

**Responsibility**: Generate vector embeddings using Gemini API.

**Interface**:
```python
class EmbeddingGenerator:
    def generate_embedding(self, text: str) -> List[float]:
        """
        Generates embedding vector using Gemini Embedding API.
        Model: text-embedding-004 (768 dimensions)
        """
        pass
    
    def generate_code_embedding(self, entity: CodeEntity) -> List[float]:
        """
        Generates embedding for code entity.
        Combines name, signature, docstring, and body.
        """
        pass
    
    def batch_generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generates embeddings in batch for efficiency.
        Handles rate limiting and retries.
        """
        pass
```

**Embedding Input Format**:
For functions:
```
Function: {name}
Signature: {signature}
Docstring: {docstring}
Body: {first 500 chars of body}
```

For classes:
```
Class: {name}
Docstring: {docstring}
Methods: {method names}
```

### 6. Context Retriever

**Responsibility**: Retrieve relevant code context for AI prompts using hybrid search.

**Interface**:
```python
class ContextRetriever:
    def retrieve_context(
        self, 
        query: str, 
        project_id: str, 
        token_budget: int = 8000
    ) -> ContextResult:
        """
        Retrieves relevant code context using hybrid search.
        Combines semantic search and graph traversal.
        """
        pass
    
    def hybrid_search(
        self, 
        query: str, 
        project_id: str
    ) -> List[ScoredEntity]:
        """
        Performs hybrid search combining:
        1. Vector similarity search (semantic)
        2. Graph neighborhood search (structural)
        Returns entities ranked by combined score.
        """
        pass
    
    def rank_entities(
        self, 
        semantic_results: List[SearchResult],
        graph_results: List[CodeEntity]
    ) -> List[ScoredEntity]:
        """
        Ranks entities by combining similarity score and graph distance.
        Score = 0.7 * semantic_similarity + 0.3 * (1 / graph_distance)
        """
        pass
    
    def assemble_context(
        self, 
        entities: List[ScoredEntity], 
        token_budget: int
    ) -> str:
        """
        Assembles context string from entities within token budget.
        Includes source citations.
        """
        pass
```

**Context Assembly Format**:
```
Relevant code from your project:

[File: src/auth/login.py, Lines: 15-30]
def authenticate_user(username: str, password: str) -> User:
    """Authenticates user with username and password."""
    ...

[File: src/models/user.py, Lines: 5-20]
class User:
    """User model with authentication fields."""
    ...
```

### 7. Query Service

**Responsibility**: Coordinate query operations across graph and vector services.

**Interface**:
```python
class QueryService:
    def find_callers(self, function_id: str, project_id: str) -> QueryResult:
        """
        Finds callers of a function.
        """
        pass
    
    def find_dependencies(self, function_id: str, project_id: str) -> QueryResult:
        """
        Finds dependencies of a function.
        """
        pass
    
    def impact_analysis(self, function_id: str, project_id: str) -> ImpactResult:
        """
        Performs impact analysis.
        """
        pass
    
    def semantic_search(
        self, 
        query: str, 
        project_ids: List[str]
    ) -> List[SearchResult]:
        """
        Performs semantic code search.
        """
        pass
    
    def get_graph_visualization(
        self, 
        project_id: str, 
        filters: GraphFilters
    ) -> GraphVisualizationData:
        """
        Gets graph data formatted for ReactFlow visualization.
        """
        pass
```

### 8. Cache Service

**Responsibility**: Cache frequently accessed query results in Redis.

**Interface**:
```python
class CacheService:
    def get(self, key: str) -> Optional[Any]:
        """
        Retrieves cached value.
        """
        pass
    
    def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        """
        Caches value with TTL (default 5 minutes).
        """
        pass
    
    def invalidate_project(self, project_id: str) -> int:
        """
        Invalidates all cache entries for a project.
        """
        pass
```

**Cache Keys**:
- `callers:{function_id}` - Function callers
- `deps:{function_id}` - Function dependencies
- `impact:{function_id}` - Impact analysis
- `search:{query_hash}:{project_ids}` - Semantic search results
- `graph:{project_id}:{filter_hash}` - Graph visualization data

### 9. Async Task Processing

**Responsibility**: Handle long-running operations asynchronously using Celery.

**Celery Tasks**:
```python
@celery.task
def process_project_upload(session_id: str, project_id: str, files: List[str]):
    """
    Processes project upload asynchronously.
    Steps:
    1. Parse all files
    2. Extract entities and relationships
    3. Store in Neo4j
    4. Generate embeddings
    5. Store in Chroma
    6. Update session status
    """
    pass

@celery.task
def generate_embeddings_batch(entity_ids: List[str]):
    """
    Generates embeddings for a batch of entities.
    """
    pass

@celery.task
def update_project(project_id: str, changed_files: List[str]):
    """
    Updates project with changed files.
    """
    pass
```

## Data Models

### Core Data Models

```python
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class EntityType(str, Enum):
    FILE = "file"
    FUNCTION = "function"
    CLASS = "class"
    VARIABLE = "variable"
    IMPORT = "import"

class RelationshipType(str, Enum):
    DEFINES = "DEFINES"
    CALLS = "CALLS"
    IMPORTS = "IMPORTS"
    EXTENDS = "EXTENDS"
    IMPLEMENTS = "IMPLEMENTS"
    USES = "USES"
    TESTS = "TESTS"

class Language(str, Enum):
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    TYPESCRIPT = "typescript"
    JAVA = "java"

class CodeEntity(BaseModel):
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
    metadata: Dict[str, Any] = {}

class CodeRelationship(BaseModel):
    source_id: str
    target_id: str
    relationship_type: RelationshipType
    metadata: Dict[str, Any] = {}

class Project(BaseModel):
    id: str
    name: str
    user_id: str
    created_at: datetime
    file_count: int = 0
    entity_count: int = 0
    status: str = "active"

class UploadSession(BaseModel):
    session_id: str
    project_id: str
    status: str  # "pending", "processing", "completed", "failed"
    progress: float = 0.0
    files_processed: int = 0
    total_files: int = 0
    entities_extracted: int = 0
    errors: List[str] = []
    created_at: datetime
    updated_at: datetime

class ParseResult(BaseModel):
    file_path: str
    entities: List[CodeEntity]
    relationships: List[CodeRelationship]
    errors: List[str] = []
    parse_time_ms: float

class SearchResult(BaseModel):
    entity: CodeEntity
    similarity_score: float
    snippet: str

class ScoredEntity(BaseModel):
    entity: CodeEntity
    relevance_score: float
    similarity_score: float
    graph_distance: Optional[int] = None

class ContextResult(BaseModel):
    context_text: str
    entities: List[ScoredEntity]
    token_count: int
    token_budget: int

class DependencyNode(BaseModel):
    entity: CodeEntity
    depth: int
    path: List[str]

class DependencyTree(BaseModel):
    root: CodeEntity
    dependencies: List[DependencyNode]
    max_depth: int
    truncated: bool = False
    circular_dependencies: List[List[str]] = []

class GraphNode(BaseModel):
    id: str
    label: str
    type: EntityType
    file_path: str
    metadata: Dict[str, Any] = {}

class GraphEdge(BaseModel):
    source: str
    target: str
    type: RelationshipType
    label: str

class GraphVisualizationData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    layout: str = "hierarchical"

class GraphFilters(BaseModel):
    entity_types: Optional[List[EntityType]] = None
    languages: Optional[List[Language]] = None
    file_pattern: Optional[str] = None
    max_nodes: int = 500
```

### API Request/Response Models

```python
class UploadProjectRequest(BaseModel):
    project_name: str
    files: List[UploadFile]

class UploadFromGitHubRequest(BaseModel):
    project_name: str
    github_url: str
    branch: str = "main"

class SemanticSearchRequest(BaseModel):
    query: str
    project_ids: List[str]
    top_k: int = 20
    similarity_threshold: float = 0.7

class FindCallersRequest(BaseModel):
    function_id: str
    project_id: str

class ImpactAnalysisRequest(BaseModel):
    function_id: str
    project_id: str
    max_depth: int = 5

class ContextRetrievalRequest(BaseModel):
    query: str
    project_id: str
    token_budget: int = 8000
    manual_entity_ids: Optional[List[str]] = None

class GraphVisualizationRequest(BaseModel):
    project_id: str
    filters: GraphFilters
```

## Error Handling

### Error Categories

1. **Parsing Errors**: Syntax errors, unsupported language features
2. **Database Errors**: Connection failures, query timeouts, transaction failures
3. **API Errors**: Rate limiting, authentication failures, invalid requests
4. **Resource Errors**: File size limits, memory limits, timeout limits

### Error Handling Strategy

**Parsing Errors**:
- Log error with file path, line number, and error message
- Continue processing remaining files
- Include errors in final upload report
- Mark file as "partially parsed" if some entities were extracted

**Database Errors**:
- Implement retry logic with exponential backoff (3 retries)
- Use database transactions for atomic operations
- Roll back on failure to maintain consistency
- Cache results to reduce database load

**API Rate Limiting**:
- Implement token bucket algorithm for rate limiting
- Queue requests when rate limit is reached
- Process queued requests when limit resets
- Display estimated wait time to users

**Timeout Handling**:
- Set query timeout limits (graph: 5s, vector: 10s)
- Cancel long-running queries
- Suggest query refinement to users
- Cache expensive query results

### Error Response Format

```python
class ErrorResponse(BaseModel):
    error_code: str
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime
    request_id: str
```

**Error Codes**:
- `PARSE_ERROR`: Code parsing failed
- `DB_CONNECTION_ERROR`: Database connection failed
- `DB_QUERY_TIMEOUT`: Query exceeded timeout
- `RATE_LIMIT_EXCEEDED`: API rate limit reached
- `INVALID_REQUEST`: Request validation failed
- `PROJECT_NOT_FOUND`: Project does not exist
- `ENTITY_NOT_FOUND`: Entity does not exist
- `FILE_SIZE_EXCEEDED`: Upload exceeds size limit
- `INTERNAL_ERROR`: Unexpected server error

## Testing Strategy

The GraphRAG system requires comprehensive testing across multiple layers: unit tests for individual components, property-based tests for universal correctness properties, integration tests for service interactions, and end-to-end tests for complete workflows.

### Testing Approach

**Unit Tests**: Verify specific examples, edge cases, and error conditions for individual functions and classes. Focus on:
- Specific parsing examples for each language
- Error handling paths
- Edge cases (empty inputs, malformed data)
- Component integration points

**Property-Based Tests**: Verify universal properties that should hold across all inputs using randomized testing. Each property test should run minimum 100 iterations. Focus on:
- Round-trip properties (parse → serialize → parse)
- Invariants (graph consistency, embedding dimensions)
- Metamorphic properties (query result relationships)

**Integration Tests**: Verify interactions between services (Graph Service ↔ Neo4j, Vector Service ↔ Chroma, Context Retriever ↔ both databases).

**End-to-End Tests**: Verify complete workflows (upload → parse → index → query).

### Testing Framework

- **Unit/Integration**: pytest
- **Property-Based**: Hypothesis (Python)
- **API Testing**: pytest + httpx
- **Database Testing**: pytest-neo4j, testcontainers

### Test Data Generation

For property-based tests, generate random but valid test data:
- Random code entities with valid names, types, and relationships
- Random projects with varying sizes (10-1000 files)
- Random queries with different patterns
- Random embeddings (768-dimensional vectors)


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several areas of redundancy:

1. **Error resilience properties** (1.7, 2.4, 10.1, 11.4) all test the same pattern: errors in individual items don't stop batch processing. These can be combined into one comprehensive property.

2. **Round-trip properties** (1.4, 2.3, 12.1) all test persistence: store data, retrieve it, verify it matches. These can be combined into one property covering all data types.

3. **Query correctness properties** (4.1, 4.2, 4.3, 4.4) all test graph traversal queries. These can be combined into one property that tests query correctness for all relationship types.

4. **Result format properties** (3.4, 5.3, 8.3, 14.2) all test that results contain required fields. These can be combined into one property about result completeness.

5. **Filtering properties** (7.6, 8.2) both test that filters correctly include/exclude items. These can be combined.

6. **Token budget properties** (6.4, 6.5, 14.3, 14.6) all relate to token budget enforcement. These can be combined into one comprehensive property.

The following properties represent the unique, non-redundant correctness guarantees after reflection:

### Property 1: Upload Method Agnostic Processing

*For any* valid project upload (drag-drop, GitHub URL, or zip file), the GraphRAG_System should accept the upload and initiate processing with a valid session ID, regardless of the upload method used.

**Validates: Requirements 1.1**

### Property 2: Multi-Language Parsing Correctness

*For any* valid source code file in Python, JavaScript, TypeScript, or Java, the Code_Parser should successfully parse the file into an abstract syntax tree and extract all top-level entities (functions, classes, imports) with correct names and signatures.

**Validates: Requirements 1.2, 11.1, 11.2, 11.3**

### Property 3: Entity Extraction Completeness

*For any* parsed abstract syntax tree, the GraphRAG_System should extract all code entities (functions, classes, variables, imports) and relationships (calls, imports, defines, extends, implements, uses) present in the AST.

**Validates: Requirements 1.3, 11.5**

### Property 4: Data Persistence Round-Trip

*For any* set of code entities and relationships stored in the database, retrieving them from Neo4j and Chroma should produce equivalent entities and relationships with all properties preserved (entity names, types, file paths, embeddings, metadata).

**Validates: Requirements 1.4, 2.3, 12.1, 12.2**

### Property 5: Progress Update Monotonicity

*For any* project upload session, progress updates should be monotonically increasing (each update shows progress >= previous update) and the final progress should equal 100% when processing completes successfully.

**Validates: Requirements 1.6**

### Property 6: Error Resilience in Batch Processing

*For any* batch of files or entities being processed, if some items fail (parsing errors, embedding failures, etc.), the GraphRAG_System should continue processing remaining items, log all failures with details, and include all errors in the final report without losing any error information.

**Validates: Requirements 1.7, 2.4, 10.1, 11.4**

### Property 7: Statistics Accuracy

*For any* completed project upload, the displayed statistics (file count, function count, class count, relationship count) should exactly match the actual counts of entities stored in the database.

**Validates: Requirements 1.8**

### Property 8: Embedding Generation Completeness

*For any* project with N functions and M classes, the Vector_Service should generate and store exactly N + M embeddings in Chroma, with each embedding having 768 dimensions and linked to the correct entity ID.

**Validates: Requirements 2.1, 2.5**

### Property 9: Embedding Input Format Consistency

*For any* code entity (function or class), the text input used for embedding generation should include the entity name, signature (if applicable), docstring (if present), and body (first 500 characters), formatted consistently according to the entity type.

**Validates: Requirements 2.2**

### Property 10: Query Embedding Generation

*For any* non-empty search query string, the Vector_Service should successfully generate a 768-dimensional query embedding without errors.

**Validates: Requirements 3.1**

### Property 11: Search Result Limit and Ranking

*For any* semantic search query, the Vector_Service should return at most 20 results, all results should have similarity scores >= 0.7, and results should be sorted in descending order by similarity score.

**Validates: Requirements 3.2, 3.3**

### Property 12: Result Completeness

*For any* query result (semantic search, graph traversal, impact analysis), each result should contain all required fields for its type: entity name, file path, and type-specific fields (similarity score for search, depth for impact analysis, project ID for multi-project results).

**Validates: Requirements 3.4, 5.3, 8.3, 14.2**

### Property 13: Graph Query Correctness

*For any* graph with known relationships, querying for callers, dependencies, imports, or class hierarchy should return exactly the set of entities connected by the specified relationship type, with no false positives or false negatives.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 14: Transitive Dependency Completeness

*For any* function F in a call graph, impact analysis should return all functions reachable from F through transitive CALLS relationships, up to the specified maximum depth, with each dependency annotated with its correct depth and path from F.

**Validates: Requirements 5.1, 5.2, 5.3**

### Property 15: Circular Dependency Detection

*For any* call graph containing circular dependencies (cycles in CALLS relationships), impact analysis should detect all cycles and report them with the complete cycle path, without entering infinite loops.

**Validates: Requirements 5.5**

### Property 16: Hybrid Search Combination

*For any* context retrieval query, the Context_Retriever should return entities from both vector similarity search (semantic) and graph neighborhood search (structural), with the combined result set ranked by a relevance score that incorporates both similarity and graph distance.

**Validates: Requirements 6.1, 6.2, 6.3**

### Property 17: Token Budget Enforcement

*For any* context assembly operation with token budget B, the total token count of included entities should not exceed B, higher-ranked entities should be prioritized when budget is limited, and the system should accurately track and display token usage and remaining budget.

**Validates: Requirements 6.4, 6.5, 14.3, 14.6**

### Property 18: Context Source Citation

*For any* assembled context string, each code entity included should be annotated with source citations showing file path and line numbers, formatted consistently as "[File: {path}, Lines: {start}-{end}]".

**Validates: Requirements 6.6**

### Property 19: Node Visual Encoding Consistency

*For any* graph visualization, nodes should be consistently color-coded by entity type (files=blue, functions=green, classes=purple, variables=orange) and edges should be consistently styled by relationship type (IMPORTS=dashed, CALLS=solid, EXTENDS=thick, USES=dotted).

**Validates: Requirements 7.2, 7.3**

### Property 20: Graph Filtering Correctness

*For any* graph visualization with applied filters (entity types, languages, file patterns), the displayed nodes should include exactly those entities matching all filter criteria, and excluded nodes should have no visible edges.

**Validates: Requirements 7.6, 8.2**

### Property 21: Node Search Highlighting

*For any* node search query, all nodes with names matching the query (case-insensitive substring match) should be highlighted, and no non-matching nodes should be highlighted.

**Validates: Requirements 7.8**

### Property 22: Multi-Project Isolation

*For any* two distinct projects P1 and P2, entities from P1 should have no relationships to entities from P2 in the graph database, and queries scoped to P1 should never return entities from P2.

**Validates: Requirements 8.1, 8.4**

### Property 23: Multi-Project Search Merging

*For any* semantic search across multiple projects, results should include entities from all selected projects, sorted globally by similarity score regardless of project origin, with each result annotated with its project ID.

**Validates: Requirements 8.5**

### Property 24: Retry Logic with Exponential Backoff

*For any* database operation that fails due to connection errors, the GraphRAG_System should retry the operation up to 3 times with exponentially increasing delays (e.g., 1s, 2s, 4s), and only report failure after all retries are exhausted.

**Validates: Requirements 10.2**

### Property 25: Rate Limit Queueing

*For any* sequence of embedding generation requests that exceeds the API rate limit, the Embedding_Generator should queue excess requests and process them in order when the rate limit resets, without dropping any requests.

**Validates: Requirements 10.3**

### Property 26: Error Stability

*For any* unexpected error during request processing, the GraphRAG_System should log the complete error stack trace, return an appropriate error response to the client, and continue serving subsequent requests without crashing or entering an invalid state.

**Validates: Requirements 10.5**

### Property 27: Function Overloading Disambiguation

*For any* source file containing multiple functions with the same name (overloading), the Code_Parser should create separate nodes for each definition with disambiguated identifiers (e.g., appending parameter types or line numbers).

**Validates: Requirements 11.6**

### Property 28: Incremental Update Correctness

*For any* project update with a set of changed files, the GraphRAG_System should remove entities from old versions of changed files, add entities from new versions, and preserve all entities from unchanged files, maintaining referential integrity of relationships.

**Validates: Requirements 12.3**

### Property 29: Project Deletion Completeness

*For any* project deletion operation, all entities, relationships, and embeddings associated with the project should be removed from Neo4j and Chroma, and subsequent queries for the project should return "not found" errors.

**Validates: Requirements 12.4**

### Property 30: Transaction Atomicity

*For any* database transaction that fails partway through (e.g., Neo4j succeeds but Chroma fails), the GraphRAG_System should roll back all changes, leaving the database in the same state as before the transaction started, with no partial data.

**Validates: Requirements 12.5**

### Property 31: HTTP Status Code Correctness

*For any* API request, the response should have an appropriate HTTP status code: 200 for success, 400 for invalid request, 401 for unauthorized, 404 for not found, 500 for server error, with the status code matching the error category.

**Validates: Requirements 13.3**

### Property 32: JWT Authentication Enforcement

*For any* API endpoint requiring authentication, requests with invalid or missing JWT tokens should be rejected with 401 status, and requests with valid tokens should be processed normally.

**Validates: Requirements 13.4**

### Property 33: CORS Header Presence

*For any* API response, the response headers should include appropriate CORS headers (Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers) to allow requests from the React frontend origin.

**Validates: Requirements 13.5**

### Property 34: Manual Context Selection

*For any* set of manually selected entities, the GraphRAG_System should allow adding entities to context, removing entities from context, and the final context should contain exactly the manually selected entities (no more, no less).

**Validates: Requirements 14.5**

### Property 35: Asynchronous Processing Independence

*For any* upload session, processing should continue in the background even if the client disconnects, and the session status should be retrievable via polling using the session ID at any time during or after processing.

**Validates: Requirements 15.1, 15.2, 15.3, 15.6**

### Property 36: Upload Session Status Transitions

*For any* upload session, the status should transition through valid states only: pending → processing → (completed | failed), with no invalid transitions (e.g., completed → processing), and the final status should accurately reflect the processing outcome.

**Validates: Requirements 15.4, 15.5**



## Testing Strategy

### Dual Testing Approach

The GraphRAG system requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and error conditions. These tests verify concrete scenarios and integration points between components.

**Property-Based Tests**: Focus on universal properties that should hold across all inputs. These tests use randomized input generation to verify correctness properties with minimum 100 iterations per test.

Both approaches are complementary and necessary:
- Unit tests catch specific bugs and verify edge cases
- Property tests verify general correctness across the input space
- Together they provide confidence in system correctness

### Property-Based Testing Configuration

**Framework**: Hypothesis (Python)

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with: `# Feature: graphrag-system, Property {N}: {property_text}`
- Custom strategies for generating valid test data

**Test Data Strategies**:

```python
from hypothesis import strategies as st

# Generate valid entity types
entity_types = st.sampled_from(['file', 'function', 'class', 'variable', 'import'])

# Generate valid programming languages
languages = st.sampled_from(['python', 'javascript', 'typescript', 'java'])

# Generate valid code entities
@st.composite
def code_entity(draw):
    return CodeEntity(
        id=draw(st.uuids()).hex,
        project_id=draw(st.uuids()).hex,
        entity_type=draw(entity_types),
        name=draw(st.text(min_size=1, max_size=50, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd')))),
        file_path=draw(st.text(min_size=1, max_size=100)),
        start_line=draw(st.integers(min_value=1, max_value=1000)),
        end_line=draw(st.integers(min_value=1, max_value=1000)),
        language=draw(languages)
    )

# Generate valid relationships
@st.composite
def code_relationship(draw, source_ids, target_ids):
    return CodeRelationship(
        source_id=draw(st.sampled_from(source_ids)),
        target_id=draw(st.sampled_from(target_ids)),
        relationship_type=draw(st.sampled_from(['CALLS', 'IMPORTS', 'DEFINES', 'EXTENDS', 'IMPLEMENTS', 'USES']))
    )

# Generate valid embeddings (768 dimensions)
embeddings = st.lists(st.floats(min_value=-1.0, max_value=1.0), min_size=768, max_size=768)

# Generate valid projects
@st.composite
def project(draw):
    return Project(
        id=draw(st.uuids()).hex,
        name=draw(st.text(min_size=1, max_size=50)),
        user_id=draw(st.uuids()).hex,
        created_at=datetime.now(),
        file_count=draw(st.integers(min_value=0, max_value=10000)),
        entity_count=draw(st.integers(min_value=0, max_value=100000))
    )
```

### Unit Test Coverage

**Code Parser Tests**:
- Test parsing valid Python, JavaScript, TypeScript, Java files
- Test parsing files with syntax errors
- Test extraction of specific entity types (functions, classes, imports)
- Test extraction of specific relationships (calls, imports, extends)
- Test handling of edge cases (empty files, very large files, special characters)

**Graph Service Tests**:
- Test creating projects, entities, relationships
- Test querying callers, dependencies, imports, class hierarchy
- Test impact analysis with various graph structures
- Test handling of circular dependencies
- Test graph filtering and pagination
- Test error handling (connection failures, invalid queries)

**Vector Service Tests**:
- Test storing and retrieving embeddings
- Test semantic search with various queries
- Test similarity threshold filtering
- Test multi-project search
- Test handling of missing embeddings

**Context Retriever Tests**:
- Test hybrid search combining vector and graph results
- Test entity ranking by relevance
- Test token budget enforcement
- Test context assembly with citations
- Test manual entity selection

**Upload Service Tests**:
- Test upload via different methods (drag-drop, GitHub, zip)
- Test file size validation
- Test asynchronous processing
- Test status polling
- Test error reporting

**API Tests**:
- Test all REST endpoints with valid requests
- Test authentication and authorization
- Test error responses with invalid requests
- Test CORS headers
- Test OpenAPI documentation endpoint

### Integration Tests

**Database Integration**:
- Test Neo4j connection and query execution
- Test Chroma connection and vector operations
- Test Redis caching
- Test transaction rollback on failures

**Service Integration**:
- Test Upload Service → Code Parser → Graph Service flow
- Test Code Parser → Embedding Generator → Vector Service flow
- Test Query Service coordinating Graph Service and Vector Service
- Test Context Retriever using both Graph Service and Vector Service

**Async Processing Integration**:
- Test Celery task execution
- Test RabbitMQ message passing
- Test status updates during processing
- Test background processing continuation

### End-to-End Tests

**Complete Upload Workflow**:
1. Upload project via API
2. Poll status until completion
3. Verify all entities stored in Neo4j
4. Verify all embeddings stored in Chroma
5. Query the project and verify results

**Complete Query Workflow**:
1. Upload and index a test project
2. Perform semantic search
3. Perform graph traversal queries
4. Perform impact analysis
5. Verify all results are correct

**Complete Context Retrieval Workflow**:
1. Upload and index a test project
2. Submit a chat query
3. Verify context is retrieved
4. Verify token budget is enforced
5. Verify context includes citations

### Performance Testing

While property-based tests focus on correctness, performance tests verify the system meets performance requirements:

**Load Testing**:
- Test with 100 concurrent users
- Measure query response times (p50, p95, p99)
- Measure upload processing throughput
- Identify bottlenecks

**Scalability Testing**:
- Test with projects of varying sizes (10, 100, 1000, 10000 files)
- Measure memory usage
- Measure database query performance
- Test lazy loading and pagination

**Stress Testing**:
- Test with maximum file size (10,000 files)
- Test with maximum graph size (100,000 entities)
- Test with maximum concurrent uploads
- Verify graceful degradation under load

### Test Execution

**Local Development**:
```bash
# Run all tests
pytest tests/

# Run unit tests only
pytest tests/unit/

# Run property-based tests only
pytest tests/property/

# Run integration tests only
pytest tests/integration/

# Run with coverage
pytest --cov=src --cov-report=html tests/
```

**CI/CD Pipeline**:
1. Run unit tests on every commit
2. Run property-based tests on every PR
3. Run integration tests on every PR
4. Run end-to-end tests before deployment
5. Run performance tests weekly

### Test Data Management

**Test Fixtures**:
- Small test projects (10-50 files) for fast unit tests
- Medium test projects (100-500 files) for integration tests
- Large test projects (1000+ files) for performance tests
- Projects with known structures for correctness verification

**Database Setup**:
- Use testcontainers for Neo4j and Chroma in tests
- Reset database state between tests
- Use separate test databases from development/production

**Mock Services**:
- Mock Gemini API for unit tests (avoid rate limits and costs)
- Use real Gemini API for integration tests (verify actual behavior)
- Mock external services (GitHub API) for reliability

### Continuous Monitoring

**Production Monitoring**:
- Track query response times
- Track error rates by error type
- Track upload success/failure rates
- Track API endpoint usage
- Alert on performance degradation or error spikes

**Test Monitoring**:
- Track test execution time
- Track test flakiness
- Track code coverage trends
- Alert on coverage drops or test failures

