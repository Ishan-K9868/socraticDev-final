import { sendMessageToGemini } from '../../services/gemini';
import { ELI5Challenge } from './types';

export interface Eli5EvaluationResult {
    relevanceScore: number;
    keyPointCoverageScore: number;
    simplicityScore: number;
    jargonPenalty: number;
    finalScore: number;
    feedback: string;
    coveredKeyPoints: string[];
    missingKeyPoints: string[];
    detectedJargon: string[];
    isOffTopic: boolean;
    usedFallback: boolean;
}

export const JARGON_WORDS = [
    'algorithm', 'recursion', 'recursive', 'iterate', 'iteration', 'loop',
    'function', 'method', 'parameter', 'argument', 'variable', 'constant',
    'array', 'list', 'dictionary', 'hash', 'object', 'class', 'instance',
    'pointer', 'reference', 'memory', 'heap', 'stack', 'allocation',
    'async', 'asynchronous', 'synchronous', 'callback', 'promise', 'await',
    'boolean', 'integer', 'float', 'string', 'type', 'interface',
    'compile', 'runtime', 'syntax', 'semantic', 'lexical', 'scope',
    'encapsulation', 'inheritance', 'polymorphism', 'abstraction',
    'api', 'endpoint', 'request', 'response', 'protocol', 'http',
    'database', 'query', 'schema', 'table', 'index', 'key',
    'binary', 'decimal', 'hexadecimal', 'bitwise', 'operator',
    'exception', 'error', 'throw', 'catch', 'try', 'finally',
    'thread', 'process', 'concurrent', 'parallel', 'mutex', 'lock'
];

const STOPWORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'do', 'does', 'for',
    'from', 'get', 'go', 'has', 'have', 'i', 'if', 'in', 'into', 'is', 'it', 'its',
    'like', 'many', 'of', 'on', 'or', 'so', 'some', 'than', 'that', 'the', 'their',
    'them', 'then', 'there', 'these', 'they', 'this', 'to', 'up', 'use', 'uses',
    'using', 'was', 'we', 'what', 'when', 'where', 'which', 'who', 'why', 'with',
    'you', 'your'
]);

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function extractJsonObject(text: string): Record<string, unknown> {
    const fenced = text.match(/```json\s*([\s\S]*?)```/i);
    const candidate = fenced ? fenced[1] : text;
    const trimmed = candidate.trim();

    try {
        return JSON.parse(trimmed) as Record<string, unknown>;
    } catch {
        const start = trimmed.indexOf('{');
        const end = trimmed.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
        }
        throw new Error('No JSON object found in ELI5 evaluation response');
    }
}

function asStringArray(value: unknown): string[] {
    return Array.isArray(value)
        ? value.map((item) => String(item).trim()).filter(Boolean)
        : [];
}

export function detectJargonWords(explanation: string, forbiddenWords: string[]): string[] {
    const allJargon = [...JARGON_WORDS, ...forbiddenWords.map((word) => word.toLowerCase())];
    const unique = new Set<string>();

    allJargon.forEach((jargon) => {
        const escaped = jargon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'i');
        if (regex.test(explanation)) {
            unique.add(jargon);
        }
    });

    return Array.from(unique);
}

