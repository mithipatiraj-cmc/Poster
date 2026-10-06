# PostEr — Roadmap

Rule: one milestone per Claude Code session. Each ends with a runnable "Done when" check. Tick boxes as you go and note deviations from SPEC.md.

## M0 — Scaffold

- [x] Next.js + TypeScript + Tailwind, ESLint, Prettier, Vitest
- [x] Docker Compose for Postgres, Redis, and local S3 (MinIO)
- [x] Drizzle setup, `.env.example`, config validation (Zod)
- [x] CI: lint + typecheck + tests
Done when: `npm run dev` serves a page, `npm test` and `npm run lint` pass, `docker compose up` brings up services.

## M1 — Auth & Upload

- [ ] Auth.js login (FR-21 login part)
- [ ] Presigned upload to storage; type/size validation (FR-1, FR-2)
- [ ] Metadata extraction + thumbnails (FR-3)
- [ ] Draft editor page: media preview + caption box
Done when: a signed-in user uploads an image and a video, sees previews, and AC-1 passes.

## M2 — Image Improve Pipeline (thin end-to-end slice)

- [ ] `LlmClient` wrapper with Zod-validated structured output
- [ ] Vision analysis -> edit plan (FR-5); `sharp` executes it (FR-4)
- [ ] Non-destructive versions + revert (FR-8, AC-5)
- [ ] Before/after UI
Done when: uploading an image and clicking Improve shows an enhanced version and revert works. LLM calls mocked in tests.

## M3 — Caption, Hashtags & Score

- [ ] Caption variants + hashtags + CTA (FR-9–11, AC-2)
- [ ] Post Strength Score with rubric, sub-scores, suggestions, original vs improved (FR-12–15, AC-3)
- [ ] Platform capability table (FR-20)
- [ ] Results UI with accept/edit per item
Done when: full Improve returns media + captions + score, schema-validated; golden-file tests for prompts' output shape pass.

## M4 — Instagram Publishing

- [ ] `Publisher` interface + registry (FR-16)
- [ ] Instagram OAuth connect, encrypted tokens, refresh (FR-21)
- [ ] Image publish via Graph API; publish job queue, retries, idempotency (FR-17, FR-18, AC-4, AC-6)
- [ ] "Post now" with confirmation and status/permalink UI (FR-19, FR-22)
Done when: a post from the UI appears on a test Instagram Business account. Adapter fully covered by mocked-API tests.

## M5 — Video

- [ ] Video worker with ffmpeg: transcode, trim, aspect fit (FR-7)
- [ ] Frame sampling for vision analysis and scoring
- [ ] Reels publishing path + status polling
Done when: a 30 s video is enhanced and published as a Reel on the test account.

## M6 — Generative Editing

- [ ] `ImageEditProvider` interface + first provider (resolve OQ-2)
- [ ] Preset picker, opt-in flow, before/after, cost logging (FR-6)
Done when: a generative preset produces a new version without altering the original.

## M7 — Hardening & Launch Prep

- [ ] Usage limits and cost tracking, rate limiting
- [ ] Error/observability (logging, Sentry), e2e Playwright suite
- [ ] Privacy copy, data deletion, Meta app review submission
- [ ] Deployment (resolve OQ-3)

## Later (post-MVP)

- Second publisher (TikTok / LinkedIn / X) to validate the adapter design
- Scheduling and best-time-to-post
- Post-publish analytics to calibrate the score against real results
- Brand voice profiles, templates, team workspaces
- Mobile app reusing the backend API
