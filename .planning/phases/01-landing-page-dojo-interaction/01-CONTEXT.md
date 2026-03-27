# Phase 01: Landing Page Dojo Interaction - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Transform the landing page dojo section into an in-place interactive preview for five dojo modes so visitors can switch modes, solve a compact challenge, receive verification, and then either continue previewing or enter the full dojo. This phase does not add new dojo capabilities, replace the full `/dojo` experience, or expand the landing page to all ten modes.

</domain>

<decisions>
## Implementation Decisions

### Preview Depth
- **D-01:** The landing page uses mini real previews, not static marketing cards and not near-full embedded dojo screens.
- **D-02:** Each selected mode should expose a compact, single-session interaction that a visitor can solve directly inside the landing page with real validation logic.

### Mode Selection
- **D-03:** The landing page preview should feature exactly these five modes: Parsons Problem, Code Surgery, ELI5 Mode, Mental Compiler, and Big O Battle.
- **D-04:** Users switch between the five previews through clickable cards, not a tab rail and not an auto-rotating carousel.

### Verification Feedback
- **D-05:** Submitting an answer should produce an immediate correct/incorrect verdict.
- **D-06:** The verdict should include a short explanation of why, then offer another try or the next preview rather than emphasizing scoreboard-first feedback.

### Handoff Flow
- **D-07:** After a visitor completes a landing-page preview, the UI should offer both a next-preview action and a clear path into the full dojo.
- **D-08:** The main handoff CTA from this section should route to `/dojo`, not `/learn`.

### the agent's Discretion
- Exact card styling, animation timing, and microcopy inside the landing section.
- Whether the `/dojo` handoff preserves the currently selected preview mode through router state or a simpler default entry, as long as the CTA lands in `/dojo`.
- Which concrete hardcoded examples or reduced datasets are used for each preview mode, as long as they stay short and verifiable.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Dojo feature requirements
- `requirements.md` - Section 2.8 defines The Dojo challenge system, challenge-type expectations, language support, AI mode, and completion tracking behavior.
- `design.md` - Section 6.2 describes The Dojo within the current product architecture and helps keep the landing preview aligned with the full feature.

### Landing page behavior and constraints
- `.kiro/specs/premium-landing-redesign/requirements.md` - Landing-page interactivity, working `/dojo` navigation, responsiveness, accessibility, and performance constraints.
- `.kiro/specs/premium-landing-redesign/design.md` - Route integration and interaction-feedback properties that the landing-page dojo preview should continue to satisfy.

### Existing dojo-section animation direction
- `.kiro/specs/landing-page-animations/requirements.md` - Existing DojoSection animation expectations that may need adaptation around the new preview experience.
- `.kiro/specs/landing-page-animations/design.md` - Prior DojoSection animation concepts; use as reference only where they support the new interactive preview direction.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend/src/components/DojoSection.tsx`: existing landing-page dojo shell, challenge metadata, active selection state, and CTA placement.
- `frontend/src/features/dojo/DojoPage.tsx`: current full-dojo orchestration for selected mode, completion states, language handling, and post-challenge flows.
- `frontend/src/features/dojo/ParsonsChallenge.tsx`: drag-and-drop ordering logic and hardcoded example loading that can inform a reduced preview.
- `frontend/src/features/dojo/CodeSurgery.tsx`: bug-line selection and immediate verification patterns that fit a landing-page preview.
- `frontend/src/features/dojo/ELI5Challenge.tsx`: free-text submission and lightweight explanation scoring patterns.
- `frontend/src/features/dojo/MentalCompiler.tsx`: multiple-choice validation plus compact explanation/trace reveal.
- `frontend/src/features/dojo/BigOBattle.tsx`: short timed question loop with immediate answer evaluation.

### Established Patterns
- Landing-page sections already use Framer Motion, in-view triggers, and section-level composition from `frontend/src/pages/LandingPage.tsx`.
- Full dojo experiences keep challenge state local to each feature component instead of pushing it into the global store.
- Existing dojo modes support both hardcoded examples and AI-backed generation, which enables a compact preview without inventing new challenge types.
- Route handoff already uses React Router links and existing app routes such as `/dojo` and `/learn`.

### Integration Points
- Replace the current featured rotator and static 10-card list inside `frontend/src/components/DojoSection.tsx` with a shared interactive preview panel plus five selectable cards.
- Connect completion and deep-engagement CTAs from the landing section into the existing `/dojo` route.
- Reuse existing dojo examples, evaluators, and challenge logic where practical instead of embedding the entire `DojoPage` shell.

</code_context>

<specifics>
## Specific Ideas

- The section should feel interactive and hands-on, not like a list of buttons.
- Visitors should be able to click the top five dojo modes directly from the landing page.
- Visitors should be able to solve something small and get verification inside the landing section itself.
- The landing interaction should still funnel clearly into the full dojo experience after the preview.

</specifics>

<deferred>
## Deferred Ideas

- Showing all ten dojo modes in the landing-page preview instead of the selected five.
- Making scoreboard, streaks, or timers the primary landing-page feedback surface.
- Replacing the full `/dojo` flow with the landing-page preview instead of treating it as a teaser/on-ramp.

</deferred>

---

*Phase: 01-landing-page-dojo-interaction*
*Context gathered: 2026-03-27*
