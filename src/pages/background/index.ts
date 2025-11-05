import { languages } from "@/constants/language";

chrome.runtime.onInstalled.addListener((details) => {
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
        }

        chrome.storage.local.set({
            preferences: JSON.stringify(preferenceData),
            ext_status: false,
            settings: JSON.stringify(configurationData),
        });

    }
});