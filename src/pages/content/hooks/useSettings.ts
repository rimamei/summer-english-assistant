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

export const useSettings = () => {
  const [settingsData, setSettingsData] = useState<SettingsData>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getStorage = useCallback(async (): Promise<SettingsData | null> => {
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

  const saveSettings = useCallback(async (newSettings: Partial<SettingsData>): Promise<boolean> => {
    try {
      if (!chrome?.storage?.local) {
        console.warn('Chrome storage not available');
        return false;
      }

      const updatedSettings = { ...settingsData, ...newSettings };
      await chrome.storage.local.set({ 
        settings: JSON.stringify(updatedSettings) 
      });
      
      setSettingsData(updatedSettings);
      return true;
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      return false;
    }
  }, [settingsData]);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const settings = await getStorage();
      if (settings) {
        setSettingsData(settings);
      }
    } finally {
      setIsLoading(false);
    }
  }, [getStorage]);

  const resetSettings = useCallback(async () => {
    try {
      if (!chrome?.storage?.local) {
        console.warn('Chrome storage not available');
        return false;
      }

      await chrome.storage.local.remove(['settings']);
      setSettingsData(defaultSettings);
      return true;
    } catch (err) {
      console.error('Error resetting settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset settings');
      return false;
    }
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Listen for storage changes
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
    saveSettings,
    loadSettings,
    resetSettings,
    // Convenience getters
    isExtensionEnabled: settingsData.enabled_extension,
    sourceLanguage: settingsData.source_lang,
    targetLanguage: settingsData.target_lang,
    mode: settingsData.mode,
    selector: settingsData.selector,
    accent: settingsData.accent,
  };
};