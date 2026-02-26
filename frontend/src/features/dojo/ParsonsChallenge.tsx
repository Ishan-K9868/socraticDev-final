import { useState, useCallback, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { gsap } from 'gsap';
import { ParsonsChallenge as ParsonsChallengeType, CodeLine } from './types';
import { useChallengeAI } from './useChallengeAI';
import Button from '../../ui/Button';
import { getRandomParsonsExample } from './examples/parsonsExamples';
import ChallengeSourceBadge from './ChallengeSourceBadge';

interface SortableLineProps {
    line: CodeLine;
    isCorrect?: boolean | null;
}

function SortableLine({ line, isCorrect }: SortableLineProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: line.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
                px-4 py-3 rounded-lg border-2 font-mono text-sm cursor-grab active:cursor-grabbing
                transition-all duration-200
                ${isDragging
                    ? 'shadow-xl scale-105 z-50 bg-primary-500/20 border-primary-500 text-neutral-50'
                    : 'bg-[color:var(--color-bg-secondary)] border-[color:var(--color-border)]'
                }
                ${isCorrect !== null && isCorrect !== undefined ? 'text-neutral-100' : 'text-[color:var(--color-text-primary)]'}
                ${isCorrect === true && 'border-green-500 bg-green-500/10'}
                ${isCorrect === false && 'border-red-500 bg-red-500/10'}
                ${line.isDistractor && isCorrect === false && 'line-through opacity-90 text-neutral-300'}
                hover:border-primary-400
                ${isCorrect !== null && isCorrect !== undefined ? 'hover:bg-neutral-800/80' : 'hover:bg-[color:var(--color-bg-muted)]'}
            `}
        >
            <code className="whitespace-pre">{line.content}</code>
        </div>
    );
}

interface ParsonsChallengeProps {
    topic?: string;
    language?: string;
    onComplete?: (score: number) => void;
    onBack?: () => void;
    useAI?: boolean;
}

function ParsonsChallenge({
    topic = 'binary search',
    language = 'python',
    onComplete,
    onBack,
    useAI = false
}: ParsonsChallengeProps) {
    const [challenge, setChallenge] = useState<ParsonsChallengeType | null>(null);
    const [userOrder, setUserOrder] = useState<CodeLine[]>([]);
    const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
    const [lineResults, setLineResults] = useState<Record<string, boolean>>({});
    const [hintsUsed, setHintsUsed] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const selectedLanguage = language;

    const { generateParsonsChallenge, isGenerating, error } = useChallengeAI();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const loadHardcodedChallenge = useCallback(() => {
        const example = getRandomParsonsExample(selectedLanguage);
        // Create solution lines with positions
        const solutionLines: CodeLine[] = example.solution.map((text, idx) => ({
            id: `sol-${idx}`,
            content: text,
            isDistractor: false,
            correctPosition: idx
        }));
        // Create distractor lines
        const distractorLines: CodeLine[] = example.distractors.map((text, idx) => ({
            id: `dis-${idx}`,
            content: text,
            isDistractor: true
        }));
        // Combine and shuffle
        const allLines = [...solutionLines, ...distractorLines].sort(() => Math.random() - 0.5);

        const challengeData: ParsonsChallengeType = {
            id: `parsons-${Date.now()}`,
            type: 'parsons',
            title: example.title,
            description: example.description,
            difficulty: 'intermediate',
            topic: example.title,
            language: example.language,
            lines: allLines,
            solution: example.solution,
            hints: example.hints,
            points: 60,
            source: useAI ? 'ai' : 'practice',
        };
        setChallenge(challengeData);
        setUserOrder(allLines);
        setResult(null);
        setLineResults({});
        setHintsUsed(0);
        setShowHint(false);
        setAttempts(0);
    }, [selectedLanguage, useAI]);

    // Generate challenge on mount
    useEffect(() => {
        if (useAI) {
            const loadChallenge = async () => {
                const generated = await generateParsonsChallenge(topic, selectedLanguage);
                if (generated.challenge) {
                    setChallenge(generated.challenge);
                    setUserOrder(generated.challenge.lines);
                    setResult(null);
                    setLineResults({});
                    setHintsUsed(0);
                    setShowHint(false);
                    setAttempts(0);
                } else {
                    loadHardcodedChallenge();
                }
            };
            loadChallenge();
        } else {
            loadHardcodedChallenge();
        }
    }, [useAI, topic, selectedLanguage, generateParsonsChallenge, loadHardcodedChallenge]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setUserOrder((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
            // Reset result when order changes
            setResult(null);
            setLineResults({});
        }
    }, []);

    const checkSolution = useCallback(() => {
        if (!challenge) return;

        setAttempts(prev => prev + 1);

        // Filter out distractors from user order
        const userSolution = userOrder
            .filter(line => !line.isDistractor)
            .map(line => line.content);

        const isCorrect = JSON.stringify(userSolution) === JSON.stringify(challenge.solution);

        // Mark each line as correct or incorrect
        const results: Record<string, boolean> = {};
        userOrder.forEach((line) => {
            if (line.isDistractor) {
                // Distractors should not be included
                results[line.id] = false;
            } else {
                // Check if this line is in the correct position
                const correctIndex = challenge.solution.indexOf(line.content);
                const userIndex = userOrder
                    .filter(l => !l.isDistractor)
                    .findIndex(l => l.id === line.id);
                results[line.id] = correctIndex === userIndex;
            }
        });

        setLineResults(results);
        setResult(isCorrect ? 'correct' : 'incorrect');

        if (isCorrect) {
            // Calculate score
            const baseScore = challenge.points;
            const hintPenalty = hintsUsed * 15;
            const attemptPenalty = (attempts) * 10;
            const finalScore = Math.max(baseScore - hintPenalty - attemptPenalty, 10);

            // Animate success
            gsap.fromTo('.challenge-container',
                { scale: 1 },
                { scale: 1.02, duration: 0.15, yoyo: true, repeat: 1 }
            );

            setTimeout(() => {
                onComplete?.(finalScore);
            }, 1500);
        }
    }, [challenge, userOrder, hintsUsed, attempts, onComplete]);

    const useHint = useCallback(() => {
        if (!challenge || hintsUsed >= challenge.hints.length) return;
        setHintsUsed(prev => prev + 1);
        setShowHint(true);
    }, [challenge, hintsUsed]);

    const resetChallenge = useCallback(() => {
        if (!challenge) return;
        setUserOrder([...challenge.lines].sort(() => Math.random() - 0.5));
        setResult(null);
        setLineResults({});
        setShowHint(false);
    }, [challenge]);

    if (isGenerating) {
        return (
            <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce">🧩</div>
                    <h2 className="text-xl font-bold mb-2">Generating Challenge...</h2>
                    <p className="text-[color:var(--color-text-muted)]">
                        Creating a Parsons Problem for "{topic}"
                    </p>
                    <div className="mt-4 w-48 h-2 bg-[color:var(--color-bg-muted)] rounded-full overflow-hidden mx-auto">
                        <div className="h-full bg-primary-500 animate-pulse rounded-full" style={{ width: '60%' }} />
                    </div>
                </div>
            </div>
        );
    }

    if (error && !challenge) {
        return (
            <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-xl font-bold mb-2">Challenge Generation Failed</h2>
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

    const userSolutionPreview = userOrder
        .filter((line) => !line.isDistractor)
        .map((line) => line.content);

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)] p-6">
            <div className="max-w-3xl mx-auto challenge-container">
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
                                <span className="text-3xl">🧩</span>
                                {challenge.title}
                            </h1>
                            <p className="text-[color:var(--color-text-muted)] mt-1">
                                {challenge.description}
                            </p>
                        </div>
                        <div className="text-right">
                            <ChallengeSourceBadge
                                source={challenge.source || (useAI ? 'ai' : 'practice')}
                                isFallback={challenge.isFallback}
                                fallbackReason={challenge.fallbackReason}
                            />
                            <div className="text-2xl font-bold text-primary-400">{challenge.points} pts</div>
                            <div className="text-xs text-[color:var(--color-text-muted)]">
                                Attempts: {attempts}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-[color:var(--color-bg-secondary)] rounded-xl p-4 mb-6 border border-[color:var(--color-border)]">
                    <h3 className="font-semibold mb-2">📋 Instructions</h3>
                    <ul className="text-sm text-[color:var(--color-text-muted)] space-y-1">
                        <li>• Drag and drop the code blocks into the correct order</li>
                        <li>• <span className="text-red-400">Warning:</span> Some lines are distractors (wrong code) - don't include them!</li>
                        <li>• Click "Check Solution" when you're ready</li>
                    </ul>
                </div>

                {/* Drag & Drop Area */}
                <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-700 mb-6">
                    <div className="flex items-center gap-2 mb-4 text-neutral-400 text-sm">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="ml-2 font-mono">{challenge.language}</span>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={userOrder.map(l => l.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2">
                                {userOrder.map((line) => (
                                    <SortableLine
                                        key={line.id}
                                        line={line}
                                        isCorrect={result ? lineResults[line.id] : null}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>

                {/* Result Feedback */}
                {result && (
                    <div className={`
                        rounded-xl p-4 mb-6 border-2 text-center
                        ${result === 'correct'
                            ? 'bg-green-500/10 border-green-500 text-green-400'
                            : 'bg-red-500/10 border-red-500 text-red-400'
                        }
                    `}>
                        {result === 'correct' ? (
                            <div>
                                <div className="text-4xl mb-2">🎉</div>
                                <h3 className="text-xl font-bold">Correct!</h3>
                                <p className="text-sm opacity-80">Great job! You solved it in {attempts} attempt(s)</p>
                            </div>
                        ) : (
                            <div>
                                <div className="text-4xl mb-2">🤔</div>
                                <h3 className="text-xl font-bold">Not quite right</h3>
                                <p className="text-sm opacity-80">
                                    Check the highlighted lines and try again.
                                    Green = correct position, Red = wrong.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {result && (
                    <div className="bg-[color:var(--color-bg-secondary)] rounded-xl p-4 mb-6 border border-[color:var(--color-border)]">
                        <h4 className="font-semibold mb-3">Solution Comparison</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)] mb-2">
                                    Your Order
                                </div>
                                <pre className="text-xs md:text-sm font-mono text-neutral-100 bg-neutral-900 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap border border-neutral-700 min-h-[160px]">
                                    {userSolutionPreview.join('\n') || '(no non-distractor lines selected)'}
                                </pre>
                            </div>
                            <div>
                                <div className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)] mb-2">
                                    Expected Order
                                </div>
                                <pre className="text-xs md:text-sm font-mono text-neutral-100 bg-neutral-900 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap border border-neutral-700 min-h-[160px]">
                                    {challenge.solution.join('\n')}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hint Section */}
                {showHint && hintsUsed > 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                        <h4 className="font-semibold text-yellow-400 mb-2">💡 Hint {hintsUsed}</h4>
                        <p className="text-sm">{challenge.hints[hintsUsed - 1]}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                    <Button
                        onClick={checkSolution}
                        disabled={result === 'correct'}
                    >
                        Check Solution
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={useHint}
                        disabled={hintsUsed >= challenge.hints.length}
                    >
                        Use Hint ({challenge.hints.length - hintsUsed} left)
                    </Button>
                    <Button variant="ghost" onClick={resetChallenge}>
                        Reset
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ParsonsChallenge;

