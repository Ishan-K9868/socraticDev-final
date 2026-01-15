import { useState, useEffect, useCallback } from 'react';
import { GamificationStats, LEAGUES, ACHIEVEMENTS, DailyQuest } from './types';

const STORAGE_KEY = 'socraticdev-gamification';

const generateDailyQuests = (): DailyQuest[] => {
    const questTemplates = [
        { type: 'challenges' as const, title: 'Challenge Champion', description: 'Complete {n} Dojo challenges', icon: '🎯', targets: [2, 3, 5] },
        { type: 'flashcards' as const, title: 'Card Shark', description: 'Review {n} flashcards', icon: '🃏', targets: [10, 15, 25] },
        { type: 'time' as const, title: 'Dedicated Learner', description: 'Spend {n} minutes learning', icon: '⏱️', targets: [15, 30, 45] },
        { type: 'streak' as const, title: 'Keep It Going', description: 'Maintain your streak', icon: '🔥', targets: [1, 1, 1] },
    ];

    // Pick 3 random quests
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
    questsResetAt: Date.now() + 24 * 60 * 60 * 1000,
});

export function useGamification() {
    const [stats, setStats] = useState<GamificationStats>(getDefaultStats());
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Check if quests need to be reset
                if (parsed.questsResetAt < Date.now()) {
                    parsed.dailyQuests = generateDailyQuests();
                    parsed.questsResetAt = Date.now() + 24 * 60 * 60 * 1000;
                }
                setStats({ ...getDefaultStats(), ...parsed });
            }
        } catch (e) {
            console.error('Error loading gamification data:', e);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
        }
    }, [stats, isLoaded]);

    // Calculate current league
    const getCurrentLeague = useCallback(() => {
        const league = [...LEAGUES].reverse().find(l => stats.totalXP >= l.minXP);
        return league || LEAGUES[0];
    }, [stats.totalXP]);

    // Calculate progress to next league
    const getLeagueProgress = useCallback(() => {
        const current = getCurrentLeague();
        const currentIdx = LEAGUES.findIndex(l => l.tier === current.tier);
        const next = LEAGUES[currentIdx + 1];

        if (!next) return { progress: 100, nextLeague: null };

        const xpInLeague = stats.totalXP - current.minXP;
        const xpNeeded = next.minXP - current.minXP;
        const progress = Math.min(100, (xpInLeague / xpNeeded) * 100);

        return { progress, nextLeague: next };
    }, [stats.totalXP, getCurrentLeague]);

    // Award XP
    const awardXP = useCallback((amount: number) => {
        setStats(prev => {
            const newTotal = prev.totalXP + amount;
            const newWeekly = prev.weeklyXP + amount;
            const newLeague = [...LEAGUES].reverse().find(l => newTotal >= l.minXP)?.tier || 'bronze';

            return {
                ...prev,
                totalXP: newTotal,
                weeklyXP: newWeekly,
                currentLeague: newLeague,
            };
        });
    }, []);

    // Update quest progress
    const updateQuestProgress = useCallback((type: DailyQuest['type'], increment: number = 1) => {
        setStats(prev => {
            const updatedQuests = prev.dailyQuests.map(quest => {
                if (quest.type === type && !quest.completed) {
                    const newCurrent = Math.min(quest.current + increment, quest.target);
                    const completed = newCurrent >= quest.target;
                    return { ...quest, current: newCurrent, completed };
                }
                return quest;
            });

            // Award XP for completed quests
            const newlyCompleted = updatedQuests.filter(
                (q, i) => q.completed && !prev.dailyQuests[i].completed
            );
            const bonusXP = newlyCompleted.reduce((sum, q) => sum + q.xpReward, 0);

            return {
                ...prev,
                dailyQuests: updatedQuests,
                totalXP: prev.totalXP + bonusXP,
                weeklyXP: prev.weeklyXP + bonusXP,
            };
        });
    }, []);

    // Check and unlock achievements
    const checkAchievements = useCallback((metrics: { challenges?: number; flashcards?: number; streak?: number; xp?: number }) => {
        setStats(prev => {
            const newUnlocked: string[] = [];

            ACHIEVEMENTS.forEach(achievement => {
                if (prev.unlockedAchievements.includes(achievement.id)) return;

                const value = metrics[achievement.condition.type as keyof typeof metrics] || 0;
                if (value >= achievement.condition.value) {
                    newUnlocked.push(achievement.id);
                }
            });

            if (newUnlocked.length === 0) return prev;

            return {
                ...prev,
                unlockedAchievements: [...prev.unlockedAchievements, ...newUnlocked],
            };
        });
    }, []);

    // Get unlocked achievements with details
    const getUnlockedAchievements = useCallback(() => {
        return ACHIEVEMENTS.filter(a => stats.unlockedAchievements.includes(a.id));
    }, [stats.unlockedAchievements]);

    // Get locked achievements
    const getLockedAchievements = useCallback(() => {
        return ACHIEVEMENTS.filter(a => !stats.unlockedAchievements.includes(a.id));
    }, [stats.unlockedAchievements]);

    return {
        stats,
        isLoaded,
        getCurrentLeague,
        getLeagueProgress,
        awardXP,
        updateQuestProgress,
        checkAchievements,
        getUnlockedAchievements,
        getLockedAchievements,
    };
}
