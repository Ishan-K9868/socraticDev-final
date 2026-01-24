"""Context Retriever Service for hybrid search and context assembly.

This module provides functionality to retrieve relevant code context for AI prompts
using a hybrid search approach that combines semantic search (vector similarity) with
graph traversal (structural relationships).
"""

import logging
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass

from ..models.base import CodeEntity
from .vector_service import VectorService
from .graph_service import GraphService

logger = logging.getLogger(__name__)


@dataclass
class ScoredEntity:
    """Entity with relevance score."""
    entity: CodeEntity
    relevance_score: float
    semantic_score: float = 0.0
    graph_distance: Optional[int] = None
    source: str = "hybrid"  # "semantic", "graph", or "hybrid"


@dataclass
class ContextResult:
    """Result of context retrieval."""
    context: str
    entities: List[ScoredEntity]
    total_tokens: int
    token_budget: int
    entities_included: int
    entities_excluded: int


class ContextRetriever:
    """Service for retrieving relevant code context using hybrid search."""
    
    def __init__(
        self,
        vector_service: Optional[VectorService] = None,
        graph_service: Optional[GraphService] = None
    ):
        """Initialize the context retriever.
        
        Args:
            vector_service: Vector service for semantic search
            graph_service: Graph service for structural queries
        """
        self.vector_service = vector_service or VectorService()
        self.graph_service = graph_service or GraphService()
    
    def hybrid_search(
        self,
        query: str,
        project_id: str,
        max_results: int = 20
    ) -> List[ScoredEntity]:
        """Perform hybrid search combining semantic and graph-based search.
        
        Combines:
        1. Vector similarity search (semantic) - finds code similar in meaning
        2. Graph neighborhood search (structural) - finds related code through relationships
        
        Args:
            query: Search query string
            project_id: Project identifier
            max_results: Maximum number of results to return
            
        Returns:
            List of scored entities ranked by relevance
        """
        logger.info(f"Performing hybrid search for query: '{query}' in project: {project_id}")
        
        # Step 1: Semantic search using vector similarity
        semantic_results = self._semantic_search(query, project_id, max_results)
        logger.info(f"Semantic search returned {len(semantic_results)} results")
        
        # Step 2: Graph neighborhood search
        # For each semantic result, find related entities through graph relationships
        graph_results = self._graph_neighborhood_search(semantic_results, project_id, max_results)
        logger.info(f"Graph neighborhood search returned {len(graph_results)} results")
        
        # Step 3: Combine and rank results
        combined_results = self._combine_and_rank(semantic_results, graph_results)
        
        # Step 4: Limit to max_results
        combined_results = combined_results[:max_results]
        
        logger.info(f"Hybrid search returned {len(combined_results)} combined results")
        return combined_results
    
    def _semantic_search(
        self,
        query: str,
        project_id: str,
        max_results: int
    ) -> List[ScoredEntity]:
        """Perform semantic search using vector similarity.
        
        Args:
            query: Search query string
            project_id: Project identifier
            max_results: Maximum number of results
            
        Returns:
            List of scored entities from semantic search
        """
        try:
            # Perform semantic search
            search_results = self.vector_service.semantic_search(
                query=query,
                project_id=project_id,
                top_k=max_results
            )
            
            # Convert to ScoredEntity objects
            scored_entities = []
            for result in search_results:
                # Get entity from graph database using entity_id
                entity = self._get_entity_by_id(result['entity_id'], project_id)
                if entity:
                    scored_entity = ScoredEntity(
                        entity=entity,
                        relevance_score=result['similarity'],
                        semantic_score=result['similarity'],
                        graph_distance=None,
                        source="semantic"
                    )
                    scored_entities.append(scored_entity)
            
            return scored_entities
            
        except Exception as e:
            logger.error(f"Semantic search failed: {e}")
            return []
    
    def _graph_neighborhood_search(
        self,
        semantic_results: List[ScoredEntity],
        project_id: str,
        max_results: int
    ) -> List[ScoredEntity]:
        """Find related entities through graph relationships.
        
        For each semantic result, traverse the graph to find:
        - Functions that call or are called by the result
        - Classes that the result belongs to or extends
        - Imports and dependencies
        
        Args:
            semantic_results: Results from semantic search
            project_id: Project identifier
            max_results: Maximum number of results
            
        Returns:
            List of scored entities from graph traversal
        """
        graph_entities = []
        seen_entity_ids = set()
        
        # Track entities from semantic search to avoid duplicates
        for result in semantic_results:
            entity_id = self._get_entity_id(result.entity)
            seen_entity_ids.add(entity_id)
        
        try:
            # For each semantic result, find related entities
            for result in semantic_results:
                entity_id = self._get_entity_id(result.entity)
                
                # Find callers (distance 1)
                callers = self.graph_service.find_callers(entity_id, project_id)
                for caller in callers:
                    caller_id = self._get_entity_id(caller)
                    if caller_id not in seen_entity_ids:
                        scored_entity = ScoredEntity(
                            entity=caller,
                            relevance_score=0.0,  # Will be calculated in combine_and_rank
                            semantic_score=0.0,
                            graph_distance=1,
                            source="graph"
                        )
                        graph_entities.append(scored_entity)
                        seen_entity_ids.add(caller_id)
                
                # Find dependencies (distance 1)
                dependencies = self.graph_service.find_dependencies(entity_id, project_id)
                for dep in dependencies:
                    dep_id = self._get_entity_id(dep)
                    if dep_id not in seen_entity_ids:
                        scored_entity = ScoredEntity(
                            entity=dep,
                            relevance_score=0.0,  # Will be calculated in combine_and_rank
                            semantic_score=0.0,
                            graph_distance=1,
                            source="graph"
                        )
                        graph_entities.append(scored_entity)
                        seen_entity_ids.add(dep_id)
                
                # Limit graph results to avoid explosion
                if len(graph_entities) >= max_results:
                    break
            
            return graph_entities[:max_results]
            
        except Exception as e:
            logger.error(f"Graph neighborhood search failed: {e}")
            return []
    
    def _combine_and_rank(
        self,
        semantic_results: List[ScoredEntity],
        graph_results: List[ScoredEntity]
    ) -> List[ScoredEntity]:
        """Combine semantic and graph results and rank by relevance.
        
        Ranking formula:
        - For semantic-only results: relevance = 0.7 * semantic_score
        - For graph-only results: relevance = 0.3 * (1 / graph_distance)
        - For hybrid results: relevance = 0.7 * semantic_score + 0.3 * (1 / graph_distance)
        
        Args:
            semantic_results: Results from semantic search
            graph_results: Results from graph search
            
        Returns:
            Combined and ranked list of scored entities
        """
        # Calculate relevance scores for semantic results
        for result in semantic_results:
            result.relevance_score = 0.7 * result.semantic_score
        
        # Calculate relevance scores for graph results
        for result in graph_results:
            if result.graph_distance and result.graph_distance > 0:
                result.relevance_score = 0.3 * (1.0 / result.graph_distance)
            else:
                result.relevance_score = 0.3
        
        # Combine all results
        all_results = semantic_results + graph_results
        
        # Sort by relevance score (descending)
        all_results.sort(key=lambda x: x.relevance_score, reverse=True)
        
        return all_results
    
    def _get_entity_by_id(self, entity_id: str, project_id: str) -> Optional[CodeEntity]:
        """Get entity from graph database by ID.
        
        Args:
            entity_id: Entity identifier
            project_id: Project identifier
            
        Returns:
            CodeEntity if found, None otherwise
        """
        try:
            # Query Neo4j for the entity
            query = """
            MATCH (e:Entity {id: $entity_id, project_id: $project_id})
            RETURN e
            """
            
            with self.graph_service.driver.session() as session:
                result = session.run(query, entity_id=entity_id, project_id=project_id)
                record = result.single()
                
                if record:
                    node = record['e']
                    # Convert Neo4j node to CodeEntity
                    entity = self.graph_service._node_to_entity(node)
                    return entity
                
                return None
                
        except Exception as e:
            logger.error(f"Failed to get entity by ID: {e}")
            return None
    
    def _get_entity_id(self, entity: CodeEntity) -> str:
        """Get unique identifier for an entity.
        
        Args:
            entity: Code entity
            
        Returns:
            Unique identifier string
        """
        return f"{entity.file_path}:{entity.name}"


