export const normalizeLanguage = (lang: string): string => {
    const supportedLanguages = ['en', 'ja', 'es'];
    if (!lang || !lang.trim()) return 'en';
    const cleanLang = lang.trim().toLowerCase();
    return supportedLanguages.includes(cleanLang) ? cleanLang : 'en';
};