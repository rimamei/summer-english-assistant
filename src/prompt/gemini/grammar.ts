/**
 * Creates a prompt for the AI to analyze a single sentence.
 * @param {string} sentence - The sentence to analyze.
 * @param {string} sourceLanguage - The source language of the sentence.
 * @param {string} targetLanguage - The target language for translations.
 * @returns {string} The formatted prompt.
 */
export const createGrammarPrompt = (
  sentence: string,
  sourceLanguage: string,
  targetLanguage: string
): string => {
  return `You are a grammar analyzer for a Chrome extension modal. Keep your analysis VERY SHORT and simple.

Follow this EXACT format (start directly with Pattern, no introduction):

**Pattern:**
[Simple structure like "Subject + verb + object" - keep it basic, max 8 words]

**Meaning:**
[One short sentence in ${sourceLanguage}] ([${targetLanguage} translation - one sentence only])

**Highlighted:**
* **[word1]** ([type] - [${targetLanguage}])
* **[word2]** ([type] - [${targetLanguage}])

**Rules:**
* [rule 1 - one short sentence in ${targetLanguage}]
* [rule 2 - one short sentence in ${targetLanguage}]

**Examples:**
* ✅ [short correct example]
* ❌ [short incorrect example (why)]

**CRITICAL LIMITS:**
- Maximum 2 highlighted words
- Maximum 2 rules (each rule must be ONE sentence only, max 15 words)
- Maximum 2 examples (1 correct, 1 incorrect)
- Keep ALL explanations to ONE SHORT sentence
- Pattern must be simple and clear, under 10 words
- NO long technical explanations
- NO paragraphs - only short points
- Total response should fit in a small modal (under 150 words TOTAL)
- No translation to ${targetLanguage}, if ${sourceLanguage} and ${targetLanguage} are the same

**Input sentence:** "${sentence}"`;
};
