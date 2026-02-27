import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { useRef, useEffect } from 'react';
import Badge from '../ui/Badge';
import { useReducedMotion } from '../hooks/useReducedMotion';
import Card from '../ui/Card';

/* ── Floating decorative elements ── */
const FloatingGraph = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/3 w-[450px] h-[450px] bg-gradient-to-br from-secondary-500/10 via-transparent to-transparent rounded-full blur-2xl" />
        <div className="absolute -bottom-32 right-1/4 w-[350px] h-[350px] bg-gradient-to-tl from-accent-500/8 via-transparent to-transparent rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-secondary-500/5 via-transparent to-transparent rounded-full" />

        {/* Node-like shapes */}
        <svg className="absolute top-[18%] left-[6%] w-8 h-8 text-secondary-500/15 animate-float" viewBox="0 0 32 32" fill="currentColor">
            <circle cx="16" cy="16" r="14" />
        </svg>
        <svg className="absolute top-[35%] right-[8%] w-6 h-6 text-accent-500/12 animate-float" style={{ animationDelay: '2s' }} viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" />
        </svg>
        <svg className="absolute bottom-[28%] left-[10%] w-10 h-10 text-primary-500/10 animate-float" style={{ animationDelay: '3.5s' }} viewBox="0 0 40 40" fill="currentColor">
            <circle cx="20" cy="20" r="18" />
        </svg>
        <svg className="absolute top-[55%] right-[15%] w-5 h-5 text-violet-500/15 animate-float" style={{ animationDelay: '1.5s' }} viewBox="0 0 20 20" fill="currentColor">
            <circle cx="10" cy="10" r="8" />
        </svg>
        <svg className="absolute top-[12%] right-[25%] w-7 h-7 text-blue-500/10 animate-float" style={{ animationDelay: '4s' }} viewBox="0 0 28 28" fill="currentColor">
            <circle cx="14" cy="14" r="12" />
        </svg>

        {/* Connection lines */}
        <svg className="absolute top-[22%] left-[12%] w-20 h-12 text-[color:var(--color-border)]" viewBox="0 0 80 48" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 40 Q40 10, 75 24" strokeDasharray="4 4" strokeLinecap="round" />
        </svg>
        <svg className="absolute bottom-[35%] right-[12%] w-24 h-16 text-[color:var(--color-border)]" viewBox="0 0 96 64" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M10 50 Q48 15, 86 35" strokeDasharray="3 5" strokeLinecap="round" />
        </svg>
        <svg className="absolute top-[60%] left-[20%] w-16 h-10 text-secondary-500/15" viewBox="0 0 64 40" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 30 Q32 5, 59 22" strokeDasharray="4 4" strokeLinecap="round" />
        </svg>

        {/* Sparkle decorations */}
        <svg className="absolute top-[40%] left-[3%] w-4 h-4 text-accent-500/20 animate-float" style={{ animationDelay: '5s' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" />
        </svg>
        <svg className="absolute bottom-[18%] right-[6%] w-5 h-5 text-secondary-500/15 animate-float" style={{ animationDelay: '2.8s' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" />
        </svg>
    </div>
);

/* ── Wave divider ── */
const WaveDivider = () => (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <svg className="relative block w-full h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,80 C300,120 600,40 900,80 C1050,100 1150,60 1200,80 L1200,120 L0,120 Z"
                className="fill-[color:var(--color-bg-primary)]" />
        </svg>
    </div>
);

/* ── Animated counter ── */
function AnimatedCounter({ value, isInView }: { value: string; isInView: boolean }) {
    const num = parseInt(value.replace(/\D/g, ''));
    const suffix = value.replace(/[0-9]/g, '');
    const motionVal = useMotionValue(0);
    const rounded = useTransform(motionVal, (v) => `${Math.round(v)}${suffix}`);

    useEffect(() => {
        if (isInView) {
            animate(motionVal, num, { duration: 1.6, ease: [0.25, 0.1, 0.25, 1] });
        }
    }, [isInView, num, motionVal]);

    return <motion.span>{rounded}</motion.span>;
}

/* ── Stat cards ── */
const stats = [
    {
        value: '100+',
        label: 'Files Parsed',
        sub: 'per project',
        color: 'secondary',
    },
    {
        value: '50+',
        label: 'Dependencies Traced',
        sub: 'functions & classes',
        color: 'accent',
    },
    {
        value: '10x',
        label: 'Context-Aware',
        sub: 'more precise answers',
        color: 'primary',
    },
];

/* ── Scroll-driven graph SVG ── */
function PipelineSVG({ isInView, prefersReducedMotion }: { isInView: boolean; prefersReducedMotion: boolean }) {
    const dur = prefersReducedMotion ? 0.3 : 0.6;

    return (
        <svg viewBox="0 0 520 400" className="w-full h-auto" fill="none">
            <defs>
                <linearGradient id="graphrag-flow" x1="0" y1="0.5" x2="1" y2="0.5">
                    <stop offset="0%" stopColor="rgb(var(--color-secondary-rgb, 61 90 128))" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="rgb(var(--color-accent-rgb, 129 147 106))" stopOpacity="0.5" />
                </linearGradient>
            </defs>

            {/* ── Stage 1: Folder Upload ── */}
            <motion.g
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: dur, delay: 0 }}
            >
                {/* Folder body */}
                <rect x="30" y="160" width="100" height="80" rx="8"
                    className="fill-[color:var(--color-bg-secondary)] stroke-[color:var(--color-border)]" strokeWidth="1.5" />
                {/* Tab */}
                <path d="M30 168 L30 158 Q30 152, 36 152 L60 152 Q64 152, 66 156 L72 164 L130 164"
                    className="fill-[color:var(--color-bg-secondary)] stroke-[color:var(--color-border)]" strokeWidth="1.5" />
                {/* Files inside */}
                <rect x="45" y="176" width="30" height="6" rx="2" className="fill-secondary-500/30" />
                <rect x="45" y="188" width="45" height="6" rx="2" className="fill-secondary-500/20" />
                <rect x="45" y="200" width="35" height="6" rx="2" className="fill-secondary-500/15" />
                <rect x="45" y="212" width="50" height="6" rx="2" className="fill-secondary-500/10" />
                {/* Label */}
                <text x="80" y="255" textAnchor="middle" className="fill-[color:var(--color-text-muted)]" fontSize="10">Project Folder</text>
            </motion.g>

            {/* ── Stage 1→2 Arrow ── */}
            <motion.path
                d="M140 200 Q170 200, 190 190"
                stroke="url(#graphrag-flow)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="60"
                initial={{ strokeDashoffset: 60 }}
                animate={isInView ? { strokeDashoffset: 0 } : {}}
                transition={{ duration: dur * 1.5, delay: dur * 0.8 }}
            />
            <motion.text
                x="165" y="220"
                textAnchor="middle"
                className="fill-[color:var(--color-text-muted)]"
                fontSize="8"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: dur, delay: dur }}
            >
                upload & parse
            </motion.text>

            {/* ── Stage 2: Knowledge Graph Nodes ── */}
            {/* Module node */}
            <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ type: 'spring', stiffness: 200, damping: 18, delay: dur * 1.2 }}
                style={{ transformOrigin: '280px 110px' }}
            >
                <circle cx="280" cy="110" r="22" className="fill-blue-500/12" />
                <circle cx="280" cy="110" r="14" className="fill-blue-500/25 stroke-blue-500" strokeWidth="1.5" />
                <text x="280" y="114" textAnchor="middle" className="fill-blue-400" fontSize="8" fontWeight="bold">module</text>
            </motion.g>

            {/* Function node 1 */}
            <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ type: 'spring', stiffness: 200, damping: 18, delay: dur * 1.5 }}
                style={{ transformOrigin: '240px 190px' }}
            >
                <circle cx="240" cy="190" r="16" className="fill-amber-500/12" />
                <circle cx="240" cy="190" r="11" className="fill-amber-500/25 stroke-amber-500" strokeWidth="1.5" />
                <text x="240" y="194" textAnchor="middle" className="fill-amber-400" fontSize="7" fontWeight="bold">fn</text>
            </motion.g>

            {/* Class node */}
            <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ type: 'spring', stiffness: 200, damping: 18, delay: dur * 1.8 }}
                style={{ transformOrigin: '320px 200px' }}
            >
                <circle cx="320" cy="200" r="18" className="fill-violet-500/12" />
                <circle cx="320" cy="200" r="12" className="fill-violet-500/25 stroke-violet-500" strokeWidth="1.5" />
                <text x="320" y="204" textAnchor="middle" className="fill-violet-400" fontSize="7" fontWeight="bold">cls</text>
            </motion.g>

            {/* Function node 2 */}
            <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ type: 'spring', stiffness: 200, damping: 18, delay: dur * 2.1 }}
                style={{ transformOrigin: '270px 275px' }}
            >
                <circle cx="270" cy="275" r="13" className="fill-amber-500/12" />
                <circle cx="270" cy="275" r="9" className="fill-amber-500/20 stroke-amber-400" strokeWidth="1.5" />
                <text x="270" y="279" textAnchor="middle" className="fill-amber-400" fontSize="7" fontWeight="bold">fn</text>
            </motion.g>

            {/* Variable node */}
            <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ type: 'spring', stiffness: 200, damping: 18, delay: dur * 2.3 }}
                style={{ transformOrigin: '350px 280px' }}
            >
                <circle cx="350" cy="280" r="10" className="fill-green-500/12" />
                <circle cx="350" cy="280" r="7" className="fill-green-500/20 stroke-green-500" strokeWidth="1.5" />
                <text x="350" y="284" textAnchor="middle" className="fill-green-400" fontSize="6" fontWeight="bold">var</text>
            </motion.g>

            {/* ── Edges ── */}
            {[
                { d: 'M275 125 Q260 155, 246 179', delay: 2.5, color: 'stroke-amber-500/40' },
                { d: 'M290 125 Q305 155, 315 187', delay: 2.7, color: 'stroke-violet-500/40' },
                { d: 'M248 202 Q258 235, 265 264', delay: 2.9, color: 'stroke-amber-400/40' },
                { d: 'M330 212 Q340 245, 348 270', delay: 3.1, color: 'stroke-green-500/40' },
                { d: 'M252 197 Q285 205, 308 200', delay: 3.0, color: 'stroke-secondary-500/30' },
            ].map(({ d, delay, color }, i) => (
                <motion.path
                    key={i}
                    d={d}
                    className={color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeDasharray="80"
                    initial={{ strokeDashoffset: 80 }}
                    animate={isInView ? { strokeDashoffset: 0 } : {}}
                    transition={{ duration: dur, delay: dur * delay }}
                />
            ))}

            {/* ── Stage 2→3 Arrow ── */}
            <motion.path
                d="M365 200 Q400 200, 420 195"
                stroke="url(#graphrag-flow)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="60"
                initial={{ strokeDashoffset: 60 }}
                animate={isInView ? { strokeDashoffset: 0 } : {}}
                transition={{ duration: dur, delay: dur * 3.3 }}
            />

            {/* ── Stage 3: Chat with context ── */}
            <motion.g
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: dur, delay: dur * 3.5 }}
            >
                {/* Chat bubble */}
                <rect x="420" y="140" width="85" height="110" rx="12"
                    className="fill-[color:var(--color-bg-secondary)] stroke-[color:var(--color-border)]" strokeWidth="1.5" />
                {/* Chat lines */}
                <rect x="432" y="155" width="50" height="5" rx="2.5" className="fill-primary-500/25" />
                <rect x="432" y="166" width="60" height="5" rx="2.5" className="fill-primary-500/15" />
                <rect x="432" y="177" width="40" height="5" rx="2.5" className="fill-primary-500/10" />
                {/* "Context ready" indicator */}
                <rect x="432" y="195" width="60" height="16" rx="8" className="fill-accent-500/10 stroke-accent-500/30" strokeWidth="1" />
                <circle cx="442" cy="203" r="3" className="fill-accent-500" />
                <text x="466" y="207" textAnchor="middle" className="fill-accent-500" fontSize="7" fontWeight="600">Context ✓</text>
                {/* Tail */}
                <path d="M420 238 L412 248 L435 238" className="fill-[color:var(--color-bg-secondary)] stroke-[color:var(--color-border)]" strokeWidth="1.5" />
                {/* Label */}
                <text x="462" y="270" textAnchor="middle" className="fill-[color:var(--color-text-muted)]" fontSize="10">Smart Chat</text>
            </motion.g>

            {/* ── Legend ── */}
            <motion.g
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: dur, delay: dur * 3.8 }}
            >
                {[
                    { cx: 40, label: 'module', fill: 'fill-blue-500/40' },
                    { cx: 115, label: 'function', fill: 'fill-amber-500/40' },
                    { cx: 195, label: 'class', fill: 'fill-violet-500/40' },
                    { cx: 260, label: 'variable', fill: 'fill-green-500/40' },
                ].map(({ cx, label, fill }) => (
                    <g key={label}>
                        <circle cx={cx} cy="360" r="5" className={fill} />
                        <text x={cx + 10} y="364" className="fill-[color:var(--color-text-muted)]" fontSize="8">{label}</text>
                    </g>
                ))}
            </motion.g>
        </svg>
    );
}

