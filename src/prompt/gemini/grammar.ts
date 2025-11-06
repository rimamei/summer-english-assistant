/**
 * Creates a prompt for the AI to analyze a single sentence.
 * @param {string} sentence - The sentence to analyze.
 * @returns {string} The formatted prompt.
 */
export const createGrammarPrompt = (sentence: string, sourceLanguage: string, targetLanguage: string): string => {
    return `You are an expert English grammar teacher. Analyze this sentence and provide comprehensive, educational explanations to help the user deeply understand the grammar structures used.

Sentence: "${sentence}"
Source language: ${sourceLanguage}
Respond in: ${targetLanguage}

IMPORTANT INSTRUCTIONS:

For CORRECT sentences:
1. Identify 3-5 key grammar structures, patterns, or linguistic features
2. For EACH point:
   - Start with a bullet point (-)
   - Mention the grammar term in **bold**
   - Explain its function and why it's used in this context
   - Include the specific word(s) from the sentence in quotes if helpful
   - Aim for 20-30 words per point for clarity
3. Cover diverse aspects: tenses, sentence structure, word classes, clauses, phrases, punctuation, or stylistic choices
4. Put each bullet point on a NEW LINE (use \\n between points)
5. Be specific to THIS sentence - avoid generic statements
6. Prioritize the most educational insights

For INCORRECT sentences:
1. First line: "**Corrected version:** [corrected sentence]"
2. Then provide 2-4 bullet points explaining:
   - What specific error was made (mention the grammar rule)
   - Why it's incorrect
   - What the correct form should be
   - Optional: Common reasons this mistake happens
3. Be encouraging and constructive
4. Put each bullet point on a NEW LINE (use \\n between points)

EXAMPLE FORMAT FOR CORRECT SENTENCE:
"The technology supports a helpful transition to remote work."

- Uses **present simple tense** ("supports") to express a general fact or capability about the subject.
- Contains a **noun phrase** "a helpful transition" where "helpful" is an **adjective** modifying the noun "transition".
- The **article** "a" correctly precedes the singular countable noun "transition".
- Includes a **prepositional phrase** "to remote work" that specifies the destination or purpose of the transition.
- Features a **subject-verb-object** sentence structure with "technology" as subject, "supports" as verb, and "a helpful transition" as the direct object.

EXAMPLE FORMAT FOR INCORRECT SENTENCE:
"He go to school yesterday."

**Corrected version:** "He went to school yesterday."

- **Past tense error**: Used "go" (present) instead of "went" (past) despite the time marker "yesterday".
- The **time adverb** "yesterday" signals past time, requiring the **past simple tense** of the irregular verb "go".
- **Subject-verb agreement**: With third-person singular subjects like "he", verbs must match the correct tense form.

Focus on providing INSIGHTFUL, EDUCATIONAL analysis that helps users truly understand English grammar. Be specific, clear, and thorough.`;
};