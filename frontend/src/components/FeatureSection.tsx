import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { staggerContainer } from '../utils/animationVariants';

// Floating feature elements
const FloatingFeatures = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-accent-500/15 via-primary-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-secondary-500/15 via-transparent to-transparent rounded-full blur-3xl" />

        {/* Floating icons */}
        <svg className="absolute top-[15%] left-[6%] w-10 h-10 text-accent-500/20 animate-float" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>

        <svg className="absolute top-[30%] right-[8%] w-8 h-8 text-primary-500/15 animate-float" style={{ animationDelay: '1.5s' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>

        <svg className="absolute bottom-[20%] left-[10%] w-12 h-12 text-secondary-500/15 animate-float" style={{ animationDelay: '2.5s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>

        <svg className="absolute bottom-[35%] right-[5%] w-9 h-9 text-accent-400/20 animate-float" style={{ animationDelay: '3s' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>

        {/* Decorative hexagon pattern */}
        <div className="absolute top-[40%] left-[3%]">
            <svg className="w-16 h-16 text-[color:var(--color-border)]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1">
                <polygon points="32,4 58,18 58,46 32,60 6,46 6,18" />
            </svg>
        </div>

        <div className="absolute bottom-[15%] right-[8%]">
            <svg className="w-12 h-12 text-[color:var(--color-border)]" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1">
                <polygon points="24,4 44,14 44,34 24,44 4,34 4,14" />
            </svg>
        </div>
    </div>
);

// Section divider component
const SectionDivider = ({ variant = 'wave' }: { variant?: 'wave' | 'angle' | 'dots' }) => {
    if (variant === 'wave') {
        return (
            <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
                <svg className="relative block w-full h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path
                        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.38,118.92,150.43,94.81,321.39,56.44Z"
                        className="fill-[color:var(--color-bg-secondary)]"
                    />
                </svg>
            </div>
        );
    }

    if (variant === 'angle') {
        return (
            <div className="absolute bottom-0 left-0 right-0">
                <svg className="relative block w-full h-12" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <polygon points="1200,0 1200,120 0,120" className="fill-[color:var(--color-bg-secondary)]" />
                </svg>
            </div>
        );
    }

    return (
        <div className="absolute bottom-0 left-0 right-0 h-8 flex items-center justify-center gap-2">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-[color:var(--color-border)]" />
            ))}
        </div>
    );
};

const features = [
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        title: 'Socratic Questioning',
        description: 'The AI asks you questions that lead you to discover the answer yourself, building genuine understanding.',
        color: 'accent',
        gradient: 'from-accent-500/20 to-accent-500/5',
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
        ),
        title: 'GraphRAG Architecture',
        description: 'Understands your entire codebase through a knowledge graph, giving context-aware assistance.',
        color: 'secondary',
        gradient: 'from-secondary-500/20 to-secondary-500/5',
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        title: 'Code Verification',
        description: 'Every suggestion is verified against your project context before being shown to you.',
        color: 'primary',
        gradient: 'from-primary-500/20 to-primary-500/5',
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
        ),
        title: 'Dual Mode System',
        description: 'Switch between Learning Mode for education and Building Mode for productivity seamlessly.',
        color: 'accent',
        gradient: 'from-accent-500/20 to-accent-500/5',
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        title: 'Spaced Repetition',
        description: 'Built-in review system ensures concepts you learn actually stick in long-term memory.',
        color: 'secondary',
        gradient: 'from-secondary-500/20 to-secondary-500/5',
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        title: 'Progress Analytics',
        description: 'Track your learning journey with detailed insights on concepts mastered and areas to improve.',
        color: 'primary',
        gradient: 'from-primary-500/20 to-primary-500/5',
    },
];

