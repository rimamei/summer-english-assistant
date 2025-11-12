import type { IPreferences } from '@/type';
import type z from 'zod';
import type { validation } from './validation';

// Helper: Check if preferences data is valid
export const hasValidPreferences = (prefs: IPreferences | null) => {
  return prefs?.lang && prefs?.theme && prefs?.agent;
};

// Helper: Build form data from saved preferences
export const buildFormData = (prefs: IPreferences) => {
  const baseData = {
    lang: prefs.lang || 'en',
    theme: prefs.theme || 'light',
    agent: prefs.agent || 'chrome',
  };

  if (prefs.agent === 'gemini') {
    return {
      ...baseData,
      model: prefs.model,
      apiKey: prefs.apiKey,
    };
  }

  return baseData;
};

// Helper: Build storage data from form values
export const buildStorageData = (data: z.infer<typeof validation>): IPreferences => {
  const baseData: IPreferences = {
    theme: data.theme,
    lang: data.lang,
    agent: data.agent,
  };

  if (data.agent === 'gemini') {
    return {
      ...baseData,
      model: data.model,
      apiKey: data.apiKey,
    };
  }

  return baseData;
};
