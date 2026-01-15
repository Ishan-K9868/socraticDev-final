import { Achievement, RARITY_COLORS } from './types';
import { motion } from 'framer-motion';

interface AchievementCardProps {
    achievement: Achievement;
    unlocked: boolean;
}

function AchievementCard({ achievement, unlocked }: AchievementCardProps) {
    const colors = RARITY_COLORS[achievement.rarity];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: unlocked ? 1.05 : 1 }}
            className={`p-4 rounded-xl border transition-all ${unlocked
                    ? `${colors.bg} border-current ${colors.glow}`
                    : 'bg-[color:var(--color-bg-muted)] border-[color:var(--color-border)] opacity-50 grayscale'
                }`}
        >
            <div className="flex items-center gap-3">
                <span className={`text-3xl ${unlocked ? '' : 'filter grayscale'}`}>
                    {achievement.icon}
                </span>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${unlocked ? colors.text : ''}`}>
                            {achievement.name}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${colors.bg} ${colors.text}`}>
                            {achievement.rarity}
                        </span>
                    </div>
                    <p className="text-sm text-[color:var(--color-text-muted)]">
                        {achievement.description}
                    </p>
                </div>
                {unlocked && (
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                    >
                        🏆
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

export default AchievementCard;
