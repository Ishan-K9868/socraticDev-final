import { useState, useCallback, useEffect, useRef } from 'react';
import DependencyGraph, { GraphNode, GraphEdge } from './DependencyGraph';
import { useStore } from '../../store/useStore';
import { graphragAPI } from '../../services';
import Badge from '../../ui/Badge';
import Button from '../../ui/Button';

const SAMPLE_NODES: GraphNode[] = [
    { id: 'main', label: 'main.py', type: 'file', x: 0, y: 0, dependencies: ['utils', 'api', 'models'], dependents: [], metadata: { lines: 156, language: 'python' } },
    { id: 'utils', label: 'utils.py', type: 'file', x: 0, y: 0, dependencies: [], dependents: ['main', 'api'], metadata: { lines: 89, language: 'python' } },
    { id: 'api', label: 'api.py', type: 'file', x: 0, y: 0, dependencies: ['utils', 'models'], dependents: ['main'], metadata: { lines: 234, language: 'python' } },
    { id: 'models', label: 'models.py', type: 'file', x: 0, y: 0, dependencies: [], dependents: ['main', 'api'], metadata: { lines: 178, language: 'python' } },
    { id: 'config', label: 'config.py', type: 'file', x: 0, y: 0, dependencies: [], dependents: ['main', 'api', 'utils'], metadata: { lines: 45, language: 'python' } },
];

const SAMPLE_EDGES: GraphEdge[] = [
    { source: 'main', target: 'utils', type: 'imports' },
    { source: 'main', target: 'api', type: 'imports' },
    { source: 'main', target: 'models', type: 'imports' },
    { source: 'api', target: 'utils', type: 'imports' },
    { source: 'api', target: 'models', type: 'imports' },
    { source: 'main', target: 'config', type: 'imports' },
    { source: 'api', target: 'config', type: 'imports' },
];

interface GraphPanelProps {
    projectName?: string;
}

type GraphStats = {
    total_nodes: number;
    total_edges: number;
    files: number;
    functions: number;
    classes: number;
    imports: number;
    external_nodes: number;
    truncated: boolean;
    edge_types?: Record<string, number>;
};

type GraphCoverage = {
    entities_in_project: number;
    entities_in_graph: number;
    relationships_in_project: number;
    relationships_in_graph: number;
};

type ApiNode = {
    id: string;
    label: string;
    type: string;
    file_path?: string;
};

type ApiEdge = {
    source: string;
    target: string;
    type: string;
};

const normalizeType = (type: string): string => type.toUpperCase();

const isFileNode = (node: ApiNode): boolean => normalizeType(node.type) === 'FILE';

const isExternalNode = (node: ApiNode): boolean => (
    normalizeType(node.type) === 'EXTERNAL_MODULE' || node.id.startsWith('external:')
);

function projectGraphView(
    nodes: ApiNode[],
    edges: ApiEdge[],
    viewMode: 'file' | 'symbol',
    includeExternal: boolean,
    includeIsolated: boolean
): { nodes: ApiNode[]; edges: ApiEdge[] } {
    const nodeById = new Map(nodes.map(node => [node.id, node]));
    const upperEdges = edges.map(edge => ({ ...edge, type: normalizeType(edge.type) }));

    if (viewMode === 'file') {
        let projectedEdges = upperEdges.filter(edge => {
            if (edge.type !== 'IMPORTS') return false;
            const source = nodeById.get(edge.source);
            const target = nodeById.get(edge.target);
            if (!source || !target || !isFileNode(source)) return false;
            if (isFileNode(target)) return true;
            return includeExternal && isExternalNode(target);
        });

        const connectedIds = new Set<string>();
        projectedEdges.forEach(edge => {
            connectedIds.add(edge.source);
            connectedIds.add(edge.target);
        });

        let projectedNodes = nodes.filter(node => {
            if (isFileNode(node)) return true;
            return includeExternal && isExternalNode(node);
        });

        if (!includeIsolated) {
            projectedNodes = projectedNodes.filter(node => connectedIds.has(node.id));
        }

        const keepIds = new Set(projectedNodes.map(node => node.id));
        projectedEdges = projectedEdges.filter(edge => keepIds.has(edge.source) && keepIds.has(edge.target));

        return { nodes: projectedNodes, edges: projectedEdges };
    }

    let projectedNodes = includeExternal ? nodes : nodes.filter(node => !isExternalNode(node));
    const keepIds = new Set(projectedNodes.map(node => node.id));
    let projectedEdges = upperEdges.filter(edge => keepIds.has(edge.source) && keepIds.has(edge.target));

    if (!includeIsolated) {
        const connectedIds = new Set<string>();
        projectedEdges.forEach(edge => {
            connectedIds.add(edge.source);
            connectedIds.add(edge.target);
        });
        projectedNodes = projectedNodes.filter(node => connectedIds.has(node.id));
        const connectedKeepIds = new Set(projectedNodes.map(node => node.id));
        projectedEdges = projectedEdges.filter(
            edge => connectedKeepIds.has(edge.source) && connectedKeepIds.has(edge.target)
        );
    }

    return { nodes: projectedNodes, edges: projectedEdges };
}

