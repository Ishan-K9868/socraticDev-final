import { useState, useCallback, useRef } from 'react';
import { CallGraph, ExecutionTrace, GraphNode, GraphEdge, ExecutionStep } from './types';
import { graphragAPI } from '../../services/graphrag-api';

const DEFAULT_MAX_STEPS = 1000;
const DEFAULT_TIMEOUT_MS = 3000;

function toPositiveInt(value: unknown, fallback = 1): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function toLineOrNull(value: unknown): number | null {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return null;
    const line = Math.floor(parsed);
    return line >= 0 ? line : null;
}

function mapVisualizerError(rawMsg: string, fallbackMessage: string): string {
    if (rawMsg.includes('Tried analyzer endpoints')) {
        return rawMsg;
    }
    if (rawMsg.includes('(422)') || rawMsg.includes('API Error (422)')) {
        return 'Invalid request payload for analyzer (422). Please retry with valid Python code.';
    }
    if (rawMsg.includes('404')) {
        return 'Analyzer endpoint not found (404). Restart backend to load /api/visualization/analyze.';
    }
    return rawMsg || fallbackMessage;
}

function sanitizeGraph(raw: any): CallGraph {
    const rawNodes = Array.isArray(raw?.nodes) ? raw.nodes : [];
    const rawEdges = Array.isArray(raw?.edges) ? raw.edges : [];

    const validTypes = new Set(['function', 'class', 'method', 'variable', 'module']);
    const nodes: GraphNode[] = [];
    const seen = new Set<string>();

    for (const item of rawNodes) {
        const id = typeof item?.id === 'string' ? item.id.trim() : '';
        const name = typeof item?.name === 'string' ? item.name.trim() : '';
        if (!id || !name || seen.has(id)) continue;

        const type = typeof item?.type === 'string' && validTypes.has(item.type) ? item.type : 'function';
        nodes.push({
            id,
            name,
            type,
            line: toLineOrNull(item?.line),
        });
        seen.add(id);
    }

    const validEdgeTypes = new Set(['calls', 'imports', 'extends', 'uses']);
    const edges: GraphEdge[] = [];
    for (const item of rawEdges) {
        const from = typeof item?.from === 'string' ? item.from.trim() : '';
        const to = typeof item?.to === 'string' ? item.to.trim() : '';
        if (!from || !to || !seen.has(from) || !seen.has(to)) continue;
        const type = typeof item?.type === 'string' && validEdgeTypes.has(item.type) ? item.type : 'calls';
        edges.push({ from, to, type });
    }

    const meta = raw?.meta && typeof raw.meta === 'object'
        ? {
            engine: String(raw.meta.engine || 'python_deterministic'),
            truncated: Boolean(raw.meta.truncated),
            limits: {
                max_steps: toPositiveInt(raw.meta?.limits?.max_steps, DEFAULT_MAX_STEPS),
                timeout_ms: toPositiveInt(raw.meta?.limits?.timeout_ms, DEFAULT_TIMEOUT_MS),
            },
            duration_ms: Math.max(0, Number(raw.meta.duration_ms) || 0),
        }
        : undefined;

    return { nodes, edges, meta };
}

