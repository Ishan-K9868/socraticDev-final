# Design Document: SocraticDev Landing Page - Premium Animation System

## 1. Overview

This design document outlines the implementation strategy for transforming the SocraticDev landing page into a world-class, highly interactive experience using Framer Motion. The system will provide scroll-triggered animations, interactive effects, and micro-interactions across all landing page sections while maintaining excellent performance.

### 1.1 Design Goals

- **Engagement**: Create animations that are 100x more engaging than the current basic implementation
- **Performance**: Maintain 60fps on desktop, 30fps on mobile
- **Accessibility**: Respect `prefers-reduced-motion` settings
- **Vercel Compatibility**: Use only Framer Motion (no GSAP)
- **Bundle Size**: Keep animation code under 50KB gzipped

### 1.2 Technology Stack

- **Animation Library**: Framer Motion v12.26.2 (already installed)
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.1.0
- **Deployment**: Vercel

## 2. Architecture

### 2.1 Animation System Structure

```
frontend/src/
├── hooks/
│   ├── useScrollAnimation.ts (existing - enhance)
│   ├── useReducedMotion.ts (new)
│   ├── useMouseParallax.ts (new)
│   └── useInViewAnimation.ts (new)
├── components/
│   ├── Hero.tsx (existing - already has animations)
│   ├── ProblemSection.tsx (add animations)
│   ├── SolutionSection.tsx (add animations)
│   ├── FeatureSection.tsx (add animations)
│   ├── HowItWorksSection.tsx (add animations)
│   ├── TechStackSection.tsx (add animations)
│   ├── DojoSection.tsx (add animations)
│   ├── CTASection.tsx (add animations)
│   ├── Footer.tsx (add animations)
│   └── CustomCursor.tsx (new - desktop only)
└── utils/
    └── animationVariants.ts (new - shared variants)
```

### 2.2 Core Animation Patterns


#### Pattern 1: Scroll-Triggered Reveal
```typescript
// Using whileInView for scroll-triggered animations
<motion.div
  initial={{ opacity: 0, y: 60 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
>
  {content}
</motion.div>
```

#### Pattern 2: Stagger Children
```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};
```

#### Pattern 3: Hover Interactions
```typescript
<motion.div
  whileHover={{ scale: 1.05, y: -10 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
>
  {content}
</motion.div>
```

#### Pattern 4: Continuous Animations
```typescript
<motion.div
  animate={{
    y: [0, -20, 0],
    rotate: [0, 5, 0]
  }}
  transition={{
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }}
>
  {content}
</motion.div>
```


## 3. Custom Hooks Design

### 3.1 useReducedMotion Hook

**Purpose**: Detect user's motion preferences and provide appropriate animation settings.

```typescript
// frontend/src/hooks/useReducedMotion.ts
import { useEffect, useState } from 'react';

export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// Usage: Returns animation config based on user preference
export const getAnimationConfig = (prefersReducedMotion: boolean) => ({
  duration: prefersReducedMotion ? 0.2 : 0.8,
  distance: prefersReducedMotion ? 10 : 60,
  scale: prefersReducedMotion ? 1 : 0.9,
  rotation: prefersReducedMotion ? 0 : 360
});
```

### 3.2 useMouseParallax Hook

**Purpose**: Create mouse-following parallax effects for desktop.

```typescript
// frontend/src/hooks/useMouseParallax.ts
import { useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export const useMouseParallax = (strength: number = 20) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 20 };
  const x = useSpring(useTransform(mouseX, [-0.5, 0.5], [-strength, strength]), springConfig);
  const y = useSpring(useTransform(mouseY, [-0.5, 0.5], [-strength, strength]), springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set(clientX / innerWidth - 0.5);
      mouseY.set(clientY / innerHeight - 0.5);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return { x, y };
};
```

### 3.3 useInViewAnimation Hook

**Purpose**: Simplified hook for scroll-triggered animations with viewport detection.

```typescript
// frontend/src/hooks/useInViewAnimation.ts
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export const useInViewAnimation = (options = {}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.3,
    ...options
  });

  return { ref, isInView };
};
```


## 4. Shared Animation Variants

### 4.1 Common Variants Library

**Purpose**: Centralize reusable animation variants to maintain consistency.

