# Requirements Document: SocraticDev Landing Page - Premium Animation System

## Introduction

This document specifies the requirements for transforming the SocraticDev landing page into a world-class, highly interactive experience using Framer Motion. The goal is to create animations that are 100x more engaging than the current basic implementation, while maintaining excellent performance and Vercel deployment compatibility.

## Glossary

- **Framer Motion**: React animation library for production-ready animations
- **Scroll-Triggered Animation**: Animation that activates when element enters viewport
- **Stagger**: Sequential delay between multiple element animations
- **Parallax**: Elements moving at different speeds creating depth
- **Viewport Trigger**: Animation starts when element is visible in viewport
- **Spring Physics**: Natural, bouncy animation easing
- **Gesture**: User interaction (hover, tap, drag)
- **Variant**: Named animation state in Framer Motion
- **whileInView**: Framer Motion prop for scroll-triggered animations
- **Motion Value**: Animated value that can be tracked and transformed

## Current State Analysis

### Hero Section (Hero.tsx)
✅ **Already Using Framer Motion**:
- Basic entrance animations (fade, scale, stagger)
- Hover effects on cards
- Continuous animations (pulse, float)

❌ **Missing**:
- Mouse parallax on floating cards
- Character-by-character text reveal
- Interactive cursor effects
- Magnetic button effects
- Advanced SVG path animations

### Other Sections
❌ **No Scroll Animations**:
- Problem Section: Static cards, no reveal
- Solution Section: No feature animations
- Features Section: No grid reveal effects
- HowItWorks Section: No timeline drawing
- TechStack Section: No layer reveals
- Dojo Section: No card flip effects
- CTA Section: No attention-grabbing effects
- Footer: Static links and icons

## Requirements

### Requirement 1: Hero Section - Premium Entrance Experience

**User Story:** As a visitor, I want to be immediately captivated by a stunning hero animation that feels premium and polished.

#### Acceptance Criteria

1.1. **Text Split Reveal**
- WHEN the page loads, THE hero title SHALL reveal character-by-character with stagger
- EACH character SHALL fade in with slight rotation and scale
- THE animation SHALL complete in 1.2 seconds with spring physics
- THE subtitle SHALL follow with word-by-word reveal

1.2. **Floating Card Parallax**
- WHEN the user moves their mouse, THE floating cards SHALL move in parallax
- EACH card SHALL have different parallax depth (20px, 30px, 40px)
- THE movement SHALL be smooth with 0.3s spring transition
- ON mobile, cards SHALL have subtle auto-floating animation

1.3. **SVG Path Drawing**
- WHEN the dependency graph appears, THE connection lines SHALL draw from start to end
- THE animation SHALL use pathLength from 0 to 1
- EACH line SHALL have 0.1s stagger delay
- THE nodes SHALL pulse when their line completes

1.4. **Gradient Background Shift**
- THE background gradient SHALL slowly shift position
- THE animation SHALL be infinite with 8s duration
- THE movement SHALL be subtle (10% translation)
- THE effect SHALL create ambient motion

1.5. **Badge Glow Pulse**
- THE "AI + Socratic Method" badge SHALL have pulsing glow
- THE glow SHALL scale from 1 to 1.2 with 2s duration
- THE animation SHALL repeat infinitely
- THE pulse SHALL be synchronized with badge appearance

1.6. **Stats Counter Animation**
- WHEN stats enter viewport, NUMBERS SHALL count up from 0
- THE counter SHALL use spring physics for natural deceleration
- EACH stat SHALL have 0.1s stagger delay
- THE animation SHALL complete in 1.5 seconds

### Requirement 2: Problem Section - Dramatic Problem Reveal

**User Story:** As a visitor, I want to feel the pain points through impactful animations that emphasize the problems.

#### Acceptance Criteria

