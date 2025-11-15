import type { IPreferences } from '@/type';
import { getLocalStorage } from '@/utils/storage';
import { GoogleGenAI, type GenerateContentParameters } from '@google/genai';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_TOKEN;

const getApiKey = async (): Promise<string> => {
  const result: IPreferences | null = await getLocalStorage('preferences');
  return result?.apiKey || GEMINI_API_KEY;
};

export const generateStream = async (
  { model, contents, config }: GenerateContentParameters,
  onChunk?: (text: string) => void
) => {
  try {
    const apiKey: string = await getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContentStream({
      model,
      contents,
      config,
    });

    let resultText = '';
    for await (const chunk of response) {
      const chunkText = chunk.text || '';
      resultText += chunkText;

      if (onChunk) {
        onChunk(resultText);
      }
    }

    return resultText;
  } catch (err) {
    const errorMessage =
      err instanceof Error && err?.message
        ? JSON.parse(err.message)?.error?.message?.error
        : 'Failed to generate';
    throw new Error(errorMessage);
  }
};
