import type { ColiseumPlayer, ColiseumRound, ColiseumConfig } from './coliseumTypes';

// ─── Player Profiles ────────────────────────────────────────────────────────

export const PLAYERS: ColiseumPlayer[] = [
    {
        id: 'p1',
        name: 'NullPointer',
        color: 'teal',
        hexColor: '#2DD4BF',
        avatar: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z',
        rank: 'Diamond',
        isEliminated: false,
        score: 0,
        progress: 0,
        typedLines: 0,
        totalLines: 0,
        bugsFound: 0,
        totalBugs: 0,
        responseTime: 0,
    },
    {
        id: 'p2',
        name: 'StackOverflow',
        color: 'amber',
        hexColor: '#F59E0B',
        avatar: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
        rank: 'Gold',
        isEliminated: false,
        score: 0,
        progress: 0,
        typedLines: 0,
        totalLines: 0,
        bugsFound: 0,
        totalBugs: 0,
        responseTime: 0,
    },
    {
        id: 'p3',
        name: 'SyntaxError',
        color: 'rose',
        hexColor: '#F43F5E',
        avatar: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
        rank: 'Silver',
        isEliminated: false,
        score: 0,
        progress: 0,
        typedLines: 0,
        totalLines: 0,
        bugsFound: 0,
        totalBugs: 0,
        responseTime: 0,
    },
    {
        id: 'p4',
        name: 'SegFault',
        color: 'violet',
        hexColor: '#8B5CF6',
        avatar: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
        rank: 'Gold',
        isEliminated: false,
        score: 0,
        progress: 0,
        typedLines: 0,
        totalLines: 0,
        bugsFound: 0,
        totalBugs: 0,
        responseTime: 0,
    },
];

// ─── Code Challenges ────────────────────────────────────────────────────────

export const ROUNDS: ColiseumRound[] = [
    {
        id: 1,
        type: 'bug-hunt',
        title: 'ROUND 1: BUG HUNT',
        subtitle: 'Find all hidden bugs. Slowest player eliminated.',
        icon: '🐛',
        duration: 30,
        code: `def binary_search(arr, target):
    left = 0
    right = len(arr)  # BUG: should be len(arr) - 1
    
    while left < right:  # BUG: should be left <= right
        mid = (left + right) / 2  # BUG: should be //
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid  # BUG: should be mid + 1
        else:
            right = mid - 1
    
    return -1`,
    },
    {
        id: 2,
        type: 'optimize',
        title: 'ROUND 2: OPTIMIZE',
        subtitle: 'Reduce time complexity. Highest complexity eliminated.',
        icon: '⚡',
        duration: 25,
        code: `function findDuplicates(arr) {
  const duplicates = [];
  // O(n²) — optimize to O(n)
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) {
        if (!duplicates.includes(arr[i])) {
          duplicates.push(arr[i]);
        }
      }
    }
  }
  return duplicates;
}`,
    },
    {
        id: 3,
        type: 'eli5-duel',
        title: 'FINAL ROUND: ELI5 DUEL',
        subtitle: 'Explain this code to a 5-year-old. AI judges clarity.',
        icon: '🎤',
        duration: 20,
        code: `async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      const delay = Math.pow(2, i) * 1000;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}`,
    },
];

// ─── Simulation Timing Config ───────────────────────────────────────────────

export const COLISEUM_CONFIG: ColiseumConfig = {
    roundDurations: [30, 25, 20],
    countdownDuration: 3,
    judgingDuration: 3,
    eliminationDuration: 3,
    introDuration: 2,
};

// ─── Player Speed Profiles ──────────────────────────────────────────────────
// Each player has a speed multiplier and accuracy for each round type
// Higher speed = faster progress animation

export interface PlayerSpeedProfile {
    playerId: string;
    bugHuntSpeed: number;     // 0.5-1.5, 1.0 = baseline
    optimizeSpeed: number;
    eli5Speed: number;
    accuracy: number;         // 0-1, affects final score
}

export const SPEED_PROFILES: PlayerSpeedProfile[] = [
    { playerId: 'p1', bugHuntSpeed: 1.3, optimizeSpeed: 1.1, eli5Speed: 0.9, accuracy: 0.92 },
    { playerId: 'p2', bugHuntSpeed: 0.9, optimizeSpeed: 1.4, eli5Speed: 1.2, accuracy: 0.88 },
    { playerId: 'p3', bugHuntSpeed: 1.0, optimizeSpeed: 0.7, eli5Speed: 1.1, accuracy: 0.75 },
    { playerId: 'p4', bugHuntSpeed: 0.8, optimizeSpeed: 1.0, eli5Speed: 1.4, accuracy: 0.85 },
];

// ─── Typing Sequences ───────────────────────────────────────────────────────
// Lines revealed per "tick" during simulation to simulate typing

export const TYPING_COMMENTS: Record<string, string[]> = {
    'p1': [
        '// Checking boundary condition...',
        '// Found it — off-by-one in right init',
        '// Integer division needed here',
        '// mid + 1 to avoid infinite loop',
    ],
    'p2': [
        '// Hmm, the loop bound looks wrong',
        '// This comparison should be <=',
        '// Floor division, not float division',
        '// Left pointer update is incorrect',
    ],
    'p3': [
        '// Scanning for edge cases...',
        '// Array bound issue spotted',
        '// Type mismatch on division',
        '// Wait... need to increment left',
    ],
    'p4': [
        '// Something off with the indexing',
        '// right = len(arr) - 1, classic',
        '// Should be floor division here',
        '// This while condition seems wrong',
    ],
};

// ─── Elimination Order (pre-determined but appears random) ──────────────────
// Round 1: p3 (SyntaxError) eliminated — slowest bug hunter
// Round 2: p4 (SegFault) eliminated — worst optimizer
// Winner: p1 (NullPointer) beats p2 (StackOverflow) in ELI5 duel

export const ELIMINATION_ORDER = ['p3', 'p4'];
export const WINNER_ID = 'p1';
export const RUNNER_UP_ID = 'p2';
