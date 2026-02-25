"""Query Service for coordinating graph and vector operations.

This module provides a unified interface for querying the GraphRAG system,
coordinating operations across Graph Service and Vector Service.
"""

import logging
from typing import List, Dict, Optional, Any, Tuple
from dataclasses import dataclass, asdict

from ..models.base import CodeEntity, EntityType, RelationshipType
from ..config import settings
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
    stats: Dict[str, Any]
    coverage: Dict[str, int]


@dataclass
class GraphFilters:
    """Filters for graph visualization."""
    entity_types: Optional[List[EntityType]] = None
    languages: Optional[List[str]] = None
    file_patterns: Optional[List[str]] = None
    view_mode: str = settings.graph_view_mode_default
    include_external: bool = settings.graph_include_external_default
    include_isolated: bool = settings.graph_include_isolated_default
    max_nodes: int = 500
    max_edges: int = 2000


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
            if filters.view_mode == "symbol":
                nodes, edges = await self._get_symbol_graph(project_id, filters)
            else:
                nodes, edges = await self._get_file_graph(project_id, filters)

            raw_node_count = len(nodes)
            raw_edge_count = len(edges)
            nodes, edges, truncated = self._apply_limits(nodes, edges, filters)

            edge_type_counts: Dict[str, int] = {}
            for edge in edges:
                edge_type = edge.get("type", "UNKNOWN")
                edge_type_counts[edge_type] = edge_type_counts.get(edge_type, 0) + 1

            stats = {
                "total_nodes": len(nodes),
                "total_edges": len(edges),
                "files": sum(1 for n in nodes if n["type"] == "FILE"),
                "functions": sum(1 for n in nodes if n["type"] == "FUNCTION"),
                "classes": sum(1 for n in nodes if n["type"] == "CLASS"),
                "imports": sum(1 for n in nodes if n["type"] == "IMPORT"),
                "external_nodes": sum(1 for n in nodes if n["type"] == "EXTERNAL_MODULE"),
                "edge_types": edge_type_counts,
                "truncated": truncated,
                "raw_nodes": raw_node_count,
                "raw_edges": raw_edge_count,
            }

            coverage = await self._get_graph_coverage(project_id, len(nodes), len(edges), filters.include_external)

            viz_data = GraphVisualizationData(nodes=nodes, edges=edges, stats=stats, coverage=coverage)
            logger.info(
                "Graph visualization generated",
                extra={
                    "project_id": project_id,
                    "view_mode": filters.view_mode,
                    "nodes": len(nodes),
                    "edges": len(edges),
                    "truncated": truncated,
                },
            )
            return viz_data
        except Exception as e:
            logger.error(f"Failed to get graph visualization: {e}")
            raise

    async def _get_graph_coverage(
        self,
        project_id: str,
        entities_in_graph: int,
        relationships_in_graph: int,
        include_external: bool,
    ) -> Dict[str, int]:
        """Return project-level counts alongside current graph counts."""
        entities_query = """
        MATCH (n)
        WHERE n.project_id = $project_id
        RETURN count(n) AS count
        """
        relationships_query = """
        MATCH (s)-[r]->(t)
        WHERE s.project_id = $project_id
          AND (t.project_id = $project_id OR ($include_external AND t:ExternalModule))
        RETURN count(r) AS count
        """

        entity_result = await self.graph_service.neo4j.execute_with_retry(
            entities_query, {"project_id": project_id}
        )
        relationship_result = await self.graph_service.neo4j.execute_with_retry(
            relationships_query, {"project_id": project_id, "include_external": include_external}
        )

        return {
            "entities_in_project": int(entity_result[0]["count"]) if entity_result else 0,
            "entities_in_graph": entities_in_graph,
            "relationships_in_project": int(relationship_result[0]["count"]) if relationship_result else 0,
            "relationships_in_graph": relationships_in_graph,
        }

    async def _get_file_graph(
        self,
        project_id: str,
        filters: GraphFilters,
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """Build a file-centric dependency graph."""
        nodes_query = """
        MATCH (n:File)
        WHERE n.project_id = $project_id
        RETURN properties(n) AS node, labels(n) AS labels
        ORDER BY n.file_path, n.name
        """
        edges_query = """
        MATCH (s:File {project_id: $project_id})-[r:IMPORTS]->(t)
        WHERE (t:File AND t.project_id = $project_id)
           OR ($include_external AND t:ExternalModule)
        RETURN properties(s) AS source,
               labels(s) AS source_labels,
               type(r) AS rel_type,
               properties(t) AS target,
               labels(t) AS target_labels
        ORDER BY source.id, target.id
        """

        node_records = await self.graph_service.neo4j.execute_with_retry(
            nodes_query, {"project_id": project_id}
        )
        edge_records = await self.graph_service.neo4j.execute_with_retry(
            edges_query, {"project_id": project_id, "include_external": filters.include_external}
        )

        nodes: Dict[str, Dict[str, Any]] = {}
        edges: List[Dict[str, Any]] = []
        connected_ids = set()

        for record in node_records:
            node = self._node_to_viz_format(record["node"], record["labels"])
            nodes[node["id"]] = node

        for record in edge_records:
            source = self._node_to_viz_format(record["source"], record["source_labels"])
            target = self._node_to_viz_format(record["target"], record["target_labels"])
            if source["id"] not in nodes:
                nodes[source["id"]] = source
            if target["id"] not in nodes:
                nodes[target["id"]] = target

            connected_ids.add(source["id"])
            connected_ids.add(target["id"])
            edges.append(
                {
                    "id": f"{source['id']}-{target['id']}-{record['rel_type']}",
                    "source": source["id"],
                    "target": target["id"],
                    "type": record["rel_type"],
                    "label": record["rel_type"],
                }
            )

        final_nodes = list(nodes.values())
        if not filters.include_isolated:
            final_nodes = [node for node in final_nodes if node["id"] in connected_ids]

        final_nodes.sort(key=lambda n: (n.get("file_path", ""), n.get("label", ""), n.get("id", "")))
        return final_nodes, edges

    async def _get_symbol_graph(
        self,
        project_id: str,
        filters: GraphFilters,
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """Build a symbol-level graph with optional external modules."""
        node_conditions = ["n.project_id = $project_id"]
        edge_target_condition = "(t.project_id = $project_id OR ($include_external AND t:ExternalModule))"
        params: Dict[str, Any] = {"project_id": project_id, "include_external": filters.include_external}

        if filters.entity_types:
            label_map = {
                EntityType.FILE: "File",
                EntityType.FUNCTION: "Function",
                EntityType.CLASS: "Class",
                EntityType.VARIABLE: "Variable",
                EntityType.IMPORT: "Import",
            }
            labels = [label_map[entity_type] for entity_type in filters.entity_types if entity_type in label_map]
            if labels:
                node_conditions.append("ANY(label IN labels(n) WHERE label IN $entity_labels)")
                params["entity_labels"] = labels

        if filters.languages:
            node_conditions.append("n.language IN $languages")
            params["languages"] = filters.languages

        if filters.file_patterns:
            node_conditions.append("ANY(pattern IN $file_patterns WHERE n.file_path CONTAINS pattern)")
            params["file_patterns"] = filters.file_patterns

        nodes_query = f"""
        MATCH (n)
        WHERE {' AND '.join(node_conditions)}
        RETURN properties(n) AS node, labels(n) AS labels
        ORDER BY n.file_path, n.name
        """

        edges_query = f"""
        MATCH (s)-[r]->(t)
        WHERE s.project_id = $project_id AND {edge_target_condition}
        RETURN properties(s) AS source,
               labels(s) AS source_labels,
               type(r) AS rel_type,
               properties(t) AS target,
               labels(t) AS target_labels
        ORDER BY source.id, target.id, rel_type
        """

        node_records = await self.graph_service.neo4j.execute_with_retry(nodes_query, params)
        edge_records = await self.graph_service.neo4j.execute_with_retry(edges_query, params)

        nodes: Dict[str, Dict[str, Any]] = {}
        edges: List[Dict[str, Any]] = []
        connected_ids = set()

        for record in node_records:
            node = self._node_to_viz_format(record["node"], record["labels"])
            nodes[node["id"]] = node

        for record in edge_records:
            source = self._node_to_viz_format(record["source"], record["source_labels"])
            target = self._node_to_viz_format(record["target"], record["target_labels"])
            if source["id"] not in nodes:
                nodes[source["id"]] = source
            if target["id"] not in nodes:
                nodes[target["id"]] = target

            connected_ids.add(source["id"])
            connected_ids.add(target["id"])
            edges.append(
                {
                    "id": f"{source['id']}-{target['id']}-{record['rel_type']}",
                    "source": source["id"],
                    "target": target["id"],
                    "type": record["rel_type"],
                    "label": record["rel_type"],
                }
            )

        final_nodes = list(nodes.values())
        if not filters.include_isolated:
            final_nodes = [node for node in final_nodes if node["id"] in connected_ids]

        final_nodes.sort(key=lambda n: (n.get("type", ""), n.get("label", ""), n.get("id", "")))
        return final_nodes, edges

    def _apply_limits(
        self,
        nodes: List[Dict[str, Any]],
        edges: List[Dict[str, Any]],
        filters: GraphFilters,
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], bool]:
        """Apply deterministic node/edge limits and return truncation state."""
        truncated = False
        ordered_nodes = sorted(nodes, key=lambda n: (n.get("type", ""), n.get("label", ""), n.get("id", "")))
        ordered_edges = sorted(edges, key=lambda e: (e["source"], e["target"], e["type"]))

        if len(ordered_nodes) > filters.max_nodes:
            ordered_nodes = ordered_nodes[: filters.max_nodes]
            truncated = True

        node_ids = {node["id"] for node in ordered_nodes}
        ordered_edges = [edge for edge in ordered_edges if edge["source"] in node_ids and edge["target"] in node_ids]

        if len(ordered_edges) > filters.max_edges:
            ordered_edges = ordered_edges[: filters.max_edges]
            truncated = True

        return ordered_nodes, ordered_edges, truncated

    def _node_to_viz_format(self, node: Dict[str, Any], labels: List[str]) -> Dict[str, Any]:
        """Convert Neo4j node properties to visualization format."""
        entity_type = "FUNCTION"
        label_to_type = {
            "File": "FILE",
            "Function": "FUNCTION",
            "Class": "CLASS",
            "Variable": "VARIABLE",
            "Import": "IMPORT",
            "ExternalModule": "EXTERNAL_MODULE",
        }
        for label in labels:
            if label in label_to_type:
                entity_type = label_to_type[label]
                break

        return {
            "id": node.get("id", ""),
            "label": node.get("name", node.get("id", "")),
            "type": entity_type,
            "file_path": node.get("file_path", ""),
            "start_line": node.get("start_line"),
            "end_line": node.get("end_line"),
            "language": node.get("language"),
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
