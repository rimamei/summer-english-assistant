/**
 * Singleton service for managing translator session
 * Persists across component lifecycles
 */

interface TranslatorStatusItem {
  status: 'idle' | 'checking' | 'downloading' | 'ready' | 'error';
  progress?: number;
  error?: string;
}

type StatusListener = (status: TranslatorStatusItem) => void;

class TranslatorService {
  private static instance: TranslatorService;
  private session: TranslatorInstance | null = null;
  private currentLanguages: { source: string; target: string } | null = null;
  private statusListeners: Set<StatusListener> = new Set();
  private initController: AbortController | null = null;
  private translateController: AbortController | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): TranslatorService {
    if (!TranslatorService.instance) {
      TranslatorService.instance = new TranslatorService();
    }
    return TranslatorService.instance;
  }

  private notifyStatusChange(status: TranslatorStatusItem) {
    this.statusListeners.forEach(listener => listener(status));
  }

  subscribeToStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  isTranslatorSupported(): boolean {
    return 'Translator' in self && 'Translator' in window;
  }

  async initializeTranslator(sourceLanguage: string, targetLanguage: string): Promise<void> {
    // Check if session exists with same languages
    if (this.session && this.currentLanguages) {
      if (
        this.currentLanguages.source === sourceLanguage &&
        this.currentLanguages.target === targetLanguage
      ) {
        return; // Session already exists, no need to recreate
      }

      // Different languages, destroy old session
      this.destroySession();
    }

    if (!this.isTranslatorSupported()) {
      const error = { status: 'error' as const, error: 'Translator API not supported' };
      this.notifyStatusChange(error);
      throw new Error('Translator API is not supported in this environment.');
    }

    // Abort previous initialization
    this.initController?.abort();
    this.initController = new AbortController();
    const signal = this.initController.signal;

    this.notifyStatusChange({ status: 'checking' });

    try {
      const availability = await window.Translator.availability({
        sourceLanguage,
        targetLanguage,
      });

      if (signal.aborted) return;

      if (availability === 'unavailable') {
        const error = {
          status: 'error' as const,
          error: 'Translator unavailable for selected languages',
        };
        this.notifyStatusChange(error);
        throw new Error('Translator model is unavailable for the selected languages.');
      }

      this.session = await window.Translator.create({
        sourceLanguage,
        targetLanguage,
        signal,
        monitor(m) {
          m.addEventListener('downloadprogress', e => {
            if (!signal.aborted) {
              TranslatorService.getInstance().notifyStatusChange({
                status: 'downloading',
                progress: e.loaded * 100,
              });
            }
          });
        },
      });

      if (signal.aborted) {
        this.session?.destroy();
        this.session = null;
        this.currentLanguages = null;
        return;
      }

      this.currentLanguages = { source: sourceLanguage, target: targetLanguage };
      this.notifyStatusChange({ status: 'ready' });
    } catch (error) {
      if (signal.aborted) return;

      this.notifyStatusChange({
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to initialize translator',
      });
      throw error;
    } finally {
      if (this.initController?.signal === signal) {
        this.initController = null;
      }
    }
  }

  async *translateStreaming(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): AsyncGenerator<string, void, unknown> {
    // Abort previous translation
    this.translateController?.abort();
    this.translateController = new AbortController();
    const signal = this.translateController.signal;

    try {
      // Initialize or reuse existing session
      await this.initializeTranslator(sourceLanguage, targetLanguage);

      if (!this.session) {
        throw new Error('Failed to create translator session');
      }

      if (signal.aborted) return;

      // Process text
      const processedText = text
        .trim()
        .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n\n')
        .replace(/<br\s*\/?>/gi, '\n\n');

      const stream = this.session.translateStreaming(processedText, { signal });

      if (signal.aborted) return;

      const reader = stream.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done || signal.aborted) {
            break;
          }

          yield value;
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
        return;
      }

      this.notifyStatusChange({
        status: 'error',
        error: error instanceof Error ? error.message : 'Translation failed',
      });
      throw error;
    } finally {
      if (this.translateController?.signal === signal) {
        this.translateController = null;
      }
    }
  }

  abortTranslation(): void {
    this.translateController?.abort();
    this.translateController = null;
  }

  abortInitialization(): void {
    this.initController?.abort();
    this.initController = null;
  }

  destroySession(): void {
    this.initController?.abort();
    this.translateController?.abort();

    if (this.session) {
      this.session.destroy();
      this.session = null;
      this.currentLanguages = null;
      this.notifyStatusChange({ status: 'idle' });
    }
  }

  getSession(): TranslatorInstance | null {
    return this.session;
  }

  getCurrentLanguages(): { source: string; target: string } | null {
    return this.currentLanguages;
  }
}

// Export singleton instance
export const translatorService = TranslatorService.getInstance();
