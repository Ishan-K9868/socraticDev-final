# Implementation Plan: GraphRAG System

## Overview

This implementation plan breaks down the GraphRAG system into incremental coding tasks. The system will be built in phases, starting with backend infrastructure, then adding core functionality, and finally integrating with the frontend. Each task builds on previous tasks and includes property-based tests to verify correctness.

## Tasks

- [x] 1. Set up backend infrastructure and project structure
  - Create FastAPI project with proper directory structure (src/, tests/, config/)
  - Set up Docker Compose with Neo4j, Chroma, Redis, RabbitMQ, PostgreSQL
  - Configure environment variables and settings management
  - Create base models and enums (EntityType, RelationshipType, Language)
  - Set up logging and error handling infrastructure
  - _Requirements: 13.1_

- [ ]* 1.1 Write unit tests for project setup
  - Test environment variable loading
  - Test database connection configuration
  - _Requirements: 13.1_

- [ ] 2. Implement Neo4j Graph Service
  - [x] 2.1 Create Neo4j connection manager with retry logic
    - Implement connection pooling and health checks
    - Implement exponential backoff retry logic (3 retries)
    - _Requirements: 10.2_

  - [ ]* 2.2 Write property test for retry logic
    - **Property 24: Retry Logic with Exponential Backoff**
    - **Validates: Requirements 10.2**
    - For any database operation that fails, verify retries occur with exponential delays

  - [x] 2.3 Implement Graph Service core operations
    - Implement create_project, create_entities, create_relationships
    - Implement find_callers, find_dependencies, get_class_hierarchy
    - Implement impact_analysis with cycle detection
    - Create database indexes for performance
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.5_

  - [ ]* 2.4 Write property test for graph query correctness
    - **Property 13: Graph Query Correctness**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
    - For any graph with known relationships, verify queries return exact matches

  - [ ]* 2.5 Write property test for transitive dependency completeness
    - **Property 14: Transitive Dependency Completeness**
    - **Validates: Requirements 5.1, 5.2, 5.3**
    - For any function in call graph, verify impact analysis returns all reachable functions

  - [ ]* 2.6 Write property test for circular dependency detection
    - **Property 15: Circular Dependency Detection**
    - **Validates: Requirements 5.5**
    - For any graph with cycles, verify cycles are detected and reported

  - [x] 2.7 Implement transaction management with rollback
    - Implement atomic transactions across Neo4j operations
    - Implement rollback on failure
    - _Requirements: 12.5_

  - [ ]* 2.8 Write property test for transaction atomicity
    - **Property 30: Transaction Atomicity**
    - **Validates: Requirements 12.5**
    - For any failed transaction, verify database returns to previous state

- [ ] 3. Implement Chroma Vector Service
  - [x] 3.1 Create Chroma connection manager
    - Implement connection to Chroma with PostgreSQL backend
    - Create collection management (create, delete, list)
    - _Requirements: 2.3_

  - [x] 3.2 Implement Vector Service operations
    - Implement store_embedding with metadata
    - Implement semantic_search with similarity threshold
    - Implement find_similar_entities
    - Implement delete_project_embeddings
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 3.3 Write property test for embedding storage round-trip
    - **Property 4: Data Persistence Round-Trip** (vector portion)
    - **Validates: Requirements 2.3**
    - For any embedding stored, verify retrieval returns equivalent data

  - [ ]* 3.4 Write property test for search result limit and ranking
    - **Property 11: Search Result Limit and Ranking**
    - **Validates: Requirements 3.2, 3.3**
    - For any search query, verify at most 20 results, all >= 0.7 similarity, sorted descending

- [ ] 4. Implement Gemini Embedding Generator
  - [x] 4.1 Create Gemini API client with rate limiting
    - Implement API client for text-embedding-004 model
    - Implement token bucket rate limiting
    - Implement request queueing when rate limited
    - _Requirements: 2.1, 10.3_

  - [ ]* 4.2 Write property test for rate limit queueing
    - **Property 25: Rate Limit Queueing**
    - **Validates: Requirements 10.3**
    - For any sequence exceeding rate limit, verify requests are queued and processed

  - [x] 4.3 Implement embedding generation methods
    - Implement generate_embedding for raw text
    - Implement generate_code_embedding with formatting
    - Implement batch_generate_embeddings
    - _Requirements: 2.1, 2.2_

  - [ ]* 4.4 Write property test for embedding input format
    - **Property 9: Embedding Input Format Consistency**
    - **Validates: Requirements 2.2**
    - For any code entity, verify embedding input includes name, signature, docstring, body

  - [ ]* 4.5 Write property test for query embedding generation
    - **Property 10: Query Embedding Generation**
    - **Validates: Requirements 3.1**
    - For any non-empty query, verify 768-dimensional embedding is generated

