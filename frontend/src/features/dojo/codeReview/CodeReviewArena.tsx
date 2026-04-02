import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCodeReviewSimulation, PLAYBACK_OPTIONS } from './useCodeReviewSimulation';
import type { ReviewSeverity } from './codeReviewTypes';
import {
    ICON_MAGNIFIER, ICON_CHECK_CIRCLE, ICON_WARNING,
    ICON_ERROR_CIRCLE, ICON_LIGHTBULB, ICON_SHIELD,
} from './codeReviewIcons';

const ease = [0.25, 0.1, 0.25, 1] as const;

const SEVERITY_CONFIG: Record<ReviewSeverity, { color: string; bgClass: string; textClass: string; icon: string; label: string }> = {
    error:      { color: '#EF4444', bgClass: 'bg-red-500/10',    textClass: 'text-red-500',    icon: ICON_ERROR_CIRCLE, label: 'Error' },
    warning:    { color: '#F59E0B', bgClass: 'bg-amber-500/10',  textClass: 'text-amber-500',  icon: ICON_WARNING,      label: 'Warning' },
    info:       { color: '#3B82F6', bgClass: 'bg-blue-500/10',   textClass: 'text-blue-500',   icon: ICON_CHECK_CIRCLE, label: 'Info' },
    suggestion: { color: '#8B5CF6', bgClass: 'bg-violet-500/10', textClass: 'text-violet-500', icon: ICON_LIGHTBULB,    label: 'Suggestion' },
};

interface CodeReviewArenaProps {
    initialFileId?: string;
}

