# Part 0 — Set up the agent before layer one: SaaS Readiness Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the KendraFi agent a single, current project memory and a repeatable working loop so all later layer plans (Parts 1–15) run against stable context and the agent stops re-deriving stack decisions every session.

**Architecture:** Markdown memory files and decision records only. No runtime code is changed in this plan.

**Tech Stack:** Markdown; shell (git, npm, python). No new dependencies.

**Spec:** `extraction_1792747023602.md` — Part 0: "Set up the agent before layer one", pages 2–3, sections 0.1–0.4.

## Global Constraints

- One source of truth for agent memory; do not create conflicting duplicates.
- No secrets may be committed; `.env.example` values are placeholders only.
- Every plan executor must be able to run the universal "don't fool me" verification prompt (§0.4 of spec).

## Scope

- In scope: project memory file, working loop, agent features, universal done-check.
- Out of scope: any layer-1+ feature work (covered by Parts 1–15 of this plan series).

## Current State Findings (grounded, verified 2026-10-23)

- Repo root contains `AGENTS.md` holding the KendraFi autonomous multi-agent protocol; global `~/.config/opencode/AGENTS.md` holds the separate "Learning Companion" persona. No `CLAUDE.md` exists in the repo.
- No `/docs/decisions/` directory and no Architecture Decision Records (ADRs) exist.
- The working loop (plan → review → small steps on branch → verify → record) exists only as prose inside `AGENTS.md`, not as an executable checklist.
- No custom commands (`.claude/commands/`), repo hooks, or repo-level MCP server config were found.

## Weaknesses / What Went Wrong

- Two competing agent memories with different personas/instructions can cause the agent to follow the wrong operating mode.
- No durable stack, commands, rules, or decision log means every fresh session re-litigates stack choices (observed: agent must be re-told the stack in each new context).
- No machine-checkable "done" definition, so a task can be declared complete with failing tests.

## Plan

### Task 1: Create unified project memory

- [ ] Create `CLAUDE.md` at the repo root with: product one-liner, frozen stack, rules, commands, decisions pointer.
- [ ] Make `AGENTS.md` reference or mirror the same content so Claude Code and Codex share one source of truth.
- [ ] Add `/docs/decisions/` directory with an ADR template (Context / Decision / Alternatives / Consequences).

### Task 2: Install the working loop and done-check

- [ ] Write the working loop as a checklist: plan first → review plan → implement in small steps on a branch → run lint/typecheck/tests → review diff → record decision.
- [ ] Add the universal "don't fool me" prompt block (§0.4 of spec) verbatim into the memory file.

### Task 3: Add agent leverage features

- [ ] Create custom slash commands for repeatable workflows (requirements interview, security review, system-design stress test, CNP scenario execution).
- [ ] Define subagent SOPs (planner, security reviewer, test reviewer) without changing runtime code.
- [ ] Optionally wire repo-level MCP servers (GitHub, error tracker, database) — no code changes.

### Task 4: Verify memory integrity

- [ ] In a fresh agent session, confirm the agent can state the stack, commands, and current phase without asking.

## Final Verification Checklist

- [ ] One shared memory file is readable by both Claude Code and Codex.
- [ ] `/docs/decisions/` exists with at least one ADR.
- [ ] The universal done-check block is present and was followed on the last task.
- [ ] Fresh-session agent answers "what stack do we use?" correctly without guessing.

## Running This Plan in Parallel Sessions

- This plan has no cross-part dependencies; it should run before Part 1.
- Run as its own session (or first task of a session set) using subagents per task.
- Do not start Part 1 until Task 4 of this plan passes.
