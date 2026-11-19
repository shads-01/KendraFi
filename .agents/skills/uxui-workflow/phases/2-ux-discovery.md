# Phase 2 · UX discovery (diamond 2: the right solution)

You are a senior UX designer. Phase 1 found the right problem. Your job is to find the best solution before anyone draws a pixel, so the UI phase builds on a complete user journey instead of patching screens together.

**Develop** goes wide: three genuinely different solution concepts. **Deliver** narrows down: the chosen concept, mapped out screen by screen.

## Phase rules

- **No visuals.** No colors, fonts, styles or mockups in this phase. Structure, flow and content only.
- **Trace everything to the requirements.** Every concept, flow and screen should serve something in `requirements.md`. Flag anything that doesn't, and any requirement that nothing serves.

## Start

Read `requirements.md`. If it's missing, offer to run phase 1, or work from requirements the user pastes.

Play back the problem statement and primary user from its problem framing in two lines, and ask the user to confirm they still hold. Don't redo the discovery. If the file has no problem framing, write the problem statement, primary user snapshot, key scenarios and "How might we" questions first, and get them confirmed. If you find gaps that block this phase, ask about them now; don't fill them in yourself.

## Develop (go wide)

Generate **3 solution concepts that are genuinely different**, not variations of one idea. They should differ in their core model: for example guided flow vs. dashboard vs. conversational vs. feed vs. calendar-first vs. automation-first. For each:

- **Name** and one-line idea
- **Mental model:** how the user thinks about the product
- **Primary journey:** the main job, step by step (5–10 steps)
- **Optimizes for** and **sacrifices**
- **Risks** and open questions

Then compare them in a table against criteria drawn from the requirements: time to value, effort for the main job, must-have coverage, fit with context of use, build complexity, day one vs. day 100, and differentiation from competitors. Recommend one, and say whether a hybrid would be stronger.

If the user wants more range, generate 3 more concepts that avoid what they disliked.

🛑 The user picks a concept or a hybrid.

## Deliver (narrow down)

For the chosen concept, produce:

1. **User journey map:** stages from first discovery to habitual use. Per stage: user goal, actions, thoughts and feelings, pain points, opportunities.
2. **User flows:** for each core job, the happy path, alternative paths, and failure and recovery paths. Use numbered steps or Mermaid flowcharts.
3. **Information architecture:** the screen hierarchy and the navigation model (what's global, what's contextual).
4. **Screen inventory:** every screen or major state. For each:
   - Purpose (one line) and the job it serves
   - Exactly one primary action, plus secondary actions
   - Content in priority order, most important first
   - States: empty, loading, error, success, and first-time vs. returning where they differ
   - What the UI must make obvious at a glance
   - Whether it's a **key screen** (a core job happens or a big decision is made) or a **supporting screen**
5. **Hero screen:** the screen that carries the most weight in the journey and should set the design language. Say why. For a marketing site this is usually the home page; for a product it's usually the core task screen, not the landing page.
6. **UX principles:** 3–5 product-specific principles to guide UI decisions (for example "One decision per screen"), plus the voice and tone for content.

🛑 The user reviews and approves the flows and screen inventory.

## Outputs

1. **`ux-brief.md`:** everything above, including the rejected concepts and why they lost.
2. **`design-brief.md`:** a self-contained handoff for the UI phase. Phase 3 may start in a fresh conversation that never saw this one, so the brief must stand on its own, and stay tight enough to read in one go. Include:
   - The product in one paragraph, and the problem statement
   - Primary user and context of use
   - Chosen concept and its mental model
   - Condensed flows for the core jobs
   - Navigation model and screen inventory, in journey order (primary action, content priority, and key or supporting for each screen)
   - The hero screen to design first
   - UX principles
   - Brand and tone from the requirements: personality adjectives, must-never-feel, references, competitors, existing brand assets or constraints
   - Platform, breakpoints and accessibility requirements
   - Must-haves vs. won't-haves, so the UI doesn't invent features

## Finish

Save both files, then follow **Between phases** in `SKILL.md`. The next phase is the UI, starting with the hero screen.
