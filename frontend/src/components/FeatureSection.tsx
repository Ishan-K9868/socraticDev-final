import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

const features = [
    {
        id: 'socratic',
        badge: 'Core Feature',
        title: 'Socratic Dialogue',
        subtitle: 'AI that teaches through questions',
        description: 'Instead of giving you the answer immediately, SocraticDev asks guiding questions that help you discover the solution yourself. This builds real understanding, not just code copying.',
        color: 'accent',
        visual: 'socratic',
    },
    {
        id: 'toggle',
        badge: 'Dual Mode',
        title: 'Learning ↔ Building',
        subtitle: 'Switch modes instantly',
        description: 'In Learning Mode, get questions and explanations. In Build Mode, get fast code generation. One toggle to switch between deep learning and rapid prototyping.',
        color: 'primary',
        visual: 'toggle',
    },
    {
        id: 'graphrag',
        badge: 'GraphRAG',
        title: 'Context-Aware AI',
        subtitle: 'Understands your entire codebase',
        description: 'Upload your project and SocraticDev builds a knowledge graph of your code. It understands dependencies, function calls, and can answer "What breaks if I change this?"',
        color: 'secondary',
        visual: 'graph',
    },
    {
        id: 'quality',
        badge: 'Quality',
        title: 'Real-Time Verification',
        subtitle: 'Catches bugs before they ship',
        description: 'Every code suggestion is validated with syntax checking, linting, type verification, and security analysis. See confidence scores and explanations for every piece of code.',
        color: 'success',
        visual: 'quality',
    },
];

