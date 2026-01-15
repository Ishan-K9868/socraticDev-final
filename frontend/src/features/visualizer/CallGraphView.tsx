import { useMemo } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
    Position,
    BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CallGraph, GraphNode } from './types';

interface CallGraphViewProps {
    graph: CallGraph;
}

// Custom node component
function CustomNode({ data }: { data: { label: string; type: string; line: number } }) {
    const getTypeColor = () => {
        switch (data.type) {
            case 'function': return 'border-cyan-500 bg-cyan-500/10';
            case 'class': return 'border-violet-500 bg-violet-500/10';
            case 'method': return 'border-blue-500 bg-blue-500/10';
            case 'variable': return 'border-green-500 bg-green-500/10';
            case 'module': return 'border-orange-500 bg-orange-500/10';
            default: return 'border-neutral-500 bg-neutral-500/10';
        }
    };

    const getTypeIcon = () => {
        switch (data.type) {
            case 'function': return 'ƒ';
            case 'class': return 'C';
            case 'method': return 'M';
            case 'variable': return 'V';
            case 'module': return '📦';
            default: return '•';
        }
    };

    return (
        <div className={`px-4 py-3 rounded-lg border-2 ${getTypeColor()} min-w-[120px] text-center`}>
            <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-mono opacity-60">{getTypeIcon()}</span>
                <span className="font-medium text-sm">{data.label}</span>
            </div>
            <div className="text-xs text-neutral-400 mt-1">Line {data.line}</div>
        </div>
    );
}

const nodeTypes = {
    custom: CustomNode,
};

function CallGraphView({ graph }: CallGraphViewProps) {
    // Convert graph data to ReactFlow format
    const { nodes: flowNodes, edges: flowEdges } = useMemo(() => {
        if (!graph.nodes.length) {
            return { nodes: [], edges: [] };
        }

        // Calculate positions using a simple layout algorithm
        const levelMap = new Map<string, number>();

        // Find root nodes (nodes with no incoming edges)
        const hasIncoming = new Set(graph.edges.map(e => e.to));
        const roots = graph.nodes.filter(n => !hasIncoming.has(n.id));

        // BFS to assign levels
        const queue = roots.length ? roots.map(n => ({ id: n.id, level: 0 })) : [{ id: graph.nodes[0].id, level: 0 }];
        while (queue.length) {
            const { id, level } = queue.shift()!;
            if (levelMap.has(id)) continue;
            levelMap.set(id, level);

            graph.edges
                .filter(e => e.from === id)
                .forEach(e => {
                    if (!levelMap.has(e.to)) {
                        queue.push({ id: e.to, level: level + 1 });
                    }
                });
        }

        // Assign levels to any unvisited nodes
        graph.nodes.forEach((n, i) => {
            if (!levelMap.has(n.id)) {
                levelMap.set(n.id, i);
            }
        });

        // Group by level and calculate position
        const levelCounts = new Map<number, number>();

        const nodes: Node[] = graph.nodes.map((node: GraphNode) => {
            const level = levelMap.get(node.id) || 0;
            const countAtLevel = levelCounts.get(level) || 0;
            levelCounts.set(level, countAtLevel + 1);

            return {
                id: node.id,
                type: 'custom',
                position: {
                    x: 200 + countAtLevel * 200,
                    y: 100 + level * 150
                },
                data: {
                    label: node.name,
                    type: node.type,
                    line: node.line
                },
                sourcePosition: Position.Bottom,
                targetPosition: Position.Top,
            };
        });

        const edges: Edge[] = graph.edges.map((edge, i) => ({
            id: `e${i}-${edge.from}-${edge.to}`,
            source: edge.from,
            target: edge.to,
            type: 'smoothstep',
            animated: edge.type === 'calls',
            label: edge.type,
            labelStyle: { fontSize: 10, fill: '#888' },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 15,
                height: 15,
            },
            style: {
                stroke: edge.type === 'calls' ? '#06b6d4' :
                    edge.type === 'extends' ? '#8b5cf6' : '#94a3b8',
                strokeWidth: 2,
            }
        }));

        return { nodes, edges };
    }, [graph]);

    const [nodes, , onNodesChange] = useNodesState(flowNodes);
    const [edges, , onEdgesChange] = useEdgesState(flowEdges);

    if (!graph.nodes.length) {
        return (
            <div className="h-full flex items-center justify-center text-[color:var(--color-text-muted)]">
                <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    <p>No graph data yet</p>
                    <p className="text-sm mt-1">Enter code and click Visualize</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                }}
            >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
                <Controls />
            </ReactFlow>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 p-3 rounded-lg bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] text-xs">
                <div className="font-medium mb-2">Legend</div>
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded border-2 border-cyan-500 bg-cyan-500/20"></span>
                        <span>Function</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded border-2 border-violet-500 bg-violet-500/20"></span>
                        <span>Class</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded border-2 border-blue-500 bg-blue-500/20"></span>
                        <span>Method</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CallGraphView;
