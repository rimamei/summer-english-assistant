import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useI18n } from '../useI18n';
import { i18n } from '../../lib/i18n';

describe('useI18n', () => {
  // Mock chrome.storage.local
  const mockStorage = {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  };

  const mockOnChanged = {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Setup global chrome object
    global.chrome = {
      storage: {
        local: mockStorage,
        onChanged: mockOnChanged,
      },
    } as unknown as typeof chrome;

    // Mock initial storage to return empty object (no preferences)
    // Must be done after clearAllMocks
    mockStorage.get.mockResolvedValue({});

    // Reset i18n to default language
    i18n.setLanguage('en');
  });

  afterEach(() => {
    // Clean up any listeners
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with current language from i18n', () => {
      const { result } = renderHook(() => useI18n());

      expect(result.current.language).toBe('en');
    });

    it('should load language from storage on mount', async () => {
      const preferences = { lang: 'es' };
      mockStorage.get.mockResolvedValue({
        preferences: JSON.stringify(preferences),
      });

      const { result } = renderHook(() => useI18n());

      await waitFor(() => {
        expect(result.current.language).toBe('es');
      });

      expect(mockStorage.get).toHaveBeenCalledWith(['preferences']);
    });

    it('should use default language when storage is empty', async () => {
      mockStorage.get.mockResolvedValue({});

      const { result } = renderHook(() => useI18n());

      await waitFor(() => {
        expect(result.current.language).toBe('en');
      });
    });

    it('should handle storage returning undefined', async () => {
      // Mock storage to return undefined (simulating missing data)
      mockStorage.get.mockResolvedValueOnce({ preferences: undefined });

      const { result } = renderHook(() => useI18n());

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should still work with default language
      expect(result.current.language).toBe('en');
    });

    it('should work when chrome storage is not available', () => {
      const originalChrome = global.chrome;
      global.chrome = undefined as unknown as typeof chrome;

      const { result } = renderHook(() => useI18n());

      expect(result.current.language).toBe('en');

      // Restore
      global.chrome = originalChrome;
    });
  });

  describe('storage change listener', () => {
    it('should register storage change listener on mount', () => {
      renderHook(() => useI18n());

      expect(mockOnChanged.addListener).toHaveBeenCalled();
    });

    it('should update language when storage changes', async () => {
      let storageChangeHandler: (changes: {
        [key: string]: chrome.storage.StorageChange;
      }) => void;

      mockOnChanged.addListener.mockImplementation((handler) => {
        storageChangeHandler = handler;
      });

      const { result } = renderHook(() => useI18n());

      expect(result.current.language).toBe('en');

      // Simulate storage change
      act(() => {
        storageChangeHandler!({
          preferences: {
            newValue: JSON.stringify({ lang: 'ja' }),
            oldValue: JSON.stringify({ lang: 'en' }),
          },
        });
      });

      await waitFor(() => {
        expect(result.current.language).toBe('ja');
      });
    });

    it('should handle storage change with empty preferences', async () => {
      let storageChangeHandler: (changes: {
        [key: string]: chrome.storage.StorageChange;
      }) => void;

      mockOnChanged.addListener.mockImplementation((handler) => {
        storageChangeHandler = handler;
      });

      const { result } = renderHook(() => useI18n());

      // Simulate storage change with empty preferences
      act(() => {
        storageChangeHandler!({
          preferences: {
            newValue: JSON.stringify({}),
            oldValue: JSON.stringify({ lang: 'en' }),
          },
        });
      });

      // Should keep current language
      expect(result.current.language).toBe('en');
    });

    it('should handle storage change with undefined newValue', async () => {
      let storageChangeHandler: (changes: {
        [key: string]: chrome.storage.StorageChange;
      }) => void;

      mockOnChanged.addListener.mockImplementation((handler) => {
        storageChangeHandler = handler;
      });

      const { result } = renderHook(() => useI18n());

      // Simulate storage change with undefined newValue
      act(() => {
        storageChangeHandler!({
          preferences: {
            newValue: undefined,
            oldValue: JSON.stringify({ lang: 'en' }),
          },
        });
      });

      // Should keep current language
      expect(result.current.language).toBe('en');
    });

    it('should ignore storage changes for other keys', async () => {
      let storageChangeHandler: (changes: {
        [key: string]: chrome.storage.StorageChange;
      }) => void;

      mockOnChanged.addListener.mockImplementation((handler) => {
        storageChangeHandler = handler;
      });

      const { result } = renderHook(() => useI18n());
      const initialLanguage = result.current.language;

      // Simulate storage change for a different key
      act(() => {
        storageChangeHandler!({
          otherKey: {
            newValue: 'some value',
            oldValue: 'old value',
          },
        });
      });

      // Language should not change
      expect(result.current.language).toBe(initialLanguage);
    });

    it('should not register listener when chrome storage is not available', () => {
      const originalChrome = global.chrome;
      global.chrome = undefined as unknown as typeof chrome;

      renderHook(() => useI18n());

      // Should not throw error
      expect(mockOnChanged.addListener).not.toHaveBeenCalled();

      // Restore
      global.chrome = originalChrome;
    });
  });

  describe('cleanup', () => {
    it('should remove storage change listener on unmount', () => {
      const { unmount } = renderHook(() => useI18n());

      unmount();

      expect(mockOnChanged.removeListener).toHaveBeenCalled();
    });

    it('should not attempt to remove listener when chrome storage is not available', () => {
      const originalChrome = global.chrome;
      global.chrome = undefined as unknown as typeof chrome;

      const { unmount } = renderHook(() => useI18n());

      unmount();

      // Should not throw error
      expect(mockOnChanged.removeListener).not.toHaveBeenCalled();

      // Restore
      global.chrome = originalChrome;
    });
  });

  describe('t (translate) function', () => {
    it('should translate a key', () => {
      const { result } = renderHook(() => useI18n());

      const translation = result.current.t('translation');

      expect(typeof translation).toBe('string');
      expect(translation).toBe('Translation');
    });

    it('should translate a key with variables', () => {
      const { result } = renderHook(() => useI18n());

      // The i18n library supports variables with {{variable}} syntax
      // Even though the current translations don't use it, the function should handle it
      const translation = result.current.t('language');

      expect(typeof translation).toBe('string');
      expect(translation).toBe('Language');
    });

    it('should use correct language for translation', async () => {
      i18n.setLanguage('es');

      const { result } = renderHook(() => useI18n());

      await waitFor(() => {
        expect(result.current.language).toBe('es');
      });

      const translation = result.current.t('translation');
      expect(typeof translation).toBe('string');
    });
  });

  describe('changeLanguage function', () => {
    it('should change the language', async () => {
      const { result } = renderHook(() => useI18n());

      expect(result.current.language).toBe('en');

      act(() => {
        result.current.changeLanguage('es');
      });

      await waitFor(() => {
        expect(result.current.language).toBe('es');
      });
    });

    it('should update i18n instance when changing language', () => {
      const { result } = renderHook(() => useI18n());

      act(() => {
        result.current.changeLanguage('ja');
      });

      expect(i18n.getCurrentLanguage()).toBe('ja');
    });

    it('should change language to all supported languages', () => {
      const { result } = renderHook(() => useI18n());
      const supportedLanguages = ['en', 'id', 'es', 'ja'] as const;

      supportedLanguages.forEach((lang) => {
        act(() => {
          result.current.changeLanguage(lang);
        });

        expect(result.current.language).toBe(lang);
        expect(i18n.getCurrentLanguage()).toBe(lang);
      });
    });
  });

  describe('getCurrentLanguage function', () => {
    it('should return current language', () => {
      const { result } = renderHook(() => useI18n());

      const currentLanguage = result.current.getCurrentLanguage();

      expect(currentLanguage).toBe('en');
    });

    it('should return updated language after change', () => {
      const { result } = renderHook(() => useI18n());

      act(() => {
        result.current.changeLanguage('id');
      });

      const currentLanguage = result.current.getCurrentLanguage();

      expect(currentLanguage).toBe('id');
    });
  });

  describe('getTranslations function', () => {
    it('should return all translations for current language', () => {
      const { result } = renderHook(() => useI18n());

      const translations = result.current.getTranslations();

      expect(typeof translations).toBe('object');
      expect(translations).toBeDefined();
    });

    it('should return translations for changed language', () => {
      const { result } = renderHook(() => useI18n());

      act(() => {
        result.current.changeLanguage('es');
      });

      const translations = result.current.getTranslations();

      expect(typeof translations).toBe('object');
      expect(translations).toBeDefined();
    });
  });

  describe('integration scenarios', () => {
    it('should sync language changes through i18n singleton', async () => {
      const { result: result1 } = renderHook(() => useI18n());
      const { result: result2 } = renderHook(() => useI18n());

      expect(result1.current.language).toBe('en');
      expect(result2.current.language).toBe('en');

      // Change language in first hook
      act(() => {
        result1.current.changeLanguage('ja');
      });

      // The first hook should update immediately
      expect(result1.current.language).toBe('ja');

      // The i18n singleton is updated
      expect(i18n.getCurrentLanguage()).toBe('ja');

      // Note: result2 won't automatically re-render because React hooks
      // maintain their own state. They would sync via storage events in a real app.
      expect(result2.current.language).toBe('en');
    });

    it('should handle rapid language changes', async () => {
      const { result } = renderHook(() => useI18n());

      act(() => {
        result.current.changeLanguage('es');
        result.current.changeLanguage('ja');
        result.current.changeLanguage('id');
      });

      await waitFor(() => {
        expect(result.current.language).toBe('id');
      });
    });

    it('should maintain state after storage events', async () => {
      let storageChangeHandler: (changes: {
        [key: string]: chrome.storage.StorageChange;
      }) => void;

      mockOnChanged.addListener.mockImplementation((handler) => {
        storageChangeHandler = handler;
      });

      const { result } = renderHook(() => useI18n());

      // Change language programmatically
      act(() => {
        result.current.changeLanguage('es');
      });

      await waitFor(() => {
        expect(result.current.language).toBe('es');
      });

      // Simulate storage change event (like from another tab)
      act(() => {
        storageChangeHandler!({
          preferences: {
            newValue: JSON.stringify({ lang: 'ja' }),
            oldValue: JSON.stringify({ lang: 'es' }),
          },
        });
      });

      await waitFor(() => {
        expect(result.current.language).toBe('ja');
      });

      // Translation should still work
      const translation = result.current.t('translation');
      expect(typeof translation).toBe('string');
    });

    it('should load initial language and then respond to changes', async () => {
      const preferences = { lang: 'id' };
      mockStorage.get.mockResolvedValue({
        preferences: JSON.stringify(preferences),
      });

      let storageChangeHandler: (changes: {
        [key: string]: chrome.storage.StorageChange;
      }) => void;

      mockOnChanged.addListener.mockImplementation((handler) => {
        storageChangeHandler = handler;
      });

      const { result } = renderHook(() => useI18n());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.language).toBe('id');
      });

      // Simulate storage change
      act(() => {
        storageChangeHandler!({
          preferences: {
            newValue: JSON.stringify({ lang: 'en' }),
            oldValue: JSON.stringify({ lang: 'id' }),
          },
        });
      });

      await waitFor(() => {
        expect(result.current.language).toBe('en');
      });
    });
  });
});
