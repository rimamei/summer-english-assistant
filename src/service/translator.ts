import type { TTranslationCapabilitiesParams, TTranslationParams } from "@/type/translator";

// Check language pair support
export const translatorCapabilities = async ({ sourceLanguage, targetLanguage }: TTranslationCapabilitiesParams) => {
    const result = await window?.Translator.availability({
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
    })

    return result;
};

// Create and run the translator
export const getTranslation = async ({ sourceLanguage, targetLanguage, text }: TTranslationParams) => {
    try {
        const translatorInstance = await window.Translator.create({
            sourceLanguage: sourceLanguage,
            targetLanguage: targetLanguage,
        })

        return await translatorInstance.translate(text);
    } catch (error) {
        console.error('Error creating translator:', error);
        throw error;
    }
};

export const longTranslation = async ({ sourceLanguage, targetLanguage, text }: TTranslationParams) => {
    try {
        const translatorInstance = await window.Translator.create({
            sourceLanguage: sourceLanguage,
            targetLanguage: targetLanguage,
        });

        const stream = translatorInstance.translateStreaming(text);
        for await (const chunk of stream) {
            console.log(chunk);
        }
    } catch (error) {
        console.error('Error creating translator:', error);
        throw error;
    }
};



