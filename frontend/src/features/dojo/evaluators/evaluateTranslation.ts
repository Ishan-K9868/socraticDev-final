export interface TranslationEvaluation {
    correct: boolean;
    message: string;
}

function normalizeCode(code: string): string {
    return code
        .replace(/\/\/.*$/gm, '')
        .replace(/#.*$/gm, '')
        .replace(/\s+/g, '')
        .toLowerCase();
}

export function evaluateTranslation(userSolution: string, expectedSolution: string): TranslationEvaluation {
    const user = normalizeCode(userSolution);
    const expected = normalizeCode(expectedSolution);

    if (!user) {
        return { correct: false, message: 'Add a translation before submitting.' };
    }

    if (user === expected) {
        return { correct: true, message: 'Correct translation. Logic and structure match expected output.' };
    }

    // Heuristic equivalence for small syntactic variants.
    const overlap = expected.split(/[^a-z0-9_]+/).filter(Boolean);
    const matched = overlap.filter(token => user.includes(token)).length;
    const ratio = overlap.length > 0 ? matched / overlap.length : 0;

    if (ratio >= 0.85) {
        return { correct: true, message: 'Looks semantically equivalent despite syntax differences.' };
    }

    return { correct: false, message: 'Not equivalent yet. Compare control flow, return values, and core operations.' };
}
