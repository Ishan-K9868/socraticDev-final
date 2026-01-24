# Implementation Plan: Premium Landing Page Redesign

## Overview

This implementation plan breaks down the premium landing page redesign into discrete, incremental coding tasks. Each task builds on previous work, with testing integrated throughout to catch issues early. The implementation follows a bottom-up approach: design system → core components → interactive features → integration → optimization.

## Tasks

- [x] 1. Set up project structure and design system
  - Create `frontend/src/components/landing-v2/` directory structure
  - Create design system tokens file (`tokens.ts`) with colors, spacing, typography, and animation constants
  - Create animation variants file (`animationVariants.ts`) with Framer Motion presets
  - Set up TypeScript interfaces file (`types.ts`) for all component props and data models
  - Install required dependencies: `framer-motion`, `react-syntax-highlighter`, `prismjs`
  - _Requirements: 1.3, 1.4, 1.5, 12.1, 12.4_

- [x] 2. Create custom SVG icon components
  - [x] 2.1 Design and implement custom SVG icon components
    - Create `icons/` directory with individual icon components
    - Implement at least 10 custom SVG icons (arrow, check, code, graph, question, lightbulb, etc.)
    - Ensure all icons accept size and color props
    - Add proper accessibility attributes (role, aria-label)
    - _Requirements: 1.1, 8.1_
  
  - [ ]* 2.2 Write property test for icon accessibility
    - **Property 20: Image Alternative Text Completeness**
    - **Validates: Requirements 8.1**
  
  - [ ]* 2.3 Write unit tests for icon components
    - Test icon rendering with different props
    - Test accessibility attributes
    - _Requirements: 1.1, 8.1_

- [x] 3. Implement base layout components
  - [x] 3.1 Create NavigationBar component
    - Implement sticky navigation with transparency on scroll
    - Add logo, navigation links, and CTA buttons
    - Implement mobile hamburger menu
    - Add keyboard navigation support
    - _Requirements: 5.1, 8.3, 8.4_
  
  - [x] 3.2 Create Footer component
    - Implement footer with multiple link sections
    - Add social media links with icons
    - Add legal links (privacy, terms)
    - Ensure all links are functional (no placeholders)
    - _Requirements: 5.3, 5.4, 8.4_
  
  - [ ]* 3.3 Write property test for functional links
    - **Property 11: Functional CTA Actions**
    - **Property 12: No Placeholder Links**
    - **Validates: Requirements 5.2, 5.4**
  
  - [ ]* 3.4 Write unit tests for navigation and footer
    - Test link rendering and navigation
    - Test mobile menu toggle
    - Test keyboard navigation
    - _Requirements: 5.1, 5.3, 8.3_

- [x] 4. Build HeroSection with headline and CTAs
  - [x] 4.1 Implement HeroSection component structure
    - Create headline group with main headline and subheadline
    - Implement primary and secondary CTA buttons
    - Add staggered entrance animations using Framer Motion
    - Ensure hero content fits above fold on 375px width
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 10.1_
  
  - [ ]* 4.2 Write property test for staggered animations
    - **Property 5: Staggered Animation Timing**
    - **Validates: Requirements 2.5**
  
  - [ ]* 4.3 Write property test for animation durations
    - **Property 29: Animation Duration Constraints**
    - **Validates: Requirements 10.4**
  
  - [ ]* 4.4 Write unit tests for hero section
    - Test headline rendering (word count ≤10)
    - Test CTA button rendering
    - Test responsive layout at 375px
    - _Requirements: 2.1, 2.3, 2.4_

