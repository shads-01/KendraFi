# Part 12 — Caching & CDN: Fast-Track Plan

> **For agentic workers:** Execute ALL steps in ONE subagent session (or inline). Do not split into per-task dispatches. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Correct Cache-Control headers. Zero new caching infrastructure — nothing in the app is measurably slow (Part 15 measures first; add caching only if it proves a bottleneck).

**Spec:** `extraction_1792747023602.md` — Part 12 (pages 26–27). This fast-track version trims ceremony.

**Depends on:** Independent. Coordinate with Part 9's `headers()` edit in the same `next.config.ts`.

### Task 1: Cache headers

- [ ] **Static:** in `next.config.ts` `headers()` (created in Part 9, or create here if Part 9 hasn't run) add `Cache-Control: public, max-age=31536000, immutable` for `/_next/static/:path*`.
- [ ] **Public pages:** `public, s-maxage=300, stale-while-revalidate=600` for `/` (marketing/landing view).
- [ ] **API:** `no-store` for `/api/:path*` — authenticated responses must never hit a shared cache. Keep tenant-data rule: no app-level tenant cache exists, so nothing to key by `organization_id` yet.
- [ ] **Images:** check `src/app/page.tsx` + components for raw `<img>`; swap the few for `next/image` (automatic optimization + lazy loading). If already all `next/image`, tick and move on.
- [ ] **Verify:** `npm run build` green; `curl -I http://localhost:3000/api/kendra/state` shows `cache-control: no-store`. Done.

**Skipped for speed:** Redis app caching, `/docs/caching.md`, invalidation tests, CDN tuning beyond platform defaults, Lighthouse audit (Part 15's load smoke covers perf sanity).
