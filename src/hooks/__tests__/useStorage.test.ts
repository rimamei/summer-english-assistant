import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useStorage } from '../useStorage';
import type { IConfiguration } from '@/type';

describe('useStorage', () => {
  const mockGet = vi.fn();
  const mockOnChanged = {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  };

  const mockSettings: IConfiguration = {
    source_lang: 'en',
    target_lang: 'id',
    mode: 'translation',
    selector: 'context',
    accent: 'american',
    summarizer_type: 'headline',
    summarizer_length: 'short',
  };

  const mockPreferences = {
    theme: 'light' as const,
    lang: 'en' as const,
    agent: 'openai' as const,
    model: 'gpt-4',
    apiKey: 'test-api-key',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    global.chrome = {
      storage: {
        local: {
          get: mockGet,
        },
        onChanged: mockOnChanged,
      },
    } as unknown as typeof chrome;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Loading', () => {
    it('should load settings and preferences on mount', async () => {
      mockGet.mockImplementation((keys: string | string[]) => {
        const keysArray = Array.isArray(keys) ? keys : [keys];
        const result: Record<string, unknown> = {};

        if (keysArray.includes('settings')) {
          result.settings = JSON.stringify(mockSettings);
        }
        if (keysArray.includes('preferences')) {
          result.preferences = JSON.stringify(mockPreferences);
        }
        if (keysArray.includes('ext_status')) {
          result.ext_status = true;
        }

        return Promise.resolve(result);
      });

      const { result } = renderHook(() => useStorage());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settingsData).toEqual(mockSettings);
      expect(result.current.preferences?.ext_status).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should handle missing settings gracefully', async () => {
      mockGet.mockImplementation((keys: string | string[]) => {
        const keysArray = Array.isArray(keys) ? keys : [keys];
        const result: Record<string, unknown> = {};

        if (keysArray.includes('preferences')) {
          result.preferences = JSON.stringify(mockPreferences);
        }
        if (keysArray.includes('ext_status')) {
          result.ext_status = true;
        }

        return Promise.resolve(result);
      });

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settingsData).toBeUndefined();
      expect(result.current.preferences).toBeDefined();
    });

    it('should handle missing preferences gracefully', async () => {
      mockGet.mockImplementation((keys: string | string[]) => {
        const keysArray = Array.isArray(keys) ? keys : [keys];
        const result: Record<string, unknown> = {};

        if (keysArray.includes('settings')) {
          result.settings = JSON.stringify(mockSettings);
        }

        return Promise.resolve(result);
      });

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settingsData).toEqual(mockSettings);
      expect(result.current.preferences).toBeUndefined();
    });

    it('should return null when chrome.storage is not available', async () => {
      global.chrome = undefined as unknown as typeof chrome;

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settingsData).toBeUndefined();
      expect(result.current.preferences).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle settings loading error gracefully', async () => {
      // Storage utilities catch errors and return null, so errors don't propagate
      mockGet.mockImplementation((keys: string | string[]) => {
        const keysArray = Array.isArray(keys) ? keys : [keys];

        if (keysArray.includes('settings')) {
          return Promise.reject(new Error('Failed'));
        }

        const result: Record<string, unknown> = {};
        if (keysArray.includes('preferences')) {
          result.preferences = JSON.stringify(mockPreferences);
        }
        if (keysArray.includes('ext_status')) {
          result.ext_status = true;
        }

        return Promise.resolve(result);
      });

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.settingsData).toBeUndefined();
    });

    it('should handle preferences loading error gracefully', async () => {
      // Storage utilities catch errors and return null, so errors don't propagate
      mockGet.mockImplementation((keys: string | string[]) => {
        const keysArray = Array.isArray(keys) ? keys : [keys];

        if (keysArray.includes('settings')) {
          return Promise.resolve({ settings: JSON.stringify(mockSettings) });
        }

        return Promise.reject(new Error('Failed'));
      });

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.preferences).toBeUndefined();
    });

    it('should handle non-Error exceptions gracefully', async () => {
      // Storage utilities catch errors and return null, so errors don't propagate
      mockGet.mockImplementation((keys: string | string[]) => {
        const keysArray = Array.isArray(keys) ? keys : [keys];

        if (keysArray.includes('settings')) {
          return Promise.reject('String error');
        }

        return Promise.resolve({});
      });

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Storage Change Listeners', () => {
    beforeEach(() => {
      mockGet.mockImplementation((keys: string | string[]) => {
        const keysArray = Array.isArray(keys) ? keys : [keys];
        const result: Record<string, unknown> = {};

        if (keysArray.includes('settings')) {
          result.settings = JSON.stringify(mockSettings);
        }
        if (keysArray.includes('preferences')) {
          result.preferences = JSON.stringify(mockPreferences);
        }
        if (keysArray.includes('ext_status')) {
          result.ext_status = true;
        }

        return Promise.resolve(result);
      });
    });

    it('should listen for settings changes', async () => {
      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockOnChanged.addListener).toHaveBeenCalled();

      const storageChangeHandler = mockOnChanged.addListener.mock.calls[0][0];
      const updatedSettings: IConfiguration = {
        source_lang: 'en',
        target_lang: 'en',
        mode: 'summarizer',
        selector: 'context',
        accent: 'british',
        summarizer_type: 'headline',
        summarizer_length: 'long',
      };

      act(() => {
        storageChangeHandler({
          settings: {
            newValue: JSON.stringify(updatedSettings),
            oldValue: JSON.stringify(mockSettings),
          },
        });
      });

      await waitFor(() => {
        expect(result.current.settingsData).toEqual(updatedSettings);
      });
    });

    it('should listen for theme changes', async () => {
      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const storageChangeHandler = mockOnChanged.addListener.mock.calls[0][0];

      act(() => {
        storageChangeHandler({
          theme: {
            newValue: 'dark',
            oldValue: 'light',
          },
        });
      });

      await waitFor(() => {
        expect(result.current.preferences?.theme).toBe('dark');
      });
    });

    it('should listen for preferences changes', async () => {
      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const storageChangeHandler = mockOnChanged.addListener.mock.calls[0][0];
      const updatedPreferences = { ...mockPreferences, lang: 'id' as const };

      act(() => {
        storageChangeHandler({
          preferences: {
            newValue: JSON.stringify(updatedPreferences),
            oldValue: JSON.stringify(mockPreferences),
          },
        });
      });

      await waitFor(() => {
        expect(result.current.preferences?.lang).toBe('id');
      });
    });

    it('should listen for ext_status changes', async () => {
      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const storageChangeHandler = mockOnChanged.addListener.mock.calls[0][0];

      act(() => {
        storageChangeHandler({
          ext_status: {
            newValue: false,
            oldValue: true,
          },
        });
      });

      await waitFor(() => {
        expect(result.current.preferences?.ext_status).toBe(false);
      });
    });

    it('should not update theme if preferences is undefined', async () => {
      mockGet.mockImplementation(() => {
        return Promise.resolve({});
      });

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const storageChangeHandler = mockOnChanged.addListener.mock.calls[0][0];

      act(() => {
        storageChangeHandler({
          theme: {
            newValue: 'dark',
            oldValue: 'light',
          },
        });
      });

      await waitFor(() => {
        expect(result.current.preferences).toBeUndefined();
      });
    });

    it('should remove listener on unmount', async () => {
      const { unmount } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(mockOnChanged.addListener).toHaveBeenCalled();
      });

      unmount();

      expect(mockOnChanged.removeListener).toHaveBeenCalled();
    });

    it('should not add listener if chrome.storage.onChanged is not available', async () => {
      global.chrome = {} as unknown as typeof chrome;

      renderHook(() => useStorage());

      await waitFor(() => {
        expect(mockOnChanged.addListener).not.toHaveBeenCalled();
      });
    });
  });

  describe('Returned Values', () => {
    it('should return correct computed values', async () => {
      mockGet.mockImplementation((keys: string | string[]) => {
        const keysArray = Array.isArray(keys) ? keys : [keys];
        const result: Record<string, unknown> = {};

        if (keysArray.includes('settings')) {
          result.settings = JSON.stringify(mockSettings);
        }
        if (keysArray.includes('preferences')) {
          result.preferences = JSON.stringify(mockPreferences);
        }
        if (keysArray.includes('ext_status')) {
          result.ext_status = true;
        }

        return Promise.resolve(result);
      });

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.sourceLanguage).toBe('en');
      expect(result.current.targetLanguage).toBe('id');
      expect(result.current.mode).toBe('translation');
      expect(result.current.enableExtension).toBe(true);
      expect(result.current.isLightTheme).toBe(true);
      expect(result.current.lang).toBe('en');
    });

    it('should return undefined for settings-related values when settings is null', async () => {
      mockGet.mockImplementation((keys: string | string[]) => {
        const keysArray = Array.isArray(keys) ? keys : [keys];
        const result: Record<string, unknown> = {};

        if (keysArray.includes('preferences')) {
          result.preferences = JSON.stringify(mockPreferences);
        }
        if (keysArray.includes('ext_status')) {
          result.ext_status = true;
        }

        return Promise.resolve(result);
      });

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.sourceLanguage).toBeUndefined();
      expect(result.current.targetLanguage).toBeUndefined();
      expect(result.current.mode).toBeUndefined();
    });

    it('should default isLightTheme to true when theme is not available', async () => {
      mockGet.mockImplementation((keys: string | string[]) => {
        const keysArray = Array.isArray(keys) ? keys : [keys];
        const result: Record<string, unknown> = {};

        if (keysArray.includes('settings')) {
          result.settings = JSON.stringify(mockSettings);
        }

        return Promise.resolve(result);
      });

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isLightTheme).toBe(true);
    });
  });
});
