# Design Document: Premium Landing Page Redesign

## Overview

This design document outlines the architecture and implementation approach for a completely redesigned landing page for SocraticDev. The design prioritizes premium aesthetics, interactive demonstrations, and performance while maintaining accessibility and SEO best practices.

The landing page will be implemented as a new React component (LandingPageV2.tsx) using TypeScript, Framer Motion for animations, and a mobile-first responsive approach. The design draws inspiration from industry-leading examples like Linear, Vercel, and Stripe, focusing on clean typography, purposeful animations, and immediate value communication.

**Key Design Principles:**
- Show, don't tell: Interactive demonstrations over marketing claims
- Performance first: 60fps animations, lazy loading, code splitting
- Accessibility by default: WCAG 2.1 AA compliance
- Mobile-first: Optimized for touch interactions and small screens
- Premium aesthetics: Custom SVG icons, sophisticated color palette, refined typography

## Architecture

### Component Hierarchy

```
LandingPageV2
├── NavigationBar
│   ├── Logo
│   ├── NavigationLinks
│   └── CTAButtons
├── HeroSection
│   ├── HeadlineGroup
│   ├── SocraticDialogueSimulator
│   │   ├── DialogueMessage
│   │   ├── TypewriterEffect
│   │   └── InteractionControls
│   └── HeroCTAGroup
├── ProblemSolutionSection
│   ├── ProblemStatement
│   ├── SolutionVisualization
│   └── ComparisonSlider
├── InteractiveFeatureShowcase
│   ├── CodeTransformationAnimation
│   │   ├── CodeBlock
│   │   ├── TransitionIndicator
│   │   └── AnnotationOverlay
│   ├── KnowledgeGraphVisualization
│   │   ├── GraphCanvas
│   │   ├── NodeComponent
│   │   └── EdgeComponent
│   └── BeforeAfterComparison
├── SocialProofSection
│   ├── TestimonialCarousel
│   │   └── TestimonialCard
│   ├── MetricsDisplay
│   │   └── AnimatedCounter
│   └── LogoCloud
├── PricingCTASection
│   ├── PricingCard
│   └── FinalCTA
└── Footer
    ├── FooterLinks
    ├── SocialLinks
    └── LegalLinks
```

### Technology Stack

- **Framework**: React 18+ with TypeScript
- **Animation**: Framer Motion (motion.dev)
- **Syntax Highlighting**: react-syntax-highlighter with Prism
- **Icons**: Custom SVG components
- **Styling**: Tailwind CSS (assumed from existing project)
- **Graph Visualization**: D3.js or custom Canvas implementation
- **Performance**: React.lazy() for code splitting, Intersection Observer for lazy loading

### Routing Integration

The component will integrate with existing routing by:
1. Creating a new route `/v2` or replacing the existing landing page route
2. Maintaining all existing route links (/app, /dojo, etc.)
3. Using React Router's Link component for client-side navigation
4. Preserving existing authentication flows

## Components and Interfaces

### Core Component Interfaces

