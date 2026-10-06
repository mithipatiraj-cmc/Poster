# PostEr — Product & Technical Spec

Status: Draft v0.1 · Working name: PostEr (alternatives: Glazr, Postwise)

## 1. Problem & Goals

Creators and small businesses spend too long polishing photos/videos and captions, and have no feedback on how a post will perform before publishing. PostEr takes a media file plus a draft caption, uses LLMs to improve both, scores the post's likely engagement strength, and publishes it with one click.

Goals

- G1: Turn (media + draft caption) into an improved, ready-to-post version in under ~60s for images.
- G2: Give an honest, explainable "Post Strength Score" with actionable suggestions.
- G3: One-click publish to Instagram (MVP), with an architecture that makes adding platforms a matter of writing one adapter.

## 2. Non-Goals (MVP)

- No true engagement _prediction_ or guarantees. The score is a heuristic.
- No analytics dashboard of published-post performance (later phase).
- No scheduling/calendar (later phase).
- No native mobile app (responsive web only; backend must be reusable by mobile later).
- No team/multi-seat workspaces.
- No Instagram personal-account support (platform API does not allow it).

## 3. Users & Core Flow

Primary user: solo creator or small-business owner with an Instagram Business/Creator account.

Core flow

1. Sign in, connect Instagram account (OAuth).
2. Upload an image or short video (<= 90s) and type a draft caption.
3. Click "Improve". App produces: edited media, polished caption(s), hashtag suggestions, and a Post Strength Score with breakdown.
4. User reviews before/after, accepts, rejects or tweaks each change (media, caption, hashtags).
5. User clicks "Post now". App publishes to the selected connected platform(s) and shows status + link to the post.

## 4. Functional Requirements

### Media intake

- FR-1: Accept JPEG, PNG, WebP images (<= 20 MB) and MP4/MOV video (<= 90 s, <= 500 MB). Reject others with a clear error.
- FR-2: Store originals in S3-compatible object storage; never overwrite originals.
- FR-3: Extract metadata (dimensions, duration, orientation) and generate a thumbnail/preview frames.

### Media enhancement

- FR-4: Classic enhancement (default): auto exposure/contrast/saturation/sharpness, crop/aspect-ratio fit for the target platform. Images via `sharp`; video via `ffmpeg`.
- FR-5: A vision LLM analyses the media and returns a structured edit plan (JSON: adjustments, crop, suggested filter/look, issues found). The classic pipeline executes the plan.
- FR-6: Generative editing (opt-in per job): user picks a preset (e.g. clean background, restyle, remove distractions). Executed via a pluggable `ImageEditProvider`. Always shows before/after and keeps the original.
- FR-7: Video: apply enhancement + trim/crop/aspect fit; no generative editing in MVP (images only for generative).
- FR-8: Every edit is non-destructive; user can revert to original or any prior version.

### Caption & hashtags

- FR-9: Given draft caption + media analysis, generate 3 polished variants (different tones) preserving the user's intent and any facts, mentions or links they wrote.
- FR-10: Suggest hashtags (platform-appropriate count) and optional CTA.
- FR-11: User can edit any text before posting. User-edited text is never overwritten without confirmation.

### Post Strength Score

- FR-12: Return a 0–100 score with sub-scores: Visual quality, Hook/first line, Caption clarity, Hashtag relevance, Platform fit, Emotional appeal.
- FR-13: For each sub-score give a one-line rationale and at least one concrete suggestion.
- FR-14: Score both the original and the improved version so the user sees the delta.
- FR-15: UI must label it an estimate ("heuristic, not a prediction"). Scoring prompts and rubric are versioned.

### Publishing

