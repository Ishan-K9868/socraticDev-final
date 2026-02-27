import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Badge from '../ui/Badge';
import { useReducedMotion } from '../hooks/useReducedMotion';

// Floating how-it-works elements
const FloatingSteps = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient blobs */}
        <div className="absolute -top-20 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-primary-500/10 via-transparent to-transparent rounded-full blur-2xl" />
        <div className="absolute -bottom-20 right-1/4 w-[350px] h-[350px] bg-gradient-to-tl from-accent-500/10 via-transparent to-transparent rounded-full blur-2xl" />

        {/* Floating step numbers */}
        <svg className="absolute top-[20%] left-[5%] w-12 h-12 text-primary-500/10 animate-float" viewBox="0 0 48 48" fill="currentColor">
            <circle cx="24" cy="24" r="22" />
            <text x="24" y="30" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">1</text>
        </svg>

        <svg className="absolute top-[40%] right-[8%] w-10 h-10 text-secondary-500/10 animate-float" style={{ animationDelay: '1.5s' }} viewBox="0 0 40 40" fill="currentColor">
            <circle cx="20" cy="20" r="18" />
            <text x="20" y="26" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">2</text>
        </svg>

        <svg className="absolute bottom-[30%] left-[8%] w-14 h-14 text-accent-500/10 animate-float" style={{ animationDelay: '2.5s' }} viewBox="0 0 56 56" fill="currentColor">
            <circle cx="28" cy="28" r="26" />
            <text x="28" y="35" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">3</text>
        </svg>

        {/* Decorative arrows */}
        <svg className="absolute top-[35%] left-[20%] w-16 h-8 text-[color:var(--color-border)]" viewBox="0 0 64 32" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 16 L48 16 M40 8 L52 16 L40 24" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <svg className="absolute bottom-[45%] right-[25%] w-16 h-8 text-[color:var(--color-border)]" viewBox="0 0 64 32" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 16 L48 16 M40 8 L52 16 L40 24" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </div>
);

// Section divider
const SectionDivider = () => (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <svg className="relative block w-full h-12" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <polygon points="0,0 1200,120 0,120" className="fill-[color:var(--color-bg-secondary)]" />
        </svg>
    </div>
);

const steps = [
    {
        number: '01',
        title: 'Upload Your Codebase',
        description: 'Drop in your project folder or connect your repository. Our system scans and understands your entire codebase structure, mapping every file and dependency.',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
        ),
        color: 'primary',
    },
    {
        number: '02',
        title: 'GraphRAG Maps Your Code',
        description: 'AI maps every file, function, and dependency into a knowledge graph. Visualize the architecture, explore connections, and give the AI full context about your codebase.',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
        ),
        color: 'secondary',
    },
    {
        number: '03',
        title: 'Ask Questions, Get Guidance',
        description: 'Chat with the AI about your code. It asks clarifying questions that help you discover solutions — with context management that lets you control exactly what the AI sees.',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        color: 'accent',
    },
    {
        number: '04',
        title: 'Visualize & Debug',
        description: 'Open the Code Visualizer to see call graphs and execution traces for any Python code. Understand function relationships and trace variable flow visually.',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        color: 'secondary',
    },
    {
        number: '05',
        title: 'Practice & Master',
        description: 'Reinforce your learning with 10 interactive challenge types in The Dojo. AI generates targeted flashcards from every challenge, and spaced repetition ensures concepts stick.',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
        ),
        color: 'primary',
    },
];

