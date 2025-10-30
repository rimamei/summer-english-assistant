declare module '*?raw' {
  const content: string
  export default content
}

interface Window {
  translator?: {
    translate: (text: string) => Promise<string>;
  },
  LanguageModel: {
    availability: () => Promise<{ available: string }>;
    create: (options?: LanguageModelCreateOptions) => Promise<LanguageModelSession>;
    params: () => Promise<LanguageModelParams>;
  },
  Summarizer: {
    create: (options: {
      type: string,
      expectedInputLanguages: string[],
      outputLanguage: string,
      expectedContextLanguages: string[]
    }) => Promise<SummarizerInstance>;
    availability: () => Promise<'unavailable' | 'available'>;
  };
}

interface LanguageModelParams {
  defaultTopK: number;
  defaultTemperature: number;
}

interface LanguageModelCreateOptions {
  expectedInputs?: Array<{
    type: string;
    languages?: string[];
  }>;
  expectedOutputs?: Array<{
    type: string;
    languages?: string[];
  }>;
  initialPrompts?: Array<{
    role: string;
    content: string;
  }>;
  temperature?: number;
  topK?: number;
}

interface LanguageModelSession {
  prompt: (prompt: string, options?: {
    responseConstraint?: object;
  }) => Promise<string>;
  destroy: () => void;
}

interface SummarizerInstance {
  summarize: (text: string, options?: {
    context?: string;
  }) => Promise<string>;
}

interface TranslatorInstance {
  translate: (text: string) => Promise<string>;
  translateStreaming: (text: string) => AsyncIterable<string>;
}