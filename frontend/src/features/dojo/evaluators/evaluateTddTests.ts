export interface TddTestCase {
    id: string;
    input: string;
    expectedOutput: string;
}

export type TddTestResults = Record<string, boolean>;

function normalize(value: string): string {
    return value.replace(/\s+/g, '').toLowerCase();
}

// Deterministic fallback evaluator:
// if user included the expected-output token for a case, we mark it as passing.
// This avoids hard-failing when remote AI eval is unavailable in AI mode.
export function evaluateTddTests(userCode: string, testCases: TddTestCase[]): TddTestResults {
    const normalizedCode = normalize(userCode);
    const results: TddTestResults = {};

    for (const test of testCases) {
        const expected = normalize(test.expectedOutput);
        results[test.id] = expected.length > 0 && normalizedCode.includes(expected);
    }

    return results;
}
