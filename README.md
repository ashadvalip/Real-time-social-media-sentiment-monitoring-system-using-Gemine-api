# Real-Time Social Media Sentiment Monitoring

A React + TypeScript application for monitoring social-media text and analyzing sentiment with the Gemini API.

## Overview

The application provides a browser-based interface for sentiment analysis and monitoring workflows. API credentials are supplied locally through environment variables and are intentionally excluded from version control.

## Tech stack

- React
- TypeScript
- Vite
- Gemini API

## Getting started

### Prerequisites

- Node.js 18+
- A Gemini API key

### Installation

```bash
npm install
```

### Environment configuration

Create a local `.env.local` file:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Never commit real API keys to Git. The repository ignores local environment files.

### Development

```bash
npm run dev
```

Then open the local URL printed by Vite.

### Production build

```bash
npm run build
npm run preview
```

## Project structure

```text
.
├── App.tsx
├── index.tsx
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── metadata.json
└── README.md
```

## Security note

API credentials belong in environment variables, secret managers, or deployment-platform secrets. Removing a secret file from the latest commit does not remove credentials from previous Git history; any previously committed key should be revoked and replaced.

## Status

Application repository under active development.

## License

No license is currently specified.
