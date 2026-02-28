import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import Button from '../../ui/Button';
import ThemeToggle from '../../components/ThemeToggle';
import { ChallengeType, DojoStats } from './types';
import { ChallengeIcons, DojoIcon } from './ChallengeIcons';
import { SUPPORTED_LANGUAGES, isLanguageSupportedInPractice } from './constants';
import ModeSwitcher from './ModeSwitcher';

interface ChallengeCard {
    id: ChallengeType;
    name: string;
    description: string;
    color: string;
    iconColor: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    available: boolean;
}

const challengeCards: ChallengeCard[] = [
    {
        id: 'parsons',
        name: 'Parsons Problem',
        description: 'Drag & drop code blocks into the correct order',
        color: 'from-blue-500 to-cyan-500',
        iconColor: 'text-blue-400',
        difficulty: 'Medium',
        available: true
    },
    {
        id: 'surgery',
        name: 'Code Surgery',
        description: 'Find and fix the hidden bugs in the code',
        color: 'from-red-500 to-orange-500',
        iconColor: 'text-red-400',
        difficulty: 'Medium',
        available: true
    },
    {
        id: 'eli5',
        name: 'ELI5 Mode',
        description: 'Explain code so simply a 5-year-old understands',
        color: 'from-pink-500 to-purple-500',
        iconColor: 'text-pink-400',
        difficulty: 'Easy',
        available: true
    },
    {
        id: 'faded',
        name: 'Fill the Blanks',
        description: 'Complete the code by filling in missing parts',
        color: 'from-green-500 to-emerald-500',
        iconColor: 'text-green-400',
        difficulty: 'Easy',
        available: true
    },
    {
        id: 'mental',
        name: 'Mental Compiler',
        description: 'Predict the output before running the code',
        color: 'from-violet-500 to-indigo-500',
        iconColor: 'text-violet-400',
        difficulty: 'Medium',
        available: true
    },
    {
        id: 'rubber-duck',
        name: 'Rubber Duck',
        description: 'Explain your code to an AI duck that asks questions',
        color: 'from-yellow-500 to-amber-500',
        iconColor: 'text-yellow-400',
        difficulty: 'Easy',
        available: true
    },
    {
        id: 'translation',
        name: 'Code Translation',
        description: 'Translate code between languages and paradigms',
        color: 'from-teal-500 to-cyan-500',
        iconColor: 'text-teal-400',
        difficulty: 'Hard',
        available: true
    },
    {
        id: 'tdd',
        name: 'Test-Driven',
        description: 'Write code to pass the given test cases',
        color: 'from-lime-500 to-green-500',
        iconColor: 'text-lime-400',
        difficulty: 'Medium',
        available: true
    },
    {
        id: 'pattern',
        name: 'Pattern Detective',
        description: 'Identify design patterns and code smells',
        color: 'from-slate-500 to-gray-500',
        iconColor: 'text-slate-400',
        difficulty: 'Hard',
        available: true
    },
    {
        id: 'bigo',
        name: 'Big O Battle',
        description: 'Race against time to identify algorithm complexity',
        color: 'from-orange-500 to-red-500',
        iconColor: 'text-orange-400',
        difficulty: 'Medium',
        available: true
    }
];

// Default stats
const defaultStats: DojoStats = {
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
        bigo: 0,
        council: 0
    }
};

interface DojoHubProps {
    onSelectChallenge: (type: ChallengeType) => void;
    selectedLanguage?: string;
    onLanguageChange?: (lang: string) => void;
    useAI?: boolean;
    onAIToggle?: (value: boolean) => void;
}

