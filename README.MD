# JSONCraft: Image JSON Command & Fal.ai render front-end

JSONCraft is a React + Vite workbench for building, testing, and sharing JSON-only prompts against OpenRouter, with a rapidly evolving front-end for Fal.ai image rendering. It provides a chat-style interface tailored for JSON-mode models so you can prototype prompts, validate outputs, and curate reusable templates without leaving the browser. The project focuses on end-to-end guardrails—authoring, validation, retries, and persistence—to help teams quickly ship structured AI workflows while previewing image renders.

## What can I use JSONCraft for?
- **Prompt prototyping:** iterate on JSON-only prompts with live schema validation before integrating them into production code.
- **Team workflows:** share prompt templates through the gallery, export/import bundles, and keep presets consistent across teammates.
- **Guardrailed chat experiences:** combine the chat shell with Zod-based validation to enforce JSON responses and trigger automated repairs or retries.
- **Model exploration:** swap OpenRouter models (including multimodal Nemotron Nano) to compare structured responses without changing client code, and list Fal.ai render models for easy selection.
- **Developer education:** inspect request/response shapes, usage metadata, and reasoning tokens to better understand model behavior in JSON mode.
- **Render controls:** plan for batch render runs, camera angle control, and quality settings so users can iterate on image outputs directly from the JSON command layer.
- **Post-processing:** design pathways for single-image crop, upscale, and other tweaks after renders complete.

## Features
- **OpenRouter JSON mode client** with runtime schema guards and centralized error handling.
- **Global state via Zustand** separating chat sessions, prompts/styles, and persistence helpers.
- **Schema validation + guardrails** using Zod with readable error feedback and repair controls.
- **JSON prompt style editor** with presets, linting, and apply-to-chat actions.
- **PromptCraft-like persistence** (IndexedDB/localforage) with export/import of sessions + templates.
- **Gallery UX** for browsing, sorting, duplicating, and sharing prompt templates.
- **Tailwind-powered UI** with responsive split layout, usage hints, and retry/stop controls.

## Getting Started
1. **Install dependencies** (Node 18+ recommended)
   ```bash
   npm install
   ```
2. **Copy the environment template** and add secrets
   ```bash
   cp .env.example .env.local
   # Required: VITE_OPENROUTER_API_KEY
   # Optional: VITE_OPENROUTER_BASE_URL, VITE_MODEL, VITE_GOOGLE_CLIENT_ID
   ```
3. **Run the dev server**
   ```bash
   npm run dev
   ```
   The app serves on http://localhost:5173 by default.
4. **Lint & test locally**
   ```bash
   npm run lint
   npm test
   ```
5. **Build for production** (optional smoke test)
   ```bash
   npm run build
   npm run preview
   ```

### Quick start script

You can also use the helper script to set up dependencies, scaffold `.env.local` from `.env.example`, and start the dev server in one step:

```bash
./JSON_craft start
```

## Environment
- `VITE_OPENROUTER_API_KEY`: API key for authenticated requests.
- `VITE_OPENROUTER_BASE_URL`: Base URL for OpenRouter (defaults to `https://openrouter.ai/api`).
- `VITE_MODEL`: JSON-capable model (default `nvidia/nemotron-nano-12b-v2-vl:free`).
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID for sign-in (planned credits/purchases).
- `VITE_FAL_API_KEY` (planned): API key stored locally in settings for Fal.ai rendering.

> **Fal.ai partnership vision**: The settings page will allow users to add their Fal.ai API key (stored locally). Longer term, we will ship a hosted service with Google authentication and run it for free, migrating processing off OpenRouter and seeking Fal.ai sponsorship.

## Using Nemotron Nano 12B 2 VL via OpenRouter

For multimodal chat + image prompts, the default model is set to **Nemotron Nano 12B 2 VL (free)** on OpenRouter. OpenRouter normalizes requests and responses across providers, so you can swap models without changing your client logic.