- [x] 5. Implement SocraticDialogueSimulator
  - [x] 5.1 Create DialogueMessage component with typewriter effect
    - Implement character-by-character typing animation
    - Add realistic timing delays between characters
    - Support different message roles (assistant, user)
    - Add message annotations
    - _Requirements: 2.2, 10.6_
  
  - [x] 5.2 Create SocraticDialogueSimulator component
    - Implement dialogue state management
    - Add interactive controls for user choices
    - Implement dialogue branching logic
    - Add play/pause controls
    - Add aria-live region for screen reader announcements
    - _Requirements: 2.2, 2.6, 8.6_
  
  - [ ]* 5.3 Write property test for interactive dialogue
    - **Property 6: Interactive Dialogue State Changes**
    - **Validates: Requirements 2.6**
  
  - [ ]* 5.4 Write property test for typing animation
    - **Property 31: Typing Animation Character Timing**
    - **Validates: Requirements 10.6**
  
  - [ ]* 5.5 Write property test for dynamic content announcements
    - **Property 25: Dynamic Content Announcements**
    - **Validates: Requirements 8.6**
  
  - [ ]* 5.6 Write unit tests for dialogue simulator
    - Test dialogue progression
    - Test user interaction handling
    - Test branching logic
    - _Requirements: 2.2, 2.6_

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Create CodeTransformationAnimation component
  - [x] 7.1 Implement CodeBlock component with syntax highlighting
    - Integrate react-syntax-highlighter with Prism
    - Support multiple programming languages
    - Add line number display
    - Implement code annotation overlay
    - _Requirements: 3.1, 3.5, 3.6_
  
  - [x] 7.2 Implement CodeTransformationAnimation component
    - Create multi-stage code transformation display
    - Add transition animations between stages
    - Implement stage navigation controls
    - Add Socratic dialogue annotations for each stage
    - Support auto-play and manual control
    - _Requirements: 3.1, 3.5, 3.6_
  
  - [ ]* 7.3 Write property test for syntax highlighting
    - **Property 8: Syntax Highlighting Application**
    - **Validates: Requirements 3.5**
  
  - [ ]* 7.4 Write property test for code annotations
    - **Property 9: Code Annotation Presence**
    - **Validates: Requirements 3.6**
  
  - [ ]* 7.5 Write unit tests for code transformation
    - Test stage progression
    - Test annotation rendering
    - Test syntax highlighting
    - _Requirements: 3.1, 3.5, 3.6_

- [x] 8. Build KnowledgeGraphVisualization component
  - [x] 8.1 Implement graph rendering with D3 or Canvas
    - Create GraphCanvas component
    - Implement node and edge rendering
    - Add force-directed layout algorithm
    - Implement zoom and pan controls
    - Add node hover interactions
    - _Requirements: 3.2, 3.3_
  
  - [x] 8.2 Add interactive features to graph
    - Implement node click to highlight connections
    - Add path highlighting animation
    - Implement smooth transitions for layout changes
    - Add touch gesture support for mobile
    - _Requirements: 3.2, 3.3_
  
  - [ ]* 8.3 Write property test for interaction feedback
    - **Property 7: Interaction Feedback Responsiveness**
    - **Validates: Requirements 3.3**
  
  - [ ]* 8.4 Write unit tests for graph visualization
    - Test node and edge rendering
    - Test interaction handling
    - Test layout calculations
    - _Requirements: 3.2, 3.3_

- [x] 9. Create BeforeAfterComparison component
  - [x] 9.1 Implement comparison slider component
    - Create split-view layout with draggable divider
    - Implement before and after content areas
    - Add smooth drag interactions
    - Add keyboard controls for slider
    - Ensure touch-friendly on mobile
    - _Requirements: 3.4, 7.2_
  
  - [ ]* 9.2 Write property test for touch target sizes
    - **Property 18: Touch-Friendly Target Sizes**
    - **Validates: Requirements 7.2**
  
  - [ ]* 9.3 Write unit tests for comparison component
    - Test slider interaction
    - Test keyboard controls
    - Test content rendering
    - _Requirements: 3.4_