2.1. **Scroll-Triggered Card Reveal**
- WHEN section enters viewport (20% visible), CARDS SHALL reveal
- EACH card SHALL fade in from opacity 0 to 1
- EACH card SHALL slide up 60px with scale from 0.9 to 1
- CARDS SHALL stagger with 0.15s delay between each

2.2. **Warning Icon Shake**
- WHEN each card appears, THE warning icon SHALL shake
- THE shake SHALL rotate ±5 degrees 3 times
- THE animation SHALL use spring physics
- THE shake SHALL complete in 0.6 seconds

2.3. **Stat Counter with Progress Bar**
- WHEN stat cards appear, NUMBERS SHALL count up (67%, 83%, 94%, 19%)
- A progress bar SHALL fill horizontally matching the percentage
- THE bar SHALL use scaleX from 0 to target percentage
- THE animation SHALL have 1.5s duration with ease-out

2.4. **Hover Tilt Effect**
- WHEN user hovers over card, CARD SHALL tilt in 3D
- THE tilt SHALL be based on mouse position (±10 degrees)
- THE card SHALL scale to 1.05
- THE transition SHALL be smooth with 0.3s spring

### Requirement 3: Solution Section - Feature Showcase

**User Story:** As a visitor, I want to see the solution features come alive with engaging animations.

#### Acceptance Criteria

3.1. **Feature Pills Slide-In**
- WHEN section enters viewport, FEATURE pills SHALL slide in
- ODD pills SHALL slide from left (-100px)
- EVEN pills SHALL slide from right (100px)
- PILLS SHALL stagger with 0.1s delay

3.2. **Code Demo Typing Effect**
- WHEN code block appears, TEXT SHALL type character-by-character
- THE typing SHALL have 0.05s delay per character
- A blinking cursor SHALL appear at the end
- THE animation SHALL loop after 3s pause

3.3. **Mode Toggle Animation**
- THE mode switch SHALL animate between states
- THE toggle SHALL slide with spring physics
- THE background SHALL change color with 0.3s transition
- ICONS SHALL rotate 180° when switching

3.4. **Connection Lines Drawing**
- SVG lines connecting features SHALL draw progressively
- LINES SHALL use pathLength animation from 0 to 1
- EACH line SHALL have 0.2s stagger
- NODES SHALL pulse when line reaches them

### Requirement 4: Features Section - 3D Card Grid

**User Story:** As a visitor, I want to explore features through an interactive 3D card grid.

#### Acceptance Criteria

4.1. **Grid Reveal with 3D Rotation**
- WHEN grid enters viewport, CARDS SHALL reveal with 3D rotation
- EACH card SHALL rotate from rotateY(-90deg) to 0
- CARDS SHALL stagger in grid pattern (0.05s per card)
- THE animation SHALL use spring physics

4.2. **Icon Bounce Entrance**
- WHEN each card appears, THE icon SHALL bounce in
- THE icon SHALL scale from 0 to 1 with overshoot
- THE bounce SHALL use spring(1, 0.5) physics
- THE icon SHALL rotate 360° during entrance

4.3. **Hover 3D Tilt**
- WHEN user hovers card, CARD SHALL tilt based on mouse position
- THE tilt SHALL be ±15 degrees on X and Y axes
- THE card SHALL have perspective: 1000px
- THE transition SHALL be smooth with 0.2s duration

4.4. **Feature Number Scale**
- THE feature number badge SHALL scale in after card
- THE number SHALL scale from 0 to 1 with elastic bounce
- THE animation SHALL have 0.2s delay after card appears
- THE number SHALL pulse on hover

### Requirement 5: HowItWorks Section - Animated Timeline

**User Story:** As a visitor, I want to see the process unfold through an animated timeline.

#### Acceptance Criteria

5.1. **Timeline Path Drawing**
- WHEN section enters viewport, THE connecting line SHALL draw
- THE line SHALL use pathLength from 0 to 1
- THE animation SHALL have 2s duration
- THE line SHALL be synchronized with step reveals

