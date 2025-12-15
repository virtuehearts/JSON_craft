# JSONCraft Roadmap

## Phase 1 – JSON-first Holodeck Demo
- [ ] Bootstrap Node.js server with Express, CORS, and file uploads via Multer.
- [ ] Accept JPG/PNG uploads, forward to OpenRouter Nemotron Nano 12B 2 VL for JSON prompt extraction.
- [ ] Persist uploaded image metadata + JSON in a local store (in-memory for demo, MySQL later).
- [ ] Provide REST endpoints for health check, analyze, and gallery listing.
- [ ] Basic ChatGPT-style UI: upload image, view streaming JSON + reasoning, and gallery cards with tags.
- [ ] Add Google OAuth sign-in; store auth session + user profile locally.
- [ ] Environment-driven config via `.env` (OpenRouter key, Google OAuth, DB config).
- [ ] Demo deployment script (local dev server + seeded gallery entries).

## Phase 2 – PromptCraft-inspired Gallery
- [ ] Replace in-memory store with MySQL using Prisma or a lightweight query layer.
- [ ] CRUD for prompts: edit JSON, tag, duplicate, and version.
- [ ] Image storage abstraction (local disk → S3-compatible bucket option).
- [ ] Gallery search/filter by tags, user, date, model, and style.
- [ ] Import/export prompts as JSON bundles.

## Phase 3 – JSON Prompt Tool Enhancements
- [ ] Schema-validated JSON output, with diff view when editing prompts.
- [ ] Guided editing UI inspired by virtuehearts/JSON_prompt_tool (nested fields, presets, validation).
- [ ] Optional auto-formatting + linting for JSON prompt blocks.
- [ ] Reasoning replay: surface `reasoning_details` chain from OpenRouter responses.

## Phase 4 – Multi-model + Credits
- [ ] Plug additional OpenRouter models and Fal.ai backends; switchers per request.
- [ ] Stream reasoning tokens to the UI; progressively render JSON.
- [ ] Credits/usage tracking (per-user and per-model), with admin dashboard.
- [ ] Payment onboarding for credit purchases.

## Phase 5 – Production Hardening
- [ ] Google OAuth refresh handling, session security, rate limiting.
- [ ] Background jobs for gallery maintenance (purge old images, thumbnails).
- [ ] Observability: structured logging, metrics, and tracing hooks.
- [ ] CI for linting, tests, and type-checking.
