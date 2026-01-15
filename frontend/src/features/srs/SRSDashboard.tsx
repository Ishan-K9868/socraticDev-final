import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSRS } from './useSRS';
import ThemeToggle from '../../components/ThemeToggle';

function SRSDashboard() {
    const {
        stats,
        getDueCards,
        getDeckProgress,
        cards,
        addCard,
        createCard
    } = useSRS();

    const dueCards = getDueCards();
    const progress = getDeckProgress();
    const totalCards = cards.length;

    const handleAddSampleCards = () => {
        const samples = [
            createCard(
                'What is the time complexity of binary search?',
                'O(log n) - halves search space each iteration',
                { tags: ['algorithms'], type: 'basic' }
            ),
            createCard(
                'What is a closure in JavaScript?',
                'Function with access to outer scope variables after outer function returns',
                { tags: ['javascript'], type: 'basic' }
            ),
            createCard(
                'What does DRY stand for?',
                'Don\'t Repeat Yourself - avoid code duplication',
                { tags: ['principles'], type: 'basic' }
            ),
            createCard(
                'What is the difference between stack and heap memory?',
                'Stack: automatic, small, fast. Heap: manual, large, slower.',
                { tags: ['memory'], type: 'basic' }
            ),
        ];
        samples.forEach(card => addCard(card));
    };

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)]">
            {/* Header */}
            <header className="border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)]">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/app"
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
                                Spaced Repetition
                            </h1>
                            <p className="text-sm text-[color:var(--color-text-muted)]">
                                Learn smarter with science-backed review schedules
                            </p>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Cards', value: totalCards, icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>), color: 'text-blue-400' },
                        { label: 'Due Today', value: dueCards.length, icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>), color: 'text-orange-400' },
                        { label: 'Current Streak', value: `${stats.currentStreak}d`, icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>), color: 'text-red-400' },
                        { label: 'Reviewed Today', value: stats.cardsReviewedToday, icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>), color: 'text-green-400' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-4 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span>{stat.icon}</span>
                                <span className="text-sm text-[color:var(--color-text-muted)]">{stat.label}</span>
                            </div>
                            <div className={`text-2xl font-bold ${stat.color}`}>
                                {stat.value}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Start Review CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8 p-8 rounded-2xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-primary-500/20 text-center"
                >
                    <h2 className="text-2xl font-bold mb-2">
                        {dueCards.length > 0
                            ? `${dueCards.length} cards ready for review`
                            : 'No cards due right now'}
                    </h2>
                    <p className="text-[color:var(--color-text-muted)] mb-6">
                        {dueCards.length > 0
                            ? 'Keep your streak alive! Review now for optimal retention.'
                            : 'Add some cards or wait for your next review session.'}
                    </p>

                    <div className="flex justify-center gap-4">
                        <Link
                            to="/srs/review"
                            className={`px-6 py-3 rounded-xl font-medium transition-all ${dueCards.length > 0
                                ? 'bg-primary-500 hover:bg-primary-600 text-white'
                                : 'bg-[color:var(--color-bg-muted)] text-[color:var(--color-text-muted)] cursor-not-allowed'
                                }`}
                        >
                            Start Review
                        </Link>

                        {totalCards === 0 && (
                            <button
                                onClick={handleAddSampleCards}
                                className="px-6 py-3 rounded-xl font-medium bg-secondary-500 hover:bg-secondary-600 text-white transition-all"
                            >
                                Add Sample Cards
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Deck Progress */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Deck Progress</h3>
                    <div className="grid grid-cols-4 gap-4">
                        {[
                            { label: 'New', count: progress.new, color: 'bg-blue-500' },
                            { label: 'Learning', count: progress.learning, color: 'bg-orange-500' },
                            { label: 'Review', count: progress.review, color: 'bg-green-500' },
                            { label: 'Mastered', count: progress.mastered, color: 'bg-violet-500' },
                        ].map(item => (
                            <div
                                key={item.label}
                                className="p-4 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                    <span className="text-sm">{item.label}</span>
                                </div>
                                <div className="text-xl font-bold">{item.count}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* How It Works */}
                <div className="p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                    <h3 className="text-lg font-semibold mb-4">How Spaced Repetition Works</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold">1</div>
                            <div>
                                <div className="font-medium mb-1">Review Cards</div>
                                <div className="text-sm text-[color:var(--color-text-muted)]">
                                    Rate how well you remembered each card
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary-500/20 flex items-center justify-center text-secondary-400 font-bold">2</div>
                            <div>
                                <div className="font-medium mb-1">SM-2 Algorithm</div>
                                <div className="text-sm text-[color:var(--color-text-muted)]">
                                    Cards are scheduled at optimal intervals
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400 font-bold">3</div>
                            <div>
                                <div className="font-medium mb-1">Long-term Memory</div>
                                <div className="text-sm text-[color:var(--color-text-muted)]">
                                    Move concepts from short to long-term memory
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default SRSDashboard;