- [x] 10. Implement ProblemSolutionSection
  - [x] 10.1 Create ProblemStatement component
    - Display problem description with pain points
    - Add scroll-triggered fade-in animation
    - Use semantic HTML structure
    - _Requirements: 8.4, 10.1, 10.2_
  
  - [x] 10.2 Create SolutionVisualization component
    - Display solution with benefits
    - Integrate BeforeAfterComparison component
    - Add scroll-triggered animations
    - _Requirements: 10.1, 10.2_
  
  - [ ]* 10.3 Write property test for scroll animations
    - **Property 28: Scroll Animation Viewport Threshold**
    - **Validates: Requirements 10.2**
  
  - [ ]* 10.4 Write unit tests for problem/solution section
    - Test content rendering
    - Test animation triggers
    - _Requirements: 10.1, 10.2_

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Build SocialProofSection components
  - [x] 12.1 Create TestimonialCard component
    - Display testimonial with author info
    - Ensure author name and role are always present
    - Add avatar image with fallback
    - Add optional rating display
    - _Requirements: 4.1, 4.3_
  
  - [x] 12.2 Create TestimonialCarousel component
    - Implement carousel with at least 3 testimonials
    - Add navigation controls (prev/next)
    - Add auto-play with pause on hover
    - Implement swipe gestures for mobile
    - Add keyboard navigation
    - _Requirements: 4.1, 4.3, 8.3_
  
  - [x] 12.3 Create AnimatedCounter component
    - Implement count-up animation on scroll into view
    - Support different number formats (integer, percentage, duration)
    - Add prefix and suffix support
    - _Requirements: 4.2_
  
  - [x] 12.4 Create MetricsDisplay component
    - Display multiple metrics with animated counters
    - Trigger animations when scrolled into view
    - Use grid layout for responsive display
    - _Requirements: 4.2_
  
  - [x] 12.5 Create LogoCloud component
    - Display company/institution logos in grid
    - Add grayscale filter with color on hover
    - Ensure logos have alt text
    - _Requirements: 4.4, 8.1_
  
  - [ ]* 12.6 Write property test for testimonial attribution
    - **Property 10: Testimonial Attribution Completeness**
    - **Validates: Requirements 4.3**
  
  - [ ]* 12.7 Write unit tests for social proof components
    - Test testimonial rendering
    - Test carousel navigation
    - Test counter animations
    - Test logo rendering
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 13. Implement PricingCTASection
  - [x] 13.1 Create PricingCard component
    - Display plan name, price, and features
    - Add highlighted variant for featured plan
    - Include CTA button for each plan
    - _Requirements: 5.2_
  
  - [x] 13.2 Create PricingCTASection component
    - Display pricing cards in responsive grid
    - Add final conversion CTA
    - Add scroll-triggered animations
    - _Requirements: 5.2, 10.1_
  
  - [ ]* 13.3 Write unit tests for pricing section
    - Test pricing card rendering
    - Test CTA functionality
    - _Requirements: 5.2_

- [x] 14. Assemble main LandingPageV2 component
  - [x] 14.1 Create LandingPageV2.tsx main component
    - Import and compose all section components
    - Implement scroll progress tracking
    - Add smooth scroll behavior
    - Ensure proper component ordering
    - _Requirements: 12.1, 12.2_
  
  - [x] 14.2 Integrate with application routing
    - Add route for new landing page
    - Ensure all internal links work correctly
    - Test navigation to /app, /dojo, and other routes
    - _Requirements: 5.1, 5.5, 12.5_
  
  - [ ]* 14.3 Write property test for route integration
    - **Property 13: Route Integration Preservation**
    - **Validates: Requirements 5.5**
  
  - [ ]* 14.4 Write integration tests for full page
    - Test section rendering
    - Test navigation flow
    - Test scroll behavior
    - _Requirements: 12.1, 12.5_

- [ ] 15. Implement responsive design and breakpoints
  - [ ] 15.1 Add responsive styles for all components
    - Implement mobile-first responsive design
    - Add media queries at 640px, 768px, 1024px, 1280px
    - Test layout at viewport widths 320px to 2560px
    - Ensure no horizontal scrollbars at any width
    - _Requirements: 7.1, 7.3_
  
  - [ ] 15.2 Optimize mobile interactions
    - Ensure all tap targets are at least 44x44px on mobile
    - Implement touch-friendly gestures
    - Optimize mobile navigation
    - _Requirements: 7.2_
  
  - [ ]* 15.3 Write property test for responsive rendering
    - **Property 17: Responsive Viewport Rendering**
    - **Validates: Requirements 7.1**
  
  - [ ]* 15.4 Write property test for responsive breakpoints
    - **Property 19: Responsive Breakpoint Definition**
    - **Validates: Requirements 7.3**
  
  - [ ]* 15.5 Write unit tests for responsive behavior
    - Test layout at different breakpoints
    - Test mobile menu behavior
    - Test touch interactions
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 16. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Implement accessibility features
  - [ ] 17.1 Add comprehensive ARIA labels and roles
    - Add aria-label to all icon-only buttons
    - Add aria-live regions for dynamic content
    - Ensure proper ARIA roles for custom components
    - _Requirements: 8.1, 8.5, 8.6_
  
  - [ ] 17.2 Implement keyboard navigation
    - Add visible focus indicators to all interactive elements
    - Implement skip links for main content
    - Ensure logical tab order throughout page
    - Add keyboard shortcuts for interactive features
    - _Requirements: 8.3_
  
  - [ ] 17.3 Ensure semantic HTML structure
    - Use proper heading hierarchy (h1, h2, h3)
    - Use semantic elements (header, nav, main, section, footer)
    - Ensure no heading level skipping
    - _Requirements: 8.4, 9.3_
  
  - [ ]* 17.4 Write property test for semantic HTML
    - **Property 23: Semantic HTML Structure**
    - **Validates: Requirements 8.4**
  
  - [ ]* 17.5 Write property test for heading hierarchy
    - **Property 26: Heading Hierarchy Order**
    - **Validates: Requirements 9.3**
  
  - [ ]* 17.6 Write property test for keyboard focus
    - **Property 22: Keyboard Focus Indicators**
    - **Validates: Requirements 8.3**
  
  - [ ]* 17.7 Write property test for ARIA labels
    - **Property 24: ARIA Labels for Icon Buttons**
    - **Validates: Requirements 8.5**
  
  - [ ]* 17.8 Write unit tests for accessibility
    - Test keyboard navigation
    - Test ARIA attributes
    - Test focus management
    - Run axe-core accessibility audit
    - _Requirements: 8.1, 8.3, 8.4, 8.5, 8.6_

