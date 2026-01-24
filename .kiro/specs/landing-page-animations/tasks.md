# Tasks: SocraticDev Landing Page - Premium Animation System

## Phase 1: Foundation

- [x] 1. Create Custom Hooks
  - [x] 1.1 Create useReducedMotion hook in `frontend/src/hooks/useReducedMotion.ts`
  - [x] 1.2 Create useMouseParallax hook in `frontend/src/hooks/useMouseParallax.ts`
  - [x] 1.3 Create useInViewAnimation hook in `frontend/src/hooks/useInViewAnimation.ts`
  - [x] 1.4 Create useDeviceType hook in `frontend/src/hooks/useDeviceType.ts`

- [x] 2. Create Shared Animation Variants
  - [x] 2.1 Create animationVariants.ts in `frontend/src/utils/`
  - [x] 2.2 Define fadeInUp, fadeInLeft, fadeInRight variants
  - [x] 2.3 Define scaleIn, rotateIn variants
  - [x] 2.4 Define staggerContainer and staggerItem variants
  - [x] 2.5 Export all variants with TypeScript types

- [ ] 3. Set Up Performance Monitoring
  - [ ] 3.1 Add performance monitoring utilities
  - [ ] 3.2 Configure Vite for optimal Framer Motion tree-shaking
  - [ ] 3.3 Test bundle size impact

## Phase 2: Core Sections

- [x] 4. Implement Problem Section Animations
  - [x] 4.1 Add scroll-triggered header reveal animation
  - [x] 4.2 Add staggered problem card reveals with scale and fade
  - [x] 4.3 Add warning icon shake animation on card appear
  - [x] 4.4 Implement stat counter animation with useMotionValue
  - [x] 4.5 Add hover 3D tilt effect to cards
  - [x] 4.6 Test animations with reduced motion preference

- [x] 5. Implement Solution Section Animations
  - [x] 5.1 Add alternating slide-in for feature pills (odd from left, even from right)
  - [x] 5.2 Implement typing effect for code demo
  - [x] 5.3 Add mode toggle spring animation
  - [x] 5.4 Add product mockup scale-in reveal
  - [x] 5.5 Test on mobile devices

- [x] 6. Implement Features Section Animations
  - [x] 6.1 Add 3D rotation reveal for feature cards grid
  - [x] 6.2 Implement icon bounce entrance with rotation
  - [x] 6.3 Add hover 3D tilt based on mouse position
  - [x] 6.4 Add feature number badge scale animation
  - [x] 6.5 Test grid stagger timing

- [x] 7. Implement How It Works Section Animations
  - [x] 7.1 Add SVG timeline path drawing animation
  - [x] 7.2 Implement sequential step number pop with spring
  - [x] 7.3 Add arrow slide and pulse animations
  - [x] 7.4 Add icon rotation reveal (360° spin)
  - [x] 7.5 Synchronize timeline with step reveals

## Phase 3: Advanced Sections

- [x] 8. Implement Tech Stack Section Animations
  - [x] 8.1 Add layer-by-layer stack animation (bottom to top)
  - [x] 8.2 Implement tech badge scatter from random angles
  - [x] 8.3 Add circuit line pulse animation with gradient
  - [x] 8.4 Add tooltip smooth reveal on hover
  - [x] 8.5 Test badge scatter performance

- [x] 9. Implement Dojo Section Animations
  - [x] 9.1 Add 3D card flip animation on click
  - [x] 9.2 Implement circular progress ring animation
  - [x] 9.3 Add belt slide animation with staggered items
  - [x] 9.4 Add active card pulsing glow effect
  - [x] 9.5 Test flip animation smoothness

- [x] 10. Implement CTA Section Animations
  - [x] 10.1 Add button pulse animation with shadow rings
  - [x] 10.2 Implement star burst effect on section enter
  - [x] 10.3 Add rocket launch floating animation
  - [x] 10.4 Add shimmer sweep across button
  - [x] 10.5 Test attention-grabbing effectiveness

