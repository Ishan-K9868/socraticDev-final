// ─── AI Code Review Types ───────────────────────────────────────────────────

export type ReviewSeverity = 'error' | 'warning' | 'info' | 'suggestion';

export interface ReviewComment {
    id: string;
    line: number;
    severity: ReviewSeverity;
    title: string;
    message: string;
}

export interface ReviewFile {
    id: string;
    name: string;
    language: string;
    description: string;
    accentColor: string;
    code: string;
    comments: ReviewComment[];
    qualityScore: number; // 0-10
}

export type ReviewPhase = 'idle' | 'scanning' | 'reviewing' | 'summary';

export interface ReviewSimState {
    phase: ReviewPhase;
    activeFileId: string;
    revealedComments: number; // how many comments are visible
    scanProgress: number;    // 0-100
    elapsed: number;         // seconds
}