function HowItWorksSection() {
    const prefersReducedMotion = useReducedMotion();
    const headerRef = useRef(null);
    const headerInView = useInView(headerRef, { once: true, amount: 0.1, margin: "0px 0px -150px 0px" });

    return (
        <section
            id="how-it-works"
            className="section-padding relative overflow-hidden bg-[color:var(--color-bg-primary)]"
        >
            {/* Top border */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[color:var(--color-border)] to-transparent" />

            {/* Floating elements */}
            <FloatingSteps />

            <div className="container-custom relative z-10">
                {/* Header */}
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
                    {/* Decorative process line */}
                    <svg className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-8 text-secondary-500/20" viewBox="0 0 128 32" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="16" cy="16" r="6" fill="currentColor" />
                        <line x1="24" y1="16" x2="40" y2="16" strokeDasharray="4 4" />
                        <circle cx="48" cy="16" r="4" />
                        <line x1="54" y1="16" x2="70" y2="16" strokeDasharray="4 4" />
                        <circle cx="80" cy="16" r="4" />
                        <line x1="86" y1="16" x2="102" y2="16" strokeDasharray="4 4" />
                        <circle cx="112" cy="16" r="6" fill="currentColor" />
                    </svg>

                    <Badge variant="secondary" className="mb-4 mt-8">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        How It Works
                    </Badge>

                    <h2 className="font-display text-display-md font-bold mb-6">
                        From codebase to{' '}
                        <span className="text-gradient-primary">mastery</span>
                    </h2>

                    <p className="text-lg text-[color:var(--color-text-secondary)]">
                        A simple five-step process that transforms how you learn and build.
                    </p>
                </motion.div>

                {/* Steps */}
                <div className="max-w-4xl mx-auto">
                    {steps.map((step, index) => {
                        const stepRef = useRef(null);
                        const stepInView = useInView(stepRef, { once: true, amount: 0.2, margin: "0px 0px -200px 0px" });

                        return (
                            <div key={step.number} className="relative" ref={stepRef}>
                                {/* Connector line */}
                                {index < steps.length - 1 && (
                                    <motion.div
                                        initial={{ scaleY: 0 }}
                                        animate={stepInView ? { scaleY: 1 } : {}}
                                        transition={{
                                            duration: 0.4,
                                            delay: 0.2,
                                            type: "tween",
                                            ease: [0.25, 0.1, 0.25, 1]
                                        }}
                                        style={{ originY: 0 }}
                                        className="absolute left-[39px] top-24 w-0.5 h-16 bg-gradient-to-b from-[color:var(--color-border)] to-transparent hidden md:block"
                                    />
                                )}

                                <motion.div
                                    initial={{ opacity: 0, x: prefersReducedMotion ? 0 : (index % 2 === 0 ? -40 : 40) }}
                                    animate={stepInView ? { opacity: 1, x: 0 } : {}}
                                    transition={{
                                        duration: prefersReducedMotion ? 0.3 : 0.5,
                                        delay: index * 0.1,
                                        type: "tween",
                                        ease: [0.25, 0.1, 0.25, 1]
                                    }}
                                    className={`flex flex-col md:flex-row gap-6 mb-8 md:mb-12 group ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                                >
                                    {/* Step number and icon */}
                                    <div className="flex-shrink-0 flex items-start gap-4">
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={stepInView ? { scale: 1, opacity: 1 } : {}}
                                            transition={{
                                                type: "spring",
                                                stiffness: 200,
                                                damping: 15,
                                                delay: index * 0.1 + 0.1
                                            }}
                                            className={`relative w-20 h-20 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110
                                        ${step.color === 'primary' ? 'bg-primary-500/10 text-primary-500' : ''}
                                        ${step.color === 'secondary' ? 'bg-secondary-500/10 text-secondary-500' : ''}
                                        ${step.color === 'accent' ? 'bg-accent-500/10 text-accent-500' : ''}`}
                                        >
                                            <motion.div
                                                initial={{ opacity: 0, rotate: 0, scale: 0.8 }}
                                                animate={stepInView ? { opacity: 1, rotate: prefersReducedMotion ? 0 : 360, scale: 1 } : {}}
                                                transition={{
                                                    duration: prefersReducedMotion ? 0.3 : 0.5,
                                                    delay: index * 0.1 + 0.15,
                                                    type: "tween",
                                                    ease: [0.25, 0.1, 0.25, 1]
                                                }}
                                            >
                                                {step.icon}
                                            </motion.div>
                                            {/* Glow effect */}
                                            <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl
                                            ${step.color === 'primary' ? 'bg-primary-500/20' : ''}
                                            ${step.color === 'secondary' ? 'bg-secondary-500/20' : ''}
                                            ${step.color === 'accent' ? 'bg-accent-500/20' : ''}`}
                                            />
                                        </motion.div>
                                    </div>

                                    {/* Content */}
                                    <div className={`flex-1 p-6 rounded-2xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] group-hover:border-${step.color}-500/30 transition-colors`}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className={`text-3xl font-display font-bold opacity-30
                                            ${step.color === 'primary' ? 'text-primary-500' : ''}
                                            ${step.color === 'secondary' ? 'text-secondary-500' : ''}
                                            ${step.color === 'accent' ? 'text-accent-500' : ''}`}>
                                                {step.number}
                                            </span>
                                            <h3 className="font-display text-xl font-semibold">
                                                {step.title}
                                            </h3>
                                        </div>
                                        <p className="text-[color:var(--color-text-secondary)]">
                                            {step.description}
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Section divider */}
            <SectionDivider />
        </section>
    );
}

export default HowItWorksSection;
