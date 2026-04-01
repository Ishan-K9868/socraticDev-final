// ─── Coliseum Types ─────────────────────────────────────────────────────────

export interface ColiseumPlayer {
    id: string;
    name: string;
    color: string;         // Tailwind color prefix e.g. 'teal', 'amber'
    hexColor: string;      // Hex for inline styles
    avatar: string;        // SVG path data
    rank: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
    isEliminated: boolean;
    score: number;
    progress: number;      // 0-100
    typedLines: number;
    totalLines: number;
    bugsFound: number;
    totalBugs: number;
    responseTime: number;  // ms — for ELI5 round
}

export type RoundType = 'bug-hunt' | 'optimize' | 'eli5-duel';

export interface ColiseumRound {
    id: number;
    type: RoundType;
    title: string;
    subtitle: string;
    code: string;
    duration: number;      // seconds
    icon: string;          // emoji
}

export type SimulationPhase =
    | 'idle'
    | 'intro'
    | 'countdown'
    | 'round-active'
    | 'round-judging'
    | 'elimination'
    | 'next-round-intro'
    | 'victory';

export interface SimulationState {
    phase: SimulationPhase;
    currentRound: number;             // 0, 1, 2
    players: ColiseumPlayer[];
    timer: number;                    // seconds remaining
    eliminatedThisRound: string | null; // player id
    winnerId: string | null;
    roundResults: RoundResult[];
}

export interface RoundResult {
    roundIndex: number;
    scores: Record<string, number>;   // playerId -> score
    eliminatedPlayerId: string;
}

export interface ColiseumConfig {
    roundDurations: [number, number, number]; // seconds per round
    countdownDuration: number;
    judgingDuration: number;
    eliminationDuration: number;
    introDuration: number;
}
