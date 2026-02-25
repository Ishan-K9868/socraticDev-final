---
description: Build premium, animated landing pages with warm editorial aesthetics, scroll choreography, and Framer Motion — inspired by a modern SaaS design system.
---

# Premium Landing Page Design Skill

This skill teaches you how to build landing pages that feel cohesive, premium, and alive. It extracts reusable design patterns, visual language, motion systems, and scroll choreography as transferable principles — completely decoupled from any specific product or content.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Framer Motion, Lenis (smooth scroll).

---

## 1. Landing Page Structure & Section Flow

### 1.1 The Persuasion Arc

A landing page is a narrative. Every section has a *job* in the persuasion sequence. Follow this archetype order:

| # | Archetype | Narrative Role | Visual Weight |
|---|-----------|---------------|---------------|
| 1 | **Hero** | Hook — bold claim + proof-of-concept cards | Full-bleed, max visual density, floating decorative elements |
| 2 | **Problem Agitation** | Pain — show the status quo is broken | Alternating bg (`bg-secondary`), stat cards in grid, heavy on data |
| 3 | **Solution Reveal** | Relief — introduce the product as the answer | Full-bleed, centered mockup with floating feature pills |
| 4 | **Interactive Proof** | Credibility — let users *experience* the product | Contained card with typewriter demo or interactive widget |
| 5 | **Before/After Comparison** | Contrast — old way vs. new way side-by-side | Two-column grid, visual diff treatment |
| 6 | **Feature Grid** | Depth — expand on capabilities | 3- or 4-column card grid with 3D tilt on hover |
| 7 | **How It Works** | Clarity — numbered step sequence | Alternating left/right cards with connector lines |
| 8 | **Interactive Showcase** | Engagement — category carousel or demo picker | Auto-rotating showcase with progress dots |
| 9 | **Architecture/Stack** | Authority — show technical sophistication | Timeline-rail layout with dot connectors |
| 10 | **Final CTA** | Urgency — one big centered action card | Glowing card with shimmer button, trust badges |
| 11 | **Footer** | Navigation — links, newsletter, social proof | Multi-column grid, darker background |

### 1.2 Section Pacing Rules

- **Breathing sections** (Hero, CTA): `py-16 sm:py-24 lg:py-32` — lots of vertical whitespace
- **Dense sections** (Feature Grid, Comparison): `py-16 sm:py-24 lg:py-32` same padding but more content
- **Alternate bg colors** between sections: `--color-bg-primary` ↔ `--color-bg-secondary` — this creates visual rhythm without explicit dividers
- Every section gets `overflow-hidden` and `relative` to contain its floating elements and blobs

### 1.3 Section Transitions — Mapped to the Arc

Each section boundary uses a specific transition strategy. The choice is not arbitrary — it matches the emotional shift between sections.

| Boundary | From → To | Strategy | Why |
|----------|-----------|----------|-----|
| Hero → Problem | Bright → dark bg | **Gradient hairline** (`via-border`) | Subtle — the bg color shift does the heavy lifting |
| Problem → Solution | Dark bg → bright bg | **Gradient hairline** (`via-accent-500/30`) | Clean cut; accent color signals "relief" |
| Solution → Interactive Proof | Same bg tone | **Gradient hairline** (`via-border`) | Minimal — sections are content-paired |
| Interactive Proof → Comparison | `bg-secondary` → `bg-primary` | **Gradient hairline** (`via-border`) | Subtle bg swap |
| Comparison → Feature Grid | Same bg tone | **Gradient hairline** (`via-primary-500/30`) | Warm accent signals transition to depth content |
| Feature Grid → How It Works | `bg-secondary` → `bg-primary` | **Gradient hairline** (`via-border`) | Clean handoff |
| How It Works → Interactive Showcase | `bg-primary` → `bg-secondary` | **Angular polygon** | Sharp editorial cut — signals a new zone |
| Interactive Showcase → Architecture | `bg-secondary` → `bg-primary` | **Wave SVG** | Organic — dissolves tension before the authority section |
| Architecture → CTA | `bg-primary` → gradient | **Gradient hairline** (`via-primary-500/50`) | Intense accent — urgency builds |
| CTA → Footer | gradient → `bg-secondary` | **Border-top** (`border-t border-border`) | Quiet, structural — no decoration needed |

**Transition code templates:**

Gradient hairline (most common — used at 6 of 10 boundaries):
```html
<div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
```
Change `via-primary-500/30` to `via-[color:var(--color-border)]` for neutral, or `via-accent-500/30` for accent.

Wave SVG (organic — used once between Interactive Showcase → Architecture):
```html
<div class="absolute bottom-0 left-0 right-0 overflow-hidden">
  <svg class="relative block w-full h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
    <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120H0Z"
      class="fill-[color:var(--color-bg-primary)]" />
  </svg>
</div>
```
The `fill` must match the **next** section's background color.

Angular polygon (editorial — used once between How It Works → Interactive Showcase):
```html
<svg class="relative block w-full h-12" viewBox="0 0 1200 120" preserveAspectRatio="none">
  <polygon points="0,0 1200,120 0,120" class="fill-[color:var(--color-bg-secondary)]" />
</svg>
```

---

## 2. Scroll Choreography & Background Storytelling

### 2.1 Smooth Scrolling Setup (Lenis)

```typescript
import Lenis from 'lenis';

const lenis = new Lenis({
  autoRaf: true,
  lerp: 0.1,              // Interpolation smoothness (0.05 = butter, 0.15 = snappy)
  smoothWheel: true,
  wheelMultiplier: 0.9,    // Slightly dampened wheel speed
  touchMultiplier: 1.5,    // Touch needs more travel
  syncTouch: true,
  orientation: 'vertical',
  gestureOrientation: 'vertical',
});
```

