# JSONCraft – Holodeck Command

JSONCraft is a web-based holodeck for forging structured JSON image prompts from user-uploaded photos. It combines OpenRouter's Nemotron Nano 12B 2 VL with a PromptCraft-inspired gallery to store JSON outputs alongside the source images.

## Quickstart (Demo Server)
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Create environment file**
   ```bash
   cp .env.example .env
   # add your OPENROUTER_API_KEY (optional for demo)
   ```
3. **Run the server**
   ```bash
   npm run dev
   ```
4. **Test endpoints**
   - `GET /health` → service status
   - `POST /api/analyze` with `multipart/form-data` and `image` file → returns JSON prompt + reasoning
   - `GET /api/gallery` → returns in-memory gallery entries

If `OPENROUTER_API_KEY` is not set, the server returns a demo JSON payload for quick prototyping.

## Stack (initial demo)
- Node.js + Express
- Multer for file uploads (in-memory)
- OpenRouter SDK for Nemotron Nano 12B 2 VL (vision + reasoning)
- In-memory gallery store (replace with MySQL in Phase 2)

## Next Steps
See `docs/ROADMAP.md` for phased tasks, including Google OAuth, MySQL persistence, UI inspired by PromptCraft/JSON_prompt_tool, and credit tracking.
