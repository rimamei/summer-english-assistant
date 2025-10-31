import { useState, useCallback, useRef } from 'react';
import { usePrompt } from './usePrompt';
import { createPronunciationPrompt } from '@/prompt/pronunciation';
import { pronunciationSchema } from '@/prompt/pronunciation/schema';
import { normalizeLanguage } from '@/utils/normalizeLanguage';

export interface PronunciationAnalysis {
  text: string;
  pronunciation: { uk: string; us: string };
  definition: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  soundBySound: {
    uk: { symbol: string; exampleWord: string }[];
    us: { symbol: string; exampleWord: string }[];
  };
  synonyms: string[];
  type: string;
}

interface AnalyzeWordParams {
  word: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export const usePronunciation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { handlePrompt, promptStatus, isPromptSupported, } =
    usePrompt();

  const analyzeWord = useCallback(
    async ({ word, sourceLanguage, targetLanguage }: AnalyzeWordParams
    ): Promise<PronunciationAnalysis> => {

      // Abort previous request if still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setIsLoading(true);

      try {
        // Get the prompt text
        const prompt = createPronunciationPrompt(word, targetLanguage);


        // Validate languages
        const validSourceLanguage = normalizeLanguage(sourceLanguage);
        const validTargetLanguage = normalizeLanguage(targetLanguage);

        // Get default params
        const defaults = await window.LanguageModel.params();
        console.log('Got default params:', defaults);

        if (signal.aborted) {
          throw new DOMException('Analysis aborted', 'AbortError');
        }

        // Define session creation options
        const createOptions: LanguageModelCreateOptions = {
          initialPrompts: [
            {
              role: 'system',
              content: 'You are a helpful and friendly assistant.',
            },
          ],
          temperature: defaults.defaultTemperature,
          topK: defaults.defaultTopK,
          expectedInputs: [
            { type: "text", languages: [validSourceLanguage, validSourceLanguage] }
          ],
          expectedOutputs: [
            { type: "text", languages: [validTargetLanguage] }
          ]
        };

        // Define prompt operation options
        const operationOptions: PromptOperationOptions = {
          responseConstraint: pronunciationSchema,
        };

        // Call the generic handlePrompt function
        const resultString = await handlePrompt(
          prompt,
          operationOptions,
          createOptions,
        );

        if (signal.aborted) {
          throw new DOMException('Analysis aborted', 'AbortError');
        }

        // Parse and return the successful result
        const parsedResult: PronunciationAnalysis = JSON.parse(resultString!);

        setIsLoading(false);
        return parsedResult;

      } catch (error: unknown) {
        setIsLoading(false);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        throw new Error(`Failed to analyze pronunciation: ${errorMessage}`);
      } finally {
        if (abortControllerRef.current?.signal === signal) {
          abortControllerRef.current = null;
        }
      }
    },
    [handlePrompt],
  );

  return {
    analyzeWord,
    isLoading,
    promptStatus,
    isPromptSupported,
  };
};