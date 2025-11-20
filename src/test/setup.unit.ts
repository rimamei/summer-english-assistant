/**
 * Test Setup for Fast Unit Tests
 *
 * Environment: node (pure Node.js, no DOM)
 * Used by: vitest.config.unit.ts
 * Test scope: Services & utilities only - src/{services,utils}/**\/*.{test,spec}.{ts,tsx}
 *
 * Purpose:
 * - Fast testing of pure business logic and utility functions
 * - No React or DOM overhead for maximum performance
 * - Manually mocks minimal browser globals needed for Chrome extension APIs
 * - Ideal for TDD and rapid test iteration
 *
 * Use this for:
 * - Utility function tests (parsers, formatters, validators, etc.)
 * - Service layer logic (API calls, data transformations)
 * - Business logic that doesn't involve UI
 * - Pure functions and algorithms
 *
 * Performance benefit: ~3-5x faster test startup compared to setup.ts
 * because it skips React Testing Library and DOM simulation.
 *
 * Why manually mock browser globals?
 * - Node environment doesn't have window/self by default
 * - We need these for Chrome extension APIs to work
 * - This is lighter than loading a full DOM environment
 */

import { vi } from 'vitest';

// Extend global type declarations for test mocks
declare global {
  var Translator: Translator | undefined;
  var Summarizer: Summarizer | undefined;
  var LanguageModel: LanguageModel | undefined;
}

// Mock browser globals for Node environment
global.self = global as unknown as Window & typeof globalThis;
global.window = global as unknown as Window & typeof globalThis;

// Mock Chrome APIs globally (no React imports = much faster)
global.chrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    },
    sync: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
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
