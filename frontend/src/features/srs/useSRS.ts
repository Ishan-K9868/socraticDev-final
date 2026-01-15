import { useState, useEffect, useCallback } from 'react';
import { Flashcard, Quality, SRSStats, ReviewResult } from './types';

const STORAGE_KEY = 'socraticdev-srs-cards';
const STATS_KEY = 'socraticdev-srs-stats';

// SM-2 Algorithm Implementation
function calculateNextReview(card: Flashcard, quality: Quality): Partial<Flashcard> {
    let { interval, repetitions, easeFactor } = card;

    if (quality < 3) {
        // Failed: reset repetitions
        repetitions = 0;
        interval = 1;
    } else {
        // Passed: increase interval
        if (repetitions === 0) {
            interval = 1;
        } else if (repetitions === 1) {
            interval = 6;
        } else {
            interval = Math.round(interval * easeFactor);
        }
        repetitions += 1;
    }

    // Update ease factor (never below 1.3)
    easeFactor = Math.max(
        1.3,
        easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    const now = Date.now();
    const nextReview = now + interval * 24 * 60 * 60 * 1000; // Convert days to ms

    return {
        interval,
        repetitions,
        easeFactor,
        nextReview,
        lastReview: now,
    };
}

// Create a new flashcard with default SM-2 values
export function createCard(
    front: string,
    back: string,
    options: Partial<Flashcard> = {}
): Flashcard {
    const now = Date.now();
    return {
        id: `card_${now}_${Math.random().toString(36).substr(2, 9)}`,
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
        nextReview: now, // Due immediately
        ...options,
    };
}

// Create a cloze deletion card from code
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

export function useSRS() {
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [stats, setStats] = useState<SRSStats>({
        totalCards: 0,
        cardsReviewedToday: 0,
        cardsDueToday: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageEaseFactor: 2.5,
    });
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage
    useEffect(() => {
        try {
            const savedCards = localStorage.getItem(STORAGE_KEY);
            const savedStats = localStorage.getItem(STATS_KEY);

            if (savedCards) {
                setCards(JSON.parse(savedCards));
            }
            if (savedStats) {
                setStats(JSON.parse(savedStats));
            }
        } catch (e) {
            console.error('Error loading SRS data:', e);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage on changes
    useEffect(() => {
        if (isLoaded && cards.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
        }
    }, [cards, isLoaded]);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STATS_KEY, JSON.stringify(stats));
        }
    }, [stats, isLoaded]);

    // Get cards due for review today
    const getDueCards = useCallback((): Flashcard[] => {
        const now = Date.now();
        return cards
            .filter(card => card.nextReview <= now)
            .sort((a, b) => a.nextReview - b.nextReview);
    }, [cards]);

    // Add a new card
    const addCard = useCallback((card: Flashcard) => {
        setCards(prev => [...prev, card]);
        setStats(prev => ({
            ...prev,
            totalCards: prev.totalCards + 1,
            cardsDueToday: prev.cardsDueToday + 1,
        }));
    }, []);

    // Add multiple cards
    const addCards = useCallback((newCards: Flashcard[]) => {
        setCards(prev => [...prev, ...newCards]);
        setStats(prev => ({
            ...prev,
            totalCards: prev.totalCards + newCards.length,
            cardsDueToday: prev.cardsDueToday + newCards.length,
        }));
    }, []);

    // Review a card
    const reviewCard = useCallback((cardId: string, quality: Quality): ReviewResult => {
        const reviewedAt = Date.now();

        setCards(prev => prev.map(card => {
            if (card.id === cardId) {
                return { ...card, ...calculateNextReview(card, quality) };
            }
            return card;
        }));

        setStats(prev => ({
            ...prev,
            cardsReviewedToday: prev.cardsReviewedToday + 1,
            cardsDueToday: Math.max(0, prev.cardsDueToday - 1),
        }));

        return { cardId, quality, reviewedAt };
    }, []);

    // Delete a card
    const deleteCard = useCallback((cardId: string) => {
        setCards(prev => prev.filter(card => card.id !== cardId));
        setStats(prev => ({
            ...prev,
            totalCards: Math.max(0, prev.totalCards - 1),
        }));
    }, []);

    // Get deck progress breakdown
    const getDeckProgress = useCallback(() => {
        let newCards = 0;
        let learning = 0;
        let review = 0;
        let mastered = 0;

        cards.forEach(card => {
            if (card.repetitions === 0) {
                newCards++;
            } else if (card.interval < 21) {
                learning++;
            } else if (card.interval >= 21 && card.easeFactor >= 2.5) {
                mastered++;
            } else {
                review++;
            }
        });

        return { new: newCards, learning, review, mastered };
    }, [cards]);

    // Reset stats for a new day
    const resetDailyStats = useCallback(() => {
        const dueCount = getDueCards().length;
        setStats(prev => ({
            ...prev,
            cardsReviewedToday: 0,
            cardsDueToday: dueCount,
        }));
    }, [getDueCards]);

    // Calculate average ease factor
    const getAverageEaseFactor = useCallback(() => {
        if (cards.length === 0) return 2.5;
        const sum = cards.reduce((acc, card) => acc + card.easeFactor, 0);
        return sum / cards.length;
    }, [cards]);

    return {
        cards,
        stats,
        isLoaded,
        getDueCards,
        addCard,
        addCards,
        reviewCard,
        deleteCard,
        getDeckProgress,
        resetDailyStats,
        getAverageEaseFactor,
        createCard,
        createCodeCard,
    };
}
