import { useState, useCallback, useEffect } from 'react';
import { gsap } from 'gsap';
import { sendMessageToGemini } from '../../services/gemini';
import Button from '../../ui/Button';
import { getRandomTranslationExample } from './examples/translationExamples';

interface TranslationChallenge {
    sourceCode: string;
    sourceLanguage: string;
    targetLanguage: string;
    correctSolution: string;
    hints: string[];
    explanation: string;
}

const LANGUAGE_PAIRS = [
    { source: 'Python', target: 'JavaScript' },
    { source: 'JavaScript', target: 'Python' },
    { source: 'Python', target: 'TypeScript' },
    { source: 'Callback', target: 'Promise' },
    { source: 'Promise', target: 'Async/Await' },
    { source: 'For Loop', target: 'Map/Filter' },
    { source: 'Imperative', target: 'Functional' }
];

interface CodeTranslationProps {
    onComplete?: (score: number) => void;
    onBack?: () => void;
    useAI?: boolean;
}

function CodeTranslation({ onComplete, onBack, useAI = false }: CodeTranslationProps) {
    const [challenge, setChallenge] = useState<TranslationChallenge | null>(null);
    const [userSolution, setUserSolution] = useState('');
    const [isGenerating, setIsGenerating] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [selectedPair, setSelectedPair] = useState(LANGUAGE_PAIRS[0]);

    const loadHardcodedChallenge = useCallback(() => {
        const example = getRandomTranslationExample(selectedPair.source.toLowerCase() + '-to-' + selectedPair.target.toLowerCase());
        setChallenge({
            sourceCode: example.sourceCode,
            sourceLanguage: example.sourceLanguage,
            targetLanguage: example.targetLanguage,
            correctSolution: example.correctSolution,
            hints: example.hints,
            explanation: example.explanation
        });
        setIsGenerating(false);
    }, [selectedPair]);

    // Generate challenge
    const generateChallenge = useCallback(async () => {
        setIsGenerating(true);
        setSubmitted(false);
        setFeedback(null);
        setUserSolution('');
        setHintsUsed(0);
        setShowHint(false);

        try {
            const response = await sendMessageToGemini([{
                role: 'user',
                content: `Generate a Code Translation challenge.

Source: ${selectedPair.source}
Target: ${selectedPair.target}

Requirements:
1. Create a short code snippet (5-10 lines) in the source language/style
2. Provide the equivalent code in the target language/style
3. The code should demonstrate a clear pattern or concept
4. Include 2 hints for users who get stuck
5. Include a brief explanation of the translation

Return ONLY valid JSON:
{
  "sourceCode": "the source code",
  "sourceLanguage": "${selectedPair.source}",
  "targetLanguage": "${selectedPair.target}",
  "correctSolution": "the target code",
  "hints": ["hint 1", "hint 2"],
  "explanation": "Brief explanation of the translation"
}`
            }], 'building');

            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                setChallenge(data);
            }
        } catch (error) {
            console.error('Failed to generate challenge:', error);
        } finally {
            setIsGenerating(false);
        }
    }, [selectedPair]);

    useEffect(() => {
        if (useAI) {
            generateChallenge();
        } else {
            loadHardcodedChallenge();
        }
    }, [useAI, generateChallenge, loadHardcodedChallenge]);

    const handleSubmit = useCallback(async () => {
        if (!challenge || !userSolution.trim()) return;

        setSubmitted(true);
        setIsGenerating(true);

        try {
            const response = await sendMessageToGemini([{
                role: 'user',
                content: `Compare these two code translations and determine if the user's solution is semantically correct.

Original (${challenge.sourceLanguage}):
\`\`\`
${challenge.sourceCode}
\`\`\`

Expected (${challenge.targetLanguage}):
\`\`\`
${challenge.correctSolution}
\`\`\`

User's solution:
\`\`\`
${userSolution}
\`\`\`

Evaluate if the user's solution is semantically equivalent (produces the same result). Minor syntax variations are okay.

Return ONLY valid JSON:
{
  "correct": true/false,
  "message": "Brief feedback explaining why it's correct or what's wrong (1-2 sentences)"
}`
            }], 'building');

            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                setFeedback(data);

                if (data.correct) {
                    const baseScore = 100;
                    const hintPenalty = hintsUsed * 20;
                    const finalScore = Math.max(baseScore - hintPenalty, 20);

                    gsap.fromTo('.result-card',
                        { scale: 0.9, opacity: 0 },
                        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
                    );

                    setTimeout(() => {
                        onComplete?.(finalScore);
                    }, 2000);
                }
            }
        } catch (error) {
            console.error('Failed to evaluate:', error);
        } finally {
            setIsGenerating(false);
        }
    }, [challenge, userSolution, hintsUsed, onComplete]);

    const useHint = () => {
        if (!challenge || hintsUsed >= challenge.hints.length) return;
        setHintsUsed(prev => prev + 1);
        setShowHint(true);
    };

    if (isGenerating && !challenge) {
        return (
            <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-pulse">🌐</div>
                    <h2 className="text-xl font-bold mb-2">Generating Translation...</h2>
                    <p className="text-[color:var(--color-text-muted)]">
                        Creating a {selectedPair.source} → {selectedPair.target} challenge
                    </p>
                </div>
            </div>
        );
    }

    if (!challenge) return null;

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)] p-6">
            <div className="max-w-5xl mx-auto">
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
                                <span className="text-3xl">🌐</span>
                                Code Translation Dojo
                            </h1>
                            <p className="text-[color:var(--color-text-muted)] mt-1">
                                Translate code between languages and paradigms
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-mono text-primary-400">
                                {challenge.sourceLanguage} → {challenge.targetLanguage}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Language Pair Selector */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {LANGUAGE_PAIRS.map((pair, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setSelectedPair(pair);
                            }}
                            className={`
                                px-3 py-1.5 rounded-lg text-sm transition-all
                                ${selectedPair === pair
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-[color:var(--color-bg-secondary)] hover:bg-[color:var(--color-bg-muted)]'
                                }
                            `}
                        >
                            {pair.source} → {pair.target}
                        </button>
                    ))}
                </div>

                {/* Code Panels */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Source Code */}
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <span className="text-lg">📥</span>
                            Source ({challenge.sourceLanguage})
                        </h3>
                        <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-700">
                            <div className="px-4 py-2 bg-neutral-800 border-b border-neutral-700 text-sm text-neutral-400">
                                Translate this code
                            </div>
                            <pre className="p-4 font-mono text-sm text-neutral-100 overflow-x-auto whitespace-pre-wrap">
                                {challenge.sourceCode}
                            </pre>
                        </div>
                    </div>

                    {/* Target Input */}
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <span className="text-lg">📤</span>
                            Target ({challenge.targetLanguage})
                        </h3>
                        <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-700">
                            <div className="px-4 py-2 bg-neutral-800 border-b border-neutral-700 text-sm text-neutral-400">
                                Write equivalent code
                            </div>
                            <textarea
                                value={userSolution}
                                onChange={(e) => setUserSolution(e.target.value)}
                                disabled={submitted && feedback?.correct}
                                placeholder={`Write the equivalent ${challenge.targetLanguage} code here...`}
                                className="w-full h-48 p-4 font-mono text-sm bg-transparent resize-none focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Hints */}
                {showHint && hintsUsed > 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                        <h4 className="font-semibold text-yellow-400 mb-2">💡 Hints</h4>
                        <ul className="text-sm space-y-1">
                            {challenge.hints.slice(0, hintsUsed).map((hint, i) => (
                                <li key={i}>• {hint}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Feedback */}
                {feedback && (
                    <div className={`
                        result-card rounded-xl p-4 mb-6 border-2
                        ${feedback.correct
                            ? 'bg-green-500/10 border-green-500'
                            : 'bg-red-500/10 border-red-500'
                        }
                    `}>
                        <div className="flex items-start gap-3">
                            <div className="text-3xl">
                                {feedback.correct ? '🎉' : '🤔'}
                            </div>
                            <div>
                                <h4 className={`font-semibold ${feedback.correct ? 'text-green-400' : 'text-red-400'}`}>
                                    {feedback.correct ? 'Correct!' : 'Not quite right'}
                                </h4>
                                <p className="text-sm text-[color:var(--color-text-muted)]">
                                    {feedback.message}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Show correct solution after wrong answer */}
                {feedback && !feedback.correct && (
                    <div className="bg-[color:var(--color-bg-secondary)] rounded-xl p-4 mb-6 border border-[color:var(--color-border)]">
                        <h4 className="font-semibold mb-3">✅ Expected Solution:</h4>
                        <pre className="font-mono text-sm text-neutral-100 bg-neutral-800 p-4 rounded-lg overflow-x-auto">
                            {challenge.correctSolution}
                        </pre>
                        <p className="text-sm text-[color:var(--color-text-muted)] mt-3">
                            {challenge.explanation}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Button
                        onClick={handleSubmit}
                        disabled={!userSolution.trim() || isGenerating || (submitted && feedback?.correct)}
                    >
                        {isGenerating ? 'Checking...' : 'Submit Translation'}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={useHint}
                        disabled={hintsUsed >= challenge.hints.length}
                    >
                        Hint ({challenge.hints.length - hintsUsed} left)
                    </Button>
                    <Button variant="ghost" onClick={generateChallenge}>
                        New Challenge
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default CodeTranslation;
