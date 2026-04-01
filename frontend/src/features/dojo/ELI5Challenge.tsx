import { useState, useCallback, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import { ELI5Challenge as ELI5ChallengeType } from './types';
import { useChallengeAI } from './useChallengeAI';
import Button from '../../ui/Button';
import { getRandomELI5Example } from './examples/eli5Examples';
import ChallengeSourceBadge from './ChallengeSourceBadge';
import {
    calculateELI5ReadabilityScore,
    detectJargonWords,
    evaluateELI5Explanation,
    getELI5SimplicityLabel,
    Eli5EvaluationResult,
} from './eli5Evaluation';

interface ELI5Props {
    topic?: string;
    language?: string;
    onComplete?: (score: number) => void;
    onBack?: () => void;
    useAI?: boolean;
}

function ELI5Challenge({
    topic = 'for loops',
    language = 'python',
    onComplete,
    onBack,
    useAI = false
}: ELI5Props) {
    const [challenge, setChallenge] = useState<ELI5ChallengeType | null>(null);
    const [explanation, setExplanation] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [score, setScore] = useState<number | null>(null);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [evaluation, setEvaluation] = useState<Eli5EvaluationResult | null>(null);
    const selectedLanguage = language;

    const { generateELI5Challenge, isGenerating, error } = useChallengeAI();

    const loadHardcodedChallenge = useCallback(() => {
        const example = getRandomELI5Example(selectedLanguage);
        const challengeData: ELI5ChallengeType = {
            id: `eli5-${Date.now()}`,
            type: 'eli5',
            title: example.title,
            description: example.description,
            difficulty: 'intermediate',
            topic: example.title,
            language: example.language,
            code: example.code,
            keyPoints: example.keyPoints,
            forbiddenWords: example.forbiddenWords,
            targetGradeLevel: 5,
            points: 60,
            source: useAI ? 'ai' : 'practice',
        };
        setChallenge(challengeData);
        setExplanation('');
        setSubmitted(false);
        setAiResponse(null);
        setScore(null);
        setIsEvaluating(false);
        setEvaluation(null);
    }, [selectedLanguage, useAI]);

    // Generate challenge on mount
    useEffect(() => {
        if (useAI) {
            const loadChallenge = async () => {
                const generated = await generateELI5Challenge(topic, selectedLanguage);
                if (generated.challenge) {
                    setChallenge(generated.challenge);
                    setExplanation('');
                    setSubmitted(false);
                    setAiResponse(null);
                    setScore(null);
                    setIsEvaluating(false);
                    setEvaluation(null);
                } else {
                    loadHardcodedChallenge();
                }
            };
            loadChallenge();
        } else {
            loadHardcodedChallenge();
        }
    }, [useAI, topic, selectedLanguage, generateELI5Challenge, loadHardcodedChallenge]);

    // Detect jargon in text
    const detectedJargon = useMemo(() => {
        if (!challenge) return [];

        return detectJargonWords(explanation, challenge.forbiddenWords);
    }, [explanation, challenge]);

    // Calculate readability score (simplified Flesch-Kincaid)
    const readabilityScore = useMemo(() => {
        return calculateELI5ReadabilityScore(explanation);
    }, [explanation]);

    const handleSubmit = useCallback(async () => {
        if (!challenge || explanation.trim().length < 20) return;

        setIsEvaluating(true);
        setSubmitted(true);
        const result = await evaluateELI5Explanation(challenge, explanation);

        setEvaluation(result);
        setScore(result.finalScore);
        setAiResponse(result.feedback);
        setIsEvaluating(false);

        gsap.fromTo('.score-display',
            { scale: 0.5, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
        );

        if (result.finalScore >= 50 && !result.isOffTopic) {
            setTimeout(() => {
                onComplete?.(result.finalScore);
            }, 3000);
        }
    }, [challenge, explanation, onComplete]);

    if (isGenerating) {
        return (
            <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce">👶</div>
                    <h2 className="text-xl font-bold mb-2">Preparing ELI5 Challenge...</h2>
                    <p className="text-[color:var(--color-text-muted)]">
                        Finding a good code snippet about "{topic}"
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

    const readability = getELI5SimplicityLabel(readabilityScore);

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
                    <div className="flex items-center justify-between gap-3">
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <span className="text-3xl">👶</span>
                            ELI5: Explain Like I'm 5
                        </h1>
                        <ChallengeSourceBadge
                            source={challenge.source || (useAI ? 'ai' : 'practice')}
                            isFallback={challenge.isFallback}
                            fallbackReason={challenge.fallbackReason}
                        />
                    </div>
                    <p className="text-[color:var(--color-text-muted)] mt-1">
                        Explain this code so simply that a 5-year-old would understand!
                    </p>
                </div>

                {/* Rules */}
                <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-pink-400 mb-2">📏 Rules</h3>
                    <ul className="text-sm space-y-1 text-[color:var(--color-text-muted)]">
                        <li>• <strong className="text-red-400">NO</strong> technical jargon allowed!</li>
                        <li>• Use real-world analogies (like comparing to toys, food, etc.)</li>
                        <li>• Keep sentences short and simple</li>
                        <li>• Explain WHAT the code does, not HOW it does it technically</li>
                    </ul>
                </div>

                {/* Code to Explain */}
                <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-700 mb-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800 border-b border-neutral-700">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="ml-2 font-mono text-sm text-neutral-400">
                            Explain this {challenge.language} code
                        </span>
                    </div>
                    <pre className="p-4 font-mono text-sm text-neutral-100 overflow-x-auto whitespace-pre-wrap">
                        {challenge.code}
                    </pre>
                </div>

                {/* Key Points */}
                <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-2 text-[color:var(--color-text-muted)]">
                        Make sure to explain:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {challenge.keyPoints.map((point, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 bg-[color:var(--color-bg-secondary)] rounded-full text-sm border border-[color:var(--color-border)]"
                            >
                                {point}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Explanation Input */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2">
                        Your Explanation:
                    </label>
                    <textarea
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        disabled={submitted}
                        placeholder="Imagine you're explaining to a 5-year-old... Use simple words like 'the computer looks at each thing one by one, like counting your toys!'"
                        className="w-full h-40 px-4 py-3 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                {/* Live Feedback */}
                {!submitted && explanation.length > 10 && (
                    <div className="bg-[color:var(--color-bg-secondary)] rounded-xl p-4 mb-6 border border-[color:var(--color-border)]">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Live Simplicity Check
                        </h4>

                        <p className="text-xs text-[color:var(--color-text-muted)] mb-3">
                            This checks wording and jargon while you type. Final scoring also checks whether you actually explained the code.
                        </p>

                        {/* Readability Meter */}
                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span>Wording Simplicity</span>
                                <span className={readability.color}>{readability.label}</span>
                            </div>
                            <div className="h-2 bg-[color:var(--color-bg-muted)] rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${readabilityScore >= 60 ? 'bg-green-500' :
                                        readabilityScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${readabilityScore}%` }}
                                />
                            </div>
                        </div>

                        {/* Jargon Detection */}
                        {detectedJargon.length > 0 && (
                            <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
                                <div className="text-red-400 text-sm font-semibold mb-1">
                                    ⚠️ Jargon Detected!
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {detectedJargon.map((word, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-0.5 bg-red-500/20 rounded text-xs text-red-300"
                                        >
                                            {word}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {detectedJargon.length === 0 && (
                            <div className="text-green-400 text-sm">
                                ✅ No jargon detected so far.
                            </div>
                        )}
                    </div>
                )}

                {/* Result */}
                {submitted && (
                    <div className="bg-[color:var(--color-bg-secondary)] rounded-xl p-6 mb-6 border border-[color:var(--color-border)]">
                        <div className="text-center">
                            {score !== null && (
                                <div className="score-display text-5xl font-bold text-primary-400 mb-2">
                                    {score} pts
                                </div>
                            )}

                            {aiResponse && <div className="text-lg mb-4">{aiResponse}</div>}

                            {isEvaluating && (
                                <div className="text-sm text-[color:var(--color-text-muted)] mb-4">
                                    AI is grading your explanation with the full challenge context...
                                </div>
                            )}

                            {evaluation && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left mb-4">
                                    <div className="rounded-lg border border-[color:var(--color-border)] p-3">
                                        <div className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)] mb-1">Relevance</div>
                                        <div className="font-semibold">{evaluation.relevanceScore}/40</div>
                                    </div>
                                    <div className="rounded-lg border border-[color:var(--color-border)] p-3">
                                        <div className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)] mb-1">Key Points</div>
                                        <div className="font-semibold">{evaluation.keyPointCoverageScore}/30</div>
                                    </div>
                                    <div className="rounded-lg border border-[color:var(--color-border)] p-3">
                                        <div className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)] mb-1">Simplicity</div>
                                        <div className="font-semibold">{evaluation.simplicityScore}/20</div>
                                    </div>
                                </div>
                            )}

                            {evaluation?.isOffTopic && (
                                <div className="mb-4 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-[color:var(--color-text-primary)]">
                                    This answer stayed simple, but it did not meaningfully explain the code, so the score was capped.
                                </div>
                            )}

                            {evaluation && evaluation.coveredKeyPoints.length > 0 && (
                                <div className="text-sm text-left mb-3">
                                    <div className="mb-2 flex items-center gap-2 font-semibold text-[color:var(--color-text-primary)]">
                                        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                                        Covered well
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {evaluation.coveredKeyPoints.map((point) => (
                                            <span
                                                key={point}
                                                className="rounded-full border border-green-500/35 bg-green-500/12 px-2 py-1 text-[color:var(--color-text-primary)]"
                                            >
                                                {point}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {evaluation && evaluation.missingKeyPoints.length > 0 && (
                                <div className="text-sm text-left mb-3">
                                    <div className="mb-2 flex items-center gap-2 font-semibold text-[color:var(--color-text-primary)]">
                                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                                        Still missing
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {evaluation.missingKeyPoints.map((point) => (
                                            <span
                                                key={point}
                                                className="rounded-full border border-amber-500/40 bg-amber-500/14 px-2 py-1 text-[color:var(--color-text-primary)]"
                                            >
                                                {point}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {evaluation && evaluation.detectedJargon.length > 0 && (
                                <div className="text-sm text-[color:var(--color-text-muted)]">
                                    Jargon used: {evaluation.detectedJargon.join(', ')} (-{evaluation.jargonPenalty} pts)
                                </div>
                            )}

                            {evaluation?.usedFallback && (
                                <div className="text-xs text-[color:var(--color-text-muted)] mt-3">
                                    AI grading was unavailable, so a stricter local fallback evaluator was used.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Button
                        onClick={handleSubmit}
                        disabled={submitted || explanation.trim().length < 20 || isEvaluating}
                    >
                        {isEvaluating ? 'Evaluating...' : 'Submit Explanation'}
                    </Button>
                    <span className="text-sm text-[color:var(--color-text-muted)]">
                        {explanation.length} characters
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ELI5Challenge;


