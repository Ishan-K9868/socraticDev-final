"""Graph Service for managing Neo4j graph database operations.

This module provides the Graph Service for storing and querying code structure
in Neo4j graph database. It implements:
- Project and entity creation
- Relationship management
- Graph traversal queries (callers, dependencies, class hierarchy)
- Impact analysis with cycle detection
- Database indexes for performance

Validates: Requirements 4.1, 4.2, 4.3, 4.4, 5.1, 5.5
"""

import logging
from typing import List, Optional, Dict, Any, Set, Tuple
from datetime import datetime

from ..models import (
    Project,
    CodeEntity,
    CodeRelationship,
    EntityType,
    RelationshipType,
    Language,
    DependencyTree,
    DependencyNode,
    GraphVisualizationData,
    GraphNode,
    GraphEdge,
    GraphFilters,
)
from .neo4j_manager import Neo4jConnectionManager
from ..utils.errors import DatabaseQueryError

logger = logging.getLogger(__name__)


class ClassHierarchy:
    """Represents a class inheritance hierarchy."""
    
    def __init__(self, root: CodeEntity, parents: List[CodeEntity], children: List[CodeEntity]):
        self.root = root
        self.parents = parents  # Classes this class extends/implements
        self.children = children  # Classes that extend/implement this class


class GraphService:
    """Service for managing Neo4j graph database operations.
    
    This service provides methods for:
    - Creating projects, entities, and relationships
    - Querying graph structure (callers, dependencies, hierarchy)
    - Impact analysis with cycle detection
    - Graph visualization data retrieval
    
    Example:
        service = GraphService(neo4j_manager)
        
        # Create a project
        project = await service.create_project("my-project", "user123", {"lang": "python"})
        
        # Create entities
        entity_ids = await service.create_entities(project.id, entities)
        
        # Find callers of a function
        callers = await service.find_callers(function_id)
    """
    
    def __init__(self, neo4j_manager: Neo4jConnectionManager):
        """Initialize Graph Service.
        
        Args:
            neo4j_manager: Neo4j connection manager instance
        """
        self.neo4j = neo4j_manager
        logger.info("Graph Service initialized")
    
    async def initialize_indexes(self) -> None:
        """Create database indexes for performance optimization.
        
        Creates indexes on frequently queried properties:
        - Entity name (for functions and classes)
        - File path (for files)
        - Project ID (for all entity types)
        
        This should be called once during application startup.
        
        Validates: Requirements 9.5
        """
        indexes = [
            # Index on function names
            "CREATE INDEX entity_function_name IF NOT EXISTS FOR (n:Function) ON (n.name)",
            # Index on class names
            "CREATE INDEX entity_class_name IF NOT EXISTS FOR (n:Class) ON (n.name)",
            # Index on file paths
            "CREATE INDEX file_path IF NOT EXISTS FOR (n:File) ON (n.path)",
            # Index on project IDs for functions
            "CREATE INDEX project_id_function IF NOT EXISTS FOR (n:Function) ON (n.project_id)",
            # Index on project IDs for classes
            "CREATE INDEX project_id_class IF NOT EXISTS FOR (n:Class) ON (n.project_id)",
            # Index on project IDs for files
            "CREATE INDEX project_id_file IF NOT EXISTS FOR (n:File) ON (n.project_id)",
            # Index on project IDs for variables
            "CREATE INDEX project_id_variable IF NOT EXISTS FOR (n:Variable) ON (n.project_id)",
            # Index on project IDs for imports
            "CREATE INDEX project_id_import IF NOT EXISTS FOR (n:Import) ON (n.project_id)",
        ]
        
        for index_query in indexes:
            try:
                await self.neo4j.execute_write_with_retry(index_query)
                logger.info(f"Created index: {index_query}")
            except Exception as e:
                logger.warning(f"Failed to create index (may already exist): {str(e)}")
    
    async def create_project(
        self,
        project_id: str,
        name: str,
        user_id: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Project:
        """Create a project node in Neo4j.
        
        Args:
            project_id: Unique project identifier
            name: Project name
            user_id: User who owns the project
            metadata: Additional project metadata
            
        Returns:
            Project: Created project object
            
        Raises:
            DatabaseQueryError: If project creation fails
        """
        if metadata is None:
            metadata = {}
        
        created_at = datetime.utcnow()
        
        query = """
        CREATE (p:Project {
            id: $project_id,
            name: $name,
            user_id: $user_id,
            created_at: datetime($created_at),
            file_count: 0,
            entity_count: 0,
            status: 'active'
        })
        RETURN p
        """
        
        parameters = {
            "project_id": project_id,
            "name": name,
            "user_id": user_id,
            "created_at": created_at.isoformat(),
        }
        
        try:
            result = await self.neo4j.execute_write_with_retry(query, parameters)
            logger.info(f"Created project: {project_id} ({name})")
            
            return Project(
                id=project_id,
                name=name,
                user_id=user_id,
                created_at=created_at,
                file_count=0,
                entity_count=0,
                status="active"
            )
        except Exception as e:
            logger.error(f"Failed to create project {project_id}: {str(e)}")
            raise DatabaseQueryError(f"Failed to create project: {str(e)}") from e
    
    async def create_entities(
        self,
        project_id: str,
        entities: List[CodeEntity]
    ) -> List[str]:
        """Create entity nodes in Neo4j.
        
        Creates nodes for code entities (files, functions, classes, variables, imports).
        Each entity type is stored with a specific label and properties.
        
        Args:
            project_id: Project ID these entities belong to
            entities: List of code entities to create
            
        Returns:
            List of created node IDs (Neo4j internal IDs as strings)
            
        Raises:
            DatabaseQueryError: If entity creation fails
        """
        if not entities:
            return []
        
        created_ids = []
        
        # Group entities by type for batch creation
        entities_by_type: Dict[EntityType, List[CodeEntity]] = {}
        for entity in entities:
            if entity.entity_type not in entities_by_type:
                entities_by_type[entity.entity_type] = []
            entities_by_type[entity.entity_type].append(entity)
        
        # Create entities for each type
        for entity_type, type_entities in entities_by_type.items():
            ids = await self._create_entities_batch(project_id, entity_type, type_entities)
            created_ids.extend(ids)
        
        # Update project entity count
        await self._update_project_counts(project_id)
        
        logger.info(f"Created {len(created_ids)} entities for project {project_id}")
        return created_ids
    
    async def _create_entities_batch(
        self,
        project_id: str,
        entity_type: EntityType,
        entities: List[CodeEntity]
    ) -> List[str]:
        """Create a batch of entities of the same type.
        
        Args:
            project_id: Project ID
            entity_type: Type of entities to create
            entities: List of entities
            
        Returns:
            List of created node IDs
        """
        # Map entity type to Neo4j label
        label_map = {
            EntityType.FILE: "File",
            EntityType.FUNCTION: "Function",
            EntityType.CLASS: "Class",
            EntityType.VARIABLE: "Variable",
            EntityType.IMPORT: "Import",
        }
        
        label = label_map[entity_type]
        
        # Build entity data for batch creation
        entity_data = []
        for entity in entities:
            data = {
                "id": entity.id or f"{project_id}_{entity.entity_type.value}_{entity.name}_{entity.start_line}",
                "project_id": project_id,
                "name": entity.name,
                "file_path": entity.file_path,
                "start_line": entity.start_line,
                "end_line": entity.end_line,
                "language": entity.language.value,
            }
            
            # Add optional fields
            if entity.signature:
                data["signature"] = entity.signature
            if entity.docstring:
                data["docstring"] = entity.docstring
            if entity.body:
                data["body"] = entity.body
            if entity.metadata:
                # Store metadata as JSON string
                import json
                data["metadata"] = json.dumps(entity.metadata)
            
            entity_data.append(data)
        
        # Create entities in batch using UNWIND
        query = f"""
        UNWIND $entities AS entity
        CREATE (n:{label})
        SET n = entity
        RETURN id(n) AS node_id
        """
        
        try:
            result = await self.neo4j.execute_write_with_retry(
                query,
                {"entities": entity_data}
            )
            
            node_ids = [str(record["node_id"]) for record in result]
            logger.debug(f"Created {len(node_ids)} {label} nodes")
            return node_ids
            
        except Exception as e:
            logger.error(f"Failed to create {label} entities: {str(e)}")
            raise DatabaseQueryError(f"Failed to create entities: {str(e)}") from e
    
    async def create_relationships(
        self,
        relationships: List[CodeRelationship]
    ) -> int:
        """Create relationship edges in Neo4j.
        
        Creates relationships between code entities (CALLS, IMPORTS, DEFINES, etc.).
        
        Args:
            relationships: List of code relationships to create
            
        Returns:
            Count of created relationships
            
        Raises:
            DatabaseQueryError: If relationship creation fails
        """
        if not relationships:
            return 0
        
        # Group relationships by type for batch creation
        relationships_by_type: Dict[RelationshipType, List[CodeRelationship]] = {}
        for rel in relationships:
            if rel.relationship_type not in relationships_by_type:
                relationships_by_type[rel.relationship_type] = []
            relationships_by_type[rel.relationship_type].append(rel)
        
        total_created = 0
        
        # Create relationships for each type
        for rel_type, type_rels in relationships_by_type.items():
            count = await self._create_relationships_batch(rel_type, type_rels)
            total_created += count
        
        logger.info(f"Created {total_created} relationships")
        return total_created
    
    async def create_project_with_entities_atomic(
        self,
        project_id: str,
        name: str,
        user_id: str,
        entities: List[CodeEntity],
        relationships: List[CodeRelationship],
        metadata: Optional[Dict[str, Any]] = None
    ) -> Project:
        """Create a project with entities and relationships atomically.
        
        This method creates a project, its entities, and relationships in a single
        atomic transaction. If any step fails, all changes are rolled back to
        maintain database consistency.
        
        Args:
            project_id: Unique project identifier
            name: Project name
            user_id: User who owns the project
            entities: List of code entities to create
            relationships: List of code relationships to create
            metadata: Additional project metadata
            
        Returns:
            Project: Created project object
            
        Raises:
            DatabaseQueryError: If creation fails (all changes rolled back)
            
        Validates: Requirements 12.5
        """
        if metadata is None:
            metadata = {}
        
        created_at = datetime.utcnow()
        
        try:
            # Build all operations for atomic execution
            operations = []
            
            # 1. Create project
            project_query = """
            CREATE (p:Project {
                id: $project_id,
                name: $name,
                user_id: $user_id,
                created_at: datetime($created_at),
                file_count: 0,
                entity_count: 0,
                status: 'active'
            })
            RETURN p
            """
            operations.append((project_query, {
                "project_id": project_id,
                "name": name,
                "user_id": user_id,
                "created_at": created_at.isoformat(),
            }))
            
            # 2. Create entities (grouped by type)
            entities_by_type: Dict[EntityType, List[CodeEntity]] = {}
            for entity in entities:
                if entity.entity_type not in entities_by_type:
                    entities_by_type[entity.entity_type] = []
                entities_by_type[entity.entity_type].append(entity)
            
            label_map = {
                EntityType.FILE: "File",
                EntityType.FUNCTION: "Function",
                EntityType.CLASS: "Class",
                EntityType.VARIABLE: "Variable",
                EntityType.IMPORT: "Import",
            }
            
            for entity_type, type_entities in entities_by_type.items():
                label = label_map[entity_type]
                entity_data = []
                
                for entity in type_entities:
                    data = {
                        "id": entity.id or f"{project_id}_{entity.entity_type.value}_{entity.name}_{entity.start_line}",
                        "project_id": project_id,
                        "name": entity.name,
                        "file_path": entity.file_path,
                        "start_line": entity.start_line,
                        "end_line": entity.end_line,
                        "language": entity.language.value,
                    }
                    
                    if entity.signature:
                        data["signature"] = entity.signature
                    if entity.docstring:
                        data["docstring"] = entity.docstring
                    if entity.body:
                        data["body"] = entity.body
                    if entity.metadata:
                        import json
                        data["metadata"] = json.dumps(entity.metadata)
                    
                    entity_data.append(data)
                
                entity_query = f"""
                UNWIND $entities AS entity
                CREATE (n:{label})
                SET n = entity
                RETURN id(n) AS node_id
                """
                operations.append((entity_query, {"entities": entity_data}))
            
            # 3. Create relationships (grouped by type)
            relationships_by_type: Dict[RelationshipType, List[CodeRelationship]] = {}
            for rel in relationships:
                if rel.relationship_type not in relationships_by_type:
                    relationships_by_type[rel.relationship_type] = []
                relationships_by_type[rel.relationship_type].append(rel)
            
            for rel_type, type_rels in relationships_by_type.items():
                rel_data = []
                for rel in type_rels:
                    data = {
                        "source_id": rel.source_id,
                        "target_id": rel.target_id,
                    }
                    if rel.metadata:
                        import json
                        data["metadata"] = json.dumps(rel.metadata)
                    rel_data.append(data)
                
                rel_query = f"""
                UNWIND $relationships AS rel
                MATCH (source {{id: rel.source_id}})
                MATCH (target {{id: rel.target_id}})
                CREATE (source)-[r:{rel_type.value}]->(target)
                SET r.metadata = COALESCE(rel.metadata, '{{}}')
                RETURN count(r) AS count
                """
                operations.append((rel_query, {"relationships": rel_data}))
            
            # Execute all operations atomically
            await self.neo4j.execute_atomic_write(operations)
            
            # Update project counts
            await self._update_project_counts(project_id)
            
            logger.info(
                f"Atomically created project {project_id} with "
                f"{len(entities)} entities and {len(relationships)} relationships"
            )
            
            return Project(
                id=project_id,
                name=name,
                user_id=user_id,
                created_at=created_at,
                file_count=0,
                entity_count=0,
                status="active"
            )
            
        except Exception as e:
            logger.error(
                f"Failed to atomically create project {project_id}: {str(e)}. "
                "All changes have been rolled back."
            )
            raise DatabaseQueryError(
                f"Failed to create project atomically: {str(e)}"
            ) from e
    
    async def _create_relationships_batch(
        self,
        relationship_type: RelationshipType,
        relationships: List[CodeRelationship]
    ) -> int:
        """Create a batch of relationships of the same type.
        
        Args:
            relationship_type: Type of relationships to create
            relationships: List of relationships
            
        Returns:
            Count of created relationships
        """
        # Build relationship data
        rel_data = []
        for rel in relationships:
            data = {
                "source_id": rel.source_id,
                "target_id": rel.target_id,
            }
            if rel.metadata:
                import json
                data["metadata"] = json.dumps(rel.metadata)
            rel_data.append(data)
        
        # DEBUG: Log first few relationship IDs
        if rel_data:
            logger.info(f"Creating {len(rel_data)} {relationship_type.value} relationships")
            logger.info(f"Sample relationship IDs: source={rel_data[0]['source_id']}, target={rel_data[0]['target_id']}")
        
        # For IMPORTS relationships, create external module nodes if they don't exist
        if relationship_type == RelationshipType.IMPORTS:
            query = f"""
            UNWIND $relationships AS rel
            MATCH (source {{id: rel.source_id}})
            MERGE (target:ExternalModule {{id: rel.target_id}})
            ON CREATE SET target.name = substring(rel.target_id, 9)
            CREATE (source)-[r:{relationship_type.value}]->(target)
            SET r.metadata = COALESCE(rel.metadata, '{{}}')
            RETURN count(r) AS count
            """
        else:
            # For other relationships, both nodes must exist
            query = f"""
            UNWIND $relationships AS rel
            MATCH (source {{id: rel.source_id}})
            MATCH (target {{id: rel.target_id}})
            CREATE (source)-[r:{relationship_type.value}]->(target)
            SET r.metadata = COALESCE(rel.metadata, '{{}}')
            RETURN count(r) AS count
            """
        
        try:
            result = await self.neo4j.execute_write_with_retry(
                query,
                {"relationships": rel_data}
            )
            
            count = result[0]["count"] if result else 0
            logger.info(f"Successfully created {count} {relationship_type.value} relationships (attempted {len(rel_data)})")
            if count < len(rel_data):
                logger.warning(f"Only {count} of {len(rel_data)} {relationship_type.value} relationships were created - some source/target IDs may not exist")
            return count
            
        except Exception as e:
            logger.error(f"Failed to create {relationship_type.value} relationships: {str(e)}")
            raise DatabaseQueryError(f"Failed to create relationships: {str(e)}") from e
    
    async def find_callers(self, function_id: str, project_id: str) -> List[CodeEntity]:
        """Find all functions that call the specified function.
        
        Executes Cypher query traversing incoming CALLS relationships.
        
        Args:
            function_id: ID of the function to find callers for
            project_id: Project identifier for isolation
            
        Returns:
            List of CodeEntity objects representing calling functions
            
        Validates: Requirements 4.1
        """
        query = """
        MATCH (caller)-[:CALLS]->(target {id: $function_id, project_id: $project_id})
        WHERE caller.project_id = $project_id
        RETURN caller
        """
        
        try:
            result = await self.neo4j.execute_with_retry(
                query,
                {"function_id": function_id, "project_id": project_id}
            )
            
            callers = [self._node_to_entity(record["caller"]) for record in result]
            logger.debug(f"Found {len(callers)} callers for function {function_id} in project {project_id}")
            return callers
            
        except Exception as e:
            logger.error(f"Failed to find callers for {function_id}: {str(e)}")
            raise DatabaseQueryError(f"Failed to find callers: {str(e)}") from e
    
    async def find_dependencies(self, function_id: str, project_id: str) -> List[CodeEntity]:
        """Find all functions and variables that the specified function depends on.
        
        Executes Cypher query traversing outgoing CALLS and USES relationships.
        
        Args:
            function_id: ID of the function to find dependencies for
            project_id: Project identifier for isolation
            
        Returns:
            List of CodeEntity objects representing dependencies
            
        Validates: Requirements 4.2
        """
        query = """
        MATCH (source {id: $function_id, project_id: $project_id})-[:CALLS|USES]->(dep)
        WHERE dep.project_id = $project_id
        RETURN dep
        """
        
        try:
            result = await self.neo4j.execute_with_retry(
                query,
                {"function_id": function_id, "project_id": project_id}
            )
            
            dependencies = [self._node_to_entity(record["dep"]) for record in result]
            logger.debug(f"Found {len(dependencies)} dependencies for function {function_id} in project {project_id}")
            return dependencies
            
        except Exception as e:
            logger.error(f"Failed to find dependencies for {function_id}: {str(e)}")
            raise DatabaseQueryError(f"Failed to find dependencies: {str(e)}") from e
    
    async def get_class_hierarchy(self, class_id: str) -> ClassHierarchy:
        """Get inheritance tree for a class.
        
        Executes Cypher query traversing EXTENDS and IMPLEMENTS relationships
        in both directions to find parent and child classes.
        
        Args:
            class_id: ID of the class to get hierarchy for
            
        Returns:
            ClassHierarchy object with root, parents, and children
            
        Validates: Requirements 4.4
        """
        # Get the root class
        root_query = """
        MATCH (c {id: $class_id})
        RETURN c
        """
        
        # Get parent classes (classes this class extends/implements)
        parents_query = """
        MATCH (c {id: $class_id})-[:EXTENDS|IMPLEMENTS]->(parent)
        RETURN parent
        """
        
        # Get child classes (classes that extend/implement this class)
        children_query = """
        MATCH (child)-[:EXTENDS|IMPLEMENTS]->(c {id: $class_id})
        RETURN child
        """
        
        try:
            # Execute queries
            root_result = await self.neo4j.execute_with_retry(root_query, {"class_id": class_id})
            if not root_result:
                raise DatabaseQueryError(f"Class {class_id} not found")
            
            root = self._node_to_entity(root_result[0]["c"])
            
            parents_result = await self.neo4j.execute_with_retry(parents_query, {"class_id": class_id})
            parents = [self._node_to_entity(record["parent"]) for record in parents_result]
            
            children_result = await self.neo4j.execute_with_retry(children_query, {"class_id": class_id})
            children = [self._node_to_entity(record["child"]) for record in children_result]
            
            logger.debug(
                f"Found class hierarchy for {class_id}: "
                f"{len(parents)} parents, {len(children)} children"
            )
            
            return ClassHierarchy(root=root, parents=parents, children=children)
            
        except Exception as e:
            logger.error(f"Failed to get class hierarchy for {class_id}: {str(e)}")
            raise DatabaseQueryError(f"Failed to get class hierarchy: {str(e)}") from e
    
    async def impact_analysis(
        self,
        function_id: str,
        project_id: str,
        max_depth: int = 5
    ) -> DependencyTree:
        """Perform transitive dependency analysis with cycle detection.
        
        Traverses all transitive CALLS relationships to identify affected functions.
        Detects circular dependencies and limits depth to prevent infinite traversal.
        
        Args:
            function_id: ID of the function to analyze
            project_id: Project identifier for isolation
            max_depth: Maximum traversal depth (default: 5)
            
        Returns:
            DependencyTree with all dependencies, depths, paths, and detected cycles
            
        Validates: Requirements 5.1, 5.5
        """
        # Query for transitive dependencies with path tracking
        query = """
        MATCH path = (source {id: $function_id, project_id: $project_id})-[:CALLS*1..]->(dep)
        WHERE length(path) <= $max_depth
          AND dep.project_id = $project_id
          AND ALL(node IN nodes(path) WHERE node.project_id = $project_id)
        WITH dep, path, 
             length(path) AS depth,
             [node IN nodes(path) | node.id] AS node_ids
        RETURN DISTINCT 
            dep,
            depth,
            node_ids
        ORDER BY depth
        """
        
        try:
            # Get the root function
            root_query = "MATCH (f {id: $function_id, project_id: $project_id}) RETURN f"
            root_result = await self.neo4j.execute_with_retry(
                root_query, 
                {"function_id": function_id, "project_id": project_id}
            )
            
            if not root_result:
                raise DatabaseQueryError(f"Function {function_id} not found in project {project_id}")
            
            root = self._node_to_entity(root_result[0]["f"])
            
            # Get dependencies
            result = await self.neo4j.execute_with_retry(
                query,
                {"function_id": function_id, "project_id": project_id, "max_depth": max_depth}
            )
            
            # Process results and detect cycles
            dependencies: List[DependencyNode] = []
            circular_deps: List[List[str]] = []
            seen_paths: Set[Tuple[str, ...]] = set()
            
            for record in result:
                dep_entity = self._node_to_entity(record["dep"])
                depth = record["depth"]
                node_ids = record["node_ids"]
                
                # Check for cycles (if a node appears twice in the path)
                if len(node_ids) != len(set(node_ids)):
                    # Found a cycle
                    cycle = self._extract_cycle(node_ids)
                    if cycle and tuple(cycle) not in seen_paths:
                        circular_deps.append(cycle)
                        seen_paths.add(tuple(cycle))
                
                dependencies.append(
                    DependencyNode(
                        entity=dep_entity,
                        depth=depth,
                        path=node_ids
                    )
                )
            
            # Check if results were truncated
            truncated = len(result) > 0 and any(d.depth >= max_depth for d in dependencies)
            
            logger.info(
                f"Impact analysis for {function_id}: "
                f"{len(dependencies)} dependencies, "
                f"{len(circular_deps)} cycles detected, "
                f"truncated={truncated}"
            )
            
            return DependencyTree(
                root=root,
                dependencies=dependencies,
                max_depth=max_depth,
                truncated=truncated,
                circular_dependencies=circular_deps
            )
            
        except Exception as e:
            logger.error(f"Failed to perform impact analysis for {function_id}: {str(e)}")
            raise DatabaseQueryError(f"Failed to perform impact analysis: {str(e)}") from e
    
    def _extract_cycle(self, node_ids: List[str]) -> List[str]:
        """Extract the cycle from a path with repeated nodes.
        
        Args:
            node_ids: List of node IDs in the path
            
        Returns:
            List of node IDs forming the cycle
        """
        # Find the first repeated node
        seen = set()
        for i, node_id in enumerate(node_ids):
            if node_id in seen:
                # Found the start of the cycle
                cycle_start = node_ids.index(node_id)
                return node_ids[cycle_start:i+1]
            seen.add(node_id)
        return []
    
    async def get_project_graph(
        self,
        project_id: str,
        filters: Optional[GraphFilters] = None
    ) -> GraphVisualizationData:
        """Retrieve graph data for visualization with optional filters.
        
        Args:
            project_id: Project ID to get graph for
            filters: Optional filters for entity types, languages, file patterns
            
        Returns:
            GraphVisualizationData with nodes and edges for visualization
        """
        if filters is None:
            filters = GraphFilters()
        
        # Build filter conditions
        conditions = ["n.project_id = $project_id"]
        parameters: Dict[str, Any] = {"project_id": project_id}
        
        if filters.entity_types:
            # Filter by entity type (node labels)
            labels = [self._entity_type_to_label(et) for et in filters.entity_types]
            label_filter = " OR ".join([f"n:{label}" for label in labels])
            conditions.append(f"({label_filter})")
        
        if filters.languages:
            conditions.append("n.language IN $languages")
            parameters["languages"] = [lang.value for lang in filters.languages]
        
        if filters.file_pattern:
            conditions.append("n.file_path =~ $file_pattern")
            parameters["file_pattern"] = filters.file_pattern
        
        where_clause = " AND ".join(conditions)
        
        # Query for nodes
        nodes_query = f"""
        MATCH (n)
        WHERE {where_clause}
        RETURN n
        LIMIT $max_nodes
        """
        parameters["max_nodes"] = filters.max_nodes
        
        # Query for edges between filtered nodes
        edges_query = f"""
        MATCH (source)-[r]->(target)
        WHERE source.project_id = $project_id 
          AND target.project_id = $project_id
        RETURN source.id AS source_id, 
               target.id AS target_id, 
               type(r) AS rel_type
        LIMIT $max_nodes
        """
        
        try:
            # Get nodes
            nodes_result = await self.neo4j.execute_with_retry(nodes_query, parameters)
            nodes = [self._node_to_graph_node(record["n"]) for record in nodes_result]
            
            # Get edges
            edges_result = await self.neo4j.execute_with_retry(edges_query, parameters)
            edges = [
                GraphEdge(
                    source=record["source_id"],
                    target=record["target_id"],
                    type=RelationshipType(record["rel_type"]),
                    label=record["rel_type"]
                )
                for record in edges_result
            ]
            
            logger.debug(
                f"Retrieved graph for project {project_id}: "
                f"{len(nodes)} nodes, {len(edges)} edges"
            )
            
            return GraphVisualizationData(
                nodes=nodes,
                edges=edges,
                layout="hierarchical"
            )
            
        except Exception as e:
            logger.error(f"Failed to get project graph for {project_id}: {str(e)}")
            raise DatabaseQueryError(f"Failed to get project graph: {str(e)}") from e
    
    async def _update_project_counts(self, project_id: str) -> None:
        """Update entity and file counts for a project.
        
        Args:
            project_id: Project ID to update counts for
        """
        query = """
        MATCH (p:Project {id: $project_id})
        OPTIONAL MATCH (p)<-[:BELONGS_TO]-(f:File)
        WITH p, count(DISTINCT f) AS file_count
        OPTIONAL MATCH (e)
        WHERE e.project_id = $project_id 
          AND (e:Function OR e:Class OR e:Variable OR e:Import)
        WITH p, file_count, count(e) AS entity_count
        SET p.file_count = file_count,
            p.entity_count = entity_count
        RETURN p
        """
        
        try:
            await self.neo4j.execute_write_with_retry(query, {"project_id": project_id})
        except Exception as e:
            logger.warning(f"Failed to update project counts: {str(e)}")
    
    def _node_to_entity(self, node: Dict[str, Any]) -> CodeEntity:
        """Convert a Neo4j node to a CodeEntity object.
        
        Args:
            node: Neo4j node as dictionary
            
        Returns:
            CodeEntity object
        """
        import json
        
        # Determine entity type from node labels
        labels = node.get("labels", [])
        entity_type = EntityType.FUNCTION  # default
        
        if "File" in labels:
            entity_type = EntityType.FILE
        elif "Function" in labels:
            entity_type = EntityType.FUNCTION
        elif "Class" in labels:
            entity_type = EntityType.CLASS
        elif "Variable" in labels:
            entity_type = EntityType.VARIABLE
        elif "Import" in labels:
            entity_type = EntityType.IMPORT
        
        # Parse metadata if present
        metadata = {}
        if "metadata" in node and node["metadata"]:
            try:
                metadata = json.loads(node["metadata"])
            except json.JSONDecodeError:
                pass
        
        return CodeEntity(
            id=node.get("id"),
            project_id=node.get("project_id", ""),
            entity_type=entity_type,
            name=node.get("name", ""),
            file_path=node.get("file_path", ""),
            start_line=node.get("start_line", 0),
            end_line=node.get("end_line", 0),
            signature=node.get("signature"),
            docstring=node.get("docstring"),
            body=node.get("body"),
            language=Language(node.get("language", "python")),
            metadata=metadata
        )
    
    def _node_to_graph_node(self, node: Dict[str, Any]) -> GraphNode:
        """Convert a Neo4j node to a GraphNode for visualization.
        
        Args:
            node: Neo4j node as dictionary
            
        Returns:
            GraphNode object
        """
        import json
        
        labels = node.get("labels", [])
        entity_type = EntityType.FUNCTION
        
        if "File" in labels:
            entity_type = EntityType.FILE
        elif "Function" in labels:
            entity_type = EntityType.FUNCTION
        elif "Class" in labels:
            entity_type = EntityType.CLASS
        elif "Variable" in labels:
            entity_type = EntityType.VARIABLE
        elif "Import" in labels:
            entity_type = EntityType.IMPORT
        
        metadata = {}
        if "metadata" in node and node["metadata"]:
            try:
                metadata = json.loads(node["metadata"])
            except json.JSONDecodeError:
                pass
        
        return GraphNode(
            id=node.get("id", ""),
            label=node.get("name", ""),
            type=entity_type,
            file_path=node.get("file_path", ""),
            metadata=metadata
        )
    
    def _entity_type_to_label(self, entity_type: EntityType) -> str:
        """Convert EntityType to Neo4j label.
        
        Args:
            entity_type: EntityType enum value
            
        Returns:
            Neo4j label string
        """
        label_map = {
            EntityType.FILE: "File",
            EntityType.FUNCTION: "Function",
            EntityType.CLASS: "Class",
            EntityType.VARIABLE: "Variable",
            EntityType.IMPORT: "Import",
        }
        return label_map[entity_type]

    async def update_project(
        self,
        project_id: str,
        changed_files: List[Tuple[str, List[CodeEntity], List[CodeRelationship]]],
        deleted_files: List[str]
    ) -> Dict[str, int]:
        """Incrementally update project with changed and deleted files.
        
        Identifies changed files, removes entities from old versions,
        adds entities from new versions, and preserves unchanged entities.
        
        Args:
            project_id: Project identifier
            changed_files: List of (file_path, entities, relationships) for changed files
            deleted_files: List of file paths that were deleted
            
        Returns:
            Dictionary with update statistics:
                - files_updated: Number of files updated
                - files_deleted: Number of files deleted
                - entities_added: Number of entities added
                - entities_removed: Number of entities removed
                - relationships_added: Number of relationships added
                - relationships_removed: Number of relationships removed
                
        Validates: Requirements 12.3
        """
        logger.info(f"Updating project {project_id}: {len(changed_files)} changed, {len(deleted_files)} deleted")
        
        stats = {
            'files_updated': 0,
            'files_deleted': 0,
            'entities_added': 0,
            'entities_removed': 0,
            'relationships_added': 0,
            'relationships_removed': 0
        }
        
        try:
            # Delete entities from deleted files
            for file_path in deleted_files:
                removed = await self._delete_file_entities(project_id, file_path)
                stats['files_deleted'] += 1
                stats['entities_removed'] += removed
            
            # Update changed files
            for file_path, entities, relationships in changed_files:
                # Remove old entities from this file
                removed = await self._delete_file_entities(project_id, file_path)
                stats['entities_removed'] += removed
                
                # Add new entities
                if entities:
                    await self.create_entities(entities)
                    stats['entities_added'] += len(entities)
                
                # Add new relationships
                if relationships:
                    await self.create_relationships(relationships)
                    stats['relationships_added'] += len(relationships)
                
                stats['files_updated'] += 1
            
            logger.info(f"Project update complete: {stats}")
            return stats
            
        except Exception as e:
            logger.error(f"Failed to update project {project_id}: {e}")
            raise
    
    async def _delete_file_entities(
        self,
        project_id: str,
        file_path: str
    ) -> int:
        """Delete all entities from a specific file.
        
        Args:
            project_id: Project identifier
            file_path: File path
            
        Returns:
            Number of entities deleted
        """
        query = """
        MATCH (e {project_id: $project_id, file_path: $file_path})
        DETACH DELETE e
        RETURN count(e) AS deleted_count
        """
        
        try:
            result = await self.neo4j.execute_with_retry(
                query,
                {"project_id": project_id, "file_path": file_path}
            )
            
            deleted_count = result[0]["deleted_count"] if result else 0
            logger.debug(f"Deleted {deleted_count} entities from file {file_path}")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Failed to delete file entities: {e}")
            raise
    
    async def delete_project(
        self,
        project_id: str
    ) -> Dict[str, int]:
        """Delete all data for a project from Neo4j.
        
        Deletes all entities, relationships, and the project node.
        
        Args:
            project_id: Project identifier
            
        Returns:
            Dictionary with deletion statistics:
                - entities_deleted: Number of entities deleted
                - relationships_deleted: Number of relationships deleted
                
        Validates: Requirements 12.4
        """
        logger.info(f"Deleting project {project_id}")
        
        try:
            # Count entities before deletion
            count_query = """
            MATCH (e {project_id: $project_id})
            RETURN count(e) AS entity_count
            """
            
            count_result = await self.neo4j.execute_with_retry(
                count_query,
                {"project_id": project_id}
            )
            
            entity_count = count_result[0]["entity_count"] if count_result else 0
            
            # Delete all entities and relationships for this project
            delete_query = """
            MATCH (e {project_id: $project_id})
            DETACH DELETE e
            """
            
            await self.neo4j.execute_with_retry(
                delete_query,
                {"project_id": project_id}
            )
            
            # Delete project node
            delete_project_query = """
            MATCH (p:Project {id: $project_id})
            DELETE p
            """
            
            await self.neo4j.execute_with_retry(
                delete_project_query,
                {"project_id": project_id}
            )
            
            stats = {
                'entities_deleted': entity_count,
                'relationships_deleted': entity_count  # Approximate (DETACH DELETE removes relationships)
            }
            
            logger.info(f"Project {project_id} deleted: {stats}")
            return stats
            
        except Exception as e:
            logger.error(f"Failed to delete project {project_id}: {e}")
            raise