```typescript
// frontend/src/utils/animationVariants.ts

// Fade and slide up
export const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
};

// Fade and slide from left
export const fadeInLeft = {
  hidden: { opacity: 0, x: -100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
};

// Fade and slide from right
export const fadeInRight = {
  hidden: { opacity: 0, x: 100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
};

// Scale and fade
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

// 3D rotation reveal
export const rotateIn = {
  hidden: { opacity: 0, rotateY: -90 },
  visible: {
    opacity: 1,
    rotateY: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
};

// Stagger container
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Stagger item
export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};
```


## 5. Section-by-Section Animation Design

### 5.1 Hero Section (Already Implemented)

**Status**: ✅ Complete - Already has Framer Motion animations

**Current Features**:
- Badge with pulsing glow
- Staggered text reveal
- Animated underline drawing
- Floating cards with hover effects
- Stats counter with spring physics
- Scroll indicator animation

**Enhancements to Add**:
- Mouse parallax on floating cards (desktop only)
- Character-by-character text split reveal
- SVG path drawing for dependency graph lines

### 5.2 Problem Section

**Animation Strategy**: Dramatic reveals emphasizing pain points

**Key Animations**:

1. **Section Header Reveal**
```typescript
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{ duration: 0.8 }}
>
  {/* Badge, title, description */}
</motion.div>
```

2. **Problem Cards Stagger**
```typescript
<motion.div
  variants={staggerContainer}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.2 }}
  className="grid md:grid-cols-2 gap-6"
>
  {problems.map((problem, index) => (
    <motion.div
      key={problem.title}
      variants={{
        hidden: { opacity: 0, y: 60, scale: 0.9 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.8, delay: index * 0.15 }
        }
      }}
    >
      {/* Card content */}
    </motion.div>
  ))}
</motion.div>
```

3. **Warning Icon Shake**
```typescript
<motion.div
  initial={{ rotate: 0 }}
  whileInView={{ rotate: [0, -5, 5, -5, 5, 0] }}
  viewport={{ once: true }}
  transition={{ duration: 0.6, delay: 0.3 }}
>
  {problem.icon}
</motion.div>
```

4. **Stat Counter Animation**
```typescript
import { useMotionValue, useSpring, useTransform, animate } from 'framer-motion';

const count = useMotionValue(0);
const rounded = useTransform(count, Math.round);

useEffect(() => {
  if (isInView) {
    const controls = animate(count, targetValue, { duration: 1.5 });
    return controls.stop;
  }
}, [isInView]);
```

5. **Hover 3D Tilt**
```typescript
<motion.div
  whileHover={{
    scale: 1.05,
    rotateX: 5,
    rotateY: 5,
    transition: { type: "spring", stiffness: 300 }
  }}
  style={{ transformStyle: "preserve-3d" }}
>
  {/* Card */}
</motion.div>
```


### 5.3 Solution Section

**Animation Strategy**: Feature showcase with alternating slide directions

**Key Animations**:

1. **Feature Pills Alternating Slide**
```typescript
{features.map((feature, index) => (
  <motion.div
    key={feature.id}
    initial={{
      opacity: 0,
      x: index % 2 === 0 ? -100 : 100
    }}
    whileInView={{
      opacity: 1,
      x: 0
    }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{
      duration: 0.8,
      delay: index * 0.1,
      ease: [0.22, 1, 0.36, 1]
    }}
  >
    {/* Feature pill */}
  </motion.div>
))}
```

2. **Code Demo Typing Effect**
```typescript
const [displayedCode, setDisplayedCode] = useState('');
const fullCode = '# Your solution...';

useEffect(() => {
  if (!isInView) return;
  
  let index = 0;
  const interval = setInterval(() => {
    if (index < fullCode.length) {
      setDisplayedCode(fullCode.slice(0, index + 1));
      index++;
    } else {
      clearInterval(interval);
    }
  }, 50);
  
  return () => clearInterval(interval);
}, [isInView]);
```

3. **Mode Toggle Animation**
```typescript
<motion.div
  animate={{ x: isLearningMode ? 0 : 20 }}
  transition={{ type: "spring", stiffness: 500, damping: 30 }}
  className="toggle-thumb"
/>
```

4. **Product Mockup Scale In**
```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.9, y: 40 }}
  whileInView={{ opacity: 1, scale: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
>
  {/* Product mockup */}
</motion.div>
```

### 5.4 Features Section

**Animation Strategy**: 3D card grid with rotation reveals

**Key Animations**:

