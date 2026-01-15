import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import Badge from '../ui/Badge';

const problems = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        stat: '67%',
        title: 'Tutorial Hell',
        description: 'of learners are stuck copying code without understanding the underlying concepts.',
        color: 'primary',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        stat: '83%',
        title: 'Vibe Coding',
        description: 'of developers accept AI-generated code that "looks right" without verification.',
        color: 'secondary',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        stat: '94%',
        title: 'Context Loss',
        description: 'of AI tools don\'t understand your full project structure and dependencies.',
        color: 'accent',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
        ),
        stat: '19%',
        title: 'Productivity Paradox',
        description: 'Studies show developers are actually SLOWER with current AI coding tools.',
        color: 'error',
    },
];

function ProblemSection() {
    const containerRef = useRef<HTMLElement>(null);
    const statsRef = useRef<(HTMLSpanElement | null)[]>([]);

    useGSAP(() => {
        // Animate section header
        gsap.from('.problem-header', {
            opacity: 0,
            y: 50,
            scrollTrigger: {
                trigger: '.problem-header',
                start: 'top 80%',
                end: 'top 50%',
                scrub: 1,
            },
        });

        // Animate cards from alternating sides (bidirectional scroll)
        gsap.from('.problem-card', {
            opacity: 0,
            x: (i) => (i % 2 === 0 ? -80 : 80),
            rotation: (i) => (i % 2 === 0 ? -5 : 5),
            scrollTrigger: {
                trigger: '.problem-cards',
                start: 'top 75%',
                end: 'top 35%',
                scrub: 1.5,
            },
            stagger: 0.1,
        });

        // Animate stat counters
        statsRef.current.forEach((stat, i) => {
            if (!stat) return;

            const targetValue = parseInt(problems[i].stat);
            const obj = { value: 0 };

            gsap.to(obj, {
                value: targetValue,
                duration: 2,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: stat,
                    start: 'top 85%',
                    once: true,
                },
                onUpdate: () => {
                    if (stat) {
                        stat.textContent = Math.round(obj.value) + '%';
                    }
                },
            });
        });

    }, { scope: containerRef });

    return (
        <section
            ref={containerRef}
            id="problem"
            className="section-padding relative overflow-hidden"
        >
            {/* Background */}
            <div className="absolute inset-0 section-gradient" />

            <div className="container-custom relative z-10">
                {/* Header */}
                <div className="problem-header text-center max-w-3xl mx-auto mb-16">
                    <Badge variant="error" className="mb-4">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        The Problem
                    </Badge>

                    <h2 className="font-display text-display-md font-bold mb-6">
                        Current AI tools make developers{' '}
                        <span className="text-error">19% slower</span>.{' '}
                        <span className="text-[color:var(--color-text-secondary)]">Here's why.</span>
                    </h2>

                    <p className="text-lg text-[color:var(--color-text-secondary)]">
                        Despite the hype, AI coding assistants are creating new problems instead of solving them.
                        The focus on speed over understanding is hurting developer growth.
                    </p>
                </div>

                {/* Problem Cards */}
                <div className="problem-cards grid md:grid-cols-2 gap-6 lg:gap-8">
                    {problems.map((problem, index) => (
                        <div
                            key={problem.title}
                            className={`problem-card group relative p-6 lg:p-8 rounded-2xl border 
                         bg-[color:var(--color-bg-secondary)] border-[color:var(--color-border)]
                         hover:border-${problem.color === 'error' ? 'red' : problem.color}-500/50
                         transition-colors`}
                        >
                            {/* Icon & Stat */}
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                              ${problem.color === 'primary' ? 'bg-primary-500/10 text-primary-500' : ''}
                              ${problem.color === 'secondary' ? 'bg-secondary-500/10 text-secondary-500' : ''}
                              ${problem.color === 'accent' ? 'bg-accent-500/10 text-accent-500' : ''}
                              ${problem.color === 'error' ? 'bg-error/10 text-error' : ''}`}>
                                    {problem.icon}
                                </div>
                                <span
                                    ref={(el) => { statsRef.current[index] = el; }}
                                    className={`font-display text-4xl lg:text-5xl font-bold opacity-20
                            ${problem.color === 'primary' ? 'text-primary-500' : ''}
                            ${problem.color === 'secondary' ? 'text-secondary-500' : ''}
                            ${problem.color === 'accent' ? 'text-accent-500' : ''}
                            ${problem.color === 'error' ? 'text-error' : ''}`}
                                >
                                    0%
                                </span>
                            </div>

                            {/* Content */}
                            <h3 className="font-display text-xl font-semibold mb-2">
                                {problem.title}
                            </h3>
                            <p className="text-[color:var(--color-text-secondary)]">
                                {problem.description}
                            </p>

                            {/* Decorative line */}
                            <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl opacity-0 
                             group-hover:opacity-100 transition-opacity
                             ${problem.color === 'primary' ? 'bg-primary-500' : ''}
                             ${problem.color === 'secondary' ? 'bg-secondary-500' : ''}
                             ${problem.color === 'accent' ? 'bg-accent-500' : ''}
                             ${problem.color === 'error' ? 'bg-error' : ''}`}
                            />
                        </div>
                    ))}
                </div>

                {/* Bottom callout */}
                <div className="mt-12 p-6 lg:p-8 rounded-2xl bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] text-center">
                    <p className="text-lg font-medium mb-2">
                        "The more I use AI to write code, the less I understand it."
                    </p>
                    <p className="text-sm text-[color:var(--color-text-muted)]">
                        — Every developer who's been stuck debugging AI-generated code at 2 AM
                    </p>
                </div>
            </div>
        </section>
    );
}

export default ProblemSection;