Below is a TypeScript example using the official SDK with streaming enabled so you can read reasoning tokens from `reasoning_details` when the final chunk arrives:

```ts
import { OpenRouter } from "@openrouter/sdk";

const openrouter = new OpenRouter({
  apiKey: "<OPENROUTER_API_KEY>"
});

// Stream the response to get reasoning tokens in usage
const stream = await openrouter.chat.send({
  model: "nvidia/nemotron-nano-12b-v2-vl:free",
  messages: [
    {
      role: "user",
      content: "How many r's are in the word 'strawberry'?"
    }
  ],
  stream: true,
  streamOptions: {
    includeUsage: true
  }
});

let response = "";
for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) {
    response += content;
    process.stdout.write(content);
  }

  // Usage information comes in the final chunk
  if (chunk.usage) {
    console.log("\nReasoning tokens:", chunk.usage.reasoningTokens);
  }
}
```

## Architecture Notes
- **Routing** via React Router with `/` for chat and `/gallery` for saved templates.
- **State** lives in `src/state` with dedicated slices for chat and prompt management.
- **Validation** in `src/lib/validators.ts` defines the JSON schema used for both editor linting and assistant output checks.
- **Persistence** via `localforage` in `src/lib/persistence.ts` with export/import helpers.
- **API client** in `src/lib/openrouterClient.ts` enforces JSON responses and surfaces rate limits / validation errors.

## Milestone: Locally testable JSONCraft

Use this task list to reach a working, locally testable holodeck (image → JSON) loop. Check items off as they land in the repo.

- [ ] **Environment readiness**
  - Confirm Node 18+ and npm are installed.
  - Create `.env.local` with `VITE_OPENROUTER_API_KEY`, optional `VITE_MODEL`, and `VITE_GOOGLE_CLIENT_ID` if enabling auth.
- [ ] **OpenRouter wiring**
  - Finish `src/lib/openrouterClient.ts` with JSON-mode enforcement, error normalization, and reasoning token surfacing.
  - Add a mock/fake client path (flagged in config) to allow local testing without external calls.
- [ ] **Image upload → analyze flow**
  - Implement image picker/uploader on the chat page; convert images to base64 for OpenRouter.
  - Pipe analysis responses into the chat stream with schema validation via `src/lib/validators.ts`.
- [ ] **JSON editor + validation**
  - Ensure the editor runs linting with Zod, surfaces repair suggestions, and allows applying the current JSON to the next request.
  - Add sample presets (e.g., cyberpunk/steampunk) stored in `src/state` slices for quick testing.
- [ ] **Gallery and persistence**
  - Persist analyzed images + JSON to `localforage` using `src/lib/persistence.ts` and expose CRUD from the gallery route.
  - Seed a few fixtures for immediate manual verification.
- [ ] **Authentication (optional for first test)**
  - Gate auth behind a feature flag; add Google OAuth sign-in flow when keys exist.
- [ ] **Quality gates**
  - Add unit tests for validators, client error handling, and gallery persistence under `src/__tests__`.
  - Ensure `npm run lint`, `npm test`, and `npm run build` pass in CI/local.

## Testing & Fixtures
- Vitest drives unit tests for environment config and schema validation under `src/__tests__`.
- A mock-friendly architecture makes it easy to stub `fetch` for OpenRouter responses.

## JSON Style Editor & Gallery
- Edit JSON styles with inline linting; apply the active style to the next chat request.
- Save templates with tags, duplicate them, or export/import a bundle for sharing.
- Gallery view offers quick actions plus search/filter controls.

## Credits
- Inspired by [virtuehearts/JSON_prompt_tool](https://github.com/virtuehearts/JSON_prompt_tool), which informed our approach to using prompts for generating styles, genres, moods, consistent models, and scenes across image models (Seedream, FLUX, Z-Image, etc.) on Fal.ai.
