import { useState, useCallback, useEffect } from 'react';
import { gsap } from 'gsap';
import { sendMessageToGemini } from '../../services/gemini';
import Button from '../../ui/Button';
import ChallengeSourceBadge from './ChallengeSourceBadge';
import { getRandomBigOExample } from './examples/bigOExamples';
import { evaluateBigOSelection, normalizeComplexity } from './evaluators';

interface BigOQuestion {
    code: string;
    correctComplexity: string;
    options: string[];
    explanation: string;
    language: string;
    source?: 'practice' | 'ai';
    isFallback?: boolean;
    fallbackReason?: string;
}

const COMPLEXITIES = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n^2)', 'O(n^3)', 'O(2^n)', 'O(sqrt(n))'];

interface BigOBattleProps {
    onComplete?: (score: number) => void;
    onBack?: () => void;
    useAI?: boolean;
    language?: string;
}

function parseJson<T>(response: string): T | null {
    const match = response.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
        return JSON.parse(match[0]) as T;
    } catch {
        return null;
    }
}

function BigOBattle({ onComplete, onBack, useAI = false, language = 'python' }: BigOBattleProps) {
    const [question, setQuestion] = useState<BigOQuestion | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(1);
    const [isGenerating, setIsGenerating] = useState(true);
    const [timer, setTimer] = useState(30);
    const [timerActive, setTimerActive] = useState(false);

    const resetRoundState = useCallback(() => {
        setSelectedAnswer(null);
        setIsCorrect(null);
        setTimer(30);
        setTimerActive(false);
    }, []);

    const buildOptions = useCallback((correct: string) => {
        const normalizedCorrect = normalizeComplexity(correct);
        const distractors = COMPLEXITIES
            .filter((value) => value !== normalizedCorrect)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        return [normalizedCorrect, ...distractors].sort(() => Math.random() - 0.5);
    }, []);

    const loadHardcodedQuestion = useCallback((reason?: string) => {
        const example = getRandomBigOExample(language);
        const normalized = normalizeComplexity(example.correctComplexity);
        setQuestion({
            ...example,
            correctComplexity: normalized,
            options: buildOptions(normalized),
            source: useAI ? 'ai' : 'practice',
            isFallback: Boolean(reason),
            fallbackReason: reason,
            language,
        });
        setTimerActive(true);
        setIsGenerating(false);
    }, [buildOptions, language, useAI]);

    const generateQuestion = useCallback(async () => {
        setIsGenerating(true);
        resetRoundState();

        if (!useAI) {
            loadHardcodedQuestion();
            return;
        }

        const targetComplexity = COMPLEXITIES[Math.floor(Math.random() * COMPLEXITIES.length)];

        try {
            const response = await sendMessageToGemini([{
                role: 'user',
                content: `Generate a ${language} Big O question. Return ONLY JSON:\n{\n  "code": "...",\n  "correctComplexity": "${targetComplexity}",\n  "explanation": "...",\n  "language": "${language}"\n}`,
            }], 'building');

            const data = parseJson<{ code: string; correctComplexity: string; explanation: string; language: string }>(response);
            if (!data || typeof data.code !== 'string' || typeof data.correctComplexity !== 'string') {
                loadHardcodedQuestion('Invalid AI Big O payload');
                return;
            }

            const normalized = normalizeComplexity(data.correctComplexity);
            setQuestion({
                code: data.code,
                correctComplexity: normalized,
                options: buildOptions(normalized),
                explanation: data.explanation || `This runs in ${normalized}.`,
                language,
                source: 'ai',
                isFallback: false,
            });
            setTimerActive(true);
        } catch {
            loadHardcodedQuestion('AI generation failed');
        } finally {
            setIsGenerating(false);
        }
    }, [language, useAI, loadHardcodedQuestion, buildOptions, resetRoundState]);

    useEffect(() => {
        void generateQuestion();
    }, [generateQuestion]);

    useEffect(() => {
        if (!timerActive || timer <= 0 || isCorrect !== null) return;

        const interval = setInterval(() => {
            setTimer((t) => {
                if (t <= 1) {
                    setTimerActive(false);
                    if (question && selectedAnswer === null) {
                        setIsCorrect(false);
                    }
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timerActive, timer, isCorrect, question, selectedAnswer]);

    const handleAnswer = (answer: string) => {
        if (!question || isCorrect !== null) return;

        setTimerActive(false);
        setSelectedAnswer(answer);
        const correct = evaluateBigOSelection(answer, question.correctComplexity);
        setIsCorrect(correct);

        if (correct) {
            const timeBonus = Math.max(Math.floor(timer * 2), 0);
            const roundScore = 50 + timeBonus;
            setScore((prev) => prev + roundScore);
            gsap.fromTo('.score-display', { scale: 1 }, { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1 });
        }
    };

    const nextRound = () => {
        if (round >= 5) {
            onComplete?.(score);
            return;
        }
        setRound((prev) => prev + 1);
        void generateQuestion();
    };

    if (isGenerating && !question) {
        return (
            <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center">
                <div className="text-center"><h2 className="text-xl font-bold mb-2">Generating Challenge...</h2></div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-3">Unable to load challenge</h2>
                    <Button onClick={() => void generateQuestion()}>Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)] p-6">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <button onClick={onBack} className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)] mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Dojo
                    </button>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Big O Battle</h1>
                            <p className="text-[color:var(--color-text-muted)] mt-1">Race against time to identify complexity</p>
                        </div>
                        <div className="text-right">
                            <ChallengeSourceBadge source={question.source || (useAI ? 'ai' : 'practice')} isFallback={question.isFallback} fallbackReason={question.fallbackReason} />
                            <div className="score-display text-2xl font-bold text-primary-400 mt-2">{score} pts</div>
                            <div className="text-sm text-[color:var(--color-text-muted)]">Round {round}/5</div>
                        </div>
                    </div>
                </div>

                {timerActive && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2"><span className="text-sm">Time Remaining</span><span className="font-mono font-bold">{timer}s</span></div>
                        <div className="h-2 bg-[color:var(--color-bg-muted)] rounded-full overflow-hidden">
                            <div className="h-full transition-all duration-1000 bg-orange-500" style={{ width: `${(timer / 30) * 100}%` }} />
                        </div>
                    </div>
                )}

                <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-700 mb-6">
                    <pre className="p-4 font-mono text-sm text-neutral-100 overflow-x-auto whitespace-pre-wrap">{question.code}</pre>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    {question.options.map((option) => {
                        const isSelected = selectedAnswer === option;
                        const isCorrectOption = option === question.correctComplexity;
                        const showResult = isCorrect !== null;

                        return (
                            <button
                                key={option}
                                onClick={() => handleAnswer(option)}
                                disabled={showResult}
                                className={`p-6 rounded-xl border-2 text-center font-mono text-xl transition-all ${!showResult ? 'border-[color:var(--color-border)] hover:border-primary-400' : ''} ${showResult && isCorrectOption ? 'border-green-500 bg-green-500/10' : ''} ${showResult && isSelected && !isCorrectOption ? 'border-red-500 bg-red-500/10' : ''}`}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>

                {isCorrect !== null && (
                    <div className={`rounded-xl p-4 mb-6 border-2 ${isCorrect ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
                        <h4 className={`font-semibold mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>{isCorrect ? 'Correct' : `Answer: ${question.correctComplexity}`}</h4>
                        <p className="text-sm">{question.explanation}</p>
                    </div>
                )}

                {isCorrect !== null && (
                    <Button onClick={nextRound}>{round >= 5 ? 'Finish Battle' : 'Next Round'}</Button>
                )}
            </div>
        </div>
    );
}

export default BigOBattle;