function sanitizeTrace(raw: any): ExecutionTrace {
    const rawSteps = Array.isArray(raw?.steps) ? raw.steps : [];
    const validActions = new Set(['execute', 'call', 'return', 'assign', 'condition', 'loop']);

    const steps: ExecutionStep[] = rawSteps
        .map((item: any) => {
            const line = toPositiveInt(item?.line, 0);
            const description = typeof item?.description === 'string' ? item.description.trim() : '';
            if (!line || !description) return null;

            const action = typeof item?.action === 'string' && validActions.has(item.action)
                ? item.action
                : 'execute';

            const variables = item?.variables && typeof item.variables === 'object' ? item.variables : {};
            const callStack = Array.isArray(item?.callStack) ? item.callStack.map((v: unknown) => String(v)) : [];
            const output = item?.output == null ? undefined : String(item.output);

            return { line, action, description, variables, callStack, output } as ExecutionStep;
        })
        .filter((s: ExecutionStep | null): s is ExecutionStep => s !== null);

    const meta = raw?.meta && typeof raw.meta === 'object'
        ? {
            engine: String(raw.meta.engine || 'python_deterministic'),
            truncated: Boolean(raw.meta.truncated),
            limits: {
                max_steps: toPositiveInt(raw.meta?.limits?.max_steps, DEFAULT_MAX_STEPS),
                timeout_ms: toPositiveInt(raw.meta?.limits?.timeout_ms, DEFAULT_TIMEOUT_MS),
            },
            duration_ms: Math.max(0, Number(raw.meta.duration_ms) || 0),
        }
        : undefined;

    return {
        steps,
        finalOutput: typeof raw?.finalOutput === 'string' ? raw.finalOutput : '',
        error: typeof raw?.error === 'string' ? raw.error : undefined,
        error_code: typeof raw?.error_code === 'string' ? raw.error_code : undefined,
        meta,
    };
}

export function useCodeAnalysis() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [callGraph, setCallGraph] = useState<CallGraph | null>(null);
    const [executionTrace, setExecutionTrace] = useState<ExecutionTrace | null>(null);
    const [error, setError] = useState<string | null>(null);
    const requestSeqRef = useRef(0);

    const analyzeCallGraph = useCallback(async (code: string, language: string): Promise<CallGraph | null> => {
        if (!code.trim()) {
            setError('Please enter some code');
            return null;
        }

        setIsAnalyzing(true);
        setError(null);
        const reqId = ++requestSeqRef.current;

        try {
            const raw = await graphragAPI.analyzeVisualizer({
                mode: 'graph',
                code,
                language,
                max_steps: DEFAULT_MAX_STEPS,
                timeout_ms: DEFAULT_TIMEOUT_MS,
            });
            if (reqId !== requestSeqRef.current) return null;

            const graph = sanitizeGraph(raw);
            if (!graph.nodes.length && !graph.edges.length) {
                throw new Error('Analyzer returned empty graph');
            }

            setCallGraph(graph);
            return graph;
        } catch (e) {
            if (reqId === requestSeqRef.current) {
                const rawMsg = e instanceof Error ? e.message : 'Failed to analyze code';
                const errorMsg = mapVisualizerError(rawMsg, 'Failed to analyze code');
                setError(errorMsg);
            }
            return null;
        } finally {
            if (reqId === requestSeqRef.current) {
                setIsAnalyzing(false);
            }
        }
    }, []);

    const analyzeExecution = useCallback(async (code: string, language: string): Promise<ExecutionTrace | null> => {
        if (!code.trim()) {
            setError('Please enter some code');
            return null;
        }

        setIsAnalyzing(true);
        setError(null);
        const reqId = ++requestSeqRef.current;

        try {
            const raw = await graphragAPI.analyzeVisualizer({
                mode: 'execution',
                code,
                language,
                max_steps: DEFAULT_MAX_STEPS,
                timeout_ms: DEFAULT_TIMEOUT_MS,
                allow_execution: true,
            });
            if (reqId !== requestSeqRef.current) return null;

            const trace = sanitizeTrace(raw);
            if (!trace.steps.length && !trace.error && !trace.finalOutput) {
                throw new Error('Analyzer returned empty execution trace');
            }

            setExecutionTrace(trace);
            return trace;
        } catch (e) {
            if (reqId === requestSeqRef.current) {
                const rawMsg = e instanceof Error ? e.message : 'Failed to trace execution';
                const errorMsg = mapVisualizerError(rawMsg, 'Failed to trace execution');
                setError(errorMsg);
            }
            return null;
        } finally {
            if (reqId === requestSeqRef.current) {
                setIsAnalyzing(false);
            }
        }
    }, []);

    const reset = useCallback(() => {
        requestSeqRef.current += 1;
        setCallGraph(null);
        setExecutionTrace(null);
        setError(null);
        setIsAnalyzing(false);
    }, []);

    return {
        isAnalyzing,
        callGraph,
        executionTrace,
        error,
        analyzeCallGraph,
        analyzeExecution,
        reset,
    };
}
