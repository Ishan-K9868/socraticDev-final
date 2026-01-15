import { useState, useCallback, useEffect } from 'react';
import { gsap } from 'gsap';
import { SurgeryChallenge as SurgeryChallengeType, Bug } from './types';
import { useChallengeAI } from './useChallengeAI';
import Button from '../../ui/Button';
import { getRandomSurgeryExample } from './examples/surgeryExamples';

interface CodeSurgeryProps {
    topic?: string;
    language?: string;
    onComplete?: (score: number) => void;
    onBack?: () => void;
    useAI?: boolean;
}

function CodeSurgery({
    topic = 'async/await',
    language = 'javascript',
    onComplete,
    onBack,
    useAI = false
}: CodeSurgeryProps) {
    const [challenge, setChallenge] = useState<SurgeryChallengeType | null>(null);
    const [foundBugs, setFoundBugs] = useState<Set<number>>(new Set());
    const [wrongGuesses, setWrongGuesses] = useState<Set<number>>(new Set());
    const [hintsUsed, setHintsUsed] = useState(0);
    const [currentHint, setCurrentHint] = useState<string | null>(null);
    const [showSolution, setShowSolution] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [finalScore, setFinalScore] = useState(0);
    const [timer, setTimer] = useState(0);
    const [selectedLanguage] = useState(language);

    const { generateSurgeryChallenge, isGenerating, error } = useChallengeAI();

    const loadHardcodedChallenge = useCallback(() => {
        const example = getRandomSurgeryExample(selectedLanguage);
        const challengeData: SurgeryChallengeType = {
            id: `surgery-${Date.now()}`,
            type: 'surgery',
            title: example.title,
            description: example.description,
            difficulty: 'intermediate',
            topic: 'bug hunting',
            language: example.language || selectedLanguage,
            buggyCode: example.buggyCode,
            correctCode: example.correctCode,
            bugs: example.bugs,
            points: 75
        };
        setChallenge(challengeData);
    }, [selectedLanguage]);

    // Generate challenge on mount
    useEffect(() => {
        if (useAI) {
            const loadChallenge = async () => {
                const generated = await generateSurgeryChallenge(topic, selectedLanguage);
                if (generated) {
                    console.log('Challenge loaded:', generated);
                    setChallenge(generated);
                }
            };
            loadChallenge();
        } else {
            loadHardcodedChallenge();
        }
    }, [useAI, topic, selectedLanguage, generateSurgeryChallenge, loadHardcodedChallenge]);

    // Timer
    useEffect(() => {
        if (!challenge || isComplete) return;
        const interval = setInterval(() => {
            setTimer(t => t + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [challenge, isComplete]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleLineClick = useCallback((lineNumber: number) => {
        if (!challenge || isComplete) return;

        const bug = challenge.bugs.find(b => b.lineNumber === lineNumber);

        if (bug) {
            setFoundBugs(prev => new Set([...prev, lineNumber]));

            gsap.fromTo(`.code-line-${lineNumber}`,
                { backgroundColor: 'rgba(34, 197, 94, 0.3)' },
                { backgroundColor: 'rgba(34, 197, 94, 0.1)', duration: 0.5 }
            );

            if (foundBugs.size + 1 === challenge.bugs.length) {
                setIsComplete(true);
                const baseScore = challenge.points;
                const timePenalty = Math.floor(timer / 30) * 5;
                const hintPenalty = hintsUsed * 20;
                const wrongPenalty = wrongGuesses.size * 10;
                const score = Math.max(baseScore - timePenalty - hintPenalty - wrongPenalty, 10);
                setFinalScore(score);
                // No auto-navigation - user clicks Continue button
            }
        } else {
            setWrongGuesses(prev => new Set([...prev, lineNumber]));

            gsap.fromTo(`.code-line-${lineNumber}`,
                { x: -5 },
                { x: 5, duration: 0.1, repeat: 3, yoyo: true }
            );
        }
    }, [challenge, foundBugs, hintsUsed, wrongGuesses, timer, isComplete, onComplete]);

    const useHint = useCallback(() => {
        if (!challenge) return;

        const unfoundBug = challenge.bugs.find(b => !foundBugs.has(b.lineNumber));
        if (unfoundBug) {
            setHintsUsed(prev => prev + 1);
            setCurrentHint(unfoundBug.hint);
        }
    }, [challenge, foundBugs]);

    const getBugInfo = (lineNumber: number): Bug | undefined => {
        return challenge?.bugs.find(b => b.lineNumber === lineNumber);
    };

    if (isGenerating) {
        return (
            <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-pulse">🔪</div>
                    <h2 className="text-xl font-bold mb-2">Preparing Surgery...</h2>
                    <p className="text-[color:var(--color-text-muted)]">
                        Injecting bugs into code for "{topic}"
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-xl font-bold mb-2">Surgery Prep Failed</h2>
                    <p className="text-[color:var(--color-text-muted)] mb-4">{error}</p>
                    <Button onClick={onBack}>Go Back</Button>
                </div>
            </div>
        );
    }

    if (!challenge) return null;

    const codeLines = challenge.buggyCode.split('\n');

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)] p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={onBack}
                        className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)] mb-4 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dojo
                    </button>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-3">
                                <span className="text-3xl">🔪</span>
                                Code Surgery
                            </h1>
                            <p className="text-[color:var(--color-text-muted)] mt-1">
                                {challenge.description}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-mono">{formatTime(timer)}</div>
                            <div className="text-sm text-[color:var(--color-text-muted)]">
                                Bugs: {foundBugs.size}/{challenge.bugs.length}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{Math.round((foundBugs.size / challenge.bugs.length) * 100)}%</span>
                    </div>
                    <div className="h-3 bg-[color:var(--color-bg-muted)] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300"
                            style={{ width: `${(foundBugs.size / challenge.bugs.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-red-400 mb-2">Your Mission</h3>
                    <p className="text-sm">
                        This code has <strong>{challenge.bugs.length} hidden bugs</strong>.
                        Click on the lines you think contain bugs to mark them.
                        Be careful - wrong guesses cost points!
                    </p>
                </div>

                {/* Code Display - Plain Text */}
                <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-700 mb-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800 border-b border-neutral-700">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="ml-2 font-mono text-sm text-neutral-400">{challenge.language}</span>
                    </div>

                    <div className="p-4 overflow-x-auto">
                        {codeLines.map((line, index) => {
                            const lineNum = index + 1;
                            const isFound = foundBugs.has(lineNum);
                            const isWrong = wrongGuesses.has(lineNum);
                            const bugInfo = isFound ? getBugInfo(lineNum) : null;

                            return (
                                <div key={index} className="group">
                                    <div
                                        onClick={() => handleLineClick(lineNum)}
                                        className={`
                                            code-line-${lineNum}
                                            flex items-start gap-4 px-2 py-1 rounded cursor-pointer
                                            transition-all duration-150
                                            ${isFound
                                                ? 'bg-green-500/20 border-l-4 border-green-500'
                                                : isWrong
                                                    ? 'bg-red-500/10'
                                                    : 'hover:bg-neutral-800'
                                            }
                                        `}
                                    >
                                        <span className="text-neutral-500 text-sm w-6 text-right select-none font-mono">
                                            {lineNum}
                                        </span>
                                        <pre className="font-mono text-sm flex-1 text-neutral-100 whitespace-pre m-0 bg-transparent">
                                            {line || ' '}
                                        </pre>
                                        {isFound && (
                                            <span className="text-green-400 text-lg">🐛</span>
                                        )}
                                        {isWrong && !isFound && (
                                            <span className="text-red-400 text-xs">✗</span>
                                        )}
                                    </div>

                                    {/* Bug explanation */}
                                    {isFound && bugInfo && (
                                        <div className="ml-10 my-2 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                                            <div className="flex items-center gap-2 text-green-400 text-sm font-semibold mb-1">
                                                <span>🐛</span>
                                                Bug Found: {bugInfo.bugType}
                                            </div>
                                            <p className="text-sm text-[color:var(--color-text-muted)]">
                                                {bugInfo.description}
                                            </p>
                                            <div className="mt-2 text-sm">
                                                <span className="text-green-400">Fix: </span>
                                                <code className="bg-neutral-800 px-2 py-1 rounded text-neutral-100">{bugInfo.fix}</code>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Hint Section */}
                {currentHint && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                        <h4 className="font-semibold text-yellow-400 mb-2">💡 Hint</h4>
                        <p className="text-sm">{currentHint}</p>
                    </div>
                )}

                {/* Completion Message */}
                {isComplete && (
                    <div className="bg-green-500/10 border-2 border-green-500 rounded-xl p-6 mb-6 text-center">
                        <div className="text-5xl mb-3">🎉</div>
                        <h3 className="text-2xl font-bold text-green-400 mb-2">Surgery Complete!</h3>
                        <p className="text-[color:var(--color-text-muted)] mb-2">
                            You found all {challenge.bugs.length} bugs in {formatTime(timer)}!
                        </p>
                        <div className="text-3xl font-bold text-primary-400 mb-4">
                            +{finalScore} points
                        </div>
                        <Button onClick={() => onComplete?.(finalScore)}>
                            Continue to Dojo →
                        </Button>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="secondary"
                        onClick={useHint}
                        disabled={foundBugs.size === challenge.bugs.length}
                    >
                        Get Hint (-20 pts)
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setShowSolution(!showSolution)}
                    >
                        {showSolution ? 'Hide' : 'Show'} Solution
                    </Button>
                    <div className="ml-auto text-sm text-[color:var(--color-text-muted)]">
                        Wrong guesses: {wrongGuesses.size} (-{wrongGuesses.size * 10} pts)
                    </div>
                </div>

                {/* Solution Display */}
                {showSolution && (
                    <div className="mt-6 bg-neutral-900 rounded-xl overflow-hidden border border-neutral-700">
                        <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800 border-b border-neutral-700">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                            <span className="ml-2 font-mono text-sm text-green-400">✅ Correct Code</span>
                        </div>
                        <div className="p-4 overflow-x-auto">
                            {challenge.correctCode.split('\n').map((line, idx) => (
                                <div key={idx} className="flex items-start gap-4 px-2 py-1">
                                    <span className="text-neutral-500 text-sm w-6 text-right select-none font-mono">
                                        {idx + 1}
                                    </span>
                                    <pre className="font-mono text-sm flex-1 text-green-300 whitespace-pre m-0 bg-transparent">
                                        {line || ' '}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CodeSurgery;
