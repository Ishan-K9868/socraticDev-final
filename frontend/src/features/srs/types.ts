// Spaced Repetition System Types

export interface Flashcard {
    id: string;
    front: string;           // Question or cloze text
    back: string;            // Answer
    type: 'basic' | 'cloze' | 'code';
    language?: string;       // For code cards
    tags: string[];
    sourceType?: 'manual' | 'chat' | 'dojo';
    createdAt: number;       // timestamp
    // SM-2 Algorithm fields
    interval: number;        // Days until next review
    repetitions: number;     // Number of successful reviews
    easeFactor: number;      // Ease factor (starts at 2.5)
    nextReview: number;      // timestamp of next review
    lastReview?: number;     // timestamp of last review
}

export interface ReviewResult {
    cardId: string;
    quality: Quality;        // User's self-rating
    reviewedAt: number;
}

// SM-2 Quality ratings
export type Quality = 0 | 1 | 2 | 3 | 4 | 5;
// 0 - Complete blackout
// 1 - Incorrect, but upon seeing correct answer, remembered
// 2 - Incorrect, but correct answer seemed easy to recall
// 3 - Correct with serious difficulty
// 4 - Correct with some hesitation
// 5 - Perfect response

export interface SRSStats {
    totalCards: number;
    cardsReviewedToday: number;
    cardsDueToday: number;
    currentStreak: number;
    longestStreak: number;
    averageEaseFactor: number;
}

export interface DeckProgress {
    new: number;
    learning: number;
    review: number;
    mastered: number;
}

export const QUALITY_LABELS: Record<Quality, { label: string; color: string; description: string }> = {
    0: { label: 'Again', color: 'text-red-500', description: 'Complete blackout' },
    1: { label: 'Hard', color: 'text-orange-500', description: 'Incorrect, remembered after' },
    2: { label: 'Difficult', color: 'text-yellow-500', description: 'Incorrect, but easy to recall' },
    3: { label: 'Good', color: 'text-lime-500', description: 'Correct with difficulty' },
    4: { label: 'Easy', color: 'text-green-500', description: 'Correct with hesitation' },
    5: { label: 'Perfect', color: 'text-emerald-500', description: 'Perfect response' },
};

// Simplified rating buttons (4 options like Anki)
export const SIMPLE_RATINGS: { quality: Quality; label: string; color: string }[] = [
    { quality: 0, label: 'Again', color: 'bg-red-500 hover:bg-red-600' },
    { quality: 2, label: 'Hard', color: 'bg-orange-500 hover:bg-orange-600' },
    { quality: 3, label: 'Good', color: 'bg-green-500 hover:bg-green-600' },
    { quality: 5, label: 'Easy', color: 'bg-emerald-500 hover:bg-emerald-600' },
];
