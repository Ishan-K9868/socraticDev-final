import { useState, useCallback, useEffect } from 'react';
import { gsap } from 'gsap';
import { sendMessageToGemini } from '../../services/gemini';
import Button from '../../ui/Button';
import { getRandomTDDExample } from './examples/tddExamples';

interface TestCase {
    id: string;
    description: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
    passed: boolean | null;
}

interface TDDProblem {
    title: string;
    description: string;
    functionSignature: string;
    testCases: TestCase[];
    language: string;
    solution: string;
}

interface TDDChallengeProps {
    onComplete?: (score: number) => void;
    onBack?: () => void;
    useAI?: boolean;
}

function TDDChallenge({ onComplete, onBack, useAI = false }: TDDChallengeProps) {
    const [problem, setProblem] = useState<TDDProblem | null>(null);
    const [userCode, setUserCode] = useState('');
    const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});
    const [isGenerating, setIsGenerating] = useState(true);
    const [isRunning, setIsRunning] = useState(false);
    const [wave, setWave] = useState(1);
    const [visibleTests, setVisibleTests] = useState(2);
    const [allPassed, setAllPassed] = useState(false);

    const loadHardcodedProblem = useCallback(() => {
        const example = getRandomTDDExample();
        const testCases: TestCase[] = example.testCases.map((tc, idx) => ({
            id: `test-${idx}`,
            description: tc.description,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: idx >= 2,
            passed: null
        }));
        setProblem({
            title: example.title,
            description: example.description,
            functionSignature: example.functionSignature,
            testCases,
            language: example.language,
            solution: example.solution
        });
        setIsGenerating(false);
    }, []);

    const generateProblem = useCallback(async () => {
        setIsGenerating(true);
        setUserCode('');
        setTestResults({});
        setWave(1);
        setVisibleTests(2);
        setAllPassed(false);

        try {
            const response = await sendMessageToGemini([{
                role: 'user',
                content: `Generate a Test-Driven Development challenge.

Create a coding problem with 5 test cases that progressively reveal.
The problem should be solvable in 10-20 lines of code.

Topics: string manipulation, array operations, math operations, or simple algorithms.

Return ONLY valid JSON:
{
  "title": "Problem Title",
  "description": "What the function should do",
  "functionSignature": "def function_name(param):",
  "language": "python",
  "testCases": [
    {"id": "1", "description": "basic case", "input": "example input", "expectedOutput": "expected", "isHidden": false},
    {"id": "2", "description": "another case", "input": "input2", "expectedOutput": "output2", "isHidden": false},
    {"id": "3", "description": "edge case", "input": "edge", "expectedOutput": "output3", "isHidden": true},
    {"id": "4", "description": "empty input", "input": "empty", "expectedOutput": "output4", "isHidden": true},
    {"id": "5", "description": "large input", "input": "large", "expectedOutput": "output5", "isHidden": true}
  ],
  "solution": "the complete solution code"
}`
            }], 'building');

            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                data.testCases = data.testCases.map((t: TestCase) => ({ ...t, passed: null }));
                setProblem(data);
                setUserCode(data.functionSignature + '\n    # Your code here\n    pass');
            }
        } catch (error) {
            console.error('Failed to generate problem:', error);
        } finally {
            setIsGenerating(false);
        }
    }, []);

    useEffect(() => {
        if (useAI) {
            generateProblem();
        } else {
            loadHardcodedProblem();
        }
    }, [useAI, generateProblem, loadHardcodedProblem]);

    const runTests = useCallback(async () => {
        if (!problem || !userCode.trim()) return;

        setIsRunning(true);

        try {
            // Ask AI to evaluate the code against test cases
            const response = await sendMessageToGemini([{
                role: 'user',
                content: `Evaluate this code against the test cases.

Function to test:
\`\`\`${problem.language}
${userCode}
\`\`\`

Test cases:
${problem.testCases.slice(0, visibleTests + (wave > 1 ? 1 : 0)).map(t =>
                    `- ${t.description}: input="${t.input}", expected="${t.expectedOutput}"`
                ).join('\n')}

For each test case, determine if the code would produce the correct output.
Consider edge cases and potential runtime errors.

Return ONLY valid JSON:
{
  "results": {
    ${problem.testCases.slice(0, visibleTests + (wave > 1 ? 1 : 0)).map(t =>
                    `"${t.id}": true/false`
                ).join(',\n    ')}
  },
  "feedback": "Brief feedback on the code"
}`
            }], 'building');

            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                setTestResults(data.results);

                // Animate results
                problem.testCases.forEach((t, i) => {
                    if (data.results[t.id] !== undefined) {
                        setTimeout(() => {
                            gsap.fromTo(`.test-${t.id}`,
                                { scale: 1, x: 0 },
                                {
                                    scale: data.results[t.id] ? 1.02 : 0.98,
                                    x: data.results[t.id] ? 0 : 5,
                                    duration: 0.2,
                                    yoyo: true,
                                    repeat: data.results[t.id] ? 0 : 2
                                }
                            );
                        }, i * 200);
                    }
                });

                // Check if all visible tests passed
                const visiblePassed = problem.testCases
                    .slice(0, visibleTests + (wave > 1 ? 1 : 0))
                    .every(t => data.results[t.id]);

                if (visiblePassed) {
                    if (visibleTests + (wave > 1 ? 1 : 0) >= problem.testCases.length) {
                        // All tests passed!
                        setAllPassed(true);
                        setTimeout(() => {
                            const score = 100 + (wave === 1 ? 50 : 0); // Bonus for first try
                            onComplete?.(score);
                        }, 2000);
                    } else {
                        // Reveal more tests
                        setWave(prev => prev + 1);
                        setVisibleTests(prev => Math.min(prev + 1, problem.testCases.length));
                    }
                }
            }
        } catch (error) {
            console.error('Failed to run tests:', error);
        } finally {
            setIsRunning(false);
        }
    }, [problem, userCode, visibleTests, wave, onComplete]);

    const getStatusIcon = (testId: string) => {
        const result = testResults[testId];
        if (result === null || result === undefined) return '⬜';
        return result ? '✅' : '❌';
    };

    if (isGenerating) {
        return (
            <div className="min-h-screen bg-[color:var(--color-bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-pulse">🧪</div>
                    <h2 className="text-xl font-bold mb-2">Generating Tests...</h2>
                    <p className="text-[color:var(--color-text-muted)]">
                        Creating a TDD challenge
                    </p>
                </div>
            </div>
        );
    }

    if (!problem) return null;

    const passedCount = Object.values(testResults).filter(Boolean).length;
    const totalVisible = visibleTests + (wave > 1 ? wave - 1 : 0);

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)] p-6">
            <div className="max-w-5xl mx-auto">
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
                                <span className="text-3xl">🧪</span>
                                TDD Challenge
                            </h1>
                            <p className="text-[color:var(--color-text-muted)] mt-1">
                                Write code to pass the tests - more tests reveal as you progress!
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-mono">Wave {wave}</div>
                            <div className="text-sm text-[color:var(--color-text-muted)]">
                                {passedCount}/{Math.min(totalVisible, problem.testCases.length)} tests passing
                            </div>
                        </div>
                    </div>
                </div>

                {/* Problem Description */}
                <div className="bg-lime-500/10 border border-lime-500/30 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-lime-400 mb-2">{problem.title}</h3>
                    <p className="text-sm">{problem.description}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Code Editor */}
                    <div>
                        <h3 className="font-semibold mb-3">📝 Your Code</h3>
                        <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-700">
                            <div className="px-4 py-2 bg-neutral-800 border-b border-neutral-700 text-sm text-neutral-400">
                                {problem.language}
                            </div>
                            <textarea
                                value={userCode}
                                onChange={(e) => setUserCode(e.target.value)}
                                disabled={allPassed}
                                className="w-full h-80 p-4 font-mono text-sm text-neutral-100 bg-transparent resize-none focus:outline-none"
                                spellCheck={false}
                            />
                        </div>

                        <div className="mt-4 flex gap-3">
                            <Button
                                onClick={runTests}
                                disabled={isRunning || allPassed}
                            >
                                {isRunning ? '🔄 Running...' : '▶️ Run Tests'}
                            </Button>
                            <Button variant="ghost" onClick={generateProblem}>
                                New Problem
                            </Button>
                        </div>
                    </div>

                    {/* Test Cases */}
                    <div>
                        <h3 className="font-semibold mb-3">🧪 Test Cases</h3>
                        <div className="space-y-3">
                            {problem.testCases.map((test, index) => {
                                const isVisible = index < totalVisible;
                                const result = testResults[test.id];

                                if (!isVisible && !test.isHidden) return null;

                                return (
                                    <div
                                        key={test.id}
                                        className={`
                                            test-${test.id}
                                            p-4 rounded-xl border transition-all
                                            ${!isVisible
                                                ? 'bg-neutral-800/50 border-neutral-700 opacity-50'
                                                : result === true
                                                    ? 'bg-green-500/10 border-green-500'
                                                    : result === false
                                                        ? 'bg-red-500/10 border-red-500'
                                                        : 'bg-[color:var(--color-bg-secondary)] border-[color:var(--color-border)]'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-lg">{isVisible ? getStatusIcon(test.id) : '🔒'}</span>
                                            <span className="font-medium text-sm">
                                                {isVisible ? test.description : 'Hidden Test'}
                                            </span>
                                            {test.isHidden && isVisible && (
                                                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                                                    Revealed!
                                                </span>
                                            )}
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

                            {totalVisible < problem.testCases.length && (
                                <div className="text-center text-sm text-[color:var(--color-text-muted)] py-2">
                                    + {problem.testCases.length - totalVisible} hidden tests
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                {allPassed && (
                    <div className="mt-6 bg-green-500/10 border-2 border-green-500 rounded-xl p-6 text-center">
                        <div className="text-5xl mb-3">🎉</div>
                        <h3 className="text-2xl font-bold text-green-400 mb-2">All Tests Passed!</h3>
                        <p className="text-[color:var(--color-text-muted)]">
                            Great job! You completed the TDD challenge in {wave} wave(s)!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TDDChallenge;
