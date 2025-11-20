import { describe, it, expect } from 'vitest';
import { normalizeLanguage } from '../normalizeLanguage';

describe('normalizeLanguage', () => {
  it('should return "en" for supported language "en"', () => {
    expect(normalizeLanguage('en')).toBe('en');
  });

  it('should return "ja" for supported language "ja"', () => {
    expect(normalizeLanguage('ja')).toBe('ja');
  });

  it('should return "es" for supported language "es"', () => {
    expect(normalizeLanguage('es')).toBe('es');
  });

  it('should return "en" for unsupported language', () => {
    expect(normalizeLanguage('fr')).toBe('en');
    expect(normalizeLanguage('de')).toBe('en');
    expect(normalizeLanguage('zh')).toBe('en');
  });

  it('should handle uppercase language codes', () => {
    expect(normalizeLanguage('EN')).toBe('en');
    expect(normalizeLanguage('JA')).toBe('ja');
    expect(normalizeLanguage('ES')).toBe('es');
  });

  it('should handle mixed case language codes', () => {
    expect(normalizeLanguage('En')).toBe('en');
    expect(normalizeLanguage('jA')).toBe('ja');
  });

  it('should trim whitespace from language codes', () => {
    expect(normalizeLanguage('  en  ')).toBe('en');
    expect(normalizeLanguage(' ja ')).toBe('ja');
  });

  it('should return "en" for empty string', () => {
    expect(normalizeLanguage('')).toBe('en');
  });

  it('should return "en" for whitespace-only string', () => {
    expect(normalizeLanguage('   ')).toBe('en');
  });

  it('should return "en" for null-like values', () => {
    expect(normalizeLanguage(null)).toBe('en');
    expect(normalizeLanguage(undefined)).toBe('en');
  });
});
