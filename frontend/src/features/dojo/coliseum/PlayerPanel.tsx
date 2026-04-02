import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ColiseumPlayer, RoundType } from './coliseumTypes';
import { ICON_GEM } from './coliseumIcons';

interface PlayerPanelProps {
    player: ColiseumPlayer;
    roundType: RoundType;
    typingLines: string[];
    isActive: boolean;
    position: number; // 0-3 grid position
}

const RANK_COLORS: Record<string, string> = {
    Bronze: '#CD7F32',
    Silver: '#9CA3AF',
    Gold: '#F59E0B',
    Diamond: '#8B5CF6',
};

export default function PlayerPanel({ player, roundType, typingLines, isActive }: PlayerPanelProps) {
    const visibleLines = useMemo(() => {
        return typingLines.slice(0, player.typedLines);
    }, [typingLines, player.typedLines]);

    const borderGlow = player.isEliminated
        ? 'rgba(107, 114, 128, 0.3)'
        : isActive
            ? `${player.hexColor}60`
            : `${player.hexColor}30`;

    const progressColor = player.isEliminated ? '#6B7280' : player.hexColor;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
                opacity: player.isEliminated ? 0.4 : 1,
                scale: 1,
                filter: player.isEliminated ? 'grayscale(0.8)' : 'grayscale(0)',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative h-full rounded-xl overflow-hidden border"
            style={{
                background: 'var(--color-bg-secondary)',
                borderColor: borderGlow,
                boxShadow: player.isEliminated
                    ? 'none'
                    : `0 0 30px ${player.hexColor}15, inset 0 1px 0 ${player.hexColor}10`,
            }}
        >
            {/* Top accent line */}
            <div className="h-1 w-full" style={{ background: player.isEliminated ? '#6B7280' : player.hexColor }} />

            {/* Player Info Header */}
            <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: `${player.hexColor}20` }}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill={player.hexColor}>
                            <path d={player.avatar} />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold" style={{ color: player.isEliminated ? '#6B7280' : 'var(--color-text-primary)' }}>
                            {player.name}
                        </h4>
                        <span className="text-[10px] uppercase tracking-wider flex items-center gap-1" style={{ color: player.hexColor }}>
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill={RANK_COLORS[player.rank] || player.hexColor}>
                                <path d={ICON_GEM} />
                            </svg>
                            {player.rank}
                        </span>
                    </div>
                </div>

                {/* Score */}
                <div className="text-right">
                    <span className="text-lg font-bold tabular-nums" style={{ color: player.hexColor }}>
                        {player.score}
                    </span>
                    <span className="text-[10px] block uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                        pts
                    </span>
                </div>
            </div>

            {/* Code Display */}
            <div className="px-4 py-3 font-mono text-[11px] leading-relaxed space-y-1 min-h-[100px]" style={{ color: 'var(--color-text-muted)' }}>
                {visibleLines.map((line, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-start gap-2"
                    >
                        <span className="opacity-40 select-none w-4 text-right flex-shrink-0">{i + 1}</span>
                        <span style={{ color: player.hexColor }}>{line}</span>
                    </motion.div>
                ))}
                {!player.isEliminated && isActive && (
                    <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-2 h-4 ml-6"
                        style={{ background: player.hexColor }}
                    />
                )}
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
                <div className="flex items-center justify-between text-[10px] mb-1" style={{ color: 'var(--color-text-muted)' }}>
                    <span>
                        {roundType === 'bug-hunt' && `${player.bugsFound}/${player.totalBugs} bugs`}
                        {roundType === 'optimize' && `${Math.round(player.progress)}% optimized`}
                        {roundType === 'eli5-duel' && `${Math.round(player.progress)}% explained`}
                    </span>
                    <span>{Math.round(player.progress)}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${progressColor}20` }}>
                    <motion.div
                        className="h-full rounded-full"
                        style={{ background: progressColor }}
                        animate={{ width: `${player.progress}%` }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* Eliminated overlay */}
            {player.isEliminated && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                >
                    <motion.span
                        initial={{ scale: 3, rotate: -15, opacity: 0 }}
                        animate={{ scale: 1, rotate: -6, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="text-2xl font-display font-bold uppercase tracking-widest px-6 py-2 rounded-xl border-2 border-red-500 text-red-500"
                    >
                        ELIMINATED
                    </motion.span>
                </motion.div>
            )}
        </motion.div>
    );
}
