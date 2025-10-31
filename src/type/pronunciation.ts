export type TPronunciationState = {
    definition: string;
    level: string;
    pronunciation: {
        uk: string;
        us: string;
    },
    soundBySound: {
        uk: { symbol: string; exampleWord: string }[];
        us: { symbol: string; exampleWord: string }[];
    },
    synonyms: string[];
    text: string;
    type: string;
}