function FeatureSection() {
    const containerRef = useRef<HTMLElement>(null);
    const horizontalRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!horizontalRef.current) return;

        const mm = gsap.matchMedia();

        mm.add('(min-width: 1024px)', () => {
            // Horizontal scroll on desktop
            const panels = gsap.utils.toArray<HTMLElement>('.feature-panel');

            if (panels.length === 0) return;

            // Create the main horizontal scroll animation
            const horizontalScroll = gsap.to(panels, {
                xPercent: -100 * (panels.length - 1),
                ease: 'none',
                scrollTrigger: {
                    trigger: horizontalRef.current,
                    pin: true,
                    scrub: 1,
                    end: () => '+=' + (horizontalRef.current?.offsetWidth || 0) * 1.5,
                    anticipatePin: 1,
                },
            });

            // Get the ScrollTrigger instance from the animation
            const scrollTriggerInstance = horizontalScroll.scrollTrigger;

            // Animate content within each panel - using simple scroll triggers per panel
            panels.forEach((panel, i) => {
                const content = panel.querySelectorAll('.panel-content > *');
                const visual = panel.querySelector('.panel-visual');

                // Simple fade in for each panel's content
                if (content.length > 0) {
                    gsap.from(content, {
                        opacity: 0,
                        x: 40,
                        stagger: 0.1,
                        duration: 0.8,
                        scrollTrigger: {
                            trigger: panel,
                            start: `left ${80 - i * 10}%`,
                            end: `left ${50 - i * 10}%`,
                            scrub: 1,
                            containerAnimation: scrollTriggerInstance ? horizontalScroll : undefined,
                        },
                    });
                }

                if (visual) {
                    gsap.from(visual, {
                        scale: 0.85,
                        opacity: 0,
                        duration: 0.8,
                        scrollTrigger: {
                            trigger: panel,
                            start: `left ${70 - i * 10}%`,
                            end: `left ${40 - i * 10}%`,
                            scrub: 1,
                            containerAnimation: scrollTriggerInstance ? horizontalScroll : undefined,
                        },
                    });
                }
            });

            return () => {
                // Cleanup
                ScrollTrigger.getAll().forEach(st => st.kill());
            };
        });

        mm.add('(max-width: 1023px)', () => {
            // Vertical scroll on mobile - simpler animations
            const panels = gsap.utils.toArray<HTMLElement>('.feature-panel');

            panels.forEach((panel) => {
                gsap.from(panel, {
                    opacity: 0,
                    y: 40,
                    duration: 0.8,
                    scrollTrigger: {
                        trigger: panel,
                        start: 'top 85%',
                        end: 'top 60%',
                        scrub: 1,
                    },
                });
            });
        });

    }, { scope: containerRef });

    const renderVisual = (visual: string) => {
        switch (visual) {
            case 'socratic':
                return (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <div className="max-w-[75%] p-4 rounded-2xl rounded-tr-sm bg-primary-500 text-white text-sm">
                                How do I implement binary search?
                            </div>
                        </div>
                        <div className="flex justify-start">
                            <div className="max-w-[85%] p-4 rounded-2xl rounded-tl-sm bg-accent-500/10 border border-accent-500/30">
                                <p className="text-sm font-medium text-accent-600 dark:text-accent-400 mb-2">
                                    🤔 Let's think about this...
                                </p>
                                <p className="text-sm text-[color:var(--color-text-secondary)]">
                                    What property must the data have for binary search to work?
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <div className="max-w-[60%] p-4 rounded-2xl rounded-tr-sm bg-[color:var(--color-bg-muted)] text-sm">
                                It needs to be sorted?
                            </div>
                        </div>
                        <div className="flex justify-start">
                            <div className="max-w-[85%] p-4 rounded-2xl rounded-tl-sm bg-accent-500/10 border border-accent-500/30">
                                <p className="text-sm text-accent-600 dark:text-accent-400">
                                    ✨ Exactly! Now why does that matter...?
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'toggle':
                return (
                    <div className="space-y-6">
                        <div className="p-4 rounded-xl bg-accent-500/10 border border-accent-500/30">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-xl">🎓</span>
                                <span className="font-medium text-accent-600 dark:text-accent-400">Learning Mode</span>
                            </div>
                            <ul className="text-sm space-y-2 text-[color:var(--color-text-secondary)]">
                                <li>• Questions before answers</li>
                                <li>• Step-by-step guidance</li>
                                <li>• Concept explanations</li>
                            </ul>
                        </div>
                        <div className="flex justify-center">
                            <div className="w-16 h-8 rounded-full bg-gradient-to-r from-accent-500 to-secondary-500 relative p-1">
                                <div className="absolute inset-y-1 left-1 w-6 h-6 rounded-full bg-white shadow animate-pulse" />
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-secondary-500/10 border border-secondary-500/30">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-xl">🚀</span>
                                <span className="font-medium text-secondary-600 dark:text-secondary-400">Build Mode</span>
                            </div>
                            <ul className="text-sm space-y-2 text-[color:var(--color-text-secondary)]">
                                <li>• Fast code generation</li>
                                <li>• Minimal explanations</li>
                                <li>• Autocomplete suggestions</li>
                            </ul>
                        </div>
                    </div>
                );

            case 'graph':
                return (
                    <div className="relative h-64">
                        <svg viewBox="0 0 200 150" className="w-full h-full">
                            {/* Connections */}
                            <line x1="100" y1="30" x2="40" y2="75" stroke="currentColor" className="text-secondary-400" strokeWidth="2" />
                            <line x1="100" y1="30" x2="160" y2="75" stroke="currentColor" className="text-secondary-400" strokeWidth="2" />
                            <line x1="40" y1="75" x2="30" y2="120" stroke="currentColor" className="text-secondary-300" strokeWidth="1.5" />
                            <line x1="40" y1="75" x2="70" y2="120" stroke="currentColor" className="text-secondary-300" strokeWidth="1.5" />
                            <line x1="160" y1="75" x2="140" y2="120" stroke="currentColor" className="text-secondary-300" strokeWidth="1.5" />
                            <line x1="160" y1="75" x2="175" y2="120" stroke="currentColor" className="text-secondary-300" strokeWidth="1.5" />

                            {/* Nodes */}
                            <circle cx="100" cy="30" r="15" className="fill-secondary-500" />
                            <circle cx="40" cy="75" r="12" className="fill-secondary-400" />
                            <circle cx="160" cy="75" r="12" className="fill-secondary-400" />
                            <circle cx="30" cy="120" r="8" className="fill-secondary-300" />
                            <circle cx="70" cy="120" r="8" className="fill-secondary-300" />
                            <circle cx="140" cy="120" r="8" className="fill-secondary-300" />
                            <circle cx="175" cy="120" r="8" className="fill-secondary-300" />

                            {/* Labels */}
                            <text x="100" y="35" textAnchor="middle" className="fill-white text-[8px] font-mono">main.py</text>
                            <text x="40" y="80" textAnchor="middle" className="fill-white text-[6px] font-mono">auth</text>
                            <text x="160" y="80" textAnchor="middle" className="fill-white text-[6px] font-mono">api</text>
                        </svg>
                        <div className="absolute bottom-0 left-0 right-0 text-center">
                            <Badge variant="secondary">12 files • 47 functions • 128 connections</Badge>
                        </div>
                    </div>
                );

            case 'quality':
                return (
                    <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-success/10 border border-success/30 flex items-center gap-3">
                            <span className="text-success text-lg">✓</span>
                            <div>
                                <p className="text-sm font-medium">Syntax Valid</p>
                                <p className="text-xs text-[color:var(--color-text-muted)]">No syntax errors detected</p>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-success/10 border border-success/30 flex items-center gap-3">
                            <span className="text-success text-lg">✓</span>
                            <div>
                                <p className="text-sm font-medium">Type Safe</p>
                                <p className="text-xs text-[color:var(--color-text-muted)]">TypeScript types verified</p>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-center gap-3">
                            <span className="text-warning text-lg">⚠</span>
                            <div>
                                <p className="text-sm font-medium">Linting Warning</p>
                                <p className="text-xs text-[color:var(--color-text-muted)]">Consider using const instead of let</p>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-success/10 border border-success/30 flex items-center gap-3">
                            <span className="text-success text-lg">✓</span>
                            <div>
                                <p className="text-sm font-medium">Security Scan</p>
                                <p className="text-xs text-[color:var(--color-text-muted)]">No vulnerabilities found</p>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-[color:var(--color-bg-muted)]">
                            <span className="text-sm font-medium">Confidence Score</span>
                            <span className="text-lg font-bold text-success">94%</span>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <section
            ref={containerRef}
            id="features"
            className="relative overflow-hidden"
        >
            {/* Section Header (before horizontal scroll) */}
            <div className="section-padding pb-8 lg:pb-16">
                <div className="container-custom text-center">
                    <Badge variant="primary" className="mb-4">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Features
                    </Badge>
                    <h2 className="font-display text-display-md font-bold mb-4">
                        Everything you need to{' '}
                        <span className="text-gradient-primary">learn smarter</span>
                    </h2>
                    <p className="text-lg text-[color:var(--color-text-secondary)] max-w-2xl mx-auto">
                        Four powerful features that transform how you interact with AI for coding.
                    </p>
                </div>
            </div>

            {/* Horizontal Scroll Container */}
            <div
                ref={horizontalRef}
                className="lg:flex lg:w-max"
            >
                {features.map((feature, index) => (
                    <div
                        key={feature.id}
                        className={`feature-panel lg:w-screen lg:h-screen lg:flex-shrink-0 flex items-center py-16 lg:py-0
                       ${index > 0 ? 'lg:border-l border-[color:var(--color-border)]' : ''}`}
                    >
                        <div className="container-custom">
                            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                                {/* Content */}
                                <div className={`panel-content ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                                    <Badge
                                        variant={feature.color === 'accent' ? 'accent' :
                                            feature.color === 'primary' ? 'primary' :
                                                feature.color === 'secondary' ? 'secondary' :
                                                    'success'}
                                        className="mb-4"
                                    >
                                        {feature.badge}
                                    </Badge>
                                    <h3 className="font-display text-display-sm font-bold mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-lg font-medium text-[color:var(--color-text-secondary)] mb-4">
                                        {feature.subtitle}
                                    </p>
                                    <p className="text-[color:var(--color-text-secondary)] leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>

                                {/* Visual */}
                                <div className={`panel-visual ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                                    <Card padding="lg" className="shadow-elevated">
                                        {renderVisual(feature.visual)}
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Scroll hint - desktop only */}
            <div className="hidden lg:flex items-center justify-center gap-2 py-8 text-sm text-[color:var(--color-text-muted)]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                Scroll to explore features
            </div>
        </section>
    );
}

export default FeatureSection;
