import { useState, useCallback } from 'react';
import { usePrompt } from './usePrompt';
import { createGrammarPrompt } from '@/prompt/grammar';
import { grammarSchema } from '@/prompt/grammar/schema';
import { normalizeLanguage } from '@/utils/normalizeLanguage';
import type { IGrammarData } from '@/type';

interface AnalyzeSentenceParams {
  sentence: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export const useGrammar = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { handlePrompt, promptStatus, isPromptSupported } =
    usePrompt();

  const analyzeSentence = useCallback(
    async ({ sentence, sourceLanguage, targetLanguage }: AnalyzeSentenceParams): Promise<IGrammarData | null> => {

      setIsLoading(true);

      try {
        // Get the prompt text
        const prompt = createGrammarPrompt(sentence);

        // Get default params
        const defaults = await window.LanguageModel.params();
        
        // Validate languages
        const validSourceLanguage = normalizeLanguage(sourceLanguage);
        const validTargetLanguage = normalizeLanguage(targetLanguage);

        // Define session creation options
        const createOptions: LanguageModelCreateOptions = {
          initialPrompts: [
            {
              role: 'system',
              content: 'You are a helpful grammar teacher who provides clear, educational explanations.',
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
          responseConstraint: grammarSchema,
        };

        // Call the generic handlePrompt function
        const resultString = await handlePrompt(
          prompt,
          operationOptions,
          createOptions,
        );

        // Parse and return the successful result
        const parsedResult: IGrammarData = JSON.parse(resultString!);

        setIsLoading(false);
        return parsedResult;

      } catch (error: unknown) {
        setIsLoading(false);

        if (error instanceof Error && error.name === 'AbortError') {
          return null;
        }

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        throw new Error(`Failed to analyze grammar: ${errorMessage}`);
      }
    },
    [handlePrompt],
  );

  return {
    analyzeSentence,
    isLoading,
    promptStatus,
    isPromptSupported
  };
};