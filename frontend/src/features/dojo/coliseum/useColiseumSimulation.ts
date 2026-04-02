import { useState, useCallback, useRef, useEffect } from 'react';
import type { SimulationState, ColiseumPlayer, RoundResult } from './coliseumTypes';
import {
    PLAYERS, ROUNDS, COLISEUM_CONFIG, SPEED_PROFILES,
    ELIMINATION_ORDER, WINNER_ID, TYPING_COMMENTS,
} from './coliseumData';

export type PlaybackSpeed = 0.5 | 1 | 1.5 | 2 | 3;

export const PLAYBACK_OPTIONS: { label: string; value: PlaybackSpeed }[] = [
    { label: '0.5×', value: 0.5 },
    { label: '1×',   value: 1 },
    { label: '1.5×', value: 1.5 },
    { label: '2×',   value: 2 },
    { label: '3×',   value: 3 },
];

function deepClonePlayers(): ColiseumPlayer[] {
    return PLAYERS.map(p => ({ ...p, isEliminated: false, score: 0, progress: 0, typedLines: 0, totalLines: 4, bugsFound: 0, totalBugs: 4, responseTime: 0 }));
}

const initialState: SimulationState = {
    phase: 'idle',
    currentRound: 0,
    players: deepClonePlayers(),
    timer: 0,
    eliminatedThisRound: null,
    winnerId: null,
    roundResults: [],
};