> [!CAUTION]
> **Critical gotcha:** CSS `scroll-behavior: smooth` FIGHTS Lenis. The browser and Lenis both try to interpolate scroll position, creating double-smoothing jitter. Always set:
> ```css
> html { scroll-behavior: auto; }
> ```
> Also override at runtime as a safety net:
> ```typescript
> document.documentElement.style.scrollBehavior = 'auto';
> ```

### 2.2 Scroll Progress Bar

A thin, fixed bar at the top that scales with scroll depth:

```tsx
import { motion, useScroll, useSpring } from 'framer-motion';

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 z-50 origin-left"
      style={{ scaleX }}
    />
  );
}
```

### 2.3 Section Navigation Indicators

Fixed side dots that track which section is in view:

- Use `IntersectionObserver` to detect the active section based on scroll position
- Each indicator is a `motion.button` with a colored icon per section
- The active indicator shows a small vertical bar on the left side
- Use `transition-colors` (NOT `transition-all`) on `motion` elements — Tailwind's `transition-all` conflicts with Framer Motion transforms
- **Never use `layoutId`** for indicators that change on scroll — it triggers expensive layout projection on every re-render. Use `initial/animate` with opacity instead:

```tsx
{isActive && (
  <motion.div
    className="absolute -left-3 w-1 h-6 bg-primary-500 rounded-full"
    style={{ top: '50%', y: '-50%' }}  // Let Motion handle centering
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.2 }}
  />
)}
```

### 2.4 Scroll-Triggered Reveal System

Every section uses `useInView` from Framer Motion. The standard configuration:

```tsx
const ref = useRef(null);
const inView = useInView(ref, {
  once: true,               // Fire once, never re-trigger (prevents jank on scroll-back)
  amount: 0.1,              // 10% of element visible triggers
  margin: "0px 0px -150px 0px"  // Trigger 150px before element enters viewport
});
```

The standard entrance pattern:
```tsx
<motion.div
  ref={ref}
  initial={{ opacity: 0, y: 30 }}
  animate={inView ? { opacity: 1, y: 0 } : {}}
  transition={{
    duration: 0.5,
    type: "tween",
    ease: [0.25, 0.1, 0.25, 1]  // Custom cubic-bezier, slightly accelerating
  }}
>
```

### 2.5 The Background Story Arc

The background isn't static — it tells a visual story as the user scrolls:

1. **Hero** (0-15% scroll): Maximum visual density. Radial gradient orb behind content (`bg-gradient-radial from-primary-500/15`), grid-pattern overlay, 5-6 floating SVG shapes animating on `float` keyframe, multiple pulsing gradient blobs
2. **Problem→Solution** (15-40%): Simpler backgrounds. 2-3 gradient blobs each, per-section floating elements themed to the section's purpose (lightbulbs for solution, warning signs for problem)
3. **Interactive sections** (40-70%): Minimal decorative elements — focused on the interactive content. Background shifts between `bg-primary` and `bg-secondary`
4. **Tech/Authority** (70-85%): Grid-pattern background with radial mask (`mask-image: radial-gradient(circle at center, black 35%, transparent 90%)`) for a spotlight effect
5. **CTA** (85-95%): Maximum glow — large 800px pulsing radial gradient centered, convergent arrows pointing to center, sparkle pings
6. **Footer** (95-100%): Quiet. Subtle blobs at 5% opacity, code-bracket SVG decorations

---

## 3. Component Design Patterns

### 3.1 Navbar

```
Structure: fixed top-0 → container → flex justify-between
  Left: logo (SVG + brand name)
  Center: nav links (hidden lg:flex)
  Right: theme toggle + mode badge (hidden md:flex) + CTA button (hidden sm:block) + hamburger (lg:hidden)
```

- Use `glass-strong` (glassmorphism) for the navbar background
- Add `will-change: transform` on the navbar for GPU layer promotion (prevents scroll repaints)
- `backdrop-filter: blur(12px) saturate(180%)` — keep blur ≤12px for scroll performance
- `z-index: 40` (below scroll progress bar at z-50)
- Height: `h-16 lg:h-20`

**On-load entrance animation:**
The entire `<nav>` gets `animate-fade-in-down` — a CSS keyframe, not Framer Motion:
```css
@keyframes fade-in-down {
  0%   { opacity: 0; transform: translateY(-25px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-down {
  animation: fade-in-down 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```
The easing `cubic-bezier(0.16, 1, 0.3, 1)` is `ease-out-expo` — fast start, gentle settle.

**Hamburger menu:**
- Button: `lg:hidden p-2 rounded-lg hover:bg-muted`
- Icon: SVG that swaps between two `<path>` elements based on `isOpen` state:
  - Closed (3-bar): `M4 6h16M4 12h16M4 18h16`
  - Open (X): `M6 18L18 6M6 6l12 12`
- The swap is instant (no morph animation) — the icon simply switches

**Mobile menu dropdown:**
- Conditionally rendered (`{isOpen && ...}`) — no mount animation library needed
- Container: `py-4 border-t border-border`, gets `animate-fade-in` class:
```css
@keyframes fade-in {
  0%   { opacity: 0; }
  100% { opacity: 1; }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}
```
- Links: `flex flex-col gap-2`, each link is `px-4 py-2 rounded-lg text-sm hover:bg-muted`
- Full-width CTA button at the bottom: `w-full mt-2 mx-4`
- Clicking any link calls `setMobileMenuOpen(false)` to auto-close

