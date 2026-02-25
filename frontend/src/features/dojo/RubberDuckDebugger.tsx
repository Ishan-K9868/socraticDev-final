import { useState, useCallback, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { sendMessageToGemini } from '../../services/gemini';
import Button from '../../ui/Button';
import ChallengeSourceBadge from './ChallengeSourceBadge';

interface DuckQuestion {
    id: string;
    question: string;
    type: 'clarification' | 'confusion' | 'challenge' | 'insight';
}

interface RubberDuckProps {
    onComplete?: (score: number) => void;
    onBack?: () => void;
}

const FALLBACK_DUCK_QUESTIONS: DuckQuestion[] = [
    { id: 'q1', question: 'What is this function expected to do for normal input?', type: 'clarification' },
    { id: 'q2', question: 'Which edge case could break this logic?', type: 'challenge' },
    { id: 'q3', question: 'Which variable changes are hardest to track?', type: 'confusion' },
    { id: 'q4', question: 'Where would one debug print give the most insight?', type: 'insight' },
];

function parseJson<T>(response: string): T | null {
    const match = response.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
        return JSON.parse(match[0]) as T;
    } catch {
        return null;
    }
}

function RubberDuckDebugger({ onComplete, onBack }: RubberDuckProps) {
    const [code, setCode] = useState('');
    const [isExplaining, setIsExplaining] = useState(false);
    const [duckQuestions, setDuckQuestions] = useState<DuckQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userResponses, setUserResponses] = useState<string[]>([]);
    const [currentResponse, setCurrentResponse] = useState('');
    const [duckMood, setDuckMood] = useState<'neutral' | 'confused' | 'happy' | 'thinking'>('neutral');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [finalFeedback, setFinalFeedback] = useState('');
    const [usedFallback, setUsedFallback] = useState(false);
    const [fallbackReason, setFallbackReason] = useState<string | undefined>();
    const duckRef = useRef<HTMLDivElement>(null);

    const duckEmojis = {
        neutral: '??',
        confused: '??',
        happy: '??',
        thinking: '??',
    };

    useEffect(() => {
        if (duckRef.current) {
            gsap.fromTo(
                duckRef.current,
                { scale: 1, rotation: 0 },
                { scale: 1.1, rotation: duckMood === 'confused' ? 10 : 0, duration: 0.3, yoyo: true, repeat: 1 }
            );
        }
    }, [duckMood]);

    const startExplaining = useCallback(async () => {
        if (!code.trim()) return;

        setIsExplaining(true);
        setIsGenerating(true);
        setDuckMood('thinking');
        setUsedFallback(false);
        setFallbackReason(undefined);
        setCurrentQuestionIndex(0);
        setUserResponses([]);
        setCurrentResponse('');
        setFinalFeedback('');
        setIsComplete(false);

        try {
            const response = await sendMessageToGemini([
                {
                    role: 'user',
                    content: `You are a rubber-duck debugger. Generate 4 concise probing questions for this code. Return ONLY JSON: {"questions":[{"id":"1","question":"...","type":"clarification|confusion|challenge|insight"}]}. Code:\n${code}`,
                },
            ], 'building');

            const data = parseJson<{ questions: DuckQuestion[] }>(response);
            if (data && Array.isArray(data.questions) && data.questions.length >= 3) {
                setDuckQuestions(data.questions.slice(0, 5));
            } else {
                setDuckQuestions(FALLBACK_DUCK_QUESTIONS);
                setUsedFallback(true);
                setFallbackReason('AI returned invalid question set');
            }
            setDuckMood('neutral');
        } catch {
            setDuckQuestions(FALLBACK_DUCK_QUESTIONS);
            setUsedFallback(true);
            setFallbackReason('AI question generation failed');
            setDuckMood('neutral');
        } finally {
            setIsGenerating(false);
        }
    }, [code]);

    const submitResponse = useCallback(async () => {
        if (!currentResponse.trim()) return;

        const newResponses = [...userResponses, currentResponse];
        setUserResponses(newResponses);
        setCurrentResponse('');

        if (currentResponse.length < 20) setDuckMood('confused');
        else if (currentResponse.length > 100) setDuckMood('happy');
        else setDuckMood('thinking');

        if (currentQuestionIndex < duckQuestions.length - 1) {
            setTimeout(() => {
                setCurrentQuestionIndex((prev) => prev + 1);
                setDuckMood('neutral');
            }, 800);
            return;
        }

        setIsGenerating(true);
        try {
            const response = await sendMessageToGemini([
                {
                    role: 'user',
                    content: `Give brief debugging feedback in 2-3 sentences. Code:\n${code}\nQ&A:\n${duckQuestions
                        .map((q, i) => `Q: ${q.question}\nA: ${newResponses[i] || 'No response'}`)
                        .join('\n\n')}`,
                },
            ], 'building');

            const text = response?.trim();
            if (text) {
                setFinalFeedback(text);
            } else {
                setFinalFeedback('You explained your code flow and identified possible weak spots. Next, validate one edge case at a time.');
                setUsedFallback(true);
                setFallbackReason('AI summary was empty');
            }
        } catch {
            setFinalFeedback('You explained your code flow and identified possible weak spots. Next, validate one edge case at a time.');
            setUsedFallback(true);
            setFallbackReason('AI summary failed');
        } finally {
            setIsGenerating(false);
            setIsComplete(true);
            setDuckMood('happy');
            setTimeout(() => onComplete?.(100), 1200);
        }
    }, [code, currentQuestionIndex, currentResponse, duckQuestions, onComplete, userResponses]);

    const currentQuestion = duckQuestions[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)] p-6">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <button onClick={onBack} className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)] mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Dojo
                    </button>
                    <h1 className="text-2xl font-bold">Rubber Duck Debugger</h1>
                    <div className="mt-2"><ChallengeSourceBadge source="ai" isFallback={usedFallback} fallbackReason={fallbackReason} /></div>
                    <p className="text-[color:var(--color-text-muted)] mt-1">Explain your code to the duck. It asks probing questions.</p>
                </div>

                {!isExplaining ? (
                    <div>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold mb-2">Paste Your Code:</label>
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Paste code to debug..."
                                className="w-full h-64 px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 font-mono text-sm text-neutral-100 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <Button onClick={startExplaining} disabled={!code.trim() || isGenerating}>{isGenerating ? 'Duck is thinking...' : 'Start Explaining'}</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <h3 className="font-semibold mb-3">Your Code</h3>
                            <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-700 overflow-auto max-h-96">
                                <pre className="font-mono text-sm text-neutral-100 whitespace-pre-wrap">{code}</pre>
                            </div>
                        </div>

                        <div>
                            <div ref={duckRef} className="text-center mb-4 p-4 bg-[color:var(--color-bg-secondary)] rounded-xl border border-[color:var(--color-border)]">
                                <div className="text-6xl mb-2">{duckEmojis[duckMood]}</div>
                            </div>

                            {!isComplete && currentQuestion && (
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
                                    <p className="text-sm">{currentQuestion.question}</p>
                                </div>
                            )}

                            {!isComplete && !isGenerating && (
                                <div>
                                    <textarea
                                        value={currentResponse}
                                        onChange={(e) => setCurrentResponse(e.target.value)}
                                        placeholder="Explain this part..."
                                        className="w-full h-24 px-3 py-2 rounded-lg bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
                                    />
                                    <Button onClick={submitResponse} disabled={!currentResponse.trim()} className="w-full">Submit & Continue</Button>
                                </div>
                            )}

                            {isGenerating && <div className="text-center text-sm text-[color:var(--color-text-muted)]">Duck is processing...</div>}

                            {isComplete && (
                                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                                    <h4 className="font-semibold text-green-400 mb-2 text-center">Session Complete</h4>
                                    <p className="text-sm">{finalFeedback}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RubberDuckDebugger;

