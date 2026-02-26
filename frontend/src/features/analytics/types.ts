// Learning Analytics Types

export type LearningEventKind =
    | 'dojo_challenge_completed'
    | 'flashcard_reviewed'
    | 'visualizer_run';

export interface SkillScore {
    name: string;
    score: number; // 0-100
    trend: 'up' | 'down' | 'stable';
    lastUpdated: number;
}

export interface DailyActivity {
    date: string; // YYYY-MM-DD (local day)
    challenges: number;
    flashcards: number;
    timeSpent: number; // minutes
}

export interface ChallengeResult {
    id: string;
    challengeType: string;
    score: number;
    completedAt: number;
    timeSpent: number; // minutes
    skills: string[];
}

export interface LegacyLearningMetricsSnapshot {
    totalChallengesCompleted?: number;
    totalFlashcardsReviewed?: number;
    totalTimeSpent?: number;
    averageScore?: number;
    currentStreak?: number;
    longestStreak?: number;
    lastActivityDate?: string;
    skillScores?: SkillScore[];
    weeklyActivity?: DailyActivity[];
    recentChallenges?: ChallengeResult[];
}

export interface LearningEvent {
    id: string;
    kind: LearningEventKind;
    timestamp: number;
    dayKeyLocal: string;
    payload: {
        challengeType?: string;
        score?: number;
        durationSec?: number;
        skills?: string[];
        count?: number;
        timeSpentSec?: number;
        success?: boolean;
        source?: 'dojo' | 'srs' | 'visualizer' | 'system';
    };
}

export interface LearningMetrics {
    // Overall stats
    totalChallengesCompleted: number;
    totalFlashcardsReviewed: number;
    totalTimeSpent: number; // minutes
    averageScore: number;
    totalXP: number;

    // Streaks
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string;

    // Quality / activity helpers
    reviewAccuracy: number;
    last7dTotal: number;
    hasAnyActivity: boolean;

    // Skill breakdown
    skillScores: SkillScore[];

    // Activity history
    weeklyActivity: DailyActivity[];
    recentChallenges: ChallengeResult[];
}

export const DEFAULT_SKILLS: SkillScore[] = [
    { name: 'Algorithms', score: 0, trend: 'stable', lastUpdated: 0 },
    { name: 'Data Structures', score: 0, trend: 'stable', lastUpdated: 0 },
    { name: 'Debugging', score: 0, trend: 'stable', lastUpdated: 0 },
    { name: 'Code Reading', score: 0, trend: 'stable', lastUpdated: 0 },
    { name: 'Big-O Analysis', score: 0, trend: 'stable', lastUpdated: 0 },
    { name: 'Design Patterns', score: 0, trend: 'stable', lastUpdated: 0 },
];
