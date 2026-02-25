import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CodeInputPanel from './CodeInputPanel';
import CallGraphView from './CallGraphView';
import ExecutionAnimator from './ExecutionAnimator';
import { useCodeAnalysis } from './useCodeAnalysis';
import ThemeToggle from '../../components/ThemeToggle';

type ViewMode = 'graph' | 'execution';

function CodeVisualizer() {
    const [code, setCode] = useState('');
    const language = 'python';
    const [viewMode, setViewMode] = useState<ViewMode>('graph');

    const {
        isAnalyzing,
        callGraph,
        executionTrace,
        error,
        analyzeCallGraph,
        analyzeExecution,
        reset
    } = useCodeAnalysis();

    const handleAnalyze = useCallback(async () => {
        if (viewMode === 'graph') {
            await analyzeCallGraph(code, language);
        } else {
            await analyzeExecution(code, language);
        }
    }, [code, language, viewMode, analyzeCallGraph, analyzeExecution]);

    const handleCodeChange = (newCode: string) => {
        setCode(newCode);
        reset();
    };

    const activeMeta = viewMode === 'graph' ? callGraph?.meta : executionTrace?.meta;

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex flex-col">
            <header className="border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)]">
                <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/app"
                            className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)] transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-display font-bold flex items-center gap-2">
                                <span className="text-primary-400">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.85-4.15a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                                Code Visualizer
                            </h1>
                            <p className="text-sm text-[color:var(--color-text-muted)]">
                                Deterministic Python call graph and execution tracing
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-[color:var(--color-bg-muted)] rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('graph')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'graph'
                                        ? 'bg-primary-500 text-white'
                                        : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)]'
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                    </svg>
                                    Call Graph
                                </span>
                            </button>
                            <button
                                onClick={() => setViewMode('execution')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'execution'
                                        ? 'bg-primary-500 text-white'
                                        : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)]'
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Execution Trace
                                </span>
                            </button>
                        </div>

                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <div className="border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)]/70 px-6 py-2">
                <div className="max-w-[1800px] mx-auto flex items-center justify-end">
                    {isAnalyzing ? (
                        <span className="px-3 py-1 rounded-full border border-primary-500/40 bg-primary-500/10 text-primary-300 text-xs font-medium">
                            Analyzer running...
                        </span>
                    ) : activeMeta ? (
                        <span
                            className={`px-3 py-1 rounded-full border text-xs font-medium ${activeMeta.truncated
                                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                                    : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                                }`}
                            title={`Limits: max_steps ${activeMeta.limits.max_steps}, timeout ${activeMeta.limits.timeout_ms}ms`}
                        >
                            {activeMeta.engine} | {activeMeta.duration_ms}ms | {activeMeta.truncated ? 'truncated' : 'complete'}
                        </span>
                    ) : (
                        <span className="px-3 py-1 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] text-[color:var(--color-text-muted)] text-xs">
                            No analysis run yet
                        </span>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border-b border-red-500/30 px-6 py-3">
                    <div className="max-w-[1800px] mx-auto flex items-center gap-2 text-red-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            <div className="flex-1 flex min-h-0">
                <div className="w-1/2 border-r border-[color:var(--color-border)] flex flex-col">
                    <CodeInputPanel
                        code={code}
                        language={language}
                        onCodeChange={handleCodeChange}
                        onAnalyze={handleAnalyze}
                        isAnalyzing={isAnalyzing}
                    />
                </div>

                <div className="w-1/2 flex flex-col bg-[color:var(--color-bg-secondary)]">
                    {viewMode === 'graph' ? (
                        <CallGraphView graph={callGraph || { nodes: [], edges: [] }} />
                    ) : (
                        <ExecutionAnimator
                            trace={executionTrace || { steps: [], finalOutput: '' }}
                            code={code}
                        />
                    )}
                </div>
            </div>

            <footer className="border-t border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] px-6 py-3">
                <div className="max-w-[1800px] mx-auto flex items-center justify-between text-sm text-[color:var(--color-text-muted)]">
                    <div className="flex items-center gap-4">
                        <span>Server-side deterministic analyzer</span>
                        <span>|</span>
                        <span>Python-only v1</span>
                    </div>
                    <div>
                        <Link to="/dojo" className="hover:text-primary-400 transition-colors">
                            Practice in The Dojo -&gt;
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default CodeVisualizer;
