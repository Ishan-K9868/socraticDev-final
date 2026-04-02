import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearningPathSimulation, PLAYBACK_OPTIONS } from './useLearningPathSimulation';
import type { NodeStatus } from './learningPathTypes';
import { ICON_BOOK, ICON_CODE, ICON_PUZZLE, ICON_BRAIN, ICON_PATH_TROPHY, ICON_ROCKET, ICON_MAP, ICON_TARGET } from './learningPathIcons';

const ease = [0.25, 0.1, 0.25, 1] as const;

const NODE_ICON_MAP: Record<string, string> = {
    book: ICON_BOOK, code: ICON_CODE, puzzle: ICON_PUZZLE,
    brain: ICON_BRAIN, trophy: ICON_PATH_TROPHY, rocket: ICON_ROCKET,
};

const STATUS_COLORS: Record<NodeStatus, { fill: string; stroke: string; text: string; glow: string }> = {
    mastered:     { fill: '#10B981', stroke: '#10B981', text: '#10B981', glow: 'rgba(16,185,129,0.3)' },
    'in-progress': { fill: '#F59E0B', stroke: '#F59E0B', text: '#F59E0B', glow: 'rgba(245,158,11,0.3)' },
    recommended:  { fill: '#3B82F6', stroke: '#3B82F6', text: '#3B82F6', glow: 'rgba(59,130,246,0.3)' },
    locked:       { fill: '#6B7280', stroke: '#6B7280', text: '#6B7280', glow: 'rgba(107,114,128,0.1)' },
};

interface LearningPathArenaProps {
    initialTrackId?: string;
}