- [ ] 18. Implement color contrast compliance
  - [ ] 18.1 Audit and fix color contrast issues
    - Check all text/background combinations
    - Ensure 4.5:1 ratio for normal text
    - Ensure 3:1 ratio for large text (18pt+)
    - Fix any failing combinations
    - _Requirements: 8.2_
  
  - [ ]* 18.2 Write property test for color contrast
    - **Property 21: Color Contrast Compliance**
    - **Validates: Requirements 8.2**
  
  - [ ]* 18.3 Write unit tests for color contrast
    - Test contrast ratios for key text elements
    - _Requirements: 8.2_

- [ ] 19. Add reduced motion support
  - [ ] 19.1 Implement prefers-reduced-motion handling
    - Detect user's motion preference
    - Disable non-essential animations when reduced motion is preferred
    - Simplify essential animations (instant transitions)
    - Test with reduced motion enabled
    - _Requirements: 10.5_
  
  - [ ]* 19.2 Write property test for reduced motion
    - **Property 30: Reduced Motion Respect**
    - **Validates: Requirements 10.5**
  
  - [ ]* 19.3 Write unit tests for reduced motion
    - Test animation behavior with reduced motion
    - _Requirements: 10.5_

- [ ] 20. Implement SEO optimization
  - [ ] 20.1 Add meta tags and structured data
    - Add title tag (≤60 characters) with primary keywords
    - Add meta description (≤160 characters)
    - Add Open Graph tags for social sharing
    - Add Twitter Card tags
    - Add JSON-LD structured data for organization and product
    - Add canonical URL tag
    - _Requirements: 9.1, 9.2, 9.4, 9.5, 9.6_
  
  - [ ]* 20.2 Write unit tests for SEO elements
    - Test meta tag presence and content length
    - Test structured data validity
    - Test Open Graph tags
    - _Requirements: 9.1, 9.2, 9.4, 9.5, 9.6_

- [ ] 21. Implement performance optimizations
  - [ ] 21.1 Add lazy loading for below-the-fold content
    - Implement React.lazy() for heavy components
    - Add Intersection Observer for image lazy loading
    - Add loading skeletons for lazy-loaded content
    - _Requirements: 6.2_
  
  - [ ] 21.2 Implement code splitting
    - Split graph visualization into separate chunk
    - Split syntax highlighter into separate chunk
    - Split each major section into separate chunks
    - Add Suspense boundaries with loading states
    - _Requirements: 6.3_
  
  - [ ] 21.3 Optimize script loading
    - Defer non-critical scripts
    - Add async attribute where appropriate
    - Minimize third-party scripts
    - _Requirements: 6.5_
  
  - [ ]* 21.4 Write property test for lazy loading
    - **Property 14: Lazy Loading Implementation**
    - **Validates: Requirements 6.2**
  
  - [ ]* 21.5 Write property test for code splitting
    - **Property 15: Code Splitting Usage**
    - **Validates: Requirements 6.3**
  
  - [ ]* 21.6 Write property test for deferred scripts
    - **Property 16: Deferred Non-Critical Scripts**
    - **Validates: Requirements 6.5**
  
  - [ ]* 21.7 Write unit tests for performance optimizations
    - Test lazy loading behavior
    - Test code splitting
    - _Requirements: 6.2, 6.3, 6.5_

