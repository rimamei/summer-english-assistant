/**
 * Creates a prompt for analyzing pronunciation of English words or sentences
 * @param {string} text - The word or sentence to analyze
 * @param {string} sourceLanguage - The source language code
 * @param {string} targetLanguage - The target language code for definition
 * @returns {string} The formatted prompt
 */
export const createPronunciationPrompt = (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): string => {
  return `You are an expert English pronunciation analyzer. Your task is to provide comprehensive pronunciation information for the given English text.

TEXT TO ANALYZE:
"""
${text}
"""

Source Language: ${sourceLanguage}
Target Language for Definition: ${targetLanguage}

INSTRUCTIONS:
1. **Text**: Return the input text as provided.

2. **Pronunciation**: Provide phonetic transcription using International Phonetic Alphabet (IPA) symbols:
   - UK: British English pronunciation (Cambridge-style, e.g., /lɜːn/)
   - US: American English pronunciation (Cambridge-style, e.g., /lɝːn/)

3. **Definition**: Provide a short, clear definition in ${targetLanguage === sourceLanguage ? 'English' : targetLanguage}. Keep it simple and concise (1-2 sentences).

4. **Level**: Determine the CEFR level (A1, A2, B1, B2, C1, or C2) based on word difficulty.

5. **Sound-by-Sound**: Break down the pronunciation into individual phonemes with example words:
   - For each phoneme, provide the IPA symbol and an example word containing that sound
   - Do this for both UK and US pronunciations
   - Example: {"symbol": "/l/", "exampleWord": "light"}

6. **Synonyms**: Provide 1-3 common synonyms. If the input is a full sentence, leave this array empty.

7. **Type**: Identify the grammatical type:
   - For single words: noun, verb, adjective, adverb, etc.
   - For sentences: "sentence"

IMPORTANT GUIDELINES:
- Use accurate IPA symbols following Cambridge Dictionary style
- Ensure phonetic transcriptions are enclosed in forward slashes (e.g., /wɜːd/)
- For multi-word inputs or sentences, mark type as "sentence" and leave synonyms empty
- Be precise with CEFR levels based on vocabulary complexity
- Provide practical, commonly-used example words for sound-by-sound breakdown

Generate the pronunciation analysis now:`;
};