1. **Grid Reveal with 3D Rotation**
```typescript
<motion.div
  className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
  variants={staggerContainer}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.2 }}
>
  {features.map((feature, index) => (
    <motion.div
      key={feature.title}
      variants={{
        hidden: {
          opacity: 0,
          rotateY: -90,
          scale: 0.8
        },
        visible: {
          opacity: 1,
          rotateY: 0,
          scale: 1,
          transition: {
            duration: 0.8,
            delay: index * 0.05,
            ease: [0.22, 1, 0.36, 1]
          }
        }
      }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Feature card */}
    </motion.div>
  ))}
</motion.div>
```

2. **Icon Bounce Entrance**
```typescript
<motion.div
  initial={{ scale: 0, rotate: 0 }}
  whileInView={{
    scale: 1,
    rotate: 360
  }}
  viewport={{ once: true }}
  transition={{
    type: "spring",
    stiffness: 200,
    damping: 15,
    delay: 0.2
  }}
>
  {feature.icon}
</motion.div>
```

3. **Hover 3D Tilt with Mouse Position**
```typescript
const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  
  setRotateX(y * 15);
  setRotateY(x * -15);
};

<motion.div
  onMouseMove={handleMouseMove}
  onMouseLeave={() => { setRotateX(0); setRotateY(0); }}
  animate={{ rotateX, rotateY }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
  style={{ transformStyle: "preserve-3d", perspective: 1000 }}
>
  {/* Card */}
</motion.div>
```


### 5.5 How It Works Section

**Animation Strategy**: Animated timeline with sequential reveals

**Key Animations**:

1. **Timeline Path Drawing**
```typescript
<motion.svg viewBox="0 0 100 400">
  <motion.path
    d="M50 0 L50 400"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    initial={{ pathLength: 0 }}
    whileInView={{ pathLength: 1 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 2, ease: "easeInOut" }}
  />
</motion.svg>
```

2. **Step Counter Sequential Pop**
```typescript
{steps.map((step, index) => (
  <motion.div
    key={step.number}
    initial={{ scale: 0, opacity: 0 }}
    whileInView={{ scale: 1, opacity: 1 }}
    viewport={{ once: true }}
    transition={{
      type: "spring",
      stiffness: 200,
      damping: 15,
      delay: index * 0.3
    }}
    className="step-number"
  >
    {step.number}
  </motion.div>
))}
```

3. **Arrow Animation**
```typescript
<motion.svg
  initial={{ opacity: 0, x: -20 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true }}
  transition={{ delay: 0.2, duration: 0.6 }}
  animate={{ y: [0, 5, 0] }}
  transition={{ duration: 1.5, repeat: Infinity }}
>
  {/* Arrow icon */}
</motion.svg>
```

4. **Icon Rotation Reveal**
```typescript
<motion.div
  initial={{ opacity: 0, rotate: 0, scale: 0.8 }}
  whileInView={{ opacity: 1, rotate: 360, scale: 1 }}
  viewport={{ once: true }}
  transition={{
    duration: 0.8,
    delay: 0.15,
    ease: [0.22, 1, 0.36, 1]
  }}
>
  {step.icon}
</motion.div>
```

### 5.6 Tech Stack Section

**Animation Strategy**: Layer-by-layer build up with badge scatter

**Key Animations**:

1. **Layer Stack Animation**
```typescript
{layers.map((layer, index) => (
  <motion.div
    key={layer.name}
    initial={{ opacity: 0, y: 100 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{
      duration: 0.8,
      delay: index * 0.2,
      ease: [0.22, 1, 0.36, 1]
    }}
  >
    {/* Layer content */}
  </motion.div>
))}
```

2. **Tech Badge Scatter**
```typescript
{techBadges.map((tech, index) => {
  const angle = (index / techBadges.length) * 360;
  const distance = 200;
  const startX = Math.cos(angle * Math.PI / 180) * distance;
  const startY = Math.sin(angle * Math.PI / 180) * distance;
  
  return (
    <motion.div
      key={tech.name}
      initial={{ opacity: 0, x: startX, y: startY, scale: 0 }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: index * 0.05
      }}
    >
      {/* Tech badge */}
    </motion.div>
  );
})}
```

3. **Circuit Line Pulse**
```typescript
<motion.svg>
  <defs>
    <linearGradient id="pulse" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="transparent" />
      <stop offset="50%" stopColor="currentColor" />
      <stop offset="100%" stopColor="transparent" />
    </linearGradient>
  </defs>
  <motion.line
    x1="0" y1="50" x2="200" y2="50"
    stroke="url(#pulse)"
    strokeWidth="2"
    animate={{ x1: [-200, 400], x2: [0, 600] }}
    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
  />
</motion.svg>
```