```typescript
// Main Landing Page Component
interface LandingPageV2Props {
  variant?: 'default' | 'dark';
  initialSection?: string;
}

// Navigation Bar
interface NavigationBarProps {
  transparent?: boolean;
  onCTAClick: (action: 'signup' | 'demo') => void;
}

// Hero Section
interface HeroSectionProps {
  onPrimaryCTA: () => void;
  onSecondaryCTA: () => void;
}

// Socratic Dialogue Simulator
interface SocraticDialogueSimulatorProps {
  scenario: DialogueScenario;
  interactive: boolean;
  onInteraction?: (choice: string) => void;
}

interface DialogueScenario {
  id: string;
  title: string;
  messages: DialogueMessage[];
  branches?: DialogueBranch[];
}

interface DialogueMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  delay?: number;
  annotation?: string;
}

interface DialogueBranch {
  trigger: string;
  nextScenario: string;
}

// Code Transformation Animation
interface CodeTransformationAnimationProps {
  stages: CodeStage[];
  autoPlay?: boolean;
  loop?: boolean;
}

interface CodeStage {
  id: string;
  code: string;
  language: string;
  title: string;
  description: string;
  annotations: CodeAnnotation[];
}

interface CodeAnnotation {
  line: number;
  content: string;
  type: 'question' | 'insight' | 'improvement';
}

// Knowledge Graph Visualization
interface KnowledgeGraphVisualizationProps {
  data: GraphData;
  interactive: boolean;
  highlightPath?: string[];
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface GraphNode {
  id: string;
  label: string;
  type: 'concept' | 'skill' | 'project';
  level: number;
}

interface GraphEdge {
  source: string;
  target: string;
  relationship: 'requires' | 'builds-on' | 'relates-to';
}

// Testimonial Components
interface TestimonialCardProps {
  testimonial: Testimonial;
  featured?: boolean;
}

interface Testimonial {
  id: string;
  author: string;
  role: string;
  company?: string;
  avatar?: string;
  content: string;
  rating?: number;
}

// Metrics Display
interface MetricsDisplayProps {
  metrics: Metric[];
  animateOnView: boolean;
}

interface Metric {
  id: string;
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  format?: 'number' | 'percentage' | 'duration';
}

// Before/After Comparison
interface BeforeAfterComparisonProps {
  beforeContent: ComparisonContent;
  afterContent: ComparisonContent;
  defaultPosition?: number;
}

interface ComparisonContent {
  title: string;
  description: string;
  visual: React.ReactNode;
  highlights: string[];
}
```

### Animation Variants

```typescript
// Framer Motion animation variants for consistent animations
export const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
};

export const slideInFromRight = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};
```

## Data Models

### Content Data Structure

```typescript
// Landing page content configuration
interface LandingPageContent {
  hero: HeroContent;
  problemSolution: ProblemSolutionContent;
  features: FeatureContent[];
  socialProof: SocialProofContent;
  pricing: PricingContent;
  footer: FooterContent;
}

interface HeroContent {
  headline: string;
  subheadline: string;
  primaryCTA: CTAConfig;
  secondaryCTA: CTAConfig;
  dialogueScenario: DialogueScenario;
}

interface CTAConfig {
  text: string;
  action: string;
  variant: 'primary' | 'secondary' | 'outline';
  href?: string;
  onClick?: () => void;
}

interface ProblemSolutionContent {
  problem: {
    title: string;
    description: string;
    painPoints: string[];
  };
  solution: {
    title: string;
    description: string;
    benefits: string[];
  };
}

interface FeatureContent {
  id: string;
  title: string;
  description: string;
  icon: string;
  demo: DemoConfig;
}

interface DemoConfig {
  type: 'code-transformation' | 'graph' | 'dialogue' | 'comparison';
  data: any;
  interactive: boolean;
}

interface SocialProofContent {
  testimonials: Testimonial[];
  metrics: Metric[];
  logos: CompanyLogo[];
}

interface CompanyLogo {
  id: string;
  name: string;
  logoUrl: string;
  website?: string;
}

interface PricingContent {
  plans: PricingPlan[];
  cta: CTAConfig;
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  highlighted?: boolean;
}

interface FooterContent {
  sections: FooterSection[];
  social: SocialLink[];
  legal: LegalLink[];
  copyright: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterLink {
  text: string;
  href: string;
  external?: boolean;
}

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

interface LegalLink {
  text: string;
  href: string;
}
```

### State Management

