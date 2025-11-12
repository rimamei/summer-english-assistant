/**
 * Creates a prompt for the AI to analyze a single sentence.
 * @param {string} sentence - The sentence to analyze.
 * @returns {string} The formatted prompt.
 */
export const createGrammarPrompt = (sentence: string): string => {
  return `Analyze this sentence for grammar and provide brief, educational feedback.

Sentence: "${sentence}"

For correct sentences:
- List 2-3 KEY grammar points ONLY (e.g., "Uses present perfect tense", "Contains a relative clause")
- Each point should be ONE short sentence (max 10 words)
- Use bold for grammar terms
- IMPORTANT: Put each bullet point on a NEW LINE (use \\n between points)

For incorrect sentences:
- Provide the corrected version
- List 1-2 brief points explaining what was wrong
- Be encouraging
- IMPORTANT: Put each bullet point on a NEW LINE (use \\n between points)

Keep it SHORT and focused - users want quick, digestible feedback, not lengthy explanations.

FORMAT EXAMPLE:
- First point here
- Second point here
- Third point here`;
};
