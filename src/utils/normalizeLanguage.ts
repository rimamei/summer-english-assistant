export const normalizeLanguage = (lang: string | null | undefined): string => {
  const supportedLanguages = ['en', 'ja', 'es'];
  if (!lang || !lang.trim()) return 'en';
  const cleanLang = lang.trim().toLowerCase();
  return supportedLanguages.includes(cleanLang) ? cleanLang : 'en';
};
