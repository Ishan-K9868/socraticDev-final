// ─── Adaptive Learning Paths Types ──────────────────────────────────────────

export type NodeStatus = 'mastered' | 'in-progress' | 'locked' | 'recommended';

export interface PathNode {
    id: string;
    label: string;
    description: string;
    estimatedHours: number;
    difficulty: 1 | 2 | 3 | 4 | 5;
    status: NodeStatus;
    iconType: 'book' | 'code' | 'puzzle' | 'brain' | 'trophy' | 'rocket';
    x: number; // SVG x position (0-100 normalized)
    y: number; // SVG y position (0-100 normalized)
}

export interface PathEdge {
    from: string;
    to: string;
}

export interface LearningTrack {
    id: string;
    title: string;
    description: string;
    accentColor: string;
    nodes: PathNode[];
    edges: PathEdge[];
    masteredCount: number;
    totalHours: number;
}

export type PathPhase = 'idle' | 'analyzing' | 'building' | 'complete';

export interface PathSimState {
    phase: PathPhase;
    activeTrackId: string;
    revealedNodes: number;
    revealedEdges: number;
    analyzeProgress: number; // 0-100
}
