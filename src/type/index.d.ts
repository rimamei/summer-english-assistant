export interface IGrammarData {
  isCorrect: boolean;
  details: string;
  corrections: string;
}

export interface ISummarizerData {
  summary: string;
}

export type SelectorOption = 'word' | 'sentence' | 'context';
export type AccentOption = 'american' | 'british';
export type ModeOption = 'pronunciation' | 'grammar' | 'summarizer' | 'translation';

export interface IConfiguration {
  source_lang: string;
  target_lang: string;
  mode: ModeOption;
  selector: SelectorOption;
  accent: AccentOption;
  summarizer_type?: SummarizerAvailabilityOptions['type'];
  summarizer_length?: SummarizerAvailabilityOptions['length'];
}

type TSupportedLanguage = 'en' | 'id' | 'es' | 'ja';

export interface IPreferenceForm {
  theme: 'light' | 'dark';
  lang: TLanguage;
  agent: string;
}

export interface IPreferences extends IPreferenceForm {
  ext_status?: boolean;
  model?: string | undefined;
  apiKey?: string | undefined;
}
