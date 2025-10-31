// PROMPT API TYPE DECLARATIONS

/**
 * Global Window interface extension for the Prompt API
 */
interface Window {
    LanguageModel: LanguageModel;
}

/**
 * Main LanguageModel interface for interacting with browser AI capabilities
 */
declare interface LanguageModel {
    /**
     * Check the availability of the AI model
     * @returns an enumerated value that indicates the availability of the AI model
     */
    availability(): Promise<LanguageModelAvailability>;

    /**
     * Creates a new PromptSession instance
     * @param options configuration options
     * @returns PromptSession instance
     */
    create(options?: LanguageModelCreateOptions): Promise<PromptSession>;

    /**
     * Get model parameters
     * @returns Model configuration parameters
     */
    params(): Promise<LanguageModelParams>;
}

/**
 * Model parameters interface
 */
declare interface LanguageModelParams {
    /** Default topK value for prompt operations */
    defaultTopK: number;
    /** Default temperature value for prompt operations */
    defaultTemperature: number;
    /** Maximum topK value for prompt operations */
    maxTopK: number;
    /** Maximum temperature value for prompt operations */
    maxTemperature: number;
}

/**
 * Expected input/output configuration
 */
declare interface LanguageModelExpected {
    /** The type of content expected */
    type: 'text' | 'image';
    /** Supported languages (optional) */
    languages: string[];
}

/**
 * Content interface for multi-modal inputs
 */
declare interface IContent {
    /** Content type (e.g., 'text', 'image') */
    type: string;
    /** Content value (string or File for images) */
    value: string | File;
}

/**
 * Message role and content for prompts
 */
declare interface LanguageModelPrompt {
    /** The role of the message sender */
    role: 'system' | 'user' | 'assistant';
    /** The message content */
    content: string | IContent[];
    /** Whether this is a prefix for completion (assistant role only) */
    prefix?: boolean;
}

/**
 * Options for creating a LanguageModel session
 */
declare interface LanguageModelCreateOptions {
    /** A function to be called to monitor the download progress of the model */
    monitor?: (monitor: LanguageModelMonitor) => void;
    /** An AbortSignal to abort the creation process */
    signal?: AbortSignal;
    /** Expected input configurations */
    expectedInputs?: LanguageModelExpected[];
    /** Expected output configurations */
    expectedOutputs?: LanguageModelExpected[];
    /** Initial prompts to prime the model */
    initialPrompts?: LanguageModelPrompt[];
    /** 
     * Controls randomness. Lower values (e.g., 0.2) are more deterministic.
     * Must specify both temperature and topK or neither.
     */
    temperature?: number;
    /** 
     * Sample from the k most likely next tokens.
     * Must specify both temperature and topK or neither.
     */
    topK?: number;
}

/**
 * LanguageModel availability enumeration
 */
declare type LanguageModelAvailability
    = 'available'      // The browser supports and is ready to use
    | 'downloadable'   // The browser supports but requires downloading the AI model first
    | 'downloading'    // The browser supports but needs to complete an ongoing download
    | 'unavailable';   // The browser does not support the given configuration

/**
 * LanguageModel monitor interface for listening to download progress
 */
declare interface LanguageModelMonitor extends EventTarget {
    /**
     * Add download progress event listener
     * @param type Event type
     * @param listener Event listener
     */
    addEventListener(
        type: 'downloadprogress',
        listener: (event: LanguageModelDownloadProgressEvent) => void
    ): void;
}

/**
 * Download progress event
 */
declare interface LanguageModelDownloadProgressEvent extends Event {
    /** The percentage downloaded (a value between 0 and 1) */
    readonly loaded: number;
}

/**
 * PromptSession instance interface
 */
declare interface PromptSession {
    /** Total input quota available for this session (Read-only) */
    readonly inputQuota: number;
    
    /** Current input usage for this session (Read-only) */
    readonly inputUsage: number;

    /**
     * Destroys the current PromptSession instance.
     * After calling destroy(), all subsequent operations will fail.
     * It is recommended to call this method when no longer in use.
     */
    destroy(): void;

    /**
     * Reports how much input quota a prompt operation for a given text input will use
     * @param text The text string to measure
     * @param options Optional configuration options
     * @returns A Promise that resolves to a number representing the input quota usage
     * @throws {DOMException} InvalidStateError when the current Document is not active
     * @throws {DOMException} NotAllowedError when the Prompt API is blocked by a permissions policy
     * @throws {DOMException} UnknownError for other unknown errors
     */
    measureInputUsage(text: string, options?: PromptOperationOptions): Promise<number>;

    /**
     * Send a prompt to the model
     * @param input Prompt input (string or array of messages)
     * @param options Optional configuration
     * @returns The model's response as a string
     * @throws {DOMException} When the session has been destroyed
     */
    prompt(
        input: string | LanguageModelPrompt[],
        options?: PromptOperationOptions
    ): Promise<string>;

    /**
     * Send a prompt to the model with streaming response
     * @param input Prompt input (string or array of messages)
     * @param options Optional configuration
     * @returns A ReadableStream of response chunks
     */
    promptStreaming(
        input: string | LanguageModelPrompt[],
        options?: PromptOperationOptions
    ): ReadableStream<string>;

    /**
     * Append messages to the session context
     * @param messages Messages to append
     */
    append(messages: LanguageModelPrompt[]): Promise<void>;
}

/**
 * Optional configuration for prompt operations
 */
declare interface PromptOperationOptions {
    /** An AbortSignal to abort the operation */
    signal?: AbortSignal;
    /** Controls randomness. Lower values (e.g., 0.2) are more deterministic */
    temperature?: number;
    /** The desired maximum number of tokens in the output */
    maxTokens?: number;
    /** Sample from the k most likely next tokens */
    topK?: number;
    /** Sample from the most probable tokens with a cumulative probability of p */
    topP?: number;
    /** Schema constraint for the response (e.g., JSON Schema) */
    responseConstraint?: JSONSchema;
    /** 
     * If true, omit the schema from the input when using responseConstraint.
     * Useful when you want the constraint applied without including it in the prompt.
     */
    omitResponseConstraintInput?: boolean;
}

/**
 * JSON Schema type for response constraints
 */
declare type JSONSchema = {
    type?: boolean | string | number | object | array | null;
    properties?: Record<string, JSONSchema>;
    items?: JSONSchema;
    required?: string[];
    enum?: unknown[];
    [key: string]: unknown;
};