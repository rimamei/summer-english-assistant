/**
 * Utility to inject Chrome Origin Trial token into web pages
 * This is required for Chrome's built-in AI features to work on websites
 */

export const injectOriginTrialToken = (): void => {
  // Check if we have a valid token
  const token = import.meta.env.VITE_CHROME_PROMPT_TOKEN || '';

  if (!token || token.trim() === '') {
    return;
  }

  // Check if the meta tag already exists
  const existingMeta = document.querySelector('meta[http-equiv="origin-trial"]');
  if (existingMeta) {
    return;
  }

  // Create and inject the origin trial meta tag
  const meta = document.createElement('meta');
  meta.setAttribute('http-equiv', 'origin-trial');
  meta.setAttribute('content', token);

  // Insert into head if available, otherwise into document
  const head = document.head || document.getElementsByTagName('head')[0];
  if (head) {
    head.appendChild(meta);
  } else {
    // Fallback: insert at the beginning of the document
    document.documentElement.insertBefore(meta, document.documentElement.firstChild);
  }
};

/**
 * Initialize origin trial token injection
 * Should be called early in the content script lifecycle
 */
export const initializeOriginTrial = (): void => {
  // Inject immediately if document is already loaded
  if (document.readyState !== 'loading') {
    injectOriginTrialToken();
  } else {
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', injectOriginTrialToken);
  }

  // Also try to inject on document ready as a fallback
  if (document.readyState === 'complete') {
    setTimeout(injectOriginTrialToken, 0);
  }
};