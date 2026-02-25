import { useState, useCallback, useEffect } from 'react';
import { gsap } from 'gsap';
import { MentalChallenge as MentalChallengeType } from './types';
import { useChallengeAI } from './useChallengeAI';
import Button from '../../ui/Button';
import { getRandomMentalExample } from './examples/mentalExamples';
import ChallengeSourceBadge from './ChallengeSourceBadge';

interface MentalCompilerProps {
    topic?: string;
    language?: string;
    onComplete?: (score: number) => void;
    onBack?: () => void;
    useAI?: boolean;
}

function MentalCompiler({
    topic = 'loops and conditions',
    language = 'python',
    onComplete,
    onBack,
    useAI = false
}: MentalCompilerProps) {
    const [challenge, setChallenge] = useState<MentalChallengeType | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [showTrace, setShowTrace] = useState(false);
    const [currentTraceStep, setCurrentTraceStep] = useState(0);
    const [isPlayingTrace, setIsPlayingTrace] = useState(false);
    const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
    const selectedLanguage = language;

    const { generateMentalChallenge, isGenerating, error } = useChallengeAI();

    const loadHardcodedChallenge = useCallback(() => {
        const example = getRandomMentalExample(selectedLanguage);
        const challengeData: MentalChallengeType = {
            id: `mental-${Date.now()}`,
            type: 'mental',
            title: example.title,
            description: example.description,
            difficulty: 'intermediate',
            topic: 'code tracing',
            language: example.language || selectedLanguage,
            code: example.code,
            expectedOutput: example.expectedOutput,
            wrongOptions: example.wrongOptions,
            traceSteps: example.traceSteps,
            points: 50,
            source: useAI ? 'ai' : 'practice',
        };
        setChallenge(challengeData);
        setSelectedAnswer(null);
        setSubmitted(false);
        setShowTrace(false);
        setCurrentTraceStep(0);
        setIsPlayingTrace(false);
        setHighlightedLine(null);
    }, [selectedLanguage, useAI]);

    // Generate challenge on mount
    useEffect(() => {
        if (useAI) {
            const loadChallenge = async () => {
                const generated = await generateMentalChallenge(topic, selectedLanguage);
                if (generated.challenge) {
                    setChallenge(generated.challenge);
                    setSelectedAnswer(null);
                    setSubmitted(false);
                    setShowTrace(false);
                    setCurrentTraceStep(0);
                    setIsPlayingTrace(false);
                    setHighlightedLine(null);
                } else {
                    loadHardcodedChallenge();
                }
            };
            loadChallenge();
        } else {
            loadHardcodedChallenge();
        }
    }, [useAI, topic, selectedLanguage, generateMentalChallenge, loadHardcodedChallenge]);

    const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
    useEffect(() => {
        if (!challenge) return;
        setShuffledOptions([challenge.expectedOutput, ...challenge.wrongOptions].sort(() => Math.random() - 0.5));
    }, [challenge]);

    const handleSubmit = useCallback(() => {
        if (!challenge || !selectedAnswer) return;

        setSubmitted(true);

        const isCorrect = selectedAnswer === challenge.expectedOutput;

        // Animate result
        gsap.fromTo('.answer-options',
            { scale: 1 },
            { scale: isCorrect ? 1.02 : 0.98, duration: 0.2, yoyo: true, repeat: 1 }
        );

        if (isCorrect) {
            setTimeout(() => {
                onComplete?.(challenge.points);
            }, 2000);
        } else {
            // Show trace for wrong answers
            setShowTrace(true);
        }
    }, [challenge, selectedAnswer, onComplete]);

    const playTrace = useCallback(() => {
        if (!challenge) return;

        setIsPlayingTrace(true);
        setCurrentTraceStep(0);

        let step = 0;
        const interval = setInterval(() => {
            if (step >= challenge.traceSteps.length) {
                clearInterval(interval);
                setIsPlayingTrace(false);
                setHighlightedLine(null);
                return;
            }

            const currentStep = challenge.traceSteps[step];
            setCurrentTraceStep(step);
            setHighlightedLine(currentStep.line);

            // Highlight the line
            gsap.fromTo(`.code-line-${currentStep.line}`,
                { backgroundColor: 'rgba(59, 130, 246, 0.3)' },
                { backgroundColor: 'rgba(59, 130, 246, 0.1)', duration: 0.5 }
            );

            step++;
        }, 1500);

    }, [challenge]);

    useEffect(() => {
        return () => {
            setIsPlayingTrace(false);
            setHighlightedLine(null);
        };
    }, []);

    const isCorrect = submitted && selectedAnswer === challenge?.expectedOutput;

    if (isGenerating) {
        return (
            <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold mb-2">Generating Challenge...</h2>
                    <p className="text-[color:var(--color-text-muted)]">
                        Creating a mental puzzle about "{topic}"
                    </p>
                </div>
            </div>
        );
    }

    if (error && !challenge) {
        return (
            <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
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

    const codeLines = challenge.code.split('\n');

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)] p-6">
            <div className="max-w-4xl mx-auto">
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
                                <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                Mental Compiler
                            </h1>
                            <p className="text-[color:var(--color-text-muted)] mt-1">
                                {challenge.description} - DON'T run it, trace it in your head!
                            </p>
                        </div>
                        <div className="text-right">
                            <ChallengeSourceBadge
                                source={challenge.source || (useAI ? 'ai' : 'practice')}
                                isFallback={challenge.isFallback}
                                fallbackReason={challenge.fallbackReason}
                            />
                            <div className="text-2xl font-bold text-primary-400">{challenge.points} pts</div>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-violet-400 mb-2">Challenge</h3>
                    <p className="text-sm">
                        Read the code carefully and predict what will be printed.
                        <strong className="text-violet-300"> Don't run it - trace it mentally!</strong>
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Code Display */}
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            Code
                        </h3>
                        <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-700">
                            <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800 border-b border-neutral-700">
                                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                <span className="ml-2 font-mono text-sm text-neutral-400">{challenge.language}</span>
                            </div>
                            <div className="p-4">
                                {codeLines.map((line, index) => {
                                    const lineNum = index + 1;
                                    const isHighlighted = highlightedLine === lineNum;

                                    return (
                                        <div
                                            key={index}
                                            className={`
                                                code-line-${lineNum}
                                                flex items-start gap-4 px-2 py-0.5 rounded
                                                transition-all duration-200
                                                ${isHighlighted ? 'bg-blue-500/20' : ''}
                                            `}
                                        >
                                            <span className="text-neutral-500 text-sm w-4 text-right select-none">
                                                {lineNum}
                                            </span>
                                            <code className="font-mono text-sm text-neutral-100 whitespace-pre">
                                                {line || ' '}
                                            </code>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Trace Visualization */}
                        {showTrace && challenge.traceSteps.length > 0 && (
                            <div className="mt-4 bg-[color:var(--color-bg-secondary)] rounded-xl p-4 border border-[color:var(--color-border)]">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold">🔍 Step-by-Step Trace</h4>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={playTrace}
                                        disabled={isPlayingTrace}
                                    >
                                        {isPlayingTrace ? '▶️ Playing...' : '▶️ Play Trace'}
                                    </Button>
                                </div>

                                {challenge.traceSteps.map((step, idx) => (
                                    <div
                                        key={idx}
                                        className={`
                                            p-2 rounded mb-2 text-sm
                                            ${currentTraceStep === idx && isPlayingTrace
                                                ? 'bg-blue-500/20 border border-blue-500'
                                                : 'bg-[color:var(--color-bg-muted)]'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs bg-neutral-600 px-1.5 py-0.5 rounded">
                                                Line {step.line}
                                            </span>
                                            <span className="text-[color:var(--color-text-muted)]">
                                                {step.explanation}
                                            </span>
                                        </div>
                                        <div className="font-mono text-xs text-primary-400">
                                            Variables: {JSON.stringify(step.variables)}
                                        </div>
                                        {step.output && (
                                            <div className="font-mono text-xs text-green-400 mt-1">
                                                Output: {step.output}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Answer Options */}
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            What's the output?
                        </h3>
                        <div className="answer-options space-y-3">
                            {shuffledOptions.map((option, index) => {
                                const isSelected = selectedAnswer === option;
                                const isCorrectAnswer = option === challenge.expectedOutput;
                                const showResult = submitted;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => !submitted && setSelectedAnswer(option)}
                                        disabled={submitted}
                                        className={`
                                            w-full p-4 rounded-xl border-2 text-left font-mono
                                            transition-all duration-200
                                            ${!submitted && isSelected
                                                ? 'border-primary-500 bg-primary-500/10'
                                                : !submitted
                                                    ? 'border-[color:var(--color-border)] hover:border-primary-400 bg-[color:var(--color-bg-secondary)]'
                                                    : ''
                                            }
                                            ${showResult && isCorrectAnswer
                                                ? 'border-green-500 bg-green-500/10'
                                                : ''
                                            }
                                            ${showResult && isSelected && !isCorrectAnswer
                                                ? 'border-red-500 bg-red-500/10'
                                                : ''
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`
                                                w-6 h-6 rounded-full border-2 flex items-center justify-center
                                                ${isSelected ? 'border-primary-500' : 'border-neutral-500'}
                                                ${showResult && isCorrectAnswer ? 'border-green-500 bg-green-500' : ''}
                                                ${showResult && isSelected && !isCorrectAnswer ? 'border-red-500 bg-red-500' : ''}
                                            `}>
                                                {showResult && isCorrectAnswer && <span className="text-white text-xs">✓</span>}
                                                {showResult && isSelected && !isCorrectAnswer && <span className="text-white text-xs">✗</span>}
                                            </div>
                                            <pre className="flex-1 whitespace-pre-wrap">{option}</pre>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Result Message */}
                        {submitted && (
                            <div className={`
                                mt-6 p-4 rounded-xl border-2 text-center
                                ${isCorrect
                                    ? 'border-green-500 bg-green-500/10 text-green-400'
                                    : 'border-red-500 bg-red-500/10 text-red-400'
                                }
                            `}>
                                {isCorrect ? (
                                    <div>
                                        <div className="text-4xl mb-2">🎉</div>
                                        <h3 className="text-xl font-bold">Correct!</h3>
                                        <p className="text-sm opacity-80">
                                            Your mental compiler is working perfectly!
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="text-4xl mb-2">🤔</div>
                                        <h3 className="text-xl font-bold">Not quite!</h3>
                                        <p className="text-sm opacity-80">
                                            Watch the step-by-step trace to see where you went wrong.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="mt-6">
                            <Button
                                onClick={handleSubmit}
                                disabled={!selectedAnswer || submitted}
                                className="w-full"
                            >
                                {submitted ? 'Submitted' : 'Check My Answer'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MentalCompiler;

