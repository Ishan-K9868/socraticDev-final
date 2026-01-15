// Learning Analytics Types

export interface SkillScore {
    name: string;
    score: number;        // 0-100
    trend: 'up' | 'down' | 'stable';
    lastUpdated: number;
}

export interface DailyActivity {
    date: string;        // YYYY-MM-DD
    challenges: number;
    flashcards: number;
    timeSpent: number;   // minutes
}

export interface ChallengeResult {
    id: string;
    challengeType: string;
    score: number;
    completedAt: number;
    timeSpent: number;
    skills: string[];
}

export interface LearningMetrics {
    // Overall stats
    totalChallengesCompleted: number;
    totalFlashcardsReviewed: number;
    totalTimeSpent: number;   // minutes
    averageScore: number;

    // Streaks
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string;

    // Skill breakdown
    skillScores: SkillScore[];

    // Activity history
    weeklyActivity: DailyActivity[];
    recentChallenges: ChallengeResult[];
}

export const DEFAULT_SKILLS: SkillScore[] = [
    { name: 'Algorithms', score: 0, trend: 'stable', lastUpdated: Date.now() },
    { name: 'Data Structures', score: 0, trend: 'stable', lastUpdated: Date.now() },
    { name: 'Debugging', score: 0, trend: 'stable', lastUpdated: Date.now() },
    { name: 'Code Reading', score: 0, trend: 'stable', lastUpdated: Date.now() },
    { name: 'Big-O Analysis', score: 0, trend: 'stable', lastUpdated: Date.now() },
    { name: 'Design Patterns', score: 0, trend: 'stable', lastUpdated: Date.now() },
];