```typescript
// Component-level state (no global state needed)
interface LandingPageState {
  activeSection: string;
  dialogueState: DialogueState;
  animationProgress: Map<string, number>;
  userInteractions: InteractionEvent[];
}

interface DialogueState {
  currentScenario: string;
  messageIndex: number;
  userChoices: string[];
  isPlaying: boolean;
}

interface InteractionEvent {
  timestamp: number;
  type: 'click' | 'scroll' | 'hover';
  target: string;
  data?: any;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: No Emoji Characters in Rendered Output

*For any* rendered landing page DOM, all icon elements should be SVG elements and no text content should contain emoji unicode characters (U+1F300 to U+1F9FF ranges).

**Validates: Requirements 1.1**

### Property 2: Consistent Spacing System

*For any* visual element with spacing (margin, padding, gap), the spacing value should come from a predefined design system scale (e.g., Tailwind's spacing scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64).

**Validates: Requirements 1.3**

### Property 3: Typography Hierarchy Levels

*For any* rendered landing page, there should be at least three distinct font-size values used across heading, body, and caption text elements.

**Validates: Requirements 1.4**

### Property 4: Consistent Color Palette Usage

*For any* element with color styling, the color value should come from a predefined color palette (primary, secondary, accent, neutral shades).

**Validates: Requirements 1.5**

### Property 5: Staggered Animation Timing

*For any* group of animated elements in the hero section, each element's animation delay should be different, creating a staggered effect.

**Validates: Requirements 2.5**

### Property 6: Interactive Dialogue State Changes

*For any* user interaction with the Socratic Dialogue Simulator controls, the dialogue state should change to reflect the user's choice.

**Validates: Requirements 2.6**

### Property 7: Interaction Feedback Responsiveness

*For any* interactive feature showcase element, when a user interaction occurs, a visual state change should happen within 100ms.

**Validates: Requirements 3.3**

### Property 8: Syntax Highlighting Application

*For any* code block displayed on the landing page, syntax highlighting should be applied with distinct colors for keywords, strings, comments, and other token types.

**Validates: Requirements 3.5**

### Property 9: Code Annotation Presence

*For any* code example displayed, there should be at least one Socratic dialogue annotation associated with it.

**Validates: Requirements 3.6**

### Property 10: Testimonial Attribution Completeness

*For any* testimonial displayed, it should include both author name and role information.

**Validates: Requirements 4.3**

### Property 11: Functional CTA Actions

*For any* CTA button on the landing page, it should have either a valid href attribute or a defined onClick handler (not undefined or null).

**Validates: Requirements 5.2, 5.4**

### Property 12: No Placeholder Links

*For any* link or button element, the href attribute should not be a placeholder value ("#", "javascript:void(0)", or empty string).

**Validates: Requirements 5.4**

### Property 13: Route Integration Preservation

*For any* navigation action from the landing page, existing application routes (/app, /dojo, etc.) should remain accessible and functional.

**Validates: Requirements 5.5**

### Property 14: Lazy Loading Implementation

*For any* below-the-fold component or image, it should use either React.lazy(), dynamic import(), or Intersection Observer for lazy loading.

**Validates: Requirements 6.2**

### Property 15: Code Splitting Usage

*For any* large feature component (>50KB), it should be loaded using dynamic import() or React.lazy() for code splitting.

**Validates: Requirements 6.3**

### Property 16: Deferred Non-Critical Scripts

*For any* non-critical script tag, it should have either defer or async attribute, or be loaded after initial render.

**Validates: Requirements 6.5**

### Property 17: Responsive Viewport Rendering

*For any* viewport width between 320px and 2560px, the landing page should render without horizontal scrollbars or layout breaks.

**Validates: Requirements 7.1**

### Property 18: Touch-Friendly Target Sizes

*For any* interactive element (button, link, input) on mobile viewports (<768px), the tap target size should be at least 44x44 pixels.

**Validates: Requirements 7.2**

### Property 19: Responsive Breakpoint Definition

*For any* responsive layout, media queries should be defined at the standard breakpoints: 640px, 768px, 1024px, and 1280px.

**Validates: Requirements 7.3**

### Property 20: Image Alternative Text Completeness

*For any* image, SVG icon, or visual element, it should have either an alt attribute, aria-label, or aria-labelledby attribute.

**Validates: Requirements 8.1**

### Property 21: Color Contrast Compliance

*For any* text element, the color contrast ratio between text and background should be at least 4.5:1 for normal text or 3:1 for large text (18pt+).

**Validates: Requirements 8.2**

### Property 22: Keyboard Focus Indicators

*For any* interactive element, it should have a visible focus style defined (not outline: none without alternative).

**Validates: Requirements 8.3**

### Property 23: Semantic HTML Structure

*For any* landing page document, it should use semantic HTML5 elements (header, nav, main, section, article, footer) for structural organization.

**Validates: Requirements 8.4**

### Property 24: ARIA Labels for Icon Buttons

*For any* interactive element without visible text content (icon-only buttons), it should have an aria-label or aria-labelledby attribute.

**Validates: Requirements 8.5**

### Property 25: Dynamic Content Announcements

*For any* component with dynamic content updates (dialogue simulator, counters), it should use aria-live regions to announce changes to screen readers.

**Validates: Requirements 8.6**

### Property 26: Heading Hierarchy Order

*For any* sequence of heading elements, they should follow proper hierarchical nesting (h1 before h2, h2 before h3, no skipping levels).

**Validates: Requirements 9.3**

### Property 27: Framer Motion Animation Usage

*For any* animated element, it should use Framer Motion's motion components rather than CSS animations or other animation libraries.

**Validates: Requirements 10.1, 12.4**

### Property 28: Scroll Animation Viewport Threshold

*For any* scroll-triggered animation, it should use a viewport intersection threshold of approximately 0.2 (20% visibility).

**Validates: Requirements 10.2**

### Property 29: Animation Duration Constraints

*For any* UI transition animation, the duration should be between 200ms and 600ms.

**Validates: Requirements 10.4**

### Property 30: Reduced Motion Respect

*For any* non-essential animation, it should be disabled or simplified when the user's prefers-reduced-motion setting is enabled.

**Validates: Requirements 10.5**

### Property 31: Typing Animation Character Timing

*For any* typing animation effect in the dialogue simulator, characters should appear with individual delays creating a realistic typing effect (not all at once).

**Validates: Requirements 10.6**

### Property 32: TypeScript and Linting Compliance

*For any* code in the landing page component, it should pass TypeScript type checking and ESLint validation without errors.

**Validates: Requirements 12.6**

## Error Handling

### Animation Errors

**Scenario**: Framer Motion animation fails to initialize or throws error
- **Handling**: Gracefully degrade to static rendering without animations
- **User Impact**: Content remains accessible, just without motion
- **Implementation**: Try-catch blocks around animation setup, fallback to non-animated variants

**Scenario**: Scroll animation performance degrades below 30fps
- **Handling**: Automatically disable scroll animations and use simple fade-ins
- **User Impact**: Reduced visual polish but maintained performance
- **Implementation**: Performance monitoring with requestAnimationFrame, conditional animation disabling

### Content Loading Errors

**Scenario**: Lazy-loaded component fails to load
- **Handling**: Display error boundary with retry option
- **User Impact**: User sees error message with ability to retry
- **Implementation**: React Error Boundaries with retry logic

**Scenario**: Image fails to load
- **Handling**: Display placeholder with alt text
- **User Impact**: User sees descriptive text instead of broken image
- **Implementation**: onError handlers on img elements, fallback to colored placeholder

### Interactive Component Errors

**Scenario**: Dialogue simulator state becomes corrupted
- **Handling**: Reset to initial state with user notification
- **User Impact**: Dialogue restarts from beginning
- **Implementation**: State validation, reset button, error boundary

**Scenario**: Graph visualization fails to render
- **Handling**: Display static image fallback or simplified version
- **User Impact**: User sees alternative visualization
- **Implementation**: Try-catch around D3/Canvas rendering, fallback component

### Navigation Errors

**Scenario**: CTA link points to non-existent route
- **Handling**: Log error, redirect to home or show 404
- **User Impact**: User is redirected gracefully
- **Implementation**: Route validation, catch-all route handling

**Scenario**: External link is broken
- **Handling**: Open link in new tab, let browser handle error
- **User Impact**: Browser shows standard error page
- **Implementation**: target="_blank" with rel="noopener noreferrer"

### Performance Degradation

**Scenario**: Initial bundle size exceeds target
- **Handling**: Aggressive code splitting, defer non-critical features
- **User Impact**: Faster initial load, features load progressively
- **Implementation**: Dynamic imports, route-based splitting

**Scenario**: Memory leak from animation or graph visualization
- **Handling**: Cleanup on component unmount, limit animation instances
- **User Impact**: Stable performance over time
- **Implementation**: useEffect cleanup functions, animation cancellation

## Testing Strategy

### Dual Testing Approach

This feature requires both unit testing and property-based testing for comprehensive coverage:

**Unit Tests** focus on:
- Specific component rendering examples
- Edge cases (empty states, error states)
- Integration between components
- User interaction flows
- Accessibility compliance for specific scenarios

**Property Tests** focus on:
- Universal properties that hold across all inputs
- Randomized content and state variations
- Comprehensive coverage of design system constraints
- Animation and responsive behavior across ranges

Both approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across the input space.

### Property-Based Testing Configuration

**Library Selection**: Use `fast-check` for TypeScript/JavaScript property-based testing

**Test Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each property test must reference its design document property
- Tag format: `Feature: premium-landing-redesign, Property {number}: {property_text}`

**Example Property Test Structure**:
```typescript
import fc from 'fast-check';

