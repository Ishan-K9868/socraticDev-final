export type LandingPreviewMode = 'parsons' | 'surgery' | 'eli5' | 'mental' | 'bigo';

export interface LandingPreviewCard {
    mode: LandingPreviewMode;
    title: string;
    tagline: string;
    description: string;
    color: string;
    bgColor: string;
    borderColor: string;
}

export interface LandingPreviewVerdict {
    isCorrect: boolean;
    explanation: string;
    retryLabel: string;
    nextPreviewLabel: string;
}

interface LandingPreviewScenarioBase {
    mode: LandingPreviewMode;
    title: string;
    prompt: string;
    retryLabel: string;
    nextPreviewLabel: string;
    correctExplanation: string;
    incorrectExplanation: string;
}

export interface ParsonsPreviewBlock {
    id: string;
    content: string;
}

export interface ParsonsPreviewScenario extends LandingPreviewScenarioBase {
    mode: 'parsons';
    blocks: ParsonsPreviewBlock[];
    correctOrder: string[];
}

export interface SurgeryPreviewScenario extends LandingPreviewScenarioBase {
    mode: 'surgery';
    code: string;
    bugLine: number;
    fixSummary: string;
}

export interface ELI5PreviewScenario extends LandingPreviewScenarioBase {
    mode: 'eli5';
    code: string;
    minWordCount: number;
    requiredPhrases: string[];
    forbiddenWords: string[];
}

export interface MentalPreviewScenario extends LandingPreviewScenarioBase {
    mode: 'mental';
    code: string;
    options: string[];
    correctOption: string;
}

export interface BigOPreviewScenario extends LandingPreviewScenarioBase {
    mode: 'bigo';
    code: string;
    options: string[];
    correctComplexity: string;
}

export type LandingPreviewScenario =
    | ParsonsPreviewScenario
    | SurgeryPreviewScenario
    | ELI5PreviewScenario
    | MentalPreviewScenario
    | BigOPreviewScenario;

export interface ParsonsPreviewAnswer {
    orderedIds: string[];
}

export interface SurgeryPreviewAnswer {
    lineNumber: number | null;
}

export interface ELI5PreviewAnswer {
    explanation: string;
}

export interface MentalPreviewAnswer {
    selectedOption: string | null;
}

export interface BigOPreviewAnswer {
    selectedComplexity: string | null;
}

export interface LandingPreviewAnswerMap {
    parsons: ParsonsPreviewAnswer;
    surgery: SurgeryPreviewAnswer;
    eli5: ELI5PreviewAnswer;
    mental: MentalPreviewAnswer;
    bigo: BigOPreviewAnswer;
}

export interface LandingPreviewScenarioMap {
    parsons: ParsonsPreviewScenario;
    surgery: SurgeryPreviewScenario;
    eli5: ELI5PreviewScenario;
    mental: MentalPreviewScenario;
    bigo: BigOPreviewScenario;
}
