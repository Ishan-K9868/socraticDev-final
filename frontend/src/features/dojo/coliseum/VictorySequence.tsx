import { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { ColiseumPlayer, RoundResult } from './coliseumTypes';

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
            color: ['#2DD4BF', '#F59E0B', '#F43F5E', '#8B5CF6', '#3B82F6', '#10B981'][i % 6],
            rotate: Math.random() * 720,
        })),
        [],
    );

    if (!winner || !isVisible) return null;

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

            {/* Crown */}
            <motion.div
                initial={{ y: -100, opacity: 0, scale: 0 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
                className="text-6xl mb-4"
            >
                👑
            </motion.div>

            {/* Champion text */}
            <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-5xl md:text-7xl font-bold tracking-[0.3em] mb-6"
                style={{
                    fontFamily: "'Syne', sans-serif",
                    color: winner.hexColor,
                    textShadow: `0 0 60px ${winner.hexColor}80, 0 0 120px ${winner.hexColor}40`,
                    fontVariantNumeric: 'tabular-nums',
                }}
            >
                {championText}
            </motion.h1>

            {/* Winner identity */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8, type: 'spring' }}
                className="flex items-center gap-4 mb-8"
            >
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                        background: `${winner.hexColor}20`,
                        boxShadow: `0 0 40px ${winner.hexColor}40`,
                    }}>
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill={winner.hexColor}>
                        <path d={winner.avatar} />
                    </svg>
                </div>
                <div>
                    <h2 className="text-3xl font-bold" style={{ color: winner.hexColor }}>
                        {winner.name}
                    </h2>
                    <span className="text-sm uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                        💎 {winner.rank} Rank
                    </span>
                </div>
            </motion.div>

            {/* Performance stats */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="grid grid-cols-3 gap-6 mb-10"
            >
                {[
                    { label: 'Rounds Won', value: '3/3', icon: '🏆' },
                    { label: 'Final Score', value: `${winner.score}`, icon: '⭐' },
                    { label: 'Rank', value: winner.rank, icon: '💎' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.4 + i * 0.1, type: 'spring' }}
                        className="text-center px-6 py-4 rounded-xl border"
                        style={{
                            background: 'var(--color-bg-secondary)',
                            borderColor: `${winner.hexColor}30`,
                        }}
                    >
                        <div className="text-2xl mb-1">{stat.icon}</div>
                        <div className="text-xl font-bold" style={{ color: winner.hexColor }}>{stat.value}</div>
                        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Action buttons */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.8 }}
                className="flex gap-4"
            >
                <button
                    onClick={onPlayAgain}
                    className="px-8 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
                    style={{
                        background: `linear-gradient(135deg, ${winner.hexColor}, ${winner.hexColor}cc)`,
                        boxShadow: `0 0 30px ${winner.hexColor}40`,
                    }}
                >
                    ⚔️ Play Again
                </button>
                <button
                    onClick={onBackToHub}
                    className="px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 border"
                    style={{
                        color: 'var(--color-text-primary)',
                        borderColor: 'var(--color-border)',
                        background: 'var(--color-bg-secondary)',
                    }}
                >
                    ← Back to Hub
                </button>
            </motion.div>
        </motion.div>
    );
}
