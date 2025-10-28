import { useState, useEffect, useCallback } from 'react';

export interface SettingsData {
  source_lang: string;
  target_lang: string;
  mode: string;
  selector: string;
  accent: string;
  enabled_extension: boolean;
}

const defaultSettings: SettingsData = {
  source_lang: 'en',
  target_lang: 'id', // Changed to Indonesian as target language
  mode: 'pronunciation',
  selector: 'word',
  accent: 'american',
  enabled_extension: false,
};

export const useStorage = () => {
  const [isLightTheme, setIsLightTheme] = useState(true);
  const [settingsData, setSettingsData] = useState<SettingsData>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getThemeStorage = useCallback(async (): Promise<string | null> => {
    try {
      if (!chrome?.storage?.local) {
        console.warn('Chrome storage not available');
        return null;
      }

      const storageData = await chrome.storage.local.get(['theme']);

      if (storageData.theme) {
        return storageData.theme;
      }

      return null;
    } catch (err) {
      console.error('Error getting storage:', err);
      setError(err instanceof Error ? err.message : 'Failed to get theme');
      return null;
    }
  }, []);

  const getSettingStorage = useCallback(async (): Promise<SettingsData | null> => {
    try {
      if (!chrome?.storage?.local) {
        console.warn('Chrome storage not available');
        return null;
      }

      const storageData = await chrome.storage.local.get(['settings']);

      if (storageData.settings) {
        const parsedSettings = JSON.parse(storageData.settings);
        return parsedSettings;
      }

      return null;
    } catch (err) {
      console.error('Error getting storage:', err);
      setError(err instanceof Error ? err.message : 'Failed to get settings');
      return null;
    }
  }, []);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const settings = await getSettingStorage();
      if (settings) {
        setSettingsData(settings);
      }
    } finally {
      setIsLoading(false);
    }
  }, [getSettingStorage]);

  const loadTheme = useCallback(async () => {
    try {
      const theme = await getThemeStorage();
      if (theme) {
        setIsLightTheme(theme === 'light');
      }
    } catch (err) {
      console.error('Error loading theme:', err);
    }
  }, [getThemeStorage]);

  // Load settings and theme on mount
  useEffect(() => {
    const loadData = async () => {
      await loadSettings();
      await loadTheme();
    };
    loadData();
  }, [loadSettings, loadTheme]);

  // Listen for storage changes from popup or other extension contexts
  useEffect(() => {
    if (!chrome?.storage?.onChanged) return;

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {

      if (changes.settings) {
        try {
          const newSettings = JSON.parse(changes.settings.newValue || '{}');
          setSettingsData(newSettings);
        } catch (err) {
          console.error('Error parsing storage change:', err);
        }
      }

      if (changes.theme) {
        try {
          const newTheme = changes.theme.newValue || 'light';
          setIsLightTheme(newTheme === 'light');
        } catch (err) {
          console.error('Error parsing storage change:', err);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  return {
    settingsData,
    isLoading,
    error,
    loadSettings,
    sourceLanguage: settingsData.source_lang,
    targetLanguage: settingsData.target_lang,
    mode: settingsData.mode,
    isLightTheme
  };
};