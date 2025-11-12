# Summer English AI

Learn English effortlessly with Summer, your AI-powered language learning companion.

## Overview

Summer is a Chrome extension that helps users learn and improve their English skills through AI-powered features. It provides real-time grammar analysis, translation, pronunciation guidance, and text summarization directly in your browser.

## Features

- **Grammar Analysis**: Get instant, concise feedback on sentence grammar with key points highlighted
- **Translation**: Translate selected text between multiple languages
- **Pronunciation Guide**: Learn correct pronunciation with phonetic transcriptions and audio examples
- **Text Summarization**: Generate summaries of lengthy texts
- **Smart Text Selection**: Simply select any text on a webpage to access AI-powered learning tools
- **Multi-language Support**: Works with multiple source and target languages
- **Customizable Settings**: Configure your preferred languages and learning modes

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Extension**: Chrome Extension Manifest V3
- **UI Components**: Radix UI + TailwindCSS 4
- **Form Management**: React Hook Form + Zod validation
- **AI Integration**: Chrome Built-in AI APIs (Prompt API, Translator API, Summarizer API)
- **Build Plugin**: @crxjs/vite-plugin for Chrome extension development

## Requirements

- Node.js (v18 or higher recommended)
- Chrome browser with v138 (stable) or higher and AI features enabled

## Installation

### Development Setup

1. Clone the repository:

```bash
git clone git@github.com:rimamei/summer-english-assistant.git
cd summer-english-ai
```

2. Install dependencies:

```bash
pnpm install
```

3. Start development server:

```bash
pnpm run dev
```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist` folder from the project directory

### Production Build

```bash
pnpm run build
```

The built extension will be in the `dist` folder.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── base/           # Base component wrappers
│   └── ui/             # UI primitives (button, card, etc.)
├── hooks/              # Custom React hooks
│   ├── useGrammar.ts   # Grammar analysis hook
│   ├── useTranslator.ts # Translation hook
│   ├── usePronunciation.ts # Pronunciation hook
│   └── useSummarizer.ts # Summarization hook
├── pages/
│   ├── content/        # Content script (injected into web pages)
│   ├── popup/          # Extension popup UI
│   └── background/     # Background service worker
├── prompt/             # AI prompt templates
│   ├── grammar/        # Grammar analysis prompts
│   └── pronunciation/  # Pronunciation prompts
├── type/               # TypeScript type definitions
└── utils/              # Utility functions
```

## How It Works

### Grammar Analysis

The grammar analyzer uses Chrome's Prompt API to provide concise, educational feedback:

- Analyzes sentence structure, tenses, and grammar patterns
- Returns 2-3 key grammar points in bullet format
- Uses conversational tone for better learning experience

### User Flow

1. User selects text on any webpage
2. Translation icon appears near selection
3. User clicks to open translation modal
4. Tabs provide access to: Full Translation, Grammar Analysis, Pronunciation, and Summarization
5. AI processes the request and displays results in a user-friendly format

## Development

### Available Scripts

- `pnpm run dev` - Start development server with HMR
- `pnpm run build` - Build for production
- `pnpm run lint` - Run ESLint
- `pnpm run preview` - Preview production build

### Key Technologies

- **React Compiler**: Enabled for optimized builds
- **TailwindCSS**: Utility-first styling with v4
- **Radix UI**: Accessible component primitives
- **TypeScript**: Full type safety

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
