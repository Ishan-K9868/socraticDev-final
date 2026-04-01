import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ColiseumPlayer } from './coliseumTypes';

interface EliminationEffectProps {
    player: ColiseumPlayer | null;
    isVisible: boolean;
}

export default function EliminationEffect({ player, isVisible }: EliminationEffectProps) {
    const particles = useMemo(() =>
        Array.from({ length: 30 }, (_, i) => ({
            id: i,
            angle: (i / 30) * 360,
            distance: 60 + Math.random() * 140,
            duration: 0.6 + Math.random() * 0.6,
            size: 4 + Math.random() * 8,
        })),
        [],
    );

    if (!player) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                >
                    {/* Darkened backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black"
                    />

                    {/* Center content */}
                    <div className="relative">
                        {/* Particle burst */}
                        {particles.map(p => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                                animate={{
                                    opacity: 0,
                                    x: Math.cos(p.angle * Math.PI / 180) * p.distance,
                                    y: Math.sin(p.angle * Math.PI / 180) * p.distance,
                                    scale: 0,
                                }}
                                transition={{ duration: p.duration, ease: 'easeOut', delay: 0.2 }}
                                className="absolute top-1/2 left-1/2 rounded-full"
                                style={{
                                    width: p.size,
                                    height: p.size,
                                    marginLeft: -p.size / 2,
                                    marginTop: -p.size / 2,
                                    background: `${player.hexColor}`,
                                    boxShadow: `0 0 10px ${player.hexColor}`,
                                }}
                            />
                        ))}

                        {/* Elimination Text */}
                        <motion.div
                            initial={{ scale: 5, opacity: 0, rotate: -20 }}
                            animate={{ scale: 1, opacity: 1, rotate: -6 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
                            className="text-center"
                        >
                            <h2
                                className="text-6xl md:text-8xl font-bold uppercase tracking-widest text-red-500 mb-4"
                                style={{
                                    fontFamily: "'Syne', sans-serif",
                                    textShadow: '0 0 60px rgba(239, 68, 68, 0.5)',
                                }}
                            >
                                ELIMINATED
                            </h2>
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-center justify-center gap-3"
                            >
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{ background: `${player.hexColor}30` }}
                                >
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill={player.hexColor}>
                                        <path d={player.avatar} />
                                    </svg>
                                </div>
                                <span
                                    className="text-2xl font-bold"
                                    style={{ color: player.hexColor }}
                                >
                                    {player.name}
                                </span>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
