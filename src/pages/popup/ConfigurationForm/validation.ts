import * as z from 'zod';

export const validation = z
  .object({
    source_lang: z.string().min(1, 'Source language must be filled.'),
    target_lang: z.string().min(1, 'Target language must be filled.'),
    mode: z.enum(['pronunciation', 'grammar', 'summarizer', 'translation']),
    selector: z.enum(['word', 'sentence', 'context']),
    accent: z.enum(['british', 'american']),
    summarizer_type: z.union([z.enum(['headline', 'key-points', 'teaser', 'tldr']), z.undefined()]),
    summarizer_length: z.union([z.enum(['short', 'medium', 'long']), z.undefined()]),
  })
  .refine(data => data.mode !== 'summarizer' || data.summarizer_type !== undefined, {
    message: 'Summarizer type is required when mode is summarizer',
    path: ['summarizer_type'],
  })
  .refine(data => data.mode !== 'summarizer' || data.summarizer_length !== undefined, {
    message: 'Summarizer length is required when mode is summarizer',
    path: ['summarizer_length'],
  });
