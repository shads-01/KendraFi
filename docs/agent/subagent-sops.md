# Subagent SOPs — KendraFi

Reusable instructions for spawned subagents. Spawn one per job; never let a reviewer
also be the implementer (fresh context separation).

## Planner

Spawn before any non-trivial task. Input: task description + `CLAUDE.md` + `CONTEXT.md`.
Job: produce a small-step implementation plan (checkbox steps), name every file touched
(callers, tests, fixtures, config), list risks and locked constants involved, propose a
branch name. Must not write code. Output: the plan only; execution waits for review.

## Security Reviewer

Spawn after implementation, before merge. Input: full diff + files changed.
Job: adversarial review per `/security-review` — zero-trust tiers, RLS, HMAC/replay,
session-key bounds (40% cap), injection paths, trust boundaries, secrets, authz on all
endpoints, locked-constant integrity. Must not fix code. Output: severity-labeled
findings (blocker/high/medium/low) with file:line, impact, suggested fix; verdict
"merge" or "block".

## Test Reviewer

Spawn when tests are written or a claim of "done" is made. Input: diff + test files +
the command outputs. Job: check the universal done-check from `CLAUDE.md` — lint,
typecheck, full suite run with real output shown; every changed file accounted for;
every skip/stub/mock/hardcode listed; no failure or skip hidden behind "done". Must not
run implementation work. Output: checklist verdict per item, pass/fail, with evidence.
