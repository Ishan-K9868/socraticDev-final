import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Section color scheme - each section gets its own color
const getSectionColor = (icon: string, isActive: boolean) => {
    const colors = {
        hero: isActive ? 'text-purple-500' : 'text-purple-400/50',
        problem: isActive ? 'text-red-500' : 'text-red-400/50',
        solution: isActive ? 'text-yellow-500' : 'text-yellow-400/50',
        'socratic-demo': isActive ? 'text-blue-500' : 'text-blue-400/50',
        comparison: isActive ? 'text-green-500' : 'text-green-400/50',
        features: isActive ? 'text-indigo-500' : 'text-indigo-400/50',
        demo: isActive ? 'text-orange-500' : 'text-orange-400/50',
        'how-it-works': isActive ? 'text-cyan-500' : 'text-cyan-400/50',
        tech: isActive ? 'text-pink-500' : 'text-pink-400/50',
        cta: isActive ? 'text-emerald-500' : 'text-emerald-400/50',
    };
    return colors[icon as keyof typeof colors] || (isActive ? 'text-primary-500' : 'text-gray-400');
};

const getSectionBgColor = (icon: string) => {
    const colors = {
        hero: 'bg-purple-500',
        problem: 'bg-red-500',
        solution: 'bg-yellow-500',
        'socratic-demo': 'bg-blue-500',
        comparison: 'bg-green-500',
        features: 'bg-indigo-500',
        demo: 'bg-orange-500',
        'how-it-works': 'bg-cyan-500',
        tech: 'bg-pink-500',
        cta: 'bg-emerald-500',
    };
    return colors[icon as keyof typeof colors] || 'bg-primary-500';
};

// Custom SVG Icons for each section
const SectionIcon = ({ type, isActive }: { type: string; isActive: boolean }) => {
    const iconClass = `w-6 h-6 transition-colors duration-300 ${getSectionColor(type, isActive)}`;

    switch (type) {
        case 'hero':
            // Rocket icon for Hero
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            );
        case 'problem':
            // Alert/Warning icon for Problem
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            );
        case 'solution':
            // Lightbulb icon for Solution
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            );
        case 'socratic-demo':
            // Chat/Dialogue icon for Socratic Demo
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            );
        case 'comparison':
            // Scale/Balance icon for Comparison
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
            );
        case 'features':
            // Grid/Features icon
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            );
        case 'demo':
            // Dojo/Training icon (fire/flame)
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
            );
        case 'how-it-works':
            // Process/Flow icon
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            );
        case 'tech':
            // Code/Tech icon
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            );
        case 'cta':
            // Arrow/Action icon for CTA
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            );
        default:
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            );
    }
};

const sections = [
    { id: 'hero', label: 'Home', icon: 'hero' },
    { id: 'problem', label: 'The Problem', icon: 'problem' },
    { id: 'solution', label: 'Our Solution', icon: 'solution' },
    { id: 'socratic-demo', label: 'See It In Action', icon: 'socratic-demo' },
    { id: 'comparison', label: 'Before & After', icon: 'comparison' },
    { id: 'features', label: 'Features', icon: 'features' },
    { id: 'demo', label: 'The Dojo', icon: 'demo' },
    { id: 'how-it-works', label: 'How It Works', icon: 'how-it-works' },
    { id: 'tech', label: 'Tech Stack', icon: 'tech' },
    { id: 'cta', label: 'Get Started', icon: 'cta' },
];

export const SectionIndicators = () => {
    const [activeSection, setActiveSection] = useState(0);

    useEffect(() => {
        let ticking = false;

        const updateActiveSection = () => {
            const sectionPositions = sections
                .map((section, index) => {
                    const element = document.getElementById(section.id);
                    if (!element) return null;
                    return { index, top: element.offsetTop };
                })
                .filter((item): item is { index: number; top: number } => item !== null)
                .sort((a, b) => a.top - b.top);

            if (sectionPositions.length === 0) return;

            // Offset accounts for fixed navbar height and gives earlier activation.
            const scrollPosition = window.scrollY + 140;
            let currentIndex = sectionPositions[0].index;

            for (const section of sectionPositions) {
                if (scrollPosition >= section.top) {
                    currentIndex = section.index;
                } else {
                    break;
                }
            }

            setActiveSection(currentIndex);
        };

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateActiveSection();
                    ticking = false;
                });
                ticking = true;
            }
        };

        updateActiveSection();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', updateActiveSection);

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', updateActiveSection);
        };
    }, []);

    const scrollToSection = (sectionId: string) => {
        const navbarOffset = 96;
        const element = document.getElementById(sectionId);
        if (!element && sectionId !== 'hero') return;

        const targetTop = sectionId === 'hero'
            ? Math.max(0, (element?.offsetTop ?? 0) - navbarOffset)
            : Math.max(0, element!.offsetTop - navbarOffset);

        window.scrollTo({ top: targetTop, behavior: 'smooth' });
    };

    return (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:block">
            <div className="flex flex-col gap-4 bg-[color:var(--color-bg-secondary)]/80 backdrop-blur-md border border-[color:var(--color-border)] rounded-2xl p-3 shadow-lg">
                {sections.map((section, index) => {
                    const isActive = activeSection === index;
                    return (
                        <div key={section.id} className="relative group">
                            <motion.button
                                onClick={() => scrollToSection(section.id)}
                                animate={{
                                    scale: isActive ? 1.1 : 1,
                                }}
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                className={`relative p-2 rounded-xl transition-all duration-300 ${
                                    isActive
                                        ? `${getSectionBgColor(section.icon)}/10 shadow-md`
                                        : 'hover:bg-[color:var(--color-bg-muted)]'
                                }`}
                                aria-label={`Go to ${section.label} section`}
                            >
                                <SectionIcon type={section.icon} isActive={isActive} />
                                
                                {/* Active indicator line - perfectly centered */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className={`absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-6 ${getSectionBgColor(section.icon)} rounded-full`}
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </motion.button>

                            {/* Tooltip */}
                            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                                <div className="bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
                                    <span className="font-medium">{section.label}</span>
                                </div>
                                {/* Arrow */}
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-[color:var(--color-border)]" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SectionIndicators;
