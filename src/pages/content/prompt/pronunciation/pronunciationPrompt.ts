import { pronunciationSchema } from "./pronunciationSchema";

/**
 * Creates a prompt for the AI to analyze a single word.
 * @param {string} word - The word to analyze.
 * @returns {string} The formatted prompt.
 */
export const createPronunciationPrompt = (word: string): string => {
    return `
Analyze the given English word and provide pronunciation, meaning, and grammar details.
Output only valid JSON with the following fields:
"text", "pronunciation", "definition", "translation", "level", "soundBySound", "synonyms", and "type".

Rules

"text": the input word or sentence.

"pronunciation": include both UK and US IPA transcriptions if available.

"definition": short and simple English meaning (1–2 sentences).

"translation": translation in the user’s target language.

"level": CEFR level (A1, A2, B1, B2, C1, or C2).

"soundBySound": an array of phoneme components in this structure:

"symbol": phonetic symbol (e.g., /l/)

"exampleWord": word using that sound (e.g., “look”)

"synonyms": 1–3 words or phrases with similar meanings (empty for sentences).

"type":

For words → grammatical type (e.g., verb 1, noun, adjective).

Keep outputs concise, clear, and educational — suitable for English learners.

Word to analyze:
"${word}"
  `;
}

/**
 * Analyzes a single word using the Prompt API.
 * @param {LanguageModelSession} session - The active AI session.
 * @param {string} word - The word to analyze.
 * @returns {Promise<object>} A promise that resolves to the parsed JSON analysis.
 */

let session: LanguageModelSession | null;

export const analyzeWord = async (sourceLanguage: string, targetLanguage: string, word: string) => {
    try {
        const prompt = createPronunciationPrompt(word);

        // Supported languages for AI prompt
        const supportedLanguages = ['en', 'ja', 'es'];

        // Validate and normalize language codes
        const normalizeLanguage = (lang: string): string => {
            if (!lang || !lang.trim()) return 'en';
            const cleanLang = lang.trim().toLowerCase();
            return supportedLanguages.includes(cleanLang) ? cleanLang : 'en';
        };

        const validSourceLanguage = normalizeLanguage(sourceLanguage);
        const validTargetLanguage = normalizeLanguage(targetLanguage);

        const defaults = await window.LanguageModel.params();

        const params = {
            initialPrompts: [
                { role: 'system', content: 'You are a helpful and friendly assistant.' }
            ],
            temperature: defaults.defaultTemperature,
            topK: defaults.defaultTopK,
            expectedInputs: [
                { type: "text", languages: [validSourceLanguage /* system prompt */, validSourceLanguage /* user prompt */] }
            ],
            expectedOutputs: [
                { type: "text", languages: [validTargetLanguage] }
            ]
        };

        
        if (!session) {
            session = await window.LanguageModel.create(params);
        }

        // Call the prompt() method with our schema
        const resultString = await session.prompt(prompt, {
            responseConstraint: pronunciationSchema
        });

        // The result is a string, so we need to parse it
        const parsedResult = JSON.parse(resultString);

        return parsedResult;

    } catch (error: unknown) {
        resetSession();
        return {
            isCorrect: false,
            correctedSentence: word,
            explanation: `Failed to define: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

const resetSession = async () => {
    if (session) {
        await session.destroy();
    }

    session = null;
}