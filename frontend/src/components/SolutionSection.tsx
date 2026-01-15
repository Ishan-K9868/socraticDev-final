import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

const features = [
    {
        id: 'socratic',
        icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        title: 'Socratic Dialogue',
        shortDesc: 'AI asks questions before giving answers',
        color: 'accent',
    },
    {
        id: 'graphrag',
        icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
        ),
        title: 'GraphRAG',
        shortDesc: 'Understands your entire codebase',
        color: 'secondary',
    },
    {
        id: 'modes',
        icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
        ),
        title: 'Dual Modes',
        shortDesc: 'Toggle between Learning and Building',
        color: 'primary',
    },
];

function SolutionSection() {
    const containerRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        // Set perspective for 3D effects
        gsap.set('.solution-container', { perspective: 1500 });

        // Animate header
        gsap.from('.solution-header', {
            opacity: 0,
            y: 40,
            scrollTrigger: {
                trigger: '.solution-header',
                start: 'top 80%',
                end: 'top 60%',
                scrub: 1,
            },
        });

        // Animate mockup with 3D rotation
        gsap.from('.product-mockup', {
            rotationY: -25,
            rotationX: 10,
            scale: 0.8,
            opacity: 0,
            scrollTrigger: {
                trigger: '.product-mockup',
                start: 'top 70%',
                end: 'center center',
                scrub: 1.5,
            },
        });

        // Animate feature pills
        gsap.from('.feature-pill', {
            scale: 0,
            opacity: 0,
            rotation: -15,
            stagger: 0.15,
            scrollTrigger: {
                trigger: '.feature-pills',
                start: 'top 75%',
                end: 'top 55%',
                scrub: 1,
            },
            ease: 'back.out(1.7)',
        });

    }, { scope: containerRef });

    return (
        <section
            ref={containerRef}
            id="solution"
            className="section-padding relative overflow-hidden"
        >
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl" />

            <div className="solution-container container-custom relative z-10">
                {/* Header */}
                <div className="solution-header text-center max-w-3xl mx-auto mb-16">
                    <Badge variant="accent" className="mb-4">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        The Solution
                    </Badge>

                    <h2 className="font-display text-display-md font-bold mb-6">
                        Meet{' '}
                        <span className="text-gradient-primary">SocraticDev</span>
                    </h2>

                    <p className="text-lg text-[color:var(--color-text-secondary)]">
                        An AI coding assistant that prioritizes understanding over speed.
                        Teaching you to think, not just to copy.
                    </p>
                </div>

                {/* Product Showcase */}
                <div className="relative max-w-5xl mx-auto">
                    {/* Feature Pills - Orbiting around mockup */}
                    <div className="feature-pills absolute inset-0 pointer-events-none">
                        {features.map((feature, index) => {
                            const positions = [
                                { top: '10%', left: '-5%' },
                                { top: '5%', right: '-5%' },
                                { bottom: '15%', left: '0%' },
                            ];
                            const pos = positions[index];

                            return (
                                <div
                                    key={feature.id}
                                    className={`feature-pill absolute pointer-events-auto ${pos.left ? 'left-0' : ''
                                        } ${pos.right ? 'right-0' : ''}`}
                                    style={{
                                        top: pos.top,
                                        bottom: pos.bottom,
                                        left: pos.left,
                                        right: pos.right,
                                    }}
                                >
                                    <Card className="flex items-center gap-3 !p-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                                  ${feature.color === 'accent' ? 'bg-accent-500/10 text-accent-500' : ''}
                                  ${feature.color === 'secondary' ? 'bg-secondary-500/10 text-secondary-500' : ''}
                                  ${feature.color === 'primary' ? 'bg-primary-500/10 text-primary-500' : ''}`}>
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{feature.title}</p>
                                            <p className="text-xs text-[color:var(--color-text-muted)]">
                                                {feature.shortDesc}
                                            </p>
                                        </div>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>

                    {/* Main Product Mockup */}
                    <div className="product-mockup">
                        <Card variant="terminal" padding="none" className="shadow-elevated">
                            <Card.TerminalHeader title="SocraticDev" />
                            <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[color:var(--color-border)]">
                                {/* Chat Panel */}
                                <div className="p-6 space-y-4">
                                    {/* User Message */}
                                    <div className="flex justify-end">
                                        <div className="max-w-[80%] p-4 rounded-2xl rounded-tr-sm bg-primary-500 text-white">
                                            <p className="text-sm">How do I implement binary search?</p>
                                        </div>
                                    </div>

                                    {/* AI Response */}
                                    <div className="flex justify-start">
                                        <div className="max-w-[85%] p-4 rounded-2xl rounded-tl-sm bg-[color:var(--color-bg-muted)]">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 rounded-full bg-accent-500/20 flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                    </svg>
                                                </div>
                                                <span className="text-xs font-medium text-accent-500">Learning Mode</span>
                                            </div>
                                            <p className="text-sm mb-3">Great question! Before I show you the code, let me ask:</p>
                                            <ul className="text-sm space-y-2 text-[color:var(--color-text-secondary)]">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-accent-500">1.</span>
                                                    What property of the data makes binary search possible?
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-accent-500">2.</span>
                                                    Why would it be faster than checking each element?
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Mode Toggle */}
                                    <div className="flex items-center justify-center gap-4 pt-4 border-t border-[color:var(--color-border)]">
                                        <span className="text-xs font-medium text-accent-500">🎓 Learning</span>
                                        <div className="w-12 h-6 rounded-full bg-gradient-to-r from-accent-500 to-secondary-500 p-1 cursor-pointer">
                                            <div className="w-4 h-4 rounded-full bg-white" />
                                        </div>
                                        <span className="text-xs text-[color:var(--color-text-muted)]">🚀 Building</span>
                                    </div>
                                </div>

                                {/* Code Panel */}
                                <div className="p-6 bg-[color:var(--color-bg-muted)]">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-accent-500" />
                                            <span className="text-xs font-mono text-[color:var(--color-text-muted)]">
                                                binary_search.py
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-success">✓ Verified</span>
                                        </div>
                                    </div>
                                    <pre className="font-mono text-sm text-[color:var(--color-text-secondary)] overflow-x-auto">
                                        <code>{`# Your solution will appear here
# after you work through the
# Socratic questions!

def binary_search(arr, target):
    # Hint: What bounds do we need?
    # ...
    
    # Hint: How do we narrow down?
    # ...
    
    pass`}</code>
                                    </pre>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default SolutionSection;
