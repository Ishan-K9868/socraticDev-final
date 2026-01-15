// Code Visualizer Types

export interface GraphNode {
    id: string;
    name: string;
    type: 'function' | 'class' | 'method' | 'variable' | 'module';
    line: number;
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
    { id: 'javascript', name: 'JavaScript', extension: 'js' },
    { id: 'typescript', name: 'TypeScript', extension: 'ts' },
    { id: 'java', name: 'Java', extension: 'java' },
    { id: 'cpp', name: 'C++', extension: 'cpp' },
];
