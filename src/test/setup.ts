/**
 * Test Setup for Component/Integration Tests
 *
 * Environment: happy-dom (browser-like with DOM simulation)
 * Used by: vitest.config.ts
 * Test scope: All files - src/**\/*.{test,spec}.{ts,tsx}
 *
 * Purpose:
 * - Testing React components and UI interactions
 * - Provides full DOM APIs (document, window, etc.) via happy-dom
 * - Includes React Testing Library utilities for component testing
 * - Automatically cleans up after each test to prevent memory leaks
 *
 * Use this for:
 * - React component rendering tests
 * - User interaction testing (clicks, inputs, etc.)
 * - DOM manipulation tests
 * - Integration tests involving UI
 *
 * Note: Slower than setup.unit.ts due to DOM and React overhead,
 * but necessary for component testing.
 */

import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Extend global type declarations for test mocks
declare global {
  var Translator: Translator | undefined;
  var Summarizer: Summarizer | undefined;
  var LanguageModel: LanguageModel | undefined;
}

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Chrome APIs globally
global.chrome = {
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
    },
    sync: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
    },
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
  },
} as unknown as typeof chrome;

// Mock window.Translator
global.Translator = {
  availability: vi.fn(),
  create: vi.fn(),
};

// Mock window.Summarizer
global.Summarizer = {
  availability: vi.fn(),
  create: vi.fn(),
};

// Mock window.LanguageModel
global.LanguageModel = {
  availability: vi.fn(),
  create: vi.fn(),
  params: vi.fn(),
};