## Phase 4: Polish

- [x] 11. Implement Footer Section Animations
  - [x] 11.1 Add link column stagger reveal
  - [x] 11.2 Implement social icon bounce entrance
  - [x] 11.3 Add newsletter input glow pulse
  - [x] 11.4 Add logo subtle pulse animation
  - [x] 11.5 Test footer animations on scroll

- [x] 12. Add Custom Cursor (Desktop Only)
  - [x] 12.1 Create CustomCursor component in `frontend/src/components/`
  - [x] 12.2 Implement mouse follow with spring physics
  - [x] 12.3 Add cursor grow on hover interactive elements
  - [x] 12.4 Add magnetic button effect
  - [x] 12.5 Add cursor trail particles
  - [x] 12.6 Disable on mobile/tablet devices

- [x] 13. Add Scroll Progress & Section Indicators
  - [x] 13.1 Create ScrollProgress component
  - [x] 13.2 Implement progress bar with useScroll and useSpring
  - [x] 13.3 Create SectionIndicators component
  - [x] 13.4 Implement active section detection with IntersectionObserver
  - [x] 13.5 Add smooth scroll to section on indicator click
  - [x] 13.6 Integrate into LandingPage.tsx

## Phase 5: Hero Enhancements

- [x] 14. Enhance Hero Section
  - [x] 14.1 Add mouse parallax to floating cards using useMouseParallax
  - [x] 14.2 Implement character-by-character text reveal for headline
  - [x] 14.3 Add SVG path drawing for dependency graph connection lines
  - [x] 14.4 Add node pulse when connection line completes
  - [x] 14.5 Test parallax effect smoothness

## Phase 6: Optimization & Testing

- [ ] 15. Mobile Optimization
  - [ ] 15.1 Reduce animation distances by 50% on mobile
  - [ ] 15.2 Reduce animation durations by 30% on mobile
  - [ ] 15.3 Disable complex parallax effects on mobile
  - [ ] 15.4 Reduce particle counts on mobile
  - [ ] 15.5 Test on iPhone and Android devices

- [ ] 16. Performance Testing & Optimization
  - [ ] 16.1 Test FPS during scroll (target: 60fps desktop, 30fps mobile)
  - [ ] 16.2 Measure bundle size (target: < 50KB gzipped)
  - [ ] 16.3 Run Lighthouse performance audit
  - [ ] 16.4 Test with Chrome DevTools Performance tab
  - [ ] 16.5 Optimize any bottlenecks found

- [ ] 17. Accessibility Testing
  - [ ] 17.1 Test with prefers-reduced-motion enabled
  - [ ] 17.2 Test keyboard navigation with animations
  - [ ] 17.3 Test with screen readers
  - [ ] 17.4 Verify focus indicators visible during animations
  - [ ] 17.5 Add ARIA labels where needed

- [ ] 18. Cross-Browser Testing
  - [ ] 18.1 Test on Chrome (latest 2 versions)
  - [ ] 18.2 Test on Firefox (latest 2 versions)
  - [ ] 18.3 Test on Safari (latest 2 versions)
  - [ ] 18.4 Test on Edge (latest 2 versions)
  - [ ] 18.5 Fix any browser-specific issues

- [ ] 19. Vercel Deployment Testing
  - [ ] 19.1 Build project locally and verify no errors
  - [ ] 19.2 Deploy to Vercel preview environment
  - [ ] 19.3 Test animations on deployed site
  - [ ] 19.4 Verify no SSR hydration errors
  - [ ] 19.5 Check production bundle size

- [ ] 20. Final Polish & Documentation
  - [ ] 20.1 Review all animations for consistency
  - [ ] 20.2 Fine-tune timing and easing
  - [ ] 20.3 Add code comments for complex animations
  - [ ] 20.4 Update README with animation documentation
  - [ ] 20.5 Create animation showcase video/GIF

