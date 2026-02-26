import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    ChallengeResult,
    DailyActivity,
    DEFAULT_SKILLS,
    LegacyLearningMetricsSnapshot,
    LearningEvent,
    LearningMetrics,
    SkillScore,
} from './types';

const EVENTS_KEY = 'socraticdev-learning-events';
const SNAPSHOT_KEY = 'socraticdev-analytics';
const SCHEMA_VERSION_KEY = 'analytics_schema_version';
const SCHEMA_VERSION = 2;
const MAX_EVENTS = 1200;

const DAY_MS = 24 * 60 * 60 * 1000;

function toLocalDayKey(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseDayKey(dayKey: string): Date | null {
    const parts = dayKey.split('-').map((part) => Number(part));
    if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
}

function dayDiff(a: Date, b: Date): number {
    const start = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
    const end = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
    return Math.round((end - start) / DAY_MS);
}

function safeParse<T>(raw: string | null): T | null {
    if (!raw) return null;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

function normalizeSkills(input: string[] | undefined): string[] {
    if (!Array.isArray(input)) return [];
    return input
        .map((item) => String(item).trim())
        .filter(Boolean);
}

function sanitizeEvent(event: Partial<LearningEvent>): LearningEvent | null {
    if (!event || typeof event !== 'object') return null;
    if (typeof event.kind !== 'string') return null;

    const supportedKinds = new Set(['dojo_challenge_completed', 'flashcard_reviewed', 'visualizer_run']);
    if (!supportedKinds.has(event.kind)) return null;

    const timestamp = Number.isFinite(Number(event.timestamp)) ? Number(event.timestamp) : Date.now();
    const dayKeyLocal = typeof event.dayKeyLocal === 'string' && event.dayKeyLocal
        ? event.dayKeyLocal
        : toLocalDayKey(timestamp);

    const payload = event.payload && typeof event.payload === 'object' ? event.payload : {};
    const count = Number.isFinite(Number(payload.count)) ? Math.max(0, Number(payload.count)) : undefined;
    const score = Number.isFinite(Number(payload.score)) ? Number(payload.score) : undefined;
    const durationSec = Number.isFinite(Number(payload.durationSec)) ? Math.max(0, Number(payload.durationSec)) : undefined;
    const timeSpentSec = Number.isFinite(Number(payload.timeSpentSec)) ? Math.max(0, Number(payload.timeSpentSec)) : undefined;

    return {
        id: typeof event.id === 'string' && event.id ? event.id : `evt_${timestamp}_${Math.random().toString(36).slice(2, 9)}`,
        kind: event.kind as LearningEvent['kind'],
        timestamp,
        dayKeyLocal,
        payload: {
            challengeType: typeof payload.challengeType === 'string' ? payload.challengeType : undefined,
            score,
            durationSec,
            skills: normalizeSkills(payload.skills as string[] | undefined),
            count,
            timeSpentSec,
            success: typeof payload.success === 'boolean' ? payload.success : undefined,
            source: payload.source === 'dojo' || payload.source === 'srs' || payload.source === 'visualizer' || payload.source === 'system'
                ? payload.source
                : undefined,
        },
    };
}

function getDefaultMetrics(): LearningMetrics {
    return {
        totalChallengesCompleted: 0,
        totalFlashcardsReviewed: 0,
        totalTimeSpent: 0,
        averageScore: 0,
        totalXP: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: '',
        reviewAccuracy: 0,
        last7dTotal: 0,
        hasAnyActivity: false,
        skillScores: DEFAULT_SKILLS.map((skill) => ({ ...skill, lastUpdated: Date.now() })),
        weeklyActivity: [],
        recentChallenges: [],
    };
}

function getCurrentStreak(dayKeys: string[]): number {
    if (!dayKeys.length) return 0;
    const unique = Array.from(new Set(dayKeys));
    const daySet = new Set(unique);
    const today = new Date();
    let streak = 0;

    while (true) {
        const checkDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - streak);
        const key = toLocalDayKey(checkDate.getTime());
        if (!daySet.has(key)) break;
        streak += 1;
    }

    return streak;
}

function getLongestStreak(dayKeys: string[]): number {
    if (!dayKeys.length) return 0;
    const uniqueDates = Array.from(new Set(dayKeys))
        .map(parseDayKey)
        .filter((date): date is Date => date !== null)
        .sort((a, b) => a.getTime() - b.getTime());

    if (!uniqueDates.length) return 0;

    let current = 1;
    let longest = 1;
    for (let i = 1; i < uniqueDates.length; i += 1) {
        const diff = dayDiff(uniqueDates[i - 1], uniqueDates[i]);
        if (diff === 1) {
            current += 1;
            longest = Math.max(longest, current);
        } else if (diff > 1) {
            current = 1;
        }
    }

    return longest;
}

function buildWeeklyActivity(events: LearningEvent[]): DailyActivity[] {
    const today = new Date();
    const days: DailyActivity[] = [];

    for (let i = 6; i >= 0; i -= 1) {
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
        const dayKey = toLocalDayKey(date.getTime());
        const activity: DailyActivity = {
            date: dayKey,
            challenges: 0,
            flashcards: 0,
            timeSpent: 0,
        };

        events.forEach((event) => {
            if (event.dayKeyLocal !== dayKey) return;
            if (event.kind === 'dojo_challenge_completed') {
                activity.challenges += Math.max(1, event.payload.count || 1);
                activity.timeSpent += Math.round((event.payload.durationSec || 0) / 60);
            }
            if (event.kind === 'flashcard_reviewed') {
                activity.flashcards += Math.max(1, event.payload.count || 1);
            }
        });

        days.push(activity);
    }

    return days;
}

function deriveMetrics(events: LearningEvent[]): LearningMetrics {
    const base = getDefaultMetrics();
    if (!events.length) return base;

    const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);
    const challengeEvents = sortedEvents.filter((event) => event.kind === 'dojo_challenge_completed');
    const flashcardEvents = sortedEvents.filter((event) => event.kind === 'flashcard_reviewed');

    const totalChallengesCompleted = challengeEvents.reduce(
        (sum, event) => sum + Math.max(1, event.payload.count || 1),
        0,
    );
    const totalFlashcardsReviewed = flashcardEvents.reduce(
        (sum, event) => sum + Math.max(1, event.payload.count || 1),
        0,
    );
    const totalTimeSpentSec = challengeEvents.reduce(
        (sum, event) => sum + (event.payload.durationSec || 0),
        0,
    );

    const scoredChallenges = challengeEvents.filter((event) => Number.isFinite(event.payload.score));
    const weightedScoreSum = scoredChallenges.reduce((sum, event) => {
        const score = event.payload.score || 0;
        const count = Math.max(1, event.payload.count || 1);
        return sum + score * count;
    }, 0);
    const weightedScoreCount = scoredChallenges.reduce(
        (sum, event) => sum + Math.max(1, event.payload.count || 1),
        0,
    );
    const averageScore = weightedScoreCount > 0 ? weightedScoreSum / weightedScoreCount : 0;

    const dayKeys = sortedEvents.map((event) => event.dayKeyLocal);
    const uniqueDayKeys = Array.from(new Set(dayKeys));
    const lastActivityDate = uniqueDayKeys[uniqueDayKeys.length - 1] || '';
    const currentStreak = getCurrentStreak(dayKeys);
    const longestStreak = getLongestStreak(dayKeys);

    const skillTotals = new Map<string, { count: number; weightedScore: number; lastUpdated: number; hasRecent: boolean }>();
    DEFAULT_SKILLS.forEach((skill) => {
        skillTotals.set(skill.name, { count: 0, weightedScore: 0, lastUpdated: 0, hasRecent: false });
    });

    const sevenDaysAgo = Date.now() - 7 * DAY_MS;
    challengeEvents.forEach((event) => {
        const skills = normalizeSkills(event.payload.skills);
        if (!skills.length) return;
        const score = Math.max(0, Math.min(100, event.payload.score || 0));
        const count = Math.max(1, event.payload.count || 1);

        skills.forEach((skillName) => {
            if (!skillTotals.has(skillName)) {
                skillTotals.set(skillName, { count: 0, weightedScore: 0, lastUpdated: 0, hasRecent: false });
            }
            const existing = skillTotals.get(skillName)!;
            existing.count += count;
            existing.weightedScore += score * count;
            existing.lastUpdated = Math.max(existing.lastUpdated, event.timestamp);
            existing.hasRecent = existing.hasRecent || event.timestamp >= sevenDaysAgo;
            skillTotals.set(skillName, existing);
        });
    });

    const skillScores: SkillScore[] = Array.from(skillTotals.entries()).map(([name, entry]) => {
        const score = entry.count > 0
            ? Math.max(0, Math.min(100, entry.weightedScore / entry.count))
            : 0;
        return {
            name,
            score,
            trend: entry.hasRecent && score > 0 ? 'up' : 'stable',
            lastUpdated: entry.lastUpdated || Date.now(),
        };
    });

    const recentChallenges: ChallengeResult[] = challengeEvents
        .slice(-20)
        .reverse()
        .map((event) => ({
            id: event.id,
            challengeType: event.payload.challengeType || 'unknown',
            score: event.payload.score || 0,
            completedAt: event.timestamp,
            timeSpent: Math.round((event.payload.durationSec || 0) / 60),
            skills: normalizeSkills(event.payload.skills),
        }));

    const reviewOutcomeEvents = flashcardEvents.filter((event) => typeof event.payload.success === 'boolean');
    const reviewAccuracy = reviewOutcomeEvents.length > 0
        ? Math.round((reviewOutcomeEvents.filter((event) => event.payload.success).length / reviewOutcomeEvents.length) * 100)
        : 0;

    const weeklyActivity = buildWeeklyActivity(sortedEvents);
    const last7dTotal = weeklyActivity.reduce((sum, day) => sum + day.challenges + day.flashcards, 0);
    const totalXP = totalChallengesCompleted * 100 + totalFlashcardsReviewed * 10;

    return {
        totalChallengesCompleted,
        totalFlashcardsReviewed,
        totalTimeSpent: Math.round(totalTimeSpentSec / 60),
        averageScore,
        totalXP,
        currentStreak,
        longestStreak,
        lastActivityDate,
        reviewAccuracy,
        last7dTotal,
        hasAnyActivity: sortedEvents.length > 0,
        skillScores,
        weeklyActivity,
        recentChallenges,
    };
}

