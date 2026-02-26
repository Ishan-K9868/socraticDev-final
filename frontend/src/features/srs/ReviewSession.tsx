import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FlashcardDeck from './FlashcardDeck';
import { useSRS } from './useSRS';
import { Quality, Flashcard } from './types';
import ThemeToggle from '../../components/ThemeToggle';
import { useAnalytics } from '../analytics/useAnalytics';

type SessionReason = 'active' | 'no-cards' | 'none-due' | 'complete';

function ReviewSession() {
    const { recordFlashcardReview } = useAnalytics();
    const {
        getDueCards,
        reviewCard,
        getDeckProgress,
        stats,
        cards,
        addCards,
        createCard,
        isLoaded,
        settings,
    } = useSRS({ onReviewRecorded: recordFlashcardReview });

    const [sessionCards, setSessionCards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [sessionReason, setSessionReason] = useState<SessionReason>('active');
    const [isRating, setIsRating] = useState(false);
    const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });
    const initializedRef = useRef(false);

    const progress = getDeckProgress();
    const currentCard = sessionCards[currentIndex];

    const initializeSession = (due: Flashcard[], totalCards: number, resetSessionStats = true) => {
        setSessionCards(due);
        setCurrentIndex(0);
        setShowAnswer(false);
        setIsRating(false);
        if (resetSessionStats) {
            setSessionStats({ reviewed: 0, correct: 0 });
        }

        if (!due.length) {
            setSessionComplete(true);
            setSessionReason(totalCards === 0 ? 'no-cards' : 'none-due');
        } else {
            setSessionComplete(false);
            setSessionReason('active');
        }
    };

    useEffect(() => {
        if (!isLoaded || initializedRef.current) return;
        const due = getDueCards(settings.dailyReviewLimit);
        initializeSession(due, cards.length);
        initializedRef.current = true;
    }, [cards.length, getDueCards, isLoaded, settings.dailyReviewLimit]);

    const handleFlip = () => {
        setShowAnswer(true);
    };

    const handleRate = (quality: Quality) => {
        if (!currentCard || isRating) return;
        setIsRating(true);
        reviewCard(currentCard.id, quality);

        setSessionStats((prev) => ({
            reviewed: prev.reviewed + 1,
            correct: quality >= 3 ? prev.correct + 1 : prev.correct,
        }));

        if (currentIndex < sessionCards.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setShowAnswer(false);
        } else {
            setSessionComplete(true);
            setSessionReason('complete');
        }

        setTimeout(() => setIsRating(false), 180);
    };

    const handleAddSampleCards = () => {
        const samples: Flashcard[] = [
            createCard(
                'What is the time complexity of binary search?',
                'O(log n) - because we halve the search space with each comparison',
                { tags: ['algorithms', 'complexity'], type: 'basic' }
            ),
            createCard(
                'In recursion, the base case prevents [...] and ends the function calls.',
                'infinite recursion',
                { tags: ['recursion'], type: 'cloze' }
            ),
            createCard(
                'What does this code do?\n```python\ndef fib(n):\n    if n <= 1:\n        return n\n    return fib(n-1) + fib(n-2)\n```',
                'Calculates nth Fibonacci recursively. Time O(2^n), space O(n).',
                { tags: ['recursion', 'python'], type: 'code', language: 'python' }
            ),
            createCard(
                'What is the difference between == and === in JavaScript?',
                '== coerces types before comparison, === checks both value and type.',
                { tags: ['javascript'], type: 'basic' }
            ),
        ];

        addCards(samples);
        initializeSession(samples.slice(0, settings.dailyReviewLimit), cards.length + samples.length);
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center p-6">
                <div className="text-center text-[color:var(--color-text-muted)]">
                    <div className="w-10 h-10 border-2 border-primary-500/40 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
                    <p>Loading flashcards...</p>
                </div>
            </div>
        );
    }

    const progressTotal = Math.max(1, sessionCards.length);
    const progressPct = sessionCards.length ? Math.round((currentIndex / progressTotal) * 100) : 0;

    if (sessionComplete) {
        const title = sessionReason === 'complete'
            ? 'Session Complete!'
            : sessionReason === 'no-cards'
                ? 'No Cards Yet'
                : 'No Cards Due';

        const subtitle = sessionReason === 'complete'
            ? 'Great job! Come back tomorrow for more reviews.'
            : sessionReason === 'no-cards'
                ? 'Add some flashcards to start learning.'
                : 'You are caught up for now. Check back later.';

        return (
            <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md"
                >
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-display font-bold mb-4">{title}</h2>

                    {sessionStats.reviewed > 0 && (
                        <div className="mb-6 p-4 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-3xl font-bold text-primary-500">{sessionStats.reviewed}</div>
                                    <div className="text-sm text-[color:var(--color-text-muted)]">Cards Reviewed</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-green-500">
                                        {Math.round((sessionStats.correct / Math.max(1, sessionStats.reviewed)) * 100)}%
                                    </div>
                                    <div className="text-sm text-[color:var(--color-text-muted)]">Accuracy</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <p className="text-[color:var(--color-text-muted)] mb-8">{subtitle}</p>

                    <div className="flex flex-col gap-3">
                        {(sessionReason === 'no-cards' || sessionReason === 'none-due') && (
                            <button
                                onClick={handleAddSampleCards}
                                className="px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
                            >
                                Add Sample Cards
                            </button>
                        )}
                        <Link
                            to="/srs"
                            className="px-6 py-3 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] hover:border-primary-500 transition-colors"
                        >
                            Back to SRS Dashboard
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex flex-col">
            <header className="border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)]">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/srs"
                            className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)] transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-display font-bold flex items-center gap-2">
                                <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                Review Session
                            </h1>
                        </div>
                    </div>

                    <ThemeToggle />
                </div>
            </header>

            <div className="bg-[color:var(--color-bg-secondary)] border-b border-[color:var(--color-border)]">
                <div className="max-w-4xl mx-auto px-6 py-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-[color:var(--color-text-muted)]">
                            Card {Math.min(currentIndex + 1, sessionCards.length)} of {sessionCards.length}
                        </span>
                        <span className="text-primary-500 font-medium">{progressPct}% complete</span>
                    </div>
                    <div className="h-2 bg-[color:var(--color-bg-muted)] rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPct}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6">
                <AnimatePresence mode="wait">
                    {currentCard && (
                        <motion.div
                            key={currentCard.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="w-full"
                        >
                            <FlashcardDeck
                                card={currentCard}
                                onRate={handleRate}
                                showAnswer={showAnswer}
                                onFlip={handleFlip}
                                ratingDisabled={isRating}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <footer className="border-t border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between text-sm">
                    <div className="flex items-center gap-6 text-[color:var(--color-text-muted)]">
                        <div className="flex items-center gap-1">
                            <span className="text-blue-400">●</span>
                            New: {progress.new}
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-orange-400">●</span>
                            Learning: {progress.learning}
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-green-400">●</span>
                            Review: {progress.review}
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-violet-400">●</span>
                            Mastered: {progress.mastered}
                        </div>
                    </div>

                    <div className="flex items-center gap-1 text-[color:var(--color-text-muted)]">
                        <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        </svg>
                        Streak: {stats.currentStreak} days
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default ReviewSession;
