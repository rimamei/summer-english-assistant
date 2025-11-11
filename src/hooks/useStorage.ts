import { useState, useEffect, useCallback } from 'react';
import { getLocalStorage, getLocalStorageMultiple } from '@/utils/storage';

export interface SettingsData {
  source_lang: string;
  target_lang: string;
  mode: string;
  selector: string;
  accent: string;
  summarizer_type: string;
  summarizer_length: string;
}

export interface IPreferences {
  theme: 'light' | 'dark';
  ext_status: boolean;
  lang: string;
  agent: string;
  model?: string | undefined;
  apiKey?: string | undefined;
}

export const useStorage = () => {
  const [settingsData, setSettingsData] = useState<SettingsData | undefined>();
  const [preferencesData, setPreferencesData] = useState<IPreferences>();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getPreferencesStorage = useCallback(async (): Promise<IPreferences | null> => {
    try {
      if (!chrome?.storage?.local) {
        return null;
      }

      const storageData = await getLocalStorageMultiple<{ preferences: IPreferences; ext_status: boolean }>(['preferences', 'ext_status']);

      if (storageData.preferences || storageData?.ext_status !== undefined) {
        const preferences = storageData.preferences || {} as IPreferences;
        return { ...preferences, ext_status: storageData?.ext_status || false };
      }

      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get theme');
      return null;
    }
  }, []);

  const getSettingStorage = useCallback(async (): Promise<SettingsData | null> => {
    try {
      if (!chrome?.storage?.local) {
        return null;
      }

      const settings = await getLocalStorage<SettingsData>('settings');

      if (settings) {
        return settings;
      }

      return null;
    } catch (err) {
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
    const data = await getPreferencesStorage();
    if (data) {
      setPreferencesData(data);
    }
  }, [getPreferencesStorage]);

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
        const newSettings = JSON.parse(changes.settings.newValue || '{}');
        setSettingsData(newSettings);
      }

      if (changes.theme) {
        const newTheme = changes.theme.newValue || 'light';
        setPreferencesData((prev) => {
          if (!prev) return undefined;
          return {
            ...prev,
            theme: newTheme,
            ext_status: prev.ext_status,
            lang: prev.lang,
            agent: prev.agent,
            model: prev.model,
            apiKey: prev.apiKey,
          };
        });
      }

      if (changes.preferences) {
        const newPreferences = JSON.parse(changes.preferences.newValue || '{}');
        setPreferencesData((prev) => ({ ...prev, ...newPreferences }));
      }

      if (changes.ext_status) {
        const newStatus = changes.ext_status.newValue || false;
        setPreferencesData((prev) => {
          if (!prev) return undefined;
          return {
            ...prev,
            ext_status: newStatus,
            theme: prev.theme,
            lang: prev.lang,
            agent: prev.agent,
            model: prev.model,
            apiKey: prev.apiKey,
          };
        });
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
    sourceLanguage: settingsData?.source_lang,
    targetLanguage: settingsData?.target_lang,
    mode: settingsData?.mode,
    enableExtension: preferencesData?.ext_status,
    isLightTheme: preferencesData?.theme ? preferencesData.theme === 'light' : true,
    lang: preferencesData?.lang,
    preferences: preferencesData,
  };
};