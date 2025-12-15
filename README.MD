# JSONCraft – Holodeck Command

A React + Vite workbench for crafting JSON-only prompts against OpenRouter. The interface ships with a ChatGPT-style shell, a schema-aware JSON prompt editor, guardrails for validating assistant output, and PromptCraft-inspired persistence + gallery tools.

## Features
- **OpenRouter JSON mode client** with runtime schema guards and centralized error handling.
- **Global state via Zustand** separating chat sessions, prompts/styles, and persistence helpers.
- **Schema validation + guardrails** using Zod with readable error feedback and repair controls.
- **JSON prompt style editor** with presets, linting, and apply-to-chat actions.
- **PromptCraft-like persistence** (IndexedDB/localforage) with export/import of sessions + templates.
- **Gallery UX** for browsing, sorting, duplicating, and sharing prompt templates.
- **Tailwind-powered UI** with responsive split layout, usage hints, and retry/stop controls.

## Getting Started
1. Install dependencies
   ```bash
   npm install
   ```
2. Copy environment template
   ```bash
   cp .env.example .env.local
   # Add your OpenRouter key
   ```
3. Run the dev server
   ```bash
   npm run dev
   ```
4. Lint & test
   ```bash
   npm run lint
   npm test
   ```

## Environment
- `VITE_OPENROUTER_API_KEY`: API key for authenticated requests.
- `VITE_OPENROUTER_BASE_URL`: Base URL for OpenRouter (defaults to `https://openrouter.ai/api`).
- `VITE_MODEL`: JSON-capable model (default `openai/gpt-4.1-mini`).

## Architecture Notes
- **Routing** via React Router with `/` for chat and `/gallery` for saved templates.
- **State** lives in `src/state` with dedicated slices for chat and prompt management.
- **Validation** in `src/lib/validators.ts` defines the JSON schema used for both editor linting and assistant output checks.
- **Persistence** via `localforage` in `src/lib/persistence.ts` with export/import helpers.
- **API client** in `src/lib/openrouterClient.ts` enforces JSON responses and surfaces rate limits / validation errors.

## Testing & Fixtures
- Vitest drives unit tests for environment config and schema validation under `src/__tests__`.
- A mock-friendly architecture makes it easy to stub `fetch` for OpenRouter responses.

## JSON Style Editor & Gallery
- Edit JSON styles with inline linting; apply the active style to the next chat request.
- Save templates with tags, duplicate them, or export/import a bundle for sharing.
- Gallery view offers quick actions plus search/filter controls.