- [ ] 22. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 23. Create content data and configuration
  - [x] 23.1 Create content configuration file
    - Define all landing page content in `content.ts`
    - Include hero content with headline and CTAs
    - Include problem/solution content
    - Include feature descriptions
    - Include testimonials (at least 3)
    - Include metrics data
    - Include company logos
    - Include pricing plans
    - Include footer links
    - _Requirements: 2.1, 4.1, 4.2, 4.4, 5.3_
  
  - [x] 23.2 Create dialogue scenarios
    - Define at least 3 interactive dialogue scenarios
    - Include branching paths for user choices
    - Include Socratic questions and responses
    - _Requirements: 2.2, 2.6_
  
  - [x] 23.3 Create code transformation stages
    - Define code examples for transformation animation
    - Include multiple stages showing progression
    - Add Socratic annotations for each stage
    - _Requirements: 3.1, 3.5, 3.6_
  
  - [x] 23.4 Create knowledge graph data
    - Define nodes representing concepts and skills
    - Define edges showing relationships
    - Create sample learning path
    - _Requirements: 3.2_

- [ ] 24. Add error boundaries and error handling
  - [ ] 24.1 Create error boundary components
    - Implement ErrorBoundary for entire page
    - Add specific error boundaries for heavy components
    - Add retry functionality
    - Add fallback UI for errors
    - _Requirements: General error handling_
  
  - [ ] 24.2 Add error handling for async operations
    - Handle image loading errors with placeholders
    - Handle lazy loading failures with retry
    - Handle animation errors with graceful degradation
    - _Requirements: General error handling_
  
  - [ ]* 24.3 Write unit tests for error handling
    - Test error boundary behavior
    - Test error recovery
    - Test fallback UI

- [ ] 25. Implement design system compliance tests
  - [ ]* 25.1 Write property test for no emoji characters
    - **Property 1: No Emoji Characters in Rendered Output**
    - **Validates: Requirements 1.1**
  
  - [ ]* 25.2 Write property test for consistent spacing
    - **Property 2: Consistent Spacing System**
    - **Validates: Requirements 1.3**
  
  - [ ]* 25.3 Write property test for typography hierarchy
    - **Property 3: Typography Hierarchy Levels**
    - **Validates: Requirements 1.4**
  
  - [ ]* 25.4 Write property test for color palette
    - **Property 4: Consistent Color Palette Usage**
    - **Validates: Requirements 1.5**
  
  - [ ]* 25.5 Write property test for Framer Motion usage
    - **Property 27: Framer Motion Animation Usage**
    - **Validates: Requirements 10.1, 12.4**

- [ ] 26. Run TypeScript and linting validation
  - [ ] 26.1 Fix TypeScript errors
    - Run `tsc --noEmit` to check for type errors
    - Fix all type errors
    - Ensure strict mode compliance
    - _Requirements: 12.6_
  
  - [ ] 26.2 Fix linting errors
    - Run ESLint on all new files
    - Fix all linting errors and warnings
    - Ensure code style consistency
    - _Requirements: 12.6_
  
  - [ ]* 26.3 Write property test for TypeScript compliance
    - **Property 32: TypeScript and Linting Compliance**
    - **Validates: Requirements 12.6**

- [ ] 27. Final integration and polish
  - [ ] 27.1 Test full page flow
    - Test complete user journey from landing to signup
    - Test all interactive features
    - Test all navigation paths
    - Verify all CTAs work correctly
    - _Requirements: 5.1, 5.2, 5.5_
  
  - [ ] 27.2 Optimize animations and transitions
    - Fine-tune animation timing
    - Ensure smooth 60fps performance
    - Remove any janky animations
    - Test on lower-end devices
    - _Requirements: 10.1, 10.4_
  
  - [ ] 27.3 Cross-browser testing
    - Test on Chrome, Firefox, Safari
    - Test on iOS Safari and Chrome Mobile
    - Fix any browser-specific issues
    - _Requirements: 7.5_
  
  - [ ] 27.4 Performance audit
    - Run Lighthouse audit
    - Optimize bundle size if needed
    - Optimize images if needed
    - Ensure LCP, FID, CLS meet targets
    - _Requirements: 6.1, 6.4_

- [ ] 28. Final checkpoint - Ensure all tests pass
  - Run full test suite
  - Ensure 100% of property tests pass
  - Ensure >80% code coverage
  - Fix any remaining issues
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: design system → components → features → integration
- All animations use Framer Motion for consistency
- All components are TypeScript with strict typing
- Accessibility is built in from the start, not added later
- Performance optimizations are integrated throughout, not bolted on at the end