- [x] 5. Checkpoint - Ensure database services work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement Code Parser Service with Tree-sitter
  - [x] 6.1 Set up Tree-sitter parsers for all languages
    - Install and configure tree-sitter-python, tree-sitter-javascript, tree-sitter-typescript, tree-sitter-java
    - Create language detection utility
    - _Requirements: 1.2_

  - [x] 6.2 Implement AST entity extraction
    - Implement extract_entities for functions, classes, variables, imports
    - Handle language-specific syntax differences
    - _Requirements: 1.3, 11.1, 11.2, 11.3_

  - [ ]* 6.3 Write property test for multi-language parsing
    - **Property 2: Multi-Language Parsing Correctness**
    - **Validates: Requirements 1.2, 11.1, 11.2, 11.3**
    - For any valid code in supported languages, verify successful parsing and entity extraction

  - [x] 6.4 Implement AST relationship extraction
    - Implement extract_relationships for calls, imports, extends, implements, uses
    - Handle method calls, function calls, static calls
    - _Requirements: 1.3, 11.5_

  - [ ]* 6.5 Write property test for entity extraction completeness
    - **Property 3: Entity Extraction Completeness**
    - **Validates: Requirements 1.3, 11.5**
    - For any parsed AST, verify all entities and relationships are extracted

  - [x] 6.6 Implement error handling for parsing
    - Handle syntax errors gracefully
    - Continue parsing valid portions of files
    - Log errors with file path and line number
    - _Requirements: 1.7, 11.4_

  - [ ]* 6.7 Write property test for error resilience
    - **Property 6: Error Resilience in Batch Processing**
    - **Validates: Requirements 1.7, 2.4, 10.1, 11.4**
    - For any batch with some failures, verify processing continues and all errors are logged

  - [x] 6.8 Implement function overloading disambiguation
    - Detect multiple functions with same name
    - Create unique identifiers (append parameter types or line numbers)
    - _Requirements: 11.6_

  - [ ]* 6.9 Write property test for overloading disambiguation
    - **Property 27: Function Overloading Disambiguation**
    - **Validates: Requirements 11.6**
    - For any file with overloaded functions, verify separate nodes with unique IDs

  - [x] 6.10 Implement parse_file and parse_project methods
    - Implement single file parsing with ParseResult
    - Implement batch project parsing with statistics
    - _Requirements: 1.2, 1.3_

- [ ] 7. Implement Upload Service with async processing
  - [x] 7.1 Set up Celery with RabbitMQ
    - Configure Celery app with RabbitMQ broker
    - Create task queue configuration
    - _Requirements: 15.1_

  - [x] 7.2 Implement upload methods
    - Implement upload_project for file uploads
    - Implement upload_from_github for GitHub URLs
    - Validate file size limits (max 10,000 files)
    - _Requirements: 1.1, 1.9_

  - [ ]* 7.3 Write property test for upload method agnostic processing
    - **Property 1: Upload Method Agnostic Processing**
    - **Validates: Requirements 1.1**
    - For any valid upload method, verify processing initiates with session ID

  - [x] 7.4 Implement Celery task for project processing
    - Create process_project_upload task
    - Coordinate Code Parser, Graph Service, Embedding Generator, Vector Service
    - Update session status and progress
    - _Requirements: 1.4, 1.6, 15.1_

  - [ ]* 7.5 Write property test for progress monotonicity
    - **Property 5: Progress Update Monotonicity**
    - **Validates: Requirements 1.6**
    - For any upload session, verify progress is monotonically increasing

  - [x] 7.6 Implement upload session management
    - Create UploadSession model and storage
    - Implement get_upload_status for polling
    - _Requirements: 15.2, 15.3_

  - [ ]* 7.7 Write property test for async processing independence
    - **Property 35: Asynchronous Processing Independence**
    - **Validates: Requirements 15.1, 15.2, 15.3, 15.6**
    - For any upload session, verify processing continues independently and status is retrievable

  - [ ]* 7.8 Write property test for session status transitions
    - **Property 36: Upload Session Status Transitions**
    - **Validates: Requirements 15.4, 15.5**
    - For any session, verify status transitions are valid and final status is accurate

  - [x] 7.9 Implement statistics calculation
    - Calculate file count, entity count, relationship count
    - _Requirements: 1.8_

  - [ ]* 7.10 Write property test for statistics accuracy
    - **Property 7: Statistics Accuracy**
    - **Validates: Requirements 1.8**
    - For any completed upload, verify statistics match actual database counts

