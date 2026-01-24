import { useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

/**
 * Hook to create mouse-following parallax effects
 * @param strength - Parallax movement strength in pixels (default: 20)
 * @returns Object with x and y motion values for parallax effect
 */
export const useMouseParallax = (strength: number = 20) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 20 };
  const x = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-strength, strength]),
    springConfig
  );
  const y = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [-strength, strength]),
    springConfig
  );

  useEffect(() => {
    // Check if window is available (SSR compatibility)
    if (typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Normalize mouse position to -0.5 to 0.5 range
      mouseX.set(clientX / innerWidth - 0.5);
      mouseY.set(clientY / innerHeight - 0.5);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return { x, y };
};
