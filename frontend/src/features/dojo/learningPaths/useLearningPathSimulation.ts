import { useState, useCallback, useRef, useEffect } from 'react';
import type { PathSimState, PathPhase } from './learningPathTypes';
import { LEARNING_TRACKS } from './learningPathData';

export type PlaybackSpeed = 0.5 | 1 | 1.5 | 2 | 3;

export const PLAYBACK_OPTIONS: { label: string; value: PlaybackSpeed }[] = [
    { label: '0.5×', value: 0.5 },
    { label: '1×',   value: 1 },
    { label: '1.5×', value: 1.5 },
    { label: '2×',   value: 2 },
    { label: '3×',   value: 3 },
];

const INITIAL_STATE: PathSimState = {
    phase: 'idle',
    activeTrackId: LEARNING_TRACKS[0].id,
    revealedNodes: 0,
    revealedEdges: 0,
    analyzeProgress: 0,
};

export function useLearningPathSimulation() {
    const [state, setState] = useState<PathSimState>({ ...INITIAL_STATE });
    const speedRef = useRef<PlaybackSpeed>(1);
    const [playbackSpeed, _setPlaybackSpeed] = useState<PlaybackSpeed>(1);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const ms = useCallback((base: number) => base / speedRef.current, []);

    const setPlaybackSpeed = useCallback((s: PlaybackSpeed) => {
        speedRef.current = s;
        _setPlaybackSpeed(s);
    }, []);

    const activeTrack = LEARNING_TRACKS.find(t => t.id === state.activeTrackId) ?? LEARNING_TRACKS[0];

    const cleanup = useCallback(() => {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
        if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    }, []);

    useEffect(() => () => cleanup(), [cleanup]);

    const setPhase = useCallback((phase: PathPhase) => {
        setState(s => ({ ...s, phase }));
    }, []);

    const selectTrack = useCallback((trackId: string) => {
        cleanup();
        setState({ ...INITIAL_STATE, activeTrackId: trackId });
    }, [cleanup]);

    const start = useCallback(() => {
        const track = LEARNING_TRACKS.find(t => t.id === state.activeTrackId) ?? LEARNING_TRACKS[0];
        cleanup();

        // Phase 1: Analyzing (skill assessment)
        setPhase('analyzing');
        setState(s => ({ ...s, analyzeProgress: 0, revealedNodes: 0, revealedEdges: 0 }));

        let progress = 0;
        intervalRef.current = setInterval(() => {
            progress += 2;
            setState(s => ({ ...s, analyzeProgress: Math.min(progress, 100) }));
            if (progress >= 100) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                intervalRef.current = null;

                // Phase 2: Building — reveal nodes one by one, then edges
                setPhase('building');
                let nodeIdx = 0;
                const totalNodes = track.nodes.length;
                const totalEdges = track.edges.length;

                const revealNextNode = () => {
                    nodeIdx++;
                    setState(s => ({ ...s, revealedNodes: nodeIdx }));
                    if (nodeIdx < totalNodes) {
                        timeoutRef.current = setTimeout(revealNextNode, ms(500));
                    } else {
                        // Now reveal edges
                        let edgeIdx = 0;
                        const revealNextEdge = () => {
                            edgeIdx++;
                            setState(s => ({ ...s, revealedEdges: edgeIdx }));
                            if (edgeIdx < totalEdges) {
                                timeoutRef.current = setTimeout(revealNextEdge, ms(200));
                            } else {
                                timeoutRef.current = setTimeout(() => {
                                    setPhase('complete');
                                }, ms(800));
                            }
                        };
                        timeoutRef.current = setTimeout(revealNextEdge, ms(400));
                    }
                };
                timeoutRef.current = setTimeout(revealNextNode, ms(400));
            }
        }, ms(40));
    }, [state.activeTrackId, cleanup, setPhase, ms]);

    const reset = useCallback(() => {
        cleanup();
        setState(s => ({ ...INITIAL_STATE, activeTrackId: s.activeTrackId }));
    }, [cleanup]);

    return {
        state,
        activeTrack,
        start,
        reset,
        selectTrack,
        playbackSpeed,
        setPlaybackSpeed,
    };
}
