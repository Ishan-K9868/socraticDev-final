import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Flashcard,
    Quality,
    SRSStats,
    ReviewResult,
    ReviewEvent,
    SRSSettings,
    SRSExportPayload,
    GeneratedCardCandidate,
} from './types';

const STORAGE_KEY = 'socraticdev-srs-cards';
const STATS_KEY = 'socraticdev-srs-stats';
const REVIEW_LOG_KEY = 'socraticdev-srs-review-log';
const SETTINGS_KEY = 'socraticdev-srs-settings';

const DEFAULT_SETTINGS: SRSSettings = {
    dailyReviewLimit: 50,
    ratingMode: 'simple4',
    autoCreateFromChat: true,
    autoCreateFromDojo: true,
};

interface UseSRSOptions {
    onReviewRecorded?: (count: number) => void;
}

function safeParse<T>(raw: string | null): T | null {
    if (!raw) return null;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

function toDayKey(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function dayKeyToDate(dayKey: string): Date | null {
    const parts = dayKey.split('-');
    if (parts.length !== 3) return null;
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
    return new Date(year, month - 1, day);
}

function dayDiff(a: Date, b: Date): number {
    const start = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
    const end = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
    return Math.round((end - start) / (24 * 60 * 60 * 1000));
}

function sanitizeCard(card: Partial<Flashcard>): Flashcard | null {
    if (!card || typeof card !== 'object') return null;
    const front = typeof card.front === 'string' ? card.front.trim() : '';
    const back = typeof card.back === 'string' ? card.back.trim() : '';
    if (!front || !back) return null;

    const now = Date.now();
    const type = card.type === 'cloze' || card.type === 'code' ? card.type : 'basic';
    const tags = Array.isArray(card.tags)
        ? card.tags.map((tag) => String(tag).trim()).filter(Boolean)
        : [];

    return {
        id: typeof card.id === 'string' && card.id ? card.id : `card_${now}_${Math.random().toString(36).slice(2, 9)}`,
        front,
        back,
        type,
        language: typeof card.language === 'string' ? card.language : undefined,
        tags,
        sourceType: card.sourceType === 'chat' || card.sourceType === 'dojo' ? card.sourceType : 'manual',
        createdAt: Number.isFinite(card.createdAt) ? Number(card.createdAt) : now,
        interval: Number.isFinite(card.interval) ? Math.max(0, Number(card.interval)) : 0,
        repetitions: Number.isFinite(card.repetitions) ? Math.max(0, Number(card.repetitions)) : 0,
        easeFactor: Number.isFinite(card.easeFactor) ? Math.max(1.3, Number(card.easeFactor)) : 2.5,
        nextReview: Number.isFinite(card.nextReview) ? Number(card.nextReview) : now,
        lastReview: Number.isFinite(card.lastReview) ? Number(card.lastReview) : undefined,
    };
}

function normalizeFingerprint(card: Pick<Flashcard, 'type' | 'front'>): string {
    return `${card.type}::${card.front.toLowerCase().replace(/\s+/g, ' ').trim()}`;
}

function sanitizeReviewEvent(event: Partial<ReviewEvent>): ReviewEvent | null {
    if (!event || typeof event !== 'object') return null;
    if (typeof event.cardId !== 'string' || !event.cardId) return null;

    const quality = Number(event.quality);
    if (!Number.isInteger(quality) || quality < 0 || quality > 5) return null;

    const reviewedAt = Number(event.reviewedAt);
    const safeReviewedAt = Number.isFinite(reviewedAt) ? reviewedAt : Date.now();

    const dayKey = typeof event.dayKey === 'string' && event.dayKey
        ? event.dayKey
        : toDayKey(safeReviewedAt);

    return {
        cardId: event.cardId,
        quality: quality as Quality,
        reviewedAt: safeReviewedAt,
        dayKey,
    };
}

function sanitizeSettings(raw: Partial<SRSSettings> | null): SRSSettings {
    if (!raw || typeof raw !== 'object') return DEFAULT_SETTINGS;
    return {
        dailyReviewLimit: Number.isFinite(raw.dailyReviewLimit)
            ? Math.min(500, Math.max(1, Math.floor(Number(raw.dailyReviewLimit))))
            : DEFAULT_SETTINGS.dailyReviewLimit,
        ratingMode: raw.ratingMode === 'full6' ? 'full6' : 'simple4',
        autoCreateFromChat: raw.autoCreateFromChat !== false,
        autoCreateFromDojo: raw.autoCreateFromDojo !== false,
    };
}

function calculateNextReview(card: Flashcard, quality: Quality): Partial<Flashcard> {
    let { interval, repetitions, easeFactor } = card;

    if (quality < 3) {
        repetitions = 0;
        interval = 1;
    } else {
        if (repetitions === 0) {
            interval = 1;
        } else if (repetitions === 1) {
            interval = 6;
        } else {
            interval = Math.max(1, Math.round(interval * easeFactor));
        }
        repetitions += 1;
    }

    easeFactor = Math.max(
        1.3,
        easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    const now = Date.now();
    const nextReview = now + interval * 24 * 60 * 60 * 1000;

    return {
        interval,
        repetitions,
        easeFactor,
        nextReview,
        lastReview: now,
    };
}

function getCurrentStreakFromDays(dayKeys: string[]): number {
    if (!dayKeys.length) return 0;
    const uniqueDays = Array.from(new Set(dayKeys));
    const daySet = new Set(uniqueDays);
    const today = new Date();
    let streak = 0;

    while (true) {
        const checkDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - streak);
        const key = toDayKey(checkDate.getTime());
        if (!daySet.has(key)) break;
        streak += 1;
    }

    return streak;
}

function getLongestStreakFromDays(dayKeys: string[]): number {
    if (!dayKeys.length) return 0;
    const uniqueDates = Array.from(new Set(dayKeys))
        .map(dayKeyToDate)
        .filter((d): d is Date => d !== null)
        .sort((a, b) => a.getTime() - b.getTime());

    if (!uniqueDates.length) return 0;

    let longest = 1;
    let current = 1;

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

export function createCard(
    front: string,
    back: string,
    options: Partial<Flashcard> = {}
): Flashcard {
    const now = Date.now();
    return {
        id: `card_${now}_${Math.random().toString(36).slice(2, 9)}`,
        front,
        back,
        type: options.type || 'basic',
        language: options.language,
        tags: options.tags || [],
        sourceType: options.sourceType || 'manual',
        createdAt: now,
        interval: 0,
        repetitions: 0,
        easeFactor: 2.5,
        nextReview: now,
        ...options,
    };
}

export function createCodeCard(
    code: string,
    explanation: string,
    language: string,
    tags: string[] = []
): Flashcard {
    return createCard(
        `What does this code do?\n\`\`\`${language}\n${code}\n\`\`\``,
        explanation,
        { type: 'code', language, tags, sourceType: 'manual' }
    );
}

export function useSRS(options?: UseSRSOptions) {
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [reviewLog, setReviewLog] = useState<ReviewEvent[]>([]);
    const [settings, setSettings] = useState<SRSSettings>(DEFAULT_SETTINGS);
    const [legacyStats, setLegacyStats] = useState<SRSStats | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadedCards = safeParse<Flashcard[]>(localStorage.getItem(STORAGE_KEY)) || [];
        const loadedReviewLog = safeParse<ReviewEvent[]>(localStorage.getItem(REVIEW_LOG_KEY)) || [];
        const loadedSettings = sanitizeSettings(safeParse<SRSSettings>(localStorage.getItem(SETTINGS_KEY)));
        const loadedLegacyStats = safeParse<SRSStats>(localStorage.getItem(STATS_KEY));

        setCards(loadedCards.map(sanitizeCard).filter((card): card is Flashcard => card !== null));
        setReviewLog(loadedReviewLog.map(sanitizeReviewEvent).filter((event): event is ReviewEvent => event !== null));
        setSettings(loadedSettings);
        setLegacyStats(loadedLegacyStats);
        setIsLoaded(true);
    }, []);

    const getDueCards = useCallback((limit?: number): Flashcard[] => {
        const now = Date.now();
        const dueCards = cards
            .filter((card) => card.nextReview <= now)
            .sort((a, b) => a.nextReview - b.nextReview);

        const maxItems = Number.isFinite(limit) ? Math.max(1, Math.floor(Number(limit))) : undefined;
        return typeof maxItems === 'number' ? dueCards.slice(0, maxItems) : dueCards;
    }, [cards]);

    const stats = useMemo<SRSStats>(() => {
        const totalCards = cards.length;
        const cardsDueToday = getDueCards().length;
        const totalReviews = reviewLog.length;
        const todayKey = toDayKey(Date.now());
        const cardsReviewedToday = reviewLog.filter((event) => event.dayKey === todayKey).length;
        const successfulReviews = reviewLog.filter((event) => event.quality >= 3).length;
        const reviewAccuracy = totalReviews > 0
            ? Math.round((successfulReviews / totalReviews) * 100)
            : 0;

        const averageEaseFactor = totalCards > 0
            ? cards.reduce((acc, card) => acc + card.easeFactor, 0) / totalCards
            : 2.5;

        const dayKeys = reviewLog.map((event) => event.dayKey);
        let currentStreak = getCurrentStreakFromDays(dayKeys);
        let longestStreak = getLongestStreakFromDays(dayKeys);

        if (!reviewLog.length && legacyStats) {
            currentStreak = legacyStats.currentStreak || 0;
            longestStreak = legacyStats.longestStreak || 0;
        }

        return {
            totalCards,
            cardsReviewedToday: reviewLog.length ? cardsReviewedToday : (legacyStats?.cardsReviewedToday || 0),
            cardsDueToday,
            currentStreak,
            longestStreak,
            averageEaseFactor,
            totalReviews,
            reviewAccuracy,
        };
    }, [cards, getDueCards, legacyStats, reviewLog]);

    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    }, [cards, isLoaded]);

    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem(REVIEW_LOG_KEY, JSON.stringify(reviewLog));
    }, [reviewLog, isLoaded]);

    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }, [settings, isLoaded]);

    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    }, [isLoaded, stats]);

    const addCard = useCallback((card: Flashcard) => {
        const sanitized = sanitizeCard(card);
        if (!sanitized) return;
        setCards((prev) => [...prev, sanitized]);
    }, []);

    const addCards = useCallback((newCards: Flashcard[]) => {
        const sanitized = newCards.map(sanitizeCard).filter((card): card is Flashcard => card !== null);
        if (!sanitized.length) return;
        setCards((prev) => [...prev, ...sanitized]);
    }, []);

    const prepareCardsForInsert = useCallback((candidates: GeneratedCardCandidate[]) => {
        const existingFingerprints = new Set(cards.map((card) => normalizeFingerprint(card)));
        const seenIncoming = new Set<string>();
        const accepted: Flashcard[] = [];
        const duplicates: GeneratedCardCandidate[] = [];
        const rejected: GeneratedCardCandidate[] = [];

        for (const candidate of candidates) {
            const sanitized = sanitizeCard({
                ...candidate,
                sourceType: 'manual',
                tags: candidate.tags || [],
                createdAt: Date.now(),
                interval: 0,
                repetitions: 0,
                easeFactor: 2.5,
                nextReview: Date.now(),
            });

            if (!sanitized) {
                rejected.push(candidate);
                continue;
            }

            const fingerprint = normalizeFingerprint(sanitized);
            if (existingFingerprints.has(fingerprint) || seenIncoming.has(fingerprint)) {
                duplicates.push(candidate);
                continue;
            }

            seenIncoming.add(fingerprint);
            accepted.push(sanitized);
        }

        return { accepted, rejected, duplicates };
    }, [cards]);

    const addGeneratedCards = useCallback((candidates: GeneratedCardCandidate[], sourceType: Flashcard['sourceType']) => {
        const mappedCandidates = candidates.map((candidate) => ({
            ...candidate,
            tags: candidate.tags || [],
        }));
        const { accepted, rejected, duplicates } = prepareCardsForInsert(mappedCandidates);
        if (accepted.length) {
            setCards((prev) => [
                ...prev,
                ...accepted.map((card) => ({ ...card, sourceType: sourceType || 'manual' })),
            ]);
        }
        return {
            inserted: accepted.length,
            rejected: rejected.length,
            duplicates: duplicates.length,
        };
    }, [prepareCardsForInsert]);

    const reviewCard = useCallback((cardId: string, quality: Quality): ReviewResult => {
        const reviewedAt = Date.now();
        const dayKey = toDayKey(reviewedAt);

        setCards((prev) => prev.map((card) => {
            if (card.id !== cardId) return card;
            return { ...card, ...calculateNextReview(card, quality) };
        }));

        setReviewLog((prev) => ([...prev, { cardId, quality, reviewedAt, dayKey }]));
        options?.onReviewRecorded?.(1);

        return { cardId, quality, reviewedAt, dayKey };
    }, [options]);

    const deleteCard = useCallback((cardId: string) => {
        setCards((prev) => prev.filter((card) => card.id !== cardId));
    }, []);

    const getDeckProgress = useCallback(() => {
        let newCards = 0;
        let learning = 0;
        let review = 0;
        let mastered = 0;

        cards.forEach((card) => {
            if (card.repetitions === 0) {
                newCards += 1;
            } else if (card.interval < 21) {
                learning += 1;
            } else if (card.interval >= 21 && card.easeFactor >= 2.5) {
                mastered += 1;
            } else {
                review += 1;
            }
        });

        return { new: newCards, learning, review, mastered };
    }, [cards]);

    const updateSettings = useCallback((partial: Partial<SRSSettings>) => {
        setSettings((prev) => sanitizeSettings({ ...prev, ...partial }));
    }, []);

    const exportData = useCallback((): string => {
        const payload: SRSExportPayload = {
            version: 1,
            exportedAt: Date.now(),
            cards,
            reviewLog,
            settings,
        };
        return JSON.stringify(payload, null, 2);
    }, [cards, reviewLog, settings]);

    const importData = useCallback((rawJson: string, mode: 'replace' | 'merge' = 'replace') => {
        const payload = safeParse<SRSExportPayload>(rawJson);
        if (!payload || payload.version !== 1) {
            throw new Error('Invalid SRS import payload.');
        }

        const importedCards = (payload.cards || [])
            .map(sanitizeCard)
            .filter((card): card is Flashcard => card !== null);
        const importedReviewLog = (payload.reviewLog || [])
            .map(sanitizeReviewEvent)
            .filter((event): event is ReviewEvent => event !== null);
        const importedSettings = sanitizeSettings(payload.settings);

        if (mode === 'replace') {
            setCards(importedCards);
            setReviewLog(importedReviewLog);
            setSettings(importedSettings);
        } else {
            setCards((prev) => {
                const seen = new Set(prev.map((card) => card.id));
                const merged = [...prev];
                importedCards.forEach((card) => {
                    if (!seen.has(card.id)) {
                        merged.push(card);
                        seen.add(card.id);
                    }
                });
                return merged;
            });

            setReviewLog((prev) => {
                const unique = new Map<string, ReviewEvent>();
                [...prev, ...importedReviewLog].forEach((event) => {
                    const key = `${event.cardId}:${event.reviewedAt}:${event.quality}`;
                    unique.set(key, event);
                });
                return Array.from(unique.values()).sort((a, b) => a.reviewedAt - b.reviewedAt);
            });

            setSettings((prev) => sanitizeSettings({ ...prev, ...importedSettings }));
        }

        return {
            importedCards: importedCards.length,
            importedReviews: importedReviewLog.length,
        };
    }, []);

    const resetDailyStats = useCallback(() => {
        // Stats are derived from review log and card schedule.
    }, []);

    const getAverageEaseFactor = useCallback(() => stats.averageEaseFactor, [stats.averageEaseFactor]);

    return {
        cards,
        reviewLog,
        stats,
        settings,
        isLoaded,
        getDueCards,
        addCard,
        addCards,
        prepareCardsForInsert,
        addGeneratedCards,
        reviewCard,
        deleteCard,
        getDeckProgress,
        updateSettings,
        exportData,
        importData,
        resetDailyStats,
        getAverageEaseFactor,
        createCard,
        createCodeCard,
    };
}
