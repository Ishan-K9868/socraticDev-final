// Code Visualizer Types

export interface GraphNode {
    id: string;
    name: string;
    type: 'function' | 'class' | 'method' | 'variable' | 'module';
    line: number | null;
    endLine?: number;
    code?: string;
}

export interface GraphEdge {
    from: string;
    to: string;
    type: 'calls' | 'imports' | 'extends' | 'uses';
    label?: string;
}

export interface CallGraph {
    nodes: GraphNode[];
    edges: GraphEdge[];
    meta?: AnalysisMeta;
}

export interface ExecutionStep {
    line: number;
    action: 'execute' | 'call' | 'return' | 'assign' | 'condition' | 'loop';
    description: string;
    variables: Record<string, unknown>;
    callStack: string[];
    output?: string;
    highlight?: boolean;
}

export interface ExecutionTrace {
    steps: ExecutionStep[];
    finalOutput: string;
    error?: string;
    error_code?: 'invalid_request' | 'timeout' | 'sandbox_blocked' | 'runtime_error' | 'internal_error';
    meta?: AnalysisMeta;
}

export interface AnalysisMeta {
    engine: string;
    truncated: boolean;
    limits: {
        max_steps: number;
        timeout_ms: number;
    };
    duration_ms: number;
}

export interface VisualizerState {
    code: string;
    language: string;
    callGraph: CallGraph | null;
    executionTrace: ExecutionTrace | null;
    isAnalyzing: boolean;
    currentStep: number;
    isPlaying: boolean;
    playSpeed: number;
    error: string | null;
}

export const SUPPORTED_VISUALIZER_LANGUAGES = [
    { id: 'python', name: 'Python', extension: 'py' },
];
