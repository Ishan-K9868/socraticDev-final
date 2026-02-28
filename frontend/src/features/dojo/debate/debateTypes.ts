import { ChallengeType } from '../types';

// ── Agent Roles ──────────────────────────────────────────────────────────────

export type AgentRole = 'teacher' | 'critic' | 'dispatcher';

// ── Debate Phases (deterministic state machine) ──────────────────────────────

export type DebatePhase = 'exploring' | 'proposing' | 'defending' | 'resolved';

// ── Messages ─────────────────────────────────────────────────────────────────

export interface DebateMessage {
    id: string;
    role: AgentRole | 'student';
    content: string;
    timestamp: number;
}

// ── Challenge context snapshot passed to agents ──────────────────────────────

export interface DebateContext {
    challengeType: ChallengeType;
    topic: string;
    language: string;
    /** Visible code from the challenge (code snippet, buggy code, etc.) */
    code?: string;
    /** User's current answer / submission text, if any */
    userAnswer?: string;
    /** Current score, if challenge is complete */
    score?: number;
    /** Free-form description of what the user is looking at */
    challengeState?: string;
}

// ── Dispatcher routing result ────────────────────────────────────────────────

export type RouteTo = 'teacher' | 'critic' | 'both';

export interface DispatcherResult {
    nextPhase: DebatePhase;
    routeTo: RouteTo;
}

// ── Session ──────────────────────────────────────────────────────────────────

export interface DebateSession {
    messages: DebateMessage[];
    phase: DebatePhase;
    isLoading: boolean;
    error: string | null;
}

// ── Mode: live challenge vs post-completion review ───────────────────────────

export type DebateMode = 'challenge' | 'review';
