import { GoogleGenAI, type GenerateContentParameters } from '@google/genai';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_TOKEN;

const getApiKey = async (): Promise<string> => {
    // Retrieve the API key from Chrome storage with fallback to environment variable
    const result = await chrome.storage.local.get('gemini_api_key');
    return result.gemini_api_key || GEMINI_API_KEY;
}

export const generateStream = async ({ model, contents, config }: GenerateContentParameters, onChunk?: (text: string) => void) => {
    try {
        const apiKey: string = await getApiKey();
        const ai = new GoogleGenAI({ apiKey })

        const response = await ai.models.generateContentStream({
            model,
            contents,
            config
        });

        let resultText = '';
        for await (const chunk of response) {
            const chunkText = chunk.text || '';
            resultText += chunkText;

            if (onChunk) {
                onChunk(resultText);
            }
        }

        return resultText;
    } catch (error) {
        console.error('Error streaming Gemini response:', error);
        throw error;
    }

}



