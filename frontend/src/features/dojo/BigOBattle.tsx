import { useState, useCallback, useEffect } from 'react';
import { gsap } from 'gsap';
import { sendMessageToGemini } from '../../services/gemini';
import Button from '../../ui/Button';
import { getRandomBigOExample } from './examples/bigOExamples';


interface BigOQuestion {
    code: string;
    correctComplexity: string;
    options: string[];
    explanation: string;
    language: string;
}

const COMPLEXITIES = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n³)', 'O(2^n)'];

interface BigOBattleProps {
    onComplete?: (score: number) => void;
    onBack?: () => void;
    useAI?: boolean;
}

function BigOBattle({ onComplete, onBack, useAI = false }: BigOBattleProps) {
    const [question, setQuestion] = useState<BigOQuestion | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(1);
    const [isGenerating, setIsGenerating] = useState(true);
    const [timer, setTimer] = useState(30);
    const [timerActive, setTimerActive] = useState(false);
    const [selectedLanguage] = useState('python');

    const loadHardcodedQuestion = useCallback(() => {
        const example = getRandomBigOExample(selectedLanguage);
        setQuestion(example);
        setTimerActive(true);
        setIsGenerating(false);
    }, [selectedLanguage]);

    const generateQuestion = useCallback(async () => {
        setIsGenerating(true);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setTimer(30);

        const targetComplexity = COMPLEXITIES[Math.floor(Math.random() * COMPLEXITIES.length)];

        try {
            const response = await sendMessageToGemini([{
                role: 'user',
                content: `Generate a Big O complexity question.

Create a code snippet (5-10 lines) that has ${targetComplexity} time complexity.
Make it clear enough for learners to analyze but not trivially obvious.

Return ONLY valid JSON:
{
  "code": "the code snippet",
  "correctComplexity": "${targetComplexity}",
  "options": ["O(1)", "O(n)", "O(n²)", "${targetComplexity}"],
  "explanation": "Brief explanation of why this is ${targetComplexity}",
  "language": "python"
}`
            }], 'building');

            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                // Ensure we have unique options
                const uniqueOptions = [...new Set([data.correctComplexity, 'O(1)', 'O(n)', 'O(n²)', 'O(log n)'])].slice(0, 4);
                data.options = uniqueOptions.sort(() => Math.random() - 0.5);
                setQuestion(data);
                setTimerActive(true);
            }
        } catch (error) {
            console.error('Failed to generate question:', error);
        } finally {
            setIsGenerating(false);
        }
    }, []);

    useEffect(() => {
        if (useAI) {
            generateQuestion();
        } else {
            loadHardcodedQuestion();
        }
    }, [useAI, generateQuestion, loadHardcodedQuestion]);

    // Timer
    useEffect(() => {
        if (!timerActive || timer <= 0 || isCorrect !== null) return;

        const interval = setInterval(() => {
            setTimer(t => {
                if (t <= 1) {
                    setTimerActive(false);
                    // Time's up - auto submit wrong answer
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
        const correct = answer === question.correctComplexity;
        setIsCorrect(correct);

        if (correct) {
            // Bonus points for fast answers
            const timeBonus = Math.floor(timer * 2);
            const roundScore = 50 + timeBonus;
            setScore(prev => prev + roundScore);

            gsap.fromTo('.score-display',
                { scale: 1 },
                { scale: 1.3, duration: 0.2, yoyo: true, repeat: 1, ease: 'back.out(1.7)' }
            );
        }
    };

    const nextRound = () => {
        if (round >= 5) {
            onComplete?.(score);
        } else {
            setRound(prev => prev + 1);
            generateQuestion();
        }
    };

    const getTimerColor = () => {
        if (timer > 20) return 'text-green-400';
        if (timer > 10) return 'text-yellow-400';
        return 'text-red-400';
    };

    if (isGenerating) {
        return (
            <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold mb-2">Generating Challenge...</h2>
                    <p className="text-[color:var(--color-text-muted)]">
                        Creating a complexity puzzle
                    </p>
                </div>
            </div>
        );
    }

    if (!question) return null;

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
                                <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Big O Battle
                            </h1>
                            <p className="text-[color:var(--color-text-muted)] mt-1">
                                Race against time to identify complexity
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="score-display text-2xl font-bold text-primary-400">{score} pts</div>
                            <div className="text-sm text-[color:var(--color-text-muted)]">
                                Round {round}/5
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timer */}
                {timerActive && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">⏱️ Time Remaining</span>
                            <span className={`font-mono font-bold ${getTimerColor()}`}>
                                {timer}s
                            </span>
                        </div>
                        <div className="h-2 bg-[color:var(--color-bg-muted)] rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${timer > 20 ? 'bg-green-500' : timer > 10 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                style={{ width: `${(timer / 30) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Code Display */}
                <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-700 mb-6">
                    <div className="px-4 py-2 bg-neutral-800 border-b border-neutral-700 text-sm text-neutral-400">
                        What is the time complexity of this code?
                    </div>
                    <pre className="p-4 font-mono text-sm text-neutral-100 overflow-x-auto whitespace-pre-wrap">
                        {question.code}
                    </pre>
                </div>

                {/* Complexity Options */}
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
                                className={`
                                    p-6 rounded-xl border-2 text-center font-mono text-xl transition-all
                                    ${!showResult
                                        ? 'border-[color:var(--color-border)] hover:border-primary-400 hover:bg-[color:var(--color-bg-muted)] hover:scale-105'
                                        : ''
                                    }
                                    ${showResult && isCorrectOption
                                        ? 'border-green-500 bg-green-500/10'
                                        : ''
                                    }
                                    ${showResult && isSelected && !isCorrectOption
                                        ? 'border-red-500 bg-red-500/10'
                                        : ''
                                    }
                                `}
                            >
                                {option}
                                {showResult && isCorrectOption && (
                                    <div className="text-green-400 text-sm mt-2">✓ Correct</div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Explanation */}
                {isCorrect !== null && (
                    <div className={`
                        rounded-xl p-4 mb-6 border-2
                        ${isCorrect ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}
                    `}>
                        <div className="flex items-center gap-2 mb-2">
                            {isCorrect ? (
                                <>
                                    <span className="text-2xl">🎉</span>
                                    <h4 className="font-semibold text-green-400">
                                        Correct! +{50 + Math.floor(timer * 2)} points
                                    </h4>
                                </>
                            ) : (
                                <>
                                    <span className="text-2xl">📚</span>
                                    <h4 className="font-semibold text-red-400">
                                        The answer is {question.correctComplexity}
                                    </h4>
                                </>
                            )}
                        </div>
                        <p className="text-sm">{question.explanation}</p>
                    </div>
                )}

                {/* Big O Reference */}
                <div className="bg-[color:var(--color-bg-secondary)] rounded-xl p-4 mb-6 border border-[color:var(--color-border)]">
                    <h4 className="font-semibold mb-2 text-sm">📖 Quick Reference</h4>
                    <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 bg-green-500/20 rounded">O(1) - Constant</span>
                        <span className="px-2 py-1 bg-green-500/10 rounded">O(log n) - Logarithmic</span>
                        <span className="px-2 py-1 bg-yellow-500/20 rounded">O(n) - Linear</span>
                        <span className="px-2 py-1 bg-yellow-500/10 rounded">O(n log n) - Linearithmic</span>
                        <span className="px-2 py-1 bg-red-500/20 rounded">O(n²) - Quadratic</span>
                        <span className="px-2 py-1 bg-red-500/30 rounded">O(2^n) - Exponential</span>
                    </div>
                </div>

                {/* Actions */}
                {isCorrect !== null && (
                    <Button onClick={nextRound}>
                        {round >= 5 ? 'Finish Battle' : 'Next Round →'}
                    </Button>
                )}
            </div>
        </div>
    );
}

export default BigOBattle;
