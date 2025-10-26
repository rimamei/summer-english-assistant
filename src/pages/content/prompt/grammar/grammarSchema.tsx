export const grammarSchema = {
  type: 'object',
  properties: {
    isCorrect: {
      type: 'boolean',
      description: 'Is the sentence 100% grammatically correct?',
    },
    correctedSentence: {
      type: 'string',
      description:
        'The corrected version of the sentence. If no errors, this is the same as the original.',
    },
    explanation: {
      type: 'string',
      description: 'Explanation grammar that used in the sentence.',
    }
  },
  required: ['isCorrect', 'correctedSentence', 'explanation'],
};
