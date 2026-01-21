import { useEffect, useRef, useState, RefObject } from 'react';

interface UseScrollAnimationOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

/**
 * Custom hook for scroll-triggered animations using Intersection Observer
 * Replaces GSAP ScrollTrigger functionality with pure CSS animations
 */
export function useScrollAnimation<T extends HTMLElement>(
    options: UseScrollAnimationOptions = {}
): [RefObject<T>, boolean] {
    const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
    const ref = useRef<T>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (triggerOnce) {
                        observer.unobserve(element);
                    }
                } else if (!triggerOnce) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [threshold, rootMargin, triggerOnce]);

    return [ref, isVisible];
}

/**
 * Hook for multiple children with staggered animations
 */
export function useStaggeredAnimation(
    itemCount: number,
    baseDelay: number = 0.1,
    isVisible: boolean = true
): string[] {
    return Array.from({ length: itemCount }, (_, i) =>
        isVisible ? `animation-delay: ${baseDelay * i}s` : ''
    );
}

/**
 * CSS class generator for scroll-triggered animations
 */
export function getScrollAnimationClass(
    isVisible: boolean,
    animation: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'rotate' | 'flip' = 'fade-up'
): string {
    const baseClass = 'scroll-animate';
    const animationClass = `scroll-animate-${animation}`;
    const visibleClass = isVisible ? 'scroll-animate-visible' : '';

    return `${baseClass} ${animationClass} ${visibleClass}`.trim();
}
