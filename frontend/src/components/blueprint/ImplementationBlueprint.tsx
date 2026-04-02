import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BlueprintData } from './blueprintTypes';

const ease = [0.25, 0.1, 0.25, 1] as const;

interface ImplementationBlueprintProps {
    data: BlueprintData;
}

export default function ImplementationBlueprint({ data }: ImplementationBlueprintProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'architecture' | 'phases' | 'insights'>('architecture');

    // SVG coordinate helpers
    const svgW = 1000;
    const svgH = 500;
    const nx = (pct: number) => (pct / 100) * svgW * 0.82 + svgW * 0.09;
    const ny = (pct: number) => (pct / 100) * svgH * 0.60 + svgH * 0.20;
    const getNodePos = (id: string) => {
        const node = data.archNodes.find(n => n.id === id);
        return node ? { x: nx(node.x), y: ny(node.y) } : { x: 0, y: 0 };
    };

    return (
        <>
            {/* ─── Floating Bubble ─────────────────────────────────── */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 1.5 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 group cursor-pointer"
                        aria-label="View implementation blueprint"
                    >
                        {/* Pulse ring */}
                        <span className="absolute inset-0 rounded-2xl animate-ping" style={{ background: `${data.accentColor}30` }} />
                        {/* Glow */}
                        <span className="absolute -inset-2 rounded-3xl blur-xl opacity-40" style={{ background: data.accentColor }} />
                        {/* Button body */}
                        <span
                            className={`relative flex items-center gap-2.5 px-5 py-3.5 rounded-2xl text-white font-display font-bold text-sm shadow-2xl bg-gradient-to-r ${data.gradient} border border-white/20 group-hover:scale-105 transition-transform`}
                        >
                            {/* Blueprint icon */}
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                            </svg>
                            Implementation Blueprint
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ─── Full Panel (morphed from bubble) ────────────────── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
                        onClick={() => setIsOpen(false)}
                    >
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

                        {/* Panel */}
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ duration: 0.4, ease }}
                            onClick={e => e.stopPropagation()}
                            className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)] shadow-2xl"
                        >
                            {/* Gradient border top */}
                            <div className={`h-1 w-full bg-gradient-to-r ${data.gradient} rounded-t-3xl`} />

                            {/* Header */}
                            <div className="px-6 md:px-8 pt-6 pb-4 flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span
                                            className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg"
                                            style={{ background: `${data.accentColor}15`, color: data.accentColor }}
                                        >
                                            Implementation Blueprint
                                        </span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-display font-bold text-[color:var(--color-text-primary)]">
                                        {data.title}
                                    </h2>
                                    <p className="text-sm text-[color:var(--color-text-muted)] mt-1">{data.subtitle}</p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-xl hover:bg-[color:var(--color-bg-muted)] transition-colors flex-shrink-0 cursor-pointer"
                                >
                                    <svg className="w-5 h-5 text-[color:var(--color-text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Tech Stack Pills */}
                            <div className="px-6 md:px-8 pb-4">
                                <div className="flex flex-wrap gap-2">
                                    {data.techStack.map(tech => (
                                        <span
                                            key={tech.label}
                                            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg border"
                                            style={{
                                                background: `${tech.color}08`,
                                                borderColor: `${tech.color}30`,
                                                color: tech.color,
                                            }}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: tech.color }} />
                                            {tech.label}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Tab Navigation */}
                            <div className="px-6 md:px-8 border-b border-[color:var(--color-border)]">
                                <div className="flex gap-0">
                                    {([
                                        { key: 'architecture' as const, label: 'Architecture' },
                                        { key: 'phases' as const, label: 'Implementation Phases' },
                                        { key: 'insights' as const, label: 'Key Insights' },
                                    ]).map(tab => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className="relative px-4 py-3 text-sm font-semibold transition-colors cursor-pointer"
                                            style={{
                                                color: activeTab === tab.key ? data.accentColor : 'var(--color-text-muted)',
                                            }}
                                        >
                                            {tab.label}
                                            {activeTab === tab.key && (
                                                <motion.div
                                                    layoutId="blueprint-tab-indicator"
                                                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                                                    style={{ background: data.accentColor }}
                                                    transition={{ duration: 0.25, ease }}
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="px-6 md:px-8 py-6">
                                <AnimatePresence mode="wait">
                                    {/* ─── Architecture Tab ─── */}
                                    {activeTab === 'architecture' && (
                                        <motion.div
                                            key="arch"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.25, ease }}
                                        >
                                            <div className="rounded-2xl border bg-[color:var(--color-bg-secondary)] border-[color:var(--color-border)] overflow-hidden">
                                                <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ minHeight: 420 }}>
                                                    {/* Edges */}
                                                    {data.archEdges.map((edge, i) => {
                                                        const from = getNodePos(edge.from);
                                                        const to = getNodePos(edge.to);
                                                        const midX = (from.x + to.x) / 2;
                                                        const midY = (from.y + to.y) / 2 - 12;
                                                        return (
                                                            <g key={`${edge.from}-${edge.to}`}>
                                                                <motion.path
                                                                    d={`M${from.x} ${from.y} Q${midX} ${midY} ${to.x} ${to.y}`}
                                                                    fill="none"
                                                                    className="stroke-[color:var(--color-border)]"
                                                                    strokeWidth={2}
                                                                    strokeDasharray="8 5"
                                                                    initial={{ pathLength: 0, opacity: 0 }}
                                                                    animate={{ pathLength: 1, opacity: 0.6 }}
                                                                    transition={{ duration: 0.6, delay: 0.5 + i * 0.1, ease }}
                                                                />
                                                                {edge.label && (
                                                                    <motion.text
                                                                        x={midX} y={midY - 8}
                                                                        textAnchor="middle"
                                                                        fontSize={11}
                                                                        fontWeight={600}
                                                                        className="fill-[color:var(--color-text-muted)]"
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 0.7 }}
                                                                        transition={{ delay: 0.8 + i * 0.1 }}
                                                                    >
                                                                        {edge.label}
                                                                    </motion.text>
                                                                )}
                                                            </g>
                                                        );
                                                    })}

                                                    {/* Nodes */}
                                                    {data.archNodes.map((node, i) => {
                                                        const x = nx(node.x);
                                                        const y = ny(node.y);
                                                        return (
                                                            <motion.g
                                                                key={node.id}
                                                                initial={{ scale: 0, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                transition={{ duration: 0.4, delay: 0.3 + i * 0.08, ease }}
                                                                style={{ transformOrigin: `${x}px ${y}px` }}
                                                            >
                                                                {/* Glow */}
                                                                <circle cx={x} cy={y} r={44} fill={`${node.color}10`} />
                                                                {/* Circle */}
                                                                <circle cx={x} cy={y} r={32} fill="var(--color-bg-secondary)" stroke={node.color} strokeWidth={2.5} />
                                                                {/* Icon */}
                                                                <g transform={`translate(${x - 11}, ${y - 11})`}>
                                                                    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={node.color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                                                        <path d={node.icon} />
                                                                    </svg>
                                                                </g>
                                                                {/* Label */}
                                                                <text x={x} y={y + 50} textAnchor="middle" fontSize={14} fontWeight={700} fill={node.color}>
                                                                    {node.label}
                                                                </text>
                                                                {/* Description */}
                                                                <text x={x} y={y + 65} textAnchor="middle" fontSize={10} fill="var(--color-text-muted)" opacity={0.8}>
                                                                    {node.description}
                                                                </text>
                                                            </motion.g>
                                                        );
                                                    })}
                                                </svg>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* ─── Phases Tab ─── */}
                                    {activeTab === 'phases' && (
                                        <motion.div
                                            key="phases"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.25, ease }}
                                            className="space-y-4"
                                        >
                                            {data.phases.map((phase, i) => (
                                                <motion.div
                                                    key={phase.title}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.1, duration: 0.35, ease }}
                                                    className="flex gap-4 items-start"
                                                >
                                                    {/* Timeline connector */}
                                                    <div className="flex flex-col items-center flex-shrink-0">
                                                        <div
                                                            className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm text-white"
                                                            style={{ background: phase.color }}
                                                        >
                                                            {i + 1}
                                                        </div>
                                                        {i < data.phases.length - 1 && (
                                                            <div className="w-px h-8 mt-1" style={{ background: `${phase.color}30` }} />
                                                        )}
                                                    </div>
                                                    {/* Content */}
                                                    <div className="flex-1 rounded-2xl border p-4 bg-[color:var(--color-bg-secondary)] border-[color:var(--color-border)]">
                                                        <h4 className="font-display font-bold text-base text-[color:var(--color-text-primary)] mb-1.5">{phase.title}</h4>
                                                        <p className="text-sm text-[color:var(--color-text-muted)] leading-relaxed">{phase.description}</p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}

                                    {/* ─── Insights Tab ─── */}
                                    {activeTab === 'insights' && (
                                        <motion.div
                                            key="insights"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.25, ease }}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                        >
                                            {data.keyInsights.map((insight, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: i * 0.1, duration: 0.35, ease }}
                                                    className="rounded-2xl border p-4 bg-[color:var(--color-bg-secondary)] border-[color:var(--color-border)]"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div
                                                            className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center font-display font-bold text-sm text-white"
                                                            style={{ background: data.accentColor }}
                                                        >
                                                            {i + 1}
                                                        </div>
                                                        <p className="text-sm text-[color:var(--color-text-muted)] leading-relaxed pt-1">
                                                            {insight}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Footer */}
                            <div className="px-6 md:px-8 py-4 border-t border-[color:var(--color-border)] flex items-center justify-between">
                                <p className="text-[10px] text-[color:var(--color-text-muted)] uppercase tracking-wider">
                                    High-Level Architecture Plan
                                </p>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-display font-bold text-white bg-gradient-to-r ${data.gradient} hover:scale-[1.02] transition-transform cursor-pointer`}
                                >
                                    Got it
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
