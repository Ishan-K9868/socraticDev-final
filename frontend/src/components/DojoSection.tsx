import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import Button from '../ui/Button';
import { ChallengeIcons, DojoIcon } from '../features/dojo/ChallengeIcons';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface Challenge {
    id: keyof typeof ChallengeIcons;
    name: string;
    tagline: string;
    description: string;
    color: string;
    bgColor: string;
    borderColor: string;
}

const CHALLENGES: Challenge[] = [
    { id: 'parsons', name: 'Parsons Problem', tagline: 'Drag. Drop. Debug.', description: 'Arrange scrambled code blocks into working solutions', color: 'text-cyan-500', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30' },
    { id: 'surgery', name: 'Code Surgery', tagline: 'Find the bugs.', description: 'Hunt down hidden bugs and fix them under pressure', color: 'text-red-500', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30' },
    { id: 'eli5', name: 'ELI5 Mode', tagline: 'Explain simply.', description: 'Explain complex code so anyone can understand', color: 'text-pink-500', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/30' },
    { id: 'mental', name: 'Mental Compiler', tagline: 'Be the machine.', description: 'Predict code output without running it', color: 'text-violet-500', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/30' },
    { id: 'bigo', name: 'Big O Battle', tagline: 'Know complexity.', description: 'Race to identify algorithm time complexity', color: 'text-orange-500', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30' },
    { id: 'rubber-duck', name: 'Rubber Duck', tagline: 'Talk it out.', description: 'Debug by explaining your code step-by-step', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30' },
    { id: 'translation', name: 'Code Translator', tagline: 'Speak all tongues.', description: 'Convert code between programming languages', color: 'text-teal-500', bgColor: 'bg-teal-500/10', borderColor: 'border-teal-500/30' },
    { id: 'tdd', name: 'TDD Arena', tagline: 'Test first.', description: 'Write code to pass progressively harder tests', color: 'text-lime-500', bgColor: 'bg-lime-500/10', borderColor: 'border-lime-500/30' },
    { id: 'pattern', name: 'Pattern Detective', tagline: 'Spot patterns.', description: 'Identify design patterns and code smells', color: 'text-slate-400', bgColor: 'bg-slate-500/10', borderColor: 'border-slate-500/30' },
    { id: 'faded', name: 'Fill the Blanks', tagline: 'Complete the puzzle.', description: 'Fill in missing parts of working code', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30' },
];

const BENEFITS = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        title: 'Active Recall',
        description: 'Learn by doing, not just reading.'
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        ),
        title: 'Deliberate Practice',
        description: 'Push just beyond your comfort zone.'
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        title: 'Track Progress',
        description: 'Points, streaks, and badges.'
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        title: 'Instant Feedback',
        description: 'Learn from mistakes in real-time.'
    },
];

// Floating dojo elements
const FloatingDojoElements = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient blobs */}
        <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-gradient-to-br from-accent-500/15 via-primary-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[350px] h-[350px] bg-gradient-to-tl from-secondary-500/15 via-transparent to-transparent rounded-full blur-3xl" />

        {/* Floating martial arts / training icons */}
        <svg className="absolute top-[15%] left-[8%] w-10 h-10 text-accent-500/15 animate-float" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>

        <svg className="absolute top-[25%] right-[10%] w-8 h-8 text-primary-500/15 animate-float" style={{ animationDelay: '1.5s' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>

        <svg className="absolute bottom-[20%] left-[5%] w-12 h-12 text-secondary-500/10 animate-float" style={{ animationDelay: '2.5s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>

        <svg className="absolute bottom-[35%] right-[8%] w-9 h-9 text-accent-400/15 animate-float" style={{ animationDelay: '3s' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>

        {/* Decorative rings */}
        <div className="absolute top-1/3 left-1/4 w-32 h-32 border border-primary-500/10 rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-40 h-40 border border-primary-500/5 rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border border-secondary-500/10 rounded-full" />
    </div>
);

// Section divider
const SectionDivider = () => (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <svg className="relative block w-full h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
                d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120H0Z"
                className="fill-[color:var(--color-bg-primary)]"
            />
        </svg>
    </div>
);

function DojoSection() {
    const [activeChallenge, setActiveChallenge] = useState(0);
    const prefersReducedMotion = useReducedMotion();
    const headerRef = useRef(null);
    const headerInView = useInView(headerRef, { once: true, amount: 0.1, margin: "0px 0px -150px 0px" });
    const featuredRef = useRef(null);
    const featuredInView = useInView(featuredRef, { once: true, amount: 0.1, margin: "0px 0px -150px 0px" });

    // Auto-rotate featured challenge
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveChallenge(prev => (prev + 1) % CHALLENGES.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const IconComponent = ChallengeIcons[CHALLENGES[activeChallenge].id];

    return (
        <section
            id="demo"
            className="section-padding relative overflow-hidden bg-[color:var(--color-bg-secondary)]"
        >
            {/* Top border */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-500/30 to-transparent" />

            {/* Floating elements */}
            <FloatingDojoElements />

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
                    className="text-center max-w-4xl mx-auto mb-16 relative"
                >
                    {/* Decorative icon background */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="relative">
                            <div className="absolute inset-0 bg-accent-500/20 blur-2xl rounded-full" />
                            <DojoIcon className="w-16 h-16 text-accent-500 relative" />
                        </div>
                    </div>

                    <div className="pt-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-500/10 border border-accent-500/20 mb-6">
                            <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
                            <span className="text-sm font-medium text-accent-500">Interactive Training</span>
                        </div>

                        <h2 className="font-display text-display-md font-bold mb-4">
                            <span className="text-gradient-primary">The Dojo</span>
                        </h2>
                        <p className="text-lg lg:text-xl text-[color:var(--color-text-secondary)]">
                            Train your programming muscles with 10 unique challenge types.
                            Interactive exercises that build real coding intuition.
                        </p>
                    </div>
                </motion.div>

                {/* Featured Challenge Showcase */}
                <motion.div 
                    ref={featuredRef}
                    initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95, y: prefersReducedMotion ? 20 : 30 }}
                    animate={featuredInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                    transition={{ 
                        duration: prefersReducedMotion ? 0.4 : 0.6,
                        type: "tween",
                        ease: [0.25, 0.1, 0.25, 1]
                    }}
                    className="max-w-3xl mx-auto mb-16"
                >
                    <div className={`relative p-8 rounded-3xl border-2 transition-all duration-500 ${CHALLENGES[activeChallenge].bgColor} ${CHALLENGES[activeChallenge].borderColor}`}>
                        {/* Glow effect */}
                        <div className={`absolute -inset-1 rounded-3xl blur-xl opacity-30 ${CHALLENGES[activeChallenge].bgColor}`} />

                        <div className="relative flex flex-col md:flex-row items-center gap-6">
                            {/* Icon */}
                            <div className={`w-20 h-20 rounded-2xl ${CHALLENGES[activeChallenge].bgColor} flex items-center justify-center transition-transform duration-300 hover:scale-110`}>
                                <IconComponent className={`w-10 h-10 ${CHALLENGES[activeChallenge].color}`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 text-center md:text-left">
                                <p className={`text-sm font-medium ${CHALLENGES[activeChallenge].color} mb-1`}>
                                    {CHALLENGES[activeChallenge].tagline}
                                </p>
                                <h3 className="font-display text-2xl font-bold mb-2">
                                    {CHALLENGES[activeChallenge].name}
                                </h3>
                                <p className="text-[color:var(--color-text-secondary)]">
                                    {CHALLENGES[activeChallenge].description}
                                </p>
                            </div>

                            {/* CTA */}
                            <Link to="/learn">
                                <Button size="lg" className="group">
                                    Try Now
                                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Button>
                            </Link>
                        </div>

                        {/* Progress dots */}
                        <div className="flex items-center justify-center gap-2 mt-6">
                            {CHALLENGES.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveChallenge(idx)}
                                    className={`h-2 rounded-full transition-all duration-300 ${idx === activeChallenge
                                        ? 'w-8 bg-primary-500'
                                        : 'w-2 bg-[color:var(--color-border)] hover:bg-[color:var(--color-border-hover)]'
                                        }`}
                                    aria-label={`Go to challenge ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Challenge Grid */}
                <div className="mb-16">
                    <h3 className="text-center font-display text-xl font-semibold mb-8">
                        <span className="text-[color:var(--color-text-muted)]">All</span>{' '}
                        <span className="text-primary-500">10</span>{' '}
                        <span className="text-[color:var(--color-text-muted)]">Challenge Types</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {CHALLENGES.map((challenge, idx) => {
                            const Icon = ChallengeIcons[challenge.id];
                            return (
                                <button
                                    key={challenge.id}
                                    onClick={() => setActiveChallenge(idx)}
                                    className={`group p-4 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
                                        ${idx === activeChallenge
                                            ? `${challenge.bgColor} ${challenge.borderColor}`
                                            : 'bg-[color:var(--color-bg-primary)] border-[color:var(--color-border)] hover:border-[color:var(--color-border-hover)]'
                                        }`}
                                >
                                    <Icon className={`w-8 h-8 mx-auto mb-2 transition-transform group-hover:scale-110 ${challenge.color}`} />
                                    <p className="text-xs font-medium text-center truncate">
                                        {challenge.name}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Benefits Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {BENEFITS.map((benefit) => (
                        <div
                            key={benefit.title}
                            className="group p-6 rounded-2xl bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)] hover:border-primary-500/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                                {benefit.icon}
                            </div>
                            <h4 className="font-display font-semibold mb-2">
                                {benefit.title}
                            </h4>
                            <p className="text-sm text-[color:var(--color-text-secondary)]">
                                {benefit.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-16 text-center">
                    <Link to="/learn">
                        <Button size="lg" className="group">
                            Enter The Dojo
                            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Button>
                    </Link>
                    <p className="mt-4 text-sm text-[color:var(--color-text-muted)]">
                        Free access to all challenges • No credit card required
                    </p>
                </div>
            </div>

            {/* Wave divider */}
            <SectionDivider />
        </section>
    );
}

export default DojoSection;
