import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExecutionTrace } from './types';

interface ExecutionAnimatorProps {
    trace: ExecutionTrace;
    code: string;
}

function ExecutionAnimator({ trace, code }: ExecutionAnimatorProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playSpeed, setPlaySpeed] = useState(1000); // ms per step
    const codeRef = useRef<HTMLPreElement>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const codeLines = code.split('\n');
    const step = trace.steps[currentStep];

    // Auto-play logic
    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                setCurrentStep(prev => {
                    if (prev >= trace.steps.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, playSpeed);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPlaying, playSpeed, trace.steps.length]);

    // Scroll to current line
    useEffect(() => {
        if (codeRef.current && step) {
            const lineElement = codeRef.current.querySelector(`[data-line="${step.line}"]`);
            lineElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [step]);

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleStepForward = () => {
        if (currentStep < trace.steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleStepBackward = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleReset = () => {
        setCurrentStep(0);
        setIsPlaying(false);
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'call': return 'text-cyan-400';
            case 'return': return 'text-green-400';
            case 'assign': return 'text-yellow-400';
            case 'condition': return 'text-purple-400';
            case 'loop': return 'text-orange-400';
            default: return 'text-neutral-400';
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'call': return '→';
            case 'return': return '←';
            case 'assign': return '=';
            case 'condition': return '?';
            case 'loop': return '↻';
            default: return '•';
        }
    };

    if (!trace.steps.length) {
        return (
            <div className="h-full flex items-center justify-center text-[color:var(--color-text-muted)]">
                <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>No execution trace yet</p>
                    <p className="text-sm mt-1">Click Visualize to trace execution</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Controls */}
            <div className="flex items-center justify-between p-4 border-b border-[color:var(--color-border)]">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReset}
                        className="p-2 rounded-lg hover:bg-[color:var(--color-bg-muted)] transition-colors"
                        title="Reset"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>

                    <button
                        onClick={handleStepBackward}
                        disabled={currentStep === 0}
                        className="p-2 rounded-lg hover:bg-[color:var(--color-bg-muted)] transition-colors disabled:opacity-30"
                        title="Previous Step"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <button
                        onClick={handlePlayPause}
                        className="p-3 rounded-full bg-primary-500 hover:bg-primary-600 text-white transition-colors"
                        title={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>

                    <button
                        onClick={handleStepForward}
                        disabled={currentStep === trace.steps.length - 1}
                        className="p-2 rounded-lg hover:bg-[color:var(--color-bg-muted)] transition-colors disabled:opacity-30"
                        title="Next Step"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    {/* Speed control */}
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-[color:var(--color-text-muted)]">Speed:</span>
                        <select
                            value={playSpeed}
                            onChange={(e) => setPlaySpeed(Number(e.target.value))}
                            className="px-2 py-1 rounded bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] text-sm"
                        >
                            <option value={2000}>0.5x</option>
                            <option value={1000}>1x</option>
                            <option value={500}>2x</option>
                            <option value={250}>4x</option>
                        </select>
                    </div>

                    {/* Step counter */}
                    <div className="text-sm">
                        <span className="font-mono text-primary-400">{currentStep + 1}</span>
                        <span className="text-[color:var(--color-text-muted)]"> / {trace.steps.length}</span>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex min-h-0">
                {/* Code with highlighting */}
                <div className="w-1/2 overflow-auto border-r border-[color:var(--color-border)]">
                    <pre ref={codeRef} className="p-4 text-sm font-mono">
                        {codeLines.map((line, i) => {
                            const lineNum = i + 1;
                            const isActive = step?.line === lineNum;

                            return (
                                <div
                                    key={i}
                                    data-line={lineNum}
                                    className={`flex transition-all duration-200 ${isActive
                                        ? 'bg-primary-500/20 border-l-2 border-primary-500'
                                        : 'border-l-2 border-transparent'
                                        }`}
                                >
                                    <span className="w-10 text-right pr-4 text-[color:var(--color-text-muted)] select-none">
                                        {lineNum}
                                    </span>
                                    <span className={isActive ? 'text-white' : 'text-neutral-300'}>
                                        {line || ' '}
                                    </span>
                                </div>
                            );
                        })}
                    </pre>
                </div>

                {/* Right panel - Step info */}
                <div className="w-1/2 flex flex-col overflow-auto">
                    {/* Current step info */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 border-b border-[color:var(--color-border)]"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-lg ${getActionColor(step?.action || '')}`}>
                                    {getActionIcon(step?.action || '')}
                                </span>
                                <span className="font-semibold capitalize">{step?.action}</span>
                                <span className="text-sm text-[color:var(--color-text-muted)]">
                                    Line {step?.line}
                                </span>
                            </div>
                            <p className="text-[color:var(--color-text-muted)]">{step?.description}</p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Variables */}
                    <div className="p-4 border-b border-[color:var(--color-border)]">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                            Variables
                        </h4>
                        <div className="space-y-2">
                            {step?.variables && Object.entries(step.variables).length > 0 ? (
                                Object.entries(step.variables).map(([name, value]) => (
                                    <div key={name} className="flex items-center gap-2 font-mono text-sm">
                                        <span className="text-cyan-400">{name}</span>
                                        <span className="text-[color:var(--color-text-muted)]">=</span>
                                        <span className="text-yellow-300">{JSON.stringify(value)}</span>
                                    </div>
                                ))
                            ) : (
                                <span className="text-[color:var(--color-text-muted)] text-sm">No variables</span>
                            )}
                        </div>
                    </div>

                    {/* Call Stack */}
                    <div className="p-4 border-b border-[color:var(--color-border)]">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Call Stack
                        </h4>
                        <div className="space-y-1">
                            {step?.callStack?.length ? (
                                step.callStack.map((fn, i) => (
                                    <div
                                        key={i}
                                        className="px-3 py-1.5 bg-[color:var(--color-bg-muted)] rounded text-sm font-mono"
                                    >
                                        {fn}()
                                    </div>
                                ))
                            ) : (
                                <span className="text-[color:var(--color-text-muted)] text-sm">Empty stack</span>
                            )}
                        </div>
                    </div>

                    {/* Output */}
                    {(step?.output || trace.finalOutput) && (
                        <div className="p-4">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Output
                            </h4>
                            <pre className="p-3 bg-neutral-900 rounded-lg text-sm font-mono text-green-400 overflow-auto">
                                {step?.output || trace.finalOutput || 'No output'}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ExecutionAnimator;
