import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ThemeToggle from '../components/ThemeToggle';

interface Tool {
    id: string;
    title: string;
    tagline: string;
    description: string;
    path: string;
    accentColor: string;
    icon: React.ReactNode;
}

const DojoIcon = () => (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
    </svg>
);

const VisualizerIcon = () => (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="6" cy="6" r="3" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="12" cy="18" r="3" />
        <path d="M8.5 7.5L10.5 15.5" />
        <path d="M15.5 7.5L13.5 15.5" />
    </svg>
);

const FlashcardIcon = () => (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 10h20" />
        <path d="M7 15h10" />
    </svg>
);

const AnalyticsIcon = () => (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-4 4 2 5-6" />
    </svg>
);

const AchievementIcon = () => (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
);

const CouncilIcon = () => (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 8l10-5 10 5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 8v11" strokeLinecap="round" />
        <path d="M8 8v11" strokeLinecap="round" />
        <path d="M12 8v11" strokeLinecap="round" />
        <path d="M16 8v11" strokeLinecap="round" />
        <path d="M20 8v11" strokeLinecap="round" />
        <path d="M2 19h20" strokeWidth="2" strokeLinecap="round" />
        <path d="M3 8h18" strokeLinecap="round" />
    </svg>
);

const TOOLS: Tool[] = [
    {
        id: 'dojo',
        title: 'The Dojo',
        tagline: 'Practice & Challenge',
        description: '10 challenge types with real-time AI feedback. Debug, refactor, optimize, and master algorithms through deliberate practice.',
        path: '/dojo',
        accentColor: '#FF6B35',
        icon: <DojoIcon />,
    },
    {
        id: 'visualizer',
        title: 'Visualizer',
        tagline: 'See Code Run',
        description: 'Generate interactive call graphs. Step through execution frame by frame with live variable tracking.',
        path: '/visualizer',
        accentColor: '#00D4AA',
        icon: <VisualizerIcon />,
    },
    {
        id: 'flashcards',
        title: 'Flashcards',
        tagline: 'Remember Forever',
        description: 'SM-2 spaced repetition algorithm schedules reviews at optimal intervals. Never forget what you learn.',
        path: '/srs',
        accentColor: '#A855F7',
        icon: <FlashcardIcon />,
    },
    {
        id: 'analytics',
        title: 'Analytics',
        tagline: 'Track Growth',
        description: 'Skill radar across 6 dimensions. XP progression, activity heatmaps, and streak tracking.',
        path: '/analytics',
        accentColor: '#3B82F6',
        icon: <AnalyticsIcon />,
    },
    {
        id: 'achievements',
        title: 'Achievements',
        tagline: 'Compete & Earn',
        description: '5 leagues from Bronze to Diamond. Daily quests and 14 unlockable badges with rarities.',
        path: '/achievements',
        accentColor: '#F59E0B',
        icon: <AchievementIcon />,
    },
    {
        id: 'council',
        title: 'Council of Dead Engineers',
        tagline: 'Architectural Wisdom',
        description: 'Summon Dijkstra, Hopper, Kay & Liskov. They debate your architectural decision — contradictorily. You synthesize.',
        path: '/council',
        accentColor: '#D97706',
        icon: <CouncilIcon />,
    },
];

// Custom SVG floating elements
const FLOATING_ELEMENTS = [
    // Curly braces
    { type: 'curly', svg: '<path d="M8 4C4 4 4 8 4 12s0 8 4 8M16 4c4 0 4 4 4 8s0 8-4 8" stroke="currentColor" fill="none" stroke-width="1.5"/>' },
    // Angle brackets
    { type: 'angle', svg: '<path d="M9 18l-6-6 6-6M15 6l6 6-6 6" stroke="currentColor" fill="none" stroke-width="1.5"/>' },
    // Function arrow
    { type: 'arrow', svg: '<path d="M4 12h12M12 8l4 4-4 4M20 12a1 1 0 100-2 1 1 0 000 2z" stroke="currentColor" fill="none" stroke-width="1.5"/>' },
    // Hash/pound
    { type: 'hash', svg: '<path d="M4 8h16M4 16h16M8 4v16M16 4v16" stroke="currentColor" fill="none" stroke-width="1.5"/>' },
    // Brackets
    { type: 'brackets', svg: '<path d="M8 4H4v16h4M16 4h4v16h-4" stroke="currentColor" fill="none" stroke-width="1.5"/>' },
    // Semicolon
    { type: 'semi', svg: '<circle cx="12" cy="8" r="2" fill="currentColor"/><path d="M12 14c0 2-1 4-2 5" stroke="currentColor" fill="none" stroke-width="2"/><circle cx="12" cy="14" r="2" fill="currentColor"/>' },
    // Asterisk
    { type: 'asterisk', svg: '<path d="M12 4v16M4 12h16M6 6l12 12M18 6L6 18" stroke="currentColor" fill="none" stroke-width="1.5"/>' },
    // Slash
    { type: 'slash', svg: '<path d="M18 4L6 20" stroke="currentColor" fill="none" stroke-width="2"/>' },
    // Plus
    { type: 'plus', svg: '<path d="M12 4v16M4 12h16" stroke="currentColor" fill="none" stroke-width="2"/>' },
    // Equals
    { type: 'equals', svg: '<path d="M4 8h16M4 16h16" stroke="currentColor" fill="none" stroke-width="2"/>' },
    // Dot
    { type: 'dot', svg: '<circle cx="12" cy="12" r="3" fill="currentColor"/>' },
    // Colon
    { type: 'colon', svg: '<circle cx="12" cy="6" r="2.5" fill="currentColor"/><circle cx="12" cy="18" r="2.5" fill="currentColor"/>' },
    // Pipe
    { type: 'pipe', svg: '<path d="M12 2v20" stroke="currentColor" fill="none" stroke-width="2"/>' },
    // Tilde
    { type: 'tilde', svg: '<path d="M4 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" stroke="currentColor" fill="none" stroke-width="2"/>' },
    // Caret
    { type: 'caret', svg: '<path d="M6 16l6-8 6 8" stroke="currentColor" fill="none" stroke-width="2"/>' },
];

