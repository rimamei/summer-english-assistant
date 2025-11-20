import { languages } from '@/constants/language';

chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    const language = chrome.i18n.getUILanguage();

    const defautLanguage = languages.includes(language) ? language.split('-')[0] : 'en';

    const preferenceData = {
      lang: defautLanguage,
      theme: 'light',
      agent: 'chrome',
    };

    const configurationData = {
      source_lang: 'en',
      target_lang: 'id',
      mode: 'translation',
      accent: 'american',
      selector: 'context',
      summarizer_type: 'headline',
      summarizer_length: 'short',
    };

    chrome.storage.local.set({
      preferences: JSON.stringify(preferenceData),
      ext_status: true,
      settings: JSON.stringify(configurationData),
    });
  }
});

// Handle screenshot capture
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === 'CAPTURE_SCREENSHOT') {
    // Capture the visible tab
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const tab = tabs[0];
      if (!tab || typeof tab.id !== 'number') {
        sendResponse({ error: 'No active tab found' });
        return;
      }
      chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' }, dataUrl => {
        if (chrome.runtime.lastError) {
          sendResponse({ error: chrome.runtime.lastError.message });
        } else if (!dataUrl) {
          sendResponse({ error: 'No data URL returned' });
        } else {
          sendResponse({ dataUrl });
        }
      });
    });
    return true;
  }
});