5.2. **Step Counter Sequential Pop**
- STEP numbers SHALL pop in sequentially (1, 2, 3, 4)
- EACH number SHALL scale from 0 to 1 with spring
- NUMBERS SHALL have 0.3s stagger delay
- EACH number SHALL have glow effect on appear

5.3. **Arrow Animation**
- DIRECTIONAL arrows SHALL animate in after each step
- ARROWS SHALL slide in from direction they point
- ARROWS SHALL have 0.2s delay after step number
- ARROWS SHALL pulse subtly in infinite loop

5.4. **Icon Rotation Reveal**
- STEP icons SHALL rotate 360° while fading in
- THE rotation SHALL have 0.8s duration
- ICONS SHALL have 0.15s stagger
- ICONS SHALL scale from 0.8 to 1 during rotation

### Requirement 6: TechStack Section - Layer Reveal

**User Story:** As a visitor, I want to see the technology stack build up layer by layer.

#### Acceptance Criteria

6.1. **Layer Stack Animation**
- LAYERS SHALL stack from bottom to top
- EACH layer SHALL slide up 100px while fading in
- LAYERS SHALL have 0.2s stagger delay
- THE animation SHALL use ease-out timing

6.2. **Tech Badge Scatter**
- TECH badges SHALL scatter in from random positions
- EACH badge SHALL start from random angle (0-360°)
- BADGES SHALL move from 200px distance to final position
- BADGES SHALL have 0.05s stagger with spring physics

6.3. **Circuit Line Pulse**
- DECORATIVE circuit lines SHALL pulse with light
- THE pulse SHALL travel along the path
- THE animation SHALL use gradient offset animation
- THE pulse SHALL repeat infinitely with 3s duration

6.4. **Tooltip Smooth Reveal**
- WHEN user hovers tech badge, TOOLTIP SHALL appear
- TOOLTIP SHALL fade in and slide up 10px
- THE animation SHALL have 0.2s duration
- TOOLTIP SHALL have slight scale from 0.95 to 1

### Requirement 7: Dojo Section - Interactive Challenge Cards

**User Story:** As a visitor, I want to interact with challenge cards through engaging flip animations.

#### Acceptance Criteria

7.1. **Card 3D Flip**
- WHEN user clicks card, CARD SHALL flip 180° on Y-axis
- THE flip SHALL reveal back content
- THE animation SHALL have 0.6s duration with ease-in-out
- THE card SHALL have perspective: 1000px

7.2. **Progress Ring Animation**
- CIRCULAR progress rings SHALL animate from 0% to target
- THE animation SHALL use pathLength for SVG circle
- RINGS SHALL have 1.5s duration with ease-out
- EACH ring SHALL have 0.1s stagger delay

7.3. **Belt Slide Animation**
- THE skill belt SHALL slide in from left
- THE belt SHALL have -100% translateX to 0
- THE animation SHALL have 0.8s duration
- BELT items SHALL stagger in after belt appears

7.4. **Active Card Glow**
- THE active challenge card SHALL have pulsing glow
- THE glow SHALL scale from 1 to 1.1
- THE animation SHALL repeat infinitely with 2s duration
- THE glow SHALL be primary color with blur

### Requirement 8: CTA Section - Attention-Grabbing Effects

**User Story:** As a visitor, I want to be compelled to take action through eye-catching CTA animations.

#### Acceptance Criteria

8.1. **Button Pulse Animation**
- THE primary CTA button SHALL pulse continuously
- THE pulse SHALL scale from 1 to 1.05
- THE animation SHALL have 2s duration
- THE pulse SHALL have glow shadow effect

8.2. **Star Burst Effect**
- WHEN section enters viewport, STARS SHALL burst outward
- STARS SHALL start from center and move to random positions
- EACH star SHALL rotate while moving
- STARS SHALL have 1s duration with ease-out

8.3. **Rocket Launch Animation**
- A decorative rocket SHALL float upward
- THE rocket SHALL move up 30px repeatedly
- THE animation SHALL have 3s duration
- THE rocket SHALL have slight rotation wobble