### 3.2 Hero Section

```
Desktop (lg+):  min-h-screen → grid lg:grid-cols-2
  Left col: badge → h1 (gradient text) → subtitle → CTA buttons → stat counters
  Right col: relative container → 3 floating product cards at absolute positions

Mobile (<lg):   single column, stacked
  Text content: centered (text-center lg:text-left)
  Floating cards: HIDDEN (hidden lg:block) — they overlap badly at narrow widths
  Stat counters: still grid-cols-3 but with reduced padding
```

- Stat counters: 3 items in a `grid-cols-3`, each with a spring `scale` entrance
- Floating cards: staggered entrance with `custom` delay prop (0, 0.2, 0.4s)
- Each card gets `whileHover={{ scale: 1.05, rotate: ±2 }}`
- Scroll indicator at bottom: a pill-shaped div with a bouncing dot inside
- **Responsive headline:** `text-display-xl` uses `clamp(3.5rem, 8vw, 7rem)` — no breakpoint classes needed
- **CTA buttons:** `flex-col sm:flex-row` — stack vertically on mobile, side-by-side on sm+

### 3.3 Card Component

Three variants:

| Variant | Background | Border | Hover |
|---------|-----------|--------|-------|
| `default` | `bg-secondary` | `border-border` | border lightens, shadow elevates |
| `glass` | `glass` class | via glass border | bg slightly more opaque |
| `terminal` | `bg-secondary` | `border-border` | none (static) |

- **CRITICAL:** Cards use `transition-none gsap-element` as base class — this prevents Tailwind transitions from conflicting with Framer Motion
- Subcomponents: `.Header`, `.TerminalHeader` (red/yellow/green dots + title), `.Content`, `.Footer`
- Default padding: `p-6`, rounded: `rounded-2xl`
- Terminal header dots: three `w-3 h-3 rounded-full` divs in red/yellow/green

### 3.4 Button Component

| Variant | Style |
|---------|-------|
| `primary` | `bg-primary-500 text-white` + glow shadow `0 4px 14px rgba(primary, 0.3)` |
| `secondary` | `border-2 border-current` + hover fills bg |
| `ghost` | text only, hover shows bg-muted |
| `danger` | `bg-error text-white` |

Sizes: `sm` (px-4 py-2 text-sm), `md` (px-6 py-3), `lg` (px-8 py-4 text-lg)

- Buttons use `transition-none gsap-element` — let Framer Motion handle hover/tap
- Wrap in `motion.div` with `whileHover={{ scale: 1.05 }}` and `whileTap={{ scale: 0.95 }}`
- Loading state: swap content for animated spinner SVG

### 3.5 Badge Component

```tsx
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium
  bg-primary-500/10 text-primary-600 dark:text-primary-400">
```

Seven variants: default, primary, secondary, accent, success, warning, error.
Pattern: `bg-{color}-500/10 text-{color}-600 dark:text-{color}-400`

### 3.6 Feature Grid Cards (with 3D tilt)

```tsx
// Use useMotionValue (NOT useState) for 60fps mouse tracking
const rotateX = useMotionValue(0);
const rotateY = useMotionValue(0);

const handleMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  rotateX.set(y * 10);   // ±5° range
  rotateY.set(x * -10);
};

<motion.div
  style={{ transformStyle: "preserve-3d", perspective: 1000, rotateX, rotateY }}
  onMouseMove={handleMouseMove}
  onMouseLeave={() => { rotateX.set(0); rotateY.set(0); }}
  whileHover={{ y: -8, transition: { type: "spring", stiffness: 200, damping: 25 } }}
>
```

> [!WARNING]
> Never use `useState` for mouse-position-driven animations — it causes 60 React re-renders per second. Always use `useMotionValue` which bypasses React's render cycle.

### 3.7 How It Works (Stepped Process)

```
Desktop (md+):
  Numbered cards alternating left/right
  Odd steps: icon-left, content-right (flex-row)
  Even steps: content-left, icon-right (flex-row-reverse)
  Connector: vertical gradient line centered at icon column

Mobile (<md):
  Single column, all stacked vertically (flex-col)
  Icon above content, no alternation
  Connector line: hidden (hidden md:block)
  Entrance: y-only (no x offset — alternating slide looks jarring on narrow screens)
```

- Connector line: `w-0.5 h-16 bg-gradient-to-b from-border to-transparent`, animated with `scaleY` from 0→1 with `originY: 0`
- Step icons: `w-20 h-20 rounded-2xl` with color-matched bg/text (e.g., `bg-primary-500/10 text-primary-500`)
- Number overlays: `text-3xl font-display font-bold opacity-30`
- Entrance: alternating `x: -40` (odd) / `x: 40` (even) with stagger delay on desktop; `x: 0, y: 20` on mobile

### 3.8 Timeline Rail (Tech Stack)

```
Desktop (md+):
  Center vertical line → alternating cards left/right of the line
  Each card: dot on center line → horizontal bridge line → card body
  Left-aligned cards: md:mr-auto md:pr-9, dot at -right-2.5
  Right-aligned cards: md:ml-auto md:pl-9, dot at -left-2.5
  Top cap: rotating dashed circle at center

Mobile (<md):
  Rail shifts to LEFT edge (left-0)
  All cards stack below, full width (pl-9)
  Dots: left-0 top-10 (smaller, 3.5×3.5)
  Bridge lines: hidden
  Rotating cap: hidden
  Cards: width-auto, no alternation
```

