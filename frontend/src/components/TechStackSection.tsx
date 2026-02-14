import { motion, useInView } from 'framer-motion';
import { ReactNode, useRef } from 'react';
import Badge from '../ui/Badge';
import { useReducedMotion } from '../hooks/useReducedMotion';

type StackTone = 'primary' | 'accent' | 'secondary' | 'neutral';

interface StackTrack {
    name: string;
    shortLabel: string;
    summary: string;
    metricLabel: string;
    metricValue: string;
    techs: string[];
    tone: StackTone;
    icon: ReactNode;
}

const stackTracks: StackTrack[] = [
    {
        name: 'Frontend Interface',
        shortLabel: 'Layer 01',
        summary: 'Fast interaction shell for pages, transitions, and responsive UI rendering.',
        metricLabel: 'Client-side rendering target',
        metricValue: '<120ms UI response',
        techs: ['React 18', 'TypeScript', 'Tailwind CSS', 'Vite'],
        tone: 'primary',
        icon: (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="4" width="18" height="14" rx="2" />
                <path d="M8 20h8M12 18v2M7.5 9.5l2.5 2.5-2.5 2.5M12.5 14.5h4" />
            </svg>
        ),
    },
    {
        name: 'AI Orchestration',
        shortLabel: 'Layer 02',
        summary: 'Question-driven reasoning pipeline that grounds answers in code context.',
        metricLabel: 'Reasoning + retrieval path',
        metricValue: 'Graph + semantic merge',
        techs: ['Gemini Pro', 'LangChain', 'GraphRAG', 'Embeddings'],
        tone: 'accent',
        icon: (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="3.5" />
                <path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
            </svg>
        ),
    },
    {
        name: 'Backend Services',
        shortLabel: 'Layer 03',
        summary: 'APIs and processing services for upload, query execution, and graph generation.',
        metricLabel: 'Service architecture',
        metricValue: 'Stateless + queue-ready',
        techs: ['Node.js', 'FastAPI', 'PostgreSQL', 'Redis'],
        tone: 'secondary',
        icon: (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <ellipse cx="12" cy="6" rx="7" ry="2.5" />
                <path d="M5 6v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" />
            </svg>
        ),
    },
    {
        name: 'Deployment Fabric',
        shortLabel: 'Layer 04',
        summary: 'Delivery, container runtime, and monitoring guardrails for production stability.',
        metricLabel: 'Release discipline',
        metricValue: 'CI/CD with observability',
        techs: ['Vercel Edge', 'Docker', 'GitHub Actions', 'Monitoring'],
        tone: 'neutral',
        icon: (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 7h18M8 3v4M16 3v4M6 11h12v10H6z" />
            </svg>
        ),
    },
];

const toneStyles: Record<StackTone, {
    card: string;
    dot: string;
    dotGlow: string;
    bridge: string;
    iconWrap: string;
    heading: string;
    chip: string;
}> = {
    primary: {
        card: 'border-primary-500/30 bg-gradient-to-br from-primary-500/15 via-primary-500/5 to-transparent',
        dot: 'bg-primary-500',
        dotGlow: 'shadow-[0_0_0_8px_rgba(224,122,95,0.22)]',
        bridge: 'bg-primary-500/45',
        iconWrap: 'border-primary-500/40 bg-primary-500/10 text-primary-600 dark:text-primary-300',
        heading: 'text-primary-600 dark:text-primary-300',
        chip: 'border-primary-500/30 bg-primary-500/10 text-primary-700 dark:text-primary-200',
    },
    accent: {
        card: 'border-accent-500/30 bg-gradient-to-br from-accent-500/18 via-accent-500/6 to-transparent',
        dot: 'bg-accent-500',
        dotGlow: 'shadow-[0_0_0_8px_rgba(129,147,106,0.22)]',
        bridge: 'bg-accent-500/45',
        iconWrap: 'border-accent-500/40 bg-accent-500/10 text-accent-700 dark:text-accent-200',
        heading: 'text-accent-700 dark:text-accent-200',
        chip: 'border-accent-500/35 bg-accent-500/10 text-accent-700 dark:text-accent-200',
    },
    secondary: {
        card: 'border-secondary-500/30 bg-gradient-to-br from-secondary-500/16 via-secondary-500/6 to-transparent',
        dot: 'bg-secondary-500',
        dotGlow: 'shadow-[0_0_0_8px_rgba(61,90,128,0.24)]',
        bridge: 'bg-secondary-500/45',
        iconWrap: 'border-secondary-500/40 bg-secondary-500/10 text-secondary-700 dark:text-secondary-200',
        heading: 'text-secondary-700 dark:text-secondary-200',
        chip: 'border-secondary-500/35 bg-secondary-500/10 text-secondary-700 dark:text-secondary-200',
    },
    neutral: {
        card: 'border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)]/90',
        dot: 'bg-neutral-500 dark:bg-neutral-400',
        dotGlow: 'shadow-[0_0_0_8px_rgba(120,113,108,0.2)]',
        bridge: 'bg-[color:var(--color-border)]',
        iconWrap: 'border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] text-[color:var(--color-text-secondary)]',
        heading: 'text-[color:var(--color-text-primary)]',
        chip: 'border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] text-[color:var(--color-text-secondary)]',
    },
};

