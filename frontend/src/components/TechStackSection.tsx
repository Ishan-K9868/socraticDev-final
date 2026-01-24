import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Badge from '../ui/Badge';
import { useReducedMotion } from '../hooks/useReducedMotion';

// Floating tech elements
const FloatingTechElements = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient blobs */}
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-gradient-to-br from-primary-500/10 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-gradient-to-tl from-secondary-500/10 via-transparent to-transparent rounded-full blur-3xl" />

        {/* Tech-related floating icons */}
        <svg className="absolute top-[10%] left-[5%] w-10 h-10 text-primary-500/15 animate-float" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>

        <svg className="absolute top-[20%] right-[8%] w-8 h-8 text-secondary-500/20 animate-float" style={{ animationDelay: '1s' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278z" />
        </svg>

        <svg className="absolute bottom-[30%] left-[8%] w-12 h-12 text-accent-500/15 animate-float" style={{ animationDelay: '2s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" />
            <path d="M12 22V12M12 12L2 7M12 12l10-5" />
        </svg>

        <svg className="absolute bottom-[20%] right-[10%] w-9 h-9 text-primary-400/20 animate-float" style={{ animationDelay: '3s' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>

        {/* Decorative circuit lines */}
        <svg className="absolute top-[40%] left-[3%] w-24 h-32 text-[color:var(--color-border)]" viewBox="0 0 96 128" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M48 0 L48 40 L8 40 L8 88 L48 88 L48 128" strokeDasharray="4 4" />
            <circle cx="48" cy="40" r="4" fill="currentColor" />
            <circle cx="8" cy="88" r="4" fill="currentColor" />
        </svg>

        <svg className="absolute bottom-[40%] right-[3%] w-20 h-28 text-[color:var(--color-border)]" viewBox="0 0 80 112" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M40 0 L40 32 L72 32 L72 80 L40 80 L40 112" strokeDasharray="4 4" />
            <circle cx="40" cy="32" r="3" fill="currentColor" />
            <circle cx="72" cy="80" r="3" fill="currentColor" />
        </svg>
    </div>
);

const layers = [
    {
        name: 'Frontend',
        color: 'primary',
        techs: ['React 18', 'TypeScript', 'Tailwind CSS', 'Vite'],
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236z" />
            </svg>
        ),
    },
    {
        name: 'AI Engine',
        color: 'accent',
        techs: ['Gemini Pro', 'LangChain', 'GraphRAG', 'Embeddings'],
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2 7h7l-5.5 4.5 2 7L12 16l-5.5 4.5 2-7L3 9h7l2-7z" />
            </svg>
        ),
    },
    {
        name: 'Backend',
        color: 'secondary',
        techs: ['Node.js', 'FastAPI', 'PostgreSQL', 'Redis'],
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" />
            </svg>
        ),
    },
    {
        name: 'Infrastructure',
        color: 'neutral',
        techs: ['Vercel Edge', 'Docker', 'GitHub Actions', 'Monitoring'],
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 6h16v2H4V6zm0 12v-6h16v6H4z" />
            </svg>
        ),
    },
];

function TechStackSection() {
    const prefersReducedMotion = useReducedMotion();
    const headerRef = useRef(null);
    const headerInView = useInView(headerRef, { once: true, amount: 0.1, margin: "0px 0px -150px 0px" });
    
    return (
        <section
            id="tech"
            className="section-padding relative overflow-hidden"
        >
            {/* Background */}
            <div className="absolute inset-0 section-gradient" />

            {/* Floating tech elements */}
            <FloatingTechElements />

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
                    {/* Decorative gear/cog */}
                    <svg className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 text-secondary-500/10" viewBox="0 0 64 64" fill="currentColor">
                        <path d="M32 20a12 12 0 100 24 12 12 0 000-24zm0 20a8 8 0 110-16 8 8 0 010 16z" />
                        <path d="M32 8l2 6h-4l2-6zm0 48l-2-6h4l-2 6zM8 32l6-2v4l-6-2zm48 0l-6 2v-4l6 2zM14 14l5 4-3 3-4-5 2-2zm36 0l-2 2-4 5-3-3 5-4 4 0zm0 36l-4-5-3 3 5 4 2-2zm-36 0l5-4 3 3-4 5-4-4z" />
                    </svg>

                    <Badge variant="secondary" className="mb-4">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Tech Stack
                    </Badge>

                    <h2 className="font-display text-display-md font-bold mb-6">
                        Built with{' '}
                        <span className="text-gradient-primary">modern tools</span>
                    </h2>

                    <p className="text-lg text-[color:var(--color-text-secondary)]">
                        A carefully selected stack optimized for AI-powered learning experiences.
                    </p>
                </motion.div>

                {/* Tech Stack Layers with enhanced visuals */}
                <div className="max-w-4xl mx-auto space-y-6">
                    {layers.map((layer, index) => {
                        const layerRef = useRef(null);
                        const layerInView = useInView(layerRef, { once: true, amount: 0.2, margin: "0px 0px -200px 0px" });
                        
                        return (
                        <motion.div
                            key={layer.name}
                            ref={layerRef}
                            initial={{ opacity: 0, y: prefersReducedMotion ? 20 : 40 }}
                            animate={layerInView ? { opacity: 1, y: 0 } : {}}
                            transition={{
                                duration: prefersReducedMotion ? 0.3 : 0.5,
                                delay: index * 0.1,
                                type: "tween",
                                ease: [0.25, 0.1, 0.25, 1]
                            }}
                            className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1
                                ${layer.color === 'primary' ? 'bg-primary-500/5 border-primary-500/20 hover:border-primary-500/40 hover:bg-primary-500/10' : ''}
                                ${layer.color === 'accent' ? 'bg-accent-500/5 border-accent-500/20 hover:border-accent-500/40 hover:bg-accent-500/10' : ''}
                                ${layer.color === 'secondary' ? 'bg-secondary-500/5 border-secondary-500/20 hover:border-secondary-500/40 hover:bg-secondary-500/10' : ''}
                                ${layer.color === 'neutral' ? 'bg-[color:var(--color-bg-muted)] border-[color:var(--color-border)] hover:border-[color:var(--color-border-hover)] hover:bg-[color:var(--color-bg-secondary)]' : ''}`}
                        >
                            {/* Layer number indicator */}
                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)] flex items-center justify-center text-xs font-bold">
                                {index + 1}
                            </div>

                            {/* Connection line to next layer */}
                            {index < layers.length - 1 && (
                                <div className="absolute -left-0.5 top-full w-0.5 h-6 bg-gradient-to-b from-[color:var(--color-border)] to-transparent" />
                            )}

                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="md:w-36 flex-shrink-0 flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                                        ${layer.color === 'primary' ? 'bg-primary-500/20 text-primary-500' : ''}
                                        ${layer.color === 'accent' ? 'bg-accent-500/20 text-accent-500' : ''}
                                        ${layer.color === 'secondary' ? 'bg-secondary-500/20 text-secondary-500' : ''}
                                        ${layer.color === 'neutral' ? 'bg-[color:var(--color-bg-secondary)] text-[color:var(--color-text-primary)]' : ''}`}>
                                        {layer.icon}
                                    </div>
                                    <span className={`text-lg font-display font-semibold
                                        ${layer.color === 'primary' ? 'text-primary-500' : ''}
                                        ${layer.color === 'accent' ? 'text-accent-500' : ''}
                                        ${layer.color === 'secondary' ? 'text-secondary-500' : ''}
                                        ${layer.color === 'neutral' ? 'text-[color:var(--color-text-primary)]' : ''}`}>
                                        {layer.name}
                                    </span>
                                </div>
                                <div className="flex-1 flex flex-wrap gap-3">
                                    {layer.techs.map((tech) => (
                                        <span
                                            key={tech}
                                            className="group/tech relative px-4 py-2 rounded-lg bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] text-sm font-medium hover:border-primary-500/30 transition-colors cursor-default"
                                        >
                                            {tech}
                                            {/* Shine effect on hover */}
                                            <div className="absolute inset-0 rounded-lg overflow-hidden opacity-0 group-hover/tech:opacity-100 transition-opacity">
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/tech:translate-x-full transition-transform duration-700" />
                                            </div>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                        );
                    })}
                </div>

                {/* Bottom CTA with enhanced styling */}
                <div className="mt-12 text-center relative">
                    {/* Decorative dotted line */}
                    <svg className="absolute left-1/2 -top-6 -translate-x-1/2 w-1 h-6 text-[color:var(--color-border)]" viewBox="0 0 4 24">
                        <line x1="2" y1="0" x2="2" y2="24" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                    </svg>

                    <p className="text-[color:var(--color-text-muted)] mb-4">
                        All components are open source and battle-tested
                    </p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        {[
                            { label: '100% TypeScript', color: 'success' },
                            { label: '99.9% Uptime', color: 'success' },
                            { label: 'SOC 2 Compliant', color: 'success' },
                        ].map((badge) => (
                            <div key={badge.label} className="relative group/badge">
                                <div className="absolute -inset-1 bg-success/20 rounded-full blur-sm opacity-0 group-hover/badge:opacity-100 transition-opacity" />
                                <Badge variant="success" className="relative">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {badge.label}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default TechStackSection;