8.4. **Shimmer Cross-Button**
- A shimmer effect SHALL sweep across button
- THE shimmer SHALL use gradient animation
- THE animation SHALL trigger on scroll-in
- THE shimmer SHALL repeat every 5 seconds

### Requirement 9: Footer - Polished Exit Experience

**User Story:** As a visitor, I want the footer to feel complete with smooth reveal animations.

#### Acceptance Criteria

9.1. **Link Column Stagger**
- LINK columns SHALL reveal with stagger
- EACH column SHALL fade in and slide up 30px
- COLUMNS SHALL have 0.15s stagger delay
- THE animation SHALL have 0.6s duration

9.2. **Social Icon Bounce**
- SOCIAL icons SHALL bounce in with spring physics
- EACH icon SHALL scale from 0 to 1
- ICONS SHALL have 0.1s stagger delay
- ICONS SHALL have elastic bounce effect

9.3. **Newsletter Input Glow**
- THE newsletter input SHALL glow when section enters viewport
- THE glow SHALL pulse 2 times
- THE animation SHALL have 0.3s per pulse
- THE glow SHALL be accent color

9.4. **Logo Subtle Pulse**
- THE footer logo SHALL pulse subtly
- THE pulse SHALL scale from 1 to 1.02
- THE animation SHALL repeat infinitely with 4s duration
- THE pulse SHALL be barely noticeable (ambient)

### Requirement 10: Performance & Optimization

**User Story:** As a visitor, I want smooth animations that don't lag or stutter on any device.

#### Acceptance Criteria

10.1. **GPU Acceleration**
- ALL animations SHALL use transform and opacity only
- NO animations SHALL use width, height, top, left, margin
- ALL animated elements SHALL have will-change when animating
- TRANSFORMS SHALL use translate3d for GPU acceleration

10.2. **Mobile Optimization**
- ON mobile devices, ANIMATION distances SHALL be reduced by 50%
- ON mobile devices, ANIMATION durations SHALL be reduced by 30%
- COMPLEX parallax effects SHALL be disabled on mobile
- PARTICLE effects SHALL have reduced count on mobile

10.3. **Reduced Motion Support**
- WHEN user has prefers-reduced-motion enabled, ANIMATIONS SHALL be minimal
- ONLY fade and simple transitions SHALL be used
- NO rotation, scale, or complex transforms SHALL occur
- ANIMATIONS SHALL have 0.2s duration maximum

10.4. **Lazy Animation Loading**
- ANIMATIONS SHALL only initialize when section is near viewport
- SCROLL listeners SHALL be throttled to 16ms (60fps)
- ANIMATION cleanup SHALL occur when component unmounts
- NO memory leaks SHALL occur from animation instances

### Requirement 11: Interactive Cursor Effects (Desktop Only)

**User Story:** As a desktop visitor, I want a custom cursor that enhances interactivity.

#### Acceptance Criteria

11.1. **Custom Cursor Follow**
- A custom cursor SHALL follow mouse position
- THE cursor SHALL have 0.1s smooth follow delay
- THE cursor SHALL be a 20px circle with blur
- THE cursor SHALL be primary color with 50% opacity

11.2. **Cursor Grow on Hover**
- WHEN hovering interactive elements, CURSOR SHALL grow
- THE cursor SHALL scale to 2x size
- THE transition SHALL have 0.2s duration
- THE cursor SHALL change color to accent

11.3. **Magnetic Button Effect**
- WHEN cursor is near button (50px), BUTTON SHALL move toward cursor
- THE button SHALL move maximum 20px
- THE effect SHALL have 0.3s spring transition
- THE button SHALL return to position when cursor leaves

11.4. **Cursor Trail Effect**
- CURSOR SHALL leave fading trail particles
- PARTICLES SHALL fade out over 0.5s
- MAXIMUM 10 particles SHALL exist at once
- PARTICLES SHALL be small circles (5px)

