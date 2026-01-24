import { useState, useCallback, useEffect } from 'react';
import DependencyGraph, { GraphNode, GraphEdge } from './DependencyGraph';
import { useStore } from '../../store/useStore';
import { graphragAPI } from '../../services';
import Badge from '../../ui/Badge';
import Button from '../../ui/Button';

// Sample data for when no project is loaded
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

function GraphPanel({ projectName }: GraphPanelProps) {
    const { dependencyGraph, projectContext } = useStore();
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [impactedNodes, setImpactedNodes] = useState<string[]>([]);
    const [realNodes, setRealNodes] = useState<GraphNode[]>([]);
    const [realEdges, setRealEdges] = useState<GraphEdge[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch real graph data from backend when project context changes
    useEffect(() => {
        const fetchGraphData = async () => {
            if (!projectContext?.id) return;
            
            setLoading(true);
            try {
                const response = await graphragAPI.getGraphVisualization({
                    project_id: projectContext.id,
                });
                
                // Convert backend format to frontend format
                const nodes: GraphNode[] = response.nodes.map(node => ({
                    id: node.id,
                    label: node.label,
                    type: node.type.toLowerCase() as GraphNode['type'],
                    x: 0,
                    y: 0,
                    dependencies: [],
                    dependents: [],
                    metadata: {
                        language: node.file_path ? node.file_path.split('.').pop() : undefined,
                    }
                }));
                
                // Build dependency/dependent relationships from edges
                const edges: GraphEdge[] = response.edges.map(edge => ({
                    source: edge.source,
                    target: edge.target,
                    type: edge.type.toLowerCase() as GraphEdge['type'],
                }));
                
                // Populate dependencies and dependents
                edges.forEach(edge => {
                    const sourceNode = nodes.find(n => n.id === edge.source);
                    const targetNode = nodes.find(n => n.id === edge.target);
                    
                    if (sourceNode && targetNode) {
                        if (!sourceNode.dependencies.includes(edge.target)) {
                            sourceNode.dependencies.push(edge.target);
                        }
                        if (!targetNode.dependents.includes(edge.source)) {
                            targetNode.dependents.push(edge.source);
                        }
                    }
                });
                
                setRealNodes(nodes);
                setRealEdges(edges);
            } catch (error) {
                console.error('Failed to fetch graph data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchGraphData();
    }, [projectContext?.id]);

    // Use real data if available, otherwise sample
    const hasRealData = realNodes.length > 0;
    const nodes = hasRealData ? realNodes : SAMPLE_NODES;
    const edges = hasRealData ? realEdges : SAMPLE_EDGES;

    // Calculate impact when a node is selected
    const calculateImpact = useCallback((node: GraphNode) => {
        const impacted = new Set<string>();
        const queue = [node.id];

        // BFS to find all dependents (what breaks if we change this)
        while (queue.length > 0) {
            const currentId = queue.shift()!;
            const currentNode = nodes.find(n => n.id === currentId);

            if (currentNode) {
                currentNode.dependents.forEach(depId => {
                    if (!impacted.has(depId)) {
                        impacted.add(depId);
                        queue.push(depId);
                    }
                });
            }
        }

        setImpactedNodes(Array.from(impacted));
    }, [nodes]);

    const handleNodeClick = useCallback((node: GraphNode) => {
        setSelectedNode(node);
        calculateImpact(node);
    }, [calculateImpact]);

    const handleClearSelection = useCallback(() => {
        setSelectedNode(null);
        setImpactedNodes([]);
    }, []);

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-[color:var(--color-border)] flex items-center justify-between">
                <div>
                    <h3 className="font-display font-semibold">Dependency Graph</h3>
                    <p className="text-sm text-[color:var(--color-text-muted)]">
                        {projectContext?.name || projectName || 'Sample Project'} • {nodes.length} nodes • {edges.length} connections
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {selectedNode && (
                        <Button variant="ghost" size="sm" onClick={handleClearSelection}>
                            Clear Selection
                        </Button>
                    )}
                    <Badge variant={hasRealData ? 'accent' : 'secondary'}>
                        {hasRealData ? (
                            <>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Real Project Data
                            </>
                        ) : (
                            <>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Sample Data
                            </>
                        )}
                    </Badge>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex">
                {/* Graph */}
                <div className="flex-1 p-4">
                    {loading ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                                <svg className="w-12 h-12 mx-auto text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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

                {/* Side panel */}
                {selectedNode && (
                    <div className="w-80 border-l border-[color:var(--color-border)] p-4 overflow-y-auto">
                        {/* Selected node info */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{
                                        backgroundColor: selectedNode.type === 'file' ? '#3D5A80' :
                                            selectedNode.type === 'function' ? '#E07A5F' :
                                                selectedNode.type === 'class' ? '#81936A' : '#6B7280'
                                    }}
                                />
                                <h4 className="font-display font-semibold">{selectedNode.label}</h4>
                            </div>
                            <Badge variant="secondary" className="mb-2">
                                {selectedNode.type}
                            </Badge>
                            {selectedNode.metadata?.lines && (
                                <p className="text-sm text-[color:var(--color-text-muted)]">
                                    {selectedNode.metadata.lines} lines
                                </p>
                            )}
                            {selectedNode.metadata?.language && (
                                <p className="text-sm text-[color:var(--color-text-muted)]">
                                    Language: {selectedNode.metadata.language}
                                </p>
                            )}
                            {selectedNode.metadata?.functions && selectedNode.metadata.functions.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-xs text-[color:var(--color-text-muted)]">Functions:</p>
                                    <p className="text-sm font-mono">{selectedNode.metadata.functions.slice(0, 5).join(', ')}</p>
                                </div>
                            )}
                            {selectedNode.metadata?.classes && selectedNode.metadata.classes.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-xs text-[color:var(--color-text-muted)]">Classes:</p>
                                    <p className="text-sm font-mono">{selectedNode.metadata.classes.join(', ')}</p>
                                </div>
                            )}
                        </div>

                        {/* Dependencies */}
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

                        {/* Impact Analysis */}
                        <div>
                            <h5 className="text-sm font-medium mb-2 flex items-center gap-2 text-[color:var(--color-text-secondary)]">
                                <svg className="w-4 h-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Impact Analysis ({impactedNodes.length})
                            </h5>
                            {impactedNodes.length > 0 ? (
                                <>
                                    <p className="text-xs text-[color:var(--color-text-muted)] mb-2">
                                        Changes to this file may affect:
                                    </p>
                                    <div className="space-y-1">
                                        {impactedNodes.map(id => {
                                            const node = nodes.find(n => n.id === id);
                                            return (
                                                <button
                                                    key={id}
                                                    onClick={() => node && handleNodeClick(node)}
                                                    className="w-full text-left px-3 py-2 rounded-lg bg-warning/10 border border-warning/30 hover:bg-warning/20 transition-colors text-sm"
                                                >
                                                    <span className="text-warning">⚠</span> {node?.label || id}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-[color:var(--color-text-muted)]">
                                    No dependents - safe to modify
                                </p>
                            )}
                        </div>

                        {/* Ask AI Button */}
                        <div className="mt-6 pt-4 border-t border-[color:var(--color-border)]">
                            <Button className="w-full">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Ask about this file
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Hint if no real data */}
            {!hasRealData && (
                <div className="p-4 border-t border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)]">
                    <p className="text-sm text-center text-[color:var(--color-text-secondary)]">
                        💡 Upload a project in the <strong>Project</strong> tab to see your real dependency graph
                    </p>
                </div>
            )}
        </div>
    );
}

export default GraphPanel;
