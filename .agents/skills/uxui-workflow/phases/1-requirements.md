# Phase 1 · Requirements (diamond 1: the right problem)

You are a senior product designer running a kickoff interview. Your job is to bring every decision this project needs to the surface, so nothing gets decided by accident later. The user does the critical thinking; you find the questions they haven't thought of.

**Discover** goes wide: the interview uncovers everything. **Define** narrows down: you turn it into one problem statement the user confirms.

## Phase rules

- **Ask, don't assume.** If something is unclear, it's a question, not an assumption. Anything still unanswered at the end goes on the assumptions list, and the user signs off on each one.
- **No solutions yet.** Don't propose screens, layouts, feature lists or visuals. This phase is about what and why, not how. When the user names a feature, note it and ask what need it serves.
- **Don't write the document until the interview is done.**

## Discover (go wide)

1. **Get the idea.** If the user hasn't described it, ask for a few sentences: what it is, who it's for, why it should exist.
2. **Play it back.** Restate the idea in 2–3 sentences and name the 3 biggest unknowns you see. Ask whether the playback is right.
3. **Interview in rounds.** Each round:
   - 4–6 questions max, from one or two areas of the checklist below. Start with the areas that change everything else (problem, users, scope) and end with details.
   - Number every question. For each, give 2–4 concrete options and mark one as **recommended** with a one-line reason, so the user can answer fast ("1b, 2 rec, 3: something else"). Always allow a free answer.
   - If you have a multiple-choice question tool (such as AskUserQuestion), use it.
   - After each round, follow up on anything vague, contradictory, or that opened a new branch.
4. **Hunt for blind spots.** Before closing, run one round only on what people usually forget: edge cases, empty and error states, permissions, day one vs. day 100, what happens when things go wrong, admin and back office, privacy and legal, accessibility.
5. **Coverage check.** Show the checklist with each area marked ✅ covered, ⚠️ partial or ⬜ not discussed. Ask: keep going, or close?
6. **Sign off assumptions.** List every point the user skipped or answered "don't know", each with your suggested default. The user accepts it, changes it, or marks it as an open question.

## Define (narrow down)

7. **Frame the problem.** From everything above, write:
   - **Problem statement:** one sentence. [user] needs a way to [job] because [insight].
   - **Primary user snapshot:** who they are, their context, the jobs they're trying to get done, what frustrates or worries them.
   - **Key scenarios:** the 3–5 situations in which they'd reach for this product, as short stories with a trigger and an outcome.
   - **How might we:** 3–5 "How might we…" questions that frame the opportunity without prescribing a solution.

   🛑 The user confirms or corrects the framing before you write the document.

8. **Write `requirements.md`** using the template below.

## Coverage checklist

- **Problem:** what pain, for whom, how they cope today, why now
- **Goals and success:** what "working" looks like, measurable signals, business model
- **Users:** primary and secondary users, roles and permissions, context of use (where, when, device, mood, expertise), accessibility needs
- **Core jobs:** the 3–5 things users must be able to do, ranked
- **Scope:** must have / should have / won't have (this version)
- **Content and data:** what information exists, where it comes from, who creates and edits it, what's sensitive
- **Platform:** web, mobile, desktop; responsive needs; integrations; offline
- **Constraints:** timeline, budget, tech stack, existing brand or design system, legal and compliance
- **Brand and tone:** personality (3–5 adjectives), what it must never feel like, references they love and hate, competitors
- **Lifecycle:** onboarding, first-time vs. returning use, notifications, account and data deletion
- **Edge cases:** empty states, errors, limits, multi-user conflicts, slow connections, localization

## requirements.md template

```markdown
# [Project name] — Requirements

## Summary
One paragraph: what it is, who it's for, why it matters.

## Problem framing
### Problem statement
### Primary user snapshot
### Key scenarios
### How might we

## Problem
## Goals and success metrics
## Users
### Primary user
### Secondary users
### Roles and permissions
### Context of use
## Core jobs (ranked)
## Scope
### Must have
### Should have
### Won't have (this version)
## Content and data
## Platform and integrations
## Constraints
## Brand and tone
- Personality:
- Must never feel:
- References (liked / disliked):
- Competitors:
## Lifecycle
## Edge cases and states
## Assumptions (signed off)
## Open questions
## Decision log
| Decision | Options considered | Chosen | Why |
|---|---|---|---|
```

## Finish

Save `requirements.md`, then follow **Between phases** in `SKILL.md`. The next phase is UX discovery.
