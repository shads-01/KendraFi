# ADR-0001: Unified agent memory in CLAUDE.md

- **Status:** Accepted
- **Date:** 2026-10-23

## Context

Two competing agent memories existed: repo `AGENTS.md` (KendraFi competition protocol)
and the global `~/.config/opencode/AGENTS.md` (Learning Companion persona). No durable
stack, commands, rules, or decision log existed, so every fresh agent session re-litigated
stack choices. Claude Code reads `CLAUDE.md`; Codex reads `AGENTS.md`.

## Decision

Make root `CLAUDE.md` the single source of truth for project memory (stack, rules,
commands, working loop, done-check, phase). `AGENTS.md` keeps only the multi-agent
protocol and points to `CLAUDE.md` at the top. Decision log lives in `/docs/decisions/`
using `adr-template.md`.

## Alternatives

- Symlink AGENTS.md → CLAUDE.md: awkward on Windows and loses the protocol content purpose.
- Copy memory into both files: drift risk — rejected.
- Keep the global Learning Companion file as primary: wrong scope (personal, not per-project).

## Consequences

Easier: fresh sessions get frozen stack/commands/phase immediately. Harder: two files to
keep consistent — mitigated by AGENTS.md holding only protocol content (no overlap).