interface StackRailCardProps {
    track: StackTrack;
    index: number;
    prefersReducedMotion: boolean;
}

function StackRailCard({ track, index, prefersReducedMotion }: StackRailCardProps) {
    const laneRef = useRef<HTMLLIElement>(null);
    const inView = useInView(laneRef, { once: true, amount: 0.25, margin: '0px 0px -120px 0px' });
    const leftAligned = index % 2 === 0;
    const tones = toneStyles[track.tone];

    return (
        <motion.li
            ref={laneRef}
            initial={{
                opacity: 0,
                x: prefersReducedMotion ? 0 : leftAligned ? -48 : 48,
                y: prefersReducedMotion ? 8 : 26,
            }}
            animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
            transition={{
                duration: prefersReducedMotion ? 0.25 : 0.6,
                delay: index * 0.08,
                type: 'tween',
                ease: [0.25, 0.1, 0.25, 1],
            }}
            className={`relative pl-9 md:pl-0 md:w-[calc(50%-1rem)] ${leftAligned ? 'md:mr-auto md:pr-9' : 'md:ml-auto md:pl-9'}`}
        >
            <span
                className={`absolute left-0 top-10 h-3.5 w-3.5 rounded-full ${tones.dot} ${prefersReducedMotion ? '' : tones.dotGlow} md:hidden`}
            />

            <span
                className={`absolute top-9 hidden h-5 w-5 rounded-full border-2 border-[color:var(--color-bg-primary)] ${tones.dot} ${prefersReducedMotion ? '' : tones.dotGlow} md:block ${leftAligned ? '-right-2.5' : '-left-2.5'}`}
            />

            <span
                className={`absolute top-[2.6rem] hidden h-[2px] w-9 md:block ${tones.bridge} ${leftAligned ? '-right-9' : '-left-9'}`}
            />

            <motion.article
                whileHover={prefersReducedMotion ? undefined : { y: -5, rotateX: 2.5 }}
                transition={{ type: 'spring', stiffness: 230, damping: 20, mass: 0.7 }}
                className={`group rounded-3xl border p-5 sm:p-6 shadow-card backdrop-blur-sm ${tones.card}`}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${tones.iconWrap}`}>
                            {track.icon}
                        </div>
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                                {track.shortLabel}
                            </p>
                            <h3 className={`font-display text-xl sm:text-2xl font-semibold ${tones.heading}`}>
                                {track.name}
                            </h3>
                        </div>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.13em] ${tones.chip}`}>
                        T{index + 1}
                    </span>
                </div>

                <p className="mt-4 text-sm sm:text-[15px] leading-relaxed text-[color:var(--color-text-secondary)]">
                    {track.summary}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                    {track.techs.map((tech, techIndex) => (
                        <motion.span
                            key={tech}
                            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.28, delay: 0.14 + techIndex * 0.05 }}
                            className={`rounded-full border px-3 py-1.5 text-xs sm:text-sm font-medium ${tones.chip}`}
                        >
                            {tech}
                        </motion.span>
                    ))}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[color:var(--color-border)]/40 pt-4 text-xs">
                    <span className="text-[color:var(--color-text-muted)]">{track.metricLabel}</span>
                    <span className={`font-semibold ${tones.heading}`}>{track.metricValue}</span>
                </div>
            </motion.article>
        </motion.li>
    );
}

