export interface IGrammarData {
    isCorrect: boolean;
    details: string;
    corrections: string;
}

export type SelectorOption = 'word' | 'sentence' | 'context';