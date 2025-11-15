import type { IGrammarData } from '@/type';
import type { TranslationKey } from '@/lib/i18n';

/**
 * Builds display content from parsed grammar data
 * @param grammarData - Parsed grammar analysis data
 * @param t - Translation function
 * @returns Formatted markdown string for display
 */
export const buildGrammarDisplayContent = (
  grammarData: IGrammarData | null,
  t: (key: TranslationKey, variables?: Record<string, string | number>) => string
): string => {
  if (!grammarData) return '';

  let content = '';

  // Show corrections if the sentence is incorrect
  if (!grammarData.isCorrect && grammarData.corrections) {
    const correction = t('correction');
    content += `**${
      correction.charAt(0).toUpperCase() + correction.slice(1)
    }:**\n ${grammarData.corrections}\n\n`;
  }

  if (grammarData.details) {
    const explanation = t('explanation');
    content += `**${explanation.charAt(0).toUpperCase() + explanation.slice(1)}:**\n`;
    const details = grammarData.details
      .replace(/\\n/g, '\n') // Replace literal \n with actual newlines
      .replace(/\n\n+/g, '\n\n'); // Normalize multiple newlines
    content += details;
  }

  return content;
};
