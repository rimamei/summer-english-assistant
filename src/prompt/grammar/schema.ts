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
            description: 'Brief bullet points (2-3 max) highlighting key grammar concepts. Each point should be one short sentence on a NEW LINE. Format: "- Point 1\\n- Point 2\\n- Point 3". Use **bold** for grammar terms.',
        },
    },
    required: ['isCorrect', 'corrections', 'details'],
    additionalProperties: false,
};