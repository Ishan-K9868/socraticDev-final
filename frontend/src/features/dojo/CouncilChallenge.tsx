import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { sendMessageToGemini } from '../../services/gemini';
import Button from '../../ui/Button';
import { CouncilMemberOpinion } from './types';

// ── Council Members ────────────────────────────────────────────────────────────

interface Engineer {
    name: string;
    era: string;
    role: string;
    knownFor: string;
    portrait: string;          // emoji stand-in
    accentColor: string;       // Tailwind colour token
    borderColor: string;
    badgeColor: string;
    prompt: string;            // personality instructions for Gemini
}

const ENGINEERS: Engineer[] = [
    {
        name: 'Edsger W. Dijkstra',
        era: '1930–2002',
        role: 'Mathematician & Theoretician',
        knownFor: 'Correctness proofs, structured programming, "simplicity is a great virtue"',
        portrait: '📐',
        accentColor: 'text-blue-400',
        borderColor: 'border-blue-500/40',
        badgeColor: 'bg-blue-500/15 text-blue-400',
        prompt:
            'You are Edsger Dijkstra. You are mathematically rigorous, notoriously blunt, and deeply skeptical of anything that sacrifices correctness for convenience. You believe most software is a mess. You think in invariants and proofs. You despise complexity for complexity\'s sake. Respond in crisp, slightly contemptuous academic prose — as if writing one of your EWD memos. You may quote yourself.',
    },
    {
        name: 'Grace Hopper',
        era: '1906–1992',
        role: 'Admiral & Pioneer Compiler Builder',
        knownFor: 'COBOL, first compiler, "the most dangerous phrase is we\'ve always done it this way"',
        portrait: '⚓',
        accentColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/40',
        badgeColor: 'bg-emerald-500/15 text-emerald-400',
        prompt:
            'You are Grace Hopper. You are pragmatic, optimistic, and impatient with bureaucracy. You believe software must be useful to real people today, not perfect in theory next year. You think shipping and iterating beats waiting for perfect design. You occasionally use naval metaphors and reference your time in the Navy. You are warm but direct.',
    },
    {
        name: 'Alan Kay',
        era: '1940–present',
        role: 'Inventor of OOP & Smalltalk',
        knownFor: 'Object-oriented programming, Dynabook, "the best way to predict the future is to invent it"',
        portrait: '🔭',
        accentColor: 'text-violet-400',
        borderColor: 'border-violet-500/40',
        badgeColor: 'bg-violet-500/15 text-violet-400',
        prompt:
            'You are Alan Kay. You think the question being asked is probably the wrong question. You believe most "modern" software is decades behind what was already possible in the 1970s. You think in biological metaphors — systems should be composable, message-passing organisms rather than brittle hierarchies. You are intellectually provocative, occasionally frustrating, and always thinking at least one level of abstraction higher than everyone else.',
    },
    {
        name: 'Barbara Liskov',
        era: '1939–present',
        role: 'First American Woman PhD in CS',
        knownFor: 'Liskov Substitution Principle, CLU language, abstract data types',
        portrait: '🔬',
        accentColor: 'text-rose-400',
        borderColor: 'border-rose-500/40',
        badgeColor: 'bg-rose-500/15 text-rose-400',
        prompt:
            'You are Barbara Liskov. You think in terms of abstraction, modularity, and data abstraction. You care deeply about substitutability, clean interfaces, and what behaviour clients can legitimately depend on. You are measured, precise, and focused on long-term maintainability over short-term delivery. You push back gently but firmly on designs that violate encapsulation or make implicit assumptions.',
    },
];

// ── Examples ───────────────────────────────────────────────────────────────────

interface Dilemma {
    title: string;
    context: string;
    stackDetails: string;
}

const EXAMPLE_DILEMMAS: Dilemma[] = [
    {
        title: 'Monolith vs. Microservices',
        context:
            'You are the lead architect at a 30-person B2B startup. Your Django monolith handles billing, user management, and the core product. It ships fast and the team knows it well — but it is becoming harder to deploy individual features safely, and a new team is joining to own the billing subsystem.',
        stackDetails: 'Python/Django, PostgreSQL, Redis, single EC2 instance, ~50k users.',
    },
    {
        title: 'REST vs. GraphQL for a New Public API',
        context:
            'You are designing the first public API for a developer tools company. Your internal API is REST. Customers are asking for a public API so they can build integrations. Some customers want simple CRUD operations; others want complex relational queries across entities.',
        stackDetails: 'Node.js/Express backend, PostgreSQL, ~200 potential API consumers.',
    },
    {
        title: 'Event-Driven Architecture',
        context:
            'You are rearchitecting the order processing pipeline of an e-commerce platform. Currently, placing an order triggers synchronous RPC calls to inventory, payment, fulfilment, and notification services. The timeout cascade during Black Friday last year took down the whole system.',
        stackDetails: 'Python microservices, gRPC internally, PostgreSQL per service.',
    },
];

