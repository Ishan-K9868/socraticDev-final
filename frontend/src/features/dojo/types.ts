// Challenge types for The Dojo
export type ChallengeType =
    | 'parsons'      // Drag-drop code ordering
    | 'surgery'      // Bug hunting
    | 'eli5'         // Explain simply
    | 'faded'        // Fill-in-blanks
    | 'mental'       // Output prediction
    | 'rubber-duck'  // Explain to duck
    | 'translation'  // Code translation
    | 'pattern'      // Pattern detection
    | 'tdd'          // Test-driven challenge
    | 'bigo'         // Big O complexity
    | 'council';     // Council of Dead Engineers

export type ChallengeSource = 'practice' | 'ai';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type ModeLanguageSupport = Record<ChallengeType, string[]>;

export interface Challenge {
    id: string;
    type: ChallengeType;
    title: string;
    description: string;
    difficulty: Difficulty;
    topic: string;
    language: string;
    points: number;
    timeLimit?: number; // seconds
    source?: ChallengeSource;
    isFallback?: boolean;
    fallbackReason?: string;
}

// Parsons Problem types
export interface CodeLine {
    id: string;
    content: string;
    isDistractor: boolean;
    correctPosition?: number;
}

export interface ParsonsChallenge extends Challenge {
    type: 'parsons';
    lines: CodeLine[];
    solution: string[];
    hints: string[];
}

// Code Surgery types
export interface Bug {
    lineNumber: number;
    bugType: 'logic' | 'syntax' | 'security' | 'performance' | 'edge-case' | 'off-by-one' | 'missing-check' | 'wrong-operator';
    description: string;
    hint: string;
    fix: string;
}

export interface SurgeryChallenge extends Challenge {
    type: 'surgery';
    buggyCode: string;
    bugs: Bug[];
    correctCode: string;
}

// ELI5 types
export interface ELI5Challenge extends Challenge {
    type: 'eli5';
    code: string;
    keyPoints: string[];
    forbiddenWords: string[];
    targetGradeLevel: number;
}

// Faded Examples types
export interface Blank {
    id: string;
    position: number; // character index
    answer: string;
    hint: string;
    length: number;
}

export interface FadedChallenge extends Challenge {
    type: 'faded';
    template: string;
    blanks: Blank[];
    fullCode: string;
}

// Mental Compiler types
export interface TraceStep {
    line: number;
    variables: Record<string, string>;
    output?: string;
    explanation: string;
}

export interface MentalChallenge extends Challenge {
    type: 'mental';
    code: string;
    expectedOutput: string;
    wrongOptions: string[];
    traceSteps: TraceStep[];
}

// User progress
export interface ChallengeProgress {
    challengeId: string;
    completed: boolean;
    score: number;
    timeSpent: number;
    hintsUsed: number;
    completedAt?: Date;
}

export interface DojoStats {
    totalPoints: number;
    challengesCompleted: number;
    currentStreak: number;
    longestStreak: number;
    badges: string[];
    categoryProgress: Record<ChallengeType, number>;
}

// Council of Dead Engineers
export interface CouncilMemberOpinion {
    engineer: string;
    era: string;
    role: string;
    accentColor: string;
    opinion: string;
    catchphrase: string;
}

export interface CouncilChallenge extends Challenge {
    type: 'council';
    dilemma: string;                   // The architectural decision
    context: string;                   // Background scenario
    engineers: string[];               // Names of the council
    opinions?: CouncilMemberOpinion[]; // Generated dynamically by AI
    userSynthesis?: string;            // What the user decided
    evaluationFeedback?: string;       // AI evaluation of synthesis
}
