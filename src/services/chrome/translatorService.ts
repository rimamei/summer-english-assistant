/**
 * Singleton service for managing translator session using Chrome's built-in Translator API
 *
 * This service maintains a persistent translator session across component lifecycles,
 * provides status updates during model downloads, and supports streaming translations.
 *
 * @example
 * ```typescript
 * import { translatorService } from '@/services/chrome/translatorService';
 *
 * // Subscribe to status updates
 * const unsubscribe = translatorService.subscribeToStatus((status) => {
 *   console.log('Status:', status.status, 'Progress:', status.progress);
 * });
 *
 * // Translate text with streaming
 * const generator = translatorService.translateStreaming('Hello', 'en', 'es');
 * for await (const chunk of generator) {
 *   console.log(chunk);
 * }
 * ```
 */

/**
 * Represents the current status of the translator service
 */
interface TranslatorStatusItem {
  /** Current status of the translator */
  status: 'idle' | 'checking' | 'downloading' | 'ready' | 'error';
  /** Download progress (0-100) when status is 'downloading' */
  progress?: number;
  /** Error message when status is 'error' */
  error?: string;
}

/**
 * Callback function type for status change listeners
 */
type StatusListener = (status: TranslatorStatusItem) => void;

class TranslatorService {
  private static instance: TranslatorService;
  private session: TranslatorInstance | null = null;
  private currentLanguages: { source: string; target: string } | null = null;
  private statusListeners: Set<StatusListener> = new Set();
  private initController: AbortController | null = null;
  private translateController: AbortController | null = null;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Gets the singleton instance of TranslatorService
   *
   * @returns The TranslatorService instance
   */
  static getInstance(): TranslatorService {
    if (!TranslatorService.instance) {
      TranslatorService.instance = new TranslatorService();
    }
    return TranslatorService.instance;
  }

  /**
   * Notifies all subscribed listeners of a status change
   *
   * @param status - The new status to broadcast
   * @private
   */
  private notifyStatusChange(status: TranslatorStatusItem) {
    this.statusListeners.forEach(listener => listener(status));
  }

  /**
   * Subscribes to translator status changes
   *
   * @param listener - Callback function to be called on status changes
   * @returns Unsubscribe function to remove the listener
   *
   * @example
   * ```typescript
   * const unsubscribe = translatorService.subscribeToStatus((status) => {
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

  /**
   * Checks if the Translator API is supported in the current environment
   *
   * @returns True if Translator API is available, false otherwise
   *
   * @example
   * ```typescript
   * if (translatorService.isTranslatorSupported()) {
   *   // Use translator
   * } else {
   *   // Show fallback UI
   * }
   * ```
   */
  isTranslatorSupported(): boolean {
    return 'Translator' in self && 'Translator' in window;
  }

  /**
   * Initializes the translator session for a specific language pair
   *
   * This method checks model availability, downloads it if necessary (with progress updates),
   * and creates a session. If a session already exists for the same language pair, it reuses it.
   * If the languages differ, it destroys the old session and creates a new one.
   *
   * @param sourceLanguage - Source language code (e.g., 'en', 'es', 'ja')
   * @param targetLanguage - Target language code (e.g., 'en', 'es', 'ja')
   * @throws Error if Translator API is not supported
   * @throws Error if translator model is unavailable for the selected languages
   *
   * @example
   * ```typescript
   * try {
   *   await translatorService.initializeTranslator('en', 'es');
   *   console.log('Translator ready');
   * } catch (error) {
   *   console.error('Failed to initialize:', error);
   * }
   * ```
   */
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
        monitor(m: TranslatorMonitor) {
          m.addEventListener('downloadprogress', (e) => {
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

  /**
   * Translates text with streaming output using the Chrome Translator API
   *
   * This method returns an async generator that yields translation chunks as they become available.
   * It automatically initializes the translator if needed and aborts any previous translation.
   * Text is preprocessed to handle HTML line breaks.
   *
   * @param text - The text to translate
   * @param sourceLanguage - Source language code (e.g., 'en')
   * @param targetLanguage - Target language code (e.g., 'es')
   * @yields Translation chunks as strings
   * @throws Error if session creation fails
   * @throws Error if translation fails (unless aborted)
   *
   * @example
   * ```typescript
   * const generator = translatorService.translateStreaming(
   *   'Hello world',
   *   'en',
   *   'es'
   * );
   *
   * for await (const chunk of generator) {
   *   console.log(chunk); // "Hola", " mundo"
   * }
   * ```
   */
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

  /**
   * Aborts the current translation operation
   *
   * Cancels any ongoing translation and cleans up the AbortController.
   * Safe to call even if no translation is in progress.
   */
  abortTranslation(): void {
    this.translateController?.abort();
    this.translateController = null;
  }

  /**
   * Aborts the current translator initialization
   *
   * Cancels model download or session creation and cleans up the AbortController.
   * Safe to call even if no initialization is in progress.
   */
  abortInitialization(): void {
    this.initController?.abort();
    this.initController = null;
  }

  /**
   * Destroys the current translator session and resets all state
   *
   * Aborts any ongoing operations (initialization or translation),
   * destroys the translator session, and notifies listeners of the idle status.
   * Safe to call multiple times.
   *
   * @example
   * ```typescript
   * // Clean up when component unmounts or language changes
   * translatorService.destroySession();
   * ```
   */
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

  /**
   * Gets the current translator session instance
   *
   * @returns The active TranslatorInstance or null if no session exists
   */
  getSession(): TranslatorInstance | null {
    return this.session;
  }

  /**
   * Gets the currently configured language pair
   *
   * @returns Object with source and target language codes, or null if no session
   *
   * @example
   * ```typescript
   * const langs = translatorService.getCurrentLanguages();
   * if (langs) {
   *   console.log(`Translating from ${langs.source} to ${langs.target}`);
   * }
   * ```
   */
  getCurrentLanguages(): { source: string; target: string } | null {
    return this.currentLanguages;
  }
}

// Export singleton instance
export const translatorService = TranslatorService.getInstance();
