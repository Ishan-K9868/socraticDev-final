import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useDeviceType } from '../hooks/useDeviceType';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useStore } from '../store/useStore';
import { generateId } from '../utils/generateId';

type CursorMode = 'default' | 'interactive' | 'text' | 'drag' | 'busy' | 'hidden';

interface Pulse {
    id: string;
    x: number;
    y: number;
    color: string;
}

const DOT_SIZE = 8;
const RING_SIZE = 34;
const CROSSHAIR_SIZE = 24;
const INTERACTIVE_SELECTOR = 'button, a, [role="button"], summary, [data-cursor="interactive"]';
const TEXT_SELECTOR = 'input, textarea, [contenteditable="true"], [data-cursor="text"], .monaco-editor textarea, .monaco-editor .inputarea';
const DRAG_SELECTOR = '[data-cursor="drag"], [draggable="true"], [data-rfd-draggable-id], .react-flow__node, .react-flow__pane';

const MODES_WITH_LABEL: Record<CursorMode, string> = {
    default: '',
    interactive: 'OPEN',
    text: 'TYPE',
    drag: 'DRAG',
    busy: 'WAIT',
    hidden: '',
};

function resolveCursorMode(target: HTMLElement | null, isBusy: boolean): CursorMode {
    if (!target) return isBusy ? 'busy' : 'default';

    if (target.closest('[data-cursor="hidden"]')) return 'hidden';
    if (target.closest(TEXT_SELECTOR)) return 'text';
    if (target.closest(DRAG_SELECTOR)) return 'drag';
    if (target.closest(INTERACTIVE_SELECTOR)) return 'interactive';

    return isBusy ? 'busy' : 'default';
}

function resolveCursorLabel(target: HTMLElement | null, mode: CursorMode): string {
    const customLabel = target?.closest('[data-cursor-label]')?.getAttribute('data-cursor-label');
    if (customLabel) {
        return customLabel.toUpperCase();
    }
    return MODES_WITH_LABEL[mode];
}

function getCursorPalette(mode: CursorMode, style: 'showcase' | 'minimal') {
    const showcase = style === 'showcase';

    const base = {
        dotColor: 'rgba(255, 255, 255, 0.96)',
        ringColor: 'rgba(255, 255, 255, 0.9)',
        ringBg: 'rgba(255, 255, 255, 0.06)',
        dotScale: 1,
        ringScale: 1,
        showCrosshair: showcase,
        showLabel: showcase,
    };

    switch (mode) {
        case 'interactive':
            return {
                ...base,
                ringBg: 'rgba(255, 255, 255, 0.14)',
                dotScale: 1.2,
                ringScale: 1.25,
            };
        case 'text':
            return {
                ...base,
                ringBg: 'rgba(255, 255, 255, 0.01)',
                dotScale: 0.9,
                ringScale: 0.82,
                showCrosshair: false,
                showLabel: false,
            };
        case 'drag':
            return {
                ...base,
                ringBg: 'rgba(255, 255, 255, 0.22)',
                dotScale: 1.1,
                ringScale: 1.35,
            };
        case 'busy':
            return {
                ...base,
                ringBg: 'rgba(255, 255, 255, 0.18)',
                dotScale: 1.05,
                ringScale: 1.12,
            };
        case 'hidden':
            return {
                ...base,
                dotScale: 0.2,
                ringScale: 0.2,
                showCrosshair: false,
                showLabel: false,
            };
        case 'default':
        default:
            return base;
    }
}

