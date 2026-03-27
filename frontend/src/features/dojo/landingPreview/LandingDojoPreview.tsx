import { useEffect, useMemo, useState } from 'react';
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Button from '../../../ui/Button';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { evaluateLandingPreview } from './evaluators';
import type {
    BigOPreviewAnswer,
    ELI5PreviewAnswer,
    LandingPreviewMode,
    LandingPreviewScenario,
    LandingPreviewVerdict,
    MentalPreviewAnswer,
    ParsonsPreviewAnswer,
    ParsonsPreviewBlock,
    SurgeryPreviewAnswer,
} from './types';

interface LandingDojoPreviewProps {
    activeMode: LandingPreviewMode;
    scenario: LandingPreviewScenario;
    onNextPreview?: () => void;
    onVerdictChange?: (verdict: LandingPreviewVerdict | null) => void;
}

interface SortablePreviewBlockProps {
    block: ParsonsPreviewBlock;
    reducedMotion: boolean;
}

function SortablePreviewBlock({ block, reducedMotion }: SortablePreviewBlockProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: block.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: reducedMotion ? undefined : transition,
    };

    return (
        <button
            ref={setNodeRef}
            type="button"
            style={style}
            {...attributes}
            {...listeners}
            className={[
                'w-full rounded-2xl border px-3 py-3 text-left font-mono text-[12px] leading-5 transition-colors',
                'cursor-grab active:cursor-grabbing touch-none',
                isDragging
                    ? 'border-primary-500 bg-primary-500/12 text-[color:var(--color-text-primary)] shadow-lg'
                    : 'border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)] text-[color:var(--color-text-secondary)] hover:border-primary-500/40 hover:text-[color:var(--color-text-primary)]',
            ].join(' ')}
            aria-label={`Move code block: ${block.content}`}
        >
            <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current/20 text-[10px] opacity-70">
                    ::
                </span>
                <code className="whitespace-pre-wrap break-words">{block.content}</code>
            </div>
        </button>
    );
}

