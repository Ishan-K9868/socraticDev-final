import { useState, useCallback, useEffect } from 'react';
import { gsap } from 'gsap';
import { sendMessageToGemini } from '../../services/gemini';
import Button from '../../ui/Button';
import ChallengeSourceBadge from './ChallengeSourceBadge';
import { getRandomTranslationExample } from './examples/translationExamples';
import { evaluateTranslation } from './evaluators';

interface TranslationChallenge {
    sourceCode: string;
    sourceLanguage: string;
    targetLanguage: string;
    correctSolution: string;
    hints: string[];
    explanation: string;
    source?: 'practice' | 'ai';
    isFallback?: boolean;
    fallbackReason?: string;
}

interface PairOption {
    id: string;
    source: string;
    target: string;
}

const LANGUAGE_PAIRS: PairOption[] = [
    { id: 'python_to_javascript', source: 'Python', target: 'JavaScript' },
    { id: 'javascript_to_python', source: 'JavaScript', target: 'Python' },
    { id: 'python_to_typescript', source: 'Python', target: 'TypeScript' },
    { id: 'callback_to_promise', source: 'Callback', target: 'Promise' },
    { id: 'promise_to_async_await', source: 'Promise', target: 'Async/Await' },
    { id: 'for_loop_to_map_filter', source: 'For Loop', target: 'Map/Filter' },
    { id: 'imperative_to_functional', source: 'Imperative', target: 'Functional' },
];

interface CodeTranslationProps {
    onComplete?: (score: number) => void;
    onBack?: () => void;
    useAI?: boolean;
}

function parseJsonObject<T>(response: string): T | null {
    const blockMatch = response.match(/```json\s*([\s\S]*?)```/i) || response.match(/```\s*([\s\S]*?)```/);
    const raw = (blockMatch?.[1] || response).trim();
    const objectMatch = raw.match(/\{[\s\S]*\}/);
    if (!objectMatch) return null;
    try {
        return JSON.parse(objectMatch[0]) as T;
    } catch {
        return null;
    }
}