def get_context_retriever() -> ContextRetriever:
    """Get a context retriever instance.
    
    Returns:
        ContextRetriever instance
    """
    return ContextRetriever()

    def rank_entities(
        self,
        semantic_results: List[Dict],
        graph_results: List[CodeEntity],
        graph_distances: Dict[str, int]
    ) -> List[ScoredEntity]:
        """Rank entities by combining similarity score and graph distance.
        
        Ranking formula:
        relevance_score = 0.7 * similarity + 0.3 * (1 / graph_distance)
        
        Args:
            semantic_results: Results from semantic search with similarity scores
            graph_results: Results from graph traversal
            graph_distances: Mapping of entity IDs to graph distances
            
        Returns:
            List of scored entities sorted by relevance (descending)
        """
        scored_entities = []
        
        # Process semantic results
        for result in semantic_results:
            entity_id = result['entity_id']
            similarity = result['similarity']
            
            # Get entity from graph
            entity = self._get_entity_by_id(entity_id, result.get('project_id', ''))
            if not entity:
                continue
            
            # Calculate relevance score
            graph_distance = graph_distances.get(entity_id)
            if graph_distance:
                relevance = 0.7 * similarity + 0.3 * (1.0 / graph_distance)
            else:
                relevance = 0.7 * similarity
            
            scored_entity = ScoredEntity(
                entity=entity,
                relevance_score=relevance,
                semantic_score=similarity,
                graph_distance=graph_distance,
                source="hybrid" if graph_distance else "semantic"
            )
            scored_entities.append(scored_entity)
        
        # Process graph-only results (not in semantic results)
        semantic_entity_ids = {r['entity_id'] for r in semantic_results}
        for entity in graph_results:
            entity_id = self._get_entity_id(entity)
            if entity_id not in semantic_entity_ids:
                graph_distance = graph_distances.get(entity_id, 1)
                relevance = 0.3 * (1.0 / graph_distance)
                
                scored_entity = ScoredEntity(
                    entity=entity,
                    relevance_score=relevance,
                    semantic_score=0.0,
                    graph_distance=graph_distance,
                    source="graph"
                )
                scored_entities.append(scored_entity)
        
        # Sort by relevance score (descending)
        scored_entities.sort(key=lambda x: x.relevance_score, reverse=True)
        
        return scored_entities
    
    def retrieve_context(
        self,
        query: str,
        project_id: str,
        token_budget: int = 8000,
        manual_entity_ids: Optional[List[str]] = None
    ) -> ContextResult:
        """Retrieve relevant code context for AI prompts.
        
        Performs hybrid search and assembles context within token budget.
        
        Args:
            query: Search query string
            project_id: Project identifier
            token_budget: Maximum tokens allowed in context (default: 8000)
            manual_entity_ids: Optional list of manually selected entity IDs
            
        Returns:
            ContextResult with assembled context and metadata
        """
        logger.info(f"Retrieving context for query: '{query}' with budget: {token_budget}")
        
        # If manual entities are specified, use them
        if manual_entity_ids:
            entities = self._get_manual_entities(manual_entity_ids, project_id)
        else:
            # Perform hybrid search
            entities = self.hybrid_search(query, project_id)
        
        # Assemble context within token budget
        context, included_entities, total_tokens = self.assemble_context(
            entities, token_budget
        )
        
        result = ContextResult(
            context=context,
            entities=entities,
            total_tokens=total_tokens,
            token_budget=token_budget,
            entities_included=len(included_entities),
            entities_excluded=len(entities) - len(included_entities)
        )
        
        logger.info(
            f"Context assembled: {result.entities_included} entities included, "
            f"{result.entities_excluded} excluded, {result.total_tokens}/{result.token_budget} tokens"
        )
        
        return result
    
    def assemble_context(
        self,
        entities: List[ScoredEntity],
        token_budget: int
    ) -> Tuple[str, List[ScoredEntity], int]:
        """Assemble context string from entities within token budget.
        
        Includes source citations for each entity:
        [File: {path}, Lines: {start}-{end}]
        
        Args:
            entities: List of scored entities (should be sorted by relevance)
            token_budget: Maximum tokens allowed
            
        Returns:
            Tuple of (context_string, included_entities, total_tokens)
        """
        context_parts = ["Relevant code from your project:\n"]
        included_entities = []
        total_tokens = self._count_tokens(context_parts[0])
        
        for entity in entities:
            # Format entity with citation
            entity_text = self._format_entity_with_citation(entity.entity)
            entity_tokens = self._count_tokens(entity_text)
            
            # Check if adding this entity would exceed budget
            if total_tokens + entity_tokens > token_budget:
                logger.debug(
                    f"Stopping context assembly: would exceed budget "
                    f"({total_tokens + entity_tokens} > {token_budget})"
                )
                break
            
            # Add entity to context
            context_parts.append(entity_text)
            included_entities.append(entity)
            total_tokens += entity_tokens
        
        context = "\n\n".join(context_parts)
        return context, included_entities, total_tokens
    
    def _format_entity_with_citation(self, entity: CodeEntity) -> str:
        """Format entity with source citation.
        
        Format:
        [File: {path}, Lines: {start}-{end}]
        {code}
        
        Args:
            entity: Code entity to format
            
        Returns:
            Formatted string with citation
        """
        citation = f"[File: {entity.file_path}, Lines: {entity.start_line}-{entity.end_line}]"
        
        # Include signature if available
        if entity.signature:
            code = entity.signature
        elif entity.body:
            code = entity.body
        else:
            code = f"{entity.entity_type.value}: {entity.name}"
        
        # Include docstring if available
        if entity.docstring:
            formatted = f"{citation}\n{code}\n\"\"\"{entity.docstring}\"\"\""
        else:
            formatted = f"{citation}\n{code}"
        
        return formatted
    
    def _count_tokens(self, text: str) -> int:
        """Count tokens in text.
        
        Uses a simple approximation: 1 token ≈ 4 characters.
        For production, should use tiktoken or similar.
        
        Args:
            text: Text to count tokens for
            
        Returns:
            Approximate token count
        """
        # Simple approximation: 1 token ≈ 4 characters
        # This is a rough estimate; for production use tiktoken
        return len(text) // 4
    
    def _get_manual_entities(
        self,
        entity_ids: List[str],
        project_id: str
    ) -> List[ScoredEntity]:
        """Get manually selected entities.
        
        Args:
            entity_ids: List of entity identifiers
            project_id: Project identifier
            
        Returns:
            List of scored entities (all with same relevance score)
        """
        entities = []
        
        for entity_id in entity_ids:
            entity = self._get_entity_by_id(entity_id, project_id)
            if entity:
                scored_entity = ScoredEntity(
                    entity=entity,
                    relevance_score=1.0,  # Manual selections have max relevance
                    semantic_score=0.0,
                    graph_distance=None,
                    source="manual"
                )
                entities.append(scored_entity)
        
        return entities
    
    def validate_manual_context(
        self,
        entity_ids: List[str],
        project_id: str,
        token_budget: int
    ) -> Dict[str, any]:
        """Validate that manual context selection fits within token budget.
        
        Args:
            entity_ids: List of manually selected entity IDs
            project_id: Project identifier
            token_budget: Maximum tokens allowed
            
        Returns:
            Dictionary with validation results:
            - valid: bool
            - total_tokens: int
            - token_budget: int
            - entities_count: int
            - message: str
        """
        entities = self._get_manual_entities(entity_ids, project_id)
        _, _, total_tokens = self.assemble_context(entities, token_budget * 2)  # Allow counting beyond budget
        
        valid = total_tokens <= token_budget
        
        return {
            'valid': valid,
            'total_tokens': total_tokens,
            'token_budget': token_budget,
            'entities_count': len(entities),
            'message': (
                'Context is within budget' if valid
                else f'Context exceeds budget by {total_tokens - token_budget} tokens'
            )
        }
