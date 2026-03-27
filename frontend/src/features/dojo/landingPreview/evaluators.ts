import type {
    BigOPreviewAnswer,
    BigOPreviewScenario,
    ELI5PreviewAnswer,
    ELI5PreviewScenario,
    LandingPreviewAnswerMap,
    LandingPreviewMode,
    LandingPreviewScenarioMap,
    LandingPreviewVerdict,
    MentalPreviewAnswer,
    MentalPreviewScenario,
    ParsonsPreviewAnswer,
    ParsonsPreviewScenario,
    SurgeryPreviewAnswer,
    SurgeryPreviewScenario,
} from './types';

function buildVerdict(
    isCorrect: boolean,
    scenario: {
        correctExplanation: string;
        incorrectExplanation: string;
        retryLabel: string;
        nextPreviewLabel: string;
    },
): LandingPreviewVerdict {
    return {
        isCorrect,
        explanation: isCorrect ? scenario.correctExplanation : scenario.incorrectExplanation,
        retryLabel: scenario.retryLabel,
        nextPreviewLabel: scenario.nextPreviewLabel,
    };
}

export function evaluateParsonsPreview(
    scenario: ParsonsPreviewScenario,
    answer: ParsonsPreviewAnswer,
): LandingPreviewVerdict {
    const isCorrect = JSON.stringify(answer.orderedIds) === JSON.stringify(scenario.correctOrder);
    return buildVerdict(isCorrect, scenario);
}

export function evaluateSurgeryPreview(
    scenario: SurgeryPreviewScenario,
    answer: SurgeryPreviewAnswer,
): LandingPreviewVerdict {
    const isCorrect = answer.lineNumber === scenario.bugLine;
    return buildVerdict(isCorrect, scenario);
}

function countMatchedPhrases(text: string, phrases: string[]): number {
    return phrases.reduce((total, phrase) => {
        return total + (text.includes(phrase.toLowerCase()) ? 1 : 0);
    }, 0);
}

function countWords(text: string): number {
    return text.split(/\s+/).filter(Boolean).length;
}

export function evaluateEli5Preview(
    scenario: ELI5PreviewScenario,
    answer: ELI5PreviewAnswer,
): LandingPreviewVerdict {
    const normalized = answer.explanation.trim().toLowerCase();
    const wordCount = countWords(normalized);
    const jargonUsed = scenario.forbiddenWords.some((word) => {
        const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        return pattern.test(answer.explanation);
    });
    const matchedPhrases = countMatchedPhrases(normalized, scenario.requiredPhrases);
    const isCorrect = wordCount >= scenario.minWordCount && matchedPhrases >= 2 && !jargonUsed;

    return buildVerdict(isCorrect, scenario);
}

export function evaluateMentalPreview(
    scenario: MentalPreviewScenario,
    answer: MentalPreviewAnswer,
): LandingPreviewVerdict {
    const isCorrect = answer.selectedOption === scenario.correctOption;
    return buildVerdict(isCorrect, scenario);
}

export function normalizePreviewComplexity(raw: string): string {
    return raw
        .replace(/Â²/g, '^2')
        .replace(/Â³/g, '^3')
        .replace(/âˆšn/g, 'sqrt(n)')
        .replace(/√n/g, 'sqrt(n)')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

export function evaluateBigOPreview(
    scenario: BigOPreviewScenario,
    answer: BigOPreviewAnswer,
): LandingPreviewVerdict {
    const isCorrect = normalizePreviewComplexity(answer.selectedComplexity ?? '')
        === normalizePreviewComplexity(scenario.correctComplexity);
    return buildVerdict(isCorrect, scenario);
}

export function evaluateLandingPreview<M extends LandingPreviewMode>(
    mode: M,
    scenario: LandingPreviewScenarioMap[M],
    answer: LandingPreviewAnswerMap[M],
): LandingPreviewVerdict {
    switch (mode) {
        case 'parsons':
            return evaluateParsonsPreview(
                scenario as LandingPreviewScenarioMap['parsons'],
                answer as LandingPreviewAnswerMap['parsons'],
            );
        case 'surgery':
            return evaluateSurgeryPreview(
                scenario as LandingPreviewScenarioMap['surgery'],
                answer as LandingPreviewAnswerMap['surgery'],
            );
        case 'eli5':
            return evaluateEli5Preview(
                scenario as LandingPreviewScenarioMap['eli5'],
                answer as LandingPreviewAnswerMap['eli5'],
            );
        case 'mental':
            return evaluateMentalPreview(
                scenario as LandingPreviewScenarioMap['mental'],
                answer as LandingPreviewAnswerMap['mental'],
            );
        case 'bigo':
            return evaluateBigOPreview(
                scenario as LandingPreviewScenarioMap['bigo'],
                answer as LandingPreviewAnswerMap['bigo'],
            );
    }
}
