import type { SummarizerConfig } from '@/hooks/useSummarizer';
import type { ContentListUnion } from '@google/genai';

export const createScreenshotContent = (
  screenshotData: string | null,
  prompt: string
): ContentListUnion => {
  const base64Data = screenshotData?.split(',')[1];
  const mimeType = screenshotData?.split(';')[0].split(':')[1];

  return [
    {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    },
    { text: prompt },
  ];
};

// Helper: Create Gemini content for text mode
export const createTextContent = (prompt: string): ContentListUnion => [
  {
    role: 'user',
    parts: [{ text: prompt }],
  },
];

// Helper: Create Chrome summarizer config
export const createSummarizerChromeConfig = (
  sourceLanguage: string | undefined,
  targetLanguage: string | undefined,
  length: SummarizerConfig['length']
): SummarizerConfig => {
  return {
    expectedInputLanguages: [sourceLanguage || 'en'],
    expectedContextLanguages: [targetLanguage || 'en'],
    format: 'markdown',
    length,
    outputLanguage: targetLanguage || 'en',
    type: 'key-points',
  };
};
