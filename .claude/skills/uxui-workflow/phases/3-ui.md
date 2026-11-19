# Phase 3 · UI (the rule of three)

You are a top-tier product designer. Every round produces exactly three options, so the user chooses instead of accepting a default.

This phase is a small diamond of its own: go wide with 3 directions, narrow to one, go wide again with 3 variations of it, narrow to the winner.

## Inputs

Read `design-brief.md`, or `ux-brief.md` plus `requirements.md` if there's no design brief. If none exist, offer to run phase 2, or work from a brief the user pastes. If `ui-progress.md` exists, this phase already started: open the canvas it links to and pick up at the round it records.

Treat the brief's content, flows and screen inventory as fixed: the UI expresses the UX, it doesn't redesign it. Don't add anything from the won't-have list.

## Where the design happens

**On a Claude Design canvas, in this conversation.** If you can create Design artifacts (a canvas of live artboards), make one named after the project and design every round on it. Follow the Design type's own instructions for how to build the canvas and its artboards; this file only says what goes on it.

Lay the canvas out as the record of the diamond, top to bottom in the order things happened:

- **One row per round,** with a title above it: "Round 1 · Directions", "Round 2 · Variations", "Checkout · Variations".
- **Three artboards per row,** side by side, framed as A, B and C with a short name ("A · Ledger").
- **Rejected rounds stay** as their own rows ("Round 1 · Directions (rejected)"), with the new round below them.
- **Mark each pick** in its frame title ("B · Ledger · picked").
- **Rationale goes in your reply,** not on the artboards: name, idea, trade-off, what each one pushed.

Keep `ui-progress.md` in the project root up to date: the canvas link, the design system link once it exists, the current round, and every pick so far with the reason. That's how a new conversation picks up the same canvas.

The user can answer in chat or by commenting on artboards. If they say they've left comments, read them.

**If you can't create Design artifacts,** build each option as its own HTML file instead (for example `designs/round-1/a-[name].html`), open them so the user can compare them side by side, and copy each winner to `designs/final/`. Save the design system as `design-system.md`, plus a token file. If a frontend design skill is available, follow its guidance too.

### If the user has a default design system

A Design canvas uses the user's default design system automatically. Say so before round 1: the three directions will share its colors and type, so they'll differ in layout, density, hierarchy and signature instead of visual language. If the user wants the full range, they can ask you to design without it. When the canvas already uses their system, skip creating a new one in round 4.

## Round 1 · Directions (go wide)

Design the hero screen named in the brief in **3 distinct directions**. All three must be complete, high quality and faithful to the brief (same content priority, same primary action), but differ in:

- **Layout and structure:** how the content priority is expressed
- **Visual language:** type, color, density, shape, imagery
- **Signature:** the one memorable element that makes it ownable

Avoid the generic AI look: no default purple-to-blue gradients, no interchangeable SaaS hero, no grid of identical cards unless the brief calls for one. Use real content from the brief, not placeholder text.

In your reply, label each with a name, the idea in one line, which user goal or principle from the brief it serves best, and its trade-off.

🛑 Narrow down: the user picks one or rejects all three. On a rejection, get what's wrong with each (ask, or infer from their comments and confirm), then add a new row of 3 directions that avoid those problems. Never repeat a rejected idea.

## Round 2 · Variations (go wide again, inside the direction)

Make **3 variations of the chosen direction** in a new row. Same design language; not safer versions and not new directions. Each pushes one thing further:

- **Hierarchy:** sharper focus on the primary action and the most important content
- **Signature:** a more distinctive interaction, layout move or detail
- **Craft:** refined typography, spacing, rhythm and micro-details

Each should be something a top product designer would ship. Say what each one pushed. The goal is a version that's ahead of what everyone else ships.

🛑 Narrow down: the user picks the winner, or names elements to combine.

## Round 3 · Critique and fix

Critique the chosen screen against the brief, honestly:

- Is the primary action the most obvious thing on the screen?
- Does the content order match the brief's priority?
- Does it fit the journey before and after this screen?
- Are empty, loading and error states designed?
- Accessibility: WCAG AA contrast, tap target sizes, focus states, readable type sizes
- Behavior at the brief's breakpoints

List issues by severity with proposed fixes. 🛑 Apply only the ones the user approves, on the winning artboard.

## Round 4 · Lock the system

Turn the approved screen into a design system: color tokens with roles, type scale, spacing scale, radii, elevation, icon style, and core components (buttons, inputs, cards, navigation) with their states, plus a short guide with usage rules.

- **On a canvas:** create a Design System artifact named "[Project] design system" from the approved screen, then use it on the canvas so every following screen is built from it. Add its link to `ui-progress.md`.
- **If the canvas already uses the user's own design system:** don't create a new one. List any new patterns the screen introduced, and ask before adding anything to their system.
- **In code:** save it as `design-system.md` plus a token file.

## Round 5 · Roll out

Work through the brief's screen inventory in journey order.

- **Key screens** (a core job happens or a big decision is made): a new row of 3 variations inside the system. 🛑 The user picks.
- **Supporting screens:** one version each, following the system. The user can ask for 3.

Every few screens, check all approved screens for consistency and fix any drift.

Finish with a row titled "Approved screens", holding the winners in journey order, and make the primary flow clickable across them if the canvas supports prototype links.

## Finish

This is the last phase. Follow steps 1 and 2 of **Between phases** in `SKILL.md` (save and recap), and give the user the canvas and design system links. There's no next phase to ask about.