function buildMigrationEvents(snapshot: LegacyLearningMetricsSnapshot): LearningEvent[] {
    const now = Date.now();
    const migratedAt = now - 1000;
    const events: LearningEvent[] = [];

    const challenges = Math.max(0, Number(snapshot.totalChallengesCompleted || 0));
    const flashcards = Math.max(0, Number(snapshot.totalFlashcardsReviewed || 0));
    const avgScore = Math.max(0, Math.min(100, Number(snapshot.averageScore || 0)));
    const totalTimeMinutes = Math.max(0, Number(snapshot.totalTimeSpent || 0));

    const referenceTimestamp = snapshot.lastActivityDate
        ? (() => {
            const parsed = parseDayKey(snapshot.lastActivityDate);
            return parsed ? new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 12, 0, 0, 0).getTime() : migratedAt;
        })()
        : migratedAt;
    const dayKeyLocal = toLocalDayKey(referenceTimestamp);

    if (challenges > 0) {
        events.push({
            id: `evt_mig_challenge_${migratedAt}`,
            kind: 'dojo_challenge_completed',
            timestamp: referenceTimestamp,
            dayKeyLocal,
            payload: {
                source: 'system',
                challengeType: 'migrated',
                count: challenges,
                score: avgScore,
                durationSec: totalTimeMinutes * 60,
                skills: [],
            },
        });
    }

    if (flashcards > 0) {
        events.push({
            id: `evt_mig_flash_${migratedAt}`,
            kind: 'flashcard_reviewed',
            timestamp: referenceTimestamp + 1,
            dayKeyLocal,
            payload: {
                source: 'system',
                count: flashcards,
            },
        });
    }

    return events;
}

