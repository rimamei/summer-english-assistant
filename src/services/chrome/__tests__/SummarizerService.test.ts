import { describe, it, expect, beforeEach, vi } from 'vitest';
import { summarizerService } from '../summarizerService';
import type { SummarizerConfig } from '../summarizerService';

describe('SummarizerService', () => {
  const mockConfig: SummarizerConfig = {
    expectedInputLanguages: ['en'],
    expectedContextLanguages: ['en'],
    format: 'markdown',
    length: 'short',
    outputLanguage: 'en',
    type: 'tldr',
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Reset the service state by destroying any existing session
    summarizerService.destroySession();
  });

  describe('isSummarizerSupported', () => {
    it('should return true when Summarizer API is available', () => {
      // The global.Summarizer is mocked in setup.ts
      expect(summarizerService.isSummarizerSupported()).toBe(true);
    });

    it('should return false when Summarizer API is not available', () => {
      const originalSummarizer = global.Summarizer;
      delete global.Summarizer;

      expect(summarizerService.isSummarizerSupported()).toBe(false);

      // Restore
      global.Summarizer = originalSummarizer;
    });
  });

  describe('subscribeToStatus', () => {
    it('should allow subscribing to status changes', () => {
      const listener = vi.fn();

      const unsubscribe = summarizerService.subscribeToStatus(listener);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should call listener when status changes', async () => {
      const mockSession = {
        destroy: vi.fn(),
        summarize: vi.fn(),
        summarizeStreaming: vi.fn(),
      };

      global.Summarizer = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      const listener = vi.fn();

      summarizerService.subscribeToStatus(listener);

      await summarizerService.initializeSummarizer(mockConfig);

      // Should have been called with 'checking' and 'ready' statuses
      expect(listener).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith({ status: 'checking' });
      expect(listener).toHaveBeenCalledWith({ status: 'ready' });
    });

    it('should allow unsubscribing from status changes', () => {
      const listener = vi.fn();

      const unsubscribe = summarizerService.subscribeToStatus(listener);
      unsubscribe();

      // After unsubscribing, listener should not be in the set
      // We can't directly test this, but we can verify behavior doesn't call the listener
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('initializeSummarizer', () => {
    it('should throw error when Summarizer API is not supported', async () => {
      const originalSummarizer = global.Summarizer;
      delete global.Summarizer;

      await expect(summarizerService.initializeSummarizer(mockConfig)).rejects.toThrow(
        'Summarizer API is not supported in this environment.'
      );

      global.Summarizer = originalSummarizer;
    });

    it('should create a new session when no session exists', async () => {
      const mockSession = {
        destroy: vi.fn(),
        summarize: vi.fn(),
        summarizeStreaming: vi.fn(),
      };

      global.Summarizer = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      await summarizerService.initializeSummarizer(mockConfig);

      expect(global.Summarizer.availability).toHaveBeenCalledWith(mockConfig);
      expect(global.Summarizer.create).toHaveBeenCalled();
      expect(summarizerService.getSession()).toBe(mockSession);
    });

    it('should reuse existing session with same config', async () => {
      const mockSession = {
        destroy: vi.fn(),
        summarize: vi.fn(),
        summarizeStreaming: vi.fn(),
      };

      global.Summarizer = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      await summarizerService.initializeSummarizer(mockConfig);
      const firstSession = summarizerService.getSession();

      await summarizerService.initializeSummarizer(mockConfig);
      const secondSession = summarizerService.getSession();

      expect(firstSession).toBe(secondSession);
      expect(global.Summarizer.create).toHaveBeenCalledTimes(1);
    });

    it('should create new session when config changes', async () => {
      const mockSession1 = {
        destroy: vi.fn(),
        summarize: vi.fn(),
        summarizeStreaming: vi.fn(),
      };
      const mockSession2 = {
        destroy: vi.fn(),
        summarize: vi.fn(),
        summarizeStreaming: vi.fn(),
      };

      let callCount = 0;
      global.Summarizer = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockImplementation(() => {
          callCount++;
          return callCount === 1 ? mockSession1 : mockSession2;
        }),
      };

      await summarizerService.initializeSummarizer(mockConfig);

      const differentConfig = { ...mockConfig, length: 'long' as const };
      await summarizerService.initializeSummarizer(differentConfig);

      expect(mockSession1.destroy).toHaveBeenCalled();
      expect(global.Summarizer.create).toHaveBeenCalledTimes(2);
    });

    it('should throw error when summarizer is unavailable', async () => {
      global.Summarizer = {
        availability: vi.fn().mockResolvedValue('unavailable'),
        create: vi.fn(),
      };

      await expect(summarizerService.initializeSummarizer(mockConfig)).rejects.toThrow(
        'Summarizer model is unavailable. Please only specify supported language: English, Japanese, and Spanish.'
      );
    });

    it('should emit downloading status with progress during model download', async () => {
      const mockSession = {
        destroy: vi.fn(),
        summarize: vi.fn(),
        summarizeStreaming: vi.fn(),
      };

      type DownloadProgressEvent = { loaded: number };
      type MonitorCallback = (m: {
        addEventListener: (event: string, handler: (e: DownloadProgressEvent) => void) => void;
      }) => void;

      let monitorCallback: MonitorCallback | undefined;

      global.Summarizer = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockImplementation((options) => {
          monitorCallback = options.monitor;

          // Simulate download progress
          if (monitorCallback) {
            const mockMonitor = {
              addEventListener: vi.fn(
                (event: string, handler: (e: DownloadProgressEvent) => void) => {
                  if (event === 'downloadprogress') {
                    // Simulate multiple progress events
                    setTimeout(() => handler({ loaded: 0.25 }), 0);
                    setTimeout(() => handler({ loaded: 0.5 }), 10);
                    setTimeout(() => handler({ loaded: 0.75 }), 20);
                    setTimeout(() => handler({ loaded: 1.0 }), 30);
                  }
                }
              ),
            };
            monitorCallback(mockMonitor);
          }

          return Promise.resolve(mockSession);
        }),
      };

      const listener = vi.fn();
      summarizerService.subscribeToStatus(listener);

      await summarizerService.initializeSummarizer(mockConfig);

      // Wait for async progress events
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should have been called with 'checking', 'downloading' (with progress), and 'ready' statuses
      expect(listener).toHaveBeenCalledWith({ status: 'checking' });
      expect(listener).toHaveBeenCalledWith({ status: 'downloading', progress: 25 });
      expect(listener).toHaveBeenCalledWith({ status: 'downloading', progress: 50 });
      expect(listener).toHaveBeenCalledWith({ status: 'downloading', progress: 75 });
      expect(listener).toHaveBeenCalledWith({ status: 'downloading', progress: 100 });
      expect(listener).toHaveBeenCalledWith({ status: 'ready' });
    });

    it('should abort initialization and not create session when aborted after availability check', async () => {
      const mockSession = {
        destroy: vi.fn(),
        summarize: vi.fn(),
        summarizeStreaming: vi.fn(),
      };

      global.Summarizer = {
        availability: vi.fn().mockImplementation(async () => {
          // Abort during availability check
          summarizerService.abortInitialization();
          return 'ready';
        }),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      await summarizerService.initializeSummarizer(mockConfig);

      // Session should not be created when aborted
      expect(global.Summarizer.create).not.toHaveBeenCalled();
      expect(summarizerService.getSession()).toBeNull();
      expect(summarizerService.getCurrentConfig()).toBeNull();
    });

    it('should destroy session when aborted after session creation', async () => {
      const mockSession = {
        destroy: vi.fn(),
        summarize: vi.fn(),
        summarizeStreaming: vi.fn(),
      };

      global.Summarizer = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockImplementation(async () => {
          // Abort after session is created
          const session = mockSession;
          summarizerService.abortInitialization();
          return session;
        }),
      };

      await summarizerService.initializeSummarizer(mockConfig);

      // Session should be destroyed when aborted
      expect(mockSession.destroy).toHaveBeenCalled();
      expect(summarizerService.getSession()).toBeNull();
      expect(summarizerService.getCurrentConfig()).toBeNull();
    });

    it('should abort previous initialization when new one starts', async () => {
      const mockSession = {
        destroy: vi.fn(),
        summarize: vi.fn(),
        summarizeStreaming: vi.fn(),
      };

      let createCallCount = 0;

      global.Summarizer = {
        availability: vi.fn().mockImplementation(async () => {
          createCallCount++;
          if (createCallCount === 1) {
            // First call - simulate slow availability check
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
          return 'ready';
        }),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      const listener = vi.fn();
      summarizerService.subscribeToStatus(listener);

      // Start first initialization (will take 100ms to check availability)
      const firstInit = summarizerService.initializeSummarizer(mockConfig);

      // Start second initialization after a short delay (should abort first)
      await new Promise((resolve) => setTimeout(resolve, 10));
      const differentConfig = { ...mockConfig, length: 'long' as const };
      await summarizerService.initializeSummarizer(differentConfig);

      // Wait for first to complete
      await firstInit;

      // Create should only be called once (for the second init)
      // First init should be aborted before create is called
      expect(global.Summarizer.create).toHaveBeenCalledTimes(1);
      expect(summarizerService.getCurrentConfig()).toEqual(differentConfig);
    });

    it('should not emit download progress when signal is aborted', async () => {
      const mockSession = {
        destroy: vi.fn(),
        summarize: vi.fn(),
        summarizeStreaming: vi.fn(),
      };

      type DownloadProgressEvent = { loaded: number };
      type MonitorCallback = (m: {
        addEventListener: (event: string, handler: (e: DownloadProgressEvent) => void) => void;
      }) => void;

      let monitorCallback: MonitorCallback | undefined;

      global.Summarizer = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockImplementation((options) => {
          monitorCallback = options.monitor;

          // Abort immediately
          summarizerService.abortInitialization();

          // Try to emit download progress after abort
          if (monitorCallback) {
            const mockMonitor = {
              addEventListener: vi.fn(
                (event: string, handler: (e: DownloadProgressEvent) => void) => {
                  if (event === 'downloadprogress') {
                    setTimeout(() => handler({ loaded: 0.5 }), 0);
                  }
                }
              ),
            };
            monitorCallback(mockMonitor);
          }

          return Promise.resolve(mockSession);
        }),
      };

      const listener = vi.fn();
      summarizerService.subscribeToStatus(listener);

      await summarizerService.initializeSummarizer(mockConfig);

      // Wait for potential async events
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should only have 'checking' status, no 'downloading' after abort
      expect(listener).toHaveBeenCalledWith({ status: 'checking' });
      expect(listener).not.toHaveBeenCalledWith(
        expect.objectContaining({ status: 'downloading' })
      );
    });
  });

  describe('destroySession', () => {
    it('should destroy the session and reset state', async () => {
      const mockSession = {
        destroy: vi.fn(),
        summarize: vi.fn(),
        summarizeStreaming: vi.fn(),
      };

      global.Summarizer = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      await summarizerService.initializeSummarizer(mockConfig);
      expect(summarizerService.getSession()).toBe(mockSession);

      summarizerService.destroySession();

      expect(mockSession.destroy).toHaveBeenCalled();
      expect(summarizerService.getSession()).toBeNull();
      expect(summarizerService.getCurrentConfig()).toBeNull();
    });

    it('should emit idle status when session is destroyed', async () => {
      const mockSession = {
        destroy: vi.fn(),
        summarize: vi.fn(),
        summarizeStreaming: vi.fn(),
      };

      global.Summarizer = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      await summarizerService.initializeSummarizer(mockConfig);

      const listener = vi.fn();
      summarizerService.subscribeToStatus(listener);

      summarizerService.destroySession();

      expect(listener).toHaveBeenCalledWith({ status: 'idle' });
    });
  });

  describe('getCurrentConfig', () => {
    it('should return null when no session exists', () => {
      expect(summarizerService.getCurrentConfig()).toBeNull();
    });

    it('should return current config after initialization', async () => {
      const mockSession = {
        destroy: vi.fn(),
        summarize: vi.fn(),
        summarizeStreaming: vi.fn(),
      };

      global.Summarizer = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      await summarizerService.initializeSummarizer(mockConfig);

      expect(summarizerService.getCurrentConfig()).toEqual(mockConfig);
    });
  });

  describe('summarizeStreaming', () => {
    // Helper to create a mock ReadableStream
    const createMockStream = (chunks: string[]) => {
      let index = 0;
      return {
        getReader: () => ({
          read: vi.fn().mockImplementation(async () => {
            if (index < chunks.length) {
              return { done: false, value: chunks[index++] };
            }
            return { done: true };
          }),
          releaseLock: vi.fn(),
        }),
      };
    };

    it('should yield summary chunks', async () => {
      const mockStream = createMockStream(['This', ' is', ' a', ' summary']);
      const mockSession = {
        destroy: vi.fn(),
        summarize: vi.fn(),
        summarizeStreaming: vi.fn().mockReturnValue(mockStream),
      };

      global.Summarizer = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      const chunks: string[] = [];
      const generator = summarizerService.summarizeStreaming('Long text to summarize', mockConfig);

      for await (const chunk of generator) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['This', ' is', ' a', ' summary']);
      expect(mockSession.summarizeStreaming).toHaveBeenCalledWith(
        'Long text to summarize',
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
    });

    it('should initialize summarizer if not already initialized', async () => {
      const mockStream = createMockStream(['Summary']);
      const mockSession = {
        destroy: vi.fn(),
        summarize: vi.fn(),
        summarizeStreaming: vi.fn().mockReturnValue(mockStream),
      };

      global.Summarizer = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      const chunks: string[] = [];
      const generator = summarizerService.summarizeStreaming('Text to summarize', mockConfig);

      for await (const chunk of generator) {
        chunks.push(chunk);
      }

      expect(global.Summarizer.create).toHaveBeenCalled();
      expect(chunks).toEqual(['Summary']);
    });

    it('should reuse existing session for same config', async () => {
      const mockStream = createMockStream(['Summary 1']);
      const mockSession = {
        destroy: vi.fn(),
        summarize: vi.fn(),
        summarizeStreaming: vi.fn().mockReturnValue(mockStream),
      };

      global.Summarizer = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      // First summarization
      const generator1 = summarizerService.summarizeStreaming('Text 1', mockConfig);
      for await (const chunk of generator1) {
        void chunk; // consume stream
      }

      mockStream.getReader().read = vi
        .fn()
        .mockImplementation(async () => {
          return { done: false, value: 'Summary 2' };
        })
        .mockImplementationOnce(async () => {
          return { done: false, value: 'Summary 2' };
        })
        .mockImplementationOnce(async () => {
          return { done: true };
        });

      // Second summarization with same config
      const generator2 = summarizerService.summarizeStreaming('Text 2', mockConfig);
      const chunks: string[] = [];
      for await (const chunk of generator2) {
        chunks.push(chunk);
      }

      // Create should only be called once
      expect(global.Summarizer.create).toHaveBeenCalledTimes(1);
      expect(mockSession.summarizeStreaming).toHaveBeenCalledTimes(2);
    });

    it('should preprocess text by replacing newlines with HTML breaks', async () => {
      const mockStream = createMockStream(['Summary']);
      const mockSession = {
        destroy: vi.fn(),
        summarize: vi.fn(),
        summarizeStreaming: vi.fn().mockReturnValue(mockStream),
      };

      global.Summarizer = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      const generator = summarizerService.summarizeStreaming('Line 1\nLine 2\nLine 3', mockConfig);

      for await (const chunk of generator) {
        void chunk; // consume stream
      }

      expect(mockSession.summarizeStreaming).toHaveBeenCalledWith(
        'Line 1<br>Line 2<br>Line 3',
        expect.any(Object)
      );
    });

    it('should abort previous summarization when new one starts', async () => {
      const mockStream1 = createMockStream(['First']);
      const mockStream2 = createMockStream(['Second']);

      let callCount = 0;
      const mockSession = {
        destroy: vi.fn(),
        summarize: vi.fn(),
        summarizeStreaming: vi.fn().mockImplementation(() => {
          callCount++;
          return callCount === 1 ? mockStream1 : mockStream2;
        }),
      };

      global.Summarizer = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      // Start first summarization
      const generator1 = summarizerService.summarizeStreaming('First text', mockConfig);
      const iterator1 = generator1[Symbol.asyncIterator]();

      // Get first chunk
      await iterator1.next();

      // Start second summarization (should abort first)
      const generator2 = summarizerService.summarizeStreaming('Second text', mockConfig);
      const chunks2: string[] = [];

      for await (const chunk of generator2) {
        chunks2.push(chunk);
      }

      expect(chunks2).toEqual(['Second']);
    });

    it('should handle abort signal during summarization', async () => {
      const mockStream = {
        getReader: () => ({
          read: vi
            .fn()
            .mockResolvedValueOnce({ done: false, value: 'First' })
            .mockImplementation(async () => {
              // Abort during read
              summarizerService.abortSummarization();
              return { done: false, value: 'Second' };
            }),
          releaseLock: vi.fn(),
        }),
      };

      const mockSession = {
        destroy: vi.fn(),
        summarize: vi.fn(),
        summarizeStreaming: vi.fn().mockReturnValue(mockStream),
      };

      global.Summarizer = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      const chunks: string[] = [];
      const generator = summarizerService.summarizeStreaming('Text to summarize', mockConfig);

      for await (const chunk of generator) {
        chunks.push(chunk);
      }

      // Should only get first chunk before abort
      expect(chunks).toEqual(['First']);
    });

    it('should throw error when session creation fails', async () => {
      global.Summarizer = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(null),
      };

      const generator = summarizerService.summarizeStreaming('Text', mockConfig);

      await expect(async () => {
        for await (const chunk of generator) {
          void chunk; // consume stream
        }
      }).rejects.toThrow('Failed to create summarizer session');
    });

    it('should handle summarization errors and notify listeners', async () => {
      const mockStream = {
        getReader: () => ({
          read: vi.fn().mockRejectedValue(new Error('Stream read error')),
          releaseLock: vi.fn(),
        }),
      };

      const mockSession = {
        destroy: vi.fn(),
        summarize: vi.fn(),
        summarizeStreaming: vi.fn().mockReturnValue(mockStream),
      };

      global.Summarizer = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      const listener = vi.fn();
      summarizerService.subscribeToStatus(listener);

      const generator = summarizerService.summarizeStreaming('Text', mockConfig);

      await expect(async () => {
        for await (const chunk of generator) {
          void chunk; // consume stream
        }
      }).rejects.toThrow('Stream read error');

      // Should notify error status
      expect(listener).toHaveBeenCalledWith({
        status: 'error',
        error: 'Stream read error',
      });
    });

    it('should not throw when aborted (AbortError)', async () => {
      const mockStream = {
        getReader: () => ({
          read: vi.fn().mockImplementation(async () => {
            const error = new Error('Aborted');
            error.name = 'AbortError';
            throw error;
          }),
          releaseLock: vi.fn(),
        }),
      };

      const mockSession = {
        destroy: vi.fn(),
        summarize: vi.fn(),
        summarizeStreaming: vi.fn().mockReturnValue(mockStream),
      };

      global.Summarizer = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      const chunks: string[] = [];
      const generator = summarizerService.summarizeStreaming('Text', mockConfig);

      // Should not throw when aborted
      for await (const chunk of generator) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual([]);
    });

    it('should release reader lock after streaming completes', async () => {
      const releaseLockMock = vi.fn();
      const mockStream = {
        getReader: () => ({
          read: vi
            .fn()
            .mockResolvedValueOnce({ done: false, value: 'Summary' })
            .mockResolvedValueOnce({ done: true }),
          releaseLock: releaseLockMock,
        }),
      };

      const mockSession = {
        destroy: vi.fn(),
        summarize: vi.fn(),
        summarizeStreaming: vi.fn().mockReturnValue(mockStream),
      };

      global.Summarizer = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      const generator = summarizerService.summarizeStreaming('Text', mockConfig);

      for await (const chunk of generator) {
        void chunk; // consume stream
      }

      expect(releaseLockMock).toHaveBeenCalled();
    });

    it('should release reader lock even when error occurs', async () => {
      const releaseLockMock = vi.fn();
      const mockStream = {
        getReader: () => ({
          read: vi.fn().mockRejectedValue(new Error('Read error')),
          releaseLock: releaseLockMock,
        }),
      };

      const mockSession = {
        destroy: vi.fn(),
        summarize: vi.fn(),
        summarizeStreaming: vi.fn().mockReturnValue(mockStream),
      };

      global.Summarizer = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      const generator = summarizerService.summarizeStreaming('Text', mockConfig);

      try {
        for await (const chunk of generator) {
          void chunk; // consume stream
        }
      } catch {
        // Expected error
      }

      expect(releaseLockMock).toHaveBeenCalled();
    });

    it('should trim whitespace from input text', async () => {
      const mockStream = createMockStream(['Summary']);
      const mockSession = {
        destroy: vi.fn(),
        summarize: vi.fn(),
        summarizeStreaming: vi.fn().mockReturnValue(mockStream),
      };

      global.Summarizer = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      const generator = summarizerService.summarizeStreaming('  Text to summarize  ', mockConfig);

      for await (const chunk of generator) {
        void chunk; // consume stream
      }

      expect(mockSession.summarizeStreaming).toHaveBeenCalledWith(
        'Text to summarize',
        expect.any(Object)
      );
    });
  });

  describe('abortSummarization', () => {
    it('should abort ongoing summarization', async () => {
      const mockStream = {
        getReader: () => ({
          read: vi
            .fn()
            .mockResolvedValueOnce({ done: false, value: 'First' })
            .mockImplementation(async () => {
              // Simulate delay
              await new Promise((resolve) => setTimeout(resolve, 100));
              return { done: false, value: 'Second' };
            }),
          releaseLock: vi.fn(),
        }),
      };

      const mockSession = {
        destroy: vi.fn(),
        summarize: vi.fn(),
        summarizeStreaming: vi.fn().mockReturnValue(mockStream),
      };

      global.Summarizer = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      const chunks: string[] = [];
      const generator = summarizerService.summarizeStreaming('Text', mockConfig);

      const iterator = generator[Symbol.asyncIterator]();
      const firstChunk = await iterator.next();
      if (!firstChunk.done) {
        chunks.push(firstChunk.value);
      }

      // Abort summarization
      summarizerService.abortSummarization();

      // Try to get next chunk
      const secondChunk = await iterator.next();

      expect(chunks).toEqual(['First']);
      expect(secondChunk.done).toBe(true);
    });

    it('should be safe to call when no summarization is in progress', () => {
      expect(() => {
        summarizerService.abortSummarization();
      }).not.toThrow();
    });
  });

  describe('abortInitialization', () => {
    it('should be safe to call when no initialization is in progress', () => {
      expect(() => {
        summarizerService.abortInitialization();
      }).not.toThrow();
    });
  });
});
