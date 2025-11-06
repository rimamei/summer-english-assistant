/**
 * Singleton service for managing pronunciation analysis session
 * Persists across component lifecycles
 */

import { createPronunciationPrompt } from '@/prompt/pronunciation';
import { pronunciationSchema } from '@/prompt/pronunciation/schema';
import { normalizeLanguage } from '@/utils/normalizeLanguage';

export interface PronunciationAnalysis {
  text: string;
  pronunciation: { uk: string; us: string };
  definition: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  soundBySound: {
    uk: { symbol: string; exampleWord: string }[];
    us: { symbol: string; exampleWord: string }[];
  };
  synonyms: string[];
  type: string;
}

interface PronunciationStatusItem {
    status: 'idle' | 'checking' | 'downloading' | 'ready' | 'error';
    progress?: number;
    error?: string;
}

type StatusListener = (status: PronunciationStatusItem) => void;

class PronunciationService {
    private static instance: PronunciationService;
    private session: PromptSession | null = null;
    private currentConfig: { temperature?: number; topK?: number } | null = null;
    private statusListeners: Set<StatusListener> = new Set();
    private initController: AbortController | null = null;
    private analyzeController: AbortController | null = null;

    private constructor() {
        // Private constructor for singleton
    }

    static getInstance(): PronunciationService {
        if (!PronunciationService.instance) {
            PronunciationService.instance = new PronunciationService();
        }
        return PronunciationService.instance;
    }

    private notifyStatusChange(status: PronunciationStatusItem) {
        this.statusListeners.forEach(listener => listener(status));
    }

    subscribeToStatus(listener: StatusListener): () => void {
        this.statusListeners.add(listener);
        // Return unsubscribe function
        return () => {
            this.statusListeners.delete(listener);
        };
    }

    isPronunciationSupported(): boolean {
        return 'LanguageModel' in self;
    }

    async initializeSession(createOptions?: LanguageModelCreateOptions): Promise<void> {
        const newTemp = createOptions?.temperature;
        const newTopK = createOptions?.topK;

        // Check if we need to reinitialize due to config change
        if (this.session && this.currentConfig) {
            // If config is different, destroy and recreate
            const configChanged =
                (newTemp !== undefined && this.currentConfig.temperature !== newTemp) ||
                (newTopK !== undefined && this.currentConfig.topK !== newTopK);

            if (configChanged) {
                this.destroySession();
            } else {
                return; // Session exists with same config, no need to recreate
            }
        }

        if (!this.isPronunciationSupported()) {
            const error = { status: 'error' as const, error: 'LanguageModel API not supported' };
            this.notifyStatusChange(error);
            throw new Error('LanguageModel API is not supported in this environment.');
        }

        // Abort previous initialization
        this.initController?.abort();
        this.initController = new AbortController();
        const signal = this.initController.signal;

        this.notifyStatusChange({ status: 'checking' });

        try {
            const availability = await window.LanguageModel.availability();

            if (signal.aborted) return;

            if (availability === 'unavailable') {
                const error = {
                    status: 'error' as const,
                    error: 'LanguageModel unavailable',
                };
                this.notifyStatusChange(error);
                throw new Error('LanguageModel model is unavailable.');
            }

            if (availability === 'downloadable' || availability === 'downloading') {
                this.session = await window.LanguageModel.create({
                    ...createOptions,
                    signal,
                    monitor(m) {
                        m.addEventListener('downloadprogress', (e) => {
                            if (!signal.aborted) {
                                PronunciationService.getInstance().notifyStatusChange({
                                    status: 'downloading',
                                    progress: e.loaded * 100,
                                });
                            }
                        });
                    },
                });
            } else if (availability === 'available') {
                this.session = await window.LanguageModel.create({
                    ...createOptions,
                    signal
                });
            }

            if (signal.aborted) {
                this.session?.destroy();
                this.session = null;
                this.currentConfig = null;
                return;
            }

            // Store the config used for this session
            this.currentConfig = {
                temperature: newTemp,
                topK: newTopK
            };

            this.notifyStatusChange({ status: 'ready' });
        } catch (error) {
            if (signal.aborted) return;

            this.notifyStatusChange({
                status: 'error',
                error: error instanceof Error ? error.message : 'Failed to initialize session',
            });
            throw error;
        } finally {
            if (this.initController?.signal === signal) {
                this.initController = null;
            }
        }
    }

