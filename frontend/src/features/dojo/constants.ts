import { ChallengeType, ModeLanguageSupport } from './types';

// Dojo constants - shared across Dojo components

// Supported programming languages
export const SUPPORTED_LANGUAGES = [
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'javascript', name: 'JavaScript', icon: '⚡' },
    { id: 'typescript', name: 'TypeScript', icon: '📘' },
    { id: 'java', name: 'Java', icon: '☕' },
    { id: 'cpp', name: 'C++', icon: '⚙️' },
    { id: 'go', name: 'Go', icon: '🐹' },
    { id: 'rust', name: 'Rust', icon: '🦀' },
];

// Default language
export const DEFAULT_LANGUAGE = 'python';

// Practice mode supports only languages that have genuine hardcoded examples.
export const PRACTICE_MODE_LANGUAGE_SUPPORT: ModeLanguageSupport = {
    parsons: ['python', 'javascript'],
    surgery: ['python', 'javascript', 'typescript', 'java', 'cpp', 'go', 'rust'],
    eli5: ['python'],
    faded: ['python', 'javascript', 'typescript', 'java', 'cpp', 'go', 'rust'],
    mental: ['python', 'javascript', 'typescript', 'java', 'cpp', 'go', 'rust'],
    'rubber-duck': ['python', 'javascript', 'typescript', 'java', 'cpp', 'go', 'rust'],
    translation: ['python', 'javascript', 'typescript', 'java', 'cpp', 'go', 'rust'],
    pattern: ['python', 'javascript', 'typescript', 'java', 'cpp', 'go', 'rust'],
    tdd: ['python'],
    bigo: ['python', 'javascript', 'typescript', 'java', 'cpp', 'go', 'rust'],
    council: ['python', 'javascript', 'typescript', 'java', 'cpp', 'go', 'rust'],
};

export function isLanguageSupportedInPractice(mode: ChallengeType, language: string): boolean {
    const supported = PRACTICE_MODE_LANGUAGE_SUPPORT[mode] || [];
    return supported.includes(language);
}
