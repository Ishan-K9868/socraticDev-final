import { DailyQuest } from './types';
import { motion } from 'framer-motion';

interface DailyQuestCardProps {
    quest: DailyQuest;
}

function DailyQuestCard({ quest }: DailyQuestCardProps) {
    const progress = (quest.current / quest.target) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-4 rounded-xl border transition-all ${quest.completed
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-[color:var(--color-bg-secondary)] border-[color:var(--color-border)]'
                }`}
        >
            <div className="flex items-center gap-3">
                <span className="text-2xl">{quest.icon}</span>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${quest.completed ? 'text-green-400' : ''}`}>
                            {quest.title}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400">
                            +{quest.xpReward} XP
                        </span>
                    </div>
                    <p className="text-sm text-[color:var(--color-text-muted)] mb-2">
                        {quest.description}
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-[color:var(--color-bg-muted)] rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full ${quest.completed ? 'bg-green-500' : 'bg-primary-500'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        <span className="text-xs text-[color:var(--color-text-muted)]">
                            {quest.current}/{quest.target}
                        </span>
                    </div>
                </div>
                {quest.completed && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-2xl"
                    >
                        ✅
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

export default DailyQuestCard;
