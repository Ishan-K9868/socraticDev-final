import { motion } from 'framer-motion';
import type { PlaybackSpeed } from './useColiseumSimulation';
import { PLAYBACK_OPTIONS } from './useColiseumSimulation';

interface SpeedControlProps {
    currentSpeed: PlaybackSpeed;
    onChange: (speed: PlaybackSpeed) => void;
    compact?: boolean;
}

export default function SpeedControl({ currentSpeed, onChange, compact = false }: SpeedControlProps) {
    if (compact) {
        return (
            <div className="flex items-center gap-1 rounded-xl px-2 py-1" style={{ background: 'var(--color-bg-muted)' }}>
                {PLAYBACK_OPTIONS.map(opt => {
                    const isActive = currentSpeed === opt.value;
                    return (
                        <motion.button
                            key={opt.value}
                            onClick={() => onChange(opt.value)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            style={{
                                background: isActive ? 'var(--color-bg-secondary)' : 'transparent',
                                color: isActive ? '#2DD4BF' : 'var(--color-text-muted)',
                                boxShadow: isActive ? '0 0 12px rgba(45,212,191,0.2)' : 'none',
                            }}
                        >
                            {opt.label}
                        </motion.button>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-3">
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                Playback Speed
            </span>
            <div className="flex items-center gap-2 p-1 rounded-2xl" style={{ background: 'var(--color-bg-muted)' }}>
                {PLAYBACK_OPTIONS.map(opt => {
                    const isActive = currentSpeed === opt.value;
                    return (
                        <motion.button
                            key={opt.value}
                            onClick={() => onChange(opt.value)}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative px-4 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer"
                            style={{
                                background: isActive ? 'var(--color-bg-secondary)' : 'transparent',
                                color: isActive ? '#2DD4BF' : 'var(--color-text-muted)',
                                boxShadow: isActive ? '0 0 20px rgba(45,212,191,0.15), inset 0 1px 0 rgba(45,212,191,0.1)' : 'none',
                            }}
                        >
                            <span className="mr-1.5">{opt.icon}</span>
                            {opt.label}
                            {isActive && (
                                <motion.div
                                    layoutId="speed-indicator"
                                    className="absolute inset-0 rounded-xl border"
                                    style={{ borderColor: 'rgba(45,212,191,0.3)' }}
                                    transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