### 5.7 Dojo Section

**Animation Strategy**: Interactive challenge cards with flip animations

**Key Animations**:

1. **Card 3D Flip**
```typescript
const [isFlipped, setIsFlipped] = useState(false);

<motion.div
  onClick={() => setIsFlipped(!isFlipped)}
  animate={{ rotateY: isFlipped ? 180 : 0 }}
  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
  style={{ transformStyle: "preserve-3d" }}
>
  <div style={{ backfaceVisibility: "hidden" }}>
    {/* Front content */}
  </div>
  <div style={{
    backfaceVisibility: "hidden",
    transform: "rotateY(180deg)",
    position: "absolute",
    inset: 0
  }}>
    {/* Back content */}
  </div>
</motion.div>
```

2. **Progress Ring Animation**
```typescript
<motion.svg viewBox="0 0 100 100">
  <motion.circle
    cx="50"
    cy="50"
    r="45"
    stroke="currentColor"
    strokeWidth="8"
    fill="none"
    initial={{ pathLength: 0 }}
    whileInView={{ pathLength: progress / 100 }}
    viewport={{ once: true }}
    transition={{ duration: 1.5, ease: "easeOut" }}
    style={{
      pathLength: 0,
      rotate: -90,
      transformOrigin: "center"
    }}
  />
</motion.svg>
```

3. **Belt Slide Animation**
```typescript
<motion.div
  initial={{ opacity: 0, x: -100 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
>
  {/* Belt content */}
  <motion.div
    variants={staggerContainer}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
  >
    {beltItems.map((item, index) => (
      <motion.div
        key={item.id}
        variants={staggerItem}
        transition={{ delay: 0.8 + index * 0.1 }}
      >
        {item.content}
      </motion.div>
    ))}
  </motion.div>
</motion.div>
```

4. **Active Card Glow**
```typescript
<motion.div
  animate={{
    boxShadow: [
      "0 0 20px rgba(var(--primary-rgb), 0.3)",
      "0 0 40px rgba(var(--primary-rgb), 0.6)",
      "0 0 20px rgba(var(--primary-rgb), 0.3)"
    ],
    scale: [1, 1.02, 1]
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }}
>
  {/* Active challenge card */}
</motion.div>
```

### 5.8 CTA Section

**Animation Strategy**: Attention-grabbing effects with urgency

**Key Animations**:

1. **Button Pulse Animation**
```typescript
<motion.button
  animate={{
    scale: [1, 1.05, 1],
    boxShadow: [
      "0 0 0 0 rgba(var(--primary-rgb), 0.7)",
      "0 0 0 20px rgba(var(--primary-rgb), 0)",
      "0 0 0 0 rgba(var(--primary-rgb), 0)"
    ]
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }}
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
>
  Start Learning
</motion.button>
```

2. **Star Burst Effect**
```typescript
{[...Array(8)].map((_, index) => {
  const angle = (index / 8) * 360;
  const distance = 100;
  const endX = Math.cos(angle * Math.PI / 180) * distance;
  const endY = Math.sin(angle * Math.PI / 180) * distance;
  
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: 0, y: 0, scale: 0, rotate: 0 }}
      whileInView={{
        opacity: [0, 1, 0],
        x: endX,
        y: endY,
        scale: [0, 1, 0.5],
        rotate: 360
      }}
      viewport={{ once: true }}
      transition={{
        duration: 1,
        delay: index * 0.05,
        ease: "easeOut"
      }}
      className="star"
    />
  );
})}
```

3. **Rocket Launch Animation**
```typescript
<motion.div
  animate={{
    y: [0, -30, 0],
    rotate: [0, -5, 5, 0]
  }}
  transition={{
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }}
>
  {/* Rocket icon */}
</motion.div>
```

4. **Shimmer Cross-Button**
```typescript
<motion.div
  className="button-shimmer"
  animate={{
    x: ["-100%", "200%"]
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    repeatDelay: 3,
    ease: "easeInOut"
  }}
  style={{
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
    position: "absolute",
    inset: 0
  }}
/>
```


### 5.9 Footer Section

**Animation Strategy**: Polished exit with smooth reveals

**Key Animations**:

