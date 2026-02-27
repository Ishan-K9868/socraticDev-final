import { motion, useInView, useMotionValue, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import SolutionSection from './SolutionSection';
import CardGenAnimation from './solution/CardGenAnimation';
import CodeVisualizerAnimation from './solution/CodeVisualizerAnimation';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

/* ═══════════════════════════════════════════════════════════════════
 *  CARD GENERATION SECTION
 *  Styled to match the richness of the original Solution section.
 * ═══════════════════════════════════════════════════════════════════ */

function CardGenSection() {
    const prefersReducedMotion = useReducedMotion();
    const sectionRef = useRef(null);
    const inView = useInView(sectionRef, { once: true, amount: 0.2, margin: '0px 0px -100px 0px' });

    // Static progress = 1 so the SVG renders fully (we use CSS/inView for the entrance)
    const fullProgress = useMotionValue(1);

    const steps = [
        { num: '01', text: 'Ask a question in Chat or solve a Dojo challenge', color: 'text-primary-500' },
        { num: '02', text: 'Click "Generate Cards" — AI extracts key concepts', color: 'text-accent-500' },
        { num: '03', text: 'Review, edit, and save to your personal deck', color: 'text-secondary-500' },
    ];

    return (
        <section className="py-8 lg:py-10 pb-14 lg:pb-16 relative overflow-hidden">
            {/* Top divider */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[color:var(--color-border)] to-transparent" />

            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-bl from-accent-500/10 via-primary-500/5 to-transparent rounded-full blur-2xl" />
                <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-gradient-to-tr from-primary-500/10 via-transparent to-transparent rounded-full blur-2xl" />

                {/* Floating icons */}
                <svg className="absolute top-[20%] left-[6%] w-10 h-10 text-accent-500/15 animate-float" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <svg className="absolute top-[35%] right-[8%] w-8 h-8 text-primary-500/12 animate-float" style={{ animationDelay: '2s' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" />
                </svg>
                <svg className="absolute bottom-[25%] left-[10%] w-6 h-6 text-accent-400/20 animate-float" style={{ animationDelay: '3.5s' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" />
                </svg>
            </div>

            {/* Center glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-[500px] h-[500px] bg-gradient-radial from-accent-500/10 via-transparent to-transparent rounded-full" />

            <div className="container-custom relative z-10">
                {/* Header */}
                <motion.div
                    ref={sectionRef}
                    initial={{ opacity: 0, y: prefersReducedMotion ? 10 : 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: prefersReducedMotion ? 0.3 : 0.5, type: 'tween', ease: [0.25, 0.1, 0.25, 1] }}
                    className="text-center max-w-3xl mx-auto mb-6 lg:mb-8 relative"
                >
                    <svg className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-12 text-accent-500/20" viewBox="0 0 192 48" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 40 Q96 8 184 40" strokeLinecap="round" />
                        <circle cx="96" cy="20" r="4" fill="currentColor" opacity="0.5" />
                    </svg>

                    <Badge variant="accent" className="mb-4">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        AI Flashcards
                    </Badge>

                    <h2 className="font-display text-display-md font-bold mb-6">
                        Turn Every Conversation Into{' '}
                        <span className="text-gradient-primary relative">
                            Knowledge
                            <svg className="absolute -top-2 -right-6 w-5 h-5 text-accent-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" />
                            </svg>
                        </span>
                    </h2>

                    <p className="text-lg text-[color:var(--color-text-secondary)]">
                        Generate revision flashcards from any chat message or Dojo challenge.
                        AI creates targeted cards, you review and save — building a personal knowledge deck.
                    </p>
                </motion.div>

                {/* Main content: Terminal card with SVG + feature pills */}
                <div className="relative max-w-5xl mx-auto">
                    {/* Floating step pills */}
                    <div className="absolute inset-0 pointer-events-none">
                        {steps.map((step, index) => {
                            const positions = [
                                { top: '5%', left: '-3%' },
                                { top: '15%', right: '-3%' },
                                { bottom: '10%', left: '2%' },
                            ];
                            const pos = positions[index];

                            return (
                                <motion.div
                                    key={step.num}
                                    initial={{
                                        opacity: 0,
                                        x: index % 2 === 0 ? (prefersReducedMotion ? -20 : -50) : (prefersReducedMotion ? 20 : 50)
                                    }}
                                    animate={inView ? { opacity: 1, x: 0 } : {}}
                                    transition={{
                                        duration: prefersReducedMotion ? 0.4 : 0.5,
                                        delay: 0.3 + index * 0.12,
                                        type: 'tween',
                                        ease: [0.25, 0.1, 0.25, 1]
                                    }}
                                    className={`absolute pointer-events-auto hidden lg:block animate-float`}
                                    style={{
                                        top: pos.top,
                                        bottom: pos.bottom,
                                        left: pos.left,
                                        right: pos.right,
                                        animationDelay: `${index * 0.8}s`,
                                    }}
                                >
                                    <div className={`absolute -inset-2 rounded-2xl blur-lg opacity-20 ${index === 0 ? 'bg-primary-500' : index === 1 ? 'bg-accent-500' : 'bg-secondary-500'
                                        }`} />
                                    <Card className="flex items-center gap-3 !p-4 relative">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-primary-500/10 text-primary-500' :
                                            index === 1 ? 'bg-accent-500/10 text-accent-500' :
                                                'bg-secondary-500/10 text-secondary-500'
                                            }`}>
                                            {step.num}
                                        </div>
                                        <p className="text-sm text-[color:var(--color-text-secondary)] max-w-[180px]">
                                            {step.text}
                                        </p>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Central mockup card */}
                    <motion.div
                        initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95, y: prefersReducedMotion ? 20 : 30 }}
                        animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
                        transition={{ duration: prefersReducedMotion ? 0.4 : 0.6, type: 'tween', ease: [0.25, 0.1, 0.25, 1] }}
                        className="relative"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-br from-accent-500/5 via-transparent to-primary-500/5 rounded-3xl" />
                        <div className="absolute -bottom-2 -right-2 w-40 h-40 bg-accent-500/5 rounded-full blur-2xl" />

                        <Card variant="terminal" padding="none" className="shadow-elevated relative">
                            <Card.TerminalHeader title="AI Card Generator" />
                            <div className="p-4 sm:p-5 lg:p-6 flex items-center justify-center h-[clamp(250px,40vh,360px)] sm:h-[clamp(270px,42vh,380px)]">
                                <div className="w-full h-full max-w-[760px]">
                                    <CardGenAnimation progress={fullProgress} />
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* Bottom stats */}
                <motion.div
                    className="mt-6 flex flex-wrap justify-center gap-8"
                    initial={{ opacity: 0, y: 15 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.5, type: 'tween', ease: [0.25, 0.1, 0.25, 1] }}
                >
                    {[
                        { label: 'Cards per session', value: '~15', icon: '🃏' },
                        { label: 'Retention boost', value: '3×', icon: '🧠' },
                        { label: 'Time to generate', value: '<2s', icon: '⚡' },
                    ].map(stat => (
                        <div key={stat.label} className="text-center">
                            <div className="text-2xl font-display font-bold text-[color:var(--color-text-primary)]">
                                {stat.icon} {stat.value}
                            </div>
                            <div className="text-xs text-[color:var(--color-text-muted)]">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════════════
 *  CODE VISUALIZER SECTION
 * ═══════════════════════════════════════════════════════════════════ */

function CodeVisualizerSection() {
    const prefersReducedMotion = useReducedMotion();
    const sectionRef = useRef(null);
    const inView = useInView(sectionRef, { once: true, amount: 0.2, margin: '0px 0px -100px 0px' });

    const fullProgress = useMotionValue(1);

    const features = [
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
            ),
            title: 'Call Graph',
            desc: 'See which functions call which',
            color: 'amber',
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            title: 'Execution Trace',
            desc: 'Follow the flow step by step',
            color: 'blue',
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
            ),
            title: 'Bug Detection',
            desc: 'Spot issues in the graph',
            color: 'violet',
        },
    ];

    return (
        <section className="py-8 lg:py-10 pb-14 lg:pb-16 relative overflow-hidden bg-[color:var(--color-bg-secondary)]">
            {/* Top divider */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[color:var(--color-border)] to-transparent" />

            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-secondary-500/10 via-transparent to-transparent rounded-full blur-2xl" />
                <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] bg-gradient-to-tl from-accent-500/8 via-transparent to-transparent rounded-full blur-2xl" />

                {/* Code brackets decoration */}
                <svg className="absolute top-[25%] right-[5%] w-16 h-20 text-secondary-500/10 animate-float" style={{ animationDelay: '1s' }} viewBox="0 0 64 80" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 8 L8 8 L8 72 L20 72" strokeLinecap="round" />
                    <path d="M44 8 L56 8 L56 72 L44 72" strokeLinecap="round" />
                </svg>

                <svg className="absolute bottom-[30%] left-[6%] w-10 h-10 text-accent-500/15 animate-float" style={{ animationDelay: '2.5s' }} viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" />
                </svg>
            </div>

            <div className="container-custom relative z-10">
                {/* Header */}
                <motion.div
                    ref={sectionRef}
                    initial={{ opacity: 0, y: prefersReducedMotion ? 10 : 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: prefersReducedMotion ? 0.3 : 0.5, type: 'tween', ease: [0.25, 0.1, 0.25, 1] }}
                    className="text-center max-w-3xl mx-auto mb-6 lg:mb-8 relative"
                >
                    <Badge variant="secondary" className="mb-4">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Code Visualizer
                    </Badge>

                    <h2 className="font-display text-display-md font-bold mb-6">
                        See Your Code&apos;s{' '}
                        <span className="text-gradient-primary relative">
                            Architecture
                            <svg className="absolute -top-2 -right-6 w-5 h-5 text-secondary-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" />
                            </svg>
                        </span>
                    </h2>

                    <p className="text-lg text-[color:var(--color-text-secondary)]">
                        Paste any Python code and instantly see its call graph, execution trace,
                        and function relationships. Debug visually, understand deeply.
                    </p>
                </motion.div>

                {/* Two-column layout: Terminal card + feature highlights */}
                <div className="relative max-w-5xl mx-auto">
                    <motion.div
                        className="grid lg:grid-cols-5 gap-8 items-center"
                        initial={{ opacity: 0, y: prefersReducedMotion ? 15 : 30 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: prefersReducedMotion ? 0.4 : 0.6, delay: 0.15, type: 'tween', ease: [0.25, 0.1, 0.25, 1] }}
                    >
                        {/* Terminal card with SVG - takes 3 cols */}
                        <div className="lg:col-span-3 relative">
                            <div className="absolute -inset-4 bg-gradient-to-br from-secondary-500/5 via-transparent to-accent-500/5 rounded-3xl" />
                            <div className="absolute -bottom-2 -left-2 w-32 h-32 bg-secondary-500/5 rounded-full blur-2xl" />

                            <Card variant="terminal" padding="none" className="shadow-elevated relative">
                                <Card.TerminalHeader title="code_visualizer.py" />
                                <div className="p-4 sm:p-5 lg:p-6 flex items-center justify-center h-[clamp(250px,40vh,360px)] sm:h-[clamp(270px,42vh,380px)]">
                                    <div className="w-full h-full max-w-[760px]">
                                        <CodeVisualizerAnimation progress={fullProgress} />
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Feature highlights - takes 2 cols */}
                        <div className="lg:col-span-2 space-y-5">
                            {features.map((feature, i) => (
                                <motion.div
                                    key={feature.title}
                                    className="flex items-start gap-4 p-4 rounded-xl bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)] hover:border-[color:var(--color-border-hover)] transition-all duration-300 group hover:shadow-lg hover:-translate-y-0.5"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={inView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ duration: 0.4, delay: 0.3 + i * 0.1, type: 'tween', ease: [0.25, 0.1, 0.25, 1] }}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${feature.color === 'amber' ? 'bg-amber-500/10 text-amber-500' :
                                        feature.color === 'blue' ? 'bg-blue-500/10 text-blue-500' :
                                            'bg-violet-500/10 text-violet-500'
                                        }`}>
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-display font-semibold mb-1">{feature.title}</h4>
                                        <p className="text-sm text-[color:var(--color-text-secondary)]">{feature.desc}</p>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Python badge */}
                            <motion.div
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)] w-fit"
                                initial={{ opacity: 0 }}
                                animate={inView ? { opacity: 1 } : {}}
                                transition={{ duration: 0.4, delay: 0.6 }}
                            >
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-xs text-[color:var(--color-text-muted)]">Python support • More languages coming soon</span>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════════════
 *  MAIN WRAPPER
 *  - SolutionSection: untouched, renders standalone
 *  - CardGenSection + CodeVisualizerSection: horizontal scroll panels
 *    driven by vertical scroll (sticky pin + translateX)
 * ═══════════════════════════════════════════════════════════════════ */

const PANEL_COUNT = 3;

function SolutionHorizontalScroll() {
    const prefersReducedMotion = useReducedMotion();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: scrollContainerRef,
        offset: ['start start', 'end end'],
    });

    const x = useTransform(
        scrollYProgress,
        [0, 1],
        ['0vw', `-${(PANEL_COUNT - 1) * 100}vw`]
    );

    const activePanel = useTransform(scrollYProgress, (v) =>
        Math.min(Math.floor(v * PANEL_COUNT), PANEL_COUNT - 1)
    );

    const [activePanelIndex, setActivePanelIndex] = useState(0);
    useEffect(() => {
        const unsub = activePanel.on('change', (v) => setActivePanelIndex(Math.round(v)));
        return unsub;
    }, [activePanel]);

    return (
        <div
            ref={scrollContainerRef}
            style={{ height: `${PANEL_COUNT * 100}vh` }}
            className="relative"
        >
            <div className="sticky top-0 h-screen overflow-hidden">
                <motion.div
                    className="flex h-full"
                    style={{
                        x: prefersReducedMotion ? undefined : x,
                        width: `${PANEL_COUNT * 100}vw`,
                    }}
                >
                    {/* Panel 1: Original Solution Section */}
                    <div className="w-screen h-screen flex flex-col justify-start overflow-y-auto overflow-x-hidden">
                        <SolutionSection />
                    </div>

                    {/* Panel 2: Card Gen Section */}
                    <div className="w-screen h-screen flex flex-col justify-start overflow-y-auto overflow-x-hidden">
                        <CardGenSection />
                    </div>

                    {/* Panel 3: Code Visualizer Section */}
                    <div className="w-screen h-screen flex flex-col justify-start overflow-y-auto overflow-x-hidden">
                        <CodeVisualizerSection />
                    </div>
                </motion.div>

                {/* Panel indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
                    {['The Solution', 'AI Flashcards', 'Code Visualizer'].map((label, i) => (
                        <div key={label} className="flex items-center gap-2">
                            <div
                                className={`h-1.5 rounded-full transition-all duration-500 ${i === activePanelIndex
                                    ? 'w-8 bg-primary-500'
                                    : 'w-3 bg-[color:var(--color-border)]'
                                    }`}
                            />
                            {i === activePanelIndex && (
                                <motion.span
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-xs text-[color:var(--color-text-muted)] font-medium"
                                >
                                    {label}
                                </motion.span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SolutionHorizontalScroll;


