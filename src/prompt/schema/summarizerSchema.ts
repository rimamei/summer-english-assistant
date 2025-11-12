export const summarizerSchema = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
      description: 'The generated summary in markdown format',
    },
  },
  required: ['summary'],
  additionalProperties: false,
};