function FeatureSection() {
    const prefersReducedMotion = useReducedMotion();
    const headerRef = useRef(null);
    const headerInView = useInView(headerRef, { once: true, amount: 0.1, margin: "0px 0px -150px 0px" });
    
    return (
        <section
            id="features"
            className="section-padding relative overflow-hidden bg-[color:var(--color-bg-secondary)]"
        >
            {/* Section top divider */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[color:var(--color-border)] to-transparent" />

            {/* Floating elements */}
            <FloatingFeatures />

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
                    {/* Decorative brackets */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                        <svg className="w-6 h-8 text-primary-500/30" viewBox="0 0 24 32" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 4 L6 4 L6 28 L18 28" strokeLinecap="round" />
                        </svg>
                        <div className="w-8 h-1 bg-primary-500/20 rounded" />
                        <svg className="w-6 h-8 text-primary-500/30" viewBox="0 0 24 32" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 4 L18 4 L18 28 L6 28" strokeLinecap="round" />
                        </svg>
                    </div>

                    <Badge variant="primary" className="mb-4 mt-8">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        Features
                    </Badge>

                    <h2 className="font-display text-display-md font-bold mb-6">
                        Everything you need to{' '}
                        <span className="text-gradient-primary">truly learn</span>
                    </h2>

                    <p className="text-lg text-[color:var(--color-text-secondary)]">
                        Built on learning science principles, not just engineering convenience.
                    </p>
                </motion.div>

                {/* Feature Grid */}
                <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1, margin: "0px 0px -100px 0px" }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
                >
                    {features.map((feature, index) => {
                        const [rotateX, setRotateX] = useState(0);
                        const [rotateY, setRotateY] = useState(0);
                        
                        const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
                            if (prefersReducedMotion) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = (e.clientX - rect.left) / rect.width - 0.5;
                            const y = (e.clientY - rect.top) / rect.height - 0.5;
                            setRotateX(y * 15);
                            setRotateY(x * -15);
                        };
                        
                        const handleMouseLeave = () => {
                            setRotateX(0);
                            setRotateY(0);
                        };
                        
                        return (
                        <motion.div
                            key={feature.title}
                            variants={{
                                hidden: {
                                    opacity: 0,
                                    rotateY: prefersReducedMotion ? 0 : -90,
                                    scale: prefersReducedMotion ? 1 : 0.8
                                },
                                visible: {
                                    opacity: 1,
                                    rotateY: 0,
                                    scale: 1,
                                    transition: {
                                        duration: prefersReducedMotion ? 0.3 : 0.5,
                                        delay: index * 0.08,
                                        type: "tween",
                                        ease: [0.25, 0.1, 0.25, 1]
                                    }
                                }
                            }}
                            animate={{ rotateX, rotateY }}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                        >
                            <Card
                                className={`group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full`}
                            >
                            {/* Gradient background on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

                            {/* Feature number */}
                            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[color:var(--color-bg-muted)] flex items-center justify-center text-xs font-bold text-[color:var(--color-text-muted)]">
                                {String(index + 1).padStart(2, '0')}
                            </div>

                            <div className="relative">
                                {/* Icon */}
                                <motion.div 
                                    initial={{ scale: 0, rotate: 0 }}
                                    whileInView={{
                                        scale: 1,
                                        rotate: prefersReducedMotion ? 0 : 360
                                    }}
                                    viewport={{ once: true }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 15,
                                        delay: 0.2 + index * 0.05
                                    }}
                                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110
                                    ${feature.color === 'accent' ? 'bg-accent-500/10 text-accent-500' : ''}
                                    ${feature.color === 'secondary' ? 'bg-secondary-500/10 text-secondary-500' : ''}
                                    ${feature.color === 'primary' ? 'bg-primary-500/10 text-primary-500' : ''}`}
                                >
                                    {feature.icon}
                                </motion.div>

                                {/* Content */}
                                <h3 className="font-display text-lg font-semibold mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-[color:var(--color-text-secondary)] text-sm">
                                    {feature.description}
                                </p>

                                {/* Learn more link */}
                                <div className="mt-4 flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className={`${feature.color === 'accent' ? 'text-accent-500' : ''} ${feature.color === 'secondary' ? 'text-secondary-500' : ''} ${feature.color === 'primary' ? 'text-primary-500' : ''}`}>
                                        Learn more
                                    </span>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Card>
                        </motion.div>
                    );
                    })}
                </motion.div>
            </div>

            {/* Wave divider to next section */}
            <SectionDivider variant="wave" />
        </section>
    );
}

export default FeatureSection;
