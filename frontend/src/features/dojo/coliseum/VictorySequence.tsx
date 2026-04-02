import { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { ColiseumPlayer, RoundResult } from './coliseumTypes';
import { ICON_CROWN, ICON_TROPHY, ICON_STAR, ICON_GEM, ICON_SWORDS } from './coliseumIcons';

const ease = [0.25, 0.1, 0.25, 1] as const;

interface VictorySequenceProps {
    winner: ColiseumPlayer | null;
    roundResults: RoundResult[];
    isVisible: boolean;
    onPlayAgain: () => void;
    onBackToHub: () => void;
}

// Scramble text effect
function useScrambleText(text: string, isActive: boolean, duration = 2000) {
    const [displayed, setDisplayed] = useState('');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

    useEffect(() => {
        if (!isActive) { setDisplayed(''); return; }
        let frame: number;
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const result = text.split('').map((char, i) => {
                if (char === ' ') return ' ';
                if (i < Math.floor(progress * text.length)) return char;
                return chars[Math.floor(Math.random() * chars.length)];
            }).join('');
            setDisplayed(result);
            if (progress < 1) frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [text, isActive, duration]);

    return displayed;
}

export default function VictorySequence({ winner, isVisible, onPlayAgain, onBackToHub }: VictorySequenceProps) {
    const championText = useScrambleText('CHAMPION', isVisible, 1500);

    const confetti = useMemo(() =>
        Array.from({ length: 60 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 2,
            duration: 2 + Math.random() * 3,
            size: 4 + Math.random() * 8,
            color: ['#f97316', '#8b5cf6', '#14b8a6', '#f43f5e', '#3b82f6', '#eab308'][i % 6],
            rotate: Math.random() * 720,
        })),
        [],
    );

    if (!winner || !isVisible) return null;

    const STAT_ICONS = [
        { label: 'Rounds Won', value: '3/3', icon: ICON_TROPHY },
        { label: 'Final Score', value: `${winner.score}`, icon: ICON_STAR },
        { label: 'Rank', value: winner.rank, icon: ICON_GEM },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.85)' }}
        >
            {/* Confetti */}
            {confetti.map(c => (
                <motion.div
                    key={c.id}
                    initial={{ y: -20, x: `${c.x}vw`, opacity: 1, rotate: 0 }}
                    animate={{
                        y: '110vh',
                        rotate: c.rotate,
                        opacity: [1, 1, 0],
                    }}
                    transition={{
                        duration: c.duration,
                        delay: c.delay,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                    className="fixed top-0 rounded"
                    style={{
                        width: c.size,
                        height: c.size * 1.5,
                        background: c.color,
                        left: 0,
                    }}
                />
            ))}

            {/* Crown SVG icon */}
            <motion.div
                initial={{ y: -80, opacity: 0, scale: 0 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease, delay: 0.3 }}
                className="mb-4"
            >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                    <svg className="w-9 h-9 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d={ICON_CROWN} />
                    </svg>
                </div>
            </motion.div>

            {/* Champion text */}
            <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4, ease }}
                className="text-5xl md:text-7xl font-display font-bold tracking-[0.3em] mb-6"
                style={{
                    color: winner.hexColor,
                    textShadow: `0 0 40px ${winner.hexColor}50, 0 0 80px ${winner.hexColor}25`,
                    fontVariantNumeric: 'tabular-nums',
                }}
            >
                {championText}
            </motion.h1>

            {/* Winner identity */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.4, ease }}
                className="flex items-center gap-4 mb-8"
            >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                        background: `${winner.hexColor}15`,
                        boxShadow: `0 0 30px ${winner.hexColor}20`,
                    }}>
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill={winner.hexColor}>
                        <path d={winner.avatar} />
                    </svg>
                </div>
                <div>
                    <h2 className="text-2xl font-display font-bold" style={{ color: winner.hexColor }}>
                        {winner.name}
                    </h2>
                    <span className="text-sm uppercase tracking-widest text-[color:var(--color-text-muted)] flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d={ICON_GEM} />
                        </svg>
                        {winner.rank} Rank
                    </span>
                </div>
            </motion.div>

            {/* Performance stats */}
            <motion.div
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.4, ease }}
                className="grid grid-cols-3 gap-4 mb-10"
            >
                {STAT_ICONS.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.4 + i * 0.08, duration: 0.4, ease }}
                        className="text-center px-6 py-4 rounded-2xl border bg-[color:var(--color-bg-secondary)]"
                        style={{ borderColor: `${winner.hexColor}20` }}
                    >
                        <div className="flex justify-center mb-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: `${winner.hexColor}10` }}>
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill={winner.hexColor}>
                                    <path d={stat.icon} />
                                </svg>
                            </div>
                        </div>
                        <div className="text-xl font-display font-bold" style={{ color: winner.hexColor }}>{stat.value}</div>
                        <div className="text-xs text-[color:var(--color-text-muted)]">{stat.label}</div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Action buttons */}
            <motion.div
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.4, ease }}
                className="flex gap-4"
            >
                <button
                    onClick={onPlayAgain}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl font-display font-bold text-white transition-all hover:scale-[1.03]"
                    style={{
                        background: `linear-gradient(135deg, ${winner.hexColor}, ${winner.hexColor}cc)`,
                        boxShadow: `0 8px 30px ${winner.hexColor}30`,
                    }}
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d={ICON_SWORDS} />
                    </svg>
                    Play Again
                </button>
                <button
                    onClick={onBackToHub}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl font-display font-bold transition-all hover:scale-[1.03] border text-[color:var(--color-text-primary)] border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)]"
                >
                    <svg className="w-4 h-4 text-[color:var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Hub
                </button>
            </motion.div>
        </motion.div>
    );
}