- [x] 8. Checkpoint - Ensure upload pipeline works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement Context Retriever with hybrid search
  - [x] 9.1 Implement hybrid search
    - Combine semantic search from Vector Service
    - Combine graph neighborhood search from Graph Service
    - _Requirements: 6.1, 6.2_

  - [x] 9.2 Implement entity ranking
    - Calculate relevance score: 0.7 * similarity + 0.3 * (1 / graph_distance)
    - Sort entities by relevance score
    - _Requirements: 6.3_

  - [ ]* 9.3 Write property test for hybrid search combination
    - **Property 16: Hybrid Search Combination**
    - **Validates: Requirements 6.1, 6.2, 6.3**
    - For any query, verify results include entities from both vector and graph search, ranked by relevance

  - [x] 9.4 Implement token budget enforcement
    - Count tokens for each entity
    - Include entities until budget is reached
    - Prioritize higher-ranked entities
    - Track and display token usage
    - _Requirements: 6.4, 6.5_

  - [ ]* 9.5 Write property test for token budget enforcement
    - **Property 17: Token Budget Enforcement**
    - **Validates: Requirements 6.4, 6.5, 14.3, 14.6**
    - For any context assembly, verify total tokens <= budget and higher-ranked entities prioritized

  - [x] 9.6 Implement context assembly with citations
    - Format context with source citations: [File: {path}, Lines: {start}-{end}]
    - Include entity code with proper formatting
    - _Requirements: 6.6_

  - [ ]* 9.7 Write property test for context source citation
    - **Property 18: Context Source Citation**
    - **Validates: Requirements 6.6**
    - For any assembled context, verify each entity has source citation with file path and line numbers

  - [x] 9.8 Implement manual entity selection
    - Allow adding/removing entities from context
    - Validate manual context against token budget
    - _Requirements: 14.5, 14.6_

  - [ ]* 9.9 Write property test for manual context selection
    - **Property 34: Manual Context Selection**
    - **Validates: Requirements 14.5**
    - For any manual selection, verify final context contains exactly selected entities

- [ ] 10. Implement Query Service
  - [x] 10.1 Implement query coordination methods
    - Implement find_callers, find_dependencies, impact_analysis
    - Implement semantic_search
    - Implement get_graph_visualization
    - Coordinate Graph Service and Vector Service calls
    - _Requirements: 4.1, 4.2, 5.1, 3.1_

  - [ ]* 10.2 Write property test for result completeness
    - **Property 12: Result Completeness**
    - **Validates: Requirements 3.4, 5.3, 8.3, 14.2**
    - For any query result, verify all required fields are present

- [ ] 11. Implement Redis Cache Service
  - [x] 11.1 Create Redis connection manager
    - Implement connection pooling
    - Implement health checks
    - _Requirements: 9.6_

  - [x] 11.2 Implement caching operations
    - Implement get, set with TTL (5 minutes default)
    - Implement invalidate_project
    - Create cache key patterns for different query types
    - _Requirements: 9.6_

  - [x] 11.3 Integrate caching into Query Service
    - Cache query results (callers, dependencies, impact, search, graph)
    - Check cache before executing queries
    - Invalidate cache on project updates
    - _Requirements: 9.6_

