import { useState, useCallback, useRef, useEffect } from 'react';
import DojoHub from './DojoHub';
import ParsonsChallenge from './ParsonsChallenge';
import CodeSurgery from './CodeSurgery';
import ELI5Challenge from './ELI5Challenge';
import FadedExamples from './FadedExamples';
import MentalCompiler from './MentalCompiler';
import RubberDuckDebugger from './RubberDuckDebugger';
import CodeTranslation from './CodeTranslation';
import PatternDetective from './PatternDetective';
import BigOBattle from './BigOBattle';
import TDDChallenge from './TDDChallenge';
import CouncilChallenge from './CouncilChallenge';
import { ChallengeType, DojoStats } from './types';
import { useSRS } from '../srs/useSRS';
import { generateFlashcardsWithGemini } from '../../services/gemini';
import { GeneratedCardCandidate } from '../srs/types';
import GeneratedCardReviewModal from '../srs/GeneratedCardReviewModal';
import { useAnalytics } from '../analytics/useAnalytics';
import { DebateTerminalButton, SocraticDebatePanel, useSocraticDebate } from './debate';
import type { DebateContext } from './debate';

// Re-export for convenience
export { SUPPORTED_LANGUAGES } from './constants';

const TOPIC_SUGGESTIONS: Record<ChallengeType, string[]> = {
    parsons: ['binary search', 'bubble sort', 'linked list traversal', 'fibonacci', 'factorial'],
    surgery: ['async/await', 'array manipulation', 'string parsing', 'API calls', 'form validation'],
    eli5: ['for loops', 'recursion', 'if statements', 'functions', 'arrays'],
    faded: ['factorial function', 'palindrome check', 'sum of array', 'find maximum', 'reverse string'],
    mental: ['loops and conditions', 'recursion trace', 'array methods', 'string operations', 'math expressions'],
    'rubber-duck': ['debugging', 'code review', 'refactoring'],
    translation: ['python to javascript', 'callbacks to promises', 'OOP to functional'],
    pattern: ['singleton', 'factory', 'observer', 'strategy'],
    tdd: ['calculator', 'todo list', 'validation'],
    bigo: ['sorting algorithms', 'search algorithms', 'nested loops', 'recursive functions'],
    council: ['monolith vs microservices', 'REST vs GraphQL', 'SQL vs NoSQL', 'synchronous vs async', 'testing strategy'],
};

const DOJO_REVISION_FOCUS: Record<ChallengeType, string> = {
    parsons: 'code ordering, control flow correctness, identifying distractor lines',
    surgery: 'bug localization, root-cause reasoning, and safe fixes',
    eli5: 'clear explanations, simplification, and avoiding jargon',
    faded: 'reconstructing missing code and syntax recall',
    mental: 'step-by-step execution simulation and trace accuracy',
    'rubber-duck': 'debug reasoning, hypothesis testing, and reflection',
    translation: 'equivalent constructs across languages and idiomatic mapping',
    pattern: 'design pattern recognition and code smell detection',
    tdd: 'test-driven workflow, edge cases, and incremental implementation',
    bigo: 'time/space complexity identification and tradeoff reasoning',
    council: 'architectural tradeoff analysis, synthesis of contradictory expert opinions, and defensible decision-making',
};

const DOJO_DEFAULT_TOPIC_LABEL: Record<ChallengeType, string> = {
    parsons: 'code ordering',
    surgery: 'bug fixing',
    eli5: 'explanation clarity',
    faded: 'fill in the blanks',
    mental: 'execution tracing',
    'rubber-duck': 'debug reasoning',
    translation: 'code translation',
    pattern: 'pattern detection',
    tdd: 'test-driven development',
    bigo: 'complexity analysis',
    council: 'architectural decision',
};