- Center rail: `absolute left-1/2 w-px bg-gradient-to-b from-primary-500/40 via-secondary-500/40 to-accent-500/35` (desktop); `absolute left-1 w-px` (mobile)
- Dots: `w-5 h-5 rounded-full border-2 border-bg` + color + glow shadow (`shadow-[0_0_0_8px_rgba(r,g,b,0.22)]`)

### 3.8a Interactive Showcase (Auto-Rotating Carousel)

This is the pattern for Section 8 in the arc — a showcase that auto-cycles through items (challenge types, plan tiers, testimonials, etc.) with progress indicators.

```
Structure:
  Featured card: large card showing the active item (icon + tagline + title + description + CTA)
  Progress dots: row of clickable dots below the featured card
  Thumbnail grid: smaller grid of all items (user can click to jump)
```

**Auto-rotate logic:**
```tsx
const [activeIndex, setActiveIndex] = useState(0);
const ITEMS = [...]; // Array of showcase items
const ROTATION_INTERVAL = 3000; // 3 seconds per item

useEffect(() => {
  const interval = setInterval(() => {
    setActiveIndex(prev => (prev + 1) % ITEMS.length);
  }, ROTATION_INTERVAL);
  return () => clearInterval(interval);
}, []);
```

**Progress dots:**
```tsx
<div className="flex items-center justify-center gap-2 mt-6">
  {ITEMS.map((_, idx) => (
    <button
      key={idx}
      onClick={() => setActiveIndex(idx)}
      className={`h-2 rounded-full transition-all duration-300 ${
        idx === activeIndex
          ? 'w-8 bg-primary-500'   // Active: wider pill
          : 'w-2 bg-border hover:bg-border-hover'  // Inactive: small circle
      }`}
      aria-label={`Go to item ${idx + 1}`}
    />
  ))}
</div>
```

Key details:
- Active dot expands from `w-2` to `w-8` with `transition-all duration-300` — this is a deliberate CSS-only transition, not Framer Motion
- The featured card gets a color-matched border and glow that changes with each item (each item in the data array carries its own `bgColor`, `borderColor`, and `color` classes)
- Featured card border uses `transition-all duration-500` for the color shift on item change
- Icon wrapper: `w-20 h-20 rounded-2xl` with `hover:scale-110 transition-transform`
- **No Framer Motion `AnimatePresence`** needed — content swaps via index lookup (`ITEMS[activeIndex].title`), so only the text changes, not the DOM structure
- Clicking a thumbnail grid item also calls `setActiveIndex(idx)` — the interval keeps running from wherever the user left off
- Thumbnail grid: `grid grid-cols-2 md:grid-cols-5 gap-4`, each item is a `button` with `hover:-translate-y-1 hover:shadow-lg transition-all duration-300`
- Bridge: `h-[2px] w-9` connecting dot to card — `hidden` below md
- Cards: `rounded-3xl border p-5 sm:p-6 backdrop-blur-sm` with tone-mapped colors
- Tech chips: staggered fade-in with `delay: 0.14 + index * 0.05`

### 3.9 CTA Section

```
Structure: centered card with glow backdrop
  Glow: absolute div behind card with blur-2xl gradient
  Card: rounded-3xl, gradient bg, corner decorations
  Content: urgency badge + headline + subtitle + button pair + trust badges
```

- Primary button gets a **shimmer effect**: a gradient div that translates from `-translate-x-full` to `translate-x-full` on hover via `transition-transform duration-700`
- Trust badges: row of checkmark + text items (e.g., "No credit card required")
- Corner decorations: `absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-500/10` and mirrored bottom-left

### 3.10 Footer

```
Structure: 6-column grid
  Col 1-2: brand logo + description + social icons
  Col 3-6: link groups (Product, Resources, Company, Legal)
```

- Social icons: `motion.a` with spring entrance (`stiffness: 300, damping: 15, delay: 0.2 + i * 0.08`)
- `whileHover={{ scale: 1.2, rotate: 5 }}` + `whileTap={{ scale: 0.9 }}`
- Newsletter bar: full-width `rounded-2xl` with gradient bg, input + subscribe button
- Status indicator: `w-2 h-2 rounded-full bg-success animate-pulse` + "All systems operational"

### 3.11 Responsive Behavior Reference

Breakpoints follow Tailwind defaults: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px).

#### Hero
| Element | Mobile (<lg) | Desktop (lg+) |
|---------|-------------|---------------|
| Layout | single column, `text-center` | `grid lg:grid-cols-2`, text left-aligned |
| Headline | `text-display-xl` via clamp (scales down automatically) | same class, clamp scales up |
| CTA buttons | `flex-col gap-3` (stacked) | `flex-row gap-4` (side-by-side) |
| Floating product cards | `hidden` | `lg:block`, absolutely positioned |
| Stat counters | `grid-cols-3` with `gap-4`, smaller padding | same grid, larger padding |
| Background grid pattern | full opacity | same |
| Scroll indicator | `hidden sm:flex` | visible |

#### Card Grids (Feature, Problem, Comparison)
| Grid | Mobile | Tablet (md) | Desktop (lg+) |
|------|--------|-------------|----------------|
| Feature | `grid-cols-1` | `grid-cols-2` | `md:grid-cols-2 lg:grid-cols-3` |
| Problem stats | `grid-cols-1` | `grid-cols-2` | `md:grid-cols-2 lg:grid-cols-4` |
| Comparison | stacked (single col) | `grid-cols-2` side-by-side | same as md |
| Challenge grid | `grid-cols-2` | `grid-cols-5` | same as md |
| Benefits | `grid-cols-1` | `md:grid-cols-2` | `lg:grid-cols-4` |
| Footer links | `grid-cols-2` | `md:grid-cols-3` | `lg:grid-cols-6` |

