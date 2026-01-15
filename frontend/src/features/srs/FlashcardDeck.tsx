import { motion, AnimatePresence } from 'framer-motion';
import { Flashcard, SIMPLE_RATINGS, Quality } from './types';

interface FlashcardDeckProps {
    card: Flashcard;
    onRate: (quality: Quality) => void;
    showAnswer: boolean;
    onFlip: () => void;
}

function FlashcardDeck({ card, onRate, showAnswer, onFlip }: FlashcardDeckProps) {
    const renderContent = (content: string) => {
        // Check if content contains code blocks
        const codeBlockMatch = content.match(/```(\w+)?\n([\s\S]*?)```/);

        if (codeBlockMatch) {
            const language = codeBlockMatch[1] || '';
            const code = codeBlockMatch[2];
            const beforeCode = content.substring(0, codeBlockMatch.index);
            const afterCode = content.substring((codeBlockMatch.index || 0) + codeBlockMatch[0].length);

            return (
                <div>
                    {beforeCode && <p className="mb-4">{beforeCode}</p>}
                    <pre className="p-4 rounded-lg bg-neutral-900 border border-neutral-700 overflow-auto text-sm font-mono">
                        <code className={`language-${language}`}>{code.trim()}</code>
                    </pre>
                    {afterCode && <p className="mt-4">{afterCode}</p>}
                </div>
            );
        }

        return <p className="text-lg leading-relaxed">{content}</p>;
    };

    return (
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
            {/* Card */}
            <div className="w-full perspective-1000">
                <motion.div
                    className="relative w-full min-h-[300px] cursor-pointer"
                    onClick={onFlip}
                    animate={{ rotateY: showAnswer ? 180 : 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front */}
                    <div
                        className={`absolute inset-0 p-8 rounded-2xl bg-[color:var(--color-bg-primary)] border-2 border-[color:var(--color-border)] backface-hidden ${showAnswer ? 'invisible' : ''
                            }`}
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <div className="flex flex-col h-full">
                            {/* Card type badge */}
                            <div className="flex items-center gap-2 mb-4">
                                <span className={`px-2 py-1 text-xs rounded-md font-medium ${card.type === 'code'
                                    ? 'bg-cyan-500/10 text-cyan-400'
                                    : card.type === 'cloze'
                                        ? 'bg-violet-500/10 text-violet-400'
                                        : 'bg-primary-500/10 text-primary-400'
                                    }`}>
                                    {card.type.toUpperCase()}
                                </span>
                                {card.language && (
                                    <span className="text-xs text-[color:var(--color-text-muted)]">
                                        {card.language}
                                    </span>
                                )}
                            </div>

                            {/* Question */}
                            <div className="flex-1 flex items-center justify-center">
                                {renderContent(card.front)}
                            </div>

                            {/* Flip hint */}
                            <div className="text-center text-sm text-[color:var(--color-text-muted)]">
                                Click to reveal answer
                            </div>
                        </div>
                    </div>

                    {/* Back */}
                    <div
                        className={`absolute inset-0 p-8 rounded-2xl bg-[color:var(--color-bg-secondary)] border-2 border-primary-500/30 ${!showAnswer ? 'invisible' : ''
                            }`}
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                        }}
                    >
                        <div className="flex flex-col h-full">
                            <div className="text-xs font-medium text-primary-400 mb-4">ANSWER</div>

                            <div className="flex-1 flex items-center justify-center">
                                {renderContent(card.back)}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Rating buttons - only show when answer is visible */}
            <AnimatePresence>
                {showAnswer && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mt-8 flex flex-wrap justify-center gap-3"
                    >
                        <div className="text-sm text-[color:var(--color-text-muted)] w-full text-center mb-2">
                            How well did you remember?
                        </div>
                        {SIMPLE_RATINGS.map(({ quality, label, color }) => (
                            <button
                                key={quality}
                                onClick={() => onRate(quality)}
                                className={`px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-105 active:scale-95 ${color}`}
                            >
                                {label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Card info */}
            <div className="mt-6 flex items-center gap-4 text-xs text-[color:var(--color-text-muted)]">
                {card.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                        {card.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded bg-[color:var(--color-bg-muted)]">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
                <span>Interval: {card.interval}d</span>
                <span>Ease: {card.easeFactor.toFixed(2)}</span>
            </div>
        </div>
    );
}

export default FlashcardDeck;