const DOJO_SKILL_MAP: Record<string, string[]> = {
    parsons: ['Algorithms', 'Code Reading'],
    surgery: ['Debugging', 'Code Reading'],
    eli5: ['Code Reading'],
    faded: ['Code Reading', 'Data Structures'],
    mental: ['Algorithms', 'Debugging'],
    translation: ['Code Reading', 'Design Patterns'],
    pattern: ['Design Patterns'],
    tdd: ['Debugging', 'Code Reading'],
    bigo: ['Big-O Analysis', 'Algorithms'],
    'rubber-duck': ['Debugging', 'Code Reading'],
};

export function useAnalytics() {
    const [events, setEvents] = useState<LearningEvent[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadedEvents = safeParse<LearningEvent[]>(localStorage.getItem(EVENTS_KEY)) || [];
        const normalizedEvents = loadedEvents.map(sanitizeEvent).filter((event): event is LearningEvent => event !== null);

        const version = Number(localStorage.getItem(SCHEMA_VERSION_KEY) || 0);
        if (version < SCHEMA_VERSION && normalizedEvents.length === 0) {
            const legacySnapshot = safeParse<LegacyLearningMetricsSnapshot>(localStorage.getItem(SNAPSHOT_KEY));
            if (legacySnapshot) {
                const migratedEvents = buildMigrationEvents(legacySnapshot);
                if (migratedEvents.length > 0) {
                    setEvents(migratedEvents);
                    localStorage.setItem(EVENTS_KEY, JSON.stringify(migratedEvents));
                }
            } else {
                setEvents(normalizedEvents);
            }
            localStorage.setItem(SCHEMA_VERSION_KEY, String(SCHEMA_VERSION));
            setIsLoaded(true);
            return;
        }

        setEvents(normalizedEvents);
        localStorage.setItem(SCHEMA_VERSION_KEY, String(SCHEMA_VERSION));
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
        localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(deriveMetrics(events)));
    }, [events, isLoaded]);

    const metrics = useMemo(() => deriveMetrics(events), [events]);

    const recordEvent = useCallback((rawEvent: Omit<LearningEvent, 'id' | 'dayKeyLocal'> & { id?: string; dayKeyLocal?: string }) => {
        const timestamp = Number.isFinite(Number(rawEvent.timestamp)) ? Number(rawEvent.timestamp) : Date.now();
        const candidate: Partial<LearningEvent> = {
            ...rawEvent,
            id: rawEvent.id || `evt_${timestamp}_${Math.random().toString(36).slice(2, 8)}`,
            timestamp,
            dayKeyLocal: rawEvent.dayKeyLocal || toLocalDayKey(timestamp),
        };
        const sanitized = sanitizeEvent(candidate);
        if (!sanitized) return null;

        setEvents((prev) => [...prev, sanitized].slice(-MAX_EVENTS));
        return sanitized.id;
    }, []);

    const recordChallenge = useCallback((result: Omit<ChallengeResult, 'id' | 'completedAt' | 'timeSpent'> & {
        completedAt?: number;
        durationSec?: number;
        timeSpentSec?: number;
        count?: number;
    }) => {
        const timestamp = result.completedAt || Date.now();
        const durationSec = Number.isFinite(Number(result.durationSec))
            ? Number(result.durationSec)
            : Number.isFinite(Number(result.timeSpentSec))
                ? Number(result.timeSpentSec)
                : 0;

        recordEvent({
            kind: 'dojo_challenge_completed',
            timestamp,
            payload: {
                source: 'dojo',
                challengeType: result.challengeType,
                score: Math.max(0, Math.min(100, Number(result.score || 0))),
                durationSec: Math.max(0, durationSec),
                skills: normalizeSkills(result.skills.length ? result.skills : DOJO_SKILL_MAP[result.challengeType] || []),
                count: Math.max(1, Number(result.count || 1)),
            },
        });
    }, [recordEvent]);

    const recordFlashcardReview = useCallback((count: number = 1, meta?: { reviewedAt?: number; success?: boolean }) => {
        const timestamp = meta?.reviewedAt || Date.now();
        recordEvent({
            kind: 'flashcard_reviewed',
            timestamp,
            payload: {
                source: 'srs',
                count: Math.max(1, Number(count || 1)),
                success: meta?.success,
            },
        });
    }, [recordEvent]);

    const recordVisualizerRun = useCallback((meta?: { timestamp?: number; durationSec?: number; success?: boolean }) => {
        recordEvent({
            kind: 'visualizer_run',
            timestamp: meta?.timestamp || Date.now(),
            payload: {
                source: 'visualizer',
                durationSec: Math.max(0, Number(meta?.durationSec || 0)),
                success: meta?.success,
            },
        });
    }, [recordEvent]);

    const getActivityRange = useCallback((days: number): DailyActivity[] => {
        const safeDays = Math.max(1, Math.min(60, Math.floor(days)));
        const now = new Date();
        const result: DailyActivity[] = [];
        const activityMap = new Map(metrics.weeklyActivity.map((day) => [day.date, day]));

        for (let i = safeDays - 1; i >= 0; i -= 1) {
            const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            const dayKey = toLocalDayKey(date.getTime());
            const row = activityMap.get(dayKey) || {
                date: dayKey,
                challenges: 0,
                flashcards: 0,
                timeSpent: 0,
            };
            result.push(row);
        }
        return result;
    }, [metrics.weeklyActivity]);

    const getLevel = useCallback(() => {
        const xp = metrics.totalXP;
        const level = Math.floor(Math.sqrt(xp / 100)) + 1;
        const currentLevelXp = Math.pow(level - 1, 2) * 100;
        const nextLevelXp = Math.pow(level, 2) * 100;
        const denominator = Math.max(1, nextLevelXp - currentLevelXp);
        const progress = ((xp - currentLevelXp) / denominator) * 100;

        return {
            level,
            xp,
            progress: Math.max(0, Math.min(100, progress)),
            nextLevelXp,
        };
    }, [metrics.totalXP]);

    return {
        metrics,
        isLoaded,
        events,
        recordEvent,
        recordChallenge,
        recordFlashcardReview,
        recordVisualizerRun,
        getActivityRange,
        getLevel,
    };
}
