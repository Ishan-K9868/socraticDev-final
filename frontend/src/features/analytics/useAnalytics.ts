import { useState, useEffect, useCallback } from 'react';
import { LearningMetrics, DailyActivity, ChallengeResult, DEFAULT_SKILLS } from './types';

const STORAGE_KEY = 'socraticdev-analytics';

const getDefaultMetrics = (): LearningMetrics => ({
    totalChallengesCompleted: 0,
    totalFlashcardsReviewed: 0,
    totalTimeSpent: 0,
    averageScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: '',
    skillScores: DEFAULT_SKILLS,
    weeklyActivity: [],
    recentChallenges: [],
});

export function useAnalytics() {
    const [metrics, setMetrics] = useState<LearningMetrics>(getDefaultMetrics());
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setMetrics({ ...getDefaultMetrics(), ...JSON.parse(saved) });
            }
        } catch (e) {
            console.error('Error loading analytics:', e);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
        }
    }, [metrics, isLoaded]);

    // Record a challenge completion
    const recordChallenge = useCallback((result: Omit<ChallengeResult, 'id'>) => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        setMetrics(prev => {
            // Update totals
            const totalChallenges = prev.totalChallengesCompleted + 1;
            const avgScore = ((prev.averageScore * prev.totalChallengesCompleted) + result.score) / totalChallenges;
            const totalTime = prev.totalTimeSpent + result.timeSpent;

            // Update streak
            let currentStreak = prev.currentStreak;
            if (prev.lastActivityDate !== today) {
                const lastDate = new Date(prev.lastActivityDate);
                const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    currentStreak += 1;
                } else if (diffDays > 1) {
                    currentStreak = 1;
                }
            }

            // Update skill scores based on challenge result
            const updatedSkills = prev.skillScores.map(skill => {
                if (result.skills.includes(skill.name)) {
                    const newScore = Math.min(100, skill.score + (result.score * 0.1));
                    return {
                        ...skill,
                        score: newScore,
                        trend: newScore > skill.score ? 'up' as const : skill.trend,
                        lastUpdated: Date.now(),
                    };
                }
                return skill;
            });

            // Update weekly activity
            const weeklyActivity = [...prev.weeklyActivity];
            const todayActivity = weeklyActivity.find(a => a.date === today);
            if (todayActivity) {
                todayActivity.challenges += 1;
                todayActivity.timeSpent += result.timeSpent;
            } else {
                weeklyActivity.push({
                    date: today,
                    challenges: 1,
                    flashcards: 0,
                    timeSpent: result.timeSpent,
                });
            }
            // Keep only last 7 days
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const filteredActivity = weeklyActivity.filter(a => a.date >= weekAgo);

            // Add to recent challenges
            const newChallenge: ChallengeResult = {
                id: `ch_${Date.now()}`,
                ...result,
            };
            const recentChallenges = [newChallenge, ...prev.recentChallenges].slice(0, 20);

            return {
                ...prev,
                totalChallengesCompleted: totalChallenges,
                totalTimeSpent: totalTime,
                averageScore: avgScore,
                currentStreak,
                longestStreak: Math.max(prev.longestStreak, currentStreak),
                lastActivityDate: today,
                skillScores: updatedSkills,
                weeklyActivity: filteredActivity,
                recentChallenges,
            };
        });
    }, []);

    // Record flashcard review
    const recordFlashcardReview = useCallback((count: number = 1) => {
        const today = new Date().toISOString().split('T')[0];

        setMetrics(prev => {
            const weeklyActivity = [...prev.weeklyActivity];
            const todayActivity = weeklyActivity.find(a => a.date === today);
            if (todayActivity) {
                todayActivity.flashcards += count;
            } else {
                weeklyActivity.push({
                    date: today,
                    challenges: 0,
                    flashcards: count,
                    timeSpent: 0,
                });
            }

            return {
                ...prev,
                totalFlashcardsReviewed: prev.totalFlashcardsReviewed + count,
                weeklyActivity,
            };
        });
    }, []);

    // Get activity for a specific date range
    const getActivityRange = useCallback((days: number): DailyActivity[] => {
        const now = new Date();
        const result: DailyActivity[] = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const activity = metrics.weeklyActivity.find(a => a.date === dateStr);
            result.push(activity || {
                date: dateStr,
                challenges: 0,
                flashcards: 0,
                timeSpent: 0,
            });
        }

        return result;
    }, [metrics.weeklyActivity]);

    // Calculate level from total XP
    const getLevel = useCallback(() => {
        const xp = metrics.totalChallengesCompleted * 100 + metrics.totalFlashcardsReviewed * 10;
        const level = Math.floor(Math.sqrt(xp / 100)) + 1;
        const currentLevelXp = Math.pow(level - 1, 2) * 100;
        const nextLevelXp = Math.pow(level, 2) * 100;
        const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

        return { level, xp, progress, nextLevelXp };
    }, [metrics.totalChallengesCompleted, metrics.totalFlashcardsReviewed]);

    return {
        metrics,
        isLoaded,
        recordChallenge,
        recordFlashcardReview,
        getActivityRange,
        getLevel,
    };
}
