export const grammarSchema = {
    type: 'object',
    properties: {
        isCorrect: {
            type: 'boolean',
            description: 'Whether the sentence is grammatically correct',
        },
        corrections: {
            type: 'string',
            description: 'Corrected sentence (same as original if no errors)',
        },
        details: {
            type: 'string',
            description: 'Educational explanation of grammar concepts used, with key terms in bold',
        },
    },
    required: ['isCorrect', 'corrections', 'details'],
    additionalProperties: false,
};