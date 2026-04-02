import { useState, useCallback, useRef, useEffect } from 'react';
import type { ReviewSimState, ReviewPhase } from './codeReviewTypes';
import { REVIEW_FILES } from './codeReviewData';

export type PlaybackSpeed = 0.5 | 1 | 1.5 | 2 | 3;

export const PLAYBACK_OPTIONS: { label: string; value: PlaybackSpeed }[] = [
    { label: '0.5×', value: 0.5 },
    { label: '1×',   value: 1 },
    { label: '1.5×', value: 1.5 },
    { label: '2×',   value: 2 },
    { label: '3×',   value: 3 },
];

const INITIAL_STATE: ReviewSimState = {
    phase: 'idle',
    activeFileId: REVIEW_FILES[0].id,
    revealedComments: 0,
    scanProgress: 0,
    elapsed: 0,
};

export function useCodeReviewSimulation() {
    const [state, setState] = useState<ReviewSimState>({ ...INITIAL_STATE });
    const speedRef = useRef<PlaybackSpeed>(1);
    const [playbackSpeed, _setPlaybackSpeed] = useState<PlaybackSpeed>(1);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const ms = useCallback((base: number) => base / speedRef.current, []);

    const setPlaybackSpeed = useCallback((s: PlaybackSpeed) => {
        speedRef.current = s;
        _setPlaybackSpeed(s);
    }, []);

    const activeFile = REVIEW_FILES.find(f => f.id === state.activeFileId) ?? REVIEW_FILES[0];

    const cleanup = useCallback(() => {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
        if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    }, []);

    useEffect(() => () => cleanup(), [cleanup]);

    const setPhase = useCallback((phase: ReviewPhase) => {
        setState(s => ({ ...s, phase }));
    }, []);

    const selectFile = useCallback((fileId: string) => {
        cleanup();
        setState({ ...INITIAL_STATE, activeFileId: fileId });
    }, [cleanup]);

    const start = useCallback(() => {
        const file = REVIEW_FILES.find(f => f.id === state.activeFileId) ?? REVIEW_FILES[0];
        cleanup();

        // Phase 1: Scanning (2s, with progress animation)
        setPhase('scanning');
        setState(s => ({ ...s, scanProgress: 0, revealedComments: 0 }));

        let progress = 0;
        intervalRef.current = setInterval(() => {
            progress += 2;
            setState(s => ({ ...s, scanProgress: Math.min(progress, 100) }));
            if (progress >= 100) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                intervalRef.current = null;

                // Phase 2: Reviewing — reveal comments one by one
                setPhase('reviewing');
                let commentIdx = 0;
                const totalComments = file.comments.length;

                const revealNext = () => {
                    commentIdx++;
                    setState(s => ({ ...s, revealedComments: commentIdx }));
                    if (commentIdx < totalComments) {
                        timeoutRef.current = setTimeout(revealNext, ms(800));
                    } else {
                        // Phase 3: Summary after a short pause
                        timeoutRef.current = setTimeout(() => {
                            setPhase('summary');
                        }, ms(1200));
                    }
                };
                timeoutRef.current = setTimeout(revealNext, ms(600));
            }
        }, ms(40));
    }, [state.activeFileId, cleanup, setPhase, ms]);

    const reset = useCallback(() => {
        cleanup();
        setState(s => ({ ...INITIAL_STATE, activeFileId: s.activeFileId }));
    }, [cleanup]);

    return {
        state,
        activeFile,
        start,
        reset,
        selectFile,
        playbackSpeed,
        setPlaybackSpeed,
    };
}