export const CustomCursor = () => {
    const { isMobile, isTablet } = useDeviceType();
    const prefersReducedMotion = useReducedMotion();
    const { cursorEnabled, cursorStyle, isLoading } = useStore((state) => ({
        cursorEnabled: state.cursorEnabled,
        cursorStyle: state.cursorStyle,
        isLoading: state.isLoading,
    }));

    const [isCoarsePointer, setIsCoarsePointer] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [mode, setMode] = useState<CursorMode>('default');
    const [label, setLabel] = useState('');
    const [pulses, setPulses] = useState<Pulse[]>([]);

    const dotX = useMotionValue(-100);
    const dotY = useMotionValue(-100);
    const ringX = useMotionValue(-100);
    const ringY = useMotionValue(-100);
    const crosshairX = useMotionValue(-100);
    const crosshairY = useMotionValue(-100);
    const labelX = useMotionValue(-100);
    const labelY = useMotionValue(-100);

    const dotXSpring = useSpring(dotX, { stiffness: 1300, damping: 68, mass: 0.28 });
    const dotYSpring = useSpring(dotY, { stiffness: 1300, damping: 68, mass: 0.28 });
    const ringXSpring = useSpring(ringX, { stiffness: 460, damping: 36, mass: 0.6 });
    const ringYSpring = useSpring(ringY, { stiffness: 460, damping: 36, mass: 0.6 });
    const crosshairXSpring = useSpring(crosshairX, { stiffness: 560, damping: 44, mass: 0.5 });
    const crosshairYSpring = useSpring(crosshairY, { stiffness: 560, damping: 44, mass: 0.5 });
    const labelXSpring = useSpring(labelX, { stiffness: 320, damping: 35 });
    const labelYSpring = useSpring(labelY, { stiffness: 320, damping: 35 });

    const palette = useMemo(() => getCursorPalette(mode, cursorStyle), [mode, cursorStyle]);
    const isCursorActive = cursorEnabled && !isMobile && !isTablet && !prefersReducedMotion && !isCoarsePointer;

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const pointerQuery = window.matchMedia('(pointer: coarse)');
        const updatePointerType = () => setIsCoarsePointer(pointerQuery.matches);
        updatePointerType();

        if (pointerQuery.addEventListener) {
            pointerQuery.addEventListener('change', updatePointerType);
            return () => pointerQuery.removeEventListener('change', updatePointerType);
        }

        pointerQuery.addListener(updatePointerType);
        return () => pointerQuery.removeListener(updatePointerType);
    }, []);

    useEffect(() => {
        if (!isCursorActive) {
            setIsVisible(false);
            return;
        }

        const updatePositions = (x: number, y: number) => {
            dotX.set(x - (DOT_SIZE / 2));
            dotY.set(y - (DOT_SIZE / 2));
            ringX.set(x - (RING_SIZE / 2));
            ringY.set(y - (RING_SIZE / 2));
            crosshairX.set(x - (CROSSHAIR_SIZE / 2));
            crosshairY.set(y - (CROSSHAIR_SIZE / 2));
            labelX.set(x + 18);
            labelY.set(y - 28);
        };

        const syncModeFromTarget = (target: EventTarget | null) => {
            const element = target instanceof HTMLElement ? target : null;
            const nextMode = resolveCursorMode(element, isLoading);
            setMode(nextMode);
            setLabel(resolveCursorLabel(element, nextMode));
        };

        const onPointerMove = (event: PointerEvent) => {
            updatePositions(event.clientX, event.clientY);
            setIsVisible((prev) => (prev ? prev : true));
        };

        const onPointerOver = (event: PointerEvent) => {
            syncModeFromTarget(event.target);
        };

        const onPointerOut = (event: PointerEvent) => {
            if (event.relatedTarget) {
                syncModeFromTarget(event.relatedTarget);
                return;
            }
            setMode(isLoading ? 'busy' : 'default');
            setLabel(MODES_WITH_LABEL[isLoading ? 'busy' : 'default']);
        };

        const onPointerDown = (event: PointerEvent) => {
            const targetElement = event.target instanceof HTMLElement ? event.target : null;
            const activeMode = resolveCursorMode(targetElement, isLoading);
            const pulseColor = getCursorPalette(activeMode, cursorStyle).ringColor;
            const pulseId = generateId();

            setPulses((current) => [
                ...current,
                { id: pulseId, x: event.clientX, y: event.clientY, color: pulseColor },
            ]);

            window.setTimeout(() => {
                setPulses((current) => current.filter((pulse) => pulse.id !== pulseId));
            }, 440);
        };

        const onWindowBlur = () => {
            setIsVisible(false);
        };

        window.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerover', onPointerOver);
        document.addEventListener('pointerout', onPointerOut);
        document.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('blur', onWindowBlur);

        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerover', onPointerOver);
            document.removeEventListener('pointerout', onPointerOut);
            document.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('blur', onWindowBlur);
        };
    }, [
        crosshairX,
        crosshairY,
        cursorStyle,
        dotX,
        dotY,
        isCursorActive,
        isLoading,
        labelX,
        labelY,
        ringX,
        ringY,
    ]);

    useEffect(() => {
        if (!isCursorActive) return;
        if (mode === 'busy' && !isLoading) {
            setMode('default');
            setLabel('');
        }
        if (mode === 'default' && isLoading) {
            setMode('busy');
            setLabel(MODES_WITH_LABEL.busy);
        }
    }, [isCursorActive, isLoading, mode]);

    if (!isCursorActive) return null;

    const isHidden = mode === 'hidden';
    const visibleOpacity = isVisible && !isHidden ? 1 : 0;

    return (
        <>
            <motion.div
                aria-hidden="true"
                className="cursor-tech-dot"
                style={{ x: dotXSpring, y: dotYSpring }}
                animate={{
                    opacity: visibleOpacity,
                    scale: palette.dotScale,
                    backgroundColor: palette.dotColor,
                    boxShadow: `0 0 20px ${palette.dotColor}`,
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            />

            <motion.div
                aria-hidden="true"
                className="cursor-tech-ring"
                style={{ x: ringXSpring, y: ringYSpring }}
                animate={{
                    opacity: visibleOpacity,
                    scale: palette.ringScale,
                    borderColor: palette.ringColor,
                    backgroundColor: palette.ringBg,
                    boxShadow: `0 0 0 1px ${palette.ringColor}, 0 0 26px ${palette.ringBg}`,
                }}
                transition={{ type: 'spring', stiffness: 280, damping: 32 }}
            />

            <motion.div
                aria-hidden="true"
                className="cursor-tech-crosshair"
                style={{ x: crosshairXSpring, y: crosshairYSpring, color: palette.ringColor }}
                animate={{
                    opacity: visibleOpacity * (palette.showCrosshair ? 0.88 : 0),
                    scale: palette.ringScale,
                }}
                transition={{ duration: 0.15 }}
            >
                <span className="cursor-tech-crosshair-line cursor-tech-crosshair-top" />
                <span className="cursor-tech-crosshair-line cursor-tech-crosshair-right" />
                <span className="cursor-tech-crosshair-line cursor-tech-crosshair-bottom" />
                <span className="cursor-tech-crosshair-line cursor-tech-crosshair-left" />
            </motion.div>

            <motion.div
                aria-hidden="true"
                className="cursor-tech-label"
                style={{ x: labelXSpring, y: labelYSpring }}
                animate={{
                    opacity: visibleOpacity * (palette.showLabel && label ? 1 : 0),
                    scale: palette.showLabel && label ? 1 : 0.92,
                }}
                transition={{ duration: 0.14 }}
            >
                {label}
            </motion.div>

            <AnimatePresence>
                {pulses.map((pulse) => (
                    <motion.span
                        key={pulse.id}
                        aria-hidden="true"
                        className="cursor-tech-pulse"
                        style={{
                            left: pulse.x,
                            top: pulse.y,
                            borderColor: pulse.color,
                            boxShadow: `0 0 26px ${pulse.color}`,
                        }}
                        initial={{ opacity: 0.65, scale: 0.25 }}
                        animate={{ opacity: 0, scale: cursorStyle === 'showcase' ? 2.2 : 1.6 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.42, ease: 'easeOut' }}
                    />
                ))}
            </AnimatePresence>
        </>
    );
};

export default CustomCursor;
