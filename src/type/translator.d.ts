// TRANSLATOR API TYPES
// Based on https://developer.mozilla.org/en-us/docs/web/api/translator
interface Window {
    Translator: Translator
}

/**
 * Translator interface, including all related translation functions
 * Including checking AI model availability, creating new Translator instances, performing translations, etc.
 */
declare interface Translator {
    /**
     * Check the availability of the AI model
     * @param options translator configuration options
     * @returns an enumerated value that indicates the availability of the AI model
     */
    availability: (options: TranslatorCreateOptions) => Promise<TranslatorAvailability>

    /**
     * Creates a new Translator instance
     * @param options configuration options
     * @returns Translator instance
     */
    create: (options: TranslatorCreateOptions) => Promise<TranslatorInstance>
}

/**
 * Create Options for Translator instances
 */
declare interface TranslatorCreateOptions {
    monitor?: (monitor: TranslatorMonitor) => void,
    sourceLanguage: string,
    targetLanguage: string,
    signal?: AbortSignal,
}

/**
 * Translator availability enumeration
 */
declare type TranslatorAvailability
    = | 'available' // The browser supports and is ready to use
    | 'downloadable' // The browser supports but requires downloading the AI model first
    | 'downloading' // The browser supports but needs to complete an ongoing download
    | 'unavailable' // The browser does not support the given configuration

/**
 * Translator monitor interface for listening to download progress
 */
declare interface TranslatorMonitor extends EventTarget {
    /**
     * Add download progress event listener
     * @param type Event type
     * @param listener Event listener
     */
    addEventListener: (type: 'downloadprogress', listener: (event: TranslatorDownloadProgressEvent) => void) => void
}

/**
 * Download progress event
 */
declare interface TranslatorDownloadProgressEvent extends Event {
    /** The percentage downloaded (a value between 0 and 1) */
    readonly loaded: number;
}

/**
 * Translator instance interface
 */
declare interface TranslatorInstance {
    /** Input quota for browser-generated translations (Read-only) */
    readonly inputQuota: number;

    /** The expected language of the input text to be translated (Read-only) */
    readonly sourceLanguage: string;

    /** The target language the input text will be translated into (Read-only) */
    readonly targetLanguage: string;

    /**
     * Destroys the current Translator instance
     * It is recommended to call this method when no longer in use, as the instance consumes significant resources
     * @returns No return value (undefined)
     */
    destroy: () => void;

    /**
     * Reports how much input quota a translation operation for a given text input will use
     * @param text The text string to measure
     * @param options Optional configuration options
     * @returns A Promise that resolves to a number representing the input quota usage
     * @throws {InvalidStateError} Thrown when the current Document is not active
     * @throws {NotAllowedError} Thrown when the Translator API is blocked by a permissions policy
     * @throws {UnknownError} Other unknown errors
     */
    measureInputUsage: (text: string, options?: TranslatorOperationOptions) => Promise<number>;

    /**
     * Returns a string containing the translation of the input string
     * @param text The text string to translate
     * @param options Optional configuration options
     * @returns A Promise that resolves to the translated result string
     * @throws {InvalidStateError} Thrown when the current Document is not active
     * @throws {QuotaExceededError} Thrown when the translation operation exceeds the available inputQuota
     * @throws {NotAllowedError} Thrown when the Translator API is blocked by a permissions policy
     * @throws {UnknownError} Other unknown errors
     */
    translate: (text: string, options?: TranslatorOperationOptions) => Promise<string>;

    /**
     * Generates a translation of the input string as a ReadableStream
     * @param text The text string to translate
     * @param options Optional configuration options
     * @returns A ReadableStream containing the generated translation
     * @throws {InvalidStateError} Thrown when the current Document is not active
     * @throws {QuotaExceededError} Thrown when the translation operation exceeds the available inputQuota
     * @throws {NotAllowedError} Thrown when the Translator API is blocked by a permissions policy
     * @throws {UnknownError} Other unknown errors
     */
    translateStreaming: (text: string, options?: TranslatorOperationOptions) => ReadableStream<string>;
}

type TTranslationCapabilitiesParams = {
    sourceLanguage: string;
    targetLanguage: string;
}

type TTranslationParams = TTranslationCapabilitiesParams & {
    text: string;
}