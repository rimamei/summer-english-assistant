/**
 * Creates a prompt for the AI to translate text.
 * @param {string} text - The text to translate.
 * @param {string} sourceLanguage - The source language.
 * @param {string} targetLanguage - The target language.
 * @returns {string} The formatted prompt.
 */
export const createTranslationPrompt = (text: string, sourceLanguage: string, targetLanguage: string): string => {
    return `You are an expert translator with deep knowledge of multiple languages and cultural nuances. Translate the following text accurately and naturally.

Text to translate: "${text}"
Source language: ${sourceLanguage}
Target language: ${targetLanguage}

IMPORTANT INSTRUCTIONS:

1. **Accuracy**: Translate the exact meaning of the source text without adding or omitting information
2. **Natural fluency**: Use natural, idiomatic expressions in the target language - avoid word-for-word translations
3. **Context awareness**: Consider the context and tone (formal, informal, technical, casual, etc.) and maintain it
4. **Cultural adaptation**: Adapt idioms, expressions, and cultural references appropriately for the target language
5. **Preserve formatting**: Maintain any special formatting, line breaks, or emphasis from the original text
6. **Grammar correctness**: Ensure the translation follows proper grammar rules of the target language
7. **Consistency**: Use consistent terminology throughout the translation

IMPORTANT: Provide ONLY the translated text without any explanations, notes, or additional commentary. Do not include phrases like "Here is the translation:" or any meta-text.

If the text is already in the target language or appears to be a proper noun/brand name that shouldn't be translated, keep it as is.`;
};