describe('Feature: premium-landing-redesign, Property 2: Consistent Spacing System', () => {
  it('should use only predefined spacing values', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          margin: fc.integer(),
          padding: fc.integer()
        })),
        (elements) => {
          const allowedSpacing = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64];
          // Test that all spacing values are in allowed set
          return elements.every(el => 
            allowedSpacing.includes(el.margin) && 
            allowedSpacing.includes(el.padding)
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Testing Strategy

**Component Testing**:
- Test each major component in isolation
- Mock child components to focus on component logic
- Test props, state, and event handlers
- Verify correct rendering for different prop combinations

**Integration Testing**:
- Test component composition and data flow
- Test navigation between sections
- Test animation sequencing
- Test responsive behavior at breakpoints

**Accessibility Testing**:
- Use @testing-library/jest-dom for accessibility assertions
- Test keyboard navigation
- Test screen reader announcements
- Verify ARIA attributes

**Visual Regression Testing** (optional):
- Use Chromatic or Percy for visual diffs
- Capture screenshots at different viewports
- Compare against baseline images

### Testing Tools

- **Test Runner**: Jest or Vitest
- **Component Testing**: React Testing Library
- **Property Testing**: fast-check
- **Accessibility**: @testing-library/jest-dom, axe-core
- **Animation Testing**: Mock Framer Motion for unit tests, test animation configs
- **Coverage**: Aim for >80% code coverage, 100% property coverage

### Test Organization

```
tests/
├── unit/
│   ├── components/
│   │   ├── HeroSection.test.tsx
│   │   ├── SocraticDialogueSimulator.test.tsx
│   │   ├── CodeTransformationAnimation.test.tsx
│   │   ├── KnowledgeGraphVisualization.test.tsx
│   │   └── ...
│   ├── utils/
│   │   ├── animations.test.ts
│   │   └── content.test.ts
│   └── integration/
│       ├── navigation.test.tsx
│       └── responsive.test.tsx
├── property/
│   ├── design-system.property.test.ts
│   ├── accessibility.property.test.ts
│   ├── animations.property.test.ts
│   ├── responsive.property.test.ts
│   └── navigation.property.test.ts
└── e2e/
    └── landing-page.e2e.test.ts (optional)
```

### Continuous Integration

- Run all tests on every commit
- Run property tests with increased iterations (1000+) on main branch
- Run accessibility audits with Lighthouse CI
- Monitor bundle size and performance metrics
- Fail build on TypeScript errors or linting violations

## Implementation Notes

### Performance Optimization Techniques

1. **Code Splitting**:
   - Split by route (landing page separate from app)
   - Split large components (graph visualization, code editor)
   - Use React.lazy() with Suspense boundaries

2. **Image Optimization**:
   - Use WebP format with JPEG fallback
   - Implement responsive images with srcset
   - Lazy load below-the-fold images
   - Use blur-up placeholder technique

3. **Animation Performance**:
   - Animate only transform and opacity (GPU-accelerated)
   - Use will-change sparingly and remove after animation
   - Debounce scroll event handlers
   - Use Intersection Observer instead of scroll listeners

4. **Bundle Optimization**:
   - Tree-shake unused code
   - Minimize third-party dependencies
   - Use dynamic imports for heavy libraries (D3, syntax highlighter)
   - Implement proper code splitting strategy

### Accessibility Implementation

1. **Keyboard Navigation**:
   - Ensure logical tab order
   - Implement skip links for main content
   - Provide keyboard shortcuts for interactive features
   - Trap focus in modal dialogs

2. **Screen Reader Support**:
   - Use semantic HTML elements
   - Provide descriptive ARIA labels
   - Announce dynamic content changes
   - Ensure proper heading hierarchy

3. **Visual Accessibility**:
   - Maintain sufficient color contrast
   - Provide focus indicators
   - Support browser zoom up to 200%
   - Avoid relying solely on color for information

4. **Motion Accessibility**:
   - Respect prefers-reduced-motion
   - Provide pause controls for auto-playing content
   - Avoid flashing or strobing effects
   - Keep animations subtle and purposeful

### Browser Compatibility

**Target Browsers**:
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- iOS Safari (last 2 versions)
- Chrome Mobile (last 2 versions)

**Polyfills Needed**:
- Intersection Observer (for older browsers)
- ResizeObserver (for older browsers)
- CSS custom properties fallbacks (if supporting IE11)

**Progressive Enhancement**:
- Core content accessible without JavaScript
- Animations enhance but aren't required
- Fallbacks for unsupported features

### Content Strategy

**Headline Examples** (10 words or less):
- "Learn to code through questions, not answers"
- "Master coding with AI-powered Socratic teaching"
- "Think like a developer, guided by questions"

**Value Propositions**:
- Deep understanding over memorization
- Active learning through questioning
- Personalized learning paths
- Real-world problem solving

**Social Proof Metrics**:
- "10,000+ developers learning daily"
- "95% report deeper understanding"
- "Average 3x faster skill acquisition"

### Design System Tokens

```typescript
// colors.ts
export const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    // ... full scale
    900: '#0c4a6e',
  },
  secondary: {
    // ... full scale
  },
  accent: {
    // ... full scale
  },
  neutral: {
    // ... full scale
  }
};

// spacing.ts
export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
  40: '10rem',
  48: '12rem',
  56: '14rem',
  64: '16rem',
};

// typography.ts
export const typography = {
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  }
};

// animations.ts
export const animations = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 600,
  },
  easing: {
    easeOut: [0.22, 1, 0.36, 1],
    easeIn: [0.4, 0, 1, 1],
    easeInOut: [0.4, 0, 0.2, 1],
  }
};
```

### Third-Party Libraries

**Required**:
- `framer-motion`: Animation library
- `react-syntax-highlighter`: Code syntax highlighting
- `prismjs`: Syntax highlighting themes

**Optional**:
- `d3`: Graph visualization (if custom implementation)
- `react-intersection-observer`: Lazy loading helper
- `clsx`: Conditional className utility

**Bundle Size Considerations**:
- Framer Motion: ~50KB gzipped
- React Syntax Highlighter: ~30KB gzipped (with one language)
- D3: ~70KB gzipped (full library, consider d3-force only)

Total estimated bundle size: ~150KB gzipped for landing page (acceptable for modern web)

## References

- [Evil Martians: Dev Tool Landing Pages Study](https://evilmartians.com/chronicles/we-studied-100-devtool-landing-pages-here-is-what-actually-works-in-2025) - Research on effective developer tool landing pages
- [Framer Motion Documentation](https://motion.dev) - Animation library documentation
- [React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) - Code highlighting component
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility standards
- [Web Vitals](https://web.dev/vitals/) - Performance metrics
