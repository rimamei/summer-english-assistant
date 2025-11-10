/**
 * Creates a prompt for the AI to analyze a single sentence.
 * @param {string} sentence - The sentence to analyze.
 * @returns {string} The formatted prompt.
 */
export const createGrammarPrompt = (sentence: string, sourceLanguage: string, targetLanguage: string): string => {
    return `You are an English grammar teacher. Analyze this sentence clearly and concisely.

Sentence: "${sentence}"
Source language: ${sourceLanguage}
Respond in: ${targetLanguage}

For CORRECT sentences:
- Identify 2-3 key grammar points (not 5!)
- For each point: mention the grammar term in **bold**, then explain briefly in 15-20 words
- Focus on the most interesting or educational aspects
- Put each point on a new line
- Be specific to THIS sentence

For INCORRECT sentences:
- First line: "**Corrected:** [corrected sentence]"
- Then 1-2 bullet points explaining the main error(s)
- Be clear and encouraging
- Keep explanations to 20 words or less

EXAMPLE (correct sentence):
"The technology supports a helpful transition to remote work."

- **Present simple tense** ("supports") expresses a general capability or fact about the technology.
- **Prepositional phrase** "to remote work" specifies where the transition leads.

EXAMPLE (incorrect sentence):
"He go to school yesterday."

**Corrected:** "He went to school yesterday."

- **Past tense needed**: "yesterday" requires past form "went", not present "go".

Keep it clear, brief, and helpful.`;
};