3D tilt on feature cards: **disabled below lg** — touch devices can't hover, so `onMouseMove` tilt should be wrapped in a `useDeviceType()` check or guarded with `@media (hover: hover)`.

#### Timeline Rail (How It Works / Tech Stack)
| Element | Mobile (<md) | Desktop (md+) |
|---------|-------------|---------------|
| Vertical rail | Pinned to `left-0` | Pinned to `left-1/2 -translate-x-1/2` (center) |
| Cards | Full width, all left-aligned, `pl-9` | 50% width, alternating left/right |
| Dots | `left-0`, `h-3.5 w-3.5` | At rail center, `h-5 w-5`, glow shadow |
| Bridge lines | Hidden | Visible, `w-9` |
| Step alternation | None — all stack vertically | Odd: `md:mr-auto`, Even: `md:ml-auto` |
| Entrance direction | `y: 20` only (no x) | Alternating `x: -48` / `x: 48` |
| Rotating cap | Hidden | Visible at center-top |

#### Floating Decorative Elements
| Breakpoint | Behavior |
|------------|----------|
| Mobile (<sm) | Reduce blob count to 1 per section. Hide SVG shapes entirely (`hidden sm:block`). Gradient blobs shrink to `w-[200px] h-[200px]` |
| Tablet (sm–lg) | Show 2–3 blobs, show 2–3 SVG shapes. Full blob sizes |
| Desktop (lg+) | Full decoration set (3+ blobs, 4–6 SVG shapes, rings, arcs) |

Floating shapes positioned with percentage values (`left-[10%]`) adapt naturally, but their **sizes** should shrink on mobile:
```html
<svg class="absolute top-[20%] left-[8%] w-8 sm:w-10 lg:w-16 ..." />
```

#### Navbar
| Element | Mobile (<md) | Desktop (md+) |
|---------|-------------|---------------|
| Nav links | Hidden, revealed via hamburger menu button | `hidden md:flex` — inline row |
| Mobile menu | Full-width dropdown, stacked links, `animate-fade-in-down` | Not rendered |
| Logo | Shrinks slightly (`w-8 h-8`) | `w-10 h-10` |
| CTA button | Hidden or smaller variant | Full `md` size |
| Glass background | Same treatment at all sizes | Same |

#### Section Indicators
| Breakpoint | Behavior |
|------------|----------|
| Mobile (<md) | `hidden` — side dots are distracting on narrow viewports |
| Desktop (md+) | `fixed right-6 top-1/2 -translate-y-1/2` — visible pill with icons |

#### Custom Cursor
| Breakpoint | Behavior |
|------------|----------|
| Touch/mobile | Not rendered — detect via `useDeviceType()` or `@media (pointer: coarse)` |
| Desktop mouse | Rendered with `mix-blend-mode: difference` |

#### CTA Section
| Element | Mobile (<sm) | Desktop |
|---------|-------------|----------|
| Card padding | `p-6` | `p-8 lg:p-12` |
| Buttons | `flex-col` (stacked) | `sm:flex-row` (side-by-side) |
| Trust badges | `flex-wrap`, may wrap to 2 rows | single row |
| Glow backdrop | Reduced to `blur-xl` | `blur-2xl` |

#### General Responsive Rules
1. **Typography auto-scales** via `clamp()` — no breakpoint font-size classes needed for headings
2. **Section padding compresses** from `py-32` (lg) → `py-24` (sm) → `py-16` (mobile)
3. **Container horizontal padding** widens: `px-4` → `sm:px-6` → `lg:px-8`
4. **Max-width constraints** (`max-w-3xl`, `max-w-4xl`, `max-w-5xl`) are set per-section on desktop and collapse naturally below their max-width breakpoint
5. **Hover effects are desktop-only** — wrap `whileHover` in `useDeviceType()` or use `@media (hover: hover)` guards

---

## 4. Visual Design System

### 4.1 Color Palette Architecture

Use a **warm, earthy** palette — the opposite of generic "AI blue" or neon gradients.

**Primary — Terracotta** (CTAs, primary actions, main gradients):
```
50:  #fef7f4    100: #fceee7    200: #f9d5c6    300: #f4b49a    400: #ec8b64
500: #E07A5F    600: #d15a3c    700: #ae4730    800: #8f3c2c    900: #763628
```

**Secondary — Deep Ocean** (supporting elements, code panels, depth):
```
50:  #f0fdfa    100: #ccfbf1    200: #99f6e4    300: #5eead4    400: #2dd4bf
500: #3D5A80    600: #2c4a6e    700: #1e3a5c    800: #1a2f4a    900: #14253d
```

**Accent — Sage Green** (success states, learning indicators, badges):
```
50:  #f6f7f4    100: #e8ebe2    200: #d4dac8    300: #b7c2a4    400: #98a87e
500: #81936A    600: #667752    700: #515e42    800: #434c38    900: #3a4131
```

**Neutral — Warm Grays** (stone family — backgrounds, text, borders):
```
50:  #FAFAF9    100: #F5F5F4    200: #E7E5E4    300: #D6D3D1    400: #A8A29E
500: #78716C    600: #57534E    700: #44403C    800: #292524    900: #1C1917
950: #0F0E0D
```

**System colors:** success `#4ADE80`, warning `#FBBF24`, error `#EF4444`, info `#60A5FA`