- FR-16: Define a `Publisher` interface (see §6). Instagram is the only adapter in MVP.
- FR-17: Instagram adapter publishes image posts, and video as Reels, to Business/Creator accounts via the Instagram Graph API (container create -> poll status -> publish).
- FR-18: Publishing is asynchronous: job queue with status (queued, processing, published, failed), retries with backoff, and idempotency so a post is never published twice.
- FR-19: Show a post-publish confirmation with permalink; show actionable errors on failure.
- FR-20: Multi-platform readiness: per-platform constraints (aspect ratio, caption length, hashtag limits) live in a capability table consumed by editing, caption and scoring steps.

### Accounts & connections

- FR-21: Email/OAuth login. Users connect platform accounts via OAuth; tokens encrypted at rest; support disconnect and token refresh.
- FR-22: Require an explicit confirmation step before any publish. No auto-posting.

## 5. Acceptance Criteria (examples)

- AC-1 (FR-1): Given a 25 MB JPEG, when uploaded, then it is rejected with "Image exceeds 20 MB".
- AC-2 (FR-9): Given draft "new cafe opening saturday 10am @brewhouse", then every variant retains "Saturday", "10am" and "@brewhouse".
- AC-3 (FR-12): Given any job, the score response validates against the JSON schema and sub-scores are integers 0–100.
- AC-4 (FR-18): Given a duplicate publish request with the same idempotency key, only one Instagram post is created.
- AC-5 (FR-8): Given an edited image, "Revert" restores byte-identical original.
- AC-6 (FR-17): Given a valid connected Business account and a 4:5 JPEG, the post appears on the account and the permalink is stored.

## 6. Architecture & Interfaces

Stack (decided)

- Next.js (App Router) + TypeScript, Tailwind. Single repo.
- Postgres + Drizzle ORM.
- S3-compatible storage (Cloudflare R2 or S3); presigned uploads; public URLs for Instagram ingestion.
- Job queue: BullMQ + Redis (or Inngest) for video processing, LLM jobs and publishing.
- Media: `sharp` (images), `ffmpeg` (video).
- LLM: Anthropic Claude API (vision + text) behind an `LlmClient` wrapper; structured JSON output validated with Zod. Model configurable via env.
- Auth: Auth.js.
- Tests: Vitest (unit), Playwright (e2e), platform APIs mocked in tests.

Key interfaces

```ts
interface Publisher {
  platform: PlatformId; // 'instagram' | 'tiktok' | ...
  capabilities: PlatformCapabilities; // aspect ratios, max caption, hashtag limit, video limits
  connect(code: string): Promise<Connection>;
  refresh(conn: Connection): Promise<Connection>;
  validate(post: PostDraft): ValidationResult;
  publish(conn: Connection, post: PostDraft, idempotencyKey: string): Promise<PublishResult>;
  getStatus(conn: Connection, ref: PublishRef): Promise<PublishStatus>;
}

interface ImageEditProvider {
  edit(img: Buffer, preset: EditPreset): Promise<Buffer>;
}
```

Core entities: User, PlatformConnection, MediaAsset (original + versions), PostDraft, ImproveJob, Score (versioned rubric), PublishJob.

## 7. Non-Functional Requirements

- Performance: image improve job p95 <= 60 s; UI shows progress.
- Security: encrypt tokens at rest; per-user access control on all assets; validate and sanitise uploads; signed URLs; no secrets in client.
- Privacy: user media sent to LLM providers only for the requested job; document this in UI; support deletion of media and account data.
- Cost: log token/image-model usage per job; per-user daily limits.
- Reliability: publishing is idempotent and retriable; failures never lose the user's draft.
- Compliance: respect Instagram platform policies and rate limits; Meta app review required for non-test users.

## 8. Open Questions

- OQ-1: Pricing/limits model (free tier, credits)? Affects usage limits.
- OQ-2: Which generative image provider to use for FR-6?
- OQ-3: Hosting target (Vercel + managed Redis/Postgres vs. single VPS)? Video processing may need a separate worker.
- OQ-4: Is the user's own account the only one needed initially (Meta dev mode) or must the app pass app review in MVP?
- OQ-5: Do we offer a "brand voice" setting in MVP?