- [ ] 12. Implement multi-project support
  - [x] 12.1 Implement project isolation in Graph Service
    - Add project_id to all Cypher queries
    - Ensure queries never cross project boundaries
    - _Requirements: 8.1_

  - [ ]* 12.2 Write property test for multi-project isolation
    - **Property 22: Multi-Project Isolation**
    - **Validates: Requirements 8.1, 8.4**
    - For any two projects, verify entities have no cross-project relationships

  - [x] 12.3 Implement multi-project search in Vector Service
    - Search across multiple Chroma collections
    - Merge results by similarity score
    - Annotate results with project_id
    - _Requirements: 8.5_

  - [ ]* 12.4 Write property test for multi-project search merging
    - **Property 23: Multi-Project Search Merging**
    - **Validates: Requirements 8.5**
    - For any multi-project search, verify results from all projects sorted globally by similarity

  - [x] 12.5 Implement project switching in Context Retriever
    - Filter context to active project only
    - _Requirements: 8.4_

- [ ] 13. Implement project update and deletion
  - [x] 13.1 Implement incremental project update
    - Identify changed files
    - Remove entities from old file versions
    - Add entities from new file versions
    - Preserve unchanged entities
    - Maintain referential integrity
    - _Requirements: 12.3_

  - [ ]* 13.2 Write property test for incremental update correctness
    - **Property 28: Incremental Update Correctness**
    - **Validates: Requirements 12.3**
    - For any project update, verify only changed files are updated and unchanged files preserved

  - [x] 13.3 Implement project deletion
    - Delete all entities and relationships from Neo4j
    - Delete all embeddings from Chroma
    - Delete all cache entries from Redis
    - _Requirements: 12.4_

  - [ ]* 13.4 Write property test for deletion completeness
    - **Property 29: Project Deletion Completeness**
    - **Validates: Requirements 12.4**
    - For any deleted project, verify all data is removed and queries return not found

- [x] 14. Checkpoint - Ensure all backend services are integrated
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Implement FastAPI REST endpoints
  - [x] 15.1 Create API routers
    - Create upload router (/api/upload)
    - Create query router (/api/query)
    - Create project router (/api/projects)
    - Create visualization router (/api/visualization)
    - _Requirements: 13.1_

  - [x] 15.2 Implement upload endpoints
    - POST /api/upload/project (file upload)
    - POST /api/upload/github (GitHub URL)
    - GET /api/upload/status/{session_id} (status polling)
    - _Requirements: 1.1, 15.2, 15.3_

  - [x] 15.3 Implement query endpoints
    - POST /api/query/callers (find callers)
    - POST /api/query/dependencies (find dependencies)
    - POST /api/query/impact (impact analysis)
    - POST /api/query/search (semantic search)
    - POST /api/query/context (context retrieval)
    - _Requirements: 4.1, 4.2, 5.1, 3.1, 6.1_

  - [x] 15.4 Implement project endpoints
    - GET /api/projects (list projects)
    - GET /api/projects/{project_id} (get project details)
    - PUT /api/projects/{project_id} (update project)
    - DELETE /api/projects/{project_id} (delete project)
    - _Requirements: 8.1, 12.3, 12.4_

  - [x] 15.5 Implement visualization endpoints
    - POST /api/visualization/graph (get graph data)
    - _Requirements: 7.1_

  - [x] 15.6 Implement error handling middleware
    - Catch all exceptions
    - Return appropriate HTTP status codes
    - Log errors with stack traces
    - Maintain system stability
    - _Requirements: 10.5, 13.3_

  - [ ]* 15.7 Write property test for HTTP status code correctness
    - **Property 31: HTTP Status Code Correctness**
    - **Validates: Requirements 13.3**
    - For any API request, verify status code matches error category

  - [ ]* 15.8 Write property test for error stability
    - **Property 26: Error Stability**
    - **Validates: Requirements 10.5**
    - For any unexpected error, verify system logs error and continues serving requests

  - [x] 15.9 Implement JWT authentication middleware
    - Validate JWT tokens on protected endpoints
    - Return 401 for invalid/missing tokens
    - _Requirements: 13.4_

  - [ ]* 15.10 Write property test for JWT authentication
    - **Property 32: JWT Authentication Enforcement**
    - **Validates: Requirements 13.4**
    - For any protected endpoint, verify invalid tokens are rejected with 401

  - [x] 15.11 Implement CORS middleware
    - Add CORS headers to all responses
    - Allow requests from React frontend origin
    - _Requirements: 13.5_

  - [ ]* 15.12 Write property test for CORS headers
    - **Property 33: CORS Header Presence**
    - **Validates: Requirements 13.5**
    - For any API response, verify CORS headers are present

  - [x] 15.13 Set up OpenAPI documentation
    - Configure FastAPI to generate OpenAPI spec
    - Serve documentation at /docs
    - _Requirements: 13.2_

