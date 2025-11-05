import { GoogleGenAI, type FunctionDeclaration } from '@google/genai';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_TOKEN;

const getApiKey = async (): Promise<string> => {
    // Retrieve the API key from Chrome storage with fallback to environment variable
    const result = await chrome.storage.local.get('gemini_api_key');
    return result.gemini_api_key || GEMINI_API_KEY;
}

export const generateStream = async (model: string, content: string, config?: FunctionDeclaration) => {
    const apiKey: string = await getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContentStream({
        model: model,
        contents: content,
        config
    });

    return response;
}



