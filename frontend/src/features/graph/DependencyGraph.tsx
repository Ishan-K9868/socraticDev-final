import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';

// Types for the graph
export interface GraphNode {
    id: string;
    label: string;
    type: 'file' | 'function' | 'class' | 'variable' | 'import';
    x: number;
    y: number;
    vx?: number;
    vy?: number;
    dependencies: string[];
    dependents: string[];
    metadata?: {
        lines?: number;
        complexity?: number;
        language?: string;
        functions?: string[];
        classes?: string[];
    };
}

export interface GraphEdge {
    source: string;
    target: string;
    type: 'imports' | 'calls' | 'extends' | 'uses';
}

interface DependencyGraphProps {
    nodes: GraphNode[];
    edges: GraphEdge[];
    onNodeClick?: (node: GraphNode) => void;
    onNodeHover?: (node: GraphNode | null) => void;
    selectedNodeId?: string | null;
    highlightedNodeIds?: string[];
}

// Colors for different node types
const NODE_COLORS: Record<GraphNode['type'], { fill: string; stroke: string }> = {
    file: { fill: '#3D5A80', stroke: '#2C4252' },
    function: { fill: '#E07A5F', stroke: '#C4604A' },
    class: { fill: '#81936A', stroke: '#657552' },
    variable: { fill: '#6B7280', stroke: '#4B5563' },
    import: { fill: '#8B5CF6', stroke: '#6D28D9' },
};

const EDGE_COLORS: Record<GraphEdge['type'], string> = {
    imports: '#3D5A80',
    calls: '#E07A5F',
    extends: '#81936A',
    uses: '#6B7280',
};