    async analyzeWord(
        word: string,
        sourceLanguage: string,
        targetLanguage: string
    ): Promise<PronunciationAnalysis> {
        // Abort previous analysis
        this.analyzeController?.abort();
        this.analyzeController = new AbortController();
        const signal = this.analyzeController.signal;

        try {
            // Get the prompt text
            const prompt = createPronunciationPrompt(word, targetLanguage);

            // Validate languages
            const validSourceLanguage = normalizeLanguage(sourceLanguage);
            const validTargetLanguage = normalizeLanguage(targetLanguage);

            // Get default params
            const defaults = await window.LanguageModel.params();

            if (signal.aborted) {
                throw new DOMException('Analysis aborted', 'AbortError');
            }

            // Define session creation options
            const createOptions: LanguageModelCreateOptions = {
                initialPrompts: [
                    {
                        role: 'system',
                        content: 'You are a helpful and friendly assistant.',
                    },
                ],
                temperature: defaults.defaultTemperature,
                topK: defaults.defaultTopK,
                expectedInputs: [
                    { type: "text", languages: [validSourceLanguage, validSourceLanguage] }
                ],
                expectedOutputs: [
                    { type: "text", languages: [validTargetLanguage] }
                ]
            };

            // Initialize or reuse existing session
            await this.initializeSession(createOptions);

            if (!this.session) {
                throw new Error('Failed to create session');
            }

            if (signal.aborted) {
                throw new DOMException('Analysis aborted', 'AbortError');
            }

            // Define prompt operation options
            const operationOptions: PromptOperationOptions = {
                responseConstraint: pronunciationSchema,
                signal
            };

            // Call the prompt streaming API
            const stream = this.session.promptStreaming(prompt, operationOptions);

            // Read the stream and concatenate chunks
            let resultString = '';
            const reader = stream.getReader();

            try {
                while (true) {
                    const { done, value } = await reader.read();

                    if (signal.aborted) {
                        reader.cancel();
                        throw new DOMException('Analysis aborted', 'AbortError');
                    }

                    if (done) break;
                    resultString += value;
                }
            } finally {
                reader.releaseLock();
            }

            if (signal.aborted) {
                throw new DOMException('Analysis aborted', 'AbortError');
            }

            // Parse and return the successful result
            const parsedResult: PronunciationAnalysis = JSON.parse(resultString);

            return parsedResult;

        } catch (error) {
            if (signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
                throw error;
            }

            this.notifyStatusChange({
                status: 'error',
                error: error instanceof Error ? error.message : 'Analysis failed',
            });
            throw error;
        } finally {
            if (this.analyzeController?.signal === signal) {
                this.analyzeController = null;
            }
        }
    }

    abortAnalysis(): void {
        this.analyzeController?.abort();
        this.analyzeController = null;
    }

    abortInitialization(): void {
        this.initController?.abort();
        this.initController = null;
    }

    destroySession(): void {
        this.initController?.abort();
        this.analyzeController?.abort();

        if (this.session) {
            this.session.destroy();
            this.session = null;
            this.currentConfig = null;
            this.notifyStatusChange({ status: 'idle' });
        }
    }

    getSession(): PromptSession | null {
        return this.session;
    }

    getCurrentConfig(): { temperature?: number; topK?: number } | null {
        return this.currentConfig;
    }
}

// Export singleton instance
export const pronunciationService = PronunciationService.getInstance();
