declare module '*?raw' {
  const content: string
  export default content
}

interface Window {
  Translator: {
    create: (options: {
      sourceLanguage: string;
      targetLanguage: string;
    }) => Promise<TranslatorInstance>;
    availability: (options: {
      sourceLanguage: string;
      targetLanguage: string;
    }) => Promise<{ available: string }>;
  };
  translator?: {
    translate: (text: string) => Promise<string>;
  },
  LanguageModel: {
    availability: () => Promise<{ available: string }>;
  }
}

interface TranslatorInstance {
  translate: (text: string) => Promise<string>;
  translateStreaming: (text: string) => AsyncIterable<string>;
}