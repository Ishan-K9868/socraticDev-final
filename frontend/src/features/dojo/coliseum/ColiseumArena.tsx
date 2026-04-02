import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useColiseumSimulation } from './useColiseumSimulation';
import PlayerPanel from './PlayerPanel';
import CountdownTimer from './CountdownTimer';
import EliminationEffect from './EliminationEffect';
import VictorySequence from './VictorySequence';
import { ROUNDS } from './coliseumData';
import SpeedControl from './SpeedControl';
import { ICON_SWORDS, ICON_SCALES } from './coliseumIcons';

const ease = [0.25, 0.1, 0.25, 1] as const;

export default function ColiseumArena() {
    const navigate = useNavigate();
    const {
        state, currentRound, eliminatedPlayer,
        winner, typingComments, start, reset,
        playbackSpeed, setPlaybackSpeed,
    } = useColiseumSimulation();

    const { phase, players, timer, currentRound: roundIdx } = state;

    const handlePlayAgain = () => { reset(); setTimeout(() => start(), 100); };
    const handleBackToHub = () => navigate('/learn');

    const showCenterOverlay = phase === 'intro' || phase === 'countdown' || phase === 'round-judging' || phase === 'next-round-intro';
    const showTimer = phase === 'round-active';
    const isActive = phase === 'round-active';

    // Map round type to color token
    const roundColor = currentRound.type === 'bug-hunt' ? 'rose' : currentRound.type === 'optimize' ? 'amber' : 'violet';
    const roundColorMap = { rose: 'rgba(244,63,94,', amber: 'rgba(245,158,11,', violet: 'rgba(139,92,246,' } as const;
    const baseRgba = roundColorMap[roundColor];

    return (
        <div className="min-h-screen relative overflow-hidden bg-[color:var(--color-bg-primary)]">
            {/* Arena glow background */}
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                <div
                    className="absolute inset-0"
                    style={{
                        background: `radial-gradient(ellipse at center, ${baseRgba}0.04) 0%, transparent 70%)`,
                    }}
                />
                {showTimer && (
                    <motion.div
                        animate={{
                            opacity: timer <= 10 ? [0.03, 0.08, 0.03] : [0.01, 0.04, 0.01],
                        }}
                        transition={{ duration: timer <= 10 ? 0.5 : 1.5, repeat: Infinity }}
                        className="absolute inset-0"
                        style={{
                            background: `radial-gradient(circle at center, ${timer <= 10 ? 'rgba(244,63,94,0.12)' : `${baseRgba}0.08)`} 0%, transparent 60%)`,
                        }}
                    />
                )}
            </div>

            {/* Grid pattern */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.02]"
                style={{
                    backgroundImage: `linear-gradient(var(--color-text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-primary) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                    zIndex: 0,
                }}
            />

            {/* Header bar — matches LearningHub pattern */}
            <header className="relative z-20 sticky top-0 backdrop-blur-xl bg-[color:var(--color-bg-primary)]/80 border-b border-[color:var(--color-border)]">
                <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={handleBackToHub} className="p-2 rounded-xl hover:bg-[color:var(--color-bg-muted)] transition-colors">
                            <svg className="w-5 h-5 text-[color:var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <h1 className="text-lg font-display font-bold text-[color:var(--color-text-primary)]">
                            Speed Coding Coliseum
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={currentRound.title}
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 10, opacity: 0 }}
                                transition={{ duration: 0.3, ease }}
                                className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]"
                            >
                                {phase !== 'idle' && (
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" style={{ color: roundColor === 'rose' ? '#f43f5e' : roundColor === 'amber' ? '#f59e0b' : '#8b5cf6' }}>
                                        <path d={currentRound.icon} />
                                    </svg>
                                )}
                                <span className="text-[color:var(--color-text-muted)]">
                                    {phase === 'idle' ? 'Ready' : currentRound.title}
                                </span>
                            </motion.span>
                        </AnimatePresence>
                        <SpeedControl currentSpeed={playbackSpeed} onChange={setPlaybackSpeed} compact />
                        <span className="text-xs px-2.5 py-1.5 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] text-[color:var(--color-text-muted)]">
                            {players.filter(p => !p.isEliminated).length} alive
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Arena Grid */}
            <div className="relative z-10 flex-1 p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 max-w-6xl mx-auto" style={{ minHeight: 'calc(100vh - 140px)' }}>
                    {players.map((player, i) => (
                        <div key={player.id} className="relative" style={{ minHeight: '280px' }}>
                            <PlayerPanel
                                player={player}
                                roundType={currentRound.type}
                                typingLines={typingComments[player.id] || []}
                                isActive={isActive && !player.isEliminated}
                                position={i}
                            />
                        </div>
                    ))}
                </div>

                {/* Center Timer */}
                {showTimer && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        <div className="backdrop-blur-md rounded-2xl px-6 py-4 bg-[color:var(--color-bg-primary)]/60 border border-[color:var(--color-border)]">
                            <CountdownTimer
                                value={timer}
                                maxValue={ROUNDS[roundIdx]?.duration ?? 30}
                                phase="active"
                            />
                        </div>
                    </div>
                )}

                {/* Center Overlay (countdown, intro, judging) */}
                <AnimatePresence>
                    {showCenterOverlay && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease }}
                            className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                        >
                            <div className="backdrop-blur-lg rounded-3xl px-12 py-10 text-center max-w-lg bg-[color:var(--color-bg-primary)]/70 border border-[color:var(--color-border)]">
                                {phase === 'intro' && (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.5, ease }}
                                    >
                                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 bg-gradient-to-br from-orange-500/15 to-rose-500/15">
                                            <svg className="w-7 h-7 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                                                <path d={ICON_SWORDS} />
                                            </svg>
                                        </div>
                                        <h2 className="text-3xl font-display font-bold mb-2 bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
                                            BATTLE BEGINS
                                        </h2>
                                        <p className="text-[color:var(--color-text-muted)] text-sm">Prepare yourselves...</p>
                                    </motion.div>
                                )}
                                {phase === 'countdown' && (
                                    <CountdownTimer value={timer} maxValue={3} phase="countdown" />
                                )}
                                {phase === 'round-judging' && (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.5, ease }}
                                    >
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 bg-amber-500/10">
                                            <svg className="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                                                <path d={ICON_SCALES} />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-display font-bold mb-2 text-amber-500">
                                            JUDGING
                                        </h2>
                                        <p className="text-sm text-[color:var(--color-text-muted)]">Analyzing performance</p>
                                    </motion.div>
                                )}
                                {phase === 'next-round-intro' && roundIdx < 2 && (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.5, ease }}
                                    >
                                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${
                                            ROUNDS[roundIdx + 1]?.type === 'optimize' ? 'bg-amber-500/10 text-amber-500' : 'bg-violet-500/10 text-violet-500'
                                        }`}>
                                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                                <path d={ROUNDS[roundIdx + 1]?.icon} />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-display font-bold mb-2 text-[color:var(--color-text-primary)]">
                                            {ROUNDS[roundIdx + 1]?.title}
                                        </h2>
                                        <p className="text-sm text-[color:var(--color-text-muted)]">
                                            {ROUNDS[roundIdx + 1]?.subtitle}
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Idle state — Start button */}
            {phase === 'idle' && (
                <div className="absolute inset-0 flex items-center justify-center z-40">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease }}
                        className="text-center"
                    >
                        <button
                            onClick={start}
                            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-display font-bold text-lg text-white transition-all hover:scale-[1.03] bg-gradient-to-r from-orange-500 to-rose-500 shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d={ICON_SWORDS} />
                            </svg>
                            Start Battle
                        </button>
                    </motion.div>
                </div>
            )}

            {/* Elimination overlay */}
            <EliminationEffect
                player={eliminatedPlayer}
                isVisible={phase === 'elimination'}
            />

            {/* Victory overlay */}
            <VictorySequence
                winner={winner}
                roundResults={state.roundResults}
                isVisible={phase === 'victory'}
                onPlayAgain={handlePlayAgain}
                onBackToHub={handleBackToHub}
            />
        </div>
    );
}
