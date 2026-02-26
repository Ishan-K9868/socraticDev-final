import { CardGenerationRequest, CardGenerationResult, GeneratedCardCandidate } from './types';

function clampCards(cards: GeneratedCardCandidate[], count: number): GeneratedCardCandidate[] {
    return cards.slice(0, Math.max(1, Math.min(5, count)));
}

function normalizeText(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
}

function sentenceChunks(content: string): string[] {
    return content
        .split(/[\n.!?]+/)
        .map((line) => normalizeText(line))
        .filter((line) => line.length >= 24);
}

function buildBasicCard(questionSeed: string, answerSeed: string, tags: string[] = []): GeneratedCardCandidate {
    return {
        type: 'basic',
        front: `Explain this concept: ${questionSeed}`,
        back: answerSeed,
        tags,
        confidence: 0.45,
        reason: 'Template extraction from source content',
    };
}

export function generateFallbackFlashcards(request: CardGenerationRequest): CardGenerationResult {
    const targetCount = request.count ?? 3;
    const chunks = sentenceChunks(request.content);
    const cards: GeneratedCardCandidate[] = [];
    const sourceTag = request.source === 'chat' ? 'chat' : 'dojo';
    const languageTag = request.languageHint ? [request.languageHint.toLowerCase()] : [];

    if (chunks.length >= 2) {
        for (let i = 0; i < chunks.length - 1 && cards.length < targetCount; i += 1) {
            cards.push(buildBasicCard(chunks[i], chunks[i + 1], [sourceTag, ...languageTag]));
        }
    }

    if (!cards.length && request.topic) {
        cards.push({
            type: 'basic',
            front: `What is important about ${request.topic}?`,
            back: normalizeText(request.content).slice(0, 420) || `Review the key idea behind ${request.topic}.`,
            tags: [sourceTag, ...languageTag],
            confidence: 0.35,
            reason: 'Topic fallback',
        });
    }

    if (!cards.length) {
        cards.push({
            type: 'basic',
            front: 'What did you just learn from this step?',
            back: normalizeText(request.content).slice(0, 420) || 'Summarize the key concept in your own words.',
            tags: [sourceTag, ...languageTag],
            confidence: 0.3,
            reason: 'Generic fallback',
        });
    }

    return {
        cards: clampCards(cards, targetCount),
        engine: 'fallback',
        fallbackReason: 'Gemini generation unavailable or invalid payload',
    };
}
