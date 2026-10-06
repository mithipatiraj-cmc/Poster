# PostEr

LLM-powered social post creator: improves media + caption, scores post strength, publishes (Instagram first, multi-platform by design).

## Read first

- `docs/SPEC.md` — requirements (FR-#, AC-#). Source of truth for behavior.
- `docs/ROADMAP.md` — milestones. Work on one milestone at a time, then stop for review.

## Stack

Next.js (App Router) + TypeScript, Tailwind, Postgres + Drizzle, S3-compatible storage, BullMQ/Redis, sharp + ffmpeg, Anthropic Claude API, Auth.js, Vitest + Playwright.

## Commands (update as they come into existence)

- `docker compose up -d` — Postgres, Redis, MinIO
- `npm run dev` — dev server
- `npm test` — unit tests
- `npm run lint && npm run typecheck && npm run format:check`
- `npm run db:generate` / `db:migrate` / `db:studio` — Drizzle
- Copy `.env.example` to `.env` and fill secrets before running anything that calls `getEnv()`

## Conventions

- Strict TypeScript; no `any`. Validate all external input and all LLM output with Zod.
- LLM calls go only through `LlmClient`; prompts live in `src/prompts/` and are versioned.
- Platforms go only through the `Publisher` interface; never put Instagram-specific logic outside its adapter.
- Originals are immutable; edits create new versions.
- Never publish without explicit user confirmation. Publishing must be idempotent.
- Never log tokens, secrets or user media contents. Encrypt platform tokens at rest.
- Mock LLM and platform APIs in tests; no network calls in unit tests.
- Add or update tests with each feature; reference FR/AC ids in test names.

## Workflow

- Start each milestone in plan mode and summarize the plan before coding.
- Tick roadmap checkboxes when done; record any spec deviation or decision in `docs/SPEC.md` (Open Questions) or `docs/decisions.md`.
- Ask before choosing between unresolved Open Questions.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