function buildDojoFlashcardPrompt(params: {
    challenge: ChallengeType;
    topic: string;
    language: string;
    useAI: boolean;
    score?: number;
    totalPoints?: number;
    completedCount?: number;
}): string {
    const {
        challenge,
        topic,
        language,
        useAI,
        score,
        totalPoints,
        completedCount,
    } = params;

    const scoreLine = typeof score === 'number' ? `Latest score: ${score}` : 'Latest score: n/a (in-progress challenge)';
    const historyLine = Number.isFinite(totalPoints) && Number.isFinite(completedCount)
        ? `Dojo progress: ${completedCount} challenges completed, ${totalPoints} total points`
        : 'Dojo progress: n/a';

    return [
        'Generate exactly 3 concise revision flashcards.',
        `Current dojo mode: ${challenge}`,
        `Topic: ${topic}`,
        `Language: ${language}`,
        `Challenge source mode: ${useAI ? 'AI' : 'Practice'}`,
        scoreLine,
        historyLine,
        `Focus areas for this dojo mode: ${DOJO_REVISION_FOCUS[challenge]}`,
        'Card goals:',
        '- 1 concept card',
        '- 1 common mistake / debugging card',
        '- 1 practical application card',
        'Keep cards specific to this dojo context, not generic programming trivia.',
    ].join('\n');
}

function getVisibleDojoContext(): { title?: string; description?: string } {
    if (typeof document === 'undefined') return {};

    const titleNode = document.querySelector('.challenge-container h1');
    const descNode = document.querySelector('.challenge-container h1 + p');

    const title = titleNode?.textContent?.replace(/\s+/g, ' ').trim();
    const description = descNode?.textContent?.replace(/\s+/g, ' ').trim();

    return {
        title: title || undefined,
        description: description || undefined,
    };
}

/** Extract visible code and user answer from the DOM for debate context.
 *  Uses multiple strategies to cover ALL challenge DOM structures:
 *  - CodeSurgery: each line is a separate `<pre class="font-mono">` element
 *  - Parsons: code is in `<code>` elements inside sortable items
 *  - BigO/TDD/Faded: code in `<pre>` blocks (sometimes with code children)
 *  - Monaco editor: `.view-lines` elements
 */
function extractDebateContext(
    challengeType: ChallengeType,
    topic: string,
    language: string,
    score?: number,
): DebateContext {
    if (typeof document === 'undefined') {
        return { challengeType, topic, language, score };
    }

    let code: string | undefined;

    // Strategy 1: Collect all per-line `<pre>` elements with font-mono class
    // CodeSurgery renders each code line as an individual <pre class="font-mono ...">
    const monoPreEls = document.querySelectorAll('pre.font-mono');
    if (monoPreEls.length > 1) {
        // Multiple pre.font-mono elements = per-line rendering (CodeSurgery pattern)
        const lines = Array.from(monoPreEls)
            .map(el => el.textContent?.trimEnd() ?? '')
            .filter((_, i, arr) => {
                // Skip if this is inside a "correct code" solution section
                const parent = arr.length > 0 ? monoPreEls[i]?.closest('.bg-green-500\\/10') : null;
                return !parent;
            });
        if (lines.length > 0) code = lines.join('\n');
    }

    // Strategy 2: Collect all <code> elements (Parsons sortable blocks)
    if (!code) {
        const codeEls = document.querySelectorAll('.challenge-container code, [class*="sortable"] code, code.whitespace-pre');
        if (codeEls.length > 0) {
            const lines = Array.from(codeEls)
                .map(el => el.textContent?.trim())
                .filter(Boolean);
            if (lines.length > 0) code = lines.join('\n');
        }
    }

    // Strategy 3: Single large <pre> block (BigO, TDD, Faded examples)
    if (!code) {
        const preBlock = document.querySelector('pre code') || document.querySelector('pre');
        if (preBlock?.textContent?.trim()) {
            const text = preBlock.textContent.trim();
            if (text.length > 5) code = text; // Avoid grabbing tiny UI fragments
        }
    }

    // Strategy 4: Monaco editor content
    if (!code) {
        const monacoEl = document.querySelector('.monaco-editor .view-lines');
        if (monacoEl?.textContent?.trim()) code = monacoEl.textContent.trim();
    }

    // Grab user answer from textareas / contenteditable (broadened selectors)
    const textareaEl = document.querySelector<HTMLTextAreaElement>(
        'textarea, [contenteditable="true"]',
    );
    const userAnswer = textareaEl?.value?.trim() || textareaEl?.textContent?.trim() || undefined;

    // Get visible title/description
    const ui = getVisibleDojoContext();
    const challengeState = ui.description || ui.title || undefined;

    return { challengeType, topic, language, code, userAnswer, score, challengeState };
}

function getDefaultTopicForChallenge(challenge: ChallengeType): string {
    return DOJO_DEFAULT_TOPIC_LABEL[challenge];
}

