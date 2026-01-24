"""Query Service for coordinating graph and vector operations.

This module provides a unified interface for querying the GraphRAG system,
coordinating operations across Graph Service and Vector Service.
"""

import logging
from typing import List, Dict, Optional, Any
from dataclasses import dataclass, asdict

from ..models.base import CodeEntity, EntityType, RelationshipType
from .graph_service import GraphService
from .vector_service import VectorService
from .cache_service import CacheService

logger = logging.getLogger(__name__)


@dataclass
class QueryResult:
    """Result of a query operation."""
    entities: List[CodeEntity]
    count: int
    query_time_ms: float
    metadata: Dict[str, Any]


@dataclass
class ImpactResult:
    """Result of impact analysis."""
    target_entity: CodeEntity
    affected_entities: List[CodeEntity]
    dependency_tree: Dict[str, Any]
    max_depth: int
    total_affected: int
    has_cycles: bool
    cycle_paths: List[List[str]]


@dataclass
class SearchResult:
    """Result of semantic search."""
    entity: CodeEntity
    similarity: float
    file_path: str
    snippet: str


@dataclass
class GraphVisualizationData:
    """Data for graph visualization."""
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    stats: Dict[str, int]


@dataclass
class GraphFilters:
    """Filters for graph visualization."""
    entity_types: Optional[List[EntityType]] = None
    languages: Optional[List[str]] = None
    file_patterns: Optional[List[str]] = None
    max_nodes: int = 500