export function calculateELI5ReadabilityScore(explanation: string): number {
    if (explanation.trim().length < 10) return 0;

    const sentences = explanation.split(/[.!?]+/).filter((sentence) => sentence.trim().length > 0);
    const words = explanation.split(/\s+/).filter((word) => word.length > 0);
    const syllables = words.reduce((count, word) => {
        const vowelGroups = word.toLowerCase().match(/[aeiouy]+/g) || [];
        return count + Math.max(1, vowelGroups.length);
    }, 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    return clamp(fleschScore, 0, 100);
}

export function getELI5SimplicityLabel(score: number): { label: string; color: string } {
    if (score >= 80) return { label: 'Very simple wording', color: 'text-green-400' };
    if (score >= 60) return { label: 'Mostly simple wording', color: 'text-yellow-400' };
    if (score >= 40) return { label: 'A bit complex', color: 'text-orange-400' };
    return { label: 'Needs simpler wording', color: 'text-red-400' };
}

function extractMeaningfulTokens(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .map((word) => word.trim())
        .filter((word) => word.length >= 3 && !STOPWORDS.has(word));
}

function buildFallbackEvaluation(
    challenge: ELI5Challenge,
    explanation: string,
): Eli5EvaluationResult {
    const detectedJargon = detectJargonWords(explanation, challenge.forbiddenWords);
    const readabilityScore = calculateELI5ReadabilityScore(explanation);
    const explanationTokens = new Set(extractMeaningfulTokens(explanation));

    const coveredKeyPoints = challenge.keyPoints.filter((point) => {
        const pointTokens = extractMeaningfulTokens(point);
        if (pointTokens.length === 0) return false;
        const matches = pointTokens.filter((token) => explanationTokens.has(token));
        return matches.length >= Math.min(2, pointTokens.length);
    });

    const missingKeyPoints = challenge.keyPoints.filter((point) => !coveredKeyPoints.includes(point));
    const coverageRatio = challenge.keyPoints.length > 0 ? coveredKeyPoints.length / challenge.keyPoints.length : 0;
    const hasAnalogy = /(like|as if|imagine|recipe|toy|toys|game|box|friend|name|hello)/i.test(explanation);
    const codeSpecificWords = extractMeaningfulTokens(`${challenge.title} ${challenge.description} ${challenge.code}`);
    const explanationSpecificMatches = codeSpecificWords.filter((token) => explanationTokens.has(token)).length;
    const relevanceScore = clamp(Math.round(coverageRatio * 28) + Math.min(12, explanationSpecificMatches * 2), 0, 40);
    const keyPointCoverageScore = clamp(Math.round(coverageRatio * 30), 0, 30);
    const simplicityScore = clamp(Math.round(readabilityScore / 5) + (hasAnalogy ? 2 : 0), 0, 20);
    const jargonPenalty = clamp(detectedJargon.length * 6, 0, 20);
    const isOffTopic = coverageRatio === 0 || (explanation.trim().split(/\s+/).length < 6 && explanationSpecificMatches === 0);

    const rawScore = relevanceScore + keyPointCoverageScore + simplicityScore - jargonPenalty;
    const scaledScore = Math.round((clamp(rawScore, 0, 90) / 90) * challenge.points);
    const finalScore = isOffTopic ? Math.min(10, scaledScore) : clamp(scaledScore, 0, challenge.points);

    const feedback = isOffTopic
        ? 'This answer stays simple, but it does not really explain what the code is doing yet. Mention the main idea of the code and at least one of the required teaching points.'
        : missingKeyPoints.length > 0
            ? `You explained part of it, but you still missed: ${missingKeyPoints.slice(0, 2).join('; ')}.`
            : 'Nice job. This explanation is simple and covers the main idea.';

    return {
        relevanceScore,
        keyPointCoverageScore,
        simplicityScore,
        jargonPenalty,
        finalScore,
        feedback,
        coveredKeyPoints,
        missingKeyPoints,
        detectedJargon,
        isOffTopic,
        usedFallback: true,
    };
}

function normalizeEvaluationResult(
    challenge: ELI5Challenge,
    explanation: string,
    payload: Record<string, unknown>,
): Eli5EvaluationResult {
    const detectedJargon = asStringArray(payload.detectedJargon);
    const coveredKeyPoints = asStringArray(payload.coveredKeyPoints);
    const missingKeyPoints = asStringArray(payload.missingKeyPoints);
    const relevanceScore = clamp(Number(payload.relevanceScore) || 0, 0, 40);
    const keyPointCoverageScore = clamp(Number(payload.keyPointCoverageScore) || 0, 0, 30);
    const simplicityScore = clamp(Number(payload.simplicityScore) || 0, 0, 20);
    const jargonPenalty = clamp(Number(payload.jargonPenalty) || 0, 0, 20);
    const isOffTopic = Boolean(payload.isOffTopic);
    const rawScore = relevanceScore + keyPointCoverageScore + simplicityScore - jargonPenalty;
    const scaledScore = Math.round((clamp(rawScore, 0, 90) / 90) * challenge.points);
    const finalScore = isOffTopic || relevanceScore < 12
        ? Math.min(10, scaledScore)
        : clamp(scaledScore, 0, challenge.points);

    return {
        relevanceScore,
        keyPointCoverageScore,
        simplicityScore,
        jargonPenalty,
        finalScore,
        feedback: typeof payload.feedback === 'string' && payload.feedback.trim().length > 0
            ? payload.feedback.trim()
            : buildFallbackEvaluation(challenge, explanation).feedback,
        coveredKeyPoints,
        missingKeyPoints,
        detectedJargon,
        isOffTopic,
        usedFallback: false,
    };
}

function buildEvaluationPrompt(challenge: ELI5Challenge, explanation: string): string {
    return `You are grading an ELI5 coding explanation.

Evaluate whether the user's answer actually explains the code, not just whether it sounds simple.
Be strict about nonsense, off-topic, or empty-content answers.

Challenge context:
- Title: ${challenge.title}
- Description: ${challenge.description}
- Topic: ${challenge.topic}
- Language: ${challenge.language}
- Target audience: ${challenge.targetGradeLevel}-year-old child
- Problem statement: Explain what this code does in very simple words.
- Required teaching points:
${challenge.keyPoints.map((point, index) => `  ${index + 1}. ${point}`).join('\n')}
- Forbidden jargon:
${challenge.forbiddenWords.map((word) => `  - ${word}`).join('\n') || '  - none'}

Code:
\
${challenge.code}
\

User explanation:
"""
${explanation}
"""

Scoring rubric:
- relevanceScore: 0-40
  - 0-10 if the answer is nonsense, vague, or off-topic
  - 11-25 if it partially explains the code
  - 26-40 if it clearly explains what the code does
- keyPointCoverageScore: 0-30 based on how many required teaching points are actually covered
- simplicityScore: 0-20 based on simple child-friendly wording
- jargonPenalty: 0-20 based on forbidden or technical jargon usage
- isOffTopic: true if the answer does not meaningfully explain this code

Rules:
- If the answer is off-topic, nonsense, or barely explains the code, set isOffTopic to true.
- Do not reward empty simplicity. A simple but irrelevant answer should still score very low.
- coveredKeyPoints and missingKeyPoints must use the original key point text from the list above.
- detectedJargon should list only jargon actually used by the user.
- feedback should be 1-3 sentences, specific and helpful.

Return ONLY valid JSON with this exact shape:
{
  "relevanceScore": number,
  "keyPointCoverageScore": number,
  "simplicityScore": number,
  "jargonPenalty": number,
  "isOffTopic": boolean,
  "coveredKeyPoints": string[],
  "missingKeyPoints": string[],
  "detectedJargon": string[],
  "feedback": string
}`;
}

export async function evaluateELI5Explanation(
    challenge: ELI5Challenge,
    explanation: string,
): Promise<Eli5EvaluationResult> {
    try {
        const response = await sendMessageToGemini([
            { role: 'user', content: buildEvaluationPrompt(challenge, explanation) }
        ], 'building');
        const payload = extractJsonObject(response);
        return normalizeEvaluationResult(challenge, explanation, payload);
    } catch {
        return buildFallbackEvaluation(challenge, explanation);
    }
}
