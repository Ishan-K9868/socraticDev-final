import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGamification } from './useGamification';
import { LEAGUES, ACHIEVEMENTS } from './types';
import DailyQuestCard from './DailyQuestCard';
import AchievementCard from './AchievementCard';
import ThemeToggle from '../../components/ThemeToggle';

function GamificationHub() {
    const {
        stats,
        isLoaded,
        lastSyncedAt,
        getCurrentLeague,
        getLeagueProgress,
        getUnlockedAchievements,
        getLockedAchievements,
    } = useGamification();

    const currentLeague = getCurrentLeague();
    const { progress, nextLeague } = getLeagueProgress();
    const unlockedAchievements = getUnlockedAchievements();
    const lockedAchievements = getLockedAchievements();

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)]">
            {/* Header */}
            <header className="border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)]">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/learn"
                            className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)] transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-display font-bold flex items-center gap-2">
                                <span className="text-2xl">🏆</span>
                                Achievements & Leagues
                            </h1>
                            <p className="text-sm text-[color:var(--color-text-muted)]">
                                Track your progress and earn rewards
                            </p>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8">
                <div className="mb-4 text-xs text-[color:var(--color-text-muted)] text-right">
                    Last synced: {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : 'Not synced yet'}
                </div>
                {/* League Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-8 rounded-2xl bg-gradient-to-br ${currentLeague.gradient} border border-[color:var(--color-border)] mb-8`}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <span className="text-5xl">{currentLeague.icon}</span>
                            <div>
                                <div className="text-sm text-[color:var(--color-text-muted)]">Current League</div>
                                <div className={`text-3xl font-bold ${currentLeague.color}`}>
                                    {currentLeague.name}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-[color:var(--color-text-muted)]">Total XP</div>
                            <div className="text-2xl font-bold">{stats.totalXP.toLocaleString()}</div>
                        </div>
                    </div>

                    {nextLeague && (
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className={currentLeague.color}>{currentLeague.name}</span>
                                <span className={nextLeague.color}>{nextLeague.name} {nextLeague.icon}</span>
                            </div>
                            <div className="h-3 bg-[color:var(--color-bg-primary)]/50 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1 }}
                                />
                            </div>
                            <div className="text-xs text-[color:var(--color-text-muted)] mt-2 text-center">
                                {nextLeague.minXP - stats.totalXP} XP to {nextLeague.name}
                            </div>
                        </div>
                    )}
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Daily Quests */}
                    <div>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span>📋</span> Daily Quests
                        </h2>
                        <div className="space-y-3">
                            {stats.dailyQuests.map((quest) => (
                                <DailyQuestCard key={quest.id} quest={quest} />
                            ))}
                        </div>
                        <p className="text-xs text-[color:var(--color-text-muted)] mt-3 text-center">
                            Quests reset daily at midnight
                        </p>
                    </div>

                    {/* All Leagues */}
                    <div>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span>🎖️</span> League Tiers
                        </h2>
                        <div className="space-y-2">
                            {LEAGUES.map(league => {
                                const isUnlocked = stats.totalXP >= league.minXP;
                                const isCurrent = league.tier === currentLeague.tier;

                                return (
                                    <div
                                        key={league.tier}
                                        className={`p-3 rounded-lg flex items-center gap-3 transition-all ${isCurrent
                                            ? `bg-gradient-to-r ${league.gradient} border border-current`
                                            : isUnlocked
                                                ? 'bg-[color:var(--color-bg-secondary)]'
                                                : 'bg-[color:var(--color-bg-muted)] opacity-50'
                                            }`}
                                    >
                                        <span className="text-2xl">{league.icon}</span>
                                        <div className="flex-1">
                                            <span className={`font-medium ${isCurrent ? league.color : ''}`}>
                                                {league.name}
                                            </span>
                                        </div>
                                        <span className="text-sm text-[color:var(--color-text-muted)]">
                                            {league.minXP.toLocaleString()} XP
                                        </span>
                                        {isCurrent && <span className="text-green-400">✓</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Achievements */}
                <div className="mt-8">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span>🏅</span> Achievements ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
                    </h2>

                    {unlockedAchievements.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm text-[color:var(--color-text-muted)] mb-3">Unlocked</h3>
                            <div className="grid md:grid-cols-2 gap-3">
                                {unlockedAchievements.map(achievement => (
                                    <AchievementCard key={achievement.id} achievement={achievement} unlocked={true} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm text-[color:var(--color-text-muted)] mb-3">Locked</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                            {lockedAchievements.slice(0, 8).map(achievement => (
                                <AchievementCard key={achievement.id} achievement={achievement} unlocked={false} />
                            ))}
                        </div>
                        {lockedAchievements.length > 8 && (
                            <p className="text-center text-sm text-[color:var(--color-text-muted)] mt-4">
                                + {lockedAchievements.length - 8} more achievements to discover
                            </p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default GamificationHub;
