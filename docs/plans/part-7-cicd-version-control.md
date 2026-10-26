# Part 7 — CI/CD & version control: Fast-Track Plan

> **For agentic workers:** Execute ALL steps in ONE subagent session (or inline). Do not split into per-task dispatches. Steps use checkbox (`- [ ]`) syntax.

**Goal:** One CI workflow that blocks broken PRs, one secret scan, one rollback runbook. No pre-commit framework, no preview-deploy pipeline.

**Spec:** `extraction_1792747023602.md` — Part 7 (pages 16–17). This fast-track version trims ceremony.

**Depends on:** Part 4 (`test:auth` script exists). Independent of Parts 8–15.

### Task 1: CI gate

- [ ] **Scripts:** in `package.json` add `"typecheck": "tsc --noEmit"` and `"test:api": "pytest -q"` (Windows note: run via `python -m pytest -q` if bare `pytest` isn't on PATH).
- [ ] **Workflow:** create `.github/workflows/ci.yml` — on pull_request + push to main, two jobs:
  - `web`: actions/checkout → setup-node 20 (cache: npm) → `npm ci` → `npm run lint` → `npm run typecheck` → `npm run test:auth` → `npm run build`.
  - `api`: setup-python 3.11 → `pip install -r api/requirements.txt pytest` → `pytest -q`.
  - No Postgres service container (tests are self-contained); no badge, no deploy jobs.
- [ ] **Secret scan:** run `gitleaks detect --source . -v` once locally. If it flags the HMAC literal in `.env.example`, leave rotation to Part 10 (it needs coordinated .env + Vercel updates) — just note the finding in the PR.
- [ ] **Rollback runbook:** `docs/runbooks/rollback.md`, ~15 lines: (1) `vercel rollback <prev>` or redeploy last good SHA in dashboard, (2) DB: never down-migrate; write forward-fix migration, (3) verify `/api/health` + Scenario A after rollback.
- [ ] **Verify:** push the branch, open the PR, both CI jobs go green. Done — do not push a deliberately-failing test to prove CI blocks; the jobs running green is the check.

**Skipped for speed:** pre-commit hooks + husky/lefthook (CI is the gate), PR preview deployments (Part 9 scope if ever), Conventional Commits doc (already followed), CD to prod (Vercel Git integration already deploys main), migration-in-deploy automation (only 1 dev migration path exists).
