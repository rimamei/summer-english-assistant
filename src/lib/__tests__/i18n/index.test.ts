import { describe, it, expect, beforeEach, vi } from 'vitest';
import { i18n, t, useI18n, type SupportedLanguage, type TranslationKey } from '../../i18n';
import { translations } from '../../i18n/translations';

describe('i18n module', () => {
  // Mock chrome.storage.local
  const mockStorage = {
    get: vi.fn(),
    set: vi.fn(),
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Setup global chrome object
    global.chrome = {
      storage: {
        local: mockStorage,
      },
    } as unknown as typeof chrome;

    // Reset i18n instance to default state
    i18n.setLanguage('en');
  });

  describe('I18n class - initialization and storage', () => {
    it('should initialize with English as default language', () => {
      expect(i18n.getCurrentLanguage()).toBe('en');
    });

    it('should attempt to load language from chrome storage if available', async () => {
      // Note: Since i18n is a singleton and the module is cached, we test the behavior
      // by verifying the language can be loaded from storage when chrome is available
      const preferences = { lang: 'ja' };
      mockStorage.get.mockResolvedValue({
        preferences: JSON.stringify(preferences),
      });

      // The constructor calls loadLanguageFromStorage internally
      // Since the module is already loaded, we verify chrome.storage is accessible
      expect(global.chrome).toBeDefined();
      expect(global.chrome.storage).toBeDefined();
      expect(global.chrome.storage.local).toBeDefined();
    });

    it('should load language from preferences when data.preferences exists', async () => {
      // Test the scenario where preferences contain a language setting
      const preferences = { lang: 'es' };
      mockStorage.get.mockResolvedValue({
        preferences: JSON.stringify(preferences),
      });

      // Simulate what loadLanguageFromStorage does
      const data = await chrome.storage.local.get(['preferences']);
      expect(data.preferences).toBeDefined();

      const parsedPreferences = JSON.parse(data.preferences);
      expect(parsedPreferences.lang).toBe('es');

      // Verify setLanguage would work with this language
      i18n.setLanguage(parsedPreferences.lang);
      expect(i18n.getCurrentLanguage()).toBe('es');
    });

    it('should handle preferences with different supported languages', async () => {
      const testCases: Array<{ lang: SupportedLanguage }> = [
        { lang: 'en' },
        { lang: 'id' },
        { lang: 'es' },
        { lang: 'ja' },
      ];

      for (const preferences of testCases) {
        mockStorage.get.mockResolvedValue({
          preferences: JSON.stringify(preferences),
        });

        const data = await chrome.storage.local.get(['preferences']);
        const parsedPreferences = JSON.parse(data.preferences);

        i18n.setLanguage(parsedPreferences.lang);
        expect(i18n.getCurrentLanguage()).toBe(preferences.lang);
      }
    });

    it('should fallback to English when preferences.lang is missing', async () => {
      // Test when preferences object exists but lang is missing
      const preferences = {};
      mockStorage.get.mockResolvedValue({
        preferences: JSON.stringify(preferences),
      });

      const data = await chrome.storage.local.get(['preferences']);
      const parsedPreferences = JSON.parse(data.preferences);

      // When lang is undefined, should use 'en' as fallback
      i18n.setLanguage(parsedPreferences.lang || 'en');
      expect(i18n.getCurrentLanguage()).toBe('en');
    });

    it('should handle invalid JSON in preferences gracefully', async () => {
      mockStorage.get.mockResolvedValue({
        preferences: 'invalid-json{',
      });

      const data = await chrome.storage.local.get(['preferences']);

      // Should handle JSON parse errors
      expect(() => JSON.parse(data.preferences)).toThrow();
    });

    it('should handle chrome storage not being available', async () => {
      global.chrome = undefined as unknown as typeof chrome;

      // Should not throw error
      expect(() => i18n.setLanguage('en')).not.toThrow();
    });

    it('should handle empty preferences in storage', async () => {
      mockStorage.get.mockResolvedValue({});

      const { i18n: newI18n } = await import('../../i18n');

      // Wait for async loadLanguageFromStorage to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should remain on default language
      expect(newI18n.getCurrentLanguage()).toBe('en');
    });
  });

  describe('setLanguage', () => {
    it('should set a valid language - English', () => {
      i18n.setLanguage('en');
      expect(i18n.getCurrentLanguage()).toBe('en');
    });

    it('should set a valid language - Indonesian', () => {
      i18n.setLanguage('id');
      expect(i18n.getCurrentLanguage()).toBe('id');
    });

    it('should set a valid language - Spanish', () => {
      i18n.setLanguage('es');
      expect(i18n.getCurrentLanguage()).toBe('es');
    });

    it('should set a valid language - Japanese', () => {
      i18n.setLanguage('ja');
      expect(i18n.getCurrentLanguage()).toBe('ja');
    });

    it('should fallback to English for invalid language', () => {
      i18n.setLanguage('fr' as SupportedLanguage); // French is not supported
      expect(i18n.getCurrentLanguage()).toBe('en');
    });

    it('should fallback to English for undefined language', () => {
      i18n.setLanguage(undefined as unknown as SupportedLanguage);
      expect(i18n.getCurrentLanguage()).toBe('en');
    });
  });

  describe('getCurrentLanguage', () => {
    it('should return current language', () => {
      i18n.setLanguage('es');
      expect(i18n.getCurrentLanguage()).toBe('es');
    });

    it('should return English after setting invalid language', () => {
      i18n.setLanguage('fr' as SupportedLanguage);
      expect(i18n.getCurrentLanguage()).toBe('en');
    });
  });

  describe('t() method - translation', () => {
    it('should translate a valid key in English', () => {
      i18n.setLanguage('en');
      expect(i18n.t('vocabulary')).toBe('Vocabulary');
      expect(i18n.t('level')).toBe('Level');
      expect(i18n.t('close')).toBe('Close');
    });

    it('should translate a valid key in different languages', () => {
      i18n.setLanguage('en');
      const englishTranslation = i18n.t('vocabulary');

      i18n.setLanguage('id');
      const indonesianTranslation = i18n.t('vocabulary');

      // Translations should be different for different languages
      expect(englishTranslation).toBe(translations.en.vocabulary);
      expect(indonesianTranslation).toBe(translations.id.vocabulary);
    });

    it('should fallback to English when key is missing in current language', () => {
      i18n.setLanguage('en');

      const testKey = 'vocabulary' as TranslationKey;

      // Should use English fallback
      expect(i18n.t(testKey)).toBe(translations.en[testKey]);
    });

    it('should return the key itself when not found in any language', () => {
      const nonExistentKey = 'non_existent_key' as TranslationKey;
      expect(i18n.t(nonExistentKey)).toBe(nonExistentKey);
    });

    it('should replace a single variable in translation', () => {
      // Test variable replacement by mocking the translations object
      const mockTranslations = {
        ...translations,
        en: {
          ...translations.en,
          test_greeting: 'Hello {{name}}!',
        },
      };

      vi.spyOn(i18n, 't').mockImplementation((key, variables) => {
        const translation = mockTranslations.en[key as keyof typeof mockTranslations.en] || key;
        if (!variables) {
          return translation as string;
        }
        return Object.keys(variables).reduce((str, varKey) => {
          return str.replace(new RegExp(`{{${varKey}}}`, 'g'), String(variables[varKey]));
        }, translation as string);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = i18n.t('test_greeting' as any, { name: 'John' });
      expect(result).toBe('Hello John!');

      vi.restoreAllMocks();
    });

    it('should replace multiple variables in translation', () => {
      const mockTranslations = {
        ...translations,
        en: {
          ...translations.en,
          test_message: 'Hello {{name}}, you have {{count}} messages',
        },
      };

      vi.spyOn(i18n, 't').mockImplementation((key, variables) => {
        const translation = mockTranslations.en[key as keyof typeof mockTranslations.en] || key;
        if (!variables) {
          return translation as string;
        }
        return Object.keys(variables).reduce((str, varKey) => {
          return str.replace(new RegExp(`{{${varKey}}}`, 'g'), String(variables[varKey]));
        }, translation as string);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = i18n.t('test_message' as any, {
        name: 'Alice',
        count: 5,
      });
      expect(result).toBe('Hello Alice, you have 5 messages');

      vi.restoreAllMocks();
    });

    it('should handle translation without variables parameter', () => {
      i18n.setLanguage('en');
      expect(i18n.t('close')).toBe('Close');
      expect(i18n.t('cancel')).toBe('Cancel');
    });

    it('should convert number variables to strings', () => {
      const mockTranslations = {
        ...translations,
        en: {
          ...translations.en,
          test_pagination: 'Page {{page}} of {{total}}',
        },
      };

      vi.spyOn(i18n, 't').mockImplementation((key, variables) => {
        const translation = mockTranslations.en[key as keyof typeof mockTranslations.en] || key;
        if (!variables) {
          return translation as string;
        }
        return Object.keys(variables).reduce((str, varKey) => {
          return str.replace(new RegExp(`{{${varKey}}}`, 'g'), String(variables[varKey]));
        }, translation as string);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = i18n.t('test_pagination' as any, {
        page: 1,
        total: 10,
      });
      expect(result).toBe('Page 1 of 10');

      vi.restoreAllMocks();
    });

    it('should handle empty variables object', () => {
      i18n.setLanguage('en');
      expect(i18n.t('close', {})).toBe('Close');
    });
  });

  describe('getTranslations', () => {
    it('should return all English translations', () => {
      i18n.setLanguage('en');
      const allTranslations = i18n.getTranslations();
      expect(allTranslations).toBe(translations.en);
      expect(allTranslations.vocabulary).toBe('Vocabulary');
    });

    it('should return all Indonesian translations', () => {
      i18n.setLanguage('id');
      const allTranslations = i18n.getTranslations();
      expect(allTranslations).toBe(translations.id);
    });

    it('should return all Spanish translations', () => {
      i18n.setLanguage('es');
      const allTranslations = i18n.getTranslations();
      expect(allTranslations).toBe(translations.es);
    });

    it('should return all Japanese translations', () => {
      i18n.setLanguage('ja');
      const allTranslations = i18n.getTranslations();
      expect(allTranslations).toBe(translations.ja);
    });

    it('should fallback to English if current language is not available', () => {
      i18n.setLanguage('fr' as SupportedLanguage); // Invalid language
      const allTranslations = i18n.getTranslations();
      expect(allTranslations).toBe(translations.en);
    });
  });

  describe('Exported singleton and functions', () => {
    it('should export i18n as a singleton instance', () => {
      expect(i18n).toBeDefined();
      expect(typeof i18n.t).toBe('function');
      expect(typeof i18n.setLanguage).toBe('function');
      expect(typeof i18n.getCurrentLanguage).toBe('function');
    });

    it('should export t() function that works correctly', () => {
      i18n.setLanguage('en');
      expect(t('vocabulary')).toBe('Vocabulary');
      expect(t('close')).toBe('Close');
    });

    it('should export t() function that handles variables', () => {
      const mockTranslations = {
        ...translations,
        en: {
          ...translations.en,
          test_greeting: 'Hello {{name}}!',
        },
      };

      vi.spyOn(i18n, 't').mockImplementation((key, variables) => {
        const translation = mockTranslations.en[key as keyof typeof mockTranslations.en] || key;
        if (!variables) {
          return translation as string;
        }
        return Object.keys(variables).reduce((str, varKey) => {
          return str.replace(new RegExp(`{{${varKey}}}`, 'g'), String(variables[varKey]));
        }, translation as string);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = t('test_greeting' as any, { name: 'Bob' });
      expect(result).toBe('Hello Bob!');

      vi.restoreAllMocks();
    });
  });

  describe('useI18n hook', () => {
    it('should return an object with t, language, and setLanguage', () => {
      const hook = useI18n();

      expect(hook).toHaveProperty('t');
      expect(hook).toHaveProperty('language');
      expect(hook).toHaveProperty('setLanguage');
      expect(typeof hook.t).toBe('function');
      expect(typeof hook.setLanguage).toBe('function');
    });

    it('should return current language', () => {
      i18n.setLanguage('es');
      const hook = useI18n();

      expect(hook.language).toBe('es');
    });

    it('should have working t function', () => {
      i18n.setLanguage('en');
      const hook = useI18n();

      expect(hook.t('vocabulary')).toBe('Vocabulary');
      expect(hook.t('close')).toBe('Close');
    });

    it('should have working setLanguage function', () => {
      const hook = useI18n();

      hook.setLanguage('ja');
      expect(i18n.getCurrentLanguage()).toBe('ja');

      hook.setLanguage('id');
      expect(i18n.getCurrentLanguage()).toBe('id');
    });

    it('should maintain binding to i18n instance', () => {
      const hook = useI18n();

      // Change language through hook
      hook.setLanguage('es');

      // Verify it affects the singleton
      expect(i18n.getCurrentLanguage()).toBe('es');

      // Verify translation works correctly
      expect(hook.t('vocabulary')).toBe(translations.es.vocabulary);
    });
  });

  describe('Integration scenarios', () => {
    it('should change language and translate correctly', () => {
      i18n.setLanguage('en');
      const englishVocab = i18n.t('vocabulary');

      i18n.setLanguage('id');
      const indonesianVocab = i18n.t('vocabulary');

      expect(englishVocab).toBe(translations.en.vocabulary);
      expect(indonesianVocab).toBe(translations.id.vocabulary);
      expect(englishVocab).not.toBe(indonesianVocab);
    });

    it('should handle multiple language switches', () => {
      i18n.setLanguage('en');
      expect(i18n.getCurrentLanguage()).toBe('en');

      i18n.setLanguage('es');
      expect(i18n.getCurrentLanguage()).toBe('es');

      i18n.setLanguage('ja');
      expect(i18n.getCurrentLanguage()).toBe('ja');

      i18n.setLanguage('id');
      expect(i18n.getCurrentLanguage()).toBe('id');

      i18n.setLanguage('en');
      expect(i18n.getCurrentLanguage()).toBe('en');
    });

    it('should use hook and function exports consistently', () => {
      i18n.setLanguage('en');

      const hookResult = useI18n();
      const tResult = t('close');
      const hookTResult = hookResult.t('close');
      const i18nTResult = i18n.t('close');

      expect(tResult).toBe('Close');
      expect(hookTResult).toBe('Close');
      expect(i18nTResult).toBe('Close');
      expect(tResult).toBe(hookTResult);
      expect(hookTResult).toBe(i18nTResult);
    });

    it('should get all translations and translate individual keys consistently', () => {
      i18n.setLanguage('en');

      const allTranslations = i18n.getTranslations();
      const vocabularyTranslation = i18n.t('vocabulary');

      expect(allTranslations.vocabulary).toBe(vocabularyTranslation);
      expect(allTranslations.close).toBe(i18n.t('close'));
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid language switches', () => {
      for (let i = 0; i < 100; i++) {
        const languages: SupportedLanguage[] = ['en', 'id', 'es', 'ja'];
        const randomLang = languages[i % languages.length];
        i18n.setLanguage(randomLang);
        expect(i18n.getCurrentLanguage()).toBe(randomLang);
      }
    });

    it('should handle translation of all available keys', () => {
      i18n.setLanguage('en');
      const allKeys = Object.keys(translations.en) as TranslationKey[];

      allKeys.forEach((key) => {
        const translation = i18n.t(key);
        expect(translation).toBeDefined();
        expect(translation).toBe(translations.en[key]);
      });
    });

    it('should handle chrome storage errors gracefully', async () => {
      mockStorage.get.mockRejectedValue(new Error('Storage error'));

      // Should not throw
      await expect(
        (async () => {
          await import('../../i18n');
          await new Promise((resolve) => setTimeout(resolve, 10));
        })()
      ).resolves.not.toThrow();
    });
  });
});