export default function CodeReviewArena({ initialFileId }: CodeReviewArenaProps) {
    const navigate = useNavigate();
    const {
        state, activeFile, start, reset,
        selectFile, playbackSpeed, setPlaybackSpeed,
    } = useCodeReviewSimulation();

    const { phase, revealedComments, scanProgress } = state;

    // Select initial file on mount
    if (initialFileId && state.activeFileId !== initialFileId && phase === 'idle') {
        selectFile(initialFileId);
    }

    const handleBackToHub = () => navigate('/learn');
    const handleRestart = () => { reset(); setTimeout(() => start(), 100); };

    const codeLines = activeFile.code.split('\n');
    const visibleComments = activeFile.comments.slice(0, revealedComments);
    const highlightedLines = new Set(visibleComments.map(c => c.line));

    // Summary stats
    const errorCount = activeFile.comments.filter(c => c.severity === 'error').length;
    const warningCount = activeFile.comments.filter(c => c.severity === 'warning').length;
    const infoCount = activeFile.comments.filter(c => c.severity === 'info' || c.severity === 'suggestion').length;

    return (
        <div className="min-h-screen relative overflow-hidden bg-[color:var(--color-bg-primary)]">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-500/5 to-transparent blur-3xl" />
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
                        <h1 className="text-lg font-display font-bold text-[color:var(--color-text-primary)]">AI Code Reviews</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] text-[color:var(--color-text-muted)]">
                            {activeFile.name}
                        </span>
                        {/* Speed control */}
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
                {/* Idle state */}
                {phase === 'idle' && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 140px)' }}>
                        <div className="text-center">
                            <button
                                onClick={start}
                                className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-display font-bold text-lg text-white transition-all hover:scale-[1.03] bg-gradient-to-r from-blue-500 to-emerald-500 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <path d={ICON_MAGNIFIER} />
                                </svg>
                                Start Review
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Scanning overlay */}
                <AnimatePresence>
                    {phase === 'scanning' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center gap-6"
                            style={{ minHeight: 'calc(100vh - 140px)' }}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500/15 to-emerald-500/15"
                            >
                                <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                    <path d={ICON_MAGNIFIER} />
                                </svg>
                            </motion.div>
                            <h2 className="text-2xl font-display font-bold text-[color:var(--color-text-primary)]">Analyzing Code Structure</h2>
                            <div className="w-64 h-2 rounded-full overflow-hidden bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                                <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                                    style={{ width: `${scanProgress}%` }}
                                />
                            </div>
                            <p className="text-sm text-[color:var(--color-text-muted)]">Scanning for security, performance, and style issues...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Review / Summary content */}
                {(phase === 'reviewing' || phase === 'summary') && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease }} className="grid grid-cols-1 lg:grid-cols-5 gap-6" style={{ minHeight: 'calc(100vh - 140px)' }}>
                        {/* Code Panel */}
                        <div className="lg:col-span-3 rounded-2xl border bg-[color:var(--color-bg-secondary)] border-[color:var(--color-border)] overflow-hidden">
                            {/* Terminal header */}
                            <div className="px-4 py-3 border-b border-[color:var(--color-border)] flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                                <span className="ml-2 text-xs text-[color:var(--color-text-muted)] font-mono">{activeFile.name}</span>
                            </div>
                            {/* Code lines */}
                            <div className="px-0 py-3 overflow-x-auto max-h-[calc(100vh-240px)] overflow-y-auto">
                                {codeLines.map((line, i) => {
                                    const lineNum = i + 1;
                                    const isHighlighted = highlightedLines.has(lineNum);
                                    const comment = visibleComments.find(c => c.line === lineNum);
                                    const cfg = comment ? SEVERITY_CONFIG[comment.severity] : null;
                                    return (
                                        <div key={i}>
                                            <div
                                                className={`flex items-start gap-0 px-4 py-0.5 transition-colors duration-300 ${isHighlighted ? 'bg-[color:var(--color-bg-muted)]' : ''}`}
                                                style={isHighlighted && cfg ? { borderLeft: `3px solid ${cfg.color}` } : { borderLeft: '3px solid transparent' }}
                                            >
                                                <span className="text-[11px] font-mono w-8 text-right flex-shrink-0 select-none text-[color:var(--color-text-muted)]/40 pr-3">{lineNum}</span>
                                                <pre className="text-[11px] font-mono text-[color:var(--color-text-muted)] whitespace-pre">{line || ' '}</pre>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Comments Panel */}
                        <div className="lg:col-span-2 space-y-3">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-display font-semibold text-[color:var(--color-text-primary)]">Review Comments</h3>
                                <span className="text-[10px] px-2 py-1 rounded-lg bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] text-[color:var(--color-text-muted)]">
                                    {revealedComments}/{activeFile.comments.length}
                                </span>
                            </div>

                            <AnimatePresence>
                                {visibleComments.map((comment, i) => {
                                    const cfg = SEVERITY_CONFIG[comment.severity];
                                    return (
                                        <motion.div
                                            key={comment.id}
                                            initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            transition={{ duration: 0.35, ease, delay: i * 0.05 }}
                                            className="rounded-2xl border p-4 bg-[color:var(--color-bg-secondary)] border-[color:var(--color-border)]"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${cfg.bgClass}`}>
                                                    <svg className={`w-4 h-4 ${cfg.textClass}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                                        <path d={cfg.icon} />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-xs font-bold ${cfg.textClass}`}>{cfg.label}</span>
                                                        <span className="text-[10px] text-[color:var(--color-text-muted)]">Line {comment.line}</span>
                                                    </div>
                                                    <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-1">{comment.title}</h4>
                                                    <p className="text-xs text-[color:var(--color-text-muted)] leading-relaxed">{comment.message}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>

                            {/* Summary Card */}
                            <AnimatePresence>
                                {phase === 'summary' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.5, ease }}
                                        className="rounded-2xl border-2 p-5 mt-4"
                                        style={{ borderColor: activeFile.accentColor, background: 'var(--color-bg-secondary)' }}
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500/15 to-blue-500/15">
                                                <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                                    <path d={ICON_SHIELD} />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-display font-bold text-sm text-[color:var(--color-text-primary)]">Review Complete</h4>
                                                <span className="text-xs text-[color:var(--color-text-muted)]">Quality Score</span>
                                            </div>
                                            <div className="ml-auto text-right">
                                                <span className="text-2xl font-display font-bold" style={{ color: activeFile.accentColor }}>
                                                    {activeFile.qualityScore}
                                                </span>
                                                <span className="text-sm text-[color:var(--color-text-muted)]">/10</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 text-center">
                                            {[
                                                { label: 'Errors', count: errorCount, color: '#EF4444' },
                                                { label: 'Warnings', count: warningCount, color: '#F59E0B' },
                                                { label: 'Info', count: infoCount, color: '#3B82F6' },
                                            ].map(s => (
                                                <div key={s.label} className="rounded-xl py-2 px-3" style={{ background: `${s.color}08` }}>
                                                    <div className="text-lg font-display font-bold" style={{ color: s.color }}>{s.count}</div>
                                                    <div className="text-[10px] text-[color:var(--color-text-muted)]">{s.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-3 mt-4">
                                            <button onClick={handleRestart} className="flex-1 py-2.5 rounded-xl font-display font-bold text-sm text-white bg-gradient-to-r from-blue-500 to-emerald-500 transition-all hover:scale-[1.02]">
                                                Review Again
                                            </button>
                                            <button onClick={handleBackToHub} className="flex-1 py-2.5 rounded-xl font-display font-bold text-sm border text-[color:var(--color-text-primary)] border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] transition-all hover:scale-[1.02]">
                                                Back to Hub
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
