import Badge from '../ui/Badge';

// Floating warning icons for problem section
const FloatingWarnings = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large gradient blob */}
        <div className="absolute top-1/4 -right-20 w-[400px] h-[400px] bg-gradient-to-br from-error/10 via-primary-500/5 to-transparent rounded-full blur-3xl" />

        {/* Floating warning symbols */}
        <svg className="absolute top-20 left-[8%] w-8 h-8 text-error/20 animate-float" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6zm-1 5v4h2v-4h-2zm0 6v2h2v-2h-2z" />
        </svg>

        <svg className="absolute top-1/3 right-[10%] w-6 h-6 text-primary-500/15 animate-float" style={{ animationDelay: '1.5s' }} viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 4" stroke="white" strokeWidth="2" fill="none" />
        </svg>

        <svg className="absolute bottom-1/4 left-[12%] w-10 h-10 text-secondary-500/15 animate-float" style={{ animationDelay: '2.5s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9.172 14.828L12 12m0 0l2.828-2.828M12 12l2.828 2.828M12 12L9.172 9.172" />
            <circle cx="12" cy="12" r="9" />
        </svg>

        <svg className="absolute bottom-[20%] right-[15%] w-7 h-7 text-accent-500/20 animate-float" style={{ animationDelay: '3s' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>

        {/* Decorative brackets */}
        <svg className="absolute top-[15%] right-[25%] w-12 h-16 text-[color:var(--color-border)]" viewBox="0 0 48 64" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 8 L8 8 L8 56 L12 56" strokeLinecap="round" />
            <path d="M36 8 L40 8 L40 56 L36 56" strokeLinecap="round" />
        </svg>

        {/* Code-like lines */}
        <div className="absolute bottom-[35%] left-[5%] space-y-2 opacity-20">
            <div className="h-1 w-16 bg-error rounded" />
            <div className="h-1 w-12 bg-error/60 rounded" />
            <div className="h-1 w-20 bg-error/40 rounded" />
        </div>
    </div>
);

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
        decoration: (
            <svg className="absolute -top-2 -right-2 w-8 h-8 text-primary-500/10" viewBox="0 0 32 32" fill="currentColor">
                <circle cx="16" cy="16" r="12" />
            </svg>
        ),
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
        decoration: (
            <svg className="absolute -top-2 -right-2 w-8 h-8 text-secondary-500/10" viewBox="0 0 32 32" fill="currentColor">
                <rect x="4" y="4" width="24" height="24" rx="4" />
            </svg>
        ),
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
        decoration: (
            <svg className="absolute -top-2 -right-2 w-8 h-8 text-accent-500/10" viewBox="0 0 32 32" fill="currentColor">
                <polygon points="16,4 28,28 4,28" />
            </svg>
        ),
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
        decoration: (
            <svg className="absolute -top-2 -right-2 w-10 h-10 text-error/10" viewBox="0 0 40 40" fill="currentColor">
                <path d="M20 4 L36 36 L4 36 Z" />
            </svg>
        ),
    },
];

function ProblemSection() {
    return (
        <section
            id="problem"
            className="section-padding relative overflow-hidden"
        >
            {/* Background */}
            <div className="absolute inset-0 section-gradient" />

            {/* Floating decorative elements */}
            <FloatingWarnings />

            <div className="container-custom relative z-10">
                {/* Header with decorative elements */}
                <div className="text-center max-w-3xl mx-auto mb-16 relative">
                    {/* Decorative lines behind header */}
                    <svg className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-8 text-error/20" viewBox="0 0 128 32" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M0 16 L40 16 M88 16 L128 16" strokeLinecap="round" />
                        <circle cx="64" cy="16" r="8" fill="currentColor" opacity="0.3" />
                    </svg>

                    <Badge variant="error" className="mb-4">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        The Problem
                    </Badge>

                    <h2 className="font-display text-display-md font-bold mb-6">
                        Current AI tools make developers{' '}
                        <span className="text-error relative">
                            19% slower
                            <svg className="absolute -bottom-1 left-0 w-full h-2" viewBox="0 0 100 8" preserveAspectRatio="none">
                                <path d="M0 4 Q25 8, 50 4 T100 4" fill="none" stroke="currentColor" strokeWidth="2" className="text-error/40" />
                            </svg>
                        </span>.{' '}
                        <span className="text-[color:var(--color-text-secondary)]">Here's why.</span>
                    </h2>

                    <p className="text-lg text-[color:var(--color-text-secondary)]">
                        Despite the hype, AI coding assistants are creating new problems instead of solving them.
                        The focus on speed over understanding is hurting developer growth.
                    </p>
                </div>

                {/* Problem Cards with enhanced visuals */}
                <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                    {problems.map((problem) => (
                        <div
                            key={problem.title}
                            className={`group relative p-6 lg:p-8 rounded-2xl border 
                         bg-[color:var(--color-bg-secondary)] border-[color:var(--color-border)]
                         hover:border-${problem.color === 'error' ? 'red' : problem.color}-500/50
                         transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
                        >
                            {/* Card decoration */}
                            {problem.decoration}

                            {/* Corner accent */}
                            <div className={`absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity
                                ${problem.color === 'primary' ? 'bg-gradient-to-bl from-primary-500/10' : ''}
                                ${problem.color === 'secondary' ? 'bg-gradient-to-bl from-secondary-500/10' : ''}
                                ${problem.color === 'accent' ? 'bg-gradient-to-bl from-accent-500/10' : ''}
                                ${problem.color === 'error' ? 'bg-gradient-to-bl from-error/10' : ''}
                                rounded-tr-2xl to-transparent`}
                            />

                            {/* Icon & Stat */}
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110
                              ${problem.color === 'primary' ? 'bg-primary-500/10 text-primary-500' : ''}
                              ${problem.color === 'secondary' ? 'bg-secondary-500/10 text-secondary-500' : ''}
                              ${problem.color === 'accent' ? 'bg-accent-500/10 text-accent-500' : ''}
                              ${problem.color === 'error' ? 'bg-error/10 text-error' : ''}`}>
                                    {problem.icon}
                                </div>
                                <span
                                    className={`font-display text-4xl lg:text-5xl font-bold opacity-20 group-hover:opacity-30 transition-opacity
                            ${problem.color === 'primary' ? 'text-primary-500' : ''}
                            ${problem.color === 'secondary' ? 'text-secondary-500' : ''}
                            ${problem.color === 'accent' ? 'text-accent-500' : ''}
                            ${problem.color === 'error' ? 'text-error' : ''}`}
                                >
                                    {problem.stat}
                                </span>
                            </div>

                            {/* Content */}
                            <h3 className="font-display text-xl font-semibold mb-2">
                                {problem.title}
                            </h3>
                            <p className="text-[color:var(--color-text-secondary)]">
                                {problem.description}
                            </p>

                            {/* Animated bottom line */}
                            <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl 
                             transition-all duration-300 origin-left scale-x-0 group-hover:scale-x-100
                             ${problem.color === 'primary' ? 'bg-gradient-to-r from-primary-500 to-primary-400' : ''}
                             ${problem.color === 'secondary' ? 'bg-gradient-to-r from-secondary-500 to-secondary-400' : ''}
                             ${problem.color === 'accent' ? 'bg-gradient-to-r from-accent-500 to-accent-400' : ''}
                             ${problem.color === 'error' ? 'bg-gradient-to-r from-error to-red-400' : ''}`}
                            />
                        </div>
                    ))}
                </div>

                {/* Bottom callout with enhanced styling */}
                <div className="mt-12 p-6 lg:p-8 rounded-2xl bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] text-center relative overflow-hidden">
                    {/* Quote marks decoration */}
                    <svg className="absolute top-4 left-6 w-12 h-12 text-[color:var(--color-border)]" viewBox="0 0 48 48" fill="currentColor">
                        <path d="M14 24c-4 0-7-3-7-7s3-7 7-7c1 0 2 0 3 1l-1 3c-1 0-2-1-2-1-2 0-4 2-4 4s2 4 4 4v3zm18 0c-4 0-7-3-7-7s3-7 7-7c1 0 2 0 3 1l-1 3c-1 0-2-1-2-1-2 0-4 2-4 4s2 4 4 4v3z" opacity="0.3" />
                    </svg>

                    <p className="text-lg font-medium mb-2 relative z-10">
                        "The more I use AI to write code, the less I understand it."
                    </p>
                    <p className="text-sm text-[color:var(--color-text-muted)]">
                        — Every developer who's been stuck debugging AI-generated code at 2 AM
                    </p>

                    {/* Decorative gradient */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-error/30 to-transparent" />
                </div>
            </div>
        </section>
    );
}

export default ProblemSection;
