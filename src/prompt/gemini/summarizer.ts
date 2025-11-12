/**
 * Summarizer types
 */
export type SummarizerType = 'Headline' | 'Keypoints' | 'Teaser' | 'TLDR';

/**
 * Summarizer length options
 */
export type SummarizerLength = 'short' | 'medium' | 'long';

/**
 * Guideline types for different summarizer types
 */
type HeadlineGuideline = {
  words: number;
  instruction: string;
};

type KeypointsGuideline = {
  count: number;
  wordsPerPoint: number;
  instruction: string;
};

type TeaserGuideline = {
  sentences: number;
  words: number;
  instruction: string;
};

type TLDRGuideline = {
  sentences: number;
  words: number;
  instruction: string;
};

/**
 * Length guidelines for different summarizer types
 */
const LENGTH_GUIDELINES = {
  Headline: {
    short: {
      words: 8,
      instruction: 'Maximum 8 words. Not 9, not 10. Exactly 8 or fewer.',
    } as HeadlineGuideline,
    medium: {
      words: 12,
      instruction: 'Maximum 12 words. Not 13, not 14. Exactly 12 or fewer.',
    } as HeadlineGuideline,
    long: {
      words: 15,
      instruction: 'Maximum 15 words. Not 16, not 17. Exactly 15 or fewer.',
    } as HeadlineGuideline,
  },
  Keypoints: {
    short: {
      count: 3,
      wordsPerPoint: 15,
      instruction: 'Exactly 3 bullet points. Each point maximum 15 words.',
    } as KeypointsGuideline,
    medium: {
      count: 5,
      wordsPerPoint: 20,
      instruction: 'Exactly 5 bullet points. Each point maximum 20 words.',
    } as KeypointsGuideline,
    long: {
      count: 7,
      wordsPerPoint: 25,
      instruction: 'Exactly 7 bullet points. Each point maximum 25 words.',
    } as KeypointsGuideline,
  },
  Teaser: {
    short: {
      sentences: 2,
      words: 30,
      instruction: 'Maximum 2 sentences. Maximum 30 words total.',
    } as TeaserGuideline,
    medium: {
      sentences: 3,
      words: 60,
      instruction: 'Maximum 3 sentences. Maximum 60 words total.',
    } as TeaserGuideline,
    long: {
      sentences: 4,
      words: 100,
      instruction: 'Maximum 4 sentences. Maximum 100 words total.',
    } as TeaserGuideline,
  },
  TLDR: {
    short: {
      sentences: 1,
      words: 25,
      instruction: 'Exactly 1 sentence. Maximum 25 words.',
    } as TLDRGuideline,
    medium: {
      sentences: 2,
      words: 50,
      instruction: 'Exactly 2 sentences. Maximum 50 words total.',
    } as TLDRGuideline,
    long: {
      sentences: 3,
      words: 80,
      instruction: 'Exactly 3 sentences. Maximum 80 words total.',
    } as TLDRGuideline,
  },
} as const;

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
  // Get type-specific instruction based on type
  let typeInstruction: string;

  switch (type) {
    case 'Headline': {
      const guideline = LENGTH_GUIDELINES.Headline[length];
      typeInstruction = `Create a concise headline that captures the main idea.
LENGTH CONSTRAINT: ${guideline.instruction}
FORMAT: Single line, no quotation marks, no period at the end.
STOP writing after ${guideline.words} words maximum.`;
      break;
    }

    case 'Keypoints': {
      const guideline = LENGTH_GUIDELINES.Keypoints[length];
      typeInstruction = `Extract key information as bullet points.
LENGTH CONSTRAINT: ${guideline.instruction}
FORMAT:
- Start each point with "- " (dash and space)
- Put each point on a separate line
- Write EXACTLY ${guideline.count} points, no more, no less
- Each point must be ${guideline.wordsPerPoint} words or fewer
STOP after writing ${guideline.count} bullet points.`;
      break;
    }

    case 'Teaser': {
      const guideline = LENGTH_GUIDELINES.Teaser[length];
      typeInstruction = `Write an engaging preview that creates curiosity.
LENGTH CONSTRAINT: ${guideline.instruction}
FORMAT: Natural prose, conversational tone.
STOP writing after ${guideline.sentences} sentences or ${guideline.words} words, whichever comes first.`;
      break;
    }

    case 'TLDR': {
      const guideline = LENGTH_GUIDELINES.TLDR[length];
      typeInstruction = `Provide a brief summary of the essential information.
LENGTH CONSTRAINT: ${guideline.instruction}
FORMAT: Direct, clear sentences.
STOP writing after ${guideline.sentences} sentence(s) or ${guideline.words} words, whichever comes first.`;
      break;
    }
  }

  return `Summarize the following text as a ${type}.

TEXT:
"""
${text}
"""

REQUIREMENTS:
- Type: ${type}
- Length: ${length}
- Language: ${targetLanguage}

${typeInstruction}

CRITICAL RULES:
1. Output ONLY the summary - no labels, no explanations, no meta-commentary
2. STOP immediately when you reach the length limit
3. Do not apologize or mention the constraints
4. Stay faithful to the source material
5. ${length === 'short' ? 'BE EXTREMELY CONCISE - every word matters' : length === 'medium' ? 'Balance detail with brevity' : 'Provide more detail but respect limits'}

Begin the summary now:`;
};
