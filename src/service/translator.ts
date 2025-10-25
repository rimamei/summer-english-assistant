// Check language pair support
export const translatorCapabilities = async (sourceLang: string, targetLang: string) => {
    const result = await window?.Translator.availability({
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
    })

    return result;
};

// Create and run the translator
export const translation = async (sourceLang: string, targetLang: string, text: string) => {
    try {
        const translatorInstance = await window.Translator.create({
            sourceLanguage: sourceLang,
            targetLanguage: targetLang,
        })

        return await translatorInstance.translate(text);
    } catch (error) {
        console.error('Error creating translator:', error);
        throw error;
    }
};

export const longTranslation = async (sourceLang: string, targetLang: string, text: string) => {
    try {
        const translatorInstance = await window.Translator.create({
            sourceLanguage: sourceLang,
            targetLanguage: targetLang,
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



