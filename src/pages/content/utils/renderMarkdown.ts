// Simple markdown renderer for basic formatting
export const renderMarkdown = (text: string) => {
    if (!text) return text;

    return text
        // Bold: **text** or __text__
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        // Italic: *text* or _text_
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        // Code: `text`
        .replace(/`(.*?)`/g, '<code style="background-color: #f1f5f9; padding: 1px 4px; border-radius: 3px; font-family: monospace; font-size: 0.9em;">$1</code>')
        // Line breaks
        .replace(/\n/g, '<br>');
};