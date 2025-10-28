import { useState, useEffect } from 'react';
import { i18n, type SupportedLanguage, type TranslationKey } from '../lib/i18n';

export const useI18n = () => {
  const [language, setLanguage] = useState<SupportedLanguage>(i18n.getCurrentLanguage());

  useEffect(() => {
    // Listen for storage changes to update language in real-time
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.preferences) {
        try {
          const newPreferences = JSON.parse(changes.preferences.newValue || '{}');
          if (newPreferences.lang) {
            i18n.setLanguage(newPreferences.lang);
            setLanguage(newPreferences.lang);
          }
        } catch (err) {
          console.error('Error parsing preferences change for i18n:', err);
        }
      }
    };

    if (typeof chrome !== 'undefined' && chrome?.storage?.onChanged) {
      chrome.storage.onChanged.addListener(handleStorageChange);
    }

    // Load initial language from storage
    const loadInitialLanguage = async () => {
      try {
        if (typeof chrome !== 'undefined' && chrome?.storage?.local) {
          const data = await chrome.storage.local.get(['preferences']);
          if (data.preferences) {
            const preferences = JSON.parse(data.preferences);
            if (preferences.lang) {
              i18n.setLanguage(preferences.lang);
              setLanguage(preferences.lang);
            }
          }
        }
      } catch (error) {
        console.warn('Failed to load initial language:', error);
      }
    };

    loadInitialLanguage();

    return () => {
      if (typeof chrome !== 'undefined' && chrome?.storage?.onChanged) {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      }
    };
  }, []);

  const t = (key: TranslationKey, variables?: Record<string, string | number>) => {
    return i18n.t(key, variables);
  };

  const changeLanguage = (newLanguage: SupportedLanguage) => {
    i18n.setLanguage(newLanguage);
    setLanguage(newLanguage);
  };

  return {
    t,
    language,
    changeLanguage,
    getCurrentLanguage: () => i18n.getCurrentLanguage(),
    getTranslations: () => i18n.getTranslations(),
  };
};