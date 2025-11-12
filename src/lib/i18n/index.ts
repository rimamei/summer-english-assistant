import { translations } from './translations';

export type SupportedLanguage = 'en' | 'id' | 'es' | 'ja';
export type TranslationKey = keyof typeof translations.en;

class I18n {
  private currentLanguage: SupportedLanguage = 'en';
  private fallbackLanguage: SupportedLanguage = 'en';

  constructor() {
    this.loadLanguageFromStorage();
  }

  private async loadLanguageFromStorage() {
    if (typeof chrome !== 'undefined' && chrome?.storage?.local) {
      const data = await chrome.storage.local.get(['preferences']);
      if (data.preferences) {
        const preferences = JSON.parse(data.preferences);
        this.setLanguage(preferences.lang || 'en');
      }
    }
  }

  setLanguage(language: SupportedLanguage) {
    if (translations[language]) {
      this.currentLanguage = language;
    } else {
      this.currentLanguage = this.fallbackLanguage;
    }
  }

  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  t(key: TranslationKey, variables?: Record<string, string | number>): string {
    const translation =
      translations[this.currentLanguage]?.[key] || translations[this.fallbackLanguage][key] || key;

    if (!variables) {
      return translation;
    }

    // Replace variables in translation string
    return Object.keys(variables).reduce((str, varKey) => {
      return str.replace(new RegExp(`{{${varKey}}}`, 'g'), String(variables[varKey]));
    }, translation);
  }

  // Get all translations for current language (useful for batch operations)
  getTranslations() {
    return translations[this.currentLanguage] || translations[this.fallbackLanguage];
  }
}

// Create singleton instance
export const i18n = new I18n();

// Export function for easy use in components
export const t = (key: TranslationKey, variables?: Record<string, string | number>) =>
  i18n.t(key, variables);

// Hook for React components to listen to language changes
export const useI18n = () => {
  return {
    t: i18n.t.bind(i18n),
    language: i18n.getCurrentLanguage(),
    setLanguage: i18n.setLanguage.bind(i18n),
  };
};