**Usage mapping:**
- `*-500` = anchor/default state
- `*-600` through `*-900` = hover states, pressed states, dark-mode text
- `*-50` through `*-200` = backgrounds, subtle tints (or use `*-500/10` for transparency-based tinting)
- `*-300` through `*-400` = borders, muted decorative elements

### 4.2 Light/Dark Mode Strategy

**CSS custom properties** toggled via `.dark` class on `<html>`:

```css
:root {
  --color-bg-primary: theme('colors.neutral.50');      /* Light: warm off-white */
  --color-bg-secondary: theme('colors.white');
  --color-text-primary: theme('colors.neutral.900');
  --color-border: theme('colors.neutral.200');
  --glass-bg: rgba(255, 255, 255, 0.7);
  --noise-opacity: 0.03;
}
.dark {
  --color-bg-primary: theme('colors.neutral.950');     /* Dark: near-black warm */
  --color-bg-secondary: theme('colors.neutral.900');
  --color-text-primary: theme('colors.neutral.50');
  --color-border: theme('colors.neutral.700');
  --glass-bg: rgba(15, 14, 13, 0.8);
  --noise-opacity: 0.04;
}
```

Reference in code as: `bg-[color:var(--color-bg-primary)]`, `text-[color:var(--color-text-secondary)]`, etc.

Tailwind config: `darkMode: 'class'` — toggled by adding/removing `.dark` on the `<html>` element.

**Toggle implementation:**

The theme toggle is a `w-10 h-10 rounded-full` button with two stacked SVG icons (sun and moon) that crossfade:

```tsx
// Both icons are absolutely positioned inside the button.
// The ACTIVE icon: opacity-100 rotate-0 scale-100
// The HIDDEN icon: opacity-0 rotate-90 scale-0 (sun) or -rotate-90 scale-0 (moon)
// Transition: transition-all duration-300

<button onClick={toggleTheme} className="relative w-10 h-10 rounded-full bg-muted hover:bg-elevated">
  <svg className={`absolute transition-all duration-300 ${
    theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-0'
  }`}>/* sun paths */</svg>
  <svg className={`absolute transition-all duration-300 ${
    theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
  }`}>/* moon paths */</svg>
</button>
```

The crossfade uses three simultaneous CSS transitions: `opacity` (0↔1), `rotate` (±90°↔0°), and `scale` (0↔1) — all at 300ms. This creates a spinning-out / spinning-in effect.

**Persistence to localStorage:**

The theme state lives in a Zustand store. To persist across page reloads, wrap the store with Zustand's `persist` middleware:

```tsx
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((state) => {
        const next = state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', next === 'dark');
        return { theme: next };
      }),
    }),
    { name: 'theme-storage' }  // localStorage key
  )
);
```

On app mount, read the persisted value and apply `.dark` to `<html>` before first paint to avoid flash-of-wrong-theme:
```tsx
useEffect(() => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}, [theme]);
```

**Swap transition:** CSS variables change instantly (no interpolation needed). The 300ms icon crossfade on the toggle button is the only visible transition. Background colors, text colors, and borders all swap atomically via the custom property change — this is intentional. Animating every surface color on theme swap would be expensive and distracting.

### 4.3 Typography

| Role | Font | Class |
|------|------|-------|
| Display | Clash Display | `font-display` |
| Body | Space Grotesk | `font-body` |
| Monospace | JetBrains Mono | `font-mono` |

**Type scale** (responsive via `clamp`):
```
display-xl: clamp(3.5rem, 8vw, 7rem)  — line-height: 1.05, letter-spacing: -0.02em
display-lg: clamp(2.5rem, 6vw, 5rem)  — line-height: 1.1
display-md: clamp(2rem, 4vw, 3.5rem)  — line-height: 1.15
display-sm: clamp(1.5rem, 3vw, 2.5rem) — line-height: 1.2
```

**Gradient text technique:**
```css
.text-gradient-primary {
  background: linear-gradient(to right, primary-500, secondary-500, accent-500);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### 4.4 Signature Visual Effects

**Glassmorphism:**
```css
.glass-strong {
  background: rgba(255, 255, 255, 0.7);      /* dark: rgba(15, 14, 13, 0.8) */
  backdrop-filter: blur(12px) saturate(180%);  /* keep blur ≤12px for scroll perf */
  border: 1px solid rgba(255, 255, 255, 0.2);
  will-change: transform;                      /* GPU promote if fixed during scroll */
}
```

**Noise/grain texture overlay:**
```css
.noise-overlay {
  position: fixed; inset: 0;
  pointer-events: none; z-index: 9999;
  opacity: 0.03;  /* dark: 0.04 */
  background-image: url("data:image/svg+xml,...feTurbulence baseFrequency='0.7' numOctaves='4'...");
}
```

**Gradient orbs (ambient blobs):**
```html
<div class="absolute -top-40 -right-40 w-[500px] h-[500px]
  bg-gradient-to-br from-primary-500/30 via-primary-400/20 to-transparent
  rounded-full blur-3xl animate-pulse-slow" />