export function useColiseumSimulation() {
    const [state, setState] = useState<SimulationState>(initialState);
    const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
    const speedRef = useRef<PlaybackSpeed>(1);
    const intervalRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const progressIntervalsRef = useRef<number[]>([]);

    // Keep ref in sync so callbacks always read the latest speed
    useEffect(() => { speedRef.current = playbackSpeed; }, [playbackSpeed]);

    const ms = (baseDuration: number) => baseDuration / speedRef.current;

    const cleanup = useCallback(() => {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
        if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
        progressIntervalsRef.current.forEach(id => clearInterval(id));
        progressIntervalsRef.current = [];
    }, []);

    useEffect(() => () => cleanup(), [cleanup]);

    // ── Run a round ──────────────────────────────────────────────────────

    const runRound = useCallback((roundIndex: number) => {
        const round = ROUNDS[roundIndex];
        const duration = round.duration;

        // Start countdown 3-2-1
        setState(prev => ({ ...prev, phase: 'countdown', currentRound: roundIndex, timer: 3 }));

        let countdownVal = 3;
        intervalRef.current = window.setInterval(() => {
            countdownVal -= 1;
            if (countdownVal <= 0) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                startActiveRound(roundIndex, duration);
            } else {
                setState(prev => ({ ...prev, timer: countdownVal }));
            }
        }, ms(1000));
    }, []);

    const startActiveRound = useCallback((roundIndex: number, duration: number) => {
        setState(prev => ({ ...prev, phase: 'round-active', timer: duration }));

        // Timer countdown
        let remaining = duration;
        intervalRef.current = window.setInterval(() => {
            remaining -= 1;
            setState(prev => ({ ...prev, timer: remaining }));
            if (remaining <= 0) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                finishRound(roundIndex);
            }
        }, ms(1000));

        // Player progress simulation — each player advances at their own speed
        const activePlayers = PLAYERS.filter(p => !isPlayerEliminated(roundIndex, p.id));
        const round = ROUNDS[roundIndex];

        activePlayers.forEach(player => {
            const profile = SPEED_PROFILES.find(sp => sp.playerId === player.id)!;
            const speed = round.type === 'bug-hunt' ? profile.bugHuntSpeed
                : round.type === 'optimize' ? profile.optimizeSpeed
                    : profile.eli5Speed;

            // Calculate tick interval — faster speed = shorter interval
            const baseInterval = (duration * 1000) / 100; // 100 ticks to fill progress
            const tickInterval = ms(baseInterval / speed);
            let progress = 0;

            const pid = window.setInterval(() => {
                // Add some randomness to make it feel natural
                const jitter = 0.5 + Math.random() * 1.5;
                progress = Math.min(100, progress + jitter);

                setState(prev => ({
                    ...prev,
                    players: prev.players.map(p =>
                        p.id === player.id
                            ? {
                                ...p,
                                progress,
                                typedLines: Math.floor((progress / 100) * 4),
                                bugsFound: round.type === 'bug-hunt'
                                    ? Math.floor((progress / 100) * 4 * profile.accuracy)
                                    : p.bugsFound,
                                score: Math.round(progress * profile.accuracy),
                            }
                            : p,
                    ),
                }));

                if (progress >= 100) clearInterval(pid);
            }, tickInterval);

            progressIntervalsRef.current.push(pid);
        });
    }, []);

    const isPlayerEliminated = (currentRoundIndex: number, playerId: string): boolean => {
        for (let i = 0; i < currentRoundIndex; i++) {
            if (ELIMINATION_ORDER[i] === playerId) return true;
        }
        return false;
    };

    const finishRound = useCallback((roundIndex: number) => {
        // Stop all progress intervals
        progressIntervalsRef.current.forEach(id => clearInterval(id));
        progressIntervalsRef.current = [];

        // Judging phase
        setState(prev => ({ ...prev, phase: 'round-judging' }));

        // Calculate final scores and determine elimination
        const eliminatedId = ELIMINATION_ORDER[roundIndex];

        timeoutRef.current = window.setTimeout(() => {
            // Record round result
            const result: RoundResult = {
                roundIndex,
                scores: {},
                eliminatedPlayerId: eliminatedId,
            };

            setState(prev => {
                const updatedPlayers = prev.players.map(p => {
                    result.scores[p.id] = p.score;
                    if (p.id === eliminatedId) {
                        return { ...p, isEliminated: true };
                    }
                    return p;
                });

                return {
                    ...prev,
                    phase: 'elimination',
                    players: updatedPlayers,
                    eliminatedThisRound: eliminatedId,
                    roundResults: [...prev.roundResults, result],
                };
            });

            // After elimination animation, move to next round or victory
            timeoutRef.current = window.setTimeout(() => {
                if (roundIndex < 2) {
                    // Reset progress for next round
                    setState(prev => ({
                        ...prev,
                        phase: 'next-round-intro',
                        eliminatedThisRound: null,
                        players: prev.players.map(p => ({
                            ...p,
                            progress: p.isEliminated ? 0 : 0,
                            typedLines: 0,
                            bugsFound: 0,
                        })),
                    }));

                    timeoutRef.current = window.setTimeout(() => {
                        runRound(roundIndex + 1);
                    }, ms(COLISEUM_CONFIG.introDuration * 1000));
                } else {
                    // Victory!
                    setState(prev => ({
                        ...prev,
                        phase: 'victory',
                        winnerId: WINNER_ID,
                    }));
                }
            }, ms(COLISEUM_CONFIG.eliminationDuration * 1000));

        }, ms(COLISEUM_CONFIG.judgingDuration * 1000));
    }, [runRound]);

    // ── Public API ───────────────────────────────────────────────────────

    const start = useCallback(() => {
        cleanup();
        setState({ ...initialState, players: deepClonePlayers(), phase: 'intro' });

        // After intro, start round 1
        timeoutRef.current = window.setTimeout(() => {
            runRound(0);
        }, ms(COLISEUM_CONFIG.introDuration * 1000));
    }, [cleanup, runRound]);

    const reset = useCallback(() => {
        cleanup();
        setState({ ...initialState, players: deepClonePlayers() });
    }, [cleanup]);

    // Derived state
    const currentRound = ROUNDS[state.currentRound] ?? ROUNDS[0];
    const activePlayers = state.players.filter(p => !p.isEliminated);
    const eliminatedPlayer = state.eliminatedThisRound
        ? state.players.find(p => p.id === state.eliminatedThisRound) ?? null
        : null;
    const winner = state.winnerId ? state.players.find(p => p.id === state.winnerId) ?? null : null;
    const typingComments = TYPING_COMMENTS;

    return {
        state,
        currentRound,
        activePlayers,
        eliminatedPlayer,
        winner,
        typingComments,
        start,
        reset,
        isRunning: state.phase !== 'idle',
        playbackSpeed,
        setPlaybackSpeed,
    };
}