- [ ] 16. Implement frontend integration components
  - [x] 16.1 Create API client service
    - Create axios client with base URL and auth headers
    - Implement methods for all API endpoints
    - Handle errors and retries
    - _Requirements: 13.1_

  - [x] 16.2 Enhance project upload UI
    - Add drag-drop file upload
    - Add GitHub URL input
    - Add zip file upload
    - Display upload progress with real-time updates
    - Display upload statistics on completion
    - Display errors if upload fails
    - _Requirements: 1.1, 1.6, 1.7, 1.8_

  - [x] 16.3 Create graph visualization component
    - Integrate ReactFlow for graph rendering
    - Implement node color-coding by entity type
    - Implement edge styling by relationship type
    - Implement zoom, pan, selection, highlighting
    - Implement node search with highlighting
    - Implement filters (type, language, file pattern)
    - Implement lazy loading for large graphs (>500 nodes)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [ ]* 16.4 Write property test for node visual encoding
    - **Property 19: Node Visual Encoding Consistency**
    - **Validates: Requirements 7.2, 7.3**
    - For any graph visualization, verify nodes and edges have consistent colors/styles by type

  - [ ]* 16.5 Write property test for graph filtering
    - **Property 20: Graph Filtering Correctness**
    - **Validates: Requirements 7.6, 8.2**
    - For any filters, verify displayed nodes match filter criteria exactly

  - [ ]* 16.6 Write property test for node search highlighting
    - **Property 21: Node Search Highlighting**
    - **Validates: Requirements 7.8**
    - For any search query, verify matching nodes are highlighted and non-matching are not

  - [x] 16.4 Create semantic search UI
    - Add search input with query suggestions
    - Display search results with similarity scores
    - Display code snippets for each result
    - Allow selecting results to view full code
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 16.5 Create query interface for graph operations
    - Add UI for finding callers
    - Add UI for finding dependencies
    - Add UI for impact analysis
    - Display results in tree/list format
    - _Requirements: 4.1, 4.2, 5.1_

  - [x] 16.6 Create context management panel
    - Display entities used in AI context
    - Show entity name, file path, relevance score, token count
    - Show total token usage and remaining budget
    - Allow clicking entities to view full code
    - Allow manual entity selection (add/remove)
    - Display warning when budget exceeded
    - _Requirements: 6.7, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

  - [x] 16.7 Integrate context retrieval with AI chat
    - Modify chat component to retrieve context before sending to AI
    - Display context panel alongside chat
    - Highlight which entities were used in AI response
    - _Requirements: 6.1, 6.6, 6.7_

  - [x] 16.8 Add multi-project selector
    - Add dropdown to select active project
    - Add multi-select for cross-project search
    - Display project name in all results
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 17. Final checkpoint - End-to-end testing
  - Test complete upload workflow (upload → parse → index → query)
  - Test complete query workflow (semantic search, graph queries, impact analysis)
  - Test complete context retrieval workflow (query → retrieve → inject → display)
  - Test multi-project workflows
  - Test error handling and edge cases
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 18. Performance optimization and production readiness
  - [x] 18.1 Optimize database queries
    - Add missing indexes
    - Optimize Cypher queries
    - Implement query result pagination
    - _Requirements: 9.5_

  - [x] 18.2 Implement connection pooling
    - Configure Neo4j connection pool
    - Configure Chroma connection pool
    - Configure Redis connection pool
    - _Requirements: 9.1_

  - [x] 18.3 Add monitoring and logging
    - Add structured logging with correlation IDs
    - Add performance metrics (query times, error rates)
    - Add health check endpoints
    - _Requirements: 10.5_

  - [x] 18.4 Create deployment configuration
    - Create production Docker Compose file
    - Create environment variable templates
    - Document deployment steps
    - _Requirements: 13.1_

  - [x] 18.5 Write deployment documentation
    - Document system requirements
    - Document installation steps
    - Document configuration options
    - Document API usage
    - _Requirements: 13.2_

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: infrastructure → services → API → frontend
- All code examples use Python for backend and React/TypeScript for frontend
