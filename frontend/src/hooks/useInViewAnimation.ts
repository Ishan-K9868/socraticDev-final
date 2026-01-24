import { useInView } from 'framer-motion';
import { useRef } from 'react';

interface UseInViewAnimationOptions {
  once?: boolean;
  amount?: number | 'some' | 'all';
  margin?: string;
}

/**
 * Simplified hook for scroll-triggered animations with viewport detection
 * @param options - Configuration options for intersection observer
 * @returns Object with ref to attach to element and isInView boolean
 */
export const useInViewAnimation = (options: UseInViewAnimationOptions = {}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.3,
    ...options,
  });

  return { ref, isInView };
};