### Requirement 12: Micro-Interactions

**User Story:** As a visitor, I want delightful micro-interactions that make the site feel alive.

#### Acceptance Criteria

12.1. **Button Hover Effects**
- BUTTONS SHALL scale to 1.05 on hover
- BUTTONS SHALL have shadow increase on hover
- THE transition SHALL have 0.2s duration
- BUTTONS SHALL have slight rotation (2deg) on hover

12.2. **Card Hover Lift**
- CARDS SHALL lift (translateY: -10px) on hover
- CARDS SHALL have shadow increase
- THE transition SHALL have 0.3s spring
- CARDS SHALL have subtle glow effect

12.3. **Icon Spin on Hover**
- ICONS SHALL rotate 360° on hover
- THE rotation SHALL have 0.5s duration
- THE rotation SHALL use ease-in-out
- ICONS SHALL scale to 1.1 during rotation

12.4. **Link Underline Animation**
- LINKS SHALL have animated underline on hover
- THE underline SHALL grow from left to right
- THE animation SHALL use scaleX from 0 to 1
- THE animation SHALL have 0.3s duration

### Requirement 13: Scroll Progress Indicator

**User Story:** As a visitor, I want to see my progress through the landing page.

#### Acceptance Criteria

13.1. **Progress Bar**
- A progress bar SHALL appear at top of page
- THE bar SHALL fill based on scroll position (0-100%)
- THE bar SHALL use scaleX animation
- THE bar SHALL be 3px height with primary color

13.2. **Section Indicators**
- SECTION dots SHALL appear on right side
- ACTIVE section dot SHALL be highlighted
- DOTS SHALL have smooth transition between sections
- CLICKING dot SHALL scroll to that section

### Requirement 14: Vercel Deployment Compatibility

**User Story:** As a developer, I want animations to work perfectly on Vercel without any issues.

#### Acceptance Criteria

14.1. **No GSAP Dependencies**
- THE project SHALL use ONLY Framer Motion
- NO GSAP libraries SHALL be imported
- ALL animations SHALL be Framer Motion compatible
- THE build SHALL succeed on Vercel

14.2. **Bundle Size Optimization**
- FRAMER Motion SHALL be tree-shaken
- ONLY used Framer Motion features SHALL be imported
- THE animation bundle SHALL be < 50KB gzipped
- LAZY loading SHALL be used for heavy animations

14.3. **SSR Compatibility**
- ANIMATIONS SHALL not break during server-side rendering
- WINDOW/DOCUMENT checks SHALL be present where needed
- ANIMATIONS SHALL initialize only on client side
- NO hydration errors SHALL occur

## Animation Timing Guidelines

| Animation Type | Duration | Easing | Use Case |
|---------------|----------|--------|----------|
| Fade/Reveal | 0.6-0.8s | ease-out | Section entrances |
| Scale | 0.5-0.7s | spring(1, 0.6) | Cards, icons |
| Slide | 0.7-1.0s | ease-out | Panels, modals |
| Counter | 1.5-2.0s | ease-out | Number animations |
| Stagger Delay | 0.1-0.15s | - | Multiple elements |
| Hover | 0.2-0.3s | spring | Interactive elements |
| Micro | 0.15-0.25s | ease-in-out | Small interactions |
| Ambient | 3-8s | ease-in-out | Background effects |

## Success Metrics

1. **Performance**: All animations maintain 60fps on desktop, 30fps on mobile
2. **Engagement**: Time on page increases by 50%
3. **Smoothness**: No jank or stuttering during scroll
4. **Compatibility**: Works on Chrome, Firefox, Safari, Edge (latest 2 versions)
5. **Mobile**: Animations work smoothly on iPhone 12+ and Android flagship devices
6. **Bundle Size**: Total animation code < 50KB gzipped
7. **Accessibility**: Respects prefers-reduced-motion setting
8. **Vercel**: Deploys successfully with no errors
