import { useState, useCallback, useEffect } from 'react';
import { gsap } from 'gsap';
import { sendMessageToGemini } from '../../services/gemini';
import Button from '../../ui/Button';
import ChallengeSourceBadge from './ChallengeSourceBadge';
import { getRandomPatternExample } from './examples/patternExamples';

interface PatternQuestion {
    code: string;
    correctAnswer: string;
    options: string[];
    explanation: string;
    type: 'pattern' | 'smell';
    source?: 'practice' | 'ai';
    isFallback?: boolean;
    fallbackReason?: string;
}

const DESIGN_PATTERNS = ['Singleton', 'Factory', 'Observer', 'Strategy', 'Decorator', 'Adapter', 'Command', 'Builder', 'Prototype', 'Facade'];
const CODE_SMELLS = ['God Object', 'Long Method', 'Duplicate Code', 'Dead Code', 'Feature Envy', 'Data Clumps', 'Primitive Obsession', 'Switch Statements'];

interface PatternDetectiveProps {
    onComplete?: (score: number) => void;
    onBack?: () => void;
    useAI?: boolean;
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

function PatternDetective({ onComplete, onBack, useAI = false }: PatternDetectiveProps) {
    const [question, setQuestion] = useState<PatternQuestion | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(1);
    const [isGenerating, setIsGenerating] = useState(true);
    const [streak, setStreak] = useState(0);
    const [questionType, setQuestionType] = useState<'pattern' | 'smell'>('pattern');

    const resetRoundState = useCallback(() => {
        setSelectedAnswer(null);
        setIsCorrect(null);
    }, []);

    const loadHardcodedQuestion = useCallback((reason?: string) => {
        const example = getRandomPatternExample(questionType);
        setQuestion({ ...example, source: useAI ? 'ai' : 'practice', isFallback: Boolean(reason), fallbackReason: reason });
        setIsGenerating(false);
    }, [questionType, useAI]);

    const generateQuestion = useCallback(async () => {
        setIsGenerating(true);
        resetRoundState();

        if (!useAI) {
            loadHardcodedQuestion();
            return;
        }

        const type = questionType;
        const items = type === 'pattern' ? DESIGN_PATTERNS : CODE_SMELLS;
        const correctItem = items[Math.floor(Math.random() * items.length)];

        try {
            const response = await sendMessageToGemini([{
                role: 'user',
                content: `Generate a ${type === 'pattern' ? 'design pattern' : 'code smell'} identification challenge.\nReturn ONLY valid JSON:\n{\n  "code": "snippet",\n  "correctAnswer": "${correctItem}",\n  "options": ["${correctItem}", "d1", "d2", "d3"],\n  "explanation": "brief explanation",\n  "type": "${type}"\n}`
            }], 'building');

            const data = parseJson<PatternQuestion>(response);
            const valid = data
                && typeof data.code === 'string'
                && typeof data.correctAnswer === 'string'
                && Array.isArray(data.options)
                && data.options.length >= 4
                && (data.type === 'pattern' || data.type === 'smell');

            if (!valid) {
                loadHardcodedQuestion('Invalid AI question payload');
                return;
            }

            const deduped = Array.from(new Set(data.options));
            if (!deduped.includes(data.correctAnswer)) deduped[0] = data.correctAnswer;
            while (deduped.length < 4) deduped.push(items[Math.floor(Math.random() * items.length)]);

            setQuestion({
                code: data.code,
                correctAnswer: data.correctAnswer,
                options: deduped.slice(0, 4).sort(() => Math.random() - 0.5),
                explanation: data.explanation || 'Review the structure and intent in the snippet.',
                type,
                source: 'ai',
                isFallback: false,
            });
        } catch {
            loadHardcodedQuestion('AI generation failed');
        } finally {
            setIsGenerating(false);
        }
    }, [useAI, questionType, loadHardcodedQuestion, resetRoundState]);

    useEffect(() => {
        void generateQuestion();
    }, [generateQuestion]);

    const handleAnswer = (answer: string) => {
        if (!question || isCorrect !== null) return;

        setSelectedAnswer(answer);
        const correct = answer === question.correctAnswer;
        setIsCorrect(correct);

        if (correct) {
            const streakBonus = streak * 10;
            setScore((prev) => prev + 50 + streakBonus);
            setStreak((prev) => prev + 1);
            gsap.fromTo('.score-display', { scale: 1 }, { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1 });
        } else {
            setStreak(0);
        }
    };

    const nextRound = () => {
        if (round >= 5) {
            onComplete?.(score);
            return;
        }
        setRound((prev) => prev + 1);
        setQuestionType((prev) => (prev === 'pattern' ? 'smell' : 'pattern'));
        resetRoundState();
    };

    if (isGenerating && !question) {
        return (
            <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Generating Pattern...</h2>
                </div>
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
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <button onClick={onBack} className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)] mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dojo
                    </button>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Pattern Detective</h1>
                            <p className="text-[color:var(--color-text-muted)] mt-1">Identify design patterns and code smells</p>
                        </div>
                        <div className="text-right">
                            <ChallengeSourceBadge source={question.source || (useAI ? 'ai' : 'practice')} isFallback={question.isFallback} fallbackReason={question.fallbackReason} />
                            <div className="score-display text-2xl font-bold text-primary-400 mt-2">{score} pts</div>
                            <div className="text-sm text-[color:var(--color-text-muted)]">Round {round}/5 | Streak: {streak}</div>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${question.type === 'pattern' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                        {question.type === 'pattern' ? 'Design Pattern' : 'Code Smell'}
                    </span>
                </div>

                <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-700 mb-6">
                    <pre className="p-4 font-mono text-sm text-neutral-100 overflow-x-auto whitespace-pre-wrap">{question.code}</pre>
                </div>

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
                                className={`p-4 rounded-xl border-2 text-left transition-all ${!showResult ? 'border-[color:var(--color-border)] hover:border-primary-400' : ''} ${showResult && isCorrectOption ? 'border-green-500 bg-green-500/10' : ''} ${showResult && isSelected && !isCorrectOption ? 'border-red-500 bg-red-500/10' : ''}`}
                            >
                                <div className="font-medium">{option}</div>
                            </button>
                        );
                    })}
                </div>

                {isCorrect !== null && (
                    <div className={`rounded-xl p-4 mb-6 border-2 ${isCorrect ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
                        <h4 className={`font-semibold mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>{isCorrect ? 'Correct' : 'Review'}</h4>
                        <p className="text-sm">{question.explanation}</p>
                    </div>
                )}

                {isCorrect !== null && (
                    <Button onClick={nextRound}>{round >= 5 ? 'Finish Challenge' : 'Next Question'}</Button>
                )}
            </div>
        </div>
    );
}

export default PatternDetective;