export default function LearningPathArena({ initialTrackId }: LearningPathArenaProps) {
    const navigate = useNavigate();
    const {
        state, activeTrack, start, reset,
        selectTrack, playbackSpeed, setPlaybackSpeed,
    } = useLearningPathSimulation();
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    const { phase, revealedNodes, revealedEdges, analyzeProgress } = state;

    if (initialTrackId && state.activeTrackId !== initialTrackId && phase === 'idle') {
        selectTrack(initialTrackId);
    }

    const handleBackToHub = () => navigate('/learn');
    const handleRestart = () => { reset(); setTimeout(() => start(), 100); };

    const visibleNodes = activeTrack.nodes.slice(0, revealedNodes);
    const visibleEdges = activeTrack.edges.slice(0, revealedEdges);
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));

    // SVG coordinate helper (normalized 0-100 → SVG viewBox)
    const svgW = 900;
    const svgH = 400;
    const nx = (pct: number) => (pct / 100) * svgW * 0.9 + svgW * 0.05;
    const ny = (pct: number) => (pct / 100) * svgH * 0.7 + svgH * 0.15;

    const getNodePos = (id: string) => {
        const node = activeTrack.nodes.find(n => n.id === id);
        return node ? { x: nx(node.x), y: ny(node.y) } : { x: 0, y: 0 };
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-[color:var(--color-bg-primary)]">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-500/5 to-transparent blur-3xl" />
            </div>
            <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{
                backgroundImage: `linear-gradient(var(--color-text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-primary) 1px, transparent 1px)`,
                backgroundSize: '60px 60px', zIndex: 0,
            }} />

            {/* Header */}
            <header className="relative z-20 sticky top-0 backdrop-blur-xl bg-[color:var(--color-bg-primary)]/80 border-b border-[color:var(--color-border)]">
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={handleBackToHub} className="p-2 rounded-xl hover:bg-[color:var(--color-bg-muted)] transition-colors">
                            <svg className="w-5 h-5 text-[color:var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <h1 className="text-lg font-display font-bold text-[color:var(--color-text-primary)]">Adaptive Learning Paths</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-medium px-3 py-1.5 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] text-[color:var(--color-text-muted)]">
                            {activeTrack.title}
                        </span>
                        <div className="flex items-center gap-0.5 rounded-xl px-1.5 py-1 bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                            {PLAYBACK_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => setPlaybackSpeed(opt.value)}
                                    className="px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                    style={{
                                        background: playbackSpeed === opt.value ? 'var(--color-bg-muted)' : 'transparent',
                                        color: playbackSpeed === opt.value ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto p-6">
                {/* Idle */}
                {phase === 'idle' && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 140px)' }}>
                        <button
                            onClick={start}
                            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-display font-bold text-lg text-white transition-all hover:scale-[1.03] bg-gradient-to-r from-violet-500 to-amber-500 shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <path d={ICON_TARGET} />
                            </svg>
                            Assess Skills & Build Path
                        </button>
                    </motion.div>
                )}

                {/* Analyzing */}
                <AnimatePresence>
                    {phase === 'analyzing' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center gap-6" style={{ minHeight: 'calc(100vh - 140px)' }}>
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-500/15 to-amber-500/15"
                            >
                                <svg className="w-8 h-8 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                    <path d={ICON_TARGET} />
                                </svg>
                            </motion.div>
                            <h2 className="text-2xl font-display font-bold text-[color:var(--color-text-primary)]">Assessing Your Skills</h2>
                            <div className="w-64 h-2 rounded-full overflow-hidden bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                                <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-amber-500" style={{ width: `${analyzeProgress}%` }} />
                            </div>
                            <p className="text-sm text-[color:var(--color-text-muted)]">Analyzing knowledge gaps and building personalized path...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Building / Complete — SVG Graph */}
                {(phase === 'building' || phase === 'complete') && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease }}>
                        <div className="rounded-2xl border bg-[color:var(--color-bg-secondary)] border-[color:var(--color-border)] overflow-hidden mb-6">
                            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ minHeight: '450px' }}>
                                {/* Edges */}
                                {visibleEdges.map((edge, i) => {
                                    const from = getNodePos(edge.from);
                                    const to = getNodePos(edge.to);
                                    if (!visibleNodeIds.has(edge.from) || !visibleNodeIds.has(edge.to)) return null;
                                    const midX = (from.x + to.x) / 2;
                                    const midY = (from.y + to.y) / 2 - 15;
                                    return (
                                        <motion.path
                                            key={`${edge.from}-${edge.to}`}
                                            d={`M${from.x} ${from.y} Q${midX} ${midY} ${to.x} ${to.y}`}
                                            fill="none"
                                            className="stroke-[color:var(--color-border)]"
                                            strokeWidth={1.5}
                                            strokeDasharray="6 4"
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 0.5 }}
                                            transition={{ duration: 0.4, delay: i * 0.05, ease }}
                                        />
                                    );
                                })}

                                {/* Nodes */}
                                {visibleNodes.map((node, i) => {
                                    const x = nx(node.x);
                                    const y = ny(node.y);
                                    const sc = STATUS_COLORS[node.status];
                                    const isHovered = hoveredNode === node.id;
                                    const iconPath = NODE_ICON_MAP[node.iconType] || ICON_CODE;

                                    return (
                                        <motion.g
                                            key={node.id}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.4, delay: i * 0.05, ease }}
                                            style={{ transformOrigin: `${x}px ${y}px` }}
                                            onMouseEnter={() => setHoveredNode(node.id)}
                                            onMouseLeave={() => setHoveredNode(null)}
                                            className="cursor-pointer"
                                        >
                                            {/* Glow ring */}
                                            {node.status !== 'locked' && (
                                                <circle cx={x} cy={y} r={28} fill={sc.glow} opacity={isHovered ? 0.6 : 0.2} />
                                            )}
                                            {/* Node circle */}
                                            <circle cx={x} cy={y} r={20} fill="var(--color-bg-secondary)" stroke={sc.stroke} strokeWidth={2} opacity={node.status === 'locked' ? 0.4 : 1} />
                                            {/* Icon */}
                                            <g transform={`translate(${x - 8}, ${y - 8})`}>
                                                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={sc.text} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={node.status === 'locked' ? 0.4 : 1}>
                                                    <path d={iconPath} />
                                                </svg>
                                            </g>
                                            {/* Label */}
                                            <text x={x} y={y + 34} textAnchor="middle" fontSize={9} fontWeight={600} fill={sc.text} opacity={node.status === 'locked' ? 0.4 : 1}>
                                                {node.label}
                                            </text>
                                            {/* Status dot */}
                                            {node.status === 'mastered' && (
                                                <circle cx={x + 14} cy={y - 14} r={5} fill="#10B981" stroke="var(--color-bg-secondary)" strokeWidth={2} />
                                            )}
                                            {node.status === 'in-progress' && (
                                                <circle cx={x + 14} cy={y - 14} r={5} fill="#F59E0B" stroke="var(--color-bg-secondary)" strokeWidth={2} />
                                            )}
                                            {node.status === 'recommended' && (
                                                <motion.circle cx={x + 14} cy={y - 14} r={5} fill="#3B82F6" stroke="var(--color-bg-secondary)" strokeWidth={2} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                                            )}

                                            {/* Tooltip on hover */}
                                            {isHovered && (
                                                <foreignObject x={x - 80} y={y + 42} width={160} height={80}>
                                                    <div className="rounded-xl p-2 text-center backdrop-blur-md bg-[color:var(--color-bg-primary)]/90 border border-[color:var(--color-border)] shadow-xl">
                                                        <p className="text-[9px] text-[color:var(--color-text-muted)] leading-tight mb-1">{node.description}</p>
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: `${sc.fill}15`, color: sc.text }}>{node.status}</span>
                                                            <span className="text-[8px] text-[color:var(--color-text-muted)]">~{node.estimatedHours}h</span>
                                                        </div>
                                                    </div>
                                                </foreignObject>
                                            )}
                                        </motion.g>
                                    );
                                })}
                            </svg>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-center gap-6 mb-6">
                            {(['mastered', 'in-progress', 'recommended', 'locked'] as const).map(status => (
                                <div key={status} className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full" style={{ background: STATUS_COLORS[status].fill, opacity: status === 'locked' ? 0.4 : 1 }} />
                                    <span className="text-[10px] capitalize text-[color:var(--color-text-muted)]">{status.replace('-', ' ')}</span>
                                </div>
                            ))}
                        </div>

                        {/* Complete summary */}
                        <AnimatePresence>
                            {phase === 'complete' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, ease }}
                                    className="max-w-lg mx-auto rounded-2xl border-2 p-5"
                                    style={{ borderColor: activeTrack.accentColor, background: 'var(--color-bg-secondary)' }}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500/15 to-violet-500/15">
                                            <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                                <path d={ICON_MAP} />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-display font-bold text-sm text-[color:var(--color-text-primary)]">Path Generated</h4>
                                            <span className="text-xs text-[color:var(--color-text-muted)]">{activeTrack.title}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 text-center mb-4">
                                        <div className="rounded-xl py-2 bg-emerald-500/5">
                                            <div className="text-lg font-display font-bold text-emerald-500">{activeTrack.nodes.length}</div>
                                            <div className="text-[10px] text-[color:var(--color-text-muted)]">Modules</div>
                                        </div>
                                        <div className="rounded-xl py-2" style={{ background: `${activeTrack.accentColor}08` }}>
                                            <div className="text-lg font-display font-bold" style={{ color: activeTrack.accentColor }}>~{activeTrack.totalHours}h</div>
                                            <div className="text-[10px] text-[color:var(--color-text-muted)]">Total</div>
                                        </div>
                                        <div className="rounded-xl py-2 bg-emerald-500/5">
                                            <div className="text-lg font-display font-bold text-emerald-500">{activeTrack.masteredCount}</div>
                                            <div className="text-[10px] text-[color:var(--color-text-muted)]">Mastered</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={handleRestart} className="flex-1 py-2.5 rounded-xl font-display font-bold text-sm text-white bg-gradient-to-r from-violet-500 to-amber-500 transition-all hover:scale-[1.02]">
                                            Regenerate
                                        </button>
                                        <button onClick={handleBackToHub} className="flex-1 py-2.5 rounded-xl font-display font-bold text-sm border text-[color:var(--color-text-primary)] border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] transition-all hover:scale-[1.02]">
                                            Back to Hub
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
