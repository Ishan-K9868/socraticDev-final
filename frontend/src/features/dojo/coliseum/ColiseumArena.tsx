import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useColiseumSimulation } from './useColiseumSimulation';
import PlayerPanel from './PlayerPanel';
import CountdownTimer from './CountdownTimer';
import EliminationEffect from './EliminationEffect';
import VictorySequence from './VictorySequence';
import { ROUNDS } from './coliseumData';
import SpeedControl from './SpeedControl';

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

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--color-bg-primary)' }}>
            {/* Arena glow background */}
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                <div
                    className="absolute inset-0"
                    style={{
                        background: `radial-gradient(ellipse at center, ${currentRound.type === 'bug-hunt' ? 'rgba(239,68,68,0.05)' : currentRound.type === 'optimize' ? 'rgba(59,130,246,0.05)' : 'rgba(168,85,247,0.05)'} 0%, transparent 70%)`,
                    }}
                />
                {/* Pulsing heartbeat when timer is active */}
                {showTimer && (
                    <motion.div
                        animate={{
                            opacity: timer <= 10 ? [0.03, 0.08, 0.03] : [0.01, 0.04, 0.01],
                        }}
                        transition={{ duration: timer <= 10 ? 0.5 : 1.5, repeat: Infinity }}
                        className="absolute inset-0"
                        style={{
                            background: `radial-gradient(circle at center, ${timer <= 10 ? 'rgba(239,68,68,0.15)' : 'rgba(45,212,191,0.1)'} 0%, transparent 60%)`,
                        }}
                    />
                )}
            </div>

            {/* Header bar */}
            <header className="relative z-20 border-b px-6 py-3 flex items-center justify-between backdrop-blur-xl"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-primary)' }}>
                <div className="flex items-center gap-4">
                    <button onClick={handleBackToHub} className="p-2 rounded-lg hover:bg-[color:var(--color-bg-muted)] transition-colors">
                        <svg className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 className="text-lg font-bold" style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-text-primary)' }}>
                        ⚔️ Speed Coding Coliseum
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={currentRound.title}
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 10, opacity: 0 }}
                            className="text-sm font-medium px-3 py-1 rounded-full"
                            style={{ background: 'var(--color-bg-muted)', color: 'var(--color-text-muted)' }}
                        >
                            {phase === 'idle' ? 'Ready' : `${currentRound.icon} ${currentRound.title}`}
                        </motion.span>
                    </AnimatePresence>
                    <SpeedControl currentSpeed={playbackSpeed} onChange={setPlaybackSpeed} compact />
                    <span className="text-xs px-2 py-1 rounded-md" style={{ background: 'var(--color-bg-muted)', color: 'var(--color-text-muted)' }}>
                        {players.filter(p => !p.isEliminated).length} alive
                    </span>
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

                {/* Center Timer (during active round) */}
                {showTimer && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        <div className="bg-black/50 backdrop-blur-md rounded-2xl px-6 py-4">
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
                            className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                        >
                            <div className="bg-black/60 backdrop-blur-lg rounded-3xl px-12 py-10 text-center max-w-lg">
                                {phase === 'intro' && (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: 'spring' }}
                                    >
                                        <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: "'Syne', sans-serif", color: '#2DD4BF' }}>
                                            ⚔️ BATTLE BEGINS
                                        </h2>
                                        <p style={{ color: 'var(--color-text-muted)' }}>Prepare yourselves...</p>
                                    </motion.div>
                                )}
                                {phase === 'countdown' && (
                                    <CountdownTimer value={timer} maxValue={3} phase="countdown" />
                                )}
                                {phase === 'round-judging' && (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: 'spring' }}
                                    >
                                        <div className="text-4xl mb-3">⚖️</div>
                                        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Syne', sans-serif", color: '#F59E0B' }}>
                                            JUDGING...
                                        </h2>
                                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Analyzing performance</p>
                                    </motion.div>
                                )}
                                {phase === 'next-round-intro' && roundIdx < 2 && (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: 'spring' }}
                                    >
                                        <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Syne', sans-serif", color: '#2DD4BF' }}>
                                            {ROUNDS[roundIdx + 1]?.icon} {ROUNDS[roundIdx + 1]?.title}
                                        </h2>
                                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <button
                            onClick={start}
                            className="px-10 py-4 rounded-2xl font-bold text-lg text-white transition-all hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg, #2DD4BF, #3B82F6)',
                                boxShadow: '0 0 40px rgba(45,212,191,0.3)',
                                fontFamily: "'Syne', sans-serif",
                            }}
                        >
                            ⚔️ START BATTLE
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
