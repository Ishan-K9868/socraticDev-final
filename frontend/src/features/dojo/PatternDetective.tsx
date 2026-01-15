import { useState, useCallback, useEffect } from 'react';
import { gsap } from 'gsap';
import { sendMessageToGemini } from '../../services/gemini';
import Button from '../../ui/Button';
import { getRandomPatternExample } from './examples/patternExamples';

interface PatternQuestion {
    code: string;
    correctAnswer: string;
    options: string[];
    explanation: string;
    type: 'pattern' | 'smell';
}

const DESIGN_PATTERNS = [
    'Singleton', 'Factory', 'Observer', 'Strategy', 'Decorator',
    'Adapter', 'Command', 'Builder', 'Prototype', 'Facade'
];

const CODE_SMELLS = [
    'God Object', 'Long Method', 'Duplicate Code', 'Dead Code',
    'Feature Envy', 'Data Clumps', 'Primitive Obsession', 'Switch Statements'
];

interface PatternDetectiveProps {
    onComplete?: (score: number) => void;
    onBack?: () => void;
    useAI?: boolean;
}

function PatternDetective({ onComplete, onBack, useAI = false }: PatternDetectiveProps) {
    const [question, setQuestion] = useState<PatternQuestion | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(1);
    const [isGenerating, setIsGenerating] = useState(true);
    const [streak, setStreak] = useState(0);
    const [questionType, setQuestionType] = useState<'pattern' | 'smell'>('pattern');

    const loadHardcodedQuestion = useCallback(() => {
        const example = getRandomPatternExample(questionType);
        setQuestion({
            code: example.code,
            correctAnswer: example.correctAnswer,
            options: example.options,
            explanation: example.explanation,
            type: example.type
        });
        setIsGenerating(false);
    }, [questionType]);

    const generateQuestion = useCallback(async () => {
        setIsGenerating(true);
        setSelectedAnswer(null);
        setIsCorrect(null);

        const type = questionType;
        const items = type === 'pattern' ? DESIGN_PATTERNS : CODE_SMELLS;
        const correctItem = items[Math.floor(Math.random() * items.length)];

        try {
            const response = await sendMessageToGemini([{
                role: 'user',
                content: `Generate a ${type === 'pattern' ? 'Design Pattern' : 'Code Smell'} detection question.

${type === 'pattern'
                        ? `Create a code snippet (8-15 lines) that clearly demonstrates the "${correctItem}" pattern.`
                        : `Create a code snippet (8-15 lines) that demonstrates the "${correctItem}" code smell.`
                    }

Return ONLY valid JSON:
{
  "code": "the code snippet",
  "correctAnswer": "${correctItem}",
  "options": ["${correctItem}", "wrong option 1", "wrong option 2", "wrong option 3"],
  "explanation": "Brief explanation of why this is ${correctItem}",
  "type": "${type}"
}`
            }], 'building');

            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                // Shuffle options
                data.options = data.options.sort(() => Math.random() - 0.5);
                setQuestion(data);
            }
        } catch (error) {
            console.error('Failed to generate question:', error);
        } finally {
            setIsGenerating(false);
        }
    }, [questionType]);

    useEffect(() => {
        if (useAI) {
            generateQuestion();
        } else {
            loadHardcodedQuestion();
        }
    }, [useAI, generateQuestion, loadHardcodedQuestion]);

    const handleAnswer = (answer: string) => {
        if (!question || isCorrect !== null) return;

        setSelectedAnswer(answer);
        const correct = answer === question.correctAnswer;
        setIsCorrect(correct);

        if (correct) {
            const streakBonus = streak * 10;
            const roundScore = 50 + streakBonus;
            setScore(prev => prev + roundScore);
            setStreak(prev => prev + 1);

            gsap.fromTo('.score-display',
                { scale: 1 },
                { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1 }
            );
        } else {
            setStreak(0);
        }
    };

    const nextRound = () => {
        if (round >= 5) {
            onComplete?.(score);
        } else {
            setRound(prev => prev + 1);
            setQuestionType(prev => prev === 'pattern' ? 'smell' : 'pattern');
            generateQuestion();
        }
    };

    if (isGenerating) {
        return (
            <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-pulse">🕵️</div>
                    <h2 className="text-xl font-bold mb-2">Generating Pattern...</h2>
                    <p className="text-[color:var(--color-text-muted)]">
                        {questionType === 'pattern' ? 'Creating a design pattern puzzle' : 'Hiding a code smell...'}
                    </p>
                </div>
            </div>
        );
    }

    if (!question) return null;

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
                                <span className="text-3xl">🕵️</span>
                                Pattern Detective
                            </h1>
                            <p className="text-[color:var(--color-text-muted)] mt-1">
                                Identify design patterns and code smells
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="score-display text-2xl font-bold text-primary-400">{score} pts</div>
                            <div className="text-sm text-[color:var(--color-text-muted)]">
                                Round {round}/5 | 🔥 Streak: {streak}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress */}
                <div className="mb-6">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(r => (
                            <div
                                key={r}
                                className={`
                                    h-2 flex-1 rounded-full transition-all
                                    ${r < round ? 'bg-green-500' : r === round ? 'bg-primary-500' : 'bg-[color:var(--color-bg-muted)]'}
                                `}
                            />
                        ))}
                    </div>
                </div>

                {/* Question Type Badge */}
                <div className="mb-4">
                    <span className={`
                        px-3 py-1 rounded-full text-sm font-medium
                        ${question.type === 'pattern'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-red-500/20 text-red-400'
                        }
                    `}>
                        {question.type === 'pattern' ? '📐 Design Pattern' : '🦨 Code Smell'}
                    </span>
                </div>

                {/* Code Display */}
                <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-700 mb-6">
                    <div className="px-4 py-2 bg-neutral-800 border-b border-neutral-700 text-sm text-neutral-400">
                        What {question.type === 'pattern' ? 'pattern' : 'code smell'} does this code demonstrate?
                    </div>
                    <pre className="p-4 font-mono text-sm text-neutral-100 overflow-x-auto whitespace-pre-wrap">
                        {question.code}
                    </pre>
                </div>

                {/* Options */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {question.options.map((option) => {
                        const isSelected = selectedAnswer === option;
                        const isCorrectOption = option === question.correctAnswer;
                        const showResult = isCorrect !== null;

                        return (
                            <button
                                key={option}
                                onClick={() => handleAnswer(option)}
                                disabled={showResult}
                                className={`
                                    p-4 rounded-xl border-2 text-left transition-all
                                    ${!showResult
                                        ? 'border-[color:var(--color-border)] hover:border-primary-400 hover:bg-[color:var(--color-bg-muted)]'
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
                                <div className="font-medium">{option}</div>
                                {showResult && isCorrectOption && (
                                    <span className="text-green-400 text-sm">✓ Correct</span>
                                )}
                                {showResult && isSelected && !isCorrectOption && (
                                    <span className="text-red-400 text-sm">✗ Wrong</span>
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
                        <h4 className={`font-semibold mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {isCorrect ? '🎉 Correct!' : '📚 Learn from this:'}
                        </h4>
                        <p className="text-sm">{question.explanation}</p>
                    </div>
                )}

                {/* Actions */}
                {isCorrect !== null && (
                    <Button onClick={nextRound}>
                        {round >= 5 ? 'Finish Challenge' : 'Next Question →'}
                    </Button>
                )}
            </div>
        </div>
    );
}

export default PatternDetective;
