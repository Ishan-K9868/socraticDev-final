import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PLAYERS, ROUNDS } from './coliseumData';
import ColiseumArena from './ColiseumArena';
import SpeedControl from './SpeedControl';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, damping: 20, stiffness: 100 } },
};

export default function ColiseumLobby() {
    const [showArena, setShowArena] = useState(false);
    const navigate = useNavigate();

    if (showArena) return <ColiseumArena />;

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--color-bg-primary)' }}>
            {/* Background glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl"
                    style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.08) 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl"
                    style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl"
                    style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.06) 0%, transparent 70%)' }} />
            </div>

            {/* Grid pattern */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02]"
                style={{
                    backgroundImage: `linear-gradient(var(--color-text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-primary) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }} />

            {/* Header */}
            <header className="relative z-10 border-b px-6 py-4 flex items-center backdrop-blur-xl"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-primary)' }}>
                <button onClick={() => navigate('/learn')} className="p-2 -ml-2 rounded-xl hover:bg-[color:var(--color-bg-muted)] transition-colors mr-4">
                    <svg className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold" style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-text-primary)' }}>
                    Speed Coding Coliseum
                </h1>
            </header>

            {/* Main Content */}
            <motion.main
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 max-w-5xl mx-auto px-6 py-12"
            >
                {/* Title */}
                <motion.div variants={itemVariants} className="text-center mb-16">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                        className="text-5xl mb-4"
                    >
                        ⚔️
                    </motion.div>
                    <h2
                        className="text-4xl md:text-6xl font-bold mb-4 tracking-tight"
                        style={{
                            fontFamily: "'Syne', sans-serif",
                            background: 'linear-gradient(135deg, #2DD4BF 0%, #3B82F6 50%, #8B5CF6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        SPEED CODING
                        <br />
                        COLISEUM
                    </h2>
                    <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                        4 players. 3 rounds. 1 champion. Debug, optimize, and explain your way to victory.
                    </p>
                </motion.div>

                {/* Players VS Layout */}
                <motion.div variants={itemVariants} className="mb-16">
                    <h3 className="text-sm uppercase tracking-widest text-center mb-6"
                        style={{ color: 'var(--color-text-muted)' }}>Competitors</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {PLAYERS.map((player, i) => (
                            <motion.div
                                key={player.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * 0.1, type: 'spring' }}
                                className="relative rounded-xl p-5 border text-center group hover:scale-105 transition-transform"
                                style={{
                                    background: 'var(--color-bg-secondary)',
                                    borderColor: `${player.hexColor}30`,
                                    boxShadow: `0 0 30px ${player.hexColor}10`,
                                }}
                            >
                                {/* Glow on hover */}
                                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ boxShadow: `inset 0 0 30px ${player.hexColor}15, 0 0 40px ${player.hexColor}15` }} />
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                                        style={{ background: `${player.hexColor}20` }}>
                                        <svg className="w-7 h-7" viewBox="0 0 24 24" fill={player.hexColor}>
                                            <path d={player.avatar} />
                                        </svg>
                                    </div>
                                    <h4 className="font-bold text-sm mb-1" style={{ color: player.hexColor }}>
                                        {player.name}
                                    </h4>
                                    <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                                        {player.rank}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Rounds Preview */}
                <motion.div variants={itemVariants} className="mb-16">
                    <h3 className="text-sm uppercase tracking-widest text-center mb-6"
                        style={{ color: 'var(--color-text-muted)' }}>Battle Rounds</h3>
                    <div className="flex flex-col md:flex-row gap-4 items-stretch">
                        {ROUNDS.map((round, i) => (
                            <motion.div
                                key={round.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + i * 0.15 }}
                                className="flex-1 rounded-xl p-5 border"
                                style={{
                                    background: 'var(--color-bg-secondary)',
                                    borderColor: 'var(--color-border)',
                                }}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl">{round.icon}</span>
                                    <div>
                                        <h4 className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                            Round {round.id}
                                        </h4>
                                        <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                                            {round.duration}s
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                    {round.subtitle}
                                </p>
                                {i < ROUNDS.length - 1 && (
                                    <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-xl"
                                        style={{ color: 'var(--color-text-muted)' }}>→</div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* How It Works */}
                <motion.div variants={itemVariants} className="mb-12 rounded-xl p-6 border"
                    style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                    <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>How It Works</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        <div className="flex gap-2">
                            <span className="text-lg">🐛</span>
                            <p><strong>Bug Hunt:</strong> All players get the same buggy code. Find all bugs fastest to survive.</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-lg">⚡</span>
                            <p><strong>Optimize:</strong> Reduce O(n²) to O(n). Worst complexity score gets eliminated.</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-lg">🎤</span>
                            <p><strong>ELI5 Duel:</strong> Final 2 explain code simply. AI judges who explained better.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Speed Control */}
                <motion.div variants={itemVariants} className="mb-8 flex justify-center">
                    <SpeedControl currentSpeed={1} onChange={() => {}} />
                </motion.div>

                {/* Start Button */}
                <motion.div variants={itemVariants} className="text-center">
                    <motion.button
                        onClick={() => setShowArena(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-12 py-5 rounded-2xl font-bold text-xl text-white cursor-pointer"
                        style={{
                            fontFamily: "'Syne', sans-serif",
                            background: 'linear-gradient(135deg, #2DD4BF, #3B82F6, #8B5CF6)',
                            boxShadow: '0 0 60px rgba(45,212,191,0.3), 0 0 120px rgba(59,130,246,0.15)',
                        }}
                    >
                        ⚔️ SIMULATE BATTLE
                    </motion.button>
                    <p className="text-xs mt-4" style={{ color: 'var(--color-text-muted)' }}>
                        Frontend simulation — watch 4 AI players battle through 3 rounds
                    </p>
                </motion.div>
            </motion.main>
        </div>
    );
}
