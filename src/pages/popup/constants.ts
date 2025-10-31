// Base options without translations (for static use)
export const modeOptionsBase = [
    { value: 'grammar', labelKey: 'grammar' as const },
    { value: 'pronunciation', labelKey: 'vocabulary' as const },
    { value: 'summarizer', labelKey: 'summarizer' as const },
    { value: 'translation', labelKey: 'translation' as const },
];

export const targetLangOptionsBase = [
    { value: 'en', labelKey: 'english' as const },
    { value: 'id', labelKey: 'indonesian' as const },
    { value: 'es', labelKey: 'spanish' as const },
    { value: 'ja', labelKey: 'japanese' as const },
];

export const sourceLangOptionsBase = [
    { value: 'en', labelKey: 'english' as const }
];

export const selectorOptionsBase = [
    { value: 'word', labelKey: 'word' as const },
    { value: 'sentence', labelKey: 'sentence' as const },
    { value: 'paragraph', labelKey: 'paragraph' as const },
];

export const accentOptionsBase = [
    { value: 'american', labelKey: 'american' as const },
    { value: 'british', labelKey: 'british' as const },
];

export const themeOptionsBase = [
    { value: 'light', labelKey: 'light' as const },
    { value: 'dark', labelKey: 'dark' as const },
];

export const languageExtensionOptionsBase = [
    { value: 'en', labelKey: 'english' as const },
    { value: 'id', labelKey: 'indonesian' as const },
    { value: 'es', labelKey: 'spanish' as const },
    { value: 'ja', labelKey: 'japanese' as const },
];

// Static options (for backward compatibility)
export const modeOptions = [
    { value: 'grammar', label: 'Grammar Analyzer' },
    { value: 'pronunciation', label: 'Pronunciation & Definition' },
    { value: 'summarizer', label: 'Summarizer' },
    { value: 'translation', label: 'Full Translation' },
];

export const targetLangOptions = [
    { value: 'en', label: 'English' },
    { value: 'id', label: 'Indonesian' },
    { value: 'es', label: 'Spanish' },
    { value: 'ja', label: 'Japanese' },
];

export const sourceLangOptions = [
    { value: 'en', label: 'English' }
];

export const selectorOptions = [
    { value: 'word', label: 'Word' },
    { value: 'sentence', label: 'Sentence' },
    { value: 'paragraph', label: 'Paragraph' },
];

export const accentOptions = [
    { value: 'american', label: 'American' },
    { value: 'british', label: 'British' },
];

export const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
];

export const languageExtensionOptions = [
    { value: 'en', label: 'English' },
    { value: 'id', label: 'Indonesian' },
    { value: 'es', label: 'Spanish' },
    { value: 'ja', label: 'Japanese' },
];