function buildGraphStats(nodes: ApiNode[], edges: ApiEdge[]): GraphStats {
    const edgeTypes: Record<string, number> = {};
    edges.forEach(edge => {
        const type = normalizeType(edge.type);
        edgeTypes[type] = (edgeTypes[type] || 0) + 1;
    });

    return {
        total_nodes: nodes.length,
        total_edges: edges.length,
        files: nodes.filter(node => normalizeType(node.type) === 'FILE').length,
        functions: nodes.filter(node => normalizeType(node.type) === 'FUNCTION').length,
        classes: nodes.filter(node => normalizeType(node.type) === 'CLASS').length,
        imports: nodes.filter(node => normalizeType(node.type) === 'IMPORT').length,
        external_nodes: nodes.filter(node => isExternalNode(node)).length,
        truncated: false,
        edge_types: edgeTypes,
    };
}

function GraphPanel({ projectName }: GraphPanelProps) {
    const { projectContext } = useStore();
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [impactedNodes, setImpactedNodes] = useState<string[]>([]);
    const [realNodes, setRealNodes] = useState<GraphNode[]>([]);
    const [realEdges, setRealEdges] = useState<GraphEdge[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'file' | 'symbol'>('file');
    const [includeExternal, setIncludeExternal] = useState(true);
    const [includeIsolated, setIncludeIsolated] = useState(true);
    const [stats, setStats] = useState<GraphStats | null>(null);
    const [coverage, setCoverage] = useState<GraphCoverage | null>(null);
    const selectedNodeIdRef = useRef<string | null>(null);

    const calculateImpactForNodes = useCallback((node: GraphNode, graphNodes: GraphNode[]) => {
        const impacted = new Set<string>();
        const queue = [node.id];

        while (queue.length > 0) {
            const currentId = queue.shift()!;
            const currentNode = graphNodes.find(n => n.id === currentId);
            if (!currentNode) continue;

            currentNode.dependents.forEach(depId => {
                if (!impacted.has(depId)) {
                    impacted.add(depId);
                    queue.push(depId);
                }
            });
        }

        return Array.from(impacted);
    }, []);

    const fetchGraphData = useCallback(async () => {
        if (!projectContext?.id) return;

        setLoading(true);
        try {
            const response = await graphragAPI.getGraphVisualization({
                project_id: projectContext.id,
                view_mode: viewMode,
                include_external: includeExternal,
                include_isolated: includeIsolated,
                max_nodes: 1200,
                max_edges: 3500,
            });
            const responseNodes: ApiNode[] = response.nodes.map(node => ({
                id: node.id,
                label: node.label,
                type: node.type,
                file_path: node.file_path,
            }));
            const responseEdges: ApiEdge[] = response.edges.map(edge => ({
                source: edge.source,
                target: edge.target,
                type: edge.type,
            }));
            const projected = projectGraphView(
                responseNodes,
                responseEdges,
                viewMode,
                includeExternal,
                includeIsolated
            );

            const toNodeType = (type: string): GraphNode['type'] => {
                const normalized = normalizeType(type).toLowerCase();
                if (normalized === 'file') return 'file';
                if (normalized === 'function') return 'function';
                if (normalized === 'class') return 'class';
                if (normalized === 'variable') return 'variable';
                return 'import';
            };

            const toEdgeType = (type: string): GraphEdge['type'] => {
                const normalized = normalizeType(type).toLowerCase();
                if (normalized === 'calls') return 'calls';
                if (normalized === 'extends') return 'extends';
                if (normalized === 'uses') return 'uses';
                return 'imports';
            };

            const nodes: GraphNode[] = projected.nodes.map(node => ({
                id: node.id,
                label: node.label,
                type: toNodeType(node.type),
                x: 0,
                y: 0,
                dependencies: [],
                dependents: [],
                metadata: {
                    language: node.file_path ? node.file_path.split('.').pop() : undefined,
                },
            }));

            const edges: GraphEdge[] = projected.edges.map(edge => ({
                source: edge.source,
                target: edge.target,
                type: toEdgeType(edge.type),
            }));

            edges.forEach(edge => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                if (sourceNode && targetNode) {
                    if (!sourceNode.dependencies.includes(edge.target)) sourceNode.dependencies.push(edge.target);
                    if (!targetNode.dependents.includes(edge.source)) targetNode.dependents.push(edge.source);
                }
            });

            setRealNodes(nodes);
            setRealEdges(edges);

            const previousSelectedId = selectedNodeIdRef.current;
            const nextSelectedNode = previousSelectedId
                ? nodes.find(node => node.id === previousSelectedId) || nodes[0] || null
                : nodes[0] || null;
            setSelectedNode(nextSelectedNode);
            selectedNodeIdRef.current = nextSelectedNode?.id || null;
            setImpactedNodes(nextSelectedNode ? calculateImpactForNodes(nextSelectedNode, nodes) : []);

            const calculatedStats = buildGraphStats(projected.nodes, projected.edges);
            const serverTruncated = Boolean(response.stats?.truncated);
            setStats({ ...calculatedStats, truncated: serverTruncated });
            setCoverage(response.coverage || null);
        } catch (error) {
            console.error('Failed to fetch graph data:', error);
        } finally {
            setLoading(false);
        }
    }, [projectContext?.id, viewMode, includeExternal, includeIsolated]);

    useEffect(() => {
        fetchGraphData();
    }, [fetchGraphData]);

    const hasRealData = realNodes.length > 0;
    const nodes = hasRealData ? realNodes : SAMPLE_NODES;
    const edges = hasRealData ? realEdges : SAMPLE_EDGES;

    const calculateImpact = useCallback((node: GraphNode) => {
        setImpactedNodes(calculateImpactForNodes(node, nodes));
    }, [calculateImpactForNodes, nodes]);

    const handleNodeClick = useCallback((node: GraphNode) => {
        setSelectedNode(node);
        selectedNodeIdRef.current = node.id;
        calculateImpact(node);
    }, [calculateImpact]);

    const handleClearSelection = useCallback(() => {
        setSelectedNode(null);
        selectedNodeIdRef.current = null;
        setImpactedNodes([]);
    }, []);

    return (
        <div className="h-full min-h-0 flex flex-col">
            <div className="p-4 border-b border-[color:var(--color-border)] space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-display font-semibold">Dependency Graph</h3>
                        <p className="text-sm text-[color:var(--color-text-muted)]">
                            {projectContext?.name || projectName || 'Sample Project'} - {nodes.length} nodes - {edges.length} connections
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedNode && (
                            <Button variant="ghost" size="sm" onClick={handleClearSelection}>
                                Clear Selection
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={fetchGraphData}>
                            Refresh Graph
                        </Button>
                        <Badge variant={hasRealData ? 'accent' : 'secondary'}>
                            {hasRealData ? 'Real Project Data' : 'Sample Data'}
                        </Badge>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 items-center text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-[color:var(--color-text-muted)]">Mode</span>
                        <Button
                            variant={viewMode === 'file' ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('file')}
                        >
                            File
                        </Button>
                        <Button
                            variant={viewMode === 'symbol' ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('symbol')}
                        >
                            Symbol
                        </Button>
                    </div>

                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={includeExternal}
                            onChange={(e) => setIncludeExternal(e.target.checked)}
                        />
                        Include external modules
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={includeIsolated}
                            onChange={(e) => setIncludeIsolated(e.target.checked)}
                        />
                        Include isolated nodes
                    </label>
                </div>

                {(stats || coverage) && (
                    <div className="flex flex-wrap gap-2 text-xs">
                        {coverage && (
                            <Badge variant="secondary">
                                Coverage: {coverage.entities_in_graph}/{coverage.entities_in_project} entities, {coverage.relationships_in_graph}/{coverage.relationships_in_project} relationships
                            </Badge>
                        )}
                        {stats && (
                            <>
                                <Badge variant="secondary">Files: {stats.files}</Badge>
                                <Badge variant="secondary">Functions: {stats.functions}</Badge>
                                <Badge variant="secondary">Classes: {stats.classes}</Badge>
                                <Badge variant="secondary">External: {stats.external_nodes}</Badge>
                            </>
                        )}
                    </div>
                )}

                {stats?.truncated && (
                    <div className="text-xs px-3 py-2 rounded-lg bg-warning/10 border border-warning/30 text-warning">
                        Graph truncated by limits. Use filters/mode to explore more of the project.
                    </div>
                )}
            </div>

            <div className="flex-1 min-h-0 flex">
                <div className="flex-1 min-h-0 p-4">
                    {loading ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                                <svg className="w-12 h-12 mx-auto text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                <p className="mt-4 text-[color:var(--color-text-muted)]">Loading graph...</p>
                            </div>
                        </div>
                    ) : (
                        <DependencyGraph
                            nodes={nodes}
                            edges={edges}
                            onNodeClick={handleNodeClick}
                            selectedNodeId={selectedNode?.id}
                            highlightedNodeIds={impactedNodes}
                        />
                    )}
                </div>

                {selectedNode && (
                    <div className="w-80 h-full min-h-0 border-l border-[color:var(--color-border)] p-4 overflow-y-auto">
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-display font-semibold">{selectedNode.label}</h4>
                            </div>
                            <Badge variant="secondary" className="mb-2">{selectedNode.type}</Badge>
                            {selectedNode.metadata?.language && (
                                <p className="text-sm text-[color:var(--color-text-muted)]">Language: {selectedNode.metadata.language}</p>
                            )}
                        </div>

                        <div className="mb-6">
                            <h5 className="text-sm font-medium mb-2 text-[color:var(--color-text-secondary)]">
                                Dependencies ({selectedNode.dependencies.length})
                            </h5>
                            {selectedNode.dependencies.length > 0 ? (
                                <div className="space-y-1">
                                    {selectedNode.dependencies.map(dep => {
                                        const depNode = nodes.find(n => n.id === dep);
                                        return (
                                            <button
                                                key={dep}
                                                onClick={() => depNode && handleNodeClick(depNode)}
                                                className="w-full text-left px-3 py-2 rounded-lg bg-[color:var(--color-bg-muted)] hover:bg-[color:var(--color-bg-elevated)] transition-colors text-sm"
                                            >
                                                {depNode?.label || dep}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-[color:var(--color-text-muted)]">No dependencies</p>
                            )}
                        </div>

                        <div>
                            <h5 className="text-sm font-medium mb-2 text-[color:var(--color-text-secondary)]">
                                Impact Analysis ({impactedNodes.length})
                            </h5>
                            {impactedNodes.length > 0 ? (
                                <div className="space-y-1">
                                    {impactedNodes.map(id => {
                                        const node = nodes.find(n => n.id === id);
                                        return (
                                            <button
                                                key={id}
                                                onClick={() => node && handleNodeClick(node)}
                                                className="w-full text-left px-3 py-2 rounded-lg bg-warning/10 border border-warning/30 hover:bg-warning/20 transition-colors text-sm"
                                            >
                                                {node?.label || id}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-[color:var(--color-text-muted)]">No dependents - safe to modify</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {!hasRealData && (
                <div className="p-4 border-t border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)]">
                    <p className="text-sm text-center text-[color:var(--color-text-secondary)]">
                        Upload a project in the <strong>Project</strong> tab to see your real dependency graph
                    </p>
                </div>
            )}
        </div>
    );
}

export default GraphPanel;
