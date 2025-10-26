import type { TTranslationParams } from "@/type/translator";

export const summarizerAvailable = async () => {
    const availability = await window?.Summarizer.availability()

    if (availability === 'unavailable') {
        alert("The Summarizer API isn't usable on this browser.");
        return;
    }

    return availability;
};

export const getSummary = async ({ sourceLanguage, targetLanguage, text }: TTranslationParams) => {
    try {
        const options = {
            type: "key-points",
            expectedInputLanguages: ["en", sourceLanguage],
            outputLanguage: targetLanguage,
            expectedContextLanguages: ["en"]
        }

        const summarizer = await window.Summarizer.create(options);

        const summary = await summarizer.summarize(text, {
            context: 'This article is intended for english learners.',
        });

        return summary;
    } catch (error) {
        console.error('Error creating translator:', error);
        throw error;
    }
};


