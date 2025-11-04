import { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * Custom hook to safely render markdown to HTML
 * @param text - The markdown text to render
 * @param fallback - Optional fallback text if rendering fails
 * @returns Sanitized HTML string
 */
export const useSafeMarkdown = (text: string, fallback?: string): string => {
  return useMemo(() => {
    try {
      const content = text || fallback || '';
      if (!content) return '';

      const html = marked.parse(content, { breaks: true, async: false }) as string;

      // DOMPurify needs window.document, which should be available in content script
      if (typeof window !== 'undefined' && window.document) {
        return DOMPurify.sanitize(html);
      }

      return html;
    } catch {
      return text || fallback || '';
    }
  }, [text, fallback]);
};
