export interface IGrammarData {
    isCorrect: boolean;
    details: string;
    corrections: string;
}

export interface ISummarizerData {
    summary: string;
}

export type SelectorOption = 'word' | 'sentence' | 'context';