/**
 * Summarizer types
 */
export type SummarizerType = 'Headline' | 'Keypoints' | 'Teaser' | 'TLDR';

/**
 * Summarizer length options
 */
export type SummarizerLength = 'short' | 'medium' | 'long';

/**
 * Length guidelines for different summarizer types
 */
const LENGTH_GUIDELINES = {
  Headline: {
    short: '5-8 words',
    medium: '8-12 words',
    long: '12-15 words'
  },
  Keypoints: {
    short: '3-4 bullet points, each 10-15 words',
    medium: '5-7 bullet points, each 15-20 words',
    long: '8-10 bullet points, each 20-30 words'
  },
  Teaser: {
    short: '1-2 sentences, 20-30 words total',
    medium: '2-3 sentences, 40-60 words total',
    long: '3-4 sentences, 70-100 words total'
  },
  TLDR: {
    short: '1-2 sentences, 15-25 words',
    medium: '2-3 sentences, 30-50 words',
    long: '3-5 sentences, 60-80 words'
  }
};

/**
 * Creates a prompt for the AI to summarize text based on type and length.
 * @param {string} text - The text to summarize.
 * @param {SummarizerType} type - The type of summary to generate.
 * @param {SummarizerLength} length - The desired length of the summary.
 * @param {string} targetLanguage - The language to respond in.
 * @returns {string} The formatted prompt.
 */
export const createSummarizerPrompt = (
  text: string,
  type: SummarizerType,
  length: SummarizerLength,
  targetLanguage: string
): string => {
  const lengthGuideline = LENGTH_GUIDELINES[type][length];

  const typeInstructions = {
    Headline: `Create a compelling HEADLINE that captures the main point of the text.
- Make it attention-grabbing and informative
- Use active voice when possible
- Target length: ${lengthGuideline}
- Format: Single line, no quotation marks`,

    Keypoints: `Extract the KEY POINTS from the text in bullet point format.
- Identify the most important ideas, facts, or takeaways
- Start each point with a dash (-)
- Make each point clear and self-contained
- Target: ${lengthGuideline}
- Put each bullet point on a NEW LINE (use \\n between points)
- Order points by importance or logical flow`,

    Teaser: `Write an engaging TEASER that makes readers want to read the full text.
- Hook the reader with intrigue or curiosity
- Highlight what's interesting, surprising, or valuable
- Don't give away everythingleave them wanting more
- Target length: ${lengthGuideline}
- Format: Flowing prose, conversational tone`,

    TLDR: `Provide a TLDR (Too Long; Didn't Read) summary.
- Condense the main message into its essence
- Include the most critical information only
- Be direct and straightforward
- Target length: ${lengthGuideline}
- Format: Clear, concise sentences`
  };

  return `You are an expert content summarizer. Your task is to create a ${type} summary of the provided text.

TEXT TO SUMMARIZE:
"""
${text}
"""

SUMMARY TYPE: ${type}
LENGTH: ${length}
Respond in: ${targetLanguage}

INSTRUCTIONS:
${typeInstructions[type]}

IMPORTANT GUIDELINES:
- Stay faithful to the original contentdon't add information that isn't there
- Use clear, accessible language
- Focus on what matters most to the reader
- Maintain the tone appropriate for the summary type
- Response should ONLY contain the summary, no extra commentary or labels

${type === 'Keypoints' ? '\nRemember: Each bullet point should start with a dash (-) and be on a NEW LINE.' : ''}

Generate the ${type.toLowerCase()} now:`;
};
