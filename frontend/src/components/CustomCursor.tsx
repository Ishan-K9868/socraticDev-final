import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDeviceType } from '../hooks/useDeviceType';

export const CustomCursor = () => {
    const { isMobile } = useDeviceType();
    const [isHovering, setIsHovering] = useState(false);
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 700 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        // Don't show custom cursor on mobile/tablet
        if (isMobile) return;

        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX - 16);
            cursorY.set(e.clientY - 16);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('button') ||
                target.closest('a')
            ) {
                setIsHovering(true);
            }
        };

        const handleMouseOut = () => setIsHovering(false);

        window.addEventListener('mousemove', moveCursor);
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            document.removeEventListener('mouseover', handleMouseOver);
            document.removeEventListener('mouseout', handleMouseOut);
        };
    }, [cursorX, cursorY, isMobile]);

    // Don't render on mobile
    if (isMobile) return null;

    return (
        <>
            {/* Main cursor */}
            <motion.div
                className="custom-cursor"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    position: 'fixed',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(var(--color-primary-rgb), 0.5)',
                    pointerEvents: 'none',
                    zIndex: 9999,
                    mixBlendMode: 'difference',
                }}
                animate={{
                    scale: isHovering ? 2 : 1,
                    backgroundColor: isHovering
                        ? 'rgba(var(--color-accent-rgb), 0.5)'
                        : 'rgba(var(--color-primary-rgb), 0.5)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />

            {/* Cursor trail particles */}
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    style={{
                        x: cursorXSpring,
                        y: cursorYSpring,
                        position: 'fixed',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(var(--color-primary-rgb), 0.3)',
                        pointerEvents: 'none',
                        zIndex: 9998,
                    }}
                    animate={{
                        scale: [1, 0],
                        opacity: [0.5, 0],
                    }}
                    transition={{
                        duration: 0.6,
                        delay: i * 0.1,
                        repeat: Infinity,
                        ease: 'easeOut',
                    }}
                />
            ))}
        </>
    );
};

export default CustomCursor;
