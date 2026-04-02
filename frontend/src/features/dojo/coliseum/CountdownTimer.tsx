import { motion, AnimatePresence } from 'framer-motion';

interface CountdownTimerProps {
    value: number;
    maxValue: number;
    phase: 'countdown' | 'active';
}

export default function CountdownTimer({ value, maxValue, phase }: CountdownTimerProps) {
    const isCountdown = phase === 'countdown';
    const pct = isCountdown ? 1 : value / maxValue;
    const isDanger = !isCountdown && pct < 0.2;
    const isWarning = !isCountdown && pct < 0.4 && !isDanger;

    const color = isDanger ? '#EF4444' : isWarning ? '#F59E0B' : '#2DD4BF';
    const glowIntensity = isDanger ? 0.6 : isWarning ? 0.3 : 0.15;

    if (isCountdown) {
        return (
            <div className="flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={value}
                        initial={{ scale: 2.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="text-[140px] leading-none font-display font-bold tabular-nums"
                        style={{
                            color,
                            textShadow: `0 0 40px ${color}60, 0 0 80px ${color}30`,
                        }}
                    >
                        {value === 0 ? 'GO!' : value}
                    </motion.div>
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <AnimatePresence mode="wait">
                <motion.span
                    key={value}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 10, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-[80px] leading-none font-display font-bold tabular-nums"
                    style={{
                        color,
                        textShadow: `0 0 40px ${color}${Math.round(glowIntensity * 255).toString(16).padStart(2, '0')}`,
                    }}
                >
                    {value}
                </motion.span>
            </AnimatePresence>
            <span className="text-xs uppercase tracking-widest" style={{ color: `${color}99` }}>
                seconds
            </span>
            {/* Progress arc - optional subtle ring */}
            <motion.div
                className="w-20 h-1 rounded-full overflow-hidden"
                style={{ background: `${color}20` }}
            >
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: color, width: `${pct * 100}%` }}
                    animate={{ width: `${pct * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </motion.div>
        </div>
    );
}
