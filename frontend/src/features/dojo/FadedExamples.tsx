import { useState, useCallback, useEffect } from 'react';
import { gsap } from 'gsap';
import { FadedChallenge as FadedChallengeType } from './types';
import { useChallengeAI } from './useChallengeAI';
import Button from '../../ui/Button';
import { getRandomFadedExample } from './examples/fadedExamples';
import ChallengeSourceBadge from './ChallengeSourceBadge';

interface FadedExamplesProps {
    topic?: string;
    language?: string;
    onComplete?: (score: number) => void;
    onBack?: () => void;
    useAI?: boolean;
}

function FadedExamples({
    topic = 'factorial function',
    language = 'python',
    onComplete,
    onBack,
    useAI = false
}: FadedExamplesProps) {
    const [challenge, setChallenge] = useState<FadedChallengeType | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [results, setResults] = useState<Record<string, boolean>>({});
    const [submitted, setSubmitted] = useState(false);
    const [hintsUsed, setHintsUsed] = useState<Set<string>>(new Set());
    const selectedLanguage = language;

    const { generateFadedChallenge, isGenerating, error } = useChallengeAI();

    const loadHardcodedChallenge = useCallback(() => {
        const example = getRandomFadedExample(selectedLanguage);
        const challengeData: FadedChallengeType = {
            id: `faded-${Date.now()}`,
            type: 'faded',
            title: example.title,
            description: example.description,
            difficulty: 'intermediate',
            topic: example.title,
            language: example.language,
            fullCode: example.fullCode,
            template: example.template,
            blanks: example.blanks,
            points: 50,
            source: useAI ? 'ai' : 'practice',
        };
        setChallenge(challengeData);
        const initial: Record<string, string> = {};
        challengeData.blanks.forEach(b => { initial[b.id] = ''; });
        setAnswers(initial);
        setResults({});
        setSubmitted(false);
        setHintsUsed(new Set());
    }, [selectedLanguage, useAI]);

    // Generate challenge on mount
    useEffect(() => {
        if (useAI) {
            const loadChallenge = async () => {
                const generated = await generateFadedChallenge(topic, selectedLanguage);
                if (generated.challenge) {
                    setChallenge(generated.challenge);
                    const initial: Record<string, string> = {};
                    generated.challenge.blanks.forEach(b => { initial[b.id] = ''; });
                    setAnswers(initial);
                    setResults({});
                    setSubmitted(false);
                    setHintsUsed(new Set());
                } else {
                    loadHardcodedChallenge();
                }
            };
            loadChallenge();
        } else {
            loadHardcodedChallenge();
        }
    }, [useAI, topic, selectedLanguage, generateFadedChallenge, loadHardcodedChallenge]);

    const handleInputChange = useCallback((blankId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [blankId]: value }));
    }, []);

    const useHint = useCallback((blankId: string) => {
        if (!challenge) return;
        setHintsUsed(prev => new Set([...prev, blankId]));
    }, [challenge]);

    const checkAnswers = useCallback(() => {
        if (!challenge) return;

        setSubmitted(true);
        const newResults: Record<string, boolean> = {};
        let correctCount = 0;

        challenge.blanks.forEach(blank => {
            const userAnswer = answers[blank.id]?.trim().toLowerCase();
            const correctAnswer = blank.answer.toLowerCase();
            const isCorrect = userAnswer === correctAnswer;
            newResults[blank.id] = isCorrect;
            if (isCorrect) correctCount++;

            // Animate result
            const el = document.querySelector(`#blank-${blank.id}`);
            if (el) {
                gsap.fromTo(el,
                    { scale: 1 },
                    { scale: 1.1, duration: 0.15, yoyo: true, repeat: 1 }
                );
            }
        });

        setResults(newResults);

        if (correctCount === challenge.blanks.length) {
            const baseScore = challenge.points;
            const hintPenalty = hintsUsed.size * 10;
            const finalScore = Math.max(baseScore - hintPenalty, 10);

            setTimeout(() => {
                onComplete?.(finalScore);
            }, 2000);
        }
    }, [challenge, answers, hintsUsed, onComplete]);

    const resetChallenge = useCallback(() => {
        if (!challenge) return;
        const initial: Record<string, string> = {};
        challenge.blanks.forEach(b => { initial[b.id] = ''; });
        setAnswers(initial);
        setResults({});
        setSubmitted(false);
        setHintsUsed(new Set());
    }, [challenge]);

    // Render code with input fields
    const renderCodeWithBlanks = () => {
        if (!challenge) return null;

        // Simple approach: split by ___ and insert inputs
        const parts = challenge.template.split('___');

        return (
            <pre className="font-mono text-sm text-neutral-100 whitespace-pre-wrap">
                {parts.map((part, index) => (
                    <span key={index}>
                        {part}
                        {index < challenge.blanks.length && (
                            <span className="inline-block">
                                <input
                                    id={`blank-${challenge.blanks[index].id}`}
                                    type="text"
                                    value={answers[challenge.blanks[index].id] || ''}
                                    onChange={(e) => handleInputChange(challenge.blanks[index].id, e.target.value)}
                                    disabled={submitted}
                                    placeholder={hintsUsed.has(challenge.blanks[index].id)
                                        ? challenge.blanks[index].hint
                                        : '...'
                                    }
                                    className={`
                                        inline-block w-24 px-2 py-0.5 mx-1 rounded border-2 
                                        font-mono text-sm text-center bg-neutral-800
                                        focus:outline-none focus:ring-2 focus:ring-primary-500
                                        ${submitted
                                            ? results[challenge.blanks[index].id]
                                                ? 'border-green-500 bg-green-500/20'
                                                : 'border-red-500 bg-red-500/20'
                                            : 'border-primary-500/50'
                                        }
                                    `}
                                    style={{ width: `${Math.max(80, challenge.blanks[index].length * 12)}px` }}
                                />
                                {!submitted && !hintsUsed.has(challenge.blanks[index].id) && (
                                    <button
                                        onClick={() => useHint(challenge.blanks[index].id)}
                                        className="ml-1 text-yellow-500 hover:text-yellow-400 text-xs"
                                        title="Get hint"
                                    >
                                        💡
                                    </button>
                                )}
                            </span>
                        )}
                    </span>
                ))}
            </pre>
        );
    };

    const getCorrectCount = () => {
        return Object.values(results).filter(Boolean).length;
    };

    if (isGenerating) {
        return (
            <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-pulse">✏️</div>
                    <h2 className="text-xl font-bold mb-2">Creating Blanks...</h2>
                    <p className="text-[color:var(--color-text-muted)]">
                        Preparing fill-in-the-blanks for "{topic}"
                    </p>
                </div>
            </div>
        );
    }

    if (error && !challenge) {
        return (
            <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-xl font-bold mb-2">Challenge Failed</h2>
                    <p className="text-[color:var(--color-text-muted)] mb-4">{error}</p>
                    <Button onClick={onBack}>Go Back</Button>
                </div>
            </div>
        );
    }

    if (!challenge) {
        return (
            <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center">
                <div className="text-center max-w-md">
                    <h2 className="text-xl font-bold mb-2">Challenge unavailable</h2>
                    <Button onClick={loadHardcodedChallenge}>Load Practice Challenge</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)] p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={onBack}
                        className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)] mb-4 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dojo
                    </button>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-3">
                                <span className="text-3xl">✏️</span>
                                Fill in the Blanks
                            </h1>
                            <p className="text-[color:var(--color-text-muted)] mt-1">
                                {challenge.description}
                            </p>
                        </div>
                        <div className="text-right">
                            <ChallengeSourceBadge
                                source={challenge.source || (useAI ? 'ai' : 'practice')}
                                isFallback={challenge.isFallback}
                                fallbackReason={challenge.fallbackReason}
                            />
                            <div className="text-2xl font-bold text-primary-400">{challenge.points} pts</div>
                            <div className="text-xs text-[color:var(--color-text-muted)]">
                                {challenge.blanks.length} blanks to fill
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-green-400 mb-2">📝 Instructions</h3>
                    <ul className="text-sm space-y-1 text-[color:var(--color-text-muted)]">
                        <li>• Fill in the missing parts of the code</li>
                        <li>• Pay attention to variable names, operators, and keywords</li>
                        <li>• Click 💡 next to a blank for a hint (costs 10 pts)</li>
                    </ul>
                </div>

                {/* Code with Blanks */}
                <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-700 mb-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800 border-b border-neutral-700">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="ml-2 font-mono text-sm text-neutral-400">{challenge.language}</span>
                    </div>
                    <div className="p-6">
                        {renderCodeWithBlanks()}
                    </div>
                </div>

                {/* Results */}
                {submitted && (
                    <div className={`
                        rounded-xl p-4 mb-6 border-2 text-center
                        ${getCorrectCount() === challenge.blanks.length
                            ? 'bg-green-500/10 border-green-500 text-green-400'
                            : 'bg-yellow-500/10 border-yellow-500 text-yellow-400'
                        }
                    `}>
                        {getCorrectCount() === challenge.blanks.length ? (
                            <div>
                                <div className="text-4xl mb-2">🎉</div>
                                <h3 className="text-xl font-bold">Perfect!</h3>
                                <p className="text-sm opacity-80">You filled all blanks correctly!</p>
                            </div>
                        ) : (
                            <div>
                                <div className="text-4xl mb-2">📝</div>
                                <h3 className="text-xl font-bold">
                                    {getCorrectCount()}/{challenge.blanks.length} Correct
                                </h3>
                                <p className="text-sm opacity-80">Check the red blanks and try again</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Show correct answers after submit */}
                {submitted && getCorrectCount() < challenge.blanks.length && (
                    <div className="bg-[color:var(--color-bg-secondary)] rounded-xl p-4 mb-6 border border-[color:var(--color-border)]">
                        <h4 className="font-semibold mb-3">❌ Incorrect Answers:</h4>
                        <div className="space-y-2">
                            {challenge.blanks.filter(b => !results[b.id]).map(blank => (
                                <div key={blank.id} className="flex items-center gap-2 text-sm">
                                    <span className="text-red-400">Your answer: "{answers[blank.id]}"</span>
                                    <span className="text-[color:var(--color-text-muted)]">→</span>
                                    <span className="text-green-400">Correct: "{blank.answer}"</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Button
                        onClick={checkAnswers}
                        disabled={submitted && getCorrectCount() === challenge.blanks.length}
                    >
                        Check Answers
                    </Button>
                    <Button variant="ghost" onClick={resetChallenge}>
                        Reset
                    </Button>
                    <span className="ml-auto text-sm text-[color:var(--color-text-muted)]">
                        Hints used: {hintsUsed.size} (-{hintsUsed.size * 10} pts)
                    </span>
                </div>
            </div>
        </div>
    );
}

export default FadedExamples;