1. **Link Column Stagger**
```typescript
<motion.div
  variants={staggerContainer}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.3 }}
  className="grid grid-cols-4 gap-8"
>
  {linkColumns.map((column, index) => (
    <motion.div
      key={column.title}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            delay: index * 0.15
          }
        }
      }}
    >
      {/* Column content */}
    </motion.div>
  ))}
</motion.div>
```

2. **Social Icon Bounce**
```typescript
{socialIcons.map((icon, index) => (
  <motion.a
    key={icon.name}
    href={icon.url}
    initial={{ opacity: 0, scale: 0 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{
      type: "spring",
      stiffness: 300,
      damping: 15,
      delay: index * 0.1
    }}
    whileHover={{ scale: 1.2, rotate: 5 }}
    whileTap={{ scale: 0.9 }}
  >
    {icon.component}
  </motion.a>
))}
```

3. **Newsletter Input Glow**
```typescript
<motion.div
  initial={{ boxShadow: "0 0 0 0 rgba(var(--accent-rgb), 0)" }}
  whileInView={{
    boxShadow: [
      "0 0 0 0 rgba(var(--accent-rgb), 0)",
      "0 0 20px 5px rgba(var(--accent-rgb), 0.5)",
      "0 0 0 0 rgba(var(--accent-rgb), 0)",
      "0 0 20px 5px rgba(var(--accent-rgb), 0.5)",
      "0 0 0 0 rgba(var(--accent-rgb), 0)"
    ]
  }}
  viewport={{ once: true }}
  transition={{ duration: 1.2, times: [0, 0.25, 0.5, 0.75, 1] }}
>
  <input type="email" placeholder="Enter your email" />
</motion.div>
```

4. **Logo Subtle Pulse**
```typescript
<motion.div
  animate={{
    scale: [1, 1.02, 1]
  }}
  transition={{
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut"
  }}
>
  {/* Logo */}
</motion.div>
```


## 6. Advanced Features

### 6.1 Custom Cursor (Desktop Only)

**Purpose**: Create an interactive custom cursor that enhances user engagement.

```typescript
// frontend/src/components/CustomCursor.tsx
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';

export const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A') {
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
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="custom-cursor"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        position: 'fixed',
        width: 32,
        height: 32,
        borderRadius: '50%',
        backgroundColor: 'rgba(var(--primary-rgb), 0.5)',
        pointerEvents: 'none',
        zIndex: 9999,
        mixBlendMode: 'difference'
      }}
      animate={{
        scale: isHovering ? 2 : 1,
        backgroundColor: isHovering
          ? 'rgba(var(--accent-rgb), 0.5)'
          : 'rgba(var(--primary-rgb), 0.5)'
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    />
  );
};
```

### 6.2 Scroll Progress Indicator

**Purpose**: Show user's progress through the landing page.

```typescript
// Add to LandingPage.tsx
import { motion, useScroll, useSpring } from 'framer-motion';

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      style={{
        scaleX,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: 'var(--color-primary)',
        transformOrigin: '0%',
        zIndex: 1000
      }}
    />
  );
};
```

### 6.3 Section Indicators

**Purpose**: Show which section is currently in view.

```typescript
const SectionIndicators = () => {
  const [activeSection, setActiveSection] = useState(0);
  const sections = ['hero', 'problem', 'solution', 'features', 'dojo', 'how-it-works', 'tech-stack', 'cta'];

  useEffect(() => {
    const observers = sections.map((section, index) => {
      const element = document.getElementById(section);
      if (!element) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(index);
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(element);
      return observer;
    });

    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, []);

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 space-y-3">
      {sections.map((section, index) => (
        <motion.button
          key={section}
          onClick={() => {
            document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
          }}
          animate={{
            scale: activeSection === index ? 1.5 : 1,
            backgroundColor: activeSection === index
              ? 'var(--color-primary)'
              : 'var(--color-border)'
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-3 h-3 rounded-full block"
          aria-label={`Go to ${section} section`}
        />
      ))}
    </div>
  );
};
```


## 7. Performance Optimization

### 7.1 GPU Acceleration

**Strategy**: Use only transform and opacity properties for animations.