```
- Sizes: 250–800px. Opacity: 5–30% (stronger in hero/CTA, weaker elsewhere)
- Position at corners, offset by -40px to bleed outside container
- `blur-3xl` (48px) minimum
- Animate with `animate-pulse-slow` (8s ease-in-out infinite, scale 1→1.05→1)

**Grid pattern:**
```css
.grid-pattern {
  background-size: 50px 50px;
  background-image:
    linear-gradient(to right, rgba(120, 113, 108, 0.25) 1.5px, transparent 1.5px),
    linear-gradient(to bottom, rgba(120, 113, 108, 0.25) 1.5px, transparent 1.5px);
}
```
For spotlight effect, add: `mask-image: radial-gradient(circle at center, black 35%, transparent 90%)`

**Glow shadows:**
```
glow-primary: 0 0 40px -10px rgba(224, 122, 95, 0.4)
glow-secondary: 0 0 40px -10px rgba(61, 90, 128, 0.4)
glow-accent: 0 0 40px -10px rgba(129, 147, 106, 0.4)
```

### 4.5 Spacing & Sizing

- **Container:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Section padding:** `py-16 sm:py-24 lg:py-32`
- **Card padding:** small `p-4`, medium `p-6`, large `p-8`
- **Grid gaps:** card grids `gap-6` or `gap-8`, smaller items `gap-4`
- **Border radii:** cards `rounded-2xl`, buttons `rounded-xl`, badges `rounded-full`, large cards `rounded-3xl`

---

## 5. Motion & Animation System

### 5.1 The Standard Easing

Use this cubic-bezier everywhere as the default:
```
ease: [0.25, 0.1, 0.25, 1]   // Slightly accelerating out — CSS equivalent: cubic-bezier(0.25, 0.1, 0.25, 1)
```

Additional easing tokens:
```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);     /* slight overshoot */
```

### 5.2 Entrance Animations

**Standard fade-up** (most section content):
```
initial: { opacity: 0, y: 30 }
animate: { opacity: 1, y: 0 }
duration: 0.5s, ease: [0.25, 0.1, 0.25, 1]
```

**Scale-in** (cards, mockups):
```
initial: { opacity: 0, scale: 0.95, y: 30 }
animate: { opacity: 1, scale: 1, y: 0 }
duration: 0.6s
```

**Lateral slide** (alternating items):
```
initial: { opacity: 0, x: index % 2 === 0 ? -40 : 40 }
animate: { opacity: 1, x: 0 }
```

**Spring pop** (icons, social links):
```
initial: { opacity: 0, scale: 0 }
animate: { opacity: 1, scale: 1 }
transition: { type: "spring", stiffness: 200-300, damping: 15 }
```

### 5.3 Stagger Choreography

When animating a group, use `staggerChildren`:

```tsx
// Container
const container = {
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

// Each child
const item = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }
};
```

For non-variant patterns, use index-based delay: `delay: index * 0.15`

### 5.4 Hover Microinteractions

| Effect | Values | When to use |
|--------|--------|-------------|
| Scale lift | `scale: 1.03, y: -4` | Cards in grids |
| Scale + rotate | `scale: 1.05, rotate: ±2` | Floating cards |
| Scale only | `scale: 1.05` | Buttons |
| 3D tilt | `rotateX: ±5°, rotateY: ±5°` via mouse | Feature cards |
| Social bounce | `scale: 1.2, rotate: 5` | Icon buttons |

Spring config for hover: `{ type: "spring", stiffness: 200, damping: 25 }`
Tap feedback: `whileTap={{ scale: 0.95 }}`

### 5.5 Continuous/Ambient Animations

**Float** (decorative elements):
```css
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-10px) rotate(1deg); }
  50% { transform: translateY(-20px) rotate(0deg); }
  75% { transform: translateY(-10px) rotate(-1deg); }
}
.animate-float { animation: float 6s ease-in-out infinite; }
```
Stagger multiple floaters with `animation-delay: 1s, 1.5s, 2.5s, 3s, 4s`

**Pulse-slow** (gradient orbs):
```css
@keyframes pulse-slow {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}
.animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
```

**SVG dash animation** (graph connections):
```html
<animate attributeName="stroke-dashoffset" from="6" to="0" dur="1s" repeatCount="indefinite" />
```

**Badge pulsing glow:**
```tsx
animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
```

### 5.6 Performance Rules

> [!IMPORTANT]
> These rules prevent scroll jitter and animation jank. Violating them is the most common cause of "why does my page feel janky?"

1. **Only animate `transform` and `opacity`** — never animate `width`, `height`, `top`, `left`, `margin`, `padding`
2. **`transition-none` on all `motion` elements** — Tailwind's `transition-all duration-300` directly conflicts with Framer Motion's transform interpolation. Add `transition-none` to the className of every `motion.div`, or use the `gsap-element` class
3. **`useMotionValue` for high-frequency updates** — mouse position, scroll-linked animations, tilt effects. `useState` triggers React re-renders (60/sec = jank). `useMotionValue` bypasses React entirely
4. **`useInView({ once: true })`** — never use `once: false` for entrance animations. Re-triggering on scroll-back causes visible jank
5. **Never use `layoutId` for scroll-tracked elements** — `layoutId` triggers Framer Motion's layout projection system, which is expensive when called 60 times/sec during scroll
6. **`backdrop-filter` on fixed elements** — keep `blur()` ≤ 12px. Every pixel of blur requires per-frame compositing. Add `will-change: transform` for GPU promotion
7. **Lenis + CSS** — set `html { scroll-behavior: auto }`. Never `smooth`

### 5.7 Reduced Motion

```tsx
const prefersReducedMotion = useReducedMotion(); // Custom hook wrapping matchMedia

// Conditional animation values
initial={{ opacity: 0, y: prefersReducedMotion ? 10 : 30 }}
transition={{ duration: prefersReducedMotion ? 0.3 : 0.5 }}

