import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PLAYERS, ROUNDS } from './coliseumData';
import ColiseumArena from './ColiseumArena';
import SpeedControl from './SpeedControl';
import { ICON_SWORDS } from './coliseumIcons';

const ease = [0.25, 0.1, 0.25, 1] as const;

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

// Round icons as inline SVG components
function RoundIcon({ pathData, className = '' }: { pathData: string; className?: string }) {
    return (
        <svg className={`w-5 h-5 ${className}`} viewBox="0 0 24 24" fill="currentColor">
            <path d={pathData} />
        </svg>
    );
}

export default function ColiseumLobby() {
    const [showArena, setShowArena] = useState(false);
    const navigate = useNavigate();

    if (showArena) return <ColiseumArena />;

    return (
        <div className="min-h-screen relative overflow-hidden bg-[color:var(--color-bg-primary)]">
            {/* Background gradient orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
                <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-orange-500/12 to-transparent blur-3xl" />
                <div className="absolute top-1/4 -left-40 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-violet-500/10 to-transparent blur-3xl" />
                <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] rounded-full bg-gradient-to-br from-teal-500/10 to-transparent blur-3xl" />
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

            {/* Header — matches LearningHub sticky header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-[color:var(--color-bg-primary)]/80 border-b border-[color:var(--color-border)]">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/learn')}
                        className="p-2 -ml-2 rounded-xl hover:bg-[color:var(--color-bg-muted)] transition-colors"
                    >
                        <svg className="w-5 h-5 text-[color:var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-display font-bold text-[color:var(--color-text-primary)]">
                        Speed Coding Coliseum
                    </h1>
                </div>
            </header>

            {/* Main Content */}
            <motion.main
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 max-w-5xl mx-auto px-6 py-16"
            >
                {/* Hero Title */}
                <motion.div variants={itemVariants} className="text-center mb-16">
                    {/* Custom swords icon */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, ease }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 bg-gradient-to-br from-orange-500/15 to-rose-500/15"
                    >
                        <svg className="w-8 h-8 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d={ICON_SWORDS} />
                        </svg>
                    </motion.div>

                    <h2 className="text-4xl md:text-6xl font-display font-bold text-[color:var(--color-text-primary)] mb-6 leading-tight">
                        Speed Coding
                        <br />
                        <span className="bg-gradient-to-r from-orange-500 via-violet-500 to-teal-500 bg-clip-text text-transparent">
                            Coliseum
                        </span>
                    </h2>
                    <p className="text-lg text-[color:var(--color-text-muted)] max-w-xl mx-auto">
                        4 players. 3 rounds. 1 champion. Debug, optimize, and explain your way to victory.
                    </p>
                </motion.div>

                {/* Competitors */}
                <motion.div variants={itemVariants} className="mb-16">
                    <h3 className="text-sm uppercase tracking-widest text-center mb-6 text-[color:var(--color-text-muted)]">
                        Competitors
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {PLAYERS.map((player, i) => (
                            <motion.div
                                key={player.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * 0.08, duration: 0.5, ease }}
                                className="relative rounded-2xl p-5 border text-center group hover:scale-[1.03] transition-all duration-300 bg-[color:var(--color-bg-secondary)]"
                                style={{ borderColor: `${player.hexColor}25` }}
                            >
                                {/* Hover glow */}
                                <div
                                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{ boxShadow: `inset 0 0 40px ${player.hexColor}08, 0 0 30px ${player.hexColor}08` }}
                                />
                                {/* Accent line */}
                                <div
                                    className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ backgroundColor: player.hexColor }}
                                />
                                <div className="relative z-10">
                                    <div
                                        className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                                        style={{ background: `${player.hexColor}15` }}
                                    >
                                        <svg className="w-7 h-7" viewBox="0 0 24 24" fill={player.hexColor}>
                                            <path d={player.avatar} />
                                        </svg>
                                    </div>
                                    <h4 className="font-display font-bold text-sm mb-1" style={{ color: player.hexColor }}>
                                        {player.name}
                                    </h4>
                                    <span className="text-[10px] uppercase tracking-wider text-[color:var(--color-text-muted)]">
                                        {player.rank}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Rounds Preview */}
                <motion.div variants={itemVariants} className="mb-16">
                    <h3 className="text-sm uppercase tracking-widest text-center mb-6 text-[color:var(--color-text-muted)]">
                        Battle Rounds
                    </h3>
                    <div className="flex flex-col md:flex-row gap-4 items-stretch">
                        {ROUNDS.map((round, i) => (
                            <motion.div
                                key={round.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + i * 0.1, duration: 0.5, ease }}
                                className="flex-1 rounded-2xl p-5 border bg-[color:var(--color-bg-secondary)] border-[color:var(--color-border)] hover:border-[color:var(--color-border-hover)] transition-all duration-300 group"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                        round.type === 'bug-hunt' ? 'bg-rose-500/10 text-rose-500'
                                            : round.type === 'optimize' ? 'bg-amber-500/10 text-amber-500'
                                                : 'bg-violet-500/10 text-violet-500'
                                    }`}>
                                        <RoundIcon pathData={round.icon} />
                                    </div>
                                    <div>
                                        <h4 className="font-display font-semibold text-sm text-[color:var(--color-text-primary)]">
                                            Round {round.id}
                                        </h4>
                                        <span className="text-[10px] uppercase tracking-wider text-[color:var(--color-text-muted)]">
                                            {round.duration}s
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-[color:var(--color-text-muted)]">
                                    {round.subtitle}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* How It Works */}
                <motion.div
                    variants={itemVariants}
                    className="mb-12 rounded-2xl p-6 border bg-[color:var(--color-bg-secondary)] border-[color:var(--color-border)]"
                >
                    <h3 className="font-display font-semibold text-sm mb-4 text-[color:var(--color-text-primary)]">
                        How It Works
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-[color:var(--color-text-muted)]">
                        {[
                            { icon: ROUNDS[0].icon, color: 'rose', label: 'Bug Hunt', desc: 'All players get the same buggy code. Find all bugs fastest to survive.' },
                            { icon: ROUNDS[1].icon, color: 'amber', label: 'Optimize', desc: 'Reduce O(n²) to O(n). Worst complexity score gets eliminated.' },
                            { icon: ROUNDS[2].icon, color: 'violet', label: 'ELI5 Duel', desc: 'Final 2 explain code simply. AI judges who explained better.' },
                        ].map(item => (
                            <div key={item.label} className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                                    item.color === 'rose' ? 'bg-rose-500/10 text-rose-500'
                                        : item.color === 'amber' ? 'bg-amber-500/10 text-amber-500'
                                            : 'bg-violet-500/10 text-violet-500'
                                }`}>
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d={item.icon} />
                                    </svg>
                                </div>
                                <p className="text-xs leading-relaxed">
                                    <strong className="text-[color:var(--color-text-primary)]">{item.label}:</strong> {item.desc}
                                </p>
                            </div>
                        ))}
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
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-display font-bold text-lg text-white cursor-pointer bg-gradient-to-r from-orange-500 to-rose-500 shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d={ICON_SWORDS} />
                        </svg>
                        Simulate Battle
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </motion.button>
                    <p className="text-xs mt-4 text-[color:var(--color-text-muted)]">
                        Frontend simulation — watch 4 AI players battle through 3 rounds
                    </p>
                </motion.div>
            </motion.main>
        </div>
    );
}