```typescript
// ✅ GOOD - GPU Accelerated
<motion.div
  animate={{
    x: 100,           // transform: translateX(100px)
    y: 50,            // transform: translateY(50px)
    scale: 1.2,       // transform: scale(1.2)
    rotate: 45,       // transform: rotate(45deg)
    opacity: 0.5      // opacity: 0.5
  }}
/>

// ❌ BAD - Triggers Layout Reflow
<motion.div
  animate={{
    width: 500,       // ❌ Causes reflow
    height: 300,      // ❌ Causes reflow
    top: 100,         // ❌ Causes reflow
    left: 50          // ❌ Causes reflow
  }}
/>
```

### 7.2 Mobile Optimization

**Strategy**: Reduce animation complexity on mobile devices.

```typescript
// frontend/src/hooks/useDeviceType.ts
import { useEffect, useState } from 'react';

export const useDeviceType = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { isMobile };
};

// Usage in components
const { isMobile } = useDeviceType();

<motion.div
  initial={{ opacity: 0, y: isMobile ? 30 : 60 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: isMobile ? 0.5 : 0.8 }}
>
  {content}
</motion.div>
```

### 7.3 Lazy Animation Loading

**Strategy**: Only initialize animations when sections are near viewport.

```typescript
const { ref, isInView } = useInViewAnimation({ margin: "200px" });

return (
  <div ref={ref}>
    {isInView && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Animated content */}
      </motion.div>
    )}
  </div>
);
```

### 7.4 Animation Cleanup

**Strategy**: Properly cleanup animations on unmount.

```typescript
useEffect(() => {
  const controls = animate(count, targetValue, { duration: 1.5 });
  
  return () => {
    controls.stop();
  };
}, [isInView]);
```


## 8. Accessibility

### 8.1 Reduced Motion Support

**Implementation**: Respect user's motion preferences throughout the app.

```typescript
// In each component
const prefersReducedMotion = useReducedMotion();
const animationConfig = getAnimationConfig(prefersReducedMotion);

<motion.div
  initial={{ opacity: 0, y: animationConfig.distance }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: animationConfig.duration }}
>
  {content}
</motion.div>
```

### 8.2 Focus Management

**Implementation**: Ensure animations don't interfere with keyboard navigation.

```typescript
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  whileFocus={{ outline: "2px solid var(--color-primary)" }}
>
  Click me
</motion.button>
```

### 8.3 ARIA Labels

**Implementation**: Add appropriate ARIA labels for animated elements.

```typescript
<motion.div
  role="region"
  aria-label="Animated feature showcase"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>
  {content}
</motion.div>
```

## 9. Vercel Deployment Compatibility

### 9.1 Bundle Size Optimization

**Strategy**: Tree-shake Framer Motion imports.

```typescript
// ✅ GOOD - Import only what you need
import { motion, useScroll, useSpring, useInView } from 'framer-motion';

// ❌ BAD - Imports everything
import * as FramerMotion from 'framer-motion';
```

### 9.2 SSR Compatibility

**Strategy**: Ensure animations work with server-side rendering.

```typescript
// Check for window before using browser APIs
useEffect(() => {
  if (typeof window === 'undefined') return;
  
  const handleMouseMove = (e: MouseEvent) => {
    // Mouse tracking logic
  };
  
  window.addEventListener('mousemove', handleMouseMove);
  return () => window.removeEventListener('mousemove', handleMouseMove);
}, []);
```

### 9.3 Build Configuration

