import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getLocalStorage,
  getLocalStorageMultiple,
  setLocalStorage,
  setLocalStorageMultiple,
  removeLocalStorage,
  removeLocalStorageMultiple,
  clearLocalStorage,
} from '../storage';

describe('storage utilities', () => {
  // Mock chrome.storage.local
  const mockStorage = {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Setup global chrome object
    global.chrome = {
      storage: {
        local: mockStorage,
      },
    } as unknown as typeof chrome;
  });

  describe('getLocalStorage', () => {
    it('should get a JSON value from storage', async () => {
      const testData = { name: 'test', value: 123 };
      mockStorage.get.mockResolvedValue({ testKey: JSON.stringify(testData) });

      const result = await getLocalStorage('testKey');

      expect(mockStorage.get).toHaveBeenCalledWith(['testKey']);
      expect(result).toEqual(testData);
    });

    it('should get a primitive string value from storage', async () => {
      mockStorage.get.mockResolvedValue({ testKey: 'simple string' });

      const result = await getLocalStorage<string>('testKey');

      expect(result).toBe('simple string');
    });

    it('should get a primitive number value from storage', async () => {
      mockStorage.get.mockResolvedValue({ testKey: 42 });

      const result = await getLocalStorage<number>('testKey');

      expect(result).toBe(42);
    });

    it('should return null if key does not exist', async () => {
      mockStorage.get.mockResolvedValue({});

      const result = await getLocalStorage('nonexistent');

      expect(result).toBeNull();
    });

    it('should return null if chrome.storage is not available', async () => {
      global.chrome = undefined!;

      const result = await getLocalStorage('testKey');

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      mockStorage.get.mockRejectedValue(new Error('Storage error'));

      const result = await getLocalStorage('testKey');

      expect(result).toBeNull();
    });

    it('should handle non-JSON values gracefully', async () => {
      mockStorage.get.mockResolvedValue({ testKey: 'not a JSON' });

      const result = await getLocalStorage('testKey');

      expect(result).toBe('not a JSON');
    });
  });

  describe('getLocalStorageMultiple', () => {
    it('should get multiple JSON values from storage', async () => {
      const testData1 = { name: 'test1' };
      const testData2 = { name: 'test2' };
      mockStorage.get.mockResolvedValue({
        key1: JSON.stringify(testData1),
        key2: JSON.stringify(testData2),
      });

      const result = await getLocalStorageMultiple(['key1', 'key2']);

      expect(mockStorage.get).toHaveBeenCalledWith(['key1', 'key2']);
      expect(result).toEqual({ key1: testData1, key2: testData2 });
    });

    it('should handle mixed value types', async () => {
      mockStorage.get.mockResolvedValue({
        key1: JSON.stringify({ name: 'test' }),
        key2: 'simple string',
        key3: 42,
      });

      const result = await getLocalStorageMultiple(['key1', 'key2', 'key3']);

      expect(result).toEqual({
        key1: { name: 'test' },
        key2: 'simple string',
        key3: 42,
      });
    });

    it('should skip missing keys', async () => {
      mockStorage.get.mockResolvedValue({
        key1: JSON.stringify({ name: 'test' }),
      });

      const result = await getLocalStorageMultiple(['key1', 'key2', 'key3']);

      expect(result).toEqual({ key1: { name: 'test' } });
    });

    it('should return empty object if chrome.storage is not available', async () => {
      global.chrome = undefined!;

      const result = await getLocalStorageMultiple(['key1', 'key2']);

      expect(result).toEqual({});
    });

    it('should return empty object on error', async () => {
      mockStorage.get.mockRejectedValue(new Error('Storage error'));

      const result = await getLocalStorageMultiple(['key1', 'key2']);

      expect(result).toEqual({});
    });
  });

  describe('setLocalStorage', () => {
    it('should set a JSON object value', async () => {
      const testData = { name: 'test', value: 123 };
      mockStorage.set.mockResolvedValue(undefined);

      const result = await setLocalStorage('testKey', testData);

      expect(mockStorage.set).toHaveBeenCalledWith({
        testKey: JSON.stringify(testData),
      });
      expect(result).toBe(true);
    });

    it('should set a primitive string value', async () => {
      mockStorage.set.mockResolvedValue(undefined);

      const result = await setLocalStorage('testKey', 'simple string');

      expect(mockStorage.set).toHaveBeenCalledWith({
        testKey: 'simple string',
      });
      expect(result).toBe(true);
    });

    it('should set a primitive number value', async () => {
      mockStorage.set.mockResolvedValue(undefined);

      const result = await setLocalStorage('testKey', 42);

      expect(mockStorage.set).toHaveBeenCalledWith({
        testKey: 42,
      });
      expect(result).toBe(true);
    });

    it('should set an array value', async () => {
      const testArray = [1, 2, 3];
      mockStorage.set.mockResolvedValue(undefined);

      const result = await setLocalStorage('testKey', testArray);

      expect(mockStorage.set).toHaveBeenCalledWith({
        testKey: JSON.stringify(testArray),
      });
      expect(result).toBe(true);
    });

    it('should return false if chrome.storage is not available', async () => {
      global.chrome = undefined!;

      const result = await setLocalStorage('testKey', 'value');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockStorage.set.mockRejectedValue(new Error('Storage error'));

      const result = await setLocalStorage('testKey', 'value');

      expect(result).toBe(false);
    });
  });

  describe('setLocalStorageMultiple', () => {
    it('should set multiple values with mixed types', async () => {
      mockStorage.set.mockResolvedValue(undefined);

      const items = {
        key1: { name: 'test' },
        key2: 'simple string',
        key3: 42,
      };

      const result = await setLocalStorageMultiple(items);

      expect(mockStorage.set).toHaveBeenCalledWith({
        key1: JSON.stringify({ name: 'test' }),
        key2: 'simple string',
        key3: 42,
      });
      expect(result).toBe(true);
    });

    it('should set multiple object values', async () => {
      mockStorage.set.mockResolvedValue(undefined);

      const items = {
        user: { name: 'John', age: 30 },
        settings: { theme: 'dark', notifications: true },
      };

      const result = await setLocalStorageMultiple(items);

      expect(mockStorage.set).toHaveBeenCalledWith({
        user: JSON.stringify({ name: 'John', age: 30 }),
        settings: JSON.stringify({ theme: 'dark', notifications: true }),
      });
      expect(result).toBe(true);
    });

    it('should return false if chrome.storage is not available', async () => {
      global.chrome = undefined!;

      const result = await setLocalStorageMultiple({ key1: 'value1' });

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockStorage.set.mockRejectedValue(new Error('Storage error'));

      const result = await setLocalStorageMultiple({ key1: 'value1' });

      expect(result).toBe(false);
    });
  });

  describe('removeLocalStorage', () => {
    it('should remove a key from storage', async () => {
      mockStorage.remove.mockResolvedValue(undefined);

      const result = await removeLocalStorage('testKey');

      expect(mockStorage.remove).toHaveBeenCalledWith('testKey');
      expect(result).toBe(true);
    });

    it('should return false if chrome.storage is not available', async () => {
      global.chrome = undefined!;

      const result = await removeLocalStorage('testKey');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockStorage.remove.mockRejectedValue(new Error('Storage error'));

      const result = await removeLocalStorage('testKey');

      expect(result).toBe(false);
    });
  });

  describe('removeLocalStorageMultiple', () => {
    it('should remove multiple keys from storage', async () => {
      mockStorage.remove.mockResolvedValue(undefined);

      const result = await removeLocalStorageMultiple(['key1', 'key2', 'key3']);

      expect(mockStorage.remove).toHaveBeenCalledWith(['key1', 'key2', 'key3']);
      expect(result).toBe(true);
    });

    it('should return false if chrome.storage is not available', async () => {
      global.chrome = undefined!;

      const result = await removeLocalStorageMultiple(['key1', 'key2']);

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockStorage.remove.mockRejectedValue(new Error('Storage error'));

      const result = await removeLocalStorageMultiple(['key1', 'key2']);

      expect(result).toBe(false);
    });
  });

  describe('clearLocalStorage', () => {
    it('should clear all storage', async () => {
      mockStorage.clear.mockResolvedValue(undefined);

      const result = await clearLocalStorage();

      expect(mockStorage.clear).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false if chrome.storage is not available', async () => {
      global.chrome = undefined!;

      const result = await clearLocalStorage();

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockStorage.clear.mockRejectedValue(new Error('Storage error'));

      const result = await clearLocalStorage();

      expect(result).toBe(false);
    });
  });

  describe('integration scenarios', () => {
    it('should set and get a value correctly', async () => {
      const testData = { name: 'Integration Test', value: 999 };
      let storedValue: string;

      // Mock set to capture the value
      mockStorage.set.mockImplementation((items) => {
        storedValue = items.testKey;
        return Promise.resolve();
      });

      // Mock get to return the captured value
      mockStorage.get.mockImplementation(() => {
        return Promise.resolve({ testKey: storedValue });
      });

      await setLocalStorage('testKey', testData);
      const result = await getLocalStorage('testKey');

      expect(result).toEqual(testData);
    });

    it('should set multiple and get multiple values correctly', async () => {
      const testData = {
        user: { name: 'John' },
        count: 5,
        active: 'yes',
      };
      let storedValues: Record<string, unknown> = {};

      // Mock set to capture the values
      mockStorage.set.mockImplementation((items) => {
        storedValues = { ...storedValues, ...items };
        return Promise.resolve();
      });

      // Mock get to return the captured values
      mockStorage.get.mockImplementation((keys) => {
        const result: Record<string, unknown> = {};
        for (const key of keys) {
          if (storedValues[key]) {
            result[key] = storedValues[key];
          }
        }
        return Promise.resolve(result);
      });

      await setLocalStorageMultiple(testData);
      const result = await getLocalStorageMultiple(['user', 'count', 'active']);

      expect(result).toEqual({
        user: { name: 'John' },
        count: 5,
        active: 'yes',
      });
    });
  });
});
