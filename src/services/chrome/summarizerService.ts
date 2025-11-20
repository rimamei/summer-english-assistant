/**
 * Singleton service for managing summarizer session using Chrome's built-in Summarizer API
 *
 * This service maintains a persistent summarizer session across component lifecycles,
 * provides status updates during model downloads, and supports streaming summarization.
 *
 * @example
 * ```typescript
 * import { summarizerService } from '@/services/chrome/summarizerService';
 *
 * const config = {
 *   type: 'tldr',
 *   format: 'markdown',
 *   length: 'short',
 *   outputLanguage: 'en'
 * };
 *
 * const generator = summarizerService.summarizeStreaming('Long text...', config);
 * for await (const chunk of generator) {
 *   console.log(chunk);
 * }
 * ```
 */

/**
 * Configuration options for the summarizer
 */
export interface SummarizerConfig {
  /** Expected input text languages (e.g., ['en', 'es']) */
  expectedInputLanguages: string[];
  /** Expected context languages for summarization */
  expectedContextLanguages: string[];
  /** Output format for the summary */
  format: 'plain-text' | 'markdown';
  /** Desired summary length */
  length: 'short' | 'medium' | 'long';
  /** Language for the summary output */
  outputLanguage: string;
  /** Type of summary to generate */
  type: 'headline' | 'key-points' | 'teaser' | 'tldr';
}

/**
 * Represents the current status of the summarizer service
 */
interface SummarizerStatusItem {
  /** Current status of the summarizer */
  status: 'idle' | 'checking' | 'downloading' | 'ready' | 'error';
  /** Download progress (0-100) when status is 'downloading' */
  progress?: number;
  /** Error message when status is 'error' */
  error?: string;
}

/**
 * Callback function type for status change listeners
 */
type StatusListener = (status: SummarizerStatusItem) => void;

class SummarizerService {
  private static instance: SummarizerService;
  private session: SummarizerInstance | null = null;
  private currentConfig: SummarizerConfig | null = null;
  private statusListeners: Set<StatusListener> = new Set();
  private initController: AbortController | null = null;
  private summarizeController: AbortController | null = null;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Gets the singleton instance of SummarizerService
   *
   * @returns The SummarizerService instance
   */
  static getInstance(): SummarizerService {
    if (!SummarizerService.instance) {
      SummarizerService.instance = new SummarizerService();
    }
    return SummarizerService.instance;
  }

  /**
   * Notifies all subscribed listeners of a status change
   *
   * @param status - The new status to broadcast
   * @private
   */
  private notifyStatusChange(status: SummarizerStatusItem) {
    this.statusListeners.forEach(listener => listener(status));
  }

  /**
   * Subscribes to summarizer status changes
   *
   * @param listener - Callback function to be called on status changes
   * @returns Unsubscribe function to remove the listener
   *
   * @example
   * ```typescript
   * const unsubscribe = summarizerService.subscribeToStatus((status) => {
   *   if (status.status === 'downloading') {
   *     console.log(`Downloading: ${status.progress}%`);
   *   }
   * });
   *
   * // Later, to unsubscribe:
   * unsubscribe();
   * ```
   */
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
        monitor(m: SummarizerMonitor) {
          m.addEventListener('downloadprogress', (e) => {
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
