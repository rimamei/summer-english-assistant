import { grammarSchema } from "./grammarSchema";

/**
 * Creates a prompt for the AI to analyze a single sentence.
 * @param {string} sentence - The sentence to analyze.
 * @returns {string} The formatted prompt.
 */
export const createGrammarPrompt = (sentence: string): string => {
    return `
Analyze the given sentence and explain the grammar it uses.
Output only valid JSON with: "isCorrect", "correctedSentence", "explanation", and "errors".

Rules:

Do not just say it is correct or incorrect.

Always explain the grammar concepts used (e.g., verb tense, structure, punctuation, conjunctions).

Bold examples of grammar elements (e.g., runs, and, to meet).

If the sentence has no errors:

"isCorrect": true

"correctedSentence" = original sentence

"explanation" = 1–2 short sentences explaining what grammar rules are used and how (e.g., “The sentence uses the simple present tense (Join, meet, ask) with parallel structure connected by conjunctions.”)

If the sentence has errors:

"isCorrect": false

"correctedSentence" = corrected version

"explanation" = short explanation of the grammar rules and how they should be applied

Keep the "explanation" simple, educational, and friendly for learners.

Sentence to analyze:
"${sentence}"
  `;
}

/**
 * Analyzes a single sentence using the Prompt API.
 * @param {LanguageModelSession} session - The active AI session.
 * @param {string} sentence - The sentence to analyze.
 * @returns {Promise<object>} A promise that resolves to the parsed JSON analysis.
 */

let session: LanguageModelSession | null;

export const analyzeSentence = async (sourceLanguage: string, targetLanguage: string, sentence: string) => {
    try {
        const prompt = createGrammarPrompt(sentence);

        // Validate language tags and provide defaults
        const validSourceLanguage = sourceLanguage && sourceLanguage.trim() ? sourceLanguage.trim() : 'en';
        const validTargetLanguage = targetLanguage && targetLanguage.trim() ? targetLanguage.trim() : 'en';

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
            responseConstraint: grammarSchema
        });

        // The result is a string, so we need to parse it
        const parsedResult = JSON.parse(resultString);

        return parsedResult;

    } catch (error: unknown) {
        resetSession();
        return {
            isCorrect: false,
            correctedSentence: sentence,
            explanation: `Failed to analyze sentence: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

const resetSession = async () => {
    if (session) {
        await session.destroy();
    }

    session = null;
}