// Get enabled options based on mode
export const getEnabledOptions = (mode: string) => {
    switch (mode) {
        case 'pronunciation':
            return ['word'];
        case 'grammar':
            return ['sentence'];
        case 'summarizer':
            return ['sentence', 'paragraph'];
        case 'translation':
            return ['word', 'sentence', 'paragraph'];
        default:
            return ['word'];
    }
};

// Get default selector value based on mode
export const getDefaultSelectorValue = (mode: string) => {
    switch (mode) {
        case 'pronunciation':
            return 'word';
        case 'grammar':
            return 'sentence';
        case 'summarizer':
            return 'sentence';
        case 'translation':
            return 'word';
        default:
            return 'word';
    }
};