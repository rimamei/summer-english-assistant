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
  enabled_extension: true, // Enable by default for testing
};

export const useStorage = () => {
  const [settingsData, setSettingsData] = useState<SettingsData>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settingsData,
    isLoading,
    error,
    loadSettings,
    sourceLanguage: settingsData.source_lang,
    targetLanguage: settingsData.target_lang,
    mode: settingsData.mode,
  };
};