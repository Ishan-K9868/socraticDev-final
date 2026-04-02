import { motion } from 'framer-motion';
import type { PlaybackSpeed } from './useColiseumSimulation';
import { PLAYBACK_OPTIONS } from './useColiseumSimulation';
import {
    ICON_SPEED_SLOW, ICON_SPEED_PLAY, ICON_SPEED_FORWARD,
    ICON_SPEED_FAST, ICON_SPEED_BOLT,
} from './coliseumIcons';

const SPEED_SVG_MAP: Record<number, string> = {
    0.5: ICON_SPEED_SLOW,
    1:   ICON_SPEED_PLAY,
    1.5: ICON_SPEED_FORWARD,
    2:   ICON_SPEED_FAST,
    3:   ICON_SPEED_BOLT,
};

interface SpeedControlProps {
    currentSpeed: PlaybackSpeed;
    onChange: (speed: PlaybackSpeed) => void;
    compact?: boolean;
}

export default function SpeedControl({ currentSpeed, onChange, compact = false }: SpeedControlProps) {
    if (compact) {
        return (
            <div className="flex items-center gap-0.5 rounded-xl px-1.5 py-1 bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                {PLAYBACK_OPTIONS.map(opt => {
                    const isActive = currentSpeed === opt.value;
                    return (
                        <motion.button
                            key={opt.value}
                            onClick={() => onChange(opt.value)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            style={{
                                background: isActive ? 'var(--color-bg-muted)' : 'transparent',
                                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                            }}
                        >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                <path d={SPEED_SVG_MAP[opt.value] || ICON_SPEED_PLAY} />
                            </svg>
                            {opt.label}
                        </motion.button>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-[color:var(--color-text-muted)]">
                Playback Speed
            </span>
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                {PLAYBACK_OPTIONS.map(opt => {
                    const isActive = currentSpeed === opt.value;
                    return (
                        <motion.button
                            key={opt.value}
                            onClick={() => onChange(opt.value)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer"
                            style={{
                                background: isActive ? 'var(--color-bg-muted)' : 'transparent',
                                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                            }}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d={SPEED_SVG_MAP[opt.value] || ICON_SPEED_PLAY} />
                            </svg>
                            {opt.label}
                            {isActive && (
                                <motion.div
                                    layoutId="speed-indicator"
                                    className="absolute inset-0 rounded-xl border border-[color:var(--color-border-hover)]"
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
