/**
 * Singleton service for managing summarizer session
 * Persists across component lifecycles
 */

export interface SummarizerConfig {
  expectedInputLanguages: string[];
  expectedContextLanguages: string[];
  format: 'plain-text' | 'markdown';
  length: 'short' | 'medium' | 'long';
  outputLanguage: string;
  type: 'headline' | 'key-points' | 'teaser' | 'tldr';
}

interface SummarizerStatusItem {
  status: 'idle' | 'checking' | 'downloading' | 'ready' | 'error';
  progress?: number;
  error?: string;
}

type StatusListener = (status: SummarizerStatusItem) => void;

class SummarizerService {
  private static instance: SummarizerService;
  private session: SummarizerInstance | null = null;
  private currentConfig: SummarizerConfig | null = null;
  private statusListeners: Set<StatusListener> = new Set();
  private initController: AbortController | null = null;
  private summarizeController: AbortController | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): SummarizerService {
    if (!SummarizerService.instance) {
      SummarizerService.instance = new SummarizerService();
    }
    return SummarizerService.instance;
  }

  private notifyStatusChange(status: SummarizerStatusItem) {
    this.statusListeners.forEach(listener => listener(status));
  }

  subscribeToStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  isSummarizerSupported(): boolean {
    return 'Summarizer' in self && 'Summarizer' in window;
  }

  async initializeSummarizer(config: SummarizerConfig): Promise<void> {
    // Check if session exists with same config
    if (this.session && this.currentConfig) {
      if (JSON.stringify(this.currentConfig) === JSON.stringify(config)) {
        return; // Session already exists, no need to recreate
      }

      // Different config, destroy old session
      this.destroySession();
    }

    if (!this.isSummarizerSupported()) {
      const error = { status: 'error' as const, error: 'Summarizer API not supported' };
      this.notifyStatusChange(error);
      throw new Error('Summarizer API is not supported in this environment.');
    }

    // Abort previous initialization
    this.initController?.abort();
    this.initController = new AbortController();
    const signal = this.initController.signal;

    this.notifyStatusChange({ status: 'checking' });

    try {
      const availability = await window.Summarizer.availability(config);

      if (signal.aborted) return;

      if (availability === 'unavailable') {
        const error = {
          status: 'error' as const,
          error:
            'Summarizer model is unavailable. Please only specify supported language: English, Japanese, and Spanish.',
        };
        this.notifyStatusChange(error);
        throw new Error(
          'Summarizer model is unavailable. Please only specify supported language: English, Japanese, and Spanish.'
        );
      }

      this.session = await window.Summarizer.create({
        ...config,
        signal,
        monitor(m) {
          m.addEventListener('downloadprogress', e => {
            if (!signal.aborted) {
              SummarizerService.getInstance().notifyStatusChange({
                status: 'downloading',
                progress: Math.round(e.loaded * 100),
              });
            }
          });
        },
      });

      if (signal.aborted) {
        this.session?.destroy();
        this.session = null;
        this.currentConfig = null;
        return;
      }

      this.currentConfig = config;
      this.notifyStatusChange({ status: 'ready' });
    } catch (error) {
      if (signal.aborted) return;

      this.notifyStatusChange({
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to initialize summarizer',
      });
      throw error;
    } finally {
      if (this.initController?.signal === signal) {
        this.initController = null;
      }
    }
  }

  async *summarizeStreaming(
    text: string,
    config: SummarizerConfig
  ): AsyncGenerator<string, void, unknown> {
    // Abort previous summarization
    this.summarizeController?.abort();
    this.summarizeController = new AbortController();
    const signal = this.summarizeController.signal;

    try {
      // Initialize or reuse existing session
      await this.initializeSummarizer(config);

      if (!this.session) {
        throw new Error('Failed to create summarizer session');
      }

      if (signal.aborted) return;

      // Process text
      const processedText = text.trim().replace(/\n/g, '<br>');

      const stream = this.session.summarizeStreaming(processedText, { signal });

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
        error: error instanceof Error ? error.message : 'Summarization failed',
      });
      throw error;
    } finally {
      if (this.summarizeController?.signal === signal) {
        this.summarizeController = null;
      }
    }
  }

  abortSummarization(): void {
    this.summarizeController?.abort();
    this.summarizeController = null;
  }

  abortInitialization(): void {
    this.initController?.abort();
    this.initController = null;
  }

  destroySession(): void {
    this.initController?.abort();
    this.summarizeController?.abort();

    if (this.session) {
      this.session.destroy();
      this.session = null;
      this.currentConfig = null;
      this.notifyStatusChange({ status: 'idle' });
    }
  }

  getSession(): SummarizerInstance | null {
    return this.session;
  }

  getCurrentConfig(): SummarizerConfig | null {
    return this.currentConfig;
  }
}

// Export singleton instance
export const summarizerService = SummarizerService.getInstance();