function DependencyGraph({
    nodes,
    edges,
    onNodeClick,
    onNodeHover,
    selectedNodeId,
    highlightedNodeIds = [],
}: DependencyGraphProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    // Apply force-directed layout
    const positionedNodes = useMemo(() => {
        if (nodes.length === 0) return [];

        // Create deep copies of nodes to avoid mutating props
        const positioned = nodes.map(n => ({
            ...n,
            x: 0,
            y: 0
        }));

        const width = Math.max(dimensions.width, 400);
        const height = Math.max(dimensions.height, 300);
        const centerX = width / 2;
        const centerY = height / 2;

        // Initialize positions in a circle
        positioned.forEach((node, i) => {
            const angle = (2 * Math.PI * i) / positioned.length;
            const radius = Math.min(width, height) * 0.35;
            node.x = centerX + radius * Math.cos(angle);
            node.y = centerY + radius * Math.sin(angle);
        });

        // Run force simulation
        const iterations = Math.min(100, 20 + positioned.length * 5);

        for (let iteration = 0; iteration < iterations; iteration++) {
            const alpha = 1 - iteration / iterations; // Cooling factor

            // Repulsion between all nodes
            for (let i = 0; i < positioned.length; i++) {
                for (let j = i + 1; j < positioned.length; j++) {
                    const dx = positioned[j].x - positioned[i].x;
                    const dy = positioned[j].y - positioned[i].y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const minDist = 80; // Minimum distance between nodes

                    if (dist < minDist * 3) {
                        const force = (minDist * minDist) / (dist * dist) * alpha * 2;
                        const fx = (dx / dist) * force;
                        const fy = (dy / dist) * force;

                        positioned[i].x -= fx;
                        positioned[i].y -= fy;
                        positioned[j].x += fx;
                        positioned[j].y += fy;
                    }
                }
            }

            // Attraction along edges
            edges.forEach(edge => {
                const source = positioned.find(n => n.id === edge.source);
                const target = positioned.find(n => n.id === edge.target);
                if (source && target) {
                    const dx = target.x - source.x;
                    const dy = target.y - source.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const idealDist = 120;
                    const force = (dist - idealDist) * 0.05 * alpha;

                    const fx = (dx / dist) * force;
                    const fy = (dy / dist) * force;

                    source.x += fx;
                    source.y += fy;
                    target.x -= fx;
                    target.y -= fy;
                }
            });

            // Center gravity - pull towards center
            positioned.forEach(node => {
                node.x += (centerX - node.x) * 0.02 * alpha;
                node.y += (centerY - node.y) * 0.02 * alpha;
            });

            // Keep nodes in bounds
            const padding = 50;
            positioned.forEach(node => {
                node.x = Math.max(padding, Math.min(width - padding, node.x));
                node.y = Math.max(padding, Math.min(height - padding, node.y));
            });
        }

        return positioned;
    }, [nodes, edges, dimensions]);

    // Handle resize
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Draw the graph
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);

        // Apply transform
        ctx.save();
        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.scale, transform.scale);

        // Draw edges
        edges.forEach(edge => {
            const source = positionedNodes.find(n => n.id === edge.source);
            const target = positionedNodes.find(n => n.id === edge.target);
            if (!source || !target) return;

            const isHighlighted =
                highlightedNodeIds.includes(source.id) ||
                highlightedNodeIds.includes(target.id);
            const isSelected =
                selectedNodeId === source.id ||
                selectedNodeId === target.id;

            ctx.beginPath();
            ctx.moveTo(source.x, source.y);
            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = isHighlighted || isSelected
                ? EDGE_COLORS[edge.type]
                : `${EDGE_COLORS[edge.type]}40`;
            ctx.lineWidth = isHighlighted || isSelected ? 2 : 1;
            ctx.stroke();

            // Draw arrow
            const angle = Math.atan2(target.y - source.y, target.x - source.x);
            const arrowX = target.x - 25 * Math.cos(angle);
            const arrowY = target.y - 25 * Math.sin(angle);

            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(
                arrowX - 8 * Math.cos(angle - Math.PI / 6),
                arrowY - 8 * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
                arrowX - 8 * Math.cos(angle + Math.PI / 6),
                arrowY - 8 * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fillStyle = isHighlighted || isSelected
                ? EDGE_COLORS[edge.type]
                : `${EDGE_COLORS[edge.type]}40`;
            ctx.fill();
        });

        // Draw nodes
        positionedNodes.forEach(node => {
            const isHovered = hoveredNode?.id === node.id;
            const isSelected = selectedNodeId === node.id;
            const isHighlighted = highlightedNodeIds.includes(node.id);
            const colors = NODE_COLORS[node.type];

            // Node circle
            const radius = isHovered || isSelected ? 25 : 20;

            // Glow effect for highlighted/selected nodes
            if (isHighlighted || isSelected || isHovered) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius + 8, 0, Math.PI * 2);
                const gradient = ctx.createRadialGradient(
                    node.x, node.y, radius,
                    node.x, node.y, radius + 8
                );
                gradient.addColorStop(0, `${colors.fill}60`);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.fill();
            }

            // Main circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = colors.fill;
            ctx.fill();
            ctx.strokeStyle = isHovered || isSelected ? '#FFFFFF' : colors.stroke;
            ctx.lineWidth = isHovered || isSelected ? 3 : 2;
            ctx.stroke();

            // Label
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `${isHovered ? 'bold ' : ''}12px 'Space Grotesk', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const label = node.label.length > 12
                ? node.label.substring(0, 10) + '...'
                : node.label;
            ctx.fillText(label, node.x, node.y);
        });

        ctx.restore();
    }, [positionedNodes, edges, transform, hoveredNode, selectedNodeId, highlightedNodeIds, dimensions]);

    // Get node at position
    const getNodeAtPosition = useCallback((x: number, y: number): GraphNode | null => {
        const canvasX = (x - transform.x) / transform.scale;
        const canvasY = (y - transform.y) / transform.scale;

        for (const node of positionedNodes) {
            const dx = canvasX - node.x;
            const dy = canvasY - node.y;
            if (dx * dx + dy * dy < 25 * 25) {
                return node;
            }
        }
        return null;
    }, [positionedNodes, transform]);

    // Mouse handlers
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const node = getNodeAtPosition(x, y);

        if (!node) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
        }
    }, [getNodeAtPosition, transform]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        if (isDragging) {
            setTransform(prev => ({
                ...prev,
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            }));
        } else {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const node = getNodeAtPosition(x, y);

            if (node !== hoveredNode) {
                setHoveredNode(node);
                onNodeHover?.(node);
            }
        }
    }, [isDragging, dragStart, getNodeAtPosition, hoveredNode, onNodeHover]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleClick = useCallback((e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const node = getNodeAtPosition(x, y);

        if (node) {
            onNodeClick?.(node);
        }
    }, [getNodeAtPosition, onNodeClick]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.min(Math.max(transform.scale * delta, 0.3), 3);

        // Zoom towards mouse position
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        setTransform(prev => ({
            x: mouseX - (mouseX - prev.x) * (newScale / prev.scale),
            y: mouseY - (mouseY - prev.y) * (newScale / prev.scale),
            scale: newScale,
        }));
    }, [transform.scale]);

    // Reset view
    const resetView = useCallback(() => {
        gsap.to(transform, {
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: 'power2.out',
            onUpdate: () => setTransform({ ...transform }),
        });
    }, [transform]);

    // GSAP entrance animation
    useGSAP(() => {
        gsap.from(containerRef.current, {
            opacity: 0,
            scale: 0.95,
            duration: 0.5,
            ease: 'power3.out',
        });
    }, { scope: containerRef });

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-[color:var(--color-bg-muted)] rounded-xl overflow-hidden"
        >
            <canvas
                ref={canvasRef}
                width={dimensions.width}
                height={dimensions.height}
                className="cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={handleClick}
                onWheel={handleWheel}
            />

            {/* Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                    onClick={() => setTransform(prev => ({ ...prev, scale: prev.scale * 1.2 }))}
                    className="w-8 h-8 rounded-lg bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] flex items-center justify-center hover:bg-[color:var(--color-bg-elevated)] transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                <button
                    onClick={() => setTransform(prev => ({ ...prev, scale: prev.scale * 0.8 }))}
                    className="w-8 h-8 rounded-lg bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] flex items-center justify-center hover:bg-[color:var(--color-bg-elevated)] transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                </button>
                <button
                    onClick={resetView}
                    className="w-8 h-8 rounded-lg bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] flex items-center justify-center hover:bg-[color:var(--color-bg-elevated)] transition-colors"
                    title="Reset view"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>

            {/* Hovered node tooltip */}
            {hoveredNode && (
                <div
                    className="absolute pointer-events-none px-3 py-2 rounded-lg bg-neutral-900 text-white text-sm shadow-lg"
                    style={{
                        left: hoveredNode.x * transform.scale + transform.x + 30,
                        top: hoveredNode.y * transform.scale + transform.y - 20,
                    }}
                >
                    <p className="font-medium">{hoveredNode.label}</p>
                    <p className="text-xs text-neutral-400 capitalize">{hoveredNode.type}</p>
                    {hoveredNode.metadata?.lines && (
                        <p className="text-xs text-neutral-400">{hoveredNode.metadata.lines} lines</p>
                    )}
                    <p className="text-xs text-neutral-400">
                        {hoveredNode.dependencies.length} deps, {hoveredNode.dependents.length} dependents
                    </p>
                </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 p-3 rounded-lg bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                <p className="text-xs font-medium mb-2 text-[color:var(--color-text-muted)]">Node Types</p>
                <div className="flex flex-wrap gap-3 text-xs">
                    {Object.entries(NODE_COLORS).map(([type, colors]) => (
                        <div key={type} className="flex items-center gap-1.5">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: colors.fill }}
                            />
                            <span className="capitalize">{type}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DependencyGraph;
