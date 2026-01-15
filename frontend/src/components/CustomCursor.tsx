import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const dotRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [, setIsHovering] = useState(false);

    useEffect(() => {
        // Only show on desktop
        const mediaQuery = window.matchMedia('(min-width: 1024px) and (hover: hover)');
        setIsVisible(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => setIsVisible(e.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        if (!isVisible || !cursorRef.current || !dotRef.current) return;

        const cursor = cursorRef.current;
        const dot = dotRef.current;

        // Hide default cursor
        document.body.style.cursor = 'none';

        const handleMouseMove = (e: MouseEvent) => {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.5,
                ease: 'power2.out',
            });
            gsap.to(dot, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
            });
        };

        const handleMouseEnter = () => {
            gsap.to([cursor, dot], { opacity: 1, duration: 0.3 });
        };

        const handleMouseLeave = () => {
            gsap.to([cursor, dot], { opacity: 0, duration: 0.3 });
        };

        // Interactive element hover effects
        const interactiveElements = document.querySelectorAll('a, button, [data-cursor-hover]');

        const handleElementEnter = () => {
            setIsHovering(true);
            gsap.to(cursor, { scale: 2, duration: 0.3, ease: 'power2.out' });
        };

        const handleElementLeave = () => {
            setIsHovering(false);
            gsap.to(cursor, { scale: 1, duration: 0.3, ease: 'power2.out' });
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseenter', handleMouseEnter);
        document.addEventListener('mouseleave', handleMouseLeave);

        interactiveElements.forEach((el) => {
            el.addEventListener('mouseenter', handleElementEnter);
            el.addEventListener('mouseleave', handleElementLeave);
        });

        // Initial position off-screen
        gsap.set([cursor, dot], { x: -100, y: -100, opacity: 0 });

        return () => {
            document.body.style.cursor = 'auto';
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseenter', handleMouseEnter);
            document.removeEventListener('mouseleave', handleMouseLeave);

            interactiveElements.forEach((el) => {
                el.removeEventListener('mouseenter', handleElementEnter);
                el.removeEventListener('mouseleave', handleElementLeave);
            });
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <>
            <div
                ref={cursorRef}
                className="cursor-custom"
                style={{
                    opacity: 0,
                }}
            />
            <div
                ref={dotRef}
                className="cursor-dot"
                style={{
                    opacity: 0,
                }}
            />
        </>
    );
}

export default CustomCursor;