**Vite Config**: Ensure proper chunking for animations.

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'framer-motion': ['framer-motion']
        }
      }
    }
  }
});
```


## 10. Testing Strategy

### 10.1 Visual Testing

**Approach**: Test animations across different viewports and devices.

- Desktop (1920x1080, 1440x900)
- Tablet (768x1024)
- Mobile (375x667, 414x896)

### 10.2 Performance Testing

**Metrics to Monitor**:
- FPS during scroll (target: 60fps desktop, 30fps mobile)
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Cumulative Layout Shift (CLS)

**Tools**:
- Chrome DevTools Performance tab
- Lighthouse
- WebPageTest

### 10.3 Accessibility Testing

**Checklist**:
- [ ] Test with `prefers-reduced-motion: reduce`
- [ ] Keyboard navigation works with animations
- [ ] Screen reader compatibility
- [ ] Focus indicators visible during animations

### 10.4 Browser Compatibility

**Target Browsers**:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## 11. Implementation Phases

### Phase 1: Foundation (Tasks 1-3)
- Create custom hooks (useReducedMotion, useMouseParallax, useInViewAnimation)
- Create shared animation variants library
- Set up performance monitoring

### Phase 2: Core Sections (Tasks 4-7)
- Implement Problem Section animations
- Implement Solution Section animations
- Implement Features Section animations
- Implement How It Works Section animations

### Phase 3: Advanced Sections (Tasks 8-10)
- Implement Tech Stack Section animations
- Implement Dojo Section animations
- Implement CTA Section animations

### Phase 4: Polish (Tasks 11-13)
- Implement Footer Section animations
- Add Custom Cursor (desktop only)
- Add Scroll Progress Indicator
- Add Section Indicators

### Phase 5: Hero Enhancements (Task 14)
- Add mouse parallax to Hero floating cards
- Add character-by-character text reveal
- Add SVG path drawing for dependency graph

### Phase 6: Optimization & Testing (Tasks 15-16)
- Mobile optimization
- Performance testing and optimization
- Accessibility testing
- Cross-browser testing


## 12. Animation Timing Reference

### 12.1 Duration Guidelines

| Animation Type | Duration | Use Case |
|---------------|----------|----------|
| Micro-interaction | 0.15-0.25s | Button hover, icon changes |
| Fade/Reveal | 0.6-0.8s | Section entrances, card reveals |
| Scale | 0.5-0.7s | Cards, icons, modals |
| Slide | 0.7-1.0s | Panels, drawers, large elements |
| Counter | 1.5-2.0s | Number animations, progress bars |
| Ambient | 3-8s | Background effects, subtle pulses |

### 12.2 Easing Functions

```typescript
// Framer Motion Easing Presets
const easings = {
  // Smooth entrance
  easeOut: [0.22, 1, 0.36, 1],
  
  // Smooth exit
  easeIn: [0.4, 0, 1, 1],
  
  // Smooth both ways
  easeInOut: [0.4, 0, 0.2, 1],
  
  // Bouncy
  spring: { type: "spring", stiffness: 300, damping: 20 },
  
  // Very bouncy
  elasticSpring: { type: "spring", stiffness: 200, damping: 15 },
  
  // Smooth spring
  smoothSpring: { type: "spring", stiffness: 100, damping: 30 }
};
```

### 12.3 Stagger Delays

| Element Count | Stagger Delay | Total Duration |
|--------------|---------------|----------------|
| 2-4 items | 0.15s | 0.3-0.6s |
| 5-8 items | 0.1s | 0.5-0.8s |
| 9-12 items | 0.05s | 0.45-0.6s |
| 13+ items | 0.03s | 0.4-0.5s |

## 13. Code Organization

### 13.1 File Structure

```
frontend/src/
├── hooks/
│   ├── useReducedMotion.ts
│   ├── useMouseParallax.ts
│   ├── useInViewAnimation.ts
│   ├── useDeviceType.ts
│   └── useScrollAnimation.ts (existing)
├── utils/
│   └── animationVariants.ts
└── components/
    ├── CustomCursor.tsx
    ├── ScrollProgress.tsx
    ├── SectionIndicators.tsx
    └── [existing components with animations added]
```

### 13.2 Import Conventions

```typescript
// Standard imports for animated components
import { motion, useInView, useAnimation } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { fadeInUp, staggerContainer } from '../utils/animationVariants';
```

## 14. Success Criteria

### 14.1 Performance Metrics

- ✅ 60fps on desktop during scroll
- ✅ 30fps on mobile during scroll
- ✅ No jank or stuttering
- ✅ Bundle size < 50KB gzipped for animations
- ✅ Time to Interactive < 3s

### 14.2 User Experience Metrics

- ✅ Animations feel smooth and natural
- ✅ No overwhelming or distracting effects
- ✅ Enhances content, doesn't distract from it
- ✅ Works seamlessly across all sections
- ✅ Respects user preferences (reduced motion)

### 14.3 Technical Metrics

- ✅ No console errors or warnings
- ✅ Works on all target browsers
- ✅ Deploys successfully to Vercel
- ✅ No hydration errors with SSR
- ✅ Proper cleanup on unmount

## 15. Future Enhancements

### 15.1 Potential Additions (Post-MVP)

- Interactive particle systems
- WebGL-powered 3D effects
- Advanced scroll-linked animations
- Gesture-based interactions (swipe, pinch)
- Sound effects for interactions
- Dark mode transition animations

### 15.2 A/B Testing Opportunities

- Animation duration variations
- Different easing functions
- Stagger delay adjustments
- Hover effect intensity
- Scroll trigger thresholds

