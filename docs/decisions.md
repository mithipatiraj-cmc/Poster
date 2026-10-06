# Decisions

## M0
- Postgres 16, Redis 7, MinIO in Docker Compose; `postgres` (postgres.js) driver for Drizzle.
- Env validated lazily via `getEnv()` (`src/config/env.ts`) so pages needing no config build without secrets.
- BullMQ, sharp, Auth.js and the Anthropic SDK are not installed yet; each is added in the milestone that uses it.
- `typecheck` runs `next typegen` first because Next 16 route types (`LayoutProps`) are generated.
- Prettier ignores `docs/` and `CLAUDE.md`.
- Deviation from "tick when done": `docker compose up` could not be verified in the dev environment (Docker not installed).
