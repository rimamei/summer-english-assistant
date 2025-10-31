import { accentOptionsBase, languageExtensionOptionsBase, modeOptionsBase, selectorOptionsBase, sourceLangOptionsBase, summarizerLengthOptionsBase, summarizerTypeOptionsBase, targetLangOptionsBase, themeOptionsBase } from "@/pages/popup/constants";
import { useI18n } from "./useI18n";

// Hook to get translated options
export const useTranslatedOptions = () => {
    const { t } = useI18n();

    return {
        modeOptions: modeOptionsBase.map(option => ({
            value: option.value,
            label: t(option.labelKey)
        })),
        
        targetLangOptions: targetLangOptionsBase.map(option => ({
            value: option.value,
            label: t(option.labelKey)
        })),
        
        sourceLangOptions: sourceLangOptionsBase.map(option => ({
            value: option.value,
            label: t(option.labelKey)
        })),
        
        selectorOptions: selectorOptionsBase.map(option => ({
            value: option.value,
            label: t(option.labelKey)
        })),
        
        accentOptions: accentOptionsBase.map(option => ({
            value: option.value,
            label: t(option.labelKey)
        })),

        summarizerTypeOptions: summarizerTypeOptionsBase.map(option => ({
            value: option.value,
            label: t(option.labelKey)
        })),

        summarizerLengthOptions: summarizerLengthOptionsBase.map(option => ({
            value: option.value,
            label: t(option.labelKey)
        })),

        themeOptions: themeOptionsBase.map(option => ({
            value: option.value,
            label: t(option.labelKey)
        })),

        languageExtensionOptions: languageExtensionOptionsBase.map(option => ({
            value: option.value,
            label: t(option.labelKey)
        })),
    };
};