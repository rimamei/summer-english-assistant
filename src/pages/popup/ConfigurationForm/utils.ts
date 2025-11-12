import type { IConfiguration } from '@/type';
import type z from 'zod';
import type { validation } from './validation';

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