interface CompletionContext {
    challenge: ChallengeType;
    topic: string;
    language: string;
    score: number;
}

function DojoPage() {
    type SaveSummary = { inserted: number; duplicates: number; rejected: number };
    type HintCurve = { d: string; arrowD: string };
    type Viewport = { width: number; height: number };
    const { settings, addGeneratedCards } = useSRS();
    const { recordChallenge } = useAnalytics();
    const [activeChallenge, setActiveChallenge] = useState<ChallengeType | null>(null);
    const [activeTopic, setActiveTopic] = useState('');
    const [completionContext, setCompletionContext] = useState<CompletionContext | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState(() => {
        return localStorage.getItem('dojo-language') || 'python';
    });
    const [useAI, setUseAI] = useState(() => {
        return localStorage.getItem('dojo-use-ai') === 'true';
    });
    const [isGeneratingCards, setIsGeneratingCards] = useState(false);
    const [generatedCards, setGeneratedCards] = useState<GeneratedCardCandidate[]>([]);
    const [generationEngine, setGenerationEngine] = useState<'gemini' | 'bedrock' | 'fallback'>('fallback');
    const [generationReason, setGenerationReason] = useState<string | undefined>(undefined);
    const [generationModalOpen, setGenerationModalOpen] = useState(false);
    const [saveSummary, setSaveSummary] = useState<SaveSummary | null>(null);
    const [hintCurve, setHintCurve] = useState<HintCurve | null>(null);
    const [viewport, setViewport] = useState<Viewport>({ width: 1440, height: 900 });
    const toastTimeoutRef = useRef<number | null>(null);
    const challengeStartedAtRef = useRef<number | null>(null);
    const hintTextRef = useRef<HTMLSpanElement | null>(null);
    const generateButtonRef = useRef<HTMLButtonElement | null>(null);

    // ── Debate system ────────────────────────────────────────────────────
    // Use state so context is re-extracted on demand (when panel opens)
    const [debateContext, setDebateContext] = useState<DebateContext>(() => ({
        challengeType: 'parsons', topic: 'general', language: selectedLanguage,
    }));

    const refreshDebateContext = useCallback(() => {
        const type = activeChallenge || completionContext?.challenge || 'parsons';
        const top = activeTopic || completionContext?.topic || 'general';
        const lang = selectedLanguage;
        const sc = completionContext?.score;
        const ctx = extractDebateContext(type, top, lang, sc);
        setDebateContext(ctx);
        return ctx;
    }, [activeChallenge, activeTopic, selectedLanguage, completionContext]);

    const debate = useSocraticDebate(debateContext);

    const [stats, setStats] = useState<DojoStats>(() => {
        const saved = localStorage.getItem('dojo-stats');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                // Fall through to default
            }
        }
        return {
            totalPoints: 0,
            challengesCompleted: 0,
            currentStreak: 0,
            longestStreak: 0,
            badges: [],
            categoryProgress: {
                parsons: 0,
                surgery: 0,
                eli5: 0,
                faded: 0,
                mental: 0,
                'rubber-duck': 0,
                translation: 0,
                pattern: 0,
                tdd: 0,
                bigo: 0
            }
        };
    });

    const handleLanguageChange = useCallback((lang: string) => {
        setSelectedLanguage(lang);
        localStorage.setItem('dojo-language', lang);
    }, []);

    const handleAIToggle = useCallback((value: boolean) => {
        setUseAI(value);
        localStorage.setItem('dojo-use-ai', value.toString());
    }, []);

    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current !== null) {
                window.clearTimeout(toastTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!activeChallenge) {
            setHintCurve(null);
            return;
        }

        const computeCurve = () => {
            if (!hintTextRef.current || !generateButtonRef.current) return;
            setViewport({ width: window.innerWidth, height: window.innerHeight });
            const textRect = hintTextRef.current.getBoundingClientRect();
            const buttonRect = generateButtonRef.current.getBoundingClientRect();

            const startX = textRect.left + Math.min(textRect.width * 0.9, textRect.width - 4);
            const startY = textRect.bottom + 8;
            const endX = buttonRect.left + buttonRect.width / 2;
            const endY = buttonRect.top - 8;

            const deltaY = Math.max(80, endY - startY);
            const c1X = Math.max(startX + 6, startX + (endX - startX) * 0.1 + 26);
            const c1Y = startY + deltaY * 0.24;
            const c2X = endX + 42;
            const c2Y = startY + deltaY * 0.82;

            const d = `M ${startX.toFixed(1)} ${startY.toFixed(1)} C ${c1X.toFixed(1)} ${c1Y.toFixed(1)}, ${c2X.toFixed(1)} ${c2Y.toFixed(1)}, ${endX.toFixed(1)} ${endY.toFixed(1)}`;

            const approachX = c2X;
            const approachY = c2Y;
            const vx = endX - approachX;
            const vy = endY - approachY;
            const len = Math.hypot(vx, vy) || 1;
            const ux = vx / len;
            const uy = vy / len;
            const px = -uy;
            const py = ux;
            const tipX = endX;
            const tipY = endY;
            const wing = 6.5;
            const back = 10;
            const leftX = tipX - ux * back + px * wing;
            const leftY = tipY - uy * back + py * wing;
            const rightX = tipX - ux * back - px * wing;
            const rightY = tipY - uy * back - py * wing;
            const arrowD = `M ${leftX.toFixed(1)} ${leftY.toFixed(1)} L ${tipX.toFixed(1)} ${tipY.toFixed(1)} L ${rightX.toFixed(1)} ${rightY.toFixed(1)}`;

            setHintCurve({ d, arrowD });
        };

        computeCurve();
        window.addEventListener('resize', computeCurve);
        window.addEventListener('orientationchange', computeCurve);
        return () => {
            window.removeEventListener('resize', computeCurve);
            window.removeEventListener('orientationchange', computeCurve);
        };
    }, [activeChallenge]);

    const getRandomTopic = (type: ChallengeType) => {
        const topics = TOPIC_SUGGESTIONS[type] || ['general programming'];
        return topics[Math.floor(Math.random() * topics.length)];
    };

    const handleSelectChallenge = useCallback((challenge: ChallengeType) => {
        // Keep topic stable for the lifetime of a challenge to avoid accidental
        // regeneration/switching on unrelated state updates.
        setActiveTopic(useAI ? getRandomTopic(challenge) : getDefaultTopicForChallenge(challenge));
        setActiveChallenge(challenge);
        setCompletionContext(null);
        challengeStartedAtRef.current = Date.now();
    }, [useAI]);

    const handleChallengeComplete = useCallback((score: number) => {
        if (!activeChallenge) return;
        const uiContext = getVisibleDojoContext();
        const resolvedTopic = uiContext.title || activeTopic || getDefaultTopicForChallenge(activeChallenge);

        const newStats: DojoStats = {
            ...stats,
            totalPoints: stats.totalPoints + score,
            challengesCompleted: stats.challengesCompleted + 1,
            categoryProgress: {
                ...stats.categoryProgress,
                [activeChallenge]: (stats.categoryProgress[activeChallenge] || 0) + 1
            }
        };

        if (newStats.challengesCompleted === 1 && !newStats.badges.includes('???')) {
            newStats.badges.push('???');
        }
        if (newStats.challengesCompleted === 10 && !newStats.badges.includes('??')) {
            newStats.badges.push('??');
        }
        if (newStats.totalPoints >= 500 && !newStats.badges.includes('?')) {
            newStats.badges.push('?');
        }
        if (newStats.totalPoints >= 1000 && !newStats.badges.includes('??')) {
            newStats.badges.push('??');
        }

        setStats(newStats);
        localStorage.setItem('dojo-stats', JSON.stringify(newStats));

        const durationSec = challengeStartedAtRef.current
            ? Math.max(0, Math.round((Date.now() - challengeStartedAtRef.current) / 1000))
            : 0;
        const skillMap: Record<ChallengeType, string[]> = {
            parsons: ['Algorithms', 'Code Reading'],
            surgery: ['Debugging', 'Code Reading'],
            eli5: ['Code Reading'],
            faded: ['Code Reading', 'Data Structures'],
            mental: ['Algorithms', 'Debugging'],
            translation: ['Code Reading', 'Design Patterns'],
            pattern: ['Design Patterns'],
            tdd: ['Debugging', 'Code Reading'],
            bigo: ['Big-O Analysis', 'Algorithms'],
            'rubber-duck': ['Debugging', 'Code Reading'],
            council: ['System Design', 'Architecture'],
        };

        recordChallenge({
            challengeType: activeChallenge,
            score,
            durationSec,
            skills: skillMap[activeChallenge] || [],
        });
        challengeStartedAtRef.current = null;

        setCompletionContext({
            challenge: activeChallenge,
            topic: resolvedTopic,
            language: selectedLanguage,
            score,
        });
        setActiveChallenge(null);
    }, [activeChallenge, activeTopic, recordChallenge, selectedLanguage, stats]);

    const handleBack = useCallback(() => {
        setActiveChallenge(null);
        setCompletionContext(null);
        challengeStartedAtRef.current = null;
    }, []);

    const handleGenerateFromCompletion = useCallback(async () => {
        if (!completionContext) return;
        setIsGeneratingCards(true);
        try {
            const content = buildDojoFlashcardPrompt({
                challenge: completionContext.challenge,
                topic: completionContext.topic,
                language: completionContext.language,
                useAI,
                score: completionContext.score,
                totalPoints: stats.totalPoints,
                completedCount: stats.challengesCompleted,
            });
            const response = await generateFlashcardsWithGemini({
                source: 'dojo',
                content,
                challengeType: completionContext.challenge,
                topic: completionContext.topic,
                languageHint: completionContext.language,
                score: completionContext.score,
                count: 3,
            });
            setGeneratedCards(response.cards);
            setGenerationEngine(response.engine);
            setGenerationReason(response.fallbackReason);
            setGenerationModalOpen(true);
        } finally {
            setIsGeneratingCards(false);
        }
    }, [completionContext, stats.challengesCompleted, stats.totalPoints, useAI]);

    const handleGenerateFromActiveChallenge = useCallback(async () => {
        if (!activeChallenge) return;
        setIsGeneratingCards(true);
        try {
            const uiContext = getVisibleDojoContext();
            const topicForChallenge = uiContext.title || activeTopic || getDefaultTopicForChallenge(activeChallenge);
            const contentBase = buildDojoFlashcardPrompt({
                challenge: activeChallenge,
                topic: topicForChallenge,
                language: selectedLanguage,
                useAI,
                totalPoints: stats.totalPoints,
                completedCount: stats.challengesCompleted,
            });
            const content = uiContext.description
                ? `${contentBase}\nChallenge description: ${uiContext.description}`
                : contentBase;
            const response = await generateFlashcardsWithGemini({
                source: 'dojo',
                content,
                challengeType: activeChallenge,
                topic: topicForChallenge,
                languageHint: selectedLanguage,
                count: 3,
            });
            setGeneratedCards(response.cards);
            setGenerationEngine(response.engine);
            setGenerationReason(response.fallbackReason);
            setGenerationModalOpen(true);
        } finally {
            setIsGeneratingCards(false);
        }
    }, [activeChallenge, activeTopic, selectedLanguage, stats.challengesCompleted, stats.totalPoints, useAI]);

    const handleSaveGeneratedCards = (cards: GeneratedCardCandidate[]) => {
        const summary = addGeneratedCards(cards, 'dojo');
        setSaveSummary(summary);
        if (toastTimeoutRef.current !== null) {
            window.clearTimeout(toastTimeoutRef.current);
        }
        toastTimeoutRef.current = window.setTimeout(() => {
            setSaveSummary(null);
            toastTimeoutRef.current = null;
        }, 3500);
        setGenerationModalOpen(false);
    };

    if (activeChallenge) {
        const topic = activeTopic || getDefaultTopicForChallenge(activeChallenge);
        let challengeView: JSX.Element;

        switch (activeChallenge) {
            case 'parsons':
                challengeView = (
                    <ParsonsChallenge
                        topic={topic}
                        language={selectedLanguage}
                        onComplete={handleChallengeComplete}
                        onBack={handleBack}
                        useAI={useAI}
                    />
                );
                break;
            case 'surgery':
                challengeView = (
                    <CodeSurgery
                        topic={topic}
                        language={selectedLanguage}
                        onComplete={handleChallengeComplete}
                        onBack={handleBack}
                        useAI={useAI}
                    />
                );
                break;
            case 'eli5':
                challengeView = (
                    <ELI5Challenge
                        topic={topic}
                        language={selectedLanguage}
                        onComplete={handleChallengeComplete}
                        onBack={handleBack}
                        useAI={useAI}
                    />
                );
                break;
            case 'faded':
                challengeView = (
                    <FadedExamples
                        topic={topic}
                        language={selectedLanguage}
                        onComplete={handleChallengeComplete}
                        onBack={handleBack}
                        useAI={useAI}
                    />
                );
                break;
            case 'mental':
                challengeView = (
                    <MentalCompiler
                        topic={topic}
                        language={selectedLanguage}
                        onComplete={handleChallengeComplete}
                        onBack={handleBack}
                        useAI={useAI}
                    />
                );
                break;
            case 'rubber-duck':
                challengeView = (
                    <RubberDuckDebugger
                        onComplete={handleChallengeComplete}
                        onBack={handleBack}
                    />
                );
                break;
            case 'translation':
                challengeView = (
                    <CodeTranslation
                        onComplete={handleChallengeComplete}
                        onBack={handleBack}
                        useAI={useAI}
                    />
                );
                break;
            case 'pattern':
                challengeView = (
                    <PatternDetective
                        onComplete={handleChallengeComplete}
                        onBack={handleBack}
                        useAI={useAI}
                    />
                );
                break;
            case 'bigo':
                challengeView = (
                    <BigOBattle
                        language={selectedLanguage}
                        onComplete={handleChallengeComplete}
                        onBack={handleBack}
                        useAI={useAI}
                    />
                );
                break;
            case 'tdd':
                challengeView = (
                    <TDDChallenge
                        onComplete={handleChallengeComplete}
                        onBack={handleBack}
                        useAI={useAI}
                    />
                );
                break;
            case 'council':
                challengeView = (
                    <CouncilChallenge
                        topic={activeTopic}
                        language={selectedLanguage}
                        onComplete={handleChallengeComplete}
                        onBack={handleBack}
                        useAI={useAI}
                    />
                );
                break;
            default:
                challengeView = (
                    <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-6xl mb-4">??</div>
                            <h2 className="text-xl font-bold mb-2">Coming Soon!</h2>
                            <p className="text-[color:var(--color-text-muted)] mb-4">
                                This challenge is under development.
                            </p>
                            <button
                                onClick={handleBack}
                                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                            >
                                Back to Dojo
                            </button>
                        </div>
                    </div>
                );
        }

        return (
            <>
                <GeneratedCardReviewModal
                    open={generationModalOpen}
                    cards={generatedCards}
                    engine={generationEngine}
                    fallbackReason={generationReason}
                    loading={isGeneratingCards}
                    title="Review Dojo Flashcards"
                    onClose={() => setGenerationModalOpen(false)}
                    onSave={handleSaveGeneratedCards}
                    onRegenerate={handleGenerateFromActiveChallenge}
                />
                {challengeView}
                <span
                    ref={hintTextRef}
                    className="fixed top-20 right-4 md:top-24 md:right-6 z-30 pointer-events-none text-primary-400 text-[11px] md:text-xs font-medium italic whitespace-nowrap"
                >
                    Want revision cards from this challenge?
                </span>
                {hintCurve && (
                    <svg
                        className="fixed inset-0 z-30 pointer-events-none"
                        viewBox={`0 0 ${viewport.width} ${viewport.height}`}
                        preserveAspectRatio="none"
                        aria-hidden="true"
                    >
                        <path
                            d={hintCurve.d}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeDasharray="4 6"
                            vectorEffect="non-scaling-stroke"
                            className="text-primary-400"
                        >
                            <animate
                                attributeName="stroke-dashoffset"
                                from="20"
                                to="0"
                                dur="1.4s"
                                repeatCount="indefinite"
                            />
                        </path>
                        <path
                            d={hintCurve.arrowD}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                            className="text-primary-400"
                        />
                    </svg>
                )}
                {/* Debate panel */}
                <SocraticDebatePanel
                    isOpen={debate.isOpen}
                    messages={debate.messages}
                    phase={debate.phase}
                    debateMode={debate.debateMode}
                    context={debateContext}
                    isLoading={debate.isLoading}
                    error={debate.error}
                    onSendMessage={debate.sendMessage}
                    onClose={debate.closeDebate}
                    onReset={debate.resetDebate}
                />
                {/* Left Center: Socratic Debate Button */}
                <div className="fixed top-1/2 left-4 md:left-8 -translate-y-1/2 z-40">
                    <DebateTerminalButton
                        onClick={() => {
                            if (debate.isOpen) {
                                debate.closeDebate();
                            } else {
                                refreshDebateContext();
                                debate.openDebate('challenge');
                            }
                        }}
                        isActive={debate.isOpen}
                    />
                </div>

                {/* Bottom Right: Generate Flashcards Button */}
                <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
                    <button
                        ref={generateButtonRef}
                        onClick={handleGenerateFromActiveChallenge}
                        disabled={isGeneratingCards}
                        className="px-4 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium shadow-lg hover:bg-primary-600 disabled:opacity-60"
                    >
                        {isGeneratingCards ? 'Generating Cards...' : 'Generate Flashcards'}
                    </button>
                </div>
                {saveSummary && (
                    <div className="fixed bottom-20 right-6 z-50 max-w-sm rounded-lg border border-success/40 bg-[color:var(--color-bg-elevated)] px-4 py-3 shadow-lg">
                        <p className="text-sm font-semibold text-success mb-1">Flashcards saved</p>
                        <p className="text-xs text-[color:var(--color-text-secondary)]">
                            Inserted: {saveSummary.inserted} | Duplicates: {saveSummary.duplicates} | Rejected: {saveSummary.rejected}
                        </p>
                    </div>
                )}
            </>
        );
    }

    if (completionContext) {
        return (
            <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center p-6">
                <GeneratedCardReviewModal
                    open={generationModalOpen}
                    cards={generatedCards}
                    engine={generationEngine}
                    fallbackReason={generationReason}
                    loading={isGeneratingCards}
                    title="Review Dojo Flashcards"
                    onClose={() => setGenerationModalOpen(false)}
                    onSave={handleSaveGeneratedCards}
                    onRegenerate={handleGenerateFromCompletion}
                />

                <div className="w-full max-w-2xl rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-8 text-center">
                    <h2 className="text-2xl font-display font-bold mb-2">Challenge Complete</h2>
                    <p className="text-[color:var(--color-text-muted)] mb-6">
                        {completionContext.challenge} • {completionContext.topic} • Score {completionContext.score}
                    </p>

                    <div className="flex flex-wrap gap-3 justify-center">
                        <button
                            onClick={() => debate.openDebate('review')}
                            disabled={debate.isLoading}
                            className="px-5 py-2.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-60 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 10L12 5 2 10l10 5 10-5z" />
                                <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
                            </svg>
                            Review My Answer
                        </button>
                        <button
                            onClick={handleGenerateFromCompletion}
                            disabled={isGeneratingCards}
                            className="px-5 py-2.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-60"
                        >
                            {isGeneratingCards ? 'Generating...' : 'Generate Flashcards'}
                        </button>
                        <button
                            onClick={() => setCompletionContext(null)}
                            className="px-5 py-2.5 rounded-lg border border-[color:var(--color-border)] hover:bg-[color:var(--color-bg-muted)]"
                        >
                            Back to Dojo
                        </button>
                    </div>
                    {/* Debate panel for completion review */}
                    <SocraticDebatePanel
                        isOpen={debate.isOpen}
                        messages={debate.messages}
                        phase={debate.phase}
                        debateMode={debate.debateMode}
                        context={debateContext}
                        isLoading={debate.isLoading}
                        error={debate.error}
                        onSendMessage={debate.sendMessage}
                        onClose={debate.closeDebate}
                        onReset={debate.resetDebate}
                    />
                    {!settings.autoCreateFromDojo && (
                        <p className="mt-3 text-xs text-[color:var(--color-text-muted)]">
                            Tip: enable auto-create in SRS settings if you want this prompt to appear automatically in more places.
                        </p>
                    )}
                </div>
                {saveSummary && (
                    <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-lg border border-success/40 bg-[color:var(--color-bg-elevated)] px-4 py-3 shadow-lg">
                        <p className="text-sm font-semibold text-success mb-1">Flashcards saved</p>
                        <p className="text-xs text-[color:var(--color-text-secondary)]">
                            Inserted: {saveSummary.inserted} | Duplicates: {saveSummary.duplicates} | Rejected: {saveSummary.rejected}
                        </p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <DojoHub
            onSelectChallenge={handleSelectChallenge}
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
            useAI={useAI}
            onAIToggle={handleAIToggle}
        />
    );
}

export default DojoPage;


