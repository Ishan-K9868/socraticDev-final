import { useState, useCallback, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { sendMessageToGemini } from '../../services/gemini';
import Button from '../../ui/Button';

interface DuckQuestion {
    id: string;
    question: string;
    type: 'clarification' | 'confusion' | 'challenge' | 'insight';
}

interface RubberDuckProps {
    onComplete?: (score: number) => void;
    onBack?: () => void;
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
    const duckRef = useRef<HTMLDivElement>(null);

    const duckEmojis = {
        neutral: '🦆',
        confused: '🤔',
        happy: '😊',
        thinking: '💭'
    };

    // Animate duck on mood change
    useEffect(() => {
        if (duckRef.current) {
            gsap.fromTo(duckRef.current,
                { scale: 1, rotation: 0 },
                {
                    scale: 1.1,
                    rotation: duckMood === 'confused' ? 10 : 0,
                    duration: 0.3,
                    yoyo: true,
                    repeat: 1,
                    ease: 'back.out(1.7)'
                }
            );
        }
    }, [duckMood]);

    const startExplaining = useCallback(async () => {
        if (!code.trim()) return;

        setIsExplaining(true);
        setIsGenerating(true);
        setDuckMood('thinking');

        try {
            const response = await sendMessageToGemini([{
                role: 'user',
                content: `You are an AI acting as a "Rubber Duck Debugger". The user is going to explain their code to you line by line.

Analyze this code and generate 4-5 probing questions that will help the user think more deeply about their code. Focus on:
1. Potential bugs or edge cases they might have missed
2. Assumptions they might be making
3. Parts that could be confusing or unclear
4. Logic that might not work as expected

The code:
\`\`\`
${code}
\`\`\`

Return ONLY valid JSON:
{
  "questions": [
    {"id": "1", "question": "Your question here", "type": "clarification|confusion|challenge|insight"}
  ]
}`
            }], 'building');

            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                setDuckQuestions(data.questions);
                setDuckMood('neutral');
            }
        } catch (error) {
            console.error('Failed to generate questions:', error);
        } finally {
            setIsGenerating(false);
        }
    }, [code]);

    const submitResponse = useCallback(async () => {
        if (!currentResponse.trim()) return;

        const newResponses = [...userResponses, currentResponse];
        setUserResponses(newResponses);
        setCurrentResponse('');

        // Duck reacts based on response length/quality
        if (currentResponse.length < 20) {
            setDuckMood('confused');
        } else if (currentResponse.length > 100) {
            setDuckMood('happy');
        } else {
            setDuckMood('thinking');
        }

        if (currentQuestionIndex < duckQuestions.length - 1) {
            setTimeout(() => {
                setCurrentQuestionIndex(prev => prev + 1);
                setDuckMood('neutral');
            }, 1000);
        } else {
            // All questions answered - generate final feedback
            setIsGenerating(true);
            try {
                const response = await sendMessageToGemini([{
                    role: 'user',
                    content: `You are a Rubber Duck Debugger. The user explained their code and answered your questions.

Code:
\`\`\`
${code}
\`\`\`

Questions and their responses:
${duckQuestions.map((q, i) => `Q: ${q.question}\nA: ${newResponses[i] || 'No response'}`).join('\n\n')}

Provide brief, encouraging feedback (2-3 sentences). Did explaining help them understand better? Suggest any insights they might have missed. Be supportive and educational.`
                }], 'building');

                setFinalFeedback(response);
                setIsComplete(true);
                setDuckMood('happy');

                setTimeout(() => {
                    onComplete?.(100);
                }, 2000);
            } catch (error) {
                console.error('Failed to generate feedback:', error);
            } finally {
                setIsGenerating(false);
            }
        }
    }, [currentResponse, userResponses, currentQuestionIndex, duckQuestions, code, onComplete]);

    const currentQuestion = duckQuestions[currentQuestionIndex];

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
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <span className="text-3xl">🦆</span>
                        Rubber Duck Debugger
                    </h1>
                    <p className="text-[color:var(--color-text-muted)] mt-1">
                        Explain your code to the duck - it will ask probing questions!
                    </p>
                </div>

                {!isExplaining ? (
                    // Code input phase
                    <div>
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                            <h3 className="font-semibold text-yellow-400 mb-2">How It Works</h3>
                            <ol className="text-sm space-y-1 text-[color:var(--color-text-muted)] list-decimal list-inside">
                                <li>Paste your buggy or confusing code below</li>
                                <li>The duck will ask you questions about your code</li>
                                <li>Explaining each part helps you find bugs yourself!</li>
                            </ol>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold mb-2">
                                Paste Your Code:
                            </label>
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Paste your code here... (the code you want to debug or understand better)"
                                className="w-full h-64 px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 font-mono text-sm text-neutral-100 placeholder-neutral-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        <Button
                            onClick={startExplaining}
                            disabled={!code.trim() || isGenerating}
                        >
                            {isGenerating ? 'Duck is thinking...' : 'Start Explaining to Duck 🦆'}
                        </Button>
                    </div>
                ) : (
                    // Q&A phase
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Code display */}
                        <div className="lg:col-span-2">
                            <h3 className="font-semibold mb-3">📄 Your Code</h3>
                            <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-700 overflow-auto max-h-96">
                                <pre className="font-mono text-sm text-neutral-100 whitespace-pre-wrap">{code}</pre>
                            </div>
                        </div>

                        {/* Duck and Q&A */}
                        <div>
                            {/* Duck Avatar */}
                            <div
                                ref={duckRef}
                                className="text-center mb-4 p-4 bg-[color:var(--color-bg-secondary)] rounded-xl border border-[color:var(--color-border)]"
                            >
                                <div className="text-6xl mb-2">{duckEmojis[duckMood]}</div>
                                <div className="text-sm text-[color:var(--color-text-muted)]">
                                    {duckMood === 'confused' && "Hmm, I'm not sure I understand..."}
                                    {duckMood === 'happy' && "Great explanation!"}
                                    {duckMood === 'thinking' && "Let me think about that..."}
                                    {duckMood === 'neutral' && "I'm listening..."}
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Progress</span>
                                    <span>{currentQuestionIndex + 1}/{duckQuestions.length}</span>
                                </div>
                                <div className="h-2 bg-[color:var(--color-bg-muted)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-500 transition-all duration-300"
                                        style={{ width: `${((currentQuestionIndex + 1) / duckQuestions.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Current Question */}
                            {!isComplete && currentQuestion && (
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
                                    <div className="flex items-start gap-2">
                                        <span className="text-xl">🦆</span>
                                        <p className="text-sm">{currentQuestion.question}</p>
                                    </div>
                                </div>
                            )}

                            {/* Response Input */}
                            {!isComplete && !isGenerating && (
                                <div>
                                    <textarea
                                        value={currentResponse}
                                        onChange={(e) => setCurrentResponse(e.target.value)}
                                        placeholder="Explain this part to the duck..."
                                        className="w-full h-24 px-3 py-2 rounded-lg bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
                                    />
                                    <Button
                                        onClick={submitResponse}
                                        disabled={!currentResponse.trim()}
                                        className="w-full"
                                    >
                                        Submit & Continue
                                    </Button>
                                </div>
                            )}

                            {/* Loading */}
                            {isGenerating && (
                                <div className="text-center text-sm text-[color:var(--color-text-muted)]">
                                    <div className="animate-pulse">Duck is processing...</div>
                                </div>
                            )}

                            {/* Final Feedback */}
                            {isComplete && (
                                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                                    <div className="text-4xl text-center mb-3">🎉</div>
                                    <h4 className="font-semibold text-green-400 mb-2 text-center">
                                        Session Complete!
                                    </h4>
                                    <p className="text-sm">{finalFeedback}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Previous Responses */}
                {userResponses.length > 0 && !isComplete && (
                    <div className="mt-6">
                        <h4 className="font-semibold mb-3">📝 Your Explanations</h4>
                        <div className="space-y-2">
                            {duckQuestions.slice(0, currentQuestionIndex).map((q, i) => (
                                <div key={q.id} className="bg-[color:var(--color-bg-secondary)] rounded-lg p-3 text-sm">
                                    <div className="text-[color:var(--color-text-muted)] mb-1">Q: {q.question}</div>
                                    <div>A: {userResponses[i]}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RubberDuckDebugger;