function CodeTranslation({ onComplete, onBack, useAI = false }: CodeTranslationProps) {
    const [challenge, setChallenge] = useState<TranslationChallenge | null>(null);
    const [userSolution, setUserSolution] = useState('');
    const [isGenerating, setIsGenerating] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [selectedPair, setSelectedPair] = useState<PairOption>(LANGUAGE_PAIRS[0]);

    const resetState = useCallback(() => {
        setSubmitted(false);
        setFeedback(null);
        setUserSolution('');
        setHintsUsed(0);
        setShowHint(false);
    }, []);

    const loadHardcodedChallenge = useCallback((reason?: string) => {
        const example = getRandomTranslationExample(selectedPair.id);
        setChallenge({
            sourceCode: example.sourceCode,
            sourceLanguage: example.sourceLanguage,
            targetLanguage: example.targetLanguage,
            correctSolution: example.correctSolution,
            hints: example.hints,
            explanation: example.explanation,
            source: useAI ? 'ai' : 'practice',
            isFallback: Boolean(reason),
            fallbackReason: reason,
        });
        setIsGenerating(false);
    }, [selectedPair.id, useAI]);

    const generateAIChallenge = useCallback(async () => {
        setIsGenerating(true);
        resetState();

        try {
            const response = await sendMessageToGemini([
                {
                    role: 'user',
                    content: `Generate a Code Translation challenge.\n\nSource: ${selectedPair.source}\nTarget: ${selectedPair.target}\n\nRequirements:\n1. Create a short code snippet (5-10 lines) in source style\n2. Provide equivalent target code\n3. Include 2 hints\n4. Include concise explanation\n\nReturn ONLY valid JSON:\n{\n  "sourceCode": "...",\n  "sourceLanguage": "${selectedPair.source}",\n  "targetLanguage": "${selectedPair.target}",\n  "correctSolution": "...",\n  "hints": ["hint 1", "hint 2"],\n  "explanation": "..."\n}`,
                },
            ], 'building');

            const data = parseJsonObject<TranslationChallenge>(response);
            const valid = data
                && typeof data.sourceCode === 'string'
                && typeof data.correctSolution === 'string'
                && Array.isArray(data.hints)
                && data.hints.length > 0;

            if (!valid) {
                loadHardcodedChallenge('Invalid AI challenge payload');
                return;
            }

            setChallenge({
                sourceCode: data.sourceCode,
                sourceLanguage: data.sourceLanguage || selectedPair.source,
                targetLanguage: data.targetLanguage || selectedPair.target,
                correctSolution: data.correctSolution,
                hints: data.hints,
                explanation: data.explanation || 'Equivalent translation of source behavior.',
                source: 'ai',
                isFallback: false,
            });
        } catch {
            loadHardcodedChallenge('AI generation failed');
        } finally {
            setIsGenerating(false);
        }
    }, [selectedPair, resetState, loadHardcodedChallenge]);

    const refreshChallenge = useCallback(() => {
        resetState();
        if (useAI) {
            void generateAIChallenge();
        } else {
            loadHardcodedChallenge();
        }
    }, [useAI, generateAIChallenge, loadHardcodedChallenge, resetState]);

    useEffect(() => {
        refreshChallenge();
    }, [refreshChallenge]);

    const handleSubmit = useCallback(async () => {
        if (!challenge || !userSolution.trim()) return;

        setSubmitted(true);
        setIsGenerating(true);

        const localEval = evaluateTranslation(userSolution, challenge.correctSolution);

        let finalFeedback = localEval;

        if (useAI) {
            try {
                const response = await sendMessageToGemini([
                    {
                        role: 'user',
                        content: `Compare translations semantically.\n\nSource (${challenge.sourceLanguage}):\n\n${challenge.sourceCode}\n\nExpected (${challenge.targetLanguage}):\n\n${challenge.correctSolution}\n\nUser: \n\n${userSolution}\n\nReturn ONLY JSON:\n{\n  "correct": true/false,\n  "message": "brief reason"\n}`,
                    },
                ], 'building');
                const aiEval = parseJsonObject<{ correct: boolean; message: string }>(response);
                if (aiEval && typeof aiEval.correct === 'boolean' && typeof aiEval.message === 'string') {
                    finalFeedback = aiEval;
                }
            } catch {
                // Keep deterministic fallback result.
            }
        }

        setFeedback(finalFeedback);

        if (finalFeedback.correct) {
            const finalScore = Math.max(100 - hintsUsed * 20, 20);
            gsap.fromTo('.result-card', { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35 });
            setTimeout(() => onComplete?.(finalScore), 1400);
        }

        setIsGenerating(false);
    }, [challenge, userSolution, useAI, hintsUsed, onComplete]);

    const useHint = () => {
        if (!challenge || hintsUsed >= challenge.hints.length) return;
        setHintsUsed((prev) => prev + 1);
        setShowHint(true);
    };

    if (isGenerating && !challenge) {
        return (
            <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Generating Translation...</h2>
                    <p className="text-[color:var(--color-text-muted)]">
                        Creating a {selectedPair.source} to {selectedPair.target} challenge
                    </p>
                </div>
            </div>
        );
    }

    if (!challenge) {
        return (
            <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-3">Unable to load challenge</h2>
                    <Button onClick={refreshChallenge}>Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)] p-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                    <button onClick={onBack} className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)] mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dojo
                    </button>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">Code Translation Dojo</h1>
                            <p className="text-[color:var(--color-text-muted)] mt-1">Translate code between languages and paradigms</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <ChallengeSourceBadge source={challenge.source || (useAI ? 'ai' : 'practice')} isFallback={challenge.isFallback} fallbackReason={challenge.fallbackReason} />
                            <div className="text-lg font-mono text-primary-400">{challenge.sourceLanguage} to {challenge.targetLanguage}</div>
                        </div>
                    </div>
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                    {LANGUAGE_PAIRS.map((pair) => (
                        <button
                            key={pair.id}
                            onClick={() => setSelectedPair(pair)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${selectedPair.id === pair.id ? 'bg-primary-500 text-white' : 'bg-[color:var(--color-bg-secondary)] hover:bg-[color:var(--color-bg-muted)]'}`}
                        >
                            {pair.source} to {pair.target}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h3 className="font-semibold mb-3">Source ({challenge.sourceLanguage})</h3>
                        <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-700">
                            <pre className="p-4 font-mono text-sm text-neutral-100 overflow-x-auto whitespace-pre-wrap">{challenge.sourceCode}</pre>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-3">Target ({challenge.targetLanguage})</h3>
                        <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-700">
                            <textarea
                                value={userSolution}
                                onChange={(e) => setUserSolution(e.target.value)}
                                disabled={submitted && feedback?.correct}
                                placeholder={`Write equivalent ${challenge.targetLanguage} code...`}
                                className="w-full h-48 p-4 font-mono text-sm bg-transparent resize-none focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {showHint && hintsUsed > 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                        <h4 className="font-semibold text-yellow-400 mb-2">Hints</h4>
                        <ul className="text-sm space-y-1">
                            {challenge.hints.slice(0, hintsUsed).map((hint, i) => <li key={i}>- {hint}</li>)}
                        </ul>
                    </div>
                )}

                {feedback && (
                    <div className={`result-card rounded-xl p-4 mb-6 border-2 ${feedback.correct ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
                        <h4 className={`font-semibold ${feedback.correct ? 'text-green-400' : 'text-red-400'}`}>{feedback.correct ? 'Correct' : 'Not quite right'}</h4>
                        <p className="text-sm text-[color:var(--color-text-muted)]">{feedback.message}</p>
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <Button onClick={handleSubmit} disabled={!userSolution.trim() || isGenerating || (submitted && feedback?.correct)}>
                        {isGenerating ? 'Checking...' : 'Submit Translation'}
                    </Button>
                    <Button variant="secondary" onClick={useHint} disabled={hintsUsed >= challenge.hints.length}>
                        Hint ({challenge.hints.length - hintsUsed} left)
                    </Button>
                    <Button variant="ghost" onClick={refreshChallenge}>New Challenge</Button>
                </div>
            </div>
        </div>
    );
}

export default CodeTranslation;

