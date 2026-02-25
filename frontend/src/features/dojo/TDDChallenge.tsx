import { useState, useCallback, useEffect } from 'react';
import { gsap } from 'gsap';
import { sendMessageToGemini } from '../../services/gemini';
import Button from '../../ui/Button';
import ChallengeSourceBadge from './ChallengeSourceBadge';
import { getRandomTDDExample } from './examples/tddExamples';
import { evaluateTddTests } from './evaluators';

interface TestCase {
    id: string;
    description: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}

interface TDDProblem {
    title: string;
    description: string;
    functionSignature: string;
    testCases: TestCase[];
    language: string;
    solution: string;
    source?: 'practice' | 'ai';
    isFallback?: boolean;
    fallbackReason?: string;
}

interface TDDChallengeProps {
    onComplete?: (score: number) => void;
    onBack?: () => void;
    useAI?: boolean;
}

function parseJson<T>(response: string): T | null {
    const match = response.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
        return JSON.parse(match[0]) as T;
    } catch {
        return null;
    }
}

function TDDChallenge({ onComplete, onBack, useAI = false }: TDDChallengeProps) {
    const [problem, setProblem] = useState<TDDProblem | null>(null);
    const [userCode, setUserCode] = useState('');
    const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});
    const [isGenerating, setIsGenerating] = useState(true);
    const [isRunning, setIsRunning] = useState(false);
    const [wave, setWave] = useState(1);
    const [allPassed, setAllPassed] = useState(false);

    const revealedCount = Math.min(2 + (wave - 1), 5);

    const resetState = useCallback(() => {
        setTestResults({});
        setWave(1);
        setAllPassed(false);
    }, []);

    const loadHardcodedProblem = useCallback((reason?: string) => {
        const example = getRandomTDDExample();
        setProblem({
            title: example.title,
            description: example.description,
            functionSignature: example.functionSignature,
            testCases: example.testCases,
            language: example.language,
            solution: example.solution,
            source: useAI ? 'ai' : 'practice',
            isFallback: Boolean(reason),
            fallbackReason: reason,
        });
        setUserCode(`${example.functionSignature}\n    # Your code here\n    pass`);
        setIsGenerating(false);
    }, [useAI]);

    const generateProblem = useCallback(async () => {
        setIsGenerating(true);
        resetState();

        if (!useAI) {
            loadHardcodedProblem();
            return;
        }

        try {
            const response = await sendMessageToGemini([{
                role: 'user',
                content: `Generate a Python TDD challenge with 5 tests. Return ONLY JSON:\n{\n  "title": "...",\n  "description": "...",\n  "functionSignature": "def fn(x):",\n  "language": "python",\n  "testCases": [{"id":"1","description":"...","input":"fn(1)","expectedOutput":"2","isHidden":false}],\n  "solution": "..."\n}`,
            }], 'building');

            const data = parseJson<TDDProblem>(response);
            const valid = data
                && typeof data.title === 'string'
                && Array.isArray(data.testCases)
                && data.testCases.length >= 5
                && typeof data.functionSignature === 'string';

            if (!valid) {
                loadHardcodedProblem('Invalid AI TDD payload');
                return;
            }

            const normalizedTests = data.testCases.slice(0, 5).map((test, idx) => ({
                id: test.id || `test-${idx + 1}`,
                description: test.description || `Test ${idx + 1}`,
                input: test.input || 'input',
                expectedOutput: test.expectedOutput || '',
                isHidden: idx >= 2,
            }));

            const signature = data.functionSignature;
            setProblem({
                title: data.title,
                description: data.description || 'Pass all tests by implementing the function.',
                functionSignature: signature,
                language: 'python',
                testCases: normalizedTests,
                solution: data.solution || '',
                source: 'ai',
                isFallback: false,
            });
            setUserCode(`${signature}\n    # Your code here\n    pass`);
        } catch {
            loadHardcodedProblem('AI generation failed');
        } finally {
            setIsGenerating(false);
        }
    }, [useAI, resetState, loadHardcodedProblem]);

    useEffect(() => {
        void generateProblem();
    }, [generateProblem]);

    const runTests = useCallback(async () => {
        if (!problem || !userCode.trim()) return;

        setIsRunning(true);
        const visibleTests = problem.testCases.slice(0, revealedCount);

        let results = evaluateTddTests(userCode, visibleTests);

        if (useAI) {
            try {
                const response = await sendMessageToGemini([{
                    role: 'user',
                    content: `Evaluate this python code against these tests and return ONLY JSON {"results": {"id": true/false}}\nCode:\n${userCode}\nTests:\n${visibleTests.map((t) => `${t.id}: ${t.input} => ${t.expectedOutput}`).join('\n')}`,
                }], 'building');

                const ai = parseJson<{ results: Record<string, boolean> }>(response);
                if (ai && ai.results && Object.keys(ai.results).length > 0) {
                    const merged: Record<string, boolean> = { ...results };
                    Object.entries(ai.results).forEach(([id, value]) => {
                        if (typeof value === 'boolean' && merged[id] !== undefined) merged[id] = value;
                    });
                    results = merged;
                }
            } catch {
                // Keep local fallback evaluation.
            }
        }

        setTestResults((prev) => ({ ...prev, ...results }));

        visibleTests.forEach((t, i) => {
            if (results[t.id] !== undefined) {
                setTimeout(() => {
                    gsap.fromTo(`.test-${t.id}`, { scale: 1, x: 0 }, { scale: results[t.id] ? 1.02 : 0.98, x: results[t.id] ? 0 : 5, duration: 0.15, yoyo: true, repeat: results[t.id] ? 0 : 2 });
                }, i * 120);
            }
        });

        const allVisiblePassed = visibleTests.every((t) => results[t.id] === true);

        if (allVisiblePassed) {
            if (revealedCount >= problem.testCases.length) {
                setAllPassed(true);
                setTimeout(() => onComplete?.(100 + Math.max(0, 30 - (wave - 1) * 10)), 1200);
            } else {
                setWave((prev) => prev + 1);
            }
        }

        setIsRunning(false);
    }, [problem, userCode, revealedCount, useAI, wave, onComplete]);

    if (isGenerating && !problem) {
        return (
            <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center">
                <div className="text-center"><h2 className="text-xl font-bold mb-2">Generating Tests...</h2></div>
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-3">Unable to load challenge</h2>
                    <Button onClick={() => void generateProblem()}>Retry</Button>
                </div>
            </div>
        );
    }

    const passedCount = problem.testCases.slice(0, revealedCount).filter((test) => testResults[test.id] === true).length;

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)] p-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                    <button onClick={onBack} className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)] mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Dojo
                    </button>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">TDD Challenge</h1>
                            <p className="text-[color:var(--color-text-muted)] mt-1">Write code to pass progressively revealed tests</p>
                        </div>
                        <div className="text-right">
                            <ChallengeSourceBadge source={problem.source || (useAI ? 'ai' : 'practice')} isFallback={problem.isFallback} fallbackReason={problem.fallbackReason} />
                            <div className="text-lg font-mono mt-2">Wave {wave}</div>
                            <div className="text-sm text-[color:var(--color-text-muted)]">{passedCount}/{revealedCount} tests passing</div>
                        </div>
                    </div>
                </div>

                <div className="bg-lime-500/10 border border-lime-500/30 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-lime-400 mb-2">{problem.title}</h3>
                    <p className="text-sm">{problem.description}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold mb-3">Your Code</h3>
                        <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-700">
                            <textarea
                                value={userCode}
                                onChange={(e) => setUserCode(e.target.value)}
                                disabled={allPassed}
                                className="w-full h-80 p-4 font-mono text-sm text-neutral-100 bg-transparent resize-none focus:outline-none"
                                spellCheck={false}
                            />
                        </div>

                        <div className="mt-4 flex gap-3">
                            <Button onClick={runTests} disabled={isRunning || allPassed}>{isRunning ? 'Running...' : 'Run Tests'}</Button>
                            <Button variant="ghost" onClick={() => void generateProblem()}>New Problem</Button>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-3">Test Cases</h3>
                        <div className="space-y-3">
                            {problem.testCases.map((test, index) => {
                                const isVisible = index < revealedCount;
                                const result = testResults[test.id];

                                return (
                                    <div
                                        key={test.id}
                                        className={`test-${test.id} p-4 rounded-xl border transition-all ${!isVisible ? 'bg-neutral-800/50 border-neutral-700 opacity-50' : result === true ? 'bg-green-500/10 border-green-500' : result === false ? 'bg-red-500/10 border-red-500' : 'bg-[color:var(--color-bg-secondary)] border-[color:var(--color-border)]'}`}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-lg">{!isVisible ? '??' : result === true ? '?' : result === false ? '?' : '?'}</span>
                                            <span className="font-medium text-sm">{isVisible ? test.description : 'Hidden Test'}</span>
                                        </div>
                                        {isVisible && (
                                            <div className="text-xs font-mono space-y-1 text-[color:var(--color-text-muted)]">
                                                <div>Input: <code className="bg-neutral-800 px-1 rounded">{test.input}</code></div>
                                                <div>Expected: <code className="bg-neutral-800 px-1 rounded">{test.expectedOutput}</code></div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {allPassed && (
                    <div className="mt-6 bg-green-500/10 border-2 border-green-500 rounded-xl p-6 text-center">
                        <h3 className="text-2xl font-bold text-green-400 mb-2">All Tests Passed</h3>
                        <p className="text-[color:var(--color-text-muted)]">Great job finishing in {wave} wave(s).</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TDDChallenge;

