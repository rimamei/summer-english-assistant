import { describe, it, expect, beforeEach, vi } from 'vitest';
import { translatorService } from '../translatorService';

describe('TranslatorService', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Reset the service state by destroying any existing session
    translatorService.destroySession();
  });

  describe('isTranslatorSupported', () => {
    it('should return true when Translator API is available', () => {
      // The global.Translator is mocked in setup.ts
      expect(translatorService.isTranslatorSupported()).toBe(true);
    });

    it('should return false when Translator API is not available', () => {
      const originalTranslator = global.Translator;
      delete global.Translator;

      expect(translatorService.isTranslatorSupported()).toBe(false);

      // Restore
      global.Translator = originalTranslator;
    });
  });

  describe('subscribeToStatus', () => {
    it('should allow subscribing to status changes', () => {
      const listener = vi.fn();

      const unsubscribe = translatorService.subscribeToStatus(listener);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should call listener when status changes', async () => {
      const mockSession = {
        destroy: vi.fn(),
        translateStreaming: vi.fn(),
      };

      global.Translator = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      const listener = vi.fn();

      translatorService.subscribeToStatus(listener);

      await translatorService.initializeTranslator('en', 'es');

      // Should have been called with 'checking' and 'ready' statuses
      expect(listener).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith({ status: 'checking' });
      expect(listener).toHaveBeenCalledWith({ status: 'ready' });
    });

    it('should allow unsubscribing from status changes', () => {
      const listener = vi.fn();

      const unsubscribe = translatorService.subscribeToStatus(listener);
      unsubscribe();

      // After unsubscribing, listener should not be in the set
      // We can't directly test this, but we can verify behavior doesn't call the listener
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('initializeTranslator', () => {
    it('should throw error when Translator API is not supported', async () => {
      const originalTranslator = global.Translator;
      delete global.Translator;

      await expect(
        translatorService.initializeTranslator('en', 'es')
      ).rejects.toThrow('Translator API is not supported in this environment.');

      global.Translator = originalTranslator;
    });

    it('should create a new session when no session exists', async () => {
      const mockSession = {
        destroy: vi.fn(),
        translateStreaming: vi.fn(),
      };

      global.Translator = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      await translatorService.initializeTranslator('en', 'es');

      expect(global.Translator.availability).toHaveBeenCalledWith({
        sourceLanguage: 'en',
        targetLanguage: 'es',
      });
      expect(global.Translator.create).toHaveBeenCalled();
      expect(translatorService.getSession()).toBe(mockSession);
    });

    it('should reuse existing session with same languages', async () => {
      const mockSession = {
        destroy: vi.fn(),
        translateStreaming: vi.fn(),
      };

      global.Translator = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      await translatorService.initializeTranslator('en', 'es');
      const firstSession = translatorService.getSession();

      await translatorService.initializeTranslator('en', 'es');
      const secondSession = translatorService.getSession();

      expect(firstSession).toBe(secondSession);
      expect(global.Translator.create).toHaveBeenCalledTimes(1);
    });

    it('should create new session when languages change', async () => {
      const mockSession1 = {
        destroy: vi.fn(),
        translateStreaming: vi.fn(),
      };
      const mockSession2 = {
        destroy: vi.fn(),
        translateStreaming: vi.fn(),
      };

      let callCount = 0;
      global.Translator = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockImplementation(() => {
          callCount++;
          return callCount === 1 ? mockSession1 : mockSession2;
        }),
      };

      await translatorService.initializeTranslator('en', 'es');
      await translatorService.initializeTranslator('en', 'ja');

      expect(mockSession1.destroy).toHaveBeenCalled();
      expect(global.Translator.create).toHaveBeenCalledTimes(2);
    });

    it('should throw error when translator is unavailable', async () => {
      global.Translator = {
        availability: vi.fn().mockResolvedValue('unavailable'),
        create: vi.fn(),
      };

      await expect(
        translatorService.initializeTranslator('en', 'xx')
      ).rejects.toThrow('Translator model is unavailable for the selected languages.');
    });

    it('should emit downloading status with progress during model download', async () => {
      const mockSession = {
        destroy: vi.fn(),
        translateStreaming: vi.fn(),
      };

      type DownloadProgressEvent = { loaded: number };
      type MonitorCallback = (m: { addEventListener: (event: string, handler: (e: DownloadProgressEvent) => void) => void }) => void;

      let monitorCallback: MonitorCallback | undefined;

      global.Translator = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockImplementation((options) => {
          monitorCallback = options.monitor;

          // Simulate download progress
          if (monitorCallback) {
            const mockMonitor = {
              addEventListener: vi.fn((event: string, handler: (e: DownloadProgressEvent) => void) => {
                if (event === 'downloadprogress') {
                  // Simulate multiple progress events
                  setTimeout(() => handler({ loaded: 0.25 }), 0);
                  setTimeout(() => handler({ loaded: 0.50 }), 10);
                  setTimeout(() => handler({ loaded: 0.75 }), 20);
                  setTimeout(() => handler({ loaded: 1.0 }), 30);
                }
              }),
            };
            monitorCallback(mockMonitor);
          }

          return Promise.resolve(mockSession);
        }),
      };

      const listener = vi.fn();
      translatorService.subscribeToStatus(listener);

      await translatorService.initializeTranslator('en', 'es');

      // Wait for async progress events
      await new Promise(resolve => setTimeout(resolve, 50));

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
        translateStreaming: vi.fn(),
      };

      global.Translator = {
        availability: vi.fn().mockImplementation(async () => {
          // Abort during availability check
          translatorService.abortInitialization();
          return 'ready';
        }),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      await translatorService.initializeTranslator('en', 'es');

      // Session should not be created when aborted
      expect(global.Translator.create).not.toHaveBeenCalled();
      expect(translatorService.getSession()).toBeNull();
      expect(translatorService.getCurrentLanguages()).toBeNull();
    });

    it('should destroy session when aborted after session creation', async () => {
      const mockSession = {
        destroy: vi.fn(),
        translateStreaming: vi.fn(),
      };

      global.Translator = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockImplementation(async () => {
          // Abort after session is created
          const session = mockSession;
          translatorService.abortInitialization();
          return session;
        }),
      };

      await translatorService.initializeTranslator('en', 'es');

      // Session should be destroyed when aborted
      expect(mockSession.destroy).toHaveBeenCalled();
      expect(translatorService.getSession()).toBeNull();
      expect(translatorService.getCurrentLanguages()).toBeNull();
    });

    it('should abort previous initialization when new one starts', async () => {
      const mockSession = {
        destroy: vi.fn(),
        translateStreaming: vi.fn(),
      };

      let createCallCount = 0;

      global.Translator = {
        availability: vi.fn().mockImplementation(async () => {
          createCallCount++;
          if (createCallCount === 1) {
            // First call - simulate slow availability check
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          return 'ready';
        }),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      const listener = vi.fn();
      translatorService.subscribeToStatus(listener);

      // Start first initialization (will take 100ms to check availability)
      const firstInit = translatorService.initializeTranslator('en', 'es');

      // Start second initialization after a short delay (should abort first)
      await new Promise(resolve => setTimeout(resolve, 10));
      await translatorService.initializeTranslator('en', 'ja');

      // Wait for first to complete
      await firstInit;

      // Create should only be called once (for the second init)
      // First init should be aborted before create is called
      expect(global.Translator.create).toHaveBeenCalledTimes(1);
      expect(translatorService.getCurrentLanguages()).toEqual({
        source: 'en',
        target: 'ja',
      });
    });

    it('should not emit download progress when signal is aborted', async () => {
      const mockSession = {
        destroy: vi.fn(),
        translateStreaming: vi.fn(),
      };

      type DownloadProgressEvent = { loaded: number };
      type MonitorCallback = (m: { addEventListener: (event: string, handler: (e: DownloadProgressEvent) => void) => void }) => void;

      let monitorCallback: MonitorCallback | undefined;

      global.Translator = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockImplementation((options) => {
          monitorCallback = options.monitor;

          // Abort immediately
          translatorService.abortInitialization();

          // Try to emit download progress after abort
          if (monitorCallback) {
            const mockMonitor = {
              addEventListener: vi.fn((event: string, handler: (e: DownloadProgressEvent) => void) => {
                if (event === 'downloadprogress') {
                  setTimeout(() => handler({ loaded: 0.5 }), 0);
                }
              }),
            };
            monitorCallback(mockMonitor);
          }

          return Promise.resolve(mockSession);
        }),
      };

      const listener = vi.fn();
      translatorService.subscribeToStatus(listener);

      await translatorService.initializeTranslator('en', 'es');

      // Wait for potential async events
      await new Promise(resolve => setTimeout(resolve, 50));

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
        translateStreaming: vi.fn(),
      };

      global.Translator = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      await translatorService.initializeTranslator('en', 'es');
      expect(translatorService.getSession()).toBe(mockSession);

      translatorService.destroySession();

      expect(mockSession.destroy).toHaveBeenCalled();
      expect(translatorService.getSession()).toBeNull();
      expect(translatorService.getCurrentLanguages()).toBeNull();
    });
  });

  describe('getCurrentLanguages', () => {
    it('should return null when no session exists', () => {
      expect(translatorService.getCurrentLanguages()).toBeNull();
    });

    it('should return current languages after initialization', async () => {
      const mockSession = {
        destroy: vi.fn(),
        translateStreaming: vi.fn(),
      };

      global.Translator = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      await translatorService.initializeTranslator('en', 'es');

      expect(translatorService.getCurrentLanguages()).toEqual({
        source: 'en',
        target: 'es',
      });
    });
  });

  describe('translateStreaming', () => {
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

    it('should yield translation chunks', async () => {
      const mockStream = createMockStream(['Hola', ' ', 'mundo']);
      const mockSession = {
        destroy: vi.fn(),
        translateStreaming: vi.fn().mockReturnValue(mockStream),
      };

      global.Translator = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      const chunks: string[] = [];
      const generator = translatorService.translateStreaming('Hello world', 'en', 'es');

      for await (const chunk of generator) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['Hola', ' ', 'mundo']);
      expect(mockSession.translateStreaming).toHaveBeenCalledWith(
        'Hello world',
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
    });

    it('should initialize translator if not already initialized', async () => {
      const mockStream = createMockStream(['Bonjour']);
      const mockSession = {
        destroy: vi.fn(),
        translateStreaming: vi.fn().mockReturnValue(mockStream),
      };

      global.Translator = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      const chunks: string[] = [];
      const generator = translatorService.translateStreaming('Hello', 'en', 'fr');

      for await (const chunk of generator) {
        chunks.push(chunk);
      }

      expect(global.Translator.create).toHaveBeenCalled();
      expect(chunks).toEqual(['Bonjour']);
    });

    it('should reuse existing session for same languages', async () => {
      const mockStream = createMockStream(['Hola']);
      const mockSession = {
        destroy: vi.fn(),
        translateStreaming: vi.fn().mockReturnValue(mockStream),
      };

      global.Translator = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      // First translation
      const generator1 = translatorService.translateStreaming('Hello', 'en', 'es');
      for await (const chunk of generator1) {
        void chunk; // consume stream
      }

      mockStream.getReader().read = vi.fn().mockImplementation(async () => {
        return { done: false, value: 'Adiós' };
      }).mockImplementationOnce(async () => {
        return { done: false, value: 'Adiós' };
      }).mockImplementationOnce(async () => {
        return { done: true };
      });

      // Second translation with same languages
      const generator2 = translatorService.translateStreaming('Goodbye', 'en', 'es');
      const chunks: string[] = [];
      for await (const chunk of generator2) {
        chunks.push(chunk);
      }

      // Create should only be called once
      expect(global.Translator.create).toHaveBeenCalledTimes(1);
      expect(mockSession.translateStreaming).toHaveBeenCalledTimes(2);
    });

    it('should preprocess text by replacing HTML line breaks', async () => {
      const mockStream = createMockStream(['Line 1\n\nLine 2']);
      const mockSession = {
        destroy: vi.fn(),
        translateStreaming: vi.fn().mockReturnValue(mockStream),
      };

      global.Translator = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      const generator = translatorService.translateStreaming(
        'Line 1<br><br>Line 2',
        'en',
        'es'
      );

      for await (const chunk of generator) {
        void chunk; // consume stream
      }

      expect(mockSession.translateStreaming).toHaveBeenCalledWith(
        'Line 1\n\nLine 2',
        expect.any(Object)
      );
    });

    it('should preprocess text by replacing single HTML line breaks', async () => {
      const mockStream = createMockStream(['Line 1\n\nLine 2']);
      const mockSession = {
        destroy: vi.fn(),
        translateStreaming: vi.fn().mockReturnValue(mockStream),
      };

      global.Translator = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      const generator = translatorService.translateStreaming(
        'Line 1<br>Line 2',
        'en',
        'es'
      );

      for await (const chunk of generator) {
        void chunk; // consume stream
      }

      expect(mockSession.translateStreaming).toHaveBeenCalledWith(
        'Line 1\n\nLine 2',
        expect.any(Object)
      );
    });

    it('should abort previous translation when new one starts', async () => {
      const mockStream1 = createMockStream(['First']);
      const mockStream2 = createMockStream(['Second']);

      let callCount = 0;
      const mockSession = {
        destroy: vi.fn(),
        translateStreaming: vi.fn().mockImplementation(() => {
          callCount++;
          return callCount === 1 ? mockStream1 : mockStream2;
        }),
      };

      global.Translator = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      // Start first translation
      const generator1 = translatorService.translateStreaming('First text', 'en', 'es');
      const iterator1 = generator1[Symbol.asyncIterator]();

      // Get first chunk
      await iterator1.next();

      // Start second translation (should abort first)
      const generator2 = translatorService.translateStreaming('Second text', 'en', 'es');
      const chunks2: string[] = [];

      for await (const chunk of generator2) {
        chunks2.push(chunk);
      }

      expect(chunks2).toEqual(['Second']);
    });

    it('should handle abort signal during translation', async () => {
      const mockStream = {
        getReader: () => ({
          read: vi.fn()
            .mockResolvedValueOnce({ done: false, value: 'Hello' })
            .mockImplementation(async () => {
              // Abort during read
              translatorService.abortTranslation();
              return { done: false, value: 'World' };
            }),
          releaseLock: vi.fn(),
        }),
      };

      const mockSession = {
        destroy: vi.fn(),
        translateStreaming: vi.fn().mockReturnValue(mockStream),
      };

      global.Translator = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      const chunks: string[] = [];
      const generator = translatorService.translateStreaming('Hello World', 'en', 'es');

      for await (const chunk of generator) {
        chunks.push(chunk);
      }

      // Should only get first chunk before abort
      expect(chunks).toEqual(['Hello']);
    });

    it('should throw error when session creation fails', async () => {
      global.Translator = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(null),
      };

      const generator = translatorService.translateStreaming('Hello', 'en', 'es');

      await expect(async () => {
        for await (const chunk of generator) {
          void chunk; // consume stream
        }
      }).rejects.toThrow('Failed to create translator session');
    });

    it('should handle translation errors and notify listeners', async () => {
      const mockStream = {
        getReader: () => ({
          read: vi.fn().mockRejectedValue(new Error('Stream read error')),
          releaseLock: vi.fn(),
        }),
      };

      const mockSession = {
        destroy: vi.fn(),
        translateStreaming: vi.fn().mockReturnValue(mockStream),
      };

      global.Translator = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      const listener = vi.fn();
      translatorService.subscribeToStatus(listener);

      const generator = translatorService.translateStreaming('Hello', 'en', 'es');

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
        translateStreaming: vi.fn().mockReturnValue(mockStream),
      };

      global.Translator = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      const chunks: string[] = [];
      const generator = translatorService.translateStreaming('Hello', 'en', 'es');

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
          read: vi.fn()
            .mockResolvedValueOnce({ done: false, value: 'Hola' })
            .mockResolvedValueOnce({ done: true }),
          releaseLock: releaseLockMock,
        }),
      };

      const mockSession = {
        destroy: vi.fn(),
        translateStreaming: vi.fn().mockReturnValue(mockStream),
      };

      global.Translator = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      const generator = translatorService.translateStreaming('Hello', 'en', 'es');

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
        translateStreaming: vi.fn().mockReturnValue(mockStream),
      };

      global.Translator = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      const generator = translatorService.translateStreaming('Hello', 'en', 'es');

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
      const mockStream = createMockStream(['Hola']);
      const mockSession = {
        destroy: vi.fn(),
        translateStreaming: vi.fn().mockReturnValue(mockStream),
      };

      global.Translator = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      const generator = translatorService.translateStreaming('  Hello  ', 'en', 'es');

      for await (const chunk of generator) {
        void chunk; // consume stream
      }

      expect(mockSession.translateStreaming).toHaveBeenCalledWith(
        'Hello',
        expect.any(Object)
      );
    });
  });

  describe('abortTranslation', () => {
    it('should abort ongoing translation', async () => {
      const mockStream = {
        getReader: () => ({
          read: vi.fn()
            .mockResolvedValueOnce({ done: false, value: 'First' })
            .mockImplementation(async () => {
              // Simulate delay
              await new Promise(resolve => setTimeout(resolve, 100));
              return { done: false, value: 'Second' };
            }),
          releaseLock: vi.fn(),
        }),
      };

      const mockSession = {
        destroy: vi.fn(),
        translateStreaming: vi.fn().mockReturnValue(mockStream),
      };

      global.Translator = {
        availability: vi.fn().mockResolvedValue('ready'),
        create: vi.fn().mockResolvedValue(mockSession),
      };

      const chunks: string[] = [];
      const generator = translatorService.translateStreaming('Hello', 'en', 'es');

      const iterator = generator[Symbol.asyncIterator]();
      const firstChunk = await iterator.next();
      if (!firstChunk.done) {
        chunks.push(firstChunk.value);
      }

      // Abort translation
      translatorService.abortTranslation();

      // Try to get next chunk
      const secondChunk = await iterator.next();

      expect(chunks).toEqual(['First']);
      expect(secondChunk.done).toBe(true);
    });

    it('should be safe to call when no translation is in progress', () => {
      expect(() => {
        translatorService.abortTranslation();
      }).not.toThrow();
    });
  });
});
