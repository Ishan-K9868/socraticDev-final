import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Badge from '../ui/Badge';
import { useReducedMotion } from '../hooks/useReducedMotion';
import Card from '../ui/Card';

// Floating solution elements
const FloatingSolutions = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large gradient blob */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-primary-500/15 via-accent-500/10 to-transparent rounded-full blur-2xl" />
        <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] bg-gradient-to-tl from-secondary-500/15 via-primary-500/5 to-transparent rounded-full blur-2xl" />

        {/* Floating lightbulb icons */}
        <svg className="absolute top-[15%] left-[8%] w-10 h-10 text-accent-500/20 animate-float" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
        </svg>

        <svg className="absolute top-[25%] right-[12%] w-8 h-8 text-primary-500/15 animate-float" style={{ animationDelay: '1.5s' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>

        <svg className="absolute bottom-[30%] left-[5%] w-12 h-12 text-secondary-500/15 animate-float" style={{ animationDelay: '2.5s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 6v6l4 2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="9" />
        </svg>

        {/* Code brackets */}
        <svg className="absolute top-[40%] right-[5%] w-16 h-20 text-accent-500/10 animate-float" style={{ animationDelay: '3s' }} viewBox="0 0 64 80" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 8 L8 8 L8 72 L20 72" strokeLinecap="round" />
            <path d="M44 8 L56 8 L56 72 L44 72" strokeLinecap="round" />
        </svg>

        {/* Sparkles */}
        <svg className="absolute top-[60%] left-[15%] w-6 h-6 text-accent-400/30" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2 7h7l-5.5 4.5 2 7L12 16l-5.5 4.5 2-7L3 9h7l2-7z" />
        </svg>

        <svg className="absolute bottom-[25%] right-[20%] w-5 h-5 text-primary-400/25" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2 7h7l-5.5 4.5 2 7L12 16l-5.5 4.5 2-7L3 9h7l2-7z" />
        </svg>
    </div>
);

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
    const prefersReducedMotion = useReducedMotion();
    const headerRef = useRef(null);
    const headerInView = useInView(headerRef, { once: true, amount: 0.1, margin: "0px 0px -150px 0px" });
    const mockupRef = useRef(null);
    const mockupInView = useInView(mockupRef, { once: true, amount: 0.1, margin: "0px 0px -150px 0px" });
    
    return (
        <section
            className="section-padding relative overflow-hidden"
        >
            {/* Floating decorative elements */}
            <FloatingSolutions />

            {/* Center glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-[600px] h-[600px] bg-gradient-radial from-primary-500/15 via-accent-500/5 to-transparent rounded-full" />

            <div className="container-custom relative z-10">
                {/* Header with decorative elements */}
                <motion.div 
                    ref={headerRef}
                    initial={{ opacity: 0, y: prefersReducedMotion ? 10 : 30 }}
                    animate={headerInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ 
                        duration: prefersReducedMotion ? 0.3 : 0.5,
                        type: "tween",
                        ease: [0.25, 0.1, 0.25, 1]
                    }}
                    className="text-center max-w-3xl mx-auto mb-16 relative"
                >
                    {/* Decorative arc above header */}
                    <svg className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-12 text-accent-500/20" viewBox="0 0 192 48" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 40 Q96 8 184 40" strokeLinecap="round" />
                        <circle cx="96" cy="20" r="4" fill="currentColor" opacity="0.5" />
                    </svg>

                    <Badge variant="accent" className="mb-4">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        The Solution
                    </Badge>

                    <h2 className="font-display text-display-md font-bold mb-6">
                        Meet{' '}
                        <span className="text-gradient-primary relative">
                            SocraticDev
                            {/* Sparkle decoration */}
                            <svg className="absolute -top-2 -right-6 w-5 h-5 text-accent-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" />
                            </svg>
                        </span>
                    </h2>

                    <p className="text-lg text-[color:var(--color-text-secondary)]">
                        An AI coding assistant that prioritizes understanding over speed.
                        Teaching you to think, not just to copy.
                    </p>
                </motion.div>

                {/* Product Showcase */}
                <div className="relative max-w-5xl mx-auto">
                    {/* Feature Pills with enhanced styling */}
                    <div className="absolute inset-0 pointer-events-none">
                        {features.map((feature, index) => {
                            const positions = [
                                { top: '10%', left: '-5%' },
                                { top: '5%', right: '-5%' },
                                { bottom: '15%', left: '0%' },
                            ];
                            const pos = positions[index];

                            return (
                                <motion.div
                                    key={feature.id}
                                    initial={{
                                        opacity: 0,
                                        x: index % 2 === 0 ? (prefersReducedMotion ? -20 : -60) : (prefersReducedMotion ? 20 : 60)
                                    }}
                                    animate={mockupInView ? {
                                        opacity: 1,
                                        x: 0
                                    } : {}}
                                    transition={{
                                        duration: prefersReducedMotion ? 0.4 : 0.5,
                                        delay: index * 0.08,
                                        type: "tween",
                                        ease: [0.25, 0.1, 0.25, 1]
                                    }}
                                    className={`absolute pointer-events-auto hidden lg:block animate-float ${pos.left ? 'left-0' : ''} ${pos.right ? 'right-0' : ''}`}
                                    style={{
                                        top: pos.top,
                                        bottom: pos.bottom,
                                        left: pos.left,
                                        right: pos.right,
                                        animationDelay: `${index * 0.8}s`,
                                    }}
                                >
                                    {/* Glow behind card */}
                                    <div className={`absolute -inset-2 rounded-2xl blur-lg opacity-30
                                        ${feature.color === 'accent' ? 'bg-accent-500' : ''}
                                        ${feature.color === 'secondary' ? 'bg-secondary-500' : ''}
                                        ${feature.color === 'primary' ? 'bg-primary-500' : ''}`}
                                    />
                                    <Card className="flex items-center gap-3 !p-4 relative">
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
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Main Product Mockup with enhanced styling */}
                    <motion.div 
                        ref={mockupRef}
                        initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95, y: prefersReducedMotion ? 20 : 30 }}
                        animate={mockupInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                        transition={{ 
                            duration: prefersReducedMotion ? 0.4 : 0.6,
                            type: "tween",
                            ease: [0.25, 0.1, 0.25, 1]
                        }}
                        className="relative"
                    >
                        {/* Decorative shapes behind mockup */}
                        <div className="absolute -inset-4 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 rounded-3xl" />
                        <div className="absolute -bottom-2 -right-2 w-40 h-40 bg-accent-500/5 rounded-full blur-2xl" />

                        <Card variant="terminal" padding="none" className="shadow-elevated relative">
                            <Card.TerminalHeader title="SocraticDev" />
                            <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[color:var(--color-border)]">
                                {/* Chat Panel */}
                                <div className="p-6 space-y-4">
                                    {/* User Message */}
                                    <div className="flex justify-end">
                                        <div className="max-w-[80%] p-4 rounded-2xl rounded-tr-sm bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20">
                                            <p className="text-sm">How do I implement binary search?</p>
                                        </div>
                                    </div>

                                    {/* AI Response with enhanced styling */}
                                    <div className="flex justify-start">
                                        <div className="max-w-[85%] p-4 rounded-2xl rounded-tl-sm bg-gradient-to-br from-[color:var(--color-bg-muted)] to-[color:var(--color-bg-secondary)] border border-accent-500/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-accent-500/30 rounded-full animate-ping" />
                                                    <div className="w-6 h-6 rounded-full bg-accent-500/20 flex items-center justify-center relative">
                                                        <svg className="w-3 h-3 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-medium text-accent-500">Learning Mode</span>
                                            </div>
                                            <p className="text-sm mb-3">Great question! Before I show you the code, let me ask:</p>
                                            <ul className="text-sm space-y-2 text-[color:var(--color-text-secondary)]">
                                                <li className="flex items-start gap-2">
                                                    <span className="w-5 h-5 rounded-full bg-accent-500/20 text-accent-500 flex items-center justify-center text-xs font-bold">1</span>
                                                    What property of the data makes binary search possible?
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="w-5 h-5 rounded-full bg-accent-500/20 text-accent-500 flex items-center justify-center text-xs font-bold">2</span>
                                                    Why would it be faster than checking each element?
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Mode Toggle with glow */}
                                    <div className="flex items-center justify-center gap-4 pt-4 border-t border-[color:var(--color-border)]">
                                        <span className="text-xs font-medium text-accent-500">🎓 Learning</span>
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-r from-accent-500 to-secondary-500 blur-md opacity-50 rounded-full" />
                                            <div className="w-12 h-6 rounded-full bg-gradient-to-r from-accent-500 to-secondary-500 p-1 cursor-pointer relative">
                                                <div className="w-4 h-4 rounded-full bg-white shadow-lg" />
                                            </div>
                                        </div>
                                        <span className="text-xs text-[color:var(--color-text-muted)]">🚀 Building</span>
                                    </div>
                                </div>

                                {/* Code Panel */}
                                <div className="p-6 bg-gradient-to-br from-[color:var(--color-bg-muted)] to-[color:var(--color-bg-secondary)]">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-accent-500 animate-pulse" />
                                            <span className="text-xs font-mono text-[color:var(--color-text-muted)]">
                                                binary_search.py
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-success/10 border border-success/20">
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

                                    {/* Code quality indicator */}
                                    <div className="mt-4 pt-4 border-t border-[color:var(--color-border)]">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-[color:var(--color-text-muted)]">Code Quality</span>
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <div key={i} className={`w-2 h-4 rounded-sm ${i < 4 ? 'bg-success' : 'bg-[color:var(--color-border)]'}`} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export default SolutionSection;
