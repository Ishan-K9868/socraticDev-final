import { useState, useCallback } from 'react';
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
import { ChallengeType, DojoStats } from './types';

// Re-export for convenience
export { SUPPORTED_LANGUAGES } from './constants';

// Topic suggestions for each challenge type
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
    bigo: ['sorting algorithms', 'search algorithms', 'nested loops', 'recursive functions']
};

function DojoPage() {
    const [activeChallenge, setActiveChallenge] = useState<ChallengeType | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState(() => {
        return localStorage.getItem('dojo-language') || 'python';
    });
    const [useAI, setUseAI] = useState(() => {
        return localStorage.getItem('dojo-use-ai') === 'true';
    });
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

    const handleChallengeComplete = useCallback((score: number) => {
        if (!activeChallenge) return;

        const newStats: DojoStats = {
            ...stats,
            totalPoints: stats.totalPoints + score,
            challengesCompleted: stats.challengesCompleted + 1,
            categoryProgress: {
                ...stats.categoryProgress,
                [activeChallenge]: (stats.categoryProgress[activeChallenge] || 0) + 1
            }
        };

        // Check for badges
        if (newStats.challengesCompleted === 1 && !newStats.badges.includes('🎖️')) {
            newStats.badges.push('🎖️'); // First challenge
        }
        if (newStats.challengesCompleted === 10 && !newStats.badges.includes('🏅')) {
            newStats.badges.push('🏅'); // 10 challenges
        }
        if (newStats.totalPoints >= 500 && !newStats.badges.includes('⭐')) {
            newStats.badges.push('⭐'); // 500 points
        }
        if (newStats.totalPoints >= 1000 && !newStats.badges.includes('🌟')) {
            newStats.badges.push('🌟'); // 1000 points
        }

        setStats(newStats);
        localStorage.setItem('dojo-stats', JSON.stringify(newStats));

        // Return to hub after a delay
        setTimeout(() => {
            setActiveChallenge(null);
        }, 500);
    }, [activeChallenge, stats]);

    const handleBack = useCallback(() => {
        setActiveChallenge(null);
    }, []);

    const getRandomTopic = (type: ChallengeType) => {
        const topics = TOPIC_SUGGESTIONS[type] || ['general programming'];
        return topics[Math.floor(Math.random() * topics.length)];
    };

    // Render active challenge
    if (activeChallenge) {
        const topic = getRandomTopic(activeChallenge);

        switch (activeChallenge) {
            case 'parsons':
                return (
                    <ParsonsChallenge
                        topic={topic}
                        language={selectedLanguage}
                        onComplete={handleChallengeComplete}
                        onBack={handleBack}
                        useAI={useAI}
                    />
                );
            case 'surgery':
                return (
                    <CodeSurgery
                        topic={topic}
                        language={selectedLanguage}
                        onComplete={handleChallengeComplete}
                        onBack={handleBack}
                        useAI={useAI}
                    />
                );
            case 'eli5':
                return (
                    <ELI5Challenge
                        topic={topic}
                        language={selectedLanguage}
                        onComplete={handleChallengeComplete}
                        onBack={handleBack}
                        useAI={useAI}
                    />
                );
            case 'faded':
                return (
                    <FadedExamples
                        topic={topic}
                        language={selectedLanguage}
                        onComplete={handleChallengeComplete}
                        onBack={handleBack}
                        useAI={useAI}
                    />
                );
            case 'mental':
                return (
                    <MentalCompiler
                        topic={topic}
                        language={selectedLanguage}
                        onComplete={handleChallengeComplete}
                        onBack={handleBack}
                        useAI={useAI}
                    />
                );
            case 'rubber-duck':
                return (
                    <RubberDuckDebugger
                        onComplete={handleChallengeComplete}
                        onBack={handleBack}
                    />
                );
            case 'translation':
                return (
                    <CodeTranslation
                        onComplete={handleChallengeComplete}
                        onBack={handleBack}
                        useAI={useAI}
                    />
                );
            case 'pattern':
                return (
                    <PatternDetective
                        onComplete={handleChallengeComplete}
                        onBack={handleBack}
                        useAI={useAI}
                    />
                );
            case 'bigo':
                return (
                    <BigOBattle
                        onComplete={handleChallengeComplete}
                        onBack={handleBack}
                        useAI={useAI}
                    />
                );
            case 'tdd':
                return (
                    <TDDChallenge
                        onComplete={handleChallengeComplete}
                        onBack={handleBack}
                        useAI={useAI}
                    />
                );
            default:
                return (
                    <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🚧</div>
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
    }

    // Render hub with language selector
    return (
        <DojoHub
            onSelectChallenge={setActiveChallenge}
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
            useAI={useAI}
            onAIToggle={handleAIToggle}
        />
    );
}

export default DojoPage;
