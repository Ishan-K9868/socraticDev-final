import { Variants } from 'framer-motion';

/**
 * Shared animation variants for consistent animations across the app
 * All animations use GPU-accelerated properties (transform, opacity)
 * Optimized for smooth, non-janky animations
 */

// Fade and slide up - smoother version
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.1, 0.25, 1],
      type: "tween"
    }
  }
};

// Fade and slide from left - smoother
export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.1, 0.25, 1],
      type: "tween"
    }
  }
};

// Fade and slide from right - smoother
export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.1, 0.25, 1],
      type: "tween"
    }
  }
};

// Scale and fade - smoother
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { 
      duration: 0.5, 
      ease: [0.25, 0.1, 0.25, 1],
      type: "tween"
    }
  }
};

// 3D rotation reveal - smoother
export const rotateIn: Variants = {
  hidden: { opacity: 0, rotateY: -45 },
  visible: {
    opacity: 1,
    rotateY: 0,
    transition: { 
      duration: 0.7, 
      ease: [0.25, 0.1, 0.25, 1],
      type: "tween"
    }
  }
};

// Stagger container - optimized timing
export const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

// Stagger item - smoother
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
      type: "tween"
    }
  }
};

// Scale with rotation - smoother
export const scaleRotateIn: Variants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -90 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.1, 0.25, 1],
      type: "tween"
    }
  }
};

// Slide up with scale - smoother
export const slideUpScale: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.1, 0.25, 1],
      type: "tween"
    }
  }
};
