import { useCallback, useState } from 'react';
import { sendMessageToGemini } from '../../services/gemini';
import {
    ParsonsChallenge,
    SurgeryChallenge,
    ELI5Challenge,
    FadedChallenge,
    MentalChallenge,
    CodeLine,
    Bug,
    Blank,
    TraceStep,
    ChallengeSource,
} from './types';

const generateId = () => crypto.randomUUID().slice(0, 8);

const CHALLENGE_PROMPTS = {
    parsons: (topic: string, language: string) => `
Generate a Parsons Problem for teaching "${topic}" in ${language}.
Return ONLY valid JSON:
{
  "title": "Challenge title",
  "description": "One sentence problem description",
  "solution": ["line1", "line2", "line3"],
  "distractors": ["wrong line 1", "wrong line 2"],
  "hints": ["Hint 1", "Hint 2"]
}`,
    surgery: (topic: string, language: string) => `
Generate a Code Surgery challenge for "${topic}" in ${language}.
Return code as arrays of lines.
Return ONLY valid JSON:
{
  "title": "Challenge title",
  "description": "Function purpose",
  "buggyCodeLines": ["line1", "line2"],
  "correctCodeLines": ["line1", "line2"],
  "bugs": [{"lineNumber": 3, "bugType": "logic", "description": "desc", "hint": "hint", "fix": "fix"}]
}`,
    eli5: (topic: string, language: string) => `
Generate an ELI5 challenge for "${topic}" in ${language}.
Return ONLY valid JSON:
{
  "title": "Explain: ${topic}",
  "description": "Explain this code like you're talking to a 5-year-old",
  "code": "the code snippet",
  "keyPoints": ["point 1", "point 2"],
  "forbiddenWords": ["recursion", "algorithm"]
}`,
    faded: (topic: string, language: string) => `
Generate a Fill-in-the-Blanks challenge for "${topic}" in ${language}.
Return ONLY valid JSON:
{
  "title": "Complete the code",
  "description": "Fill in blanks",
  "fullCode": "complete code",
  "template": "code with ___",
  "blanks": [{"id": "1", "position": 10, "answer": "x", "hint": "variable", "length": 1}]
}`,
    mental: (topic: string, language: string) => `
Generate a Mental Compiler challenge for "${topic}" in ${language}.
Return ONLY valid JSON:
{
  "title": "What's the output?",
  "description": "Trace through this code mentally",
  "code": "the code",
  "expectedOutput": "the correct output",
  "wrongOptions": ["wrong1", "wrong2", "wrong3"],
  "traceSteps": [{"line": 1, "variables": {"x": "0"}, "explanation": "Initialize x"}]
}`,
};

export interface AIChallengeResult<T> {
    challenge: T | null;
    usedFallback: boolean;
    fallbackReason?: string;
}

function extractJsonObject(response: string): Record<string, unknown> {
    const blockMatch = response.match(/```json\s*([\s\S]*?)```/i) || response.match(/```\s*([\s\S]*?)```/);
    const raw = (blockMatch?.[1] || response).trim();
    const objectMatch = raw.match(/\{[\s\S]*\}/);
    if (!objectMatch) {
        throw new Error('No JSON object found in AI response');
    }
    return JSON.parse(objectMatch[0]) as Record<string, unknown>;
}

function toStringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function ensureString(value: unknown, fallback: string): string {
    return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function clampPositive(value: unknown, fallback: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeBugType(value: unknown): Bug['bugType'] {
    const normalized = typeof value === 'string' ? value.toLowerCase().replace(/\s+/g, '-') : '';
    const allowed: Bug['bugType'][] = [
        'logic',
        'syntax',
        'security',
        'performance',
        'edge-case',
        'off-by-one',
        'missing-check',
        'wrong-operator',
    ];
    return allowed.includes(normalized as Bug['bugType']) ? (normalized as Bug['bugType']) : 'logic';
}

function buildChallengeMeta(source: ChallengeSource) {
    return {
        source,
        isFallback: false,
        fallbackReason: undefined,
    };
}

export function useChallengeAI() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateParsonsChallenge = useCallback(async (
        topic: string,
        language = 'python'
    ): Promise<AIChallengeResult<ParsonsChallenge>> => {
        setIsGenerating(true);
        setError(null);
        try {
            const response = await sendMessageToGemini([{ role: 'user', content: CHALLENGE_PROMPTS.parsons(topic, language) }], 'building');
            const data = extractJsonObject(response);
            const solution = toStringArray(data.solution);
            const distractors = toStringArray(data.distractors);
            if (solution.length < 2) throw new Error('Invalid solution lines');

            const solutionLines: CodeLine[] = solution.map((content, idx) => ({
                id: generateId(),
                content,
                isDistractor: false,
                correctPosition: idx,
            }));
            const distractorLines: CodeLine[] = distractors.map((content) => ({
                id: generateId(),
                content,
                isDistractor: true,
            }));

            return {
                challenge: {
                    id: generateId(),
                    type: 'parsons',
                    title: ensureString(data.title, 'Parsons Problem'),
                    description: ensureString(data.description, 'Reorder the code to create a valid solution.'),
                    difficulty: 'intermediate',
                    topic,
                    language,
                    points: 100,
                    lines: [...solutionLines, ...distractorLines].sort(() => Math.random() - 0.5),
                    solution,
                    hints: toStringArray(data.hints),
                    ...buildChallengeMeta('ai'),
                },
                usedFallback: false,
            };
        } catch (err) {
            const reason = err instanceof Error ? err.message : 'AI generation failed';
            setError(reason);
            return { challenge: null, usedFallback: true, fallbackReason: reason };
        } finally {
            setIsGenerating(false);
        }
    }, []);

    const generateSurgeryChallenge = useCallback(async (
        topic: string,
        language = 'javascript'
    ): Promise<AIChallengeResult<SurgeryChallenge>> => {
        setIsGenerating(true);
        setError(null);
        try {
            const response = await sendMessageToGemini([{ role: 'user', content: CHALLENGE_PROMPTS.surgery(topic, language) }], 'building');
            const data = extractJsonObject(response);

            const buggyCode = Array.isArray(data.buggyCodeLines) ? toStringArray(data.buggyCodeLines).join('\n') : ensureString(data.buggyCode, '');
            const correctCode = Array.isArray(data.correctCodeLines) ? toStringArray(data.correctCodeLines).join('\n') : ensureString(data.correctCode, '');
            const rawBugs = Array.isArray(data.bugs) ? data.bugs : [];
            const bugs: Bug[] = rawBugs.map((entry, idx) => {
                const bug = entry as Record<string, unknown>;
                return {
                    lineNumber: clampPositive(bug.lineNumber, idx + 1),
                    bugType: normalizeBugType(bug.bugType),
                    description: ensureString(bug.description, 'Bug detected'),
                    hint: ensureString(bug.hint, 'Review this line carefully'),
                    fix: ensureString(bug.fix, 'Apply a logic fix'),
                };
            });
            if (!buggyCode || !correctCode || bugs.length === 0) throw new Error('Incomplete surgery payload');

            return {
                challenge: {
                    id: generateId(),
                    type: 'surgery',
                    title: ensureString(data.title, 'Code Surgery'),
                    description: ensureString(data.description, 'Find and fix bugs in this code.'),
                    difficulty: 'intermediate',
                    topic,
                    language,
                    points: 150,
                    buggyCode,
                    bugs,
                    correctCode,
                    ...buildChallengeMeta('ai'),
                },
                usedFallback: false,
            };
        } catch (err) {
            const reason = err instanceof Error ? err.message : 'AI generation failed';
            setError(reason);
            return { challenge: null, usedFallback: true, fallbackReason: reason };
        } finally {
            setIsGenerating(false);
        }
    }, []);

    const generateELI5Challenge = useCallback(async (
        topic: string,
        language = 'python'
    ): Promise<AIChallengeResult<ELI5Challenge>> => {
        setIsGenerating(true);
        setError(null);
        try {
            const response = await sendMessageToGemini([{ role: 'user', content: CHALLENGE_PROMPTS.eli5(topic, language) }], 'building');
            const data = extractJsonObject(response);
            const keyPoints = toStringArray(data.keyPoints);
            const forbiddenWords = toStringArray(data.forbiddenWords);
            if (!ensureString(data.code, '') || keyPoints.length === 0) throw new Error('Invalid ELI5 payload');

            return {
                challenge: {
                    id: generateId(),
                    type: 'eli5',
                    title: ensureString(data.title, `Explain: ${topic}`),
                    description: ensureString(data.description, 'Explain this code in very simple words.'),
                    difficulty: 'beginner',
                    topic,
                    language,
                    points: 75,
                    code: ensureString(data.code, ''),
                    keyPoints,
                    forbiddenWords,
                    targetGradeLevel: 5,
                    ...buildChallengeMeta('ai'),
                },
                usedFallback: false,
            };
        } catch (err) {
            const reason = err instanceof Error ? err.message : 'AI generation failed';
            setError(reason);
            return { challenge: null, usedFallback: true, fallbackReason: reason };
        } finally {
            setIsGenerating(false);
        }
    }, []);

    const generateFadedChallenge = useCallback(async (
        topic: string,
        language = 'python'
    ): Promise<AIChallengeResult<FadedChallenge>> => {
        setIsGenerating(true);
        setError(null);
        try {
            const response = await sendMessageToGemini([{ role: 'user', content: CHALLENGE_PROMPTS.faded(topic, language) }], 'building');
            const data = extractJsonObject(response);
            const rawBlanks = Array.isArray(data.blanks) ? data.blanks : [];
            const blanks: Blank[] = rawBlanks.map((entry, idx) => {
                const blank = entry as Record<string, unknown>;
                const answer = ensureString(blank.answer, '');
                return {
                    id: ensureString(blank.id, `blank-${idx + 1}`),
                    position: clampPositive(blank.position, idx + 1),
                    answer,
                    hint: ensureString(blank.hint, 'Fill this blank'),
                    length: clampPositive(blank.length, answer.length || 1),
                };
            });
            if (!ensureString(data.template, '') || blanks.length === 0) throw new Error('Invalid faded payload');

            return {
                challenge: {
                    id: generateId(),
                    type: 'faded',
                    title: ensureString(data.title, 'Fill in the Blanks'),
                    description: ensureString(data.description, 'Complete the missing code parts.'),
                    difficulty: 'beginner',
                    topic,
                    language,
                    points: 50,
                    template: ensureString(data.template, ''),
                    blanks,
                    fullCode: ensureString(data.fullCode, ''),
                    ...buildChallengeMeta('ai'),
                },
                usedFallback: false,
            };
        } catch (err) {
            const reason = err instanceof Error ? err.message : 'AI generation failed';
            setError(reason);
            return { challenge: null, usedFallback: true, fallbackReason: reason };
        } finally {
            setIsGenerating(false);
        }
    }, []);

    const generateMentalChallenge = useCallback(async (
        topic: string,
        language = 'python'
    ): Promise<AIChallengeResult<MentalChallenge>> => {
        setIsGenerating(true);
        setError(null);
        try {
            const response = await sendMessageToGemini([{ role: 'user', content: CHALLENGE_PROMPTS.mental(topic, language) }], 'building');
            const data = extractJsonObject(response);
            const traceSteps: TraceStep[] = (Array.isArray(data.traceSteps) ? data.traceSteps : []).map((entry, idx) => {
                const step = entry as Record<string, unknown>;
                return {
                    line: clampPositive(step.line, idx + 1),
                    variables: typeof step.variables === 'object' && step.variables ? (step.variables as Record<string, string>) : {},
                    output: typeof step.output === 'string' ? step.output : undefined,
                    explanation: ensureString(step.explanation, 'Trace this step'),
                };
            });
            const wrongOptions = toStringArray(data.wrongOptions);
            if (!ensureString(data.code, '') || !ensureString(data.expectedOutput, '')) throw new Error('Invalid mental payload');

            return {
                challenge: {
                    id: generateId(),
                    type: 'mental',
                    title: ensureString(data.title, "What's the output?"),
                    description: ensureString(data.description, 'Predict the output by tracing the code.'),
                    difficulty: 'intermediate',
                    topic,
                    language,
                    points: 100,
                    code: ensureString(data.code, ''),
                    expectedOutput: ensureString(data.expectedOutput, ''),
                    wrongOptions,
                    traceSteps,
                    ...buildChallengeMeta('ai'),
                },
                usedFallback: false,
            };
        } catch (err) {
            const reason = err instanceof Error ? err.message : 'AI generation failed';
            setError(reason);
            return { challenge: null, usedFallback: true, fallbackReason: reason };
        } finally {
            setIsGenerating(false);
        }
    }, []);

    return {
        isGenerating,
        error,
        generateParsonsChallenge,
        generateSurgeryChallenge,
        generateELI5Challenge,
        generateFadedChallenge,
        generateMentalChallenge,
    };
}
