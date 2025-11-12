/**
 * Creates a prompt for the AI to analyze a single word.
 * @param {string} word - The word to analyze.
 * @param {string} targetLanguage - The target language for translation (e.g., "Japanese", "Spanish").
 * @returns {string} The formatted prompt.
 */
export const createPronunciationPrompt = (word: string, targetLanguage: string): string => {
  return `
You are an expert linguistic assistant specializing in pedagogy for English language learners.
Your task is to analyze the given English word.
You MUST output only a valid JSON object that strictly adheres to the provided schema.

Key analysis instructions:
1.  **Pronunciation:** Provide both UK and US pronunciations using the Cambridge-style readable format (e.g., /ˈsʌm.ə.raɪz/). Include stress marks (ˈ) and syllable dots (.).
2.  **SoundBySound:** Break down both UK and US pronunciations into their core phonemes, providing a simple example word for each sound (e.g., symbol: /l/, exampleWord: "look").
3.  **Definition:** Write a very simple, concise English definition (1-2 sentences) suitable for an A2/B1 learner.
4.  **Translation:** Translate the word into the user's target language: **${targetLanguage}**.
5.  **Classification:** Determine the correct CEFR level (A1-C2) and the word's grammatical type (e.g., "noun", "verb", "adjective").

Word to analyze:
"${word}"
`;
};