function TechStackSection() {
    const prefersReducedMotion = useReducedMotion();
    const headerRef = useRef<HTMLDivElement>(null);
    const boardRef = useRef<HTMLDivElement>(null);
    const headerInView = useInView(headerRef, { once: true, amount: 0.2, margin: '0px 0px -120px 0px' });
    const boardInView = useInView(boardRef, { once: true, amount: 0.1, margin: '0px 0px -160px 0px' });

    return (
        <section id="tech" className="section-padding relative overflow-hidden">
            <div className="absolute inset-0 section-gradient" />

            <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(120,113,108,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(120,113,108,0.14) 1px, transparent 1px)',
                    backgroundSize: '42px 42px',
                    maskImage: 'radial-gradient(circle at center, black 35%, transparent 90%)',
                }}
            />

            <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary-500/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-[8%] h-64 w-64 rounded-full bg-secondary-500/10 blur-3xl" />

            <div className="container-custom relative z-10">
                <motion.div
                    ref={headerRef}
                    initial={{ opacity: 0, y: prefersReducedMotion ? 10 : 30 }}
                    animate={headerInView ? { opacity: 1, y: 0 } : {}}
                    transition={{
                        duration: prefersReducedMotion ? 0.3 : 0.55,
                        type: 'tween',
                        ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="mx-auto mb-14 max-w-3xl text-center"
                >
                    <Badge variant="secondary" className="mb-4">
                        System Architecture
                    </Badge>

                    <h2 className="font-display text-display-md font-bold mb-5">
                        Not just a stack.
                        <br />
                        <span className="text-gradient-primary">A learning engine in layers.</span>
                    </h2>

                    <p className="text-lg text-[color:var(--color-text-secondary)]">
                        Every layer has one job: keep Socratic guidance fast, contextual, and production-safe.
                    </p>
                </motion.div>

                <motion.div
                    ref={boardRef}
                    initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 26 }}
                    animate={boardInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: prefersReducedMotion ? 0.3 : 0.6, delay: 0.05 }}
                    className="relative mx-auto max-w-6xl rounded-[2rem] border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)]/80 p-4 sm:p-7 md:p-10 shadow-elevated"
                >
                    <div className="mb-8 flex flex-wrap gap-2">
                        <Badge variant="primary">4 synchronized layers</Badge>
                        <Badge variant="accent">16 core technologies</Badge>
                        <Badge variant="success">Type-safe end-to-end</Badge>
                    </div>

                    <div className="relative">
                        <div className="absolute bottom-7 left-1 top-7 w-px bg-gradient-to-b from-primary-500/30 via-secondary-500/40 to-accent-500/35 md:hidden" />

                        <div className="absolute bottom-8 left-1/2 top-8 hidden w-px -translate-x-1/2 bg-gradient-to-b from-primary-500/40 via-secondary-500/40 to-accent-500/35 md:block" />

                        <motion.div
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={boardInView ? { scale: 1, opacity: 1 } : {}}
                            transition={{ duration: 0.55, delay: 0.2 }}
                            className="absolute left-1/2 top-0 hidden h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary-500/40 bg-[color:var(--color-bg-elevated)] md:flex"
                        >
                            <motion.div
                                animate={prefersReducedMotion ? {} : { rotate: 360 }}
                                transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                                className="absolute inset-1 rounded-full border border-dashed border-secondary-500/50"
                            />
                            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500" />
                        </motion.div>

                        <ol className="space-y-4 md:space-y-7">
                            {stackTracks.map((track, index) => (
                                <StackRailCard
                                    key={track.name}
                                    track={track}
                                    index={index}
                                    prefersReducedMotion={prefersReducedMotion}
                                />
                            ))}
                        </ol>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default TechStackSection;
