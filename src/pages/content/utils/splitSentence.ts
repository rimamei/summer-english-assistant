export const splitIntoSentences = (text: string): string => {
  // This regex matches sentences ending with ., !, or ?
  // It's a basic splitter and can be improved, but it's a good start.
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  return sentences.map(s => s.trim())[0]; // Trim whitespace
};
