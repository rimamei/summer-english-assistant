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

"pronunciation":
Include both "uk" and "us" fields. 
Each must show the Cambridge-style readable pronunciation with dots and stress marks, for example: /ˈsʌm.ə.raɪz/.
Do NOT include IPA symbols separately — only the readable form.
Use accurate stress placement and syllable dots (·) just like in the Cambridge Dictionary.

"definition": short and simple English meaning (1–2 sentences).

"translation": translation of the word in the user’s target language.

"level": CEFR level (A1, A2, B1, B2, C1, or C2).

"soundBySound":
Include both "uk" and "us" as arrays of phoneme components.
Each phoneme component must include:
- "symbol": phonetic symbol (e.g., /l/)
- "exampleWord": example English word using that sound (e.g., "look")
The sound order must follow the actual pronunciation order.

"synonyms": 1–3 similar words or phrases (leave empty for sentences).

"type": grammatical type of the word (e.g., noun, verb 1, adjective).

Keep the JSON concise, accurate, and easy for English learners to understand.

Word to analyze:
"${word}"
`;
};


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
        
        if (!session) {
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