import { useEffect, useState } from 'react';

/**
 * Hook to detect user's motion preferences
 * Returns true if user prefers reduced motion
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (SSR compatibility)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Fallback for older browsers
    else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
};

/**
 * Get animation configuration based on user's motion preference
 */
export const getAnimationConfig = (prefersReducedMotion: boolean) => ({
  duration: prefersReducedMotion ? 0.2 : 0.8,
  distance: prefersReducedMotion ? 10 : 60,
  scale: prefersReducedMotion ? 1 : 0.9,
  rotation: prefersReducedMotion ? 0 : 360,
  staggerDelay: prefersReducedMotion ? 0 : 0.1,
});
