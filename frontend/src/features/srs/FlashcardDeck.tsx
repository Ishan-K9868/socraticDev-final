import { motion, AnimatePresence } from 'framer-motion';
import { Flashcard, SIMPLE_RATINGS, Quality } from './types';

interface FlashcardDeckProps {
    card: Flashcard;
    onRate: (quality: Quality) => void;
    showAnswer: boolean;
    onFlip: () => void;
    ratingDisabled?: boolean;
}

function renderClozePreview(content: string, reveal: boolean): string {
    if (reveal) {
        return content
            .replace(/\[\.\.\.\]/g, '(answer)')
            .replace(/\[(.+?)\]/g, '$1');
    }

    return content
        .replace(/\[\.\.\.\]/g, '_____')
        .replace(/\[(.+?)\]/g, '_____');
}

function extractCodeBlock(content: string): { language: string; code: string; before: string; after: string } | null {
    const fenceStart = content.indexOf('```');
    if (fenceStart < 0) return null;

    const fenceEnd = content.indexOf('```', fenceStart + 3);
    if (fenceEnd < 0) return null;

    const before = content.slice(0, fenceStart);
    const rawInside = content.slice(fenceStart + 3, fenceEnd);
    const after = content.slice(fenceEnd + 3);

    const normalizedInside = rawInside.replace(/\r\n/g, '\n');
    const firstLineBreak = normalizedInside.indexOf('\n');

    let language = '';
    let code = normalizedInside;

    if (firstLineBreak >= 0) {
        language = normalizedInside.slice(0, firstLineBreak).trim();
        code = normalizedInside.slice(firstLineBreak + 1);
    } else {
        const firstSpace = normalizedInside.search(/\s/);
        if (firstSpace > 0) {
            language = normalizedInside.slice(0, firstSpace).trim();
            code = normalizedInside.slice(firstSpace + 1);
        }
    }

    // Some generated cards encode newlines as literal \n in a single line.
    const decodedCode = code.replace(/\\n/g, '\n').trim();
    if (!decodedCode) return null;

    return {
        language: language.replace(/[^a-zA-Z0-9_+-]/g, ''),
        code: decodedCode,
        before,
        after,
    };
}

function FlashcardDeck({ card, onRate, showAnswer, onFlip, ratingDisabled = false }: FlashcardDeckProps) {
    const renderContent = (content: string, clozeReveal = false) => {
        if (card.type === 'cloze') {
            return (
                <div className="space-y-3">
                    <p className="text-lg leading-relaxed whitespace-pre-wrap">{renderClozePreview(content, clozeReveal)}</p>
                    <p className="text-xs text-[color:var(--color-text-muted)]">
                        Cloze preview mode: interactive blanks are not enabled yet in this wave.
                    </p>
                </div>
            );
        }

        const codeBlock = extractCodeBlock(content);
        if (codeBlock) {
            const { language, code, before, after } = codeBlock;

            return (
                <div>
                    {before && <p className="mb-4 whitespace-pre-wrap">{before}</p>}
                    <pre className="p-4 rounded-lg bg-neutral-900 border border-neutral-700 overflow-auto text-sm font-mono text-neutral-100">
                        <code className={`language-${language} whitespace-pre`}>{code}</code>
                    </pre>
                    {after && <p className="mt-4 whitespace-pre-wrap">{after}</p>}
                </div>
            );
        }

        return <p className="text-lg leading-relaxed whitespace-pre-wrap">{content}</p>;
    };

    return (
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
            <div className="w-full perspective-1000">
                <motion.div
                    className="relative w-full min-h-[300px] cursor-pointer"
                    onClick={!showAnswer ? onFlip : undefined}
                    animate={{ rotateY: showAnswer ? 180 : 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    <div
                        className={`absolute inset-0 p-8 rounded-2xl bg-[color:var(--color-bg-primary)] border-2 border-[color:var(--color-border)] backface-hidden ${showAnswer ? 'invisible' : ''}`}
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <div className="flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-4 flex-wrap">
                                <span className={`px-2 py-1 text-xs rounded-md font-medium ${card.type === 'code'
                                    ? 'bg-cyan-500/10 text-cyan-400'
                                    : card.type === 'cloze'
                                        ? 'bg-violet-500/10 text-violet-400'
                                        : 'bg-primary-500/10 text-primary-400'
                                    }`}>
                                    {card.type.toUpperCase()}
                                </span>
                                {card.type === 'cloze' && (
                                    <span className="text-xs px-2 py-1 rounded-md bg-violet-500/10 text-violet-400">
                                        preview mode
                                    </span>
                                )}
                                {card.language && (
                                    <span className="text-xs text-[color:var(--color-text-muted)]">{card.language}</span>
                                )}
                            </div>

                            <div className="flex-1 flex items-center justify-center">{renderContent(card.front)}</div>

                            <div className="text-center text-sm text-[color:var(--color-text-muted)]">
                                Click to reveal answer
                            </div>
                        </div>
                    </div>

                    <div
                        className={`absolute inset-0 p-8 rounded-2xl bg-[color:var(--color-bg-secondary)] border-2 border-primary-500/30 ${!showAnswer ? 'invisible' : ''}`}
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                        }}
                    >
                        <div className="flex flex-col h-full">
                            <div className="text-xs font-medium text-primary-400 mb-4">ANSWER</div>
                            <div className="flex-1 flex items-center justify-center">{renderContent(card.back, true)}</div>
                        </div>
                    </div>
                </motion.div>
            </div>

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
                                disabled={ratingDisabled}
                                className={`px-6 py-3 rounded-xl font-medium text-white transition-all ${ratingDisabled
                                    ? 'opacity-60 cursor-not-allowed'
                                    : `hover:scale-105 active:scale-95 ${color}`
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-6 flex items-center gap-4 text-xs text-[color:var(--color-text-muted)] flex-wrap justify-center">
                {card.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap justify-center">
                        {card.tags.map((tag) => (
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
