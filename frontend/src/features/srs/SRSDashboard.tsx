import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSRS } from './useSRS';
import ThemeToggle from '../../components/ThemeToggle';
import { Flashcard } from './types';

function SRSDashboard() {
    const {
        stats,
        settings,
        isLoaded,
        getDueCards,
        getDeckProgress,
        cards,
        addCard,
        addCards,
        deleteCard,
        createCard,
        updateSettings,
        exportData,
        importData,
    } = useSRS();

    const dueCards = getDueCards();
    const progress = getDeckProgress();
    const totalCards = cards.length;
    const importFileRef = useRef<HTMLInputElement>(null);

    const [creatorType, setCreatorType] = useState<Flashcard['type']>('basic');
    const [creatorFront, setCreatorFront] = useState('');
    const [creatorBack, setCreatorBack] = useState('');
    const [creatorLanguage, setCreatorLanguage] = useState('python');
    const [creatorTags, setCreatorTags] = useState('');
    const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
    const [importStatus, setImportStatus] = useState<string | null>(null);
    const [creatorStatus, setCreatorStatus] = useState<string | null>(null);

    const recentCards = useMemo(() => [...cards].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8), [cards]);

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
                'In recursion, a [...] case prevents infinite calls.',
                'base',
                { tags: ['recursion'], type: 'cloze' }
            ),
            createCard(
                'What does this code do?\n```python\ndef square(nums):\n    return [n*n for n in nums]\n```',
                'Returns a new list with each element squared using list comprehension.',
                { tags: ['python'], type: 'code', language: 'python' }
            ),
        ];
        addCards(samples);
    };

    const handleCreateCard = () => {
        const front = creatorFront.trim();
        const back = creatorBack.trim();
        if (!front || !back) {
            setCreatorStatus('Front and back are required.');
            return;
        }

        if (creatorType === 'cloze' && !/\[[^\]]+?\]|\[\.\.\.\]/.test(front)) {
            setCreatorStatus('Cloze cards should include at least one blank marker like [...] or [answer].');
            return;
        }

        const tags = creatorTags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean);

        addCard(createCard(front, back, {
            type: creatorType,
            language: creatorType === 'code' ? creatorLanguage : undefined,
            tags,
            sourceType: 'manual',
        }));

        setCreatorFront('');
        setCreatorBack('');
        setCreatorTags('');
        setCreatorStatus('Card added to deck.');
    };

    const handleExport = () => {
        const data = exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `socraticdev-srs-export-${Date.now()}.json`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        importFileRef.current?.click();
    };

    const handleImportFile: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const result = importData(text, importMode);
            setImportStatus(`Imported ${result.importedCards} cards and ${result.importedReviews} reviews (${importMode}).`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to import file.';
            setImportStatus(message);
        } finally {
            event.target.value = '';
        }
    };

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)]">
            <header className="border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)]">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
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

            <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
                {!isLoaded && (
                    <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-6 text-[color:var(--color-text-muted)]">
                        Loading flashcard data...
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        {
                            label: 'Total Cards',
                            value: totalCards,
                            icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>),
                            color: 'text-blue-400',
                        },
                        {
                            label: 'Due Today',
                            value: dueCards.length,
                            icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>),
                            color: 'text-orange-400',
                        },
                        {
                            label: 'Current Streak',
                            value: `${stats.currentStreak}d`,
                            icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>),
                            color: 'text-red-400',
                        },
                        {
                            label: 'Reviewed Today',
                            value: stats.cardsReviewedToday,
                            icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>),
                            color: 'text-green-400',
                        },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="p-4 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span>{stat.icon}</span>
                                <span className="text-sm text-[color:var(--color-text-muted)]">{stat.label}</span>
                            </div>
                            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-8 rounded-2xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-primary-500/20 text-center"
                >
                    <h2 className="text-2xl font-bold mb-2">
                        {dueCards.length > 0 ? `${dueCards.length} cards ready for review` : 'No cards due right now'}
                    </h2>
                    <p className="text-[color:var(--color-text-muted)] mb-6">
                        {dueCards.length > 0
                            ? 'Keep your streak alive! Review now for optimal retention.'
                            : 'Add some cards or wait for your next review session.'}
                    </p>

                    <div className="flex justify-center gap-4 flex-wrap">
                        {dueCards.length > 0 ? (
                            <Link
                                to="/srs/review"
                                className="px-6 py-3 rounded-xl font-medium bg-primary-500 hover:bg-primary-600 text-white transition-all"
                            >
                                Start Review
                            </Link>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="px-6 py-3 rounded-xl font-medium bg-[color:var(--color-bg-muted)] text-[color:var(--color-text-muted)] cursor-not-allowed"
                            >
                                Start Review
                            </button>
                        )}
                        <button
                            onClick={handleAddSampleCards}
                            className="px-6 py-3 rounded-xl font-medium bg-secondary-500 hover:bg-secondary-600 text-white transition-all"
                        >
                            Add Sample Cards
                        </button>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-6">
                    <section className="p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] space-y-4">
                        <h3 className="text-lg font-semibold">Create Flashcard</h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                            <label className="text-sm">
                                <div className="text-[color:var(--color-text-muted)] mb-1">Type</div>
                                <select
                                    value={creatorType}
                                    onChange={(e) => setCreatorType(e.target.value as Flashcard['type'])}
                                    className="w-full px-3 py-2 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)]"
                                >
                                    <option value="basic">Basic</option>
                                    <option value="cloze">Cloze</option>
                                    <option value="code">Code</option>
                                </select>
                            </label>
                            {creatorType === 'code' && (
                                <label className="text-sm">
                                    <div className="text-[color:var(--color-text-muted)] mb-1">Language</div>
                                    <input
                                        value={creatorLanguage}
                                        onChange={(e) => setCreatorLanguage(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)]"
                                        placeholder="python"
                                    />
                                </label>
                            )}
                        </div>

                        <label className="block text-sm">
                            <div className="text-[color:var(--color-text-muted)] mb-1">
                                Front {creatorType === 'cloze' ? '(use [...] for blanks)' : ''}
                            </div>
                            <textarea
                                value={creatorFront}
                                onChange={(e) => setCreatorFront(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)]"
                            />
                        </label>

                        <label className="block text-sm">
                            <div className="text-[color:var(--color-text-muted)] mb-1">Back</div>
                            <textarea
                                value={creatorBack}
                                onChange={(e) => setCreatorBack(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)]"
                            />
                        </label>

                        <label className="block text-sm">
                            <div className="text-[color:var(--color-text-muted)] mb-1">Tags (comma separated)</div>
                            <input
                                value={creatorTags}
                                onChange={(e) => setCreatorTags(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)]"
                                placeholder="algorithms, recursion"
                            />
                        </label>

                        {creatorStatus && (
                            <p className="text-sm text-[color:var(--color-text-muted)]">{creatorStatus}</p>
                        )}

                        <button
                            onClick={handleCreateCard}
                            className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
                        >
                            Add Card
                        </button>
                    </section>

                    <section className="p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] space-y-4">
                        <h3 className="text-lg font-semibold">SRS Settings</h3>
                        <label className="block text-sm">
                            <div className="text-[color:var(--color-text-muted)] mb-1">Daily review limit</div>
                            <input
                                type="number"
                                min={1}
                                max={500}
                                value={settings.dailyReviewLimit}
                                onChange={(e) => updateSettings({ dailyReviewLimit: Number(e.target.value) || 1 })}
                                className="w-full px-3 py-2 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)]"
                            />
                        </label>

                        <label className="block text-sm">
                            <div className="text-[color:var(--color-text-muted)] mb-1">Rating mode</div>
                            <select
                                value={settings.ratingMode}
                                onChange={(e) => updateSettings({ ratingMode: e.target.value as 'simple4' | 'full6' })}
                                className="w-full px-3 py-2 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)]"
                            >
                                <option value="simple4">Simple 4-button</option>
                                <option value="full6">Full 6-point (planned)</option>
                            </select>
                        </label>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={settings.autoCreateFromChat}
                                onChange={(e) => updateSettings({ autoCreateFromChat: e.target.checked })}
                            />
                            Auto-create cards from chat
                        </label>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={settings.autoCreateFromDojo}
                                onChange={(e) => updateSettings({ autoCreateFromDojo: e.target.checked })}
                            />
                            Auto-create cards from Dojo
                        </label>
                    </section>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    <section className="p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] space-y-4">
                        <h3 className="text-lg font-semibold">Export / Import</h3>
                        <div className="flex items-center gap-3 flex-wrap">
                            <button
                                onClick={handleExport}
                                className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
                            >
                                Export JSON
                            </button>
                            <select
                                value={importMode}
                                onChange={(e) => setImportMode(e.target.value as 'replace' | 'merge')}
                                className="px-3 py-2 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)]"
                            >
                                <option value="merge">Import mode: Merge</option>
                                <option value="replace">Import mode: Replace</option>
                            </select>
                            <button
                                onClick={handleImportClick}
                                className="px-4 py-2 rounded-lg bg-secondary-500 hover:bg-secondary-600 text-white font-medium transition-colors"
                            >
                                Import JSON
                            </button>
                            <input
                                ref={importFileRef}
                                type="file"
                                accept="application/json,.json"
                                onChange={handleImportFile}
                                className="hidden"
                            />
                        </div>
                        {importStatus && (
                            <p className="text-sm text-[color:var(--color-text-muted)]">{importStatus}</p>
                        )}
                    </section>

                    <section className="p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                        <h3 className="text-lg font-semibold mb-4">Deck Progress</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'New', count: progress.new, color: 'bg-blue-500' },
                                { label: 'Learning', count: progress.learning, color: 'bg-orange-500' },
                                { label: 'Review', count: progress.review, color: 'bg-green-500' },
                                { label: 'Mastered', count: progress.mastered, color: 'bg-violet-500' },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="p-3 rounded-lg bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)]"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                                        <span className="text-sm">{item.label}</span>
                                    </div>
                                    <div className="text-lg font-semibold">{item.count}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-sm text-[color:var(--color-text-muted)] space-y-1">
                            <div>Total reviews: {stats.totalReviews}</div>
                            <div>Accuracy: {stats.reviewAccuracy}%</div>
                            <div>Average ease factor: {stats.averageEaseFactor.toFixed(2)}</div>
                        </div>
                    </section>
                </div>

                <section className="p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                    <h3 className="text-lg font-semibold mb-4">Deck Manager</h3>
                    {recentCards.length === 0 ? (
                        <p className="text-sm text-[color:var(--color-text-muted)]">No cards in deck yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {recentCards.map((card) => (
                                <div
                                    key={card.id}
                                    className="flex items-start justify-between gap-3 p-3 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)]"
                                >
                                    <div>
                                        <div className="font-medium text-sm">{card.front.slice(0, 90)}</div>
                                        <div className="text-xs text-[color:var(--color-text-muted)] mt-1">
                                            {card.type.toUpperCase()} • {card.tags.join(', ') || 'no tags'}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteCard(card.id)}
                                        className="text-xs px-3 py-1 rounded-md border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <div className="p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                    <h3 className="text-lg font-semibold mb-4">How Spaced Repetition Works</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold">1</div>
                            <div>
                                <div className="font-medium mb-1">Review Cards</div>
                                <div className="text-sm text-[color:var(--color-text-muted)]">Rate how well you remembered each card</div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary-500/20 flex items-center justify-center text-secondary-400 font-bold">2</div>
                            <div>
                                <div className="font-medium mb-1">SM-2 Algorithm</div>
                                <div className="text-sm text-[color:var(--color-text-muted)]">Cards are scheduled at optimal intervals</div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400 font-bold">3</div>
                            <div>
                                <div className="font-medium mb-1">Long-term Memory</div>
                                <div className="text-sm text-[color:var(--color-text-muted)]">Move concepts from short to long-term memory</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default SRSDashboard;
