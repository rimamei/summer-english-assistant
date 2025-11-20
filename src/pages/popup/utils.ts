import type { TTheme } from '@/type/theme';

// Get enabled options based on mode
export const getEnabledOptions = (mode: string) => {
  switch (mode) {
    case 'pronunciation':
      return ['word'];
    case 'grammar':
      return ['sentence'];
    case 'summarizer':
      return ['context'];
    case 'translation':
      return ['context'];
    default:
      return ['word'];
  }
};

// Get default selector value based on mode
export const getDefaultSelectorValue = (mode: string) => {
  switch (mode) {
    case 'pronunciation':
      return 'word';
    case 'grammar':
      return 'sentence';
    case 'summarizer':
      return 'sentence';
    case 'translation':
      return 'word';
    default:
      return 'word';
  }
};

export const applyTheme = (newTheme: TTheme) => {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(newTheme);
};
