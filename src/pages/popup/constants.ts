// Base options without translations (for static use)
export const modeOptionsBase = [
    { value: 'grammar', labelKey: 'grammar' as const },
    { value: 'pronunciation', labelKey: 'vocabulary' as const },
    { value: 'summarizer', labelKey: 'summarizer' as const },
    { value: 'translation', labelKey: 'translation' as const },
];

export const targetLangOptionsBase = [
    { value: 'en', labelKey: 'english' as const },
    { value: 'id', labelKey: 'indonesia' as const },
    { value: 'es', labelKey: 'spanish' as const },
    { value: 'ja', labelKey: 'japanese' as const },
    { value: 'fr', labelKey: 'french' as const },
    { value: 'de', labelKey: 'german' as const },
    { value: 'zh', labelKey: 'chinese' as const },
    { value: 'ko', labelKey: 'korean' as const },
    { value: 'pt', labelKey: 'portuguese' as const },
    { value: 'it', labelKey: 'italian' as const },
    { value: 'ar', labelKey: 'arabic' as const },
    { value: 'ru', labelKey: 'russian' as const },
    { value: 'nl', labelKey: 'dutch' as const },
    { value: 'tr', labelKey: 'turkish' as const },
    { value: 'hi', labelKey: 'hindi' as const },
    { value: 'vi', labelKey: 'vietnamese' as const },
];

export const sourceLangOptionsBase = [
    { value: 'en', labelKey: 'english' as const }
];

export const selectorOptionsBase = [
    { value: 'word', labelKey: 'word' as const },
    { value: 'sentence', labelKey: 'sentence' as const },
    { value: 'context', labelKey: 'context' as const },
];

export const accentOptionsBase = [
    { value: 'american', labelKey: 'american' as const },
    { value: 'british', labelKey: 'british' as const },
];

export const summarizerTypeOptionsBase = [
    { value: 'headline', labelKey: 'headline' as const },
    { value: 'key-points', labelKey: 'key_points' as const },
    { value: 'teaser', labelKey: 'teaser' as const },
    { value: 'tldr', labelKey: 'tldr' as const },
];

export const summarizerLengthOptionsBase = [
    { value: 'short', labelKey: 'short' as const },
    { value: 'medium', labelKey: 'medium' as const },
    { value: 'long', labelKey: 'long' as const },
];

export const themeOptionsBase = [
    { value: 'light', labelKey: 'light' as const },
    { value: 'dark', labelKey: 'dark' as const },
];

export const languageExtensionOptionsBase = [
    { value: 'en', labelKey: 'english' as const },
    { value: 'id', labelKey: 'indonesia' as const },
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
    { value: 'id', label: 'Indonesia' },
    { value: 'es', label: 'Spanish' },
    { value: 'ja', label: 'Japanese' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ko', label: 'Korean' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'it', label: 'Italian' },
    { value: 'ar', label: 'Arabic' },
    { value: 'ru', label: 'Russian' },
    { value: 'nl', label: 'Dutch' },
    { value: 'tr', label: 'Turkish' },
    { value: 'hi', label: 'Hindi' },
    { value: 'vi', label: 'Vietnamese' },
];

export const sourceLangOptions = [
    { value: 'en', label: 'English' },
    { value: 'id', label: 'Indonesia' },
    { value: 'es', label: 'Spanish' },
    { value: 'ja', label: 'Japanese' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ko', label: 'Korean' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'it', label: 'Italian' },
    { value: 'ar', label: 'Arabic' },
    { value: 'ru', label: 'Russian' },
    { value: 'nl', label: 'Dutch' },
    { value: 'tr', label: 'Turkish' },
    { value: 'hi', label: 'Hindi' },
    { value: 'vi', label: 'Vietnamese' },
];

export const selectorOptions = [
    { value: 'word', label: 'Word' },
    { value: 'sentence', label: 'Sentence' },
    { value: 'context', label: 'Context' },
];

export const accentOptions = [
    { value: 'american', label: 'American' },
    { value: 'british', label: 'British' },
];

export const summarizerTypeOptions = [
    { value: 'headline', label: 'Headline' },
    { value: 'key-points', label: 'Key Points' },
    { value: 'teaser', label: 'Teaser' },
    { value: 'tldr', label: 'TL;DR' },
];

export const summarizerLengthOptions = [
    { value: 'short', label: 'Short' },
    { value: 'medium', label: 'Medium' },
    { value: 'long', label: 'Long' },
];

export const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
];

export const languageExtensionOptions = [
    { value: 'en', label: 'English' },
    { value: 'id', label: 'Indonesia' },
    { value: 'es', label: 'Spanish' },
    { value: 'ja', label: 'Japanese' },
];