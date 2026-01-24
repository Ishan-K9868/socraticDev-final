import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { graphragAPI, GraphNode, GraphEdge } from '../../services';
import Button from '../../ui/Button';

interface GraphRAGVisualizationProps {
    projectId: string;
    onNodeClick?: (node: GraphNode) => void;
}

// Modern colors for different entity types with gradients
const NODE_COLORS: Record<string, { fill: string; stroke: string; glow: string }> = {
    function: { fill: '#F59E0B', stroke: '#D97706', glow: '#FCD34D' },
    class: { fill: '#8B5CF6', stroke: '#7C3AED', glow: '#C4B5FD' },
    variable: { fill: '#10B981', stroke: '#059669', glow: '#6EE7B7' },
    module: { fill: '#3B82F6', stroke: '#2563EB', glow: '#93C5FD' },
    method: { fill: '#EC4899', stroke: '#DB2777', glow: '#F9A8D4' },
    file: { fill: '#6366F1', stroke: '#4F46E5', glow: '#A5B4FC' },
};

const EDGE_COLORS: Record<string, string> = {
    calls: '#F59E0B',
    imports: '#3B82F6',
    extends: '#8B5CF6',
    implements: '#10B981',
    uses: '#EC4899',
    defines: '#6366F1',
};

interface PositionedNode extends GraphNode {
    x: number;
    y: number;
}

