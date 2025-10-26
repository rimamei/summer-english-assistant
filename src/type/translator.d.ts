export type TTranslationCapabilitiesParams = {
    sourceLanguage: string;
    targetLanguage: string;
}

export type TTranslationParams = TTranslationCapabilitiesParams & {
    text: string;
}