/* ── Main Section ── */
function GraphRAGPipelineSection() {
    const prefersReducedMotion = useReducedMotion();
    const headerRef = useRef(null);
    const headerInView = useInView(headerRef, { once: true, amount: 0.1, margin: '0px 0px -150px 0px' });
    const contentRef = useRef(null);
    const contentInView = useInView(contentRef, { once: true, amount: 0.15, margin: '0px 0px -100px 0px' });
    const statsRef = useRef(null);
    const statsInView = useInView(statsRef, { once: true, amount: 0.3, margin: '0px 0px -120px 0px' });

    return (
        <section
            id="graphrag-pipeline"
            className="section-padding relative overflow-hidden bg-[color:var(--color-bg-secondary)]"
        >
            {/* Top border */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[color:var(--color-border)] to-transparent" />

            <FloatingGraph />

            <div className="container-custom relative z-10">
                {/* ── Header ── */}
                <motion.div
                    ref={headerRef}
                    initial={{ opacity: 0, y: prefersReducedMotion ? 10 : 30 }}
                    animate={headerInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: prefersReducedMotion ? 0.3 : 0.5, type: 'tween', ease: [0.25, 0.1, 0.25, 1] }}
                    className="text-center max-w-3xl mx-auto mb-16 relative"
                >
                    {/* Decorative node cluster */}
                    <svg className="absolute -top-8 left-1/2 -translate-x-1/2 w-36 h-10 text-secondary-500/20" viewBox="0 0 144 40" fill="currentColor">
                        <circle cx="36" cy="20" r="6" />
                        <circle cx="72" cy="12" r="4" opacity="0.6" />
                        <circle cx="108" cy="20" r="6" />
                        <line x1="42" y1="20" x2="66" y2="14" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
                        <line x1="78" y1="14" x2="102" y2="20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
                    </svg>

                    <Badge variant="secondary" className="mb-4 mt-6">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                        Codebase Intelligence
                    </Badge>

                    <h2 className="font-display text-display-md font-bold mb-6">
                        <span className="text-gradient-primary">Upload. Understand. Ask.</span>
                    </h2>

                    <p className="text-lg text-[color:var(--color-text-secondary)]">
                        Drop your project folder and watch as GraphRAG maps every file, function, and
                        dependency into a knowledge graph — giving the AI complete context about your codebase.
                    </p>
                </motion.div>

                {/* ── Content: SVG illustration + feature highlights ── */}
                <motion.div
                    ref={contentRef}
                    className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16"
                >
                    {/* SVG wrapped in terminal card for visual weight */}
                    <div className="flex-1 w-full relative">
                        <div className="absolute -inset-3 bg-gradient-to-br from-secondary-500/5 via-transparent to-accent-500/5 rounded-3xl" />
                        <Card variant="terminal" padding="none" className="shadow-elevated relative">
                            <Card.TerminalHeader title="graphrag_pipeline.py" />
                            <div className="p-6 flex items-center justify-center">
                                <PipelineSVG isInView={contentInView} prefersReducedMotion={prefersReducedMotion} />
                            </div>
                        </Card>
                    </div>

                    {/* Feature highlights */}
                    <motion.div
                        className="flex-1 space-y-6"
                        initial={{ opacity: 0, x: prefersReducedMotion ? 10 : 40 }}
                        animate={contentInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: prefersReducedMotion ? 0.3 : 0.6, delay: 0.2, type: 'tween', ease: [0.25, 0.1, 0.25, 1] }}
                    >
                        {[
                            {
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                ),
                                title: 'One-Click Upload',
                                desc: 'Drop your project folder or connect a repository. Every file is parsed and indexed automatically.',
                                color: 'secondary',
                            },
                            {
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                ),
                                title: 'Dependency Mapping',
                                desc: 'Functions, classes, modules, and variables are connected — revealing the hidden architecture.',
                                color: 'accent',
                            },
                            {
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                ),
                                title: 'Context-Aware Chat',
                                desc: 'The AI sees your entire codebase graph, so its answers reference real functions and real relationships.',
                                color: 'primary',
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={item.title}
                                className="flex items-start gap-4 p-4 rounded-xl bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)] hover:border-[color:var(--color-border-hover)] transition-colors group"
                                initial={{ opacity: 0, y: 15 }}
                                animate={contentInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.4, delay: 0.3 + i * 0.1, type: 'tween', ease: [0.25, 0.1, 0.25, 1] }}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110
                                    ${item.color === 'secondary' ? 'bg-secondary-500/10 text-secondary-500' : ''}
                                    ${item.color === 'accent' ? 'bg-accent-500/10 text-accent-500' : ''}
                                    ${item.color === 'primary' ? 'bg-primary-500/10 text-primary-500' : ''}`}
                                >
                                    {item.icon}
                                </div>
                                <div>
                                    <h4 className="font-display font-semibold mb-1">{item.title}</h4>
                                    <p className="text-sm text-[color:var(--color-text-secondary)]">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* ── Stats ── */}
                <motion.div
                    ref={statsRef}
                    className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
                >
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            className="text-center p-6 rounded-2xl bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)]"
                            initial={{ opacity: 0, y: 20 }}
                            animate={statsInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.4, delay: i * 0.1, type: 'tween', ease: [0.25, 0.1, 0.25, 1] }}
                        >
                            <div className={`text-3xl font-display font-bold mb-1
                                ${stat.color === 'secondary' ? 'text-secondary-500' : ''}
                                ${stat.color === 'accent' ? 'text-accent-500' : ''}
                                ${stat.color === 'primary' ? 'text-primary-500' : ''}`}
                            >
                                <AnimatedCounter value={stat.value} isInView={statsInView} />
                            </div>
                            <div className="font-medium text-sm">{stat.label}</div>
                            <div className="text-xs text-[color:var(--color-text-muted)]">{stat.sub}</div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            <WaveDivider />
        </section>
    );
}

export default GraphRAGPipelineSection;