function DojoHub({ onSelectChallenge, selectedLanguage = 'python', onLanguageChange, useAI = false, onAIToggle }: DojoHubProps) {
    const cardsRef = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const [stats, setStats] = useState<DojoStats>(defaultStats);

    // Load stats from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('dojo-stats');
        if (saved) {
            try {
                setStats(JSON.parse(saved));
            } catch {
                // Use default stats
            }
        }
    }, []);

    // Animated background - floating code elements
    useEffect(() => {
        if (!bgRef.current) return;

        const container = bgRef.current;
        const elements: HTMLDivElement[] = [];

        // Code-related SVG paths
        const svgPaths = [
            // Curly braces
            '<path d="M8 4C4 4 4 8 4 12s0 8 4 8M16 4c4 0 4 4 4 8s0 8-4 8" stroke="currentColor" fill="none" stroke-width="1.5"/>',
            // Angle brackets
            '<path d="M9 18l-6-6 6-6M15 6l6 6-6 6" stroke="currentColor" fill="none" stroke-width="1.5"/>',
            // Bug
            '<circle cx="12" cy="12" r="6" stroke="currentColor" fill="none" stroke-width="1.5"/><path d="M12 6V2M8 8l-4-4M16 8l4-4M12 18v4M8 16l-4 4M16 16l4 4" stroke="currentColor" fill="none" stroke-width="1.5"/>',
            // Gear
            '<circle cx="12" cy="12" r="3" stroke="currentColor" fill="none" stroke-width="1.5"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" fill="none" stroke-width="1.5"/>',
            // Lightning
            '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" fill="none" stroke-width="1.5"/>',
            // Terminal
            '<rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" fill="none" stroke-width="1.5"/><path d="M6 12l4-4M6 12l4 4M14 16h4" stroke="currentColor" fill="none" stroke-width="1.5"/>',
            // Code block
            '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke="currentColor" fill="none" stroke-width="2"/>',
            // Binary
            '<text x="4" y="10" font-size="8" fill="currentColor">01</text><text x="12" y="18" font-size="8" fill="currentColor">10</text>',
            // Hash
            '<path d="M4 8h16M4 16h16M8 4v16M16 4v16" stroke="currentColor" fill="none" stroke-width="1.5"/>',
            // Function arrow
            '<path d="M4 12h12M12 8l4 4-4 4" stroke="currentColor" fill="none" stroke-width="1.5"/><circle cx="20" cy="12" r="1" fill="currentColor"/>',
            // Brackets
            '<path d="M8 4H4v16h4M16 4h4v16h-4" stroke="currentColor" fill="none" stroke-width="1.5"/>',
            // Asterisk
            '<path d="M12 4v16M4 12h16M6 6l12 12M18 6L6 18" stroke="currentColor" fill="none" stroke-width="1.5"/>',
            // Plus
            '<path d="M12 4v16M4 12h16" stroke="currentColor" fill="none" stroke-width="2"/>',
            // Equals
            '<path d="M4 8h16M4 16h16" stroke="currentColor" fill="none" stroke-width="2"/>',
            // Loop arrow
            '<path d="M4 12a8 8 0 1116 0M16 6l4 6h-8" stroke="currentColor" fill="none" stroke-width="1.5"/>',
        ];

        const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#FF6B35', '#00D4AA'];

        // Create 80 floating elements - more visible
        for (let i = 0; i < 80; i++) {
            const el = document.createElement('div');
            el.className = 'absolute pointer-events-none';

            const svgPath = svgPaths[i % svgPaths.length];
            const color = colors[i % colors.length];
            const size = 26 + Math.random() * 38; // Larger sizes

            el.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="color: ${color}; opacity: 0.35;">${svgPath}</svg>`;
            el.style.left = `${Math.random() * 100}%`;
            el.style.top = `${Math.random() * 100}%`;

            container.appendChild(el);
            elements.push(el);

            // Main floating animation - faster and more noticeable
            gsap.to(el, {
                y: `-=${80 + Math.random() * 120}`,
                x: `+=${-60 + Math.random() * 120}`,
                rotation: -50 + Math.random() * 100,
                duration: 3 + Math.random() * 4,
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut',
                delay: i * 0.03,
            });

            // Opacity breathing - stays visible
            gsap.to(el.firstChild as SVGElement, {
                opacity: 0.15 + Math.random() * 0.3,
                duration: 2 + Math.random() * 2,
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut',
                delay: i * 0.04,
            });

            // Scale pulse
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

    // Animate cards on mount
    useEffect(() => {
        if (cardsRef.current) {
            const cards = cardsRef.current.querySelectorAll('.challenge-card');
            gsap.fromTo(cards,
                { opacity: 0, y: 30, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.4,
                    stagger: 0.06,
                    ease: 'back.out(1.2)'
                }
            );
        }
    }, []);

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'Medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'Hard': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)] relative overflow-hidden">
            {/* Animated background */}
            <div
                ref={bgRef}
                className="fixed inset-0 pointer-events-none text-[color:var(--color-text-primary)]"
                style={{ zIndex: 0 }}
            />

            {/* Gradient orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/10 to-transparent blur-3xl" />
                <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-orange-500/10 to-transparent blur-3xl" />
                <div className="absolute -bottom-32 left-1/3 w-72 h-72 rounded-full bg-gradient-to-br from-green-500/10 to-transparent blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative z-10 sticky top-0 backdrop-blur-xl border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)]/80">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/learn" className="p-2 -ml-2 rounded-xl hover:bg-[color:var(--color-bg-muted)] transition-colors">
                            <svg className="w-5 h-5 text-[color:var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-display font-bold flex items-center gap-3">
                                <span className="text-primary-400"><DojoIcon size={32} /></span>
                                The Dojo
                            </h1>
                            <p className="text-sm text-[color:var(--color-text-muted)]">
                                Master coding through interactive challenges
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Language Selector */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-[color:var(--color-text-muted)] hidden sm:inline">Language:</span>
                            <select
                                value={selectedLanguage}
                                onChange={(e) => onLanguageChange?.(e.target.value)}
                                className="px-3 py-1.5 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                            >
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <option key={lang.id} value={lang.id}>
                                        {lang.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Mode Switcher */}
                        {onAIToggle && (
                            <ModeSwitcher useAI={useAI} onToggle={onAIToggle} />
                        )}
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Stats Bar */}
            <div className="relative z-10 bg-[color:var(--color-bg-secondary)]/50 backdrop-blur-sm border-b border-[color:var(--color-border)]">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-6">
                            <StatBox
                                icon={<StarIcon />}
                                value={stats.totalPoints.toLocaleString()}
                                label="Points"
                                color="text-amber-500"
                            />
                            <StatBox
                                icon={<TrophyIcon />}
                                value={stats.challengesCompleted.toString()}
                                label="Completed"
                                color="text-blue-500"
                            />
                            <StatBox
                                icon={<FlameIcon />}
                                value={`${stats.currentStreak}d`}
                                label="Streak"
                                color="text-orange-500"
                            />
                        </div>
                        {stats.badges.length > 0 && (
                            <div className="flex items-center gap-1">
                                {stats.badges.slice(0, 5).map((badge, i) => (
                                    <span key={i} className="text-lg">{badge}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-[color:var(--color-text-primary)] mb-2">
                        Choose Your Challenge
                    </h2>
                    <p className="text-[color:var(--color-text-muted)]">
                        10 different ways to practice. Pick what fits your mood.
                    </p>
                </div>

                {/* Challenge Grid */}
                <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {challengeCards.map((card) => {
                        const practiceSupported = isLanguageSupportedInPractice(card.id, selectedLanguage);
                        const isEnabled = card.available && (useAI || practiceSupported);
                        const disabledReason = !card.available
                            ? 'Coming Soon'
                            : 'Not yet available for this mode in Practice source. Switch to AI Mode to get a challenge.';

                        return (
                            <button
                                key={card.id}
                                onClick={() => isEnabled && onSelectChallenge(card.id)}
                                disabled={!isEnabled}
                                title={!isEnabled ? disabledReason : undefined}
                                className={`
                                challenge-card group relative overflow-hidden rounded-2xl p-5 text-left
                                transition-all duration-300
                                ${isEnabled
                                        ? 'bg-[color:var(--color-bg-secondary)] hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-1 cursor-pointer'
                                        : 'bg-[color:var(--color-bg-muted)] opacity-50 cursor-not-allowed'
                                    }
                                border border-[color:var(--color-border)] hover:border-transparent
                            `}
                            >
                                {/* Gradient accent - visible on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-300`} />

                                {/* Top accent line */}
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-100 transition-opacity`} />

                                {/* Icon */}
                                {(() => {
                                    const IconComponent = ChallengeIcons[card.id];
                                    return IconComponent ? (
                                        <div className={`mb-4 ${card.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                                            <IconComponent size={36} />
                                        </div>
                                    ) : null;
                                })()}

                                {/* Content */}
                                <h3 className="font-bold text-lg mb-1 text-[color:var(--color-text-primary)]">{card.name}</h3>
                                <p className="text-sm text-[color:var(--color-text-muted)] mb-4 leading-relaxed">
                                    {card.description}
                                </p>

                                {/* Footer */}
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg border ${getDifficultyColor(card.difficulty)}`}>
                                        {card.difficulty}
                                    </span>
                                    {!isEnabled && (
                                        <span className="text-xs bg-[color:var(--color-bg-muted)] px-2 py-1 rounded-lg">
                                            {disabledReason}
                                        </span>
                                    )}
                                    {isEnabled && stats.categoryProgress[card.id] > 0 && (
                                        <span className="text-xs text-[color:var(--color-text-muted)]">
                                            {stats.categoryProgress[card.id]}x
                                        </span>
                                    )}
                                </div>

                                {/* Arrow on hover */}
                                <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                    <svg className="w-5 h-5 text-[color:var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Quick Start Section */}
                <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-primary-500/5 to-secondary-500/5 border border-[color:var(--color-border)]">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h3 className="text-lg font-bold mb-2 text-[color:var(--color-text-primary)]">
                                New to The Dojo?
                            </h3>
                            <p className="text-[color:var(--color-text-muted)]">
                                Start with <strong>Fill the Blanks</strong> to warm up,
                                then try <strong>Parsons Problems</strong> to test your understanding.
                            </p>
                        </div>
                        <div className="flex gap-3 flex-shrink-0">
                            <Button onClick={() => onSelectChallenge('faded')}>
                                Start Easy
                            </Button>
                            <Button variant="secondary" onClick={() => onSelectChallenge('parsons')}>
                                Try Parsons
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Stat Box Component
function StatBox({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-[color:var(--color-bg-muted)] flex items-center justify-center ${color}`}>
                {icon}
            </div>
            <div>
                <div className="text-lg font-bold text-[color:var(--color-text-primary)]">{value}</div>
                <div className="text-xs text-[color:var(--color-text-muted)]">{label}</div>
            </div>
        </div>
    );
}

// SVG Icons
function StarIcon() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
    );
}

function TrophyIcon() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2" />
            <path d="M4 22h16M10 14.66V17c0 2.21 4 2.21 4 0v-2.34" />
            <path d="M18 2H6v7a6 6 0 1012 0V2z" />
        </svg>
    );
}

function FlameIcon() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 23c-3.866 0-7-2.91-7-6.5 0-1.87.82-3.69 2.25-5.5.69-.88 1.46-1.68 2.25-2.4-.33 1.82.3 3.59 1.5 4.9 0 0 .85-2.4 3-4 1.28-.95 2.18-2.34 2.53-3.9.15-.66.22-1.34.22-2.03 0-.22-.01-.45-.03-.67C18.35 5.13 20 8.54 20 12c0 6.08-3.58 11-8 11z" />
        </svg>
    );
}

export default DojoHub;
