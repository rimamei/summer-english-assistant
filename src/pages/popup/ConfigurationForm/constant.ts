import type { IConfiguration } from '@/type';

export const initialValues: IConfiguration = {
  source_lang: 'en',
  target_lang: 'id',
  mode: 'pronunciation',
  selector: 'word',
  accent: 'american',
  summarizer_type: 'key-points',
  summarizer_length: 'short',
};
