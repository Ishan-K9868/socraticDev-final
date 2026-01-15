// Dojo Examples Index
// Re-exports all hardcoded examples for each challenge type

export * from './bigOExamples';
export * from './mentalExamples';
export * from './parsonsExamples';
export * from './surgeryExamples';
export * from './fadedExamples';
export * from './eli5Examples';
export * from './patternExamples';
export * from './translationExamples';
export * from './tddExamples';

// Utility function to get random example
export function getRandomExample<T>(examples: T[]): T {
    return examples[Math.floor(Math.random() * examples.length)];
}

// Utility to get random example without repeats in session
export function createExamplePicker<T>(examples: T[]) {
    let remaining = [...examples];

    return {
        next(): T {
            if (remaining.length === 0) {
                remaining = [...examples];
            }
            const index = Math.floor(Math.random() * remaining.length);
            const [example] = remaining.splice(index, 1);
            return example;
        },
        reset() {
            remaining = [...examples];
        }
    };
}
