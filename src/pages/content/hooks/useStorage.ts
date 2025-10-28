import { useState, useEffect, useCallback } from 'react';

export interface SettingsData {
  source_lang: string;
  target_lang: string;
  mode: string;
  selector: string;
  accent: string;
}

export interface IPreferences {
  theme: 'light' | 'dark';
  ext_status: boolean;
  lang: string;
}

const defaultSettings: SettingsData = {
  source_lang: 'en',
  target_lang: 'id', // Changed to Indonesian as target language
  mode: 'pronunciation',
  selector: 'word',
  accent: 'american',
};

const defaultPreferences: IPreferences = {
  lang: 'en',
  theme: 'light',
  ext_status: false,
};

export const useStorage = () => {
  const [settingsData, setSettingsData] = useState<SettingsData>(defaultSettings);
  const [preferencesData, setPreferencesData] = useState<IPreferences>(defaultPreferences);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getPreferencesStorage = useCallback(async (): Promise<IPreferences | null> => {
    try {
      if (!chrome?.storage?.local) {
        console.warn('Chrome storage not available');
        return null;
      }

      const storageData = await chrome.storage.local.get(['preferences', 'ext_status']);

      console.log('storageData', storageData)

      if (storageData.preferences || storageData?.ext_status) {
        const parsedPreferences = storageData.preferences ? JSON.parse(storageData.preferences) : {};
        return { ...parsedPreferences, ext_status: storageData?.ext_status || false };
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
      const data = await getPreferencesStorage();
      if (data) {
        setPreferencesData(data);
      }
    } catch (err) {
      console.error('Error loading theme:', err);
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
          setPreferencesData((prev) => ({ ...prev, theme: newTheme }));
        } catch (err) {
          console.error('Error parsing storage change:', err);
        }
      }

      if (changes.preferences) {
        try {
          const newPreferences = JSON.parse(changes.preferences.newValue || '{}');
          setPreferencesData((prev) => ({ ...prev, ...newPreferences }));
        } catch (err) {
          console.error('Error parsing preferences change:', err);
        }
      }

      if (changes.ext_status) {
        try {
          const newStatus = changes.ext_status.newValue || false;
          setPreferencesData((prev) => ({ ...prev, ext_status: newStatus }));
        } catch (err) {
          console.error('Error parsing ext_status change:', err);
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
    enableExtension: preferencesData.ext_status,
    isLightTheme: preferencesData.theme === 'light',
    lang: preferencesData.lang,
  };
};