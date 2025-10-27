export type TPronunciationState = {
    definition: string;
    level: string;
    pronunciation: {
        uk: string;
        us: string;
    },
    soundBySound: { symbol: string; exampleWord: string }[],
    synonyms: string[];
    text: string;
    translation: string;
    type: string;
}