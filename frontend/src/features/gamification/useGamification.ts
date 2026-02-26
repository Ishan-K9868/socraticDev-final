import { useState, useEffect, useCallback } from 'react';
import { GamificationStats, LEAGUES, ACHIEVEMENTS, DailyQuest } from './types';
import { useAnalytics } from '../analytics/useAnalytics';

const STORAGE_KEY = 'socraticdev-gamification';
const DAY_MS = 24 * 60 * 60 * 1000;

const generateDailyQuests = (): DailyQuest[] => {
    const questTemplates = [
        { type: 'challenges' as const, title: 'Challenge Champion', description: 'Complete {n} Dojo challenges', icon: '🎯', targets: [2, 3, 5] },
        { type: 'flashcards' as const, title: 'Card Shark', description: 'Review {n} flashcards', icon: '🃏', targets: [10, 15, 25] },
        { type: 'time' as const, title: 'Dedicated Learner', description: 'Spend {n} minutes learning', icon: '⏱️', targets: [15, 30, 45] },
        { type: 'streak' as const, title: 'Keep It Going', description: 'Maintain your streak', icon: '🔥', targets: [1, 1, 1] },
    ];

    const shuffled = [...questTemplates].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    return selected.map((template, i) => {
        const target = template.targets[Math.floor(Math.random() * template.targets.length)];
        const xpReward = target * 10 + (i + 1) * 5;
        return {
            id: `quest_${Date.now()}_${i}`,
            title: template.title,
            description: template.description.replace('{n}', target.toString()),
            icon: template.icon,
            type: template.type,
            target,
            current: 0,
            xpReward,
            completed: false,
        };
    });
};

const getDefaultStats = (): GamificationStats => ({
    totalXP: 0,
    currentLeague: 'bronze',
    weeklyXP: 0,
    dailyQuests: generateDailyQuests(),
    unlockedAchievements: [],
    questsResetAt: Date.now() + DAY_MS,
});

function getUniqueDojoTypes(events: { kind: string; payload: { challengeType?: string } }[]): number {
    const types = new Set<string>();
    events.forEach((event) => {
        if (event.kind === 'dojo_challenge_completed' && event.payload.challengeType) {
            types.add(event.payload.challengeType);
        }
    });
    return types.size;
}

export function useGamification() {
    const { metrics, events } = useAnalytics();
    const [stats, setStats] = useState<GamificationStats>(getDefaultStats());
    const [isLoaded, setIsLoaded] = useState(false);
    const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved) as Partial<GamificationStats>;
                const needsQuestReset = Number(parsed.questsResetAt || 0) < Date.now();
                setStats({
                    ...getDefaultStats(),
                    ...parsed,
                    dailyQuests: needsQuestReset ? generateDailyQuests() : (parsed.dailyQuests || generateDailyQuests()),
                    questsResetAt: needsQuestReset ? Date.now() + DAY_MS : Number(parsed.questsResetAt || Date.now() + DAY_MS),
                });
            } else {
                setStats(getDefaultStats());
            }
        } catch (e) {
            console.error('Error loading gamification data:', e);
            setStats(getDefaultStats());
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    }, [stats, isLoaded]);

    useEffect(() => {
        if (!isLoaded) return;

        const totalXP = metrics.totalXP;
        const currentLeague = [...LEAGUES].reverse().find((league) => totalXP >= league.minXP)?.tier || 'bronze';
        const weekStart = Date.now() - (7 * DAY_MS);
        const weeklyXP = events
            .filter((event) => event.timestamp >= weekStart)
            .reduce((sum, event) => {
                if (event.kind === 'dojo_challenge_completed') {
                    const count = Math.max(1, Number(event.payload.count || 1));
                    return sum + count * 100;
                }
                if (event.kind === 'flashcard_reviewed') {
                    const count = Math.max(1, Number(event.payload.count || 1));
                    return sum + count * 10;
                }
                return sum;
            }, 0);

        const challengeCount = metrics.totalChallengesCompleted;
        const flashcardCount = metrics.totalFlashcardsReviewed;
        const streak = metrics.currentStreak;
        const dojoTypes = getUniqueDojoTypes(events);

        setStats((prev) => {
            const newUnlocked = [...prev.unlockedAchievements];
            ACHIEVEMENTS.forEach((achievement) => {
                if (newUnlocked.includes(achievement.id)) return;
                const type = achievement.condition.type;
                const threshold = achievement.condition.value;

                const value = type === 'challenges'
                    ? challengeCount
                    : type === 'flashcards'
                        ? flashcardCount
                        : type === 'streak'
                            ? streak
                            : type === 'xp'
                                ? totalXP
                                : type === 'dojo_types'
                                    ? dojoTypes
                                    : 0;

                if (value >= threshold) {
                    newUnlocked.push(achievement.id);
                }
            });

            const resetQuests = prev.questsResetAt < Date.now();
            const baseQuests = resetQuests ? generateDailyQuests() : prev.dailyQuests;
            const updatedQuests = baseQuests.map((quest) => {
                const current = quest.type === 'challenges'
                    ? challengeCount
                    : quest.type === 'flashcards'
                        ? flashcardCount
                        : quest.type === 'streak'
                            ? streak
                            : Math.round(metrics.totalTimeSpent);
                const normalized = Math.min(current, quest.target);
                return {
                    ...quest,
                    current: normalized,
                    completed: normalized >= quest.target,
                };
            });

            return {
                ...prev,
                totalXP,
                weeklyXP,
                currentLeague,
                dailyQuests: updatedQuests,
                unlockedAchievements: newUnlocked,
                questsResetAt: resetQuests ? Date.now() + DAY_MS : prev.questsResetAt,
            };
        });

        setLastSyncedAt(Date.now());
    }, [events, isLoaded, metrics.currentStreak, metrics.totalChallengesCompleted, metrics.totalFlashcardsReviewed, metrics.totalTimeSpent, metrics.totalXP]);

    const getCurrentLeague = useCallback(() => {
        return LEAGUES.find((league) => league.tier === stats.currentLeague) || LEAGUES[0];
    }, [stats.currentLeague]);

    const getLeagueProgress = useCallback(() => {
        const current = getCurrentLeague();
        const currentIdx = LEAGUES.findIndex((league) => league.tier === current.tier);
        const next = LEAGUES[currentIdx + 1];

        if (!next) return { progress: 100, nextLeague: null };

        const xpInLeague = stats.totalXP - current.minXP;
        const xpNeeded = next.minXP - current.minXP;
        const progress = Math.min(100, (xpInLeague / Math.max(1, xpNeeded)) * 100);

        return { progress, nextLeague: next };
    }, [getCurrentLeague, stats.totalXP]);

    const getUnlockedAchievements = useCallback(() => {
        return ACHIEVEMENTS.filter((achievement) => stats.unlockedAchievements.includes(achievement.id));
    }, [stats.unlockedAchievements]);

    const getLockedAchievements = useCallback(() => {
        return ACHIEVEMENTS.filter((achievement) => !stats.unlockedAchievements.includes(achievement.id));
    }, [stats.unlockedAchievements]);

    return {
        stats,
        isLoaded,
        lastSyncedAt,
        getCurrentLeague,
        getLeagueProgress,
        getUnlockedAchievements,
        getLockedAchievements,
    };
}
