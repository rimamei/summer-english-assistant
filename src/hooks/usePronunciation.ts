import { useState, useCallback, useRef } from 'react';
import { usePrompt } from './usePrompt';
import { createPronunciationPrompt } from '@/prompt/pronunciation';
import { pronunciationSchema } from '@/prompt/pronunciation/schema';

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

const normalizeLanguage = (lang: string): string => {
  const supportedLanguages = ['en', 'ja', 'es'];
  if (!lang || !lang.trim()) return 'en';
  const cleanLang = lang.trim().toLowerCase();
  return supportedLanguages.includes(cleanLang) ? cleanLang : 'en';
};

export const usePronunciation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { handlePrompt, destroySession, promptStatus, isPromptSupported, initPromptSession } =
    usePrompt();

  const analyzeWord = useCallback(
    async ({ word, sourceLanguage, targetLanguage }: AnalyzeWordParams
    ): Promise<PronunciationAnalysis> => {
      
      // Abort previous request if still running
      if (abortControllerRef.current) {
        console.log('Aborting previous analysis');
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setIsLoading(true);

      try {
        console.log('Starting analysis for word:', word);
        
        // Get the prompt text
        const prompt = createPronunciationPrompt(word, targetLanguage);
        console.log('Prompt created');

        // Validate languages
        const validSourceLanguage = normalizeLanguage(sourceLanguage);
        const validTargetLanguage = normalizeLanguage(targetLanguage);
        console.log('Languages validated:', { validSourceLanguage, validTargetLanguage });

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
        };

        // Define prompt operation options
        const operationOptions: PromptOperationOptions = {
          responseConstraint: pronunciationSchema,
        };

        console.log('Calling handlePrompt...');
        
        // Call the generic handlePrompt function
        const resultString = await handlePrompt(
          prompt,
          operationOptions,
          createOptions,
        );

        console.log('Got result:', resultString);

        if (signal.aborted) {
          throw new DOMException('Analysis aborted', 'AbortError');
        }

        // Parse and return the successful result
        const parsedResult: PronunciationAnalysis = JSON.parse(resultString);
        console.log('Parsed result:', parsedResult);
        
        setIsLoading(false);
        return parsedResult;

      } catch (error: unknown) {
        console.error('Analysis error:', error);
        setIsLoading(false);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Don't destroy session on abort
        if (error instanceof Error && error.name !== 'AbortError') {
          console.log('Destroying session due to error');
          destroySession();
        }

        throw new Error(`Failed to analyze pronunciation: ${errorMessage}`);
      } finally {
        if (abortControllerRef.current?.signal === signal) {
          abortControllerRef.current = null;
        }
      }
    },
    [handlePrompt, destroySession],
  );

  return {
    analyzeWord,
    isLoading,
    promptStatus,
    isPromptSupported,
    initPromptSession
  };
};