function LandingDojoPreview({
    activeMode,
    scenario,
    onNextPreview,
    onVerdictChange,
}: LandingDojoPreviewProps) {
    const prefersReducedMotion = useReducedMotion();
    const [parsonsOrder, setParsonsOrder] = useState<ParsonsPreviewBlock[]>([]);
    const [selectedLine, setSelectedLine] = useState<number | null>(null);
    const [eli5Text, setEli5Text] = useState('');
    const [selectedMentalOption, setSelectedMentalOption] = useState<string | null>(null);
    const [selectedComplexity, setSelectedComplexity] = useState<string | null>(null);
    const [verdict, setVerdict] = useState<LandingPreviewVerdict | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const shuffledParsonsBlocks = useMemo(() => {
        if (scenario.mode !== 'parsons') {
            return [];
        }

        return [...scenario.blocks].sort((left, right) => left.id.localeCompare(right.id)).sort(() => Math.random() - 0.5);
    }, [scenario]);

    useEffect(() => {
        setVerdict(null);
        setSelectedLine(null);
        setEli5Text('');
        setSelectedMentalOption(null);
        setSelectedComplexity(null);

        if (scenario.mode === 'parsons') {
            setParsonsOrder(shuffledParsonsBlocks);
        } else {
            setParsonsOrder([]);
        }
    }, [activeMode, scenario, shuffledParsonsBlocks]);

    useEffect(() => {
        onVerdictChange?.(verdict);
    }, [onVerdictChange, verdict]);

    const handleParsonsDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        setParsonsOrder((current) => {
            const fromIndex = current.findIndex((block) => block.id === active.id);
            const toIndex = current.findIndex((block) => block.id === over.id);
            return arrayMove(current, fromIndex, toIndex);
        });
        setVerdict(null);
    };

    const submitAnswer = () => {
        switch (scenario.mode) {
            case 'parsons': {
                const answer: ParsonsPreviewAnswer = {
                    orderedIds: parsonsOrder.map((block) => block.id),
                };
                setVerdict(evaluateLandingPreview('parsons', scenario, answer));
                return;
            }
            case 'surgery': {
                const answer: SurgeryPreviewAnswer = { lineNumber: selectedLine };
                setVerdict(evaluateLandingPreview('surgery', scenario, answer));
                return;
            }
            case 'eli5': {
                const answer: ELI5PreviewAnswer = { explanation: eli5Text };
                setVerdict(evaluateLandingPreview('eli5', scenario, answer));
                return;
            }
            case 'mental': {
                const answer: MentalPreviewAnswer = { selectedOption: selectedMentalOption };
                setVerdict(evaluateLandingPreview('mental', scenario, answer));
                return;
            }
            case 'bigo': {
                const answer: BigOPreviewAnswer = { selectedComplexity };
                setVerdict(evaluateLandingPreview('bigo', scenario, answer));
                return;
            }
        }
    };

    const resetCurrentMode = () => {
        setVerdict(null);

        switch (scenario.mode) {
            case 'parsons':
                setParsonsOrder(shuffledParsonsBlocks);
                return;
            case 'surgery':
                setSelectedLine(null);
                return;
            case 'eli5':
                setEli5Text('');
                return;
            case 'mental':
                setSelectedMentalOption(null);
                return;
            case 'bigo':
                setSelectedComplexity(null);
                return;
        }
    };

    const canSubmit = (() => {
        switch (scenario.mode) {
            case 'parsons':
                return parsonsOrder.length === scenario.blocks.length;
            case 'surgery':
                return selectedLine !== null;
            case 'eli5':
                return eli5Text.trim().length >= 20;
            case 'mental':
                return selectedMentalOption !== null;
            case 'bigo':
                return selectedComplexity !== null;
        }
    })();

    return (
        <div className="rounded-[2rem] border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)] p-5 shadow-[0_20px_80px_rgba(15,23,42,0.08)] lg:p-6">
            <div className="mb-5 flex flex-col gap-3 border-b border-[color:var(--color-border)] pb-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-500">
                        Live preview
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-semibold text-[color:var(--color-text-primary)]">
                        {scenario.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--color-text-secondary)]">
                        {scenario.prompt}
                    </p>
                </div>
                <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] px-4 py-2 text-xs text-[color:var(--color-text-muted)]">
                    One compact rep. Real validation.
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
                <div className="space-y-4">
                    {(scenario.mode === 'parsons' || scenario.mode === 'surgery' || scenario.mode === 'mental' || scenario.mode === 'bigo') && (
                        <div className="overflow-hidden rounded-[1.5rem] border border-neutral-800 bg-neutral-950 shadow-inner">
                            <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-3 text-xs text-neutral-400">
                                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                <span className="ml-2 uppercase tracking-[0.2em]">Mini challenge</span>
                            </div>

                            {scenario.mode === 'parsons' && (
                                <div className="p-4">
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleParsonsDragEnd}
                                    >
                                        <SortableContext
                                            items={parsonsOrder.map((block) => block.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            <div className="space-y-2.5">
                                                {parsonsOrder.map((block) => (
                                                    <SortablePreviewBlock
                                                        key={block.id}
                                                        block={block}
                                                        reducedMotion={prefersReducedMotion}
                                                    />
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                </div>
                            )}

                            {scenario.mode === 'surgery' && (
                                <div className="p-3">
                                    {scenario.code.split('\n').map((line, index) => {
                                        const lineNumber = index + 1;
                                        const isSelected = selectedLine === lineNumber;

                                        return (
                                            <button
                                                key={`${lineNumber}-${line}`}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedLine(lineNumber);
                                                    setVerdict(null);
                                                }}
                                                className={[
                                                    'flex w-full items-start gap-4 rounded-xl px-3 py-2 text-left transition-colors',
                                                    isSelected
                                                        ? 'bg-red-500/18 ring-1 ring-red-400/60'
                                                        : 'hover:bg-white/5',
                                                ].join(' ')}
                                            >
                                                <span className="w-5 shrink-0 pt-0.5 font-mono text-xs text-neutral-500">
                                                    {lineNumber}
                                                </span>
                                                <code className="flex-1 whitespace-pre-wrap break-words font-mono text-[12px] leading-6 text-neutral-100">
                                                    {line || ' '}
                                                </code>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {scenario.mode === 'mental' && (
                                <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-6 text-neutral-100">
                                    {scenario.code}
                                </pre>
                            )}

                            {scenario.mode === 'bigo' && (
                                <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-6 text-neutral-100">
                                    {scenario.code}
                                </pre>
                            )}
                        </div>
                    )}

                    {scenario.mode === 'eli5' && (
                        <div className="overflow-hidden rounded-[1.5rem] border border-neutral-800 bg-neutral-950 shadow-inner">
                            <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-3 text-xs text-neutral-400">
                                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                <span className="ml-2 uppercase tracking-[0.2em]">Explain this</span>
                            </div>
                            <pre className="overflow-x-auto border-b border-neutral-800 p-4 font-mono text-[12px] leading-6 text-neutral-100">
                                {scenario.code}
                            </pre>
                            <div className="p-4">
                                <textarea
                                    value={eli5Text}
                                    onChange={(event) => {
                                        setEli5Text(event.target.value);
                                        setVerdict(null);
                                    }}
                                    placeholder="Explain it in everyday language. Keep it kind, short, and concrete."
                                    className="min-h-[140px] w-full rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)] px-4 py-3 text-sm leading-6 text-[color:var(--color-text-primary)] outline-none transition-colors placeholder:text-[color:var(--color-text-muted)] focus:border-primary-500/60"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {(scenario.mode === 'mental' || scenario.mode === 'bigo') && (
                        <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-4">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
                                Choose one
                            </p>
                            <div className="space-y-3">
                                {scenario.options.map((option) => {
                                    const isSelected = scenario.mode === 'mental'
                                        ? selectedMentalOption === option
                                        : selectedComplexity === option;

                                    return (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => {
                                                if (scenario.mode === 'mental') {
                                                    setSelectedMentalOption(option);
                                                } else {
                                                    setSelectedComplexity(option);
                                                }
                                                setVerdict(null);
                                            }}
                                            className={[
                                                'w-full rounded-2xl border px-4 py-3 text-left transition-colors',
                                                isSelected
                                                    ? 'border-primary-500 bg-primary-500/10 text-[color:var(--color-text-primary)]'
                                                    : 'border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)] text-[color:var(--color-text-secondary)] hover:border-primary-500/40 hover:text-[color:var(--color-text-primary)]',
                                            ].join(' ')}
                                        >
                                            <span className="font-mono text-sm">{option}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
                            What happens next
                        </p>
                        <p className="mt-3 text-sm leading-6 text-[color:var(--color-text-secondary)]">
                            Submit once, get an immediate verdict, and either rerun the rep or switch to the next preview before heading into the full dojo.
                        </p>

                        <div className="mt-5 flex flex-wrap gap-3">
                            <Button onClick={submitAnswer} disabled={!canSubmit}>
                                Check answer
                            </Button>
                            <Button variant="ghost" onClick={resetCurrentMode}>
                                Reset preview
                            </Button>
                        </div>
                    </div>

                    {scenario.mode === 'surgery' && (
                        <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-4 text-sm leading-6 text-[color:var(--color-text-secondary)]">
                            <p className="font-semibold text-[color:var(--color-text-primary)]">Fix hint</p>
                            <p className="mt-2">When you find the bug, the real fix is: {scenario.fixSummary}</p>
                        </div>
                    )}

                    {verdict && (
                        <div
                            className={[
                                'rounded-[1.5rem] border p-4',
                                verdict.isCorrect
                                    ? 'border-emerald-400/40 bg-emerald-500/10'
                                    : 'border-amber-400/40 bg-amber-500/10',
                            ].join(' ')}
                        >
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
                                Verdict
                            </p>
                            <h4 className="mt-2 font-display text-xl font-semibold text-[color:var(--color-text-primary)]">
                                {verdict.isCorrect ? 'That checks out.' : 'Good miss to learn from.'}
                            </h4>
                            <p className="mt-3 text-sm leading-6 text-[color:var(--color-text-secondary)]">
                                {verdict.explanation}
                            </p>

                            <div className="mt-5 flex flex-wrap gap-3">
                                <Button variant="secondary" onClick={resetCurrentMode}>
                                    {verdict.retryLabel}
                                </Button>
                                <Button variant="ghost" onClick={onNextPreview}>
                                    {verdict.nextPreviewLabel}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LandingDojoPreview;
