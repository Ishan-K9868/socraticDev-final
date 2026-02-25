"""Unit tests for query service visualization helpers."""

from src.services.query_service import QueryService, GraphFilters


class _DummyGraphService:
    def __init__(self):
        self.neo4j = None


def test_apply_limits_truncates_nodes_and_edges():
    service = QueryService(graph_service=_DummyGraphService(), vector_service=object(), cache_service=object())
    filters = GraphFilters(max_nodes=2, max_edges=1)
    nodes = [
        {"id": "a", "type": "FILE", "label": "a"},
        {"id": "b", "type": "FILE", "label": "b"},
        {"id": "c", "type": "FILE", "label": "c"},
    ]
    edges = [
        {"id": "a-b", "source": "a", "target": "b", "type": "IMPORTS"},
        {"id": "b-c", "source": "b", "target": "c", "type": "IMPORTS"},
    ]

    limited_nodes, limited_edges, truncated = service._apply_limits(nodes, edges, filters)

    assert truncated is True
    assert len(limited_nodes) == 2
    assert len(limited_edges) <= 1
    node_ids = {n["id"] for n in limited_nodes}
    assert all(e["source"] in node_ids and e["target"] in node_ids for e in limited_edges)


def test_node_to_viz_format_external_module_type():
    service = QueryService(graph_service=_DummyGraphService(), vector_service=object(), cache_service=object())

    node = service._node_to_viz_format(
        {"id": "external:react", "name": "react"},
        ["ExternalModule"],
    )

    assert node["id"] == "external:react"
    assert node["type"] == "EXTERNAL_MODULE"