function LearningHub() {
    const bgRef = useRef<HTMLDivElement>(null);

    // Create floating elements with GSAP
    useEffect(() => {
        if (!bgRef.current) return;

        const container = bgRef.current;
        const elements: HTMLDivElement[] = [];
        const colors = ['#FF6B35', '#00D4AA', '#A855F7', '#3B82F6', '#F59E0B', '#EC4899', '#10B981', '#06B6D4', '#EF4444', '#84CC16'];

        // Create 80 floating elements - more visible
        for (let i = 0; i < 80; i++) {
            const el = document.createElement('div');
            el.className = 'absolute pointer-events-none';

            const floatEl = FLOATING_ELEMENTS[i % FLOATING_ELEMENTS.length];
            const color = colors[i % colors.length];
            const size = 28 + Math.random() * 40; // Larger sizes

            el.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="color: ${color}; opacity: 0.35;">${floatEl.svg}</svg>`;
            el.style.left = `${Math.random() * 100}%`;
            el.style.top = `${Math.random() * 100}%`;

            container.appendChild(el);
            elements.push(el);

            // Main floating animation - faster and more noticeable
            gsap.to(el, {
                y: `-=${100 + Math.random() * 150}`,
                x: `+=${-80 + Math.random() * 160}`,
                rotation: -60 + Math.random() * 120,
                duration: 3 + Math.random() * 4,
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut',
                delay: i * 0.03,
            });

            // Opacity pulse - stays visible
            gsap.to(el.firstChild as SVGElement, {
                opacity: 0.15 + Math.random() * 0.3,
                duration: 2 + Math.random() * 2,
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut',
                delay: i * 0.04,
            });

            // Scale breathing
            gsap.to(el, {
                scale: 0.6 + Math.random() * 0.6,
                duration: 2.5 + Math.random() * 3,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: i * 0.05,
            });
        }

        return () => {
            elements.forEach(el => el.remove());
        };
    }, []);

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)] overflow-hidden relative">
            {/* Animated floating elements */}
            <div
                ref={bgRef}
                className="fixed inset-0 overflow-hidden pointer-events-none"
                style={{ zIndex: 0 }}
            />

            {/* Gradient orbs - larger and more vibrant */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
                <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-orange-500/15 to-transparent blur-3xl animate-pulse" />
                <div className="absolute top-1/4 -left-40 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-teal-500/15 to-transparent blur-3xl" />
                <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] rounded-full bg-gradient-to-br from-violet-500/15 to-transparent blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-500/10 to-transparent blur-3xl" />
            </div>

            {/* Subtle grid pattern */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(var(--color-text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-primary) 1px, transparent 1px)`,
                    backgroundSize: '80px 80px',
                    zIndex: 0,
                }}
            />

            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-[color:var(--color-bg-primary)]/80 border-b border-[color:var(--color-border)]">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="p-2 -ml-2 rounded-xl hover:bg-[color:var(--color-bg-muted)] transition-colors"
                        >
                            <svg className="w-5 h-5 text-[color:var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <h1 className="text-xl font-display font-bold text-[color:var(--color-text-primary)]">
                            Learning Hub
                        </h1>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            <main className="relative z-10 max-w-6xl mx-auto px-6 py-16">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-20"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="inline-block mb-6 px-4 py-2 rounded-full bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]"
                    >
                        <span className="text-sm font-medium text-[color:var(--color-text-muted)]">
                            6 tools to accelerate your growth
                        </span>
                    </motion.div>

                    <h2 className="text-4xl md:text-6xl font-display font-bold text-[color:var(--color-text-primary)] mb-6 leading-tight">
                        Your Developer
                        <br />
                        <span className="bg-gradient-to-r from-orange-500 via-violet-500 to-teal-500 bg-clip-text text-transparent">
                            Toolkit
                        </span>
                    </h2>
                    <p className="text-lg text-[color:var(--color-text-muted)] max-w-xl mx-auto">
                        Practice, visualize, memorize, analyze, and stay motivated.
                        Build skills that compound over time.
                    </p>
                </motion.div>

                {/* Tools Grid - Bento Style */}
                <div className="grid grid-cols-12 gap-5">
                    {/* Dojo - Large */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="col-span-12 md:col-span-7"
                    >
                        <ToolCard tool={TOOLS[0]} size="large" />
                    </motion.div>

                    {/* Visualizer */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="col-span-12 md:col-span-5"
                    >
                        <ToolCard tool={TOOLS[1]} size="medium" />
                    </motion.div>

                    {/* Flashcards */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="col-span-12 md:col-span-5"
                    >
                        <ToolCard tool={TOOLS[2]} size="medium" />
                    </motion.div>

                    {/* Analytics */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="col-span-6 md:col-span-3"
                    >
                        <ToolCard tool={TOOLS[3]} size="small" />
                    </motion.div>

                    {/* Achievements */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="col-span-6 md:col-span-4"
                    >
                        <ToolCard tool={TOOLS[4]} size="small" />
                    </motion.div>

                    {/* Council of Dead Engineers */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="col-span-12"
                    >
                        <ToolCard tool={TOOLS[5]} size="large" />
                    </motion.div>
                </div>

                {/* Start CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-12 text-center"
                >
                    <Link
                        to="/dojo"
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold text-lg shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] transition-all"
                    >
                        Start with The Dojo
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </motion.div>

                {/* Coming Soon */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="mt-20 text-center"
                >
                    <p className="text-sm text-[color:var(--color-text-muted)]">
                        <span className="font-medium">Coming soon:</span> AI Code Reviews, Adaptive Learning Paths
                    </p>
                </motion.div>
            </main>
        </div>
    );
}

// Tool Card Component
function ToolCard({ tool, size }: { tool: Tool; size: 'large' | 'medium' | 'small' }) {
    const cardRef = useRef<HTMLDivElement>(null);

    // Mouse follow effect
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        cardRef.current.style.setProperty('--mouse-x', `${x}px`);
        cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    return (
        <Link to={tool.path} className="group block h-full">
            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                className={`relative h-full rounded-3xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] overflow-hidden transition-all duration-300 hover:border-transparent hover:shadow-2xl ${size === 'large' ? 'p-8' : size === 'medium' ? 'p-6' : 'p-5'
                    }`}
            >
                {/* Hover glow effect */}
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                        background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${tool.accentColor}15, transparent 40%)`,
                    }}
                />

                {/* Accent line */}
                <div
                    className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: tool.accentColor }}
                />

                <div className="relative z-10">
                    {/* Icon */}
                    <div
                        className={`inline-flex items-center justify-center rounded-2xl mb-4 transition-transform group-hover:scale-110 ${size === 'small' ? 'w-12 h-12' : 'w-14 h-14'
                            }`}
                        style={{
                            backgroundColor: `${tool.accentColor}20`,
                            color: tool.accentColor,
                        }}
                    >
                        {tool.icon}
                    </div>

                    {/* Tagline */}
                    <p
                        className="text-xs font-bold uppercase tracking-wider mb-2"
                        style={{ color: tool.accentColor }}
                    >
                        {tool.tagline}
                    </p>

                    {/* Title */}
                    <h3 className={`font-bold text-[color:var(--color-text-primary)] mb-2 ${size === 'large' ? 'text-2xl' : size === 'medium' ? 'text-xl' : 'text-lg'
                        }`}>
                        {tool.title}
                    </h3>

                    {/* Description */}
                    {size !== 'small' && (
                        <p className="text-sm text-[color:var(--color-text-muted)] leading-relaxed mb-4">
                            {tool.description}
                        </p>
                    )}

                    {/* Arrow */}
                    <div className="flex items-center gap-2 text-sm font-medium text-[color:var(--color-text-muted)] group-hover:gap-3 transition-all">
                        <span className="group-hover:text-[color:var(--color-text-primary)]">Explore</span>
                        <svg
                            className="w-4 h-4 transition-transform group-hover:translate-x-1"
                            style={{ color: tool.accentColor }}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default LearningHub;