// ── Props ──────────────────────────────────────────────────────────────────────

// (Kept for compatibility with DojoPage/CouncilPage, though onComplete isn't really needed here anymore)
interface CouncilChallengeProps {
    topic?: string;
    language?: string;
    onComplete?: (score: number) => void;
    onBack?: () => void;
    useAI?: boolean;
}

// ── Synthesis Generation ───────────────────────────────────────────────────────

function parseMarkdown(text: string): string {
    return text
        .replace(/^###\s+(.*)$/gm, '<h3 class="text-lg font-bold text-amber-400 mt-6 mb-2">$1</h3>')
        .replace(/^##\s+(.*)$/gm, '<h2 class="text-xl font-bold text-amber-500 mt-8 mb-3">$1</h2>')
        .replace(/^\s*\*\*\*\s*$|^\s*---\s*$/gm, '<hr class="border-amber-500/20 my-6" />')
        .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-amber-300">$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em class="italic text-amber-200">$1</em>')
        .replace(/`([^`]+)`/g, '<code class="bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded font-mono text-sm">$1</code>')
        .replace(/^\d+\.\s+(.*)$/gm, '<li class="ml-6 list-decimal marker:text-amber-500/60 pb-1">$1</li>')
        .replace(/^-\s+(.*)$/gm, '<li class="ml-6 list-disc marker:text-amber-500/60 pb-1">$1</li>');
}

async function generateSynthesis(
    dilemma: Dilemma,
    opinions: CouncilMemberOpinion[],
): Promise<string> {
    const opinionsText = opinions
        .map((o) => `${o.engineer}: "${o.opinion}"`)
        .join('\n\n');

    const prompt = `You are a Chief Architect synthesizing the advice of a panel of legendary computer scientists to provide a final recommendation for an engineering dilemma.

User's Architectural Dilemma: ${dilemma.title}
Context: ${dilemma.context}
Stack details: ${dilemma.stackDetails}

Council opinions:
${opinionsText}

Write a final "Chief Architect's Verdict" (approx 3-4 paragraphs) that synthesizes their contradictory advice. 
Do not just list what they said. Instead:
1. Identify the core underlying tradeoff that was debated.
2. Given the user's specific context and constraints, make a definitive recommendation.
3. Acknowledge the strongest objection to your recommendation and how to mitigate it.

Respond in professional markdown. Avoid using JSON. Format it nicely with bolding and headers where appropriate.`;

    try {
        const raw = await sendMessageToGemini(
            [{ role: 'user', content: prompt }],
            'learning',
        );
        return raw.trim();
    } catch {
        return "The Chief Architect could not be reached for a verdict. Please synthesize the council's wisdom yourself.";
    }
}

// ── Component ──────────────────────────────────────────────────────────────────

function CouncilChallenge(_props: CouncilChallengeProps) {
    // Input state
    const [inputTitle, setInputTitle] = useState('');
    const [inputContext, setInputContext] = useState('');
    const [inputStack, setInputStack] = useState('');

    // Session state
    const [activeDilemma, setActiveDilemma] = useState<Dilemma | null>(null);
    const [opinions, setOpinions] = useState<CouncilMemberOpinion[]>([]);
    const [loadingEngineers, setLoadingEngineers] = useState<Set<string>>(new Set());

    // Overall flow: input -> summoning -> synthesizing -> resolved
    const [phase, setPhase] = useState<'input' | 'summoning' | 'synthesizing' | 'resolved'>('input');

    const [verdict, setVerdict] = useState('');
    const abortRef = useRef(false);
    const chamberRef = useRef<HTMLDivElement>(null);

    // ── Input Phase: Load Example ──────────────────────────────────────────

    const loadExample = (ex: Dilemma) => {
        setInputTitle(ex.title);
        setInputContext(ex.context);
        setInputStack(ex.stackDetails);
    };

    // ── Fetch each engineer's opinion ────────────────────────────────────────

    const fetchOpinion = useCallback(
        async (engineer: Engineer, currentDilemma: Dilemma) => {
            setLoadingEngineers((prev) => new Set([...prev, engineer.name]));

            const prompt = `${engineer.prompt}

A junior engineer has come to you with the following architectural dilemma:

**${currentDilemma.title}**

Context: ${currentDilemma.context}
Technical details: ${currentDilemma.stackDetails}

Give your genuine opinion as ${engineer.name.split(' ').pop()}. Be specific, opinionated, and true to your well-documented philosophical position. You should disagree with at least one common "best practice" answer. 2-3 paragraphs maximum. No bullet points. No caveats about consulting specialists.`;

            let response = '';
            try {
                response = await sendMessageToGemini(
                    [{ role: 'user', content: prompt }],
                    'learning',
                );
            } catch (err) {
                if (!abortRef.current) {
                    console.error(`Failed to fetch opinion from ${engineer.name}:`, err);
                    response = "*Silence... the summoning failed.*";
                }
            }

            if (!abortRef.current) {
                const opinion: CouncilMemberOpinion = {
                    engineer: engineer.name,
                    era: engineer.era,
                    role: engineer.role,
                    accentColor: engineer.accentColor,
                    opinion: response,
                    catchphrase: engineer.knownFor,
                };

                setOpinions((prev) => [...prev, opinion]);
                setLoadingEngineers((prev) => {
                    const next = new Set(prev);
                    next.delete(engineer.name);
                    return next;
                });
            }
        },
        [],
    );

    // ── Kick off the council ─────────────────────────────────────────────────

    const handleSummon = () => {
        if (!inputContext.trim()) return;

        const dilemma: Dilemma = {
            title: inputTitle || 'Architectural Decision',
            context: inputContext,
            stackDetails: inputStack || 'Not specified',
        };

        setActiveDilemma(dilemma);
        setPhase('summoning');
        setOpinions([]);
        setLoadingEngineers(new Set());
        setVerdict('');

        abortRef.current = false;

        // Stagger engineer summonings
        ENGINEERS.forEach((eng, i) => {
            setTimeout(() => {
                if (!abortRef.current) fetchOpinion(eng, dilemma);
            }, i * 600);
        });
    };

    // ── Kick off Chief Architect Synthesis ───────────────────────────────────

    useEffect(() => {
        if (phase === 'summoning' && opinions.length === ENGINEERS.length) {
            // All engineers have responded
            setPhase('synthesizing');

            generateSynthesis(activeDilemma!, opinions).then((synthesizedVerdict) => {
                if (!abortRef.current) {
                    setVerdict(synthesizedVerdict);
                    setPhase('resolved');
                }
            });
        }
    }, [opinions.length, phase, activeDilemma, opinions]);

    // ── Reset ────────────────────────────────────────────────────────────────

    const handleReset = () => {
        setPhase('input');
        setActiveDilemma(null);
        setOpinions([]);
        setVerdict('');
        abortRef.current = true;
    };

    // ── Entrance animation ───────────────────────────────────────────────────

    useEffect(() => {
        if (chamberRef.current) {
            gsap.fromTo(
                chamberRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
            );
        }
    }, [phase]); // Re-animate chamber occasionally if needed? Actually, let's just animate once on mount.

    const allLoaded = opinions.length === ENGINEERS.length;

    // ═══════════════════════════════════════════════════════════════════════════
    // Render
    // ═══════════════════════════════════════════════════════════════════════════

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)]" ref={chamberRef}>
            <div className="max-w-5xl mx-auto p-6 pb-12">

                {/* ── PHASE: INPUT ──────────────────────────────────────────── */}
                {phase === 'input' && (
                    <div className="max-w-3xl mx-auto mt-12">
                        <div className="text-center mb-10">
                            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-4xl mb-6 shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)]">
                                🏛️
                            </div>
                            <h1 className="text-4xl font-black text-[color:var(--color-text-primary)] mb-4 tracking-tight">
                                State Your Dilemma
                            </h1>
                            <p className="text-lg text-[color:var(--color-text-secondary)]">
                                You are about to summon four legendary pioneers of computer science.
                                Describe your architectural challenge below, and let them debate the tradeoffs.
                            </p>
                        </div>

                        <div className="bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] rounded-2xl p-8 mb-8 shadow-sm">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-[color:var(--color-text-primary)] mb-2">
                                        Title (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={inputTitle}
                                        onChange={(e) => setInputTitle(e.target.value)}
                                        placeholder="e.g. Migration to GraphQL..."
                                        className="w-full bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] rounded-xl px-4 py-3 text-sm text-[color:var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[color:var(--color-text-primary)] mb-2">
                                        Context & The Problem (Required)
                                    </label>
                                    <textarea
                                        value={inputContext}
                                        onChange={(e) => setInputContext(e.target.value)}
                                        placeholder="Explain the architectural decision you are trying to make. What are the constraints? What are you afraid of getting wrong?"
                                        rows={5}
                                        className="w-full resize-none bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] rounded-xl px-4 py-3 text-sm text-[color:var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[color:var(--color-text-primary)] mb-2">
                                        Tech Stack Details (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={inputStack}
                                        onChange={(e) => setInputStack(e.target.value)}
                                        placeholder="e.g. Node.js, PostgreSQL, React, AWS Lambda"
                                        className="w-full bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] rounded-xl px-4 py-3 text-sm text-[color:var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <Button
                                    onClick={handleSummon}
                                    disabled={!inputContext.trim()}
                                    className="px-8"
                                >
                                    Summon the Council ⚡
                                </Button>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--color-text-muted)] mt-8 mb-4">
                                Or try an example dilemma
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {EXAMPLE_DILEMMAS.map((ex, i) => (
                                    <button
                                        key={i}
                                        onClick={() => loadExample(ex)}
                                        className="px-4 py-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] hover:border-amber-500/50 hover:bg-amber-500/5 text-sm text-[color:var(--color-text-secondary)] transition-all text-left"
                                    >
                                        {ex.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── PHASE: SUMMONING / SYNTHESIZING / RESOLVED ───────────── */}
                {phase !== 'input' && activeDilemma && (
                    <>
                        {/* ── Dilemma Card ──────────────────────────────────────────── */}
                        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 mb-8 mt-4 relative overflow-hidden group">
                            <div className="absolute top-4 right-4 text-4xl opacity-10">🏛️</div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
                                    The Subject of Debate
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-[color:var(--color-text-primary)] mb-3 relative z-10">
                                {activeDilemma.title}
                            </h2>
                            <p className="text-sm text-[color:var(--color-text-secondary)] leading-relaxed mb-4 relative z-10">
                                {activeDilemma.context}
                            </p>
                            {activeDilemma.stackDetails && activeDilemma.stackDetails !== 'Not specified' && (
                                <div className="inline-flex items-start gap-2 rounded-lg bg-[color:var(--color-bg-primary)] border border-amber-500/10 px-3 py-2 relative z-10">
                                    <span className="text-amber-500 text-xs font-mono mt-0.5">⚙</span>
                                    <p className="text-xs text-[color:var(--color-text-muted)] font-mono leading-relaxed">
                                        {activeDilemma.stackDetails}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ── Progress bar while summoning ──────────────────────────── */}
                        {!allLoaded && (
                            <div className="mb-8">
                                <div className="flex items-center justify-between text-xs text-[color:var(--color-text-muted)] mb-2 uppercase font-medium tracking-wide">
                                    <span className="animate-pulse text-amber-500">Summoning the council…</span>
                                    <span>{opinions.length}/{ENGINEERS.length} arrived</span>
                                </div>
                                <div className="h-1 bg-[color:var(--color-bg-muted)] rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(opinions.length / ENGINEERS.length) * 100}%` }}
                                        transition={{ duration: 0.5, ease: 'easeOut' }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* ── Engineer Opinion Cards ───────────────────────────────── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                            {ENGINEERS.map((eng, idx) => {
                                const opinion = opinions.find((o) => o.engineer === eng.name);
                                const isLoading = loadingEngineers.has(eng.name);
                                const hasOpinion = !!opinion;

                                return (
                                    <motion.div
                                        key={eng.name}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1, duration: 0.4, ease: 'easeOut' }}
                                        className={`rounded-2xl border ${eng.borderColor} bg-[color:var(--color-bg-secondary)] overflow-hidden flex flex-col`}
                                    >
                                        {/* Engineer header */}
                                        <div className="px-5 pt-5 pb-4 flex items-start gap-3.5 bg-[color:var(--color-bg-primary)]/40">
                                            <div className={`w-12 h-12 rounded-2xl border ${eng.borderColor} bg-[color:var(--color-bg-muted)] flex items-center justify-center text-2xl flex-shrink-0 shadow-sm`}>
                                                {eng.portrait}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <h3 className={`text-sm font-bold ${eng.accentColor}`}>
                                                        {eng.name}
                                                    </h3>
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${eng.borderColor} ${eng.badgeColor}`}>
                                                        {eng.era}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-[color:var(--color-text-muted)] font-medium">
                                                    {eng.role}
                                                </p>
                                                <p className="text-[11px] italic text-[color:var(--color-text-muted)] mt-1 opacity-70 line-clamp-1 border-l-2 border-inherit pl-2" style={{ borderColor: 'inherit' }}>
                                                    "{eng.knownFor.split(',')[0]}"
                                                </p>
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className={`border-t ${eng.borderColor} opacity-30`} />

                                        {/* Opinion body */}
                                        <div className="px-5 py-5 flex-1 flex flex-col">
                                            {isLoading && !hasOpinion ? (
                                                <div className="space-y-3 mt-2 flex-1 relative">
                                                    {[0.7, 0.9, 0.8, 0.6].map((w, i) => (
                                                        <div
                                                            key={i}
                                                            className={`h-2.5 ${eng.badgeColor.split(' ')[0]} rounded-full animate-pulse opacity-50`}
                                                            style={{ width: `${w * 100}%` }}
                                                        />
                                                    ))}
                                                    <div className="absolute inset-0 flex items-center justify-center pt-8">
                                                        <p className={`text-xs ${eng.accentColor} font-medium tracking-wide animate-pulse`}>
                                                            Materializing from the ether...
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : hasOpinion ? (
                                                <AnimatePresence>
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 0.6 }}
                                                    >
                                                        <div
                                                            className="prose prose-sm prose-invert max-w-none text-[color:var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap"
                                                            dangerouslySetInnerHTML={{ __html: parseMarkdown(opinion!.opinion) }}
                                                        />
                                                    </motion.div>
                                                </AnimatePresence>
                                            ) : (
                                                <div className="flex-1 flex items-center justify-center">
                                                    <p className="text-xs text-[color:var(--color-text-muted)] font-medium uppercase tracking-widest opacity-50">
                                                        Awaiting summon
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* ── Synthesizing State ────────────────────────────────────── */}
                        <AnimatePresence>
                            {phase === 'synthesizing' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-8 text-center shadow-lg"
                                >
                                    <div className="flex flex-col items-center justify-center py-6">
                                        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl mb-6 relative">
                                            <span className="relative z-10 animate-pulse">🧠</span>
                                            <div className="absolute inset-0 rounded-full border border-amber-500/40 animate-ping opacity-20"></div>
                                        </div>
                                        <h3 className="text-lg font-bold text-[color:var(--color-text-primary)] mb-2">
                                            Chief Architect is Synthesizing
                                        </h3>
                                        <p className="text-sm text-[color:var(--color-text-muted)] max-w-sm mx-auto">
                                            Reviewing the contradictory advice and formulating a definitive recommendation for your context...
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── Final Verdict ─────────────────────────────────────────── */}
                        <AnimatePresence>
                            {phase === 'resolved' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                    className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-amber-500/5 p-8 relative overflow-hidden shadow-[0_10px_40px_-10px_rgba(245,158,11,0.1)]"
                                >
                                    {/* Decoration */}
                                    <div className="absolute top-0 right-0 p-8 text-6xl opacity-10 pointer-events-none transform rotate-12">
                                        ⚖️
                                    </div>

                                    <div className="flex items-center gap-3 mb-6 relative z-10">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-amber-950 flex items-center justify-center text-xl shadow-md">
                                            ⚖️
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--color-text-muted)] mb-0.5">
                                                Final Resolution
                                            </p>
                                            <h3 className="text-lg font-bold text-[color:var(--color-text-primary)] text-amber-400">
                                                Chief Architect's Verdict
                                            </h3>
                                        </div>
                                    </div>

                                    <div
                                        className="prose prose-base prose-invert max-w-none text-[color:var(--color-text-primary)] leading-relaxed relative z-10 whitespace-pre-wrap"
                                        dangerouslySetInnerHTML={{ __html: parseMarkdown(verdict) }}
                                    />

                                    <div className="mt-10 pt-6 border-t border-amber-500/20 flex items-center justify-between relative z-10">
                                        <p className="text-xs text-[color:var(--color-text-muted)]">
                                            Disclaimer: AI opinions may not perfectly reflect historical figures.
                                        </p>
                                        <Button
                                            onClick={handleReset}
                                            variant="secondary"
                                            className="px-6 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                                        >
                                            Brainstorm Another Dilemma ↺
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </div>
    );
}

export default CouncilChallenge;
