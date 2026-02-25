export function normalizeComplexity(raw: string): string {
    return raw
        .replace(/Â²/g, '^2')
        .replace(/Â³/g, '^3')
        .replace(/âˆšn/g, '√n')
        .replace(/\s+/g, ' ')
        .trim();
}

export function evaluateBigOSelection(selected: string, expected: string): boolean {
    return normalizeComplexity(selected) === normalizeComplexity(expected);
}
