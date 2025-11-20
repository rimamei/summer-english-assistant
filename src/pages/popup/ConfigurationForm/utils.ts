import type { IConfiguration } from '@/type';
import type z from 'zod';
import type { validation } from './validation';
import {
  sourceLangOptionsBase,
  sourceLangPromptAPIOptionsBase,
  targetLangOptionsBase,
  targetLangPromptAPIOptionsBase
} from '../constants';

// Helper: Check if configuration data is valid
export const hasValidConfiguration = (config: IConfiguration | null) => {
  return config?.source_lang && config?.target_lang && config?.mode && config?.selector;
};

// Helper: Build form data from saved configuration
export const buildFormData = (config: IConfiguration): z.infer<typeof validation> => {
  return {
    source_lang: config.source_lang || 'en',
    target_lang: config.target_lang || 'id',
    mode: config.mode || 'pronunciation',
    selector: config.selector || 'word',
    accent: config.accent || 'american',
    summarizer_type: config.summarizer_type || 'key-points',
    summarizer_length: config.summarizer_length || 'short',
  };
};

// Helper: Build storage data from form values
export const buildStorageData = (data: z.infer<typeof validation>): IConfiguration => {
  return {
    source_lang: data.source_lang,
    target_lang: data.target_lang,
    mode: data.mode,
    selector: data.selector,
    accent: data.accent,
    ...(data.summarizer_type && { summarizer_type: data.summarizer_type }),
    ...(data.summarizer_length && { summarizer_length: data.summarizer_length }),
  };
};

// Helper: options configuration language
type Options = {
  labelKey: string;
  value: string;
}

type LanguageOptions = {
  targetLangOptions: Options[];
  sourceLangOptions: Options[];
};

export const getLanguageOptions = (agent: string, mode: string): LanguageOptions => {
  // Translation mode uses the same options for both agents
  if (mode === 'translation') {
    return {
      targetLangOptions: targetLangOptionsBase,
      sourceLangOptions: targetLangOptionsBase
    }
  }

  // Non-translation modes differ by agent
  if (agent === 'chrome') {
    return {
      targetLangOptions: targetLangPromptAPIOptionsBase,
      sourceLangOptions: sourceLangPromptAPIOptionsBase,
    }
  }

  // Gemini agent
  return {
    targetLangOptions: targetLangOptionsBase,
    sourceLangOptions: sourceLangOptionsBase,
  }
}