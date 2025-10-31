/**
 * Creates a prompt for the AI to analyze a single sentence.
 * @param {string} sentence - The sentence to analyze.
 * @returns {string} The formatted prompt.
 */
export const createGrammarPrompt = (sentence: string): string => {
    return `Analyze this sentence for grammar and provide educational feedback.

Sentence: "${sentence}"

For correct sentences:
- Explain the grammar structures used (tenses, clauses, punctuation, etc.)
- Keep explanations concise (1-2 sentences)
- Use bold for grammar terms and examples

For incorrect sentences:
- Provide the corrected version
- Explain what was wrong and the correct grammar rule
- Be encouraging and educational

Focus on practical learning, not just correctness.`;
};