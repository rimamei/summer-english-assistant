/**
 * Utility functions for Chrome local storage operations
 */

/**
 * Get a value from Chrome local storage
 * @param key - The storage key to retrieve
 * @returns The parsed value or null if not found
 */
export async function getLocalStorage<T = unknown>(key: string): Promise<T | null> {
  try {
    if (!chrome?.storage?.local) {
      return null;
    }

    const result = await chrome.storage.local.get([key]);

    if (!result[key]) {
      return null;
    }

    // Try to parse as JSON, if it fails return the raw value
    try {
      return JSON.parse(result[key]) as T;
    } catch {
      return result[key] as T;
    }
  } catch {
    return null;
  }
}

/**
 * Get multiple values from Chrome local storage
 * @param keys - Array of storage keys to retrieve
 * @returns An object with the requested keys and their values
 */
export async function getLocalStorageMultiple<T extends Record<string, unknown>>(
  keys: string[]
): Promise<Partial<T>> {
  try {
    if (!chrome?.storage?.local) {
      return {};
    }

    const result = await chrome.storage.local.get(keys);
    const parsed: Partial<T> = {};

    for (const key of keys) {
      if (result[key]) {
        try {
          parsed[key as keyof T] = JSON.parse(result[key]) as T[keyof T];
        } catch {
          parsed[key as keyof T] = result[key] as T[keyof T];
        }
      }
    }

    return parsed;
  } catch {
    return {};
  }
}

/**
 * Set a value in Chrome local storage
 * @param key - The storage key to set
 * @param value - The value to store (will be JSON stringified if it's an object)
 */
export async function setLocalStorage<T = unknown>(
  key: string,
  value: T
): Promise<boolean> {
  try {
    if (!chrome?.storage?.local) {
      return false;
    }

    const storageValue =
      typeof value === 'object' ? JSON.stringify(value) : value;

    await chrome.storage.local.set({ [key]: storageValue });
    return true;
  } catch {
    return false;
  }
}

/**
 * Set multiple values in Chrome local storage
 * @param items - An object with key-value pairs to store
 */
export async function setLocalStorageMultiple<T extends Record<string, unknown>>(
  items: T
): Promise<boolean> {
  try {
    if (!chrome?.storage?.local) {
      return false;
    }

    const storageItems: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(items)) {
      storageItems[key] =
        typeof value === 'object' ? JSON.stringify(value) : value;
    }

    await chrome.storage.local.set(storageItems);
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove a value from Chrome local storage
 * @param key - The storage key to remove
 */
export async function removeLocalStorage(key: string): Promise<boolean> {
  try {
    if (!chrome?.storage?.local) {
      return false;
    }

    await chrome.storage.local.remove(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove multiple values from Chrome local storage
 * @param keys - Array of storage keys to remove
 */
export async function removeLocalStorageMultiple(keys: string[]): Promise<boolean> {
  try {
    if (!chrome?.storage?.local) {
      return false;
    }

    await chrome.storage.local.remove(keys);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear all data from Chrome local storage
 */
export async function clearLocalStorage(): Promise<boolean> {
  try {
    if (!chrome?.storage?.local) {
      return false;
    }

    await chrome.storage.local.clear();
    return true;
  } catch {
    return false;
  }
}
