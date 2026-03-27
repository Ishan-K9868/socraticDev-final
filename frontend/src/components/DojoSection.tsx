import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import Button from '../ui/Button';
import { ChallengeIcons, DojoIcon } from '../features/dojo/ChallengeIcons';
import {
    LANDING_PREVIEW_CARDS,
    LANDING_PREVIEW_MODE_ORDER,
    LANDING_PREVIEW_SCENARIOS,
    LandingDojoPreview,
    type LandingPreviewMode,
    type LandingPreviewVerdict,
} from '../features/dojo/landingPreview';
import { useReducedMotion } from '../hooks/useReducedMotion';

const SECTION_CALLOUTS = [
    'Five compact reps',
    'Immediate explanation-first feedback',
    'Mouse, touch, and keyboard ready',
    'Full /dojo handoff when you want more',
];

const FloatingDojoElements = () => (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-accent-500/15 via-primary-500/10 to-transparent blur-2xl" />
        <div className="absolute bottom-1/4 right-0 h-[350px] w-[350px] rounded-full bg-gradient-to-tl from-secondary-500/15 via-transparent to-transparent blur-2xl" />

        <svg className="absolute left-[8%] top-[15%] h-10 w-10 animate-float text-accent-500/15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>

        <svg className="absolute right-[10%] top-[25%] h-8 w-8 animate-float text-primary-500/15" style={{ animationDelay: '1.5s' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>

        <svg className="absolute bottom-[20%] left-[5%] h-12 w-12 animate-float text-secondary-500/10" style={{ animationDelay: '2.5s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>

        <svg className="absolute bottom-[35%] right-[8%] h-9 w-9 animate-float text-accent-400/15" style={{ animationDelay: '3s' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>

        <div className="absolute left-1/4 top-1/3 h-32 w-32 rounded-full border border-primary-500/10" />
        <div className="absolute left-1/4 top-1/3 h-40 w-40 rounded-full border border-primary-500/5" />
        <div className="absolute bottom-1/4 right-1/4 h-24 w-24 rounded-full border border-secondary-500/10" />
    </div>
);

const SectionDivider = () => (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <svg className="relative block h-16 w-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
                d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120H0Z"
                className="fill-[color:var(--color-bg-primary)]"
            />
        </svg>
    </div>
);

function DojoSection() {
    const prefersReducedMotion = useReducedMotion();
    const headerRef = useRef(null);
    const headerInView = useInView(headerRef, { once: true, amount: 0.1, margin: '0px 0px -150px 0px' });
    const previewRef = useRef(null);
    const previewInView = useInView(previewRef, { once: true, amount: 0.1, margin: '0px 0px -150px 0px' });

    const [activeMode, setActiveMode] = useState<LandingPreviewMode>('parsons');
    const [latestVerdict, setLatestVerdict] = useState<LandingPreviewVerdict | null>(null);

    const activeScenario = LANDING_PREVIEW_SCENARIOS[activeMode];
    const activeCard = LANDING_PREVIEW_CARDS.find((card) => card.mode === activeMode) ?? LANDING_PREVIEW_CARDS[0];

    const nextPreviewLabel = useMemo(() => {
        const currentIndex = LANDING_PREVIEW_MODE_ORDER.indexOf(activeMode);
        const nextMode = LANDING_PREVIEW_MODE_ORDER[(currentIndex + 1) % LANDING_PREVIEW_MODE_ORDER.length];
        return LANDING_PREVIEW_CARDS.find((card) => card.mode === nextMode)?.title ?? 'Next preview';
    }, [activeMode]);

    const handleNextPreview = () => {
        const currentIndex = LANDING_PREVIEW_MODE_ORDER.indexOf(activeMode);
        const nextMode = LANDING_PREVIEW_MODE_ORDER[(currentIndex + 1) % LANDING_PREVIEW_MODE_ORDER.length];
        setActiveMode(nextMode);
        setLatestVerdict(null);
    };

    return (
        <section
            id="demo"
            className="section-padding relative overflow-hidden bg-[color:var(--color-bg-secondary)]"
        >
            <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-500/30 to-transparent" />
            <FloatingDojoElements />

            <div className="container-custom relative z-10">
                <motion.div
                    ref={headerRef}
                    initial={{ opacity: 0, y: prefersReducedMotion ? 10 : 30 }}
                    animate={headerInView ? { opacity: 1, y: 0 } : {}}
                    transition={{
                        duration: prefersReducedMotion ? 0.25 : 0.5,
                        type: 'tween',
                        ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="mx-auto mb-14 max-w-5xl text-center"
                >
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-accent-500/20 blur-2xl" />
                            <DojoIcon className="relative h-16 w-16 text-accent-500" />
                        </div>
                    </div>

                    <div className="pt-8">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/10 px-4 py-2">
                            <span className="h-2 w-2 rounded-full bg-accent-500 animate-pulse" />
                            <span className="text-sm font-medium text-accent-500">Interactive Training</span>
                        </div>

                        <h2 className="font-display text-display-md font-bold">
                            <span className="text-gradient-primary">The Dojo</span>
                        </h2>
                        <p className="mx-auto mt-4 max-w-3xl text-lg text-[color:var(--color-text-secondary)] lg:text-xl">
                            Try five compact challenge modes right here on the landing page, get instant feedback, then step into the full dojo when you want a longer spar.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                            {SECTION_CALLOUTS.map((callout) => (
                                <span
                                    key={callout}
                                    className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)] px-4 py-2 text-sm text-[color:var(--color-text-secondary)] shadow-sm"
                                >
                                    {callout}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    ref={previewRef}
                    initial={{ opacity: 0, y: prefersReducedMotion ? 12 : 36 }}
                    animate={previewInView ? { opacity: 1, y: 0 } : {}}
                    transition={{
                        duration: prefersReducedMotion ? 0.25 : 0.6,
                        type: 'tween',
                        ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="mx-auto max-w-6xl"
                >
                    <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        {LANDING_PREVIEW_CARDS.map((card, index) => {
                            const Icon = ChallengeIcons[card.mode];
                            const isActive = card.mode === activeMode;

                            return (
                                <motion.button
                                    key={card.mode}
                                    type="button"
                                    initial={{ opacity: 0, y: prefersReducedMotion ? 8 : 20 }}
                                    animate={previewInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{
                                        duration: prefersReducedMotion ? 0.2 : 0.35,
                                        delay: prefersReducedMotion ? 0 : index * 0.04,
                                    }}
                                    onClick={() => {
                                        setActiveMode(card.mode);
                                        setLatestVerdict(null);
                                    }}
                                    aria-pressed={isActive}
                                    className={[
                                        'group rounded-[1.75rem] border p-5 text-left transition-colors',
                                        isActive
                                            ? `${card.bgColor} ${card.borderColor} shadow-[0_12px_40px_rgba(15,23,42,0.08)]`
                                            : 'border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)] hover:border-primary-500/30',
                                    ].join(' ')}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.bgColor}`}>
                                            <Icon className={`h-6 w-6 ${card.color}`} />
                                        </div>
                                        <span className="rounded-full border border-current/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
                                            {isActive ? 'Live' : 'Preview'}
                                        </span>
                                    </div>
                                    <p className={`mt-5 text-xs font-semibold uppercase tracking-[0.24em] ${card.color}`}>
                                        {card.tagline}
                                    </p>
                                    <h3 className="mt-2 font-display text-xl font-semibold text-[color:var(--color-text-primary)]">
                                        {card.title}
                                    </h3>
                                    <p className="mt-3 text-sm leading-6 text-[color:var(--color-text-secondary)]">
                                        {card.description}
                                    </p>
                                </motion.button>
                            );
                        })}
                    </div>

                    <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)]/80 p-5 backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${activeCard.color}`}>
                                Active mode
                            </p>
                            <h3 className="mt-2 font-display text-2xl font-semibold text-[color:var(--color-text-primary)]">
                                {activeCard.title}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">
                                {latestVerdict
                                    ? latestVerdict.isCorrect
                                        ? 'Nice read. Keep the momentum or step into the full dojo.'
                                        : 'You get instant feedback here, then another rep right away.'
                                    : `Try this one now, then rotate to ${nextPreviewLabel.toLowerCase()} when you are ready.`}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link to="/dojo">
                                <Button size="lg" className="group">
                                    Enter The Dojo
                                    <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Button>
                            </Link>
                            <Button variant="secondary" size="lg" onClick={handleNextPreview}>
                                Explore {nextPreviewLabel}
                            </Button>
                        </div>
                    </div>

                    <LandingDojoPreview
                        activeMode={activeMode}
                        scenario={activeScenario}
                        onNextPreview={handleNextPreview}
                        onVerdictChange={setLatestVerdict}
                    />

                    <div className="mt-10 text-center">
                        <p className="text-sm text-[color:var(--color-text-muted)]">
                            Free access to all landing previews. Deeper reps, more modes, and full sessions live in <code>/dojo</code>.
                        </p>
                    </div>
                </motion.div>
            </div>

            <SectionDivider />
        </section>
    );
}

export default DojoSection;