function GraphRAGVisualization({
    projectId,
    onNodeClick,
}: GraphRAGVisualizationProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // Graph data
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [edges, setEdges] = useState<GraphEdge[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Visualization state
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [hoveredNode, setHoveredNode] = useState<PositionedNode | null>(null);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    
    // Filters
    const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [filePatternFilter, setFilePatternFilter] = useState('');
    
    // Lazy loading
    const [visibleNodeCount, setVisibleNodeCount] = useState(500);

    // Load graph data from backend
    useEffect(() => {
        const loadGraph = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await graphragAPI.getGraphVisualization({
                    project_id: projectId,
                });
                
                setNodes(response.nodes);
                setEdges(response.edges);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load graph');
            } finally {
                setLoading(false);
            }
        };

        if (projectId) {
            loadGraph();
        }
    }, [projectId]);

    // Filter nodes based on search and filters
    const filteredNodes = useMemo(() => {
        let filtered = nodes;

        // Type filter
        if (typeFilter.size > 0) {
            filtered = filtered.filter(node => typeFilter.has(node.type));
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(node =>
                node.label.toLowerCase().includes(query) ||
                node.file_path.toLowerCase().includes(query)
            );
        }

        // File pattern filter
        if (filePatternFilter.trim()) {
            const pattern = filePatternFilter.toLowerCase();
            filtered = filtered.filter(node =>
                node.file_path.toLowerCase().includes(pattern)
            );
        }

        // Lazy loading - limit visible nodes
        if (filtered.length > visibleNodeCount) {
            filtered = filtered.slice(0, visibleNodeCount);
        }

        return filtered;
    }, [nodes, typeFilter, searchQuery, filePatternFilter, visibleNodeCount]);

    // Filter edges to only include visible nodes
    const filteredEdges = useMemo(() => {
        const nodeIds = new Set(filteredNodes.map(n => n.id));
        return edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));
    }, [edges, filteredNodes]);

    // Apply force-directed layout
    const positionedNodes = useMemo(() => {
        if (filteredNodes.length === 0) return [];

        const positioned: PositionedNode[] = filteredNodes.map(n => ({
            ...n,
            x: 0,
            y: 0,
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
            const alpha = 1 - iteration / iterations;

            // Repulsion between all nodes
            for (let i = 0; i < positioned.length; i++) {
                for (let j = i + 1; j < positioned.length; j++) {
                    const dx = positioned[j].x - positioned[i].x;
                    const dy = positioned[j].y - positioned[i].y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const minDist = 80;

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
            filteredEdges.forEach(edge => {
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

            // Center gravity
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
    }, [filteredNodes, filteredEdges, dimensions]);

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

        ctx.clearRect(0, 0, dimensions.width, dimensions.height);

        ctx.save();
        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.scale, transform.scale);

        // Highlight search matches
        const searchMatches = searchQuery.trim()
            ? positionedNodes.filter(n =>
                n.label.toLowerCase().includes(searchQuery.toLowerCase())
            )
            : [];

        // Draw edges
        filteredEdges.forEach(edge => {
            const source = positionedNodes.find(n => n.id === edge.source);
            const target = positionedNodes.find(n => n.id === edge.target);
            if (!source || !target) return;

            const isHighlighted =
                selectedNode === source.id ||
                selectedNode === target.id ||
                searchMatches.some(n => n.id === source.id || n.id === target.id);

            ctx.beginPath();
            ctx.moveTo(source.x, source.y);
            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = isHighlighted
                ? EDGE_COLORS[edge.type] || '#6B7280'
                : `${EDGE_COLORS[edge.type] || '#6B7280'}40`;
            ctx.lineWidth = isHighlighted ? 2 : 1;
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
            ctx.fillStyle = isHighlighted
                ? EDGE_COLORS[edge.type] || '#6B7280'
                : `${EDGE_COLORS[edge.type] || '#6B7280'}40`;
            ctx.fill();
        });

        // Draw nodes
        positionedNodes.forEach(node => {
            const isHovered = hoveredNode?.id === node.id;
            const isSelected = selectedNode === node.id;
            const isSearchMatch = searchMatches.some(n => n.id === node.id);
            const colors = NODE_COLORS[node.type] || NODE_COLORS.function;

            const radius = isHovered || isSelected ? 25 : 20;

            // Glow effect for highlighted nodes
            if (isSearchMatch || isSelected || isHovered) {
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
    }, [positionedNodes, filteredEdges, transform, hoveredNode, selectedNode, searchQuery, dimensions]);

    // Get node at position
    const getNodeAtPosition = useCallback((x: number, y: number): PositionedNode | null => {
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
            setHoveredNode(node);
        }
    }, [isDragging, dragStart, getNodeAtPosition]);

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
            setSelectedNode(node.id);
            onNodeClick?.(node);
        }
    }, [getNodeAtPosition, onNodeClick]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.min(Math.max(transform.scale * delta, 0.3), 3);

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

    const resetView = useCallback(() => {
        setTransform({ x: 0, y: 0, scale: 1 });
    }, []);

    const toggleTypeFilter = useCallback((type: string) => {
        setTypeFilter(prev => {
            const next = new Set(prev);
            if (next.has(type)) {
                next.delete(type);
            } else {
                next.add(type);
            }
            return next;
        });
    }, []);

    useGSAP(() => {
        gsap.from(containerRef.current, {
            opacity: 0,
            scale: 0.95,
            duration: 0.5,
            ease: 'power3.out',
        });
    }, { scope: containerRef });

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                    <svg className="w-12 h-12 mx-auto text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="mt-4 text-[color:var(--color-text-muted)]">Loading graph...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-error">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    const uniqueTypes = Array.from(new Set(nodes.map(n => n.type)));

    return (
        <div ref={containerRef} className="relative w-full h-full flex flex-col bg-gradient-to-br from-[color:var(--color-bg-primary)] to-[color:var(--color-bg-secondary)]">
            {/* Filters */}
            <div className="p-6 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)]/80 backdrop-blur-sm space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display font-semibold text-lg">Code Graph Explorer</h3>
                    <div className="flex items-center gap-2 text-sm text-[color:var(--color-text-muted)]">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>{filteredNodes.length} nodes</span>
                    </div>
                </div>
                
                {/* Search */}
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search nodes by name or file path..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all shadow-sm"
                    />
                </div>

                {/* Type filters */}
                <div className="flex flex-wrap gap-2">
                    {uniqueTypes.map(type => {
                        const colors = NODE_COLORS[type] || NODE_COLORS.function;
                        return (
                            <button
                                key={type}
                                onClick={() => toggleTypeFilter(type)}
                                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all transform hover:scale-105 ${
                                    typeFilter.has(type)
                                        ? 'text-white shadow-lg'
                                        : 'bg-[color:var(--color-bg-muted)] hover:bg-[color:var(--color-bg-elevated)] shadow-sm'
                                }`}
                                style={typeFilter.has(type) ? {
                                    backgroundColor: colors.fill,
                                    boxShadow: `0 4px 12px ${colors.glow}40`
                                } : {}}
                            >
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.fill }} />
                                    {type}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* File pattern filter */}
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <input
                        type="text"
                        value={filePatternFilter}
                        onChange={(e) => setFilePatternFilter(e.target.value)}
                        placeholder="Filter by file pattern (e.g., src/)"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all shadow-sm"
                    />
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/20">
                    <div className="flex items-center gap-3 text-sm">
                        <span className="font-medium">Showing {filteredNodes.length} of {nodes.length} nodes</span>
                        {nodes.length > visibleNodeCount && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setVisibleNodeCount(prev => prev + 500)}
                                className="text-xs"
                            >
                                Load more
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[color:var(--color-text-muted)]">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        {filteredEdges.length} connections
                    </div>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative bg-gradient-to-br from-[color:var(--color-bg-muted)] via-[color:var(--color-bg-secondary)] to-[color:var(--color-bg-muted)] overflow-hidden">
                {/* Grid pattern background */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }} />
                
                <canvas
                    ref={canvasRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    className="cursor-grab active:cursor-grabbing relative z-10"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onClick={handleClick}
                    onWheel={handleWheel}
                />

                {/* Controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 bg-[color:var(--color-bg-secondary)]/90 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-[color:var(--color-border)]">
                    <button
                        onClick={() => setTransform(prev => ({ ...prev, scale: prev.scale * 1.2 }))}
                        className="w-10 h-10 rounded-xl bg-[color:var(--color-bg-muted)] hover:bg-primary-500 hover:text-white flex items-center justify-center transition-all transform hover:scale-110 shadow-sm"
                        title="Zoom in"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setTransform(prev => ({ ...prev, scale: prev.scale * 0.8 }))}
                        className="w-10 h-10 rounded-xl bg-[color:var(--color-bg-muted)] hover:bg-primary-500 hover:text-white flex items-center justify-center transition-all transform hover:scale-110 shadow-sm"
                        title="Zoom out"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                    </button>
                    <div className="h-px bg-[color:var(--color-border)] my-1" />
                    <button
                        onClick={resetView}
                        className="w-10 h-10 rounded-xl bg-[color:var(--color-bg-muted)] hover:bg-secondary-500 hover:text-white flex items-center justify-center transition-all transform hover:scale-110 shadow-sm"
                        title="Reset view"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>

                {/* Hovered node tooltip */}
                {hoveredNode && (
                    <div
                        className="absolute pointer-events-none px-4 py-3 rounded-xl bg-neutral-900/95 backdrop-blur-md text-white text-sm shadow-2xl border border-neutral-700 z-50"
                        style={{
                            left: hoveredNode.x * transform.scale + transform.x + 30,
                            top: hoveredNode.y * transform.scale + transform.y - 20,
                        }}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <div 
                                className="w-3 h-3 rounded-full shadow-lg" 
                                style={{ 
                                    backgroundColor: (NODE_COLORS[hoveredNode.type] || NODE_COLORS.function).fill,
                                    boxShadow: `0 0 8px ${(NODE_COLORS[hoveredNode.type] || NODE_COLORS.function).glow}`
                                }} 
                            />
                            <p className="font-semibold">{hoveredNode.label}</p>
                        </div>
                        <p className="text-xs text-neutral-300 capitalize mb-1">
                            <span className="opacity-60">Type:</span> {hoveredNode.type}
                        </p>
                        <p className="text-xs text-neutral-300 truncate max-w-xs">
                            <span className="opacity-60">Path:</span> {hoveredNode.file_path}
                        </p>
                    </div>
                )}
                
                {/* Zoom indicator */}
                <div className="absolute bottom-4 left-4 px-3 py-2 rounded-xl bg-[color:var(--color-bg-secondary)]/90 backdrop-blur-md text-xs font-medium shadow-lg border border-[color:var(--color-border)]">
                    {(transform.scale * 100).toFixed(0)}%
                </div>
            </div>
        </div>
    );
}

export default GraphRAGVisualization;
