export const promptAvailability = async () => {
    const result = await window?.LanguageModel.availability()

    return result;
};

let session: LanguageModelSession | undefined;

export const runPrompt = async (prompt: string) => {
   if (!session) {
      session = await window.LanguageModel.create();
    }
    return session.prompt(prompt);
}
