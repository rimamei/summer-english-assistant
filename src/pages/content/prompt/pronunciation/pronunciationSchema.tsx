export const pronunciationSchema = {
  type: 'object',
  properties: {
    text: {
      type: 'string',
      description: 'The input English word to analyze.',
    },
    pronunciation: {
      type: 'object',
      description: 'Phonetic transcription of the text.',
      properties: {
        uk: {
          type: 'string',
          description:
            'Cambridge-style readable pronunciation (e.g., /lɝːn/). in British English (UK).',
        },
        us: {
          type: 'string',
          description:
            'Cambridge-style readable pronunciation (e.g., /lɝːn/). in American English (US).',
        },
      },
      required: ['uk', 'us'],
    },
    definition: {
      type: 'string',
      description: 'A short and simple English definition of the word.',
    },
    level: {
      type: 'string',
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      description: 'CEFR level of language difficulty.',
    },
    soundBySound: {
      uk: {
        type: 'array',
        description:
          'Sound-by-sound pronunciation breakdown (like Cambridge Dictionary).',
        items: {
          type: 'object',
          properties: {
            symbol: {
              type: 'string',
              description: 'Phonetic symbol for each sound.',
            },
            exampleWord: {
              type: 'string',
              description: 'Example word containing the same sound.',
            },
          },
          required: ['symbol', 'exampleWord'],
        },
      },
      us: {
        type: 'array',
        description:
          'Sound-by-sound pronunciation breakdown (like Cambridge Dictionary).',
        items: {
          type: 'object',
          properties: {
            symbol: {
              type: 'string',
              description: 'Phonetic symbol for each sound.',
            },
            exampleWord: {
              type: 'string',
              description: 'Example word containing the same sound.',
            },
          },
          required: ['symbol', 'exampleWord'],
        },
      },
      required: ['uk', 'us'],
    },
    synonyms: {
      type: 'array',
      description: 'List of 1–3 synonyms. Leave empty for full sentences.',
      items: {
        type: 'string',
      },
    },
    type: {
      type: 'string',
      description:
        'Grammatical type of the word (e.g., noun, verb 1, adjective) or "sentence" if the input is a full sentence.',
    },
  },
  required: [
    'text',
    'pronunciation',
    'definition',
    'level',
    'soundBySound',
    'synonyms',
    'type',
  ],
};
