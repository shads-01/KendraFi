# Part 1 — System design: SaaS Readiness Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a written, stakeholder-approved system design for KendraFi (problem, users, flows, requirements, scale) before any further code is written.

**Architecture:** Documentation-only plan; produces `/docs/system-design.md`.

**Tech Stack:** Markdown.

**Spec:** `extraction_1792747023602.md` — Part 1: "System design", pages 4–5, sections "What it is", "What AI agents get wrong", "Decisions you own", prompts 1a–1c.

## Global Constraints

- Must record the tenancy model explicitly (individual vs team vs org).
- Must include an explicit "Out of scope" section.
- No code implementation in this plan.

## Scope

- In scope: system design doc creation, design stress-test, capacity estimate, verification.
- Out of scope: architecture doc (Part 2), schema (Part 3), auth (Part 4).

## Current State Findings (grounded, verified 2026-10-23)

- No `/docs/system-design.md` exists; `docs/` holds pitch, technical, security, on-chain, investor, scalability, storyboard, QA docs — no system design.
- Product framing is competition- and protocol-centric (FinTechathon demo), not written down as a SaaS problem statement with user personas.

## Weaknesses / What Went Wrong

- No written problem statement / user roles / core flows / functional & non-functional requirements → agents later invent requirements (playbook's core agent failure mode for this layer).
- No out-of-scope section, so future work will keep expanding scope.

## Plan

### Task 1: Run the requirements interview

- [x] Agent (or human) interviews stakeholders using playbook §1a; ask one question group at a time on: users/roles, core workflows, tenancy, data sensitivity, year-one scale, billing/plans, compliance, integrations. *(2026-10-23: executed as repo-synthesized interview — user opted not to answer questions; answers drawn from CONTEXT.md / docs/*)*
- [x] Write `/docs/system-design.md` containing: problem statement, user roles, core user flows, functional requirements, non-functional requirements (performance, availability, security), out-of-scope items, open questions.

### Task 2: Stress-test the design

- [x] Spawn a fresh subagent acting as skeptical staff engineer; review `/docs/system-design.md`.
- [x] Collect findings: missing requirements, ambiguous flows, scaling risks, security/privacy risks, over-engineering.
- [x] Rank issues by severity; propose simplest design meeting requirements; do not edit the doc — return the review as a list.

### Task 3: Produce capacity back-of-envelope

- [x] From `/docs/system-design.md`, estimate year-one: requests/sec at peak, DB size, file storage size, background job volume.
- [x] Show math; identify first bottleneck component.

### Task 4: Verification

- [x] Confirm `/docs/system-design.md` exists and is fully read.
- [x] Tenancy model explicitly written.
- [x] "Out of scope" section present.

## Final Verification Checklist

- [x] `/docs/system-design.md` exists with all required sections.
- [x] Tenancy model written down explicitly.
- [x] Out-of-scope section present.

## Running This Plan in Parallel Sessions

- Independent of Parts 2–15; should follow Part 0 and precede Part 2.
- One session per part; subagent per task; Task 2 (stress-test) should use a fresh session/subagent, not the author of Task 1.