class QueryService:
    """Service for coordinating query operations across graph and vector services."""
    
    def __init__(
        self,
        graph_service: Optional[GraphService] = None,
        vector_service: Optional[VectorService] = None,
        cache_service: Optional[CacheService] = None
    ):
        """Initialize the query service.
        
        Args:
            graph_service: Graph service for structural queries
            vector_service: Vector service for semantic search
            cache_service: Cache service for result caching
        """
        if graph_service is None:
            from .neo4j_manager import get_neo4j_manager
            neo4j_manager = get_neo4j_manager()
            graph_service = GraphService(neo4j_manager)
        
        self.graph_service = graph_service
        self.vector_service = vector_service or VectorService()
        self.cache_service = cache_service or CacheService()
    
    async def find_callers(
        self,
        function_id: str,
        project_id: str,
        use_cache: bool = True
    ) -> QueryResult:
        """Find all functions that call the specified function.
        
        Args:
            function_id: Function identifier (file_path:function_name)
            project_id: Project identifier
            use_cache: Whether to use cache (default: True)
            
        Returns:
            QueryResult with calling functions
        """
        import time
        start_time = time.time()
        
        logger.info(f"Finding callers for function: {function_id} in project: {project_id}")
        
        # Check cache first
        if use_cache:
            cache_key = self.cache_service.build_callers_key(function_id, project_id)
            cached_result = self.cache_service.get(cache_key)
            if cached_result:
                logger.info(f"Returning cached result for find_callers")
                return QueryResult(**cached_result)
        
        try:
            # Use graph service to find callers
            callers = await self.graph_service.find_callers(function_id, project_id)
            
            query_time_ms = (time.time() - start_time) * 1000
            
            result = QueryResult(
                entities=callers,
                count=len(callers),
                query_time_ms=query_time_ms,
                metadata={
                    'function_id': function_id,
                    'project_id': project_id,
                    'query_type': 'find_callers'
                }
            )
            
            # Cache the result
            if use_cache:
                cache_key = self.cache_service.build_callers_key(function_id, project_id)
                self.cache_service.set(cache_key, asdict(result))
            
            logger.info(f"Found {len(callers)} callers in {query_time_ms:.2f}ms")
            return result
            
        except Exception as e:
            logger.error(f"Failed to find callers: {e}")
            raise
    
    async def find_dependencies(
        self,
        function_id: str,
        project_id: str,
        use_cache: bool = True
    ) -> QueryResult:
        """Find all dependencies of the specified function.
        
        Args:
            function_id: Function identifier (file_path:function_name)
            project_id: Project identifier
            use_cache: Whether to use cache (default: True)
            
        Returns:
            QueryResult with dependencies
        """
        import time
        start_time = time.time()
        
        logger.info(f"Finding dependencies for function: {function_id} in project: {project_id}")
        
        # Check cache first
        if use_cache:
            cache_key = self.cache_service.build_dependencies_key(function_id, project_id)
            cached_result = self.cache_service.get(cache_key)
            if cached_result:
                logger.info(f"Returning cached result for find_dependencies")
                return QueryResult(**cached_result)
        
        try:
            # Use graph service to find dependencies
            dependencies = await self.graph_service.find_dependencies(function_id, project_id)
            
            query_time_ms = (time.time() - start_time) * 1000
            
            result = QueryResult(
                entities=dependencies,
                count=len(dependencies),
                query_time_ms=query_time_ms,
                metadata={
                    'function_id': function_id,
                    'project_id': project_id,
                    'query_type': 'find_dependencies'
                }
            )
            
            # Cache the result
            if use_cache:
                cache_key = self.cache_service.build_dependencies_key(function_id, project_id)
                self.cache_service.set(cache_key, asdict(result))
            
            logger.info(f"Found {len(dependencies)} dependencies in {query_time_ms:.2f}ms")
            return result
            
        except Exception as e:
            logger.error(f"Failed to find dependencies: {e}")
            raise
    
    async def impact_analysis(
        self,
        function_id: str,
        project_id: str,
        max_depth: int = 5,
        use_cache: bool = True
    ) -> ImpactResult:
        """Perform impact analysis to find all affected entities.
        
        Args:
            function_id: Function identifier (file_path:function_name)
            project_id: Project identifier
            max_depth: Maximum traversal depth (default: 5)
            use_cache: Whether to use cache (default: True)
            
        Returns:
            ImpactResult with affected entities and dependency tree
        """
        logger.info(f"Performing impact analysis for function: {function_id} in project: {project_id}")
        
        # Check cache first
        if use_cache:
            cache_key = self.cache_service.build_impact_key(function_id, project_id)
            cached_result = self.cache_service.get(cache_key)
            if cached_result:
                logger.info(f"Returning cached result for impact_analysis")
                return ImpactResult(**cached_result)
        
        try:
            # Use graph service for impact analysis
            impact_tree = await self.graph_service.impact_analysis(
                function_id=function_id,
                project_id=project_id,
                max_depth=max_depth
            )
            
            # Extract entities from dependency nodes
            affected_entities = [dep.entity for dep in impact_tree.dependencies]
            
            result = ImpactResult(
                target_entity=impact_tree.root,
                affected_entities=affected_entities,
                dependency_tree={},  # TODO: Build tree structure
                max_depth=impact_tree.max_depth,
                total_affected=len(affected_entities),
                has_cycles=len(impact_tree.circular_dependencies) > 0,
                cycle_paths=impact_tree.circular_dependencies
            )
            
            # Cache the result
            if use_cache:
                cache_key = self.cache_service.build_impact_key(function_id, project_id)
                self.cache_service.set(cache_key, asdict(result))
            
            logger.info(
                f"Impact analysis complete: {result.total_affected} affected entities, "
                f"cycles: {result.has_cycles}"
            )
            return result
            
        except Exception as e:
            logger.error(f"Failed to perform impact analysis: {e}")
            raise
    
    async def semantic_search(
        self,
        query: str,
        project_ids: List[str],
        top_k: int = 20,
        use_cache: bool = True
    ) -> List[SearchResult]:
        """Perform semantic code search across projects.
        
        Args:
            query: Search query string
            project_ids: List of project identifiers to search
            top_k: Maximum number of results to return
            use_cache: Whether to use cache (default: True)
            
        Returns:
            List of search results with similarity scores
        """
        logger.info(f"Performing semantic search for query: '{query}' across {len(project_ids)} projects")
        
        # Check cache first
        if use_cache:
            cache_key = self.cache_service.build_search_key(query, project_ids)
            cached_result = self.cache_service.get(cache_key)
            if cached_result:
                logger.info(f"Returning cached result for semantic_search")
                return [SearchResult(**r) for r in cached_result]
        
        try:
            all_results = []
            
            # Search each project
            for project_id in project_ids:
                # Use vector service for semantic search
                vector_results = self.vector_service.semantic_search(
                    query=query,
                    project_id=project_id,
                    top_k=top_k
                )
                
                # Convert to SearchResult objects
                for result in vector_results:
                    entity = await self._get_entity_by_id(result['entity_id'], project_id)
                    if entity:
                        # Create snippet from entity body or signature
                        snippet = self._create_snippet(entity)
                        
                        search_result = SearchResult(
                            entity=entity,
                            similarity=result['similarity'],
                            file_path=entity.file_path,
                            snippet=snippet
                        )
                        all_results.append(search_result)
            
            # Sort by similarity (descending) and limit to top_k
            all_results.sort(key=lambda x: x.similarity, reverse=True)
            all_results = all_results[:top_k]
            
            # Cache the result
            if use_cache:
                cache_key = self.cache_service.build_search_key(query, project_ids)
                self.cache_service.set(cache_key, [asdict(r) for r in all_results])
            
            logger.info(f"Semantic search returned {len(all_results)} results")
            return all_results
            
        except Exception as e:
            logger.error(f"Failed to perform semantic search: {e}")
            raise
    
    async def get_graph_visualization(
        self,
        project_id: str,
        filters: Optional[GraphFilters] = None
    ) -> GraphVisualizationData:
        """Get graph data formatted for visualization.
        
        Args:
            project_id: Project identifier
            filters: Optional filters for nodes and edges
            
        Returns:
            GraphVisualizationData with nodes and edges
        """
        logger.info(f"Getting graph visualization for project: {project_id}")
        
        if filters is None:
            filters = GraphFilters()
        
        try:
            # Build Cypher query with filters
            query = self._build_visualization_query(project_id, filters)
            
            # Execute query using the graph service's neo4j manager
            result = await self.graph_service.neo4j.execute_with_retry(query)
            
            nodes = []
            edges = []
            node_ids = set()
            
            for record in result:
                # Extract nodes
                if 'source' in record:
                    source_node = record['source']
                    source_labels = record.get('source_labels', [])
                    source_id = source_node['id']
                    
                    if source_id not in node_ids:
                        nodes.append(self._node_to_viz_format(source_node, source_labels))
                        node_ids.add(source_id)
                
                if 'target' in record:
                    target_node = record['target']
                    target_labels = record.get('target_labels', [])
                    target_id = target_node['id']
                    
                    if target_id not in node_ids:
                        nodes.append(self._node_to_viz_format(target_node, target_labels))
                        node_ids.add(target_id)
                
                # Extract edges
                if 'relationship' in record:
                    rel = record['relationship']
                    edges.append({
                        'id': f"{source_id}-{target_id}",
                        'source': source_id,
                        'target': target_id,
                        'type': rel['type'],
                        'label': rel['type']
                    })
            
            # Limit nodes if necessary
            if len(nodes) > filters.max_nodes:
                logger.warning(
                    f"Graph has {len(nodes)} nodes, limiting to {filters.max_nodes}"
                )
                nodes = nodes[:filters.max_nodes]
                # Filter edges to only include edges between included nodes
                included_node_ids = {n['id'] for n in nodes}
                edges = [
                    e for e in edges
                    if e['source'] in included_node_ids and e['target'] in included_node_ids
                ]
            
            # Calculate stats
            stats = {
                'total_nodes': len(nodes),
                'total_edges': len(edges),
                'functions': sum(1 for n in nodes if n['type'] == 'FUNCTION'),
                'classes': sum(1 for n in nodes if n['type'] == 'CLASS'),
                'files': len(set(n['file_path'] for n in nodes))
            }
            
            viz_data = GraphVisualizationData(
                nodes=nodes,
                edges=edges,
                stats=stats
            )
            
            logger.info(
                f"Graph visualization: {stats['total_nodes']} nodes, "
                f"{stats['total_edges']} edges"
            )
            return viz_data
            
        except Exception as e:
            logger.error(f"Failed to get graph visualization: {e}")
            raise
    
    def _build_visualization_query(
        self,
        project_id: str,
        filters: GraphFilters
    ) -> str:
        """Build Cypher query for graph visualization with filters.
        
        Args:
            project_id: Project identifier
            filters: Filters to apply
            
        Returns:
            Cypher query string
        """
        # Base query - match entities and their relationships
        query = f"""
        MATCH (source)-[relationship]->(target)
        WHERE source.project_id = '{project_id}' AND target.project_id = '{project_id}'
        """
        
        # Add filters
        where_clauses = []
        
        if filters.entity_types:
            # Use labels instead of entity_type property
            label_conditions = []
            for entity_type in filters.entity_types:
                if entity_type == EntityType.FILE:
                    label_conditions.append("source:File OR target:File")
                elif entity_type == EntityType.FUNCTION:
                    label_conditions.append("source:Function OR target:Function")
                elif entity_type == EntityType.CLASS:
                    label_conditions.append("source:Class OR target:Class")
                elif entity_type == EntityType.VARIABLE:
                    label_conditions.append("source:Variable OR target:Variable")
                elif entity_type == EntityType.IMPORT:
                    label_conditions.append("source:Import OR target:Import")
            
            if label_conditions:
                where_clauses.append(f"({' OR '.join(label_conditions)})")
        
        if filters.languages:
            langs_str = ', '.join(f"'{lang}'" for lang in filters.languages)
            where_clauses.append(f"source.language IN [{langs_str}]")
        
        if filters.file_patterns:
            # Simple pattern matching (contains)
            pattern_clauses = []
            for pattern in filters.file_patterns:
                pattern_clauses.append(f"source.file_path CONTAINS '{pattern}'")
            where_clauses.append(f"({' OR '.join(pattern_clauses)})")
        
        if where_clauses:
            query += " AND " + " AND ".join(where_clauses)
        
        # Return nodes and relationship data as maps, including labels
        query += f"""
        RETURN properties(source) AS source, 
               labels(source) AS source_labels,
               {{type: type(relationship)}} AS relationship, 
               properties(target) AS target,
               labels(target) AS target_labels
        LIMIT {filters.max_nodes * 2}
        """
        
        return query
    
    def _node_to_viz_format(self, node: Dict[str, Any], labels: List[str]) -> Dict[str, Any]:
        """Convert Neo4j node to visualization format.
        
        Args:
            node: Neo4j node properties as dictionary
            labels: Node labels from Neo4j
            
        Returns:
            Dictionary with node data for visualization
        """
        # Determine entity type from labels
        entity_type = 'FUNCTION'  # default
        for label in labels:
            if label in ['File', 'Function', 'Class', 'Variable', 'Import', 'ExternalModule']:
                entity_type = label.upper()
                break
        
        return {
            'id': node.get('id', ''),
            'label': node.get('name', ''),
            'type': entity_type,
            'file_path': node.get('file_path', ''),
            'start_line': node.get('start_line'),
            'end_line': node.get('end_line'),
            'language': node.get('language')
        }
    
    async def _get_entity_by_id(
        self,
        entity_id: str,
        project_id: str
    ) -> Optional[CodeEntity]:
        """Get entity from graph database by ID.
        
        Args:
            entity_id: Entity identifier
            project_id: Project identifier
            
        Returns:
            CodeEntity if found, None otherwise
        """
        try:
            query = """
            MATCH (e {id: $entity_id, project_id: $project_id})
            RETURN e
            """
            
            result = await self.graph_service.neo4j.execute_with_retry(
                query, 
                {"entity_id": entity_id, "project_id": project_id}
            )
            
            if result and len(result) > 0:
                node = result[0]['e']
                entity = self.graph_service._node_to_entity(node)
                return entity
            
            return None
                
        except Exception as e:
            logger.error(f"Failed to get entity by ID: {e}")
            return None
    
    def _create_snippet(self, entity: CodeEntity, max_length: int = 200) -> str:
        """Create a code snippet from entity.
        
        Args:
            entity: Code entity
            max_length: Maximum snippet length
            
        Returns:
            Code snippet string
        """
        if entity.signature:
            snippet = entity.signature
        elif entity.body:
            snippet = entity.body
        else:
            snippet = f"{entity.entity_type.value}: {entity.name}"
        
        # Truncate if too long
        if len(snippet) > max_length:
            snippet = snippet[:max_length] + "..."
        
        return snippet


def get_query_service() -> QueryService:
    """Get a query service instance.
    
    Returns:
        QueryService instance
    """
    return QueryService()
