import { motion, useInView, useMotionValue } from 'framer-motion';
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
        { num: '01', text: 'Ask a question in Chat or solve a Dojo challenge', color: 'primary' },
        { num: '02', text: 'Click "Generate Cards" — AI extracts key concepts', color: 'accent' },
        { num: '03', text: 'Review, edit, and save to your personal deck', color: 'secondary' },
    ];

    return (
        <section className="py-8 lg:py-10 pb-14 lg:pb-16 relative overflow-hidden">
            {/* Top divider */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[color:var(--color-border)] to-transparent" />

            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-bl from-accent-500/10 via-primary-500/5 to-transparent rounded-full blur-2xl" />
                <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-gradient-to-tr from-primary-500/10 via-transparent to-transparent rounded-full blur-2xl" />
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

                {/* Main content: Two-column layout matching Code Visualizer */}
                <div className="relative max-w-5xl mx-auto">
                    <motion.div
                        className="grid lg:grid-cols-5 gap-8 items-center"
                        initial={{ opacity: 0, y: prefersReducedMotion ? 15 : 30 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: prefersReducedMotion ? 0.4 : 0.6, delay: 0.15, type: 'tween', ease: [0.25, 0.1, 0.25, 1] }}
                    >
                        {/* Terminal card with SVG - takes 3 cols */}
                        <div className="lg:col-span-3 relative">
                            <div className="absolute -inset-4 bg-gradient-to-br from-accent-500/5 via-transparent to-primary-500/5 rounded-3xl" />

                            <Card variant="terminal" padding="none" className="shadow-elevated relative">
                                <Card.TerminalHeader title="AI Card Generator" />
                                <div className="p-4 sm:p-5 lg:p-6 flex items-center justify-center h-[clamp(250px,40vh,360px)] sm:h-[clamp(270px,42vh,380px)]">
                                    <div className="w-full h-full max-w-[760px]">
                                        <CardGenAnimation progress={fullProgress} />
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Steps + stats - takes 2 cols */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Workflow steps */}
                            {steps.map((step, i) => (
                                <motion.div
                                    key={step.num}
                                    className="flex items-start gap-4 p-4 rounded-xl bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)] hover:border-[color:var(--color-border-hover)] transition-all duration-300 group hover:shadow-lg hover:-translate-y-0.5"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={inView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ duration: 0.4, delay: 0.3 + i * 0.1, type: 'tween', ease: [0.25, 0.1, 0.25, 1] }}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold transition-transform group-hover:scale-110 ${
                                        step.color === 'primary' ? 'bg-primary-500/10 text-primary-500' :
                                        step.color === 'accent' ? 'bg-accent-500/10 text-accent-500' :
                                            'bg-secondary-500/10 text-secondary-500'
                                    }`}>
                                        {step.num}
                                    </div>
                                    <p className="text-sm text-[color:var(--color-text-secondary)] leading-relaxed pt-2">
                                        {step.text}
                                    </p>
                                </motion.div>
                            ))}

                            {/* Stats row — SVG icons, no emojis */}
                            <motion.div
                                className="grid grid-cols-3 gap-3 pt-2"
                                initial={{ opacity: 0 }}
                                animate={inView ? { opacity: 1 } : {}}
                                transition={{ duration: 0.4, delay: 0.6 }}
                            >
                                {[
                                    {
                                        label: 'Cards / session',
                                        value: '~15',
                                        icon: (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 10h20" />
                                            </svg>
                                        ),
                                        color: 'text-primary-500',
                                    },
                                    {
                                        label: 'Retention boost',
                                        value: '3x',
                                        icon: (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                                            </svg>
                                        ),
                                        color: 'text-accent-500',
                                    },
                                    {
                                        label: 'Time to generate',
                                        value: '<2s',
                                        icon: (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
                                            </svg>
                                        ),
                                        color: 'text-secondary-500',
                                    },
                                ].map(stat => (
                                    <div key={stat.label} className="p-3 rounded-lg bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)] text-center">
                                        <div className={`flex items-center justify-center gap-1.5 mb-1 ${stat.color}`}>
                                            {stat.icon}
                                            <span className="text-lg font-display font-bold">{stat.value}</span>
                                        </div>
                                        <div className="text-[10px] text-[color:var(--color-text-muted)] font-medium uppercase tracking-wider">{stat.label}</div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
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
 *  Mobile:  Only SolutionSection — no horizontal scroll machinery.
 *  Desktop: CSS scroll-snap horizontal scroll (compositor-thread,
 *           zero JS overhead vs. useScroll/useTransform approach).
 * ═══════════════════════════════════════════════════════════════════ */

function SolutionHorizontalScroll() {
    const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [activePanelIndex, setActivePanelIndex] = useState(0);

    // Sync indicator dots via IntersectionObserver (no scroll listener cost)
    useEffect(() => {
        const observers: IntersectionObserver[] = [];
        panelRefs.current.forEach((el, i) => {
            if (!el) return;
            const obs = new IntersectionObserver(
                ([entry]) => { if (entry.isIntersecting) setActivePanelIndex(i); },
                { threshold: 0.6 }
            );
            obs.observe(el);
            observers.push(obs);
        });
        return () => observers.forEach((o) => o.disconnect());
    }, []);

    const labels = ['The Solution', 'AI Flashcards', 'Code Visualizer'];

    return (
        <section id="solution" className="relative">
            {/* ── Mobile: only show SolutionSection, hide feature panels ── */}
            <div className="lg:hidden">
                <SolutionSection />
            </div>

            {/* ── Desktop: CSS horizontal scroll-snap at section depth ── */}
            <div
                className="hidden lg:block relative"
                style={{ height: '100vh' }}
            >
                {/* Horizontal scroll track — overflow-x scroll on the wrapper */}
                <div
                    className="flex h-full overflow-x-scroll overflow-y-hidden"
                    style={{
                        scrollSnapType: 'x mandatory',
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'none',       // Firefox
                        msOverflowStyle: 'none',      // IE/Edge
                    }}
                >
                    {/* Panel 1: Solution */}
                    <div
                        ref={(el) => { panelRefs.current[0] = el; }}
                        className="flex-shrink-0 w-screen h-screen flex flex-col justify-start overflow-y-auto overflow-x-hidden"
                        style={{ scrollSnapAlign: 'start' }}
                    >
                        <SolutionSection />
                    </div>

                    {/* Panel 2: Card Gen */}
                    <div
                        ref={(el) => { panelRefs.current[1] = el; }}
                        className="flex-shrink-0 w-screen h-screen flex flex-col justify-start overflow-y-auto overflow-x-hidden"
                        style={{ scrollSnapAlign: 'start' }}
                    >
                        <CardGenSection />
                    </div>

                    {/* Panel 3: Code Visualizer */}
                    <div
                        ref={(el) => { panelRefs.current[2] = el; }}
                        className="flex-shrink-0 w-screen h-screen flex flex-col justify-start overflow-y-auto overflow-x-hidden"
                        style={{ scrollSnapAlign: 'start' }}
                    >
                        <CodeVisualizerSection />
                    </div>
                </div>

                {/* Panel indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20 pointer-events-none">
                    {labels.map((label, i) => (
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
        </section>
    );
}

export default SolutionHorizontalScroll;