// Skip tilt and complex effects entirely
whileHover={prefersReducedMotion ? {} : { scale: 1.03, y: -4 }}
```

Also include the CSS fallback:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. Decorative & Ambient Layer

This layer is what separates a "developer made this" page from a "designer made this" page. Never skip it.

### 6.1 Floating Geometric Shapes

Every section gets its own `FloatingElements` component:

```tsx
const FloatingElements = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Gradient blobs (2-3 per section) */}
    <div className="absolute -top-40 -right-40 w-[500px] h-[500px]
      bg-gradient-to-br from-primary-500/30 via-primary-400/20 to-transparent
      rounded-full blur-3xl animate-pulse-slow" />

    {/* Floating SVG shapes (3-5 per section) */}
    <svg className="absolute top-20 left-[10%] w-16 h-16 text-primary-500/20 animate-float"
      viewBox="0 0 64 64" fill="currentColor">
      <rect x="8" y="8" width="48" height="48" rx="8" transform="rotate(15 32 32)" />
    </svg>

    {/* Dot grid patterns */}
    <div className="absolute top-40 left-[25%] grid grid-cols-4 gap-2">
      {[...Array(16)].map((_, i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary-500/20" />
      ))}
    </div>
  </div>
);
```

**Shape types and their opacity ranges:**
- Filled squares/diamonds/circles: 10-25% opacity, `fill="currentColor"`
- Stroked triangles/hexagons: 10-15% opacity, `stroke="currentColor" strokeWidth="2"`
- Sizes: 8-20 (w-8 to w-20)
- Position: percentage-based (`left-[10%]`, `top-[20%]`), offset corners with negative values

### 6.2 Section-Themed Decorations

Each section's floating elements should thematically match:
- **Problem section:** warning triangles, broken circles
- **Solution section:** lightbulbs, checkmarks, code brackets
- **Process section:** numbered circles, directional arrows
- **Interactive showcase:** stars, shields, lightning bolts
- **CTA section:** rockets, lightbulbs, convergent arrows, sparkle pings

### 6.3 Decorative Rings and Arcs

```html
<!-- Concentric rings (use 2-3 at slightly different sizes) -->
<div class="absolute top-1/3 left-1/4 w-32 h-32 border border-primary-500/10 rounded-full" />
<div class="absolute top-1/3 left-1/4 w-40 h-40 border border-primary-500/5 rounded-full" />

<!-- Decorative arc above section header -->
<svg class="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-12 text-accent-500/20"
  viewBox="0 0 192 48" fill="none" stroke="currentColor" strokeWidth="2">
  <path d="M8 40 Q96 8 184 40" stroke-linecap="round" />
  <circle cx="96" cy="20" r="4" fill="currentColor" opacity="0.5" />
</svg>
```

### 6.4 Custom Cursor

Desktop-only (`hidden on touch/mobile`). A blended circle that follows the mouse:

```tsx
const cursorX = useMotionValue(0);
const cursorY = useMotionValue(0);
const springX = useSpring(cursorX, { damping: 25, stiffness: 700 });
const springY = useSpring(cursorY, { damping: 25, stiffness: 700 });

<motion.div style={{
  x: springX, y: springY,
  position: 'fixed', width: 32, height: 32,
  borderRadius: '50%',
  backgroundColor: 'rgba(var(--color-primary-rgb), 0.5)',
  pointerEvents: 'none', zIndex: 9999,
  mixBlendMode: 'difference',
}} />
```

- Never add trail particles — they run infinite animations that compound with scroll and cause frame drops
- Scale up on hover over interactive elements: `animate={{ scale: isHovering ? 2 : 1 }}`

---

## 7. Design Philosophy & Taste Guide

### The Mood

**Warm editorial with technical credibility.** Think: a beautifully typeset architecture magazine that happens to be about software. Not cold and corporate, not playful and childish. The palette (terracotta, ocean blue, sage green) immediately signals "this is NOT another generic AI product with electric blue gradients."

### Core Principles

1. **Warmth over coolness** — warm grays (stone family), earthy primaries, natural accent colors. Never use pure whites, pure blacks, or neon blue/purple
2. **Texture over flatness** — noise overlay, grid patterns, gradient orbs create depth. A flat page feels cheap; a textured page feels physical
3. **Restraint in motion** — the hero is busy, the middle sections breathe, the CTA punches. Animation density should follow a wave pattern, not constant intensity
4. **One more detail** — every section has at least one "unnecessary" decorative element that most developers would skip (the floating code brackets in the footer, the concentric rings behind card grids, the arc above section headers). These details compound into premium feel
5. **Color-matched everything** — glows match their parent's color. Borders match at lower opacity. Shadows match. Nothing uses generic gray shadows or unmatched accent colors

### What Breaks This Aesthetic

- ❌ Neon colors, electric gradients, or rainbow effects
- ❌ Pure white backgrounds (use warm off-whites)
- ❌ `transition-all` on animated elements (causes jank)
- ❌ Identical decoration across sections (each section needs themed floating elements)
- ❌ Missing noise overlay (the page feels too sterile without grain)
- ❌ Animations that play every time you scroll past (use `once: true`)
- ❌ More than 3 competing animation speeds visible simultaneously
- ❌ Flat, shadow-less cards (every card needs at minimum a subtle border + shadow)

### The "Does It Feel Right?" Test

When you finish a section, scroll through it slowly and ask:
1. Does the background have at least two layers of depth (gradient blob + pattern/shapes)?
2. Does content enter the viewport smoothly, from a reasonable direction?
3. Are hover states immediate and satisfying (springs, not linear)?
4. Is there at least one decorative detail that isn't functionally necessary?
5. Does the color temperature stay warm?

If yes to all five, the section belongs in this design system.
