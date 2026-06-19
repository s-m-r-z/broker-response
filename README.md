# Broker Response Parser

A web app that parses broker responses in mixed formats (text, email, JSON, PDF) and automatically generates meaningful tags using AI.

## Features

- Upload or paste broker responses in any format
- AI-powered tag generation using Claude API
- Support for plain text, email, JSON, and PDF inputs
- Review and edit generated tags
- Clean, simple UI

## Tech Stack

- **Frontend/Backend:** Next.js
- **AI Tagging:** Claude API (Anthropic)
- **PDF Parsing:** pdf-parse

## Getting Started

```bash
npm install
npm run dev
```

## Usage

1. Paste or upload a broker response
2. Click **Parse**
3. Review the auto-generated tags
4. Edit or approve as needed
