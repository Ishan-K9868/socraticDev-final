# Phase 01: Landing Page Dojo Interaction - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-03-27
**Phase:** 01-landing-page-dojo-interaction
**Areas discussed:** Preview depth, mode roster, verification feedback, mode switching UI, post-preview handoff, CTA route

---

## Preview Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Mini real previews | Each of the 5 modes gets one short solvable prompt with real validation, but in a compact landing-page format | Y |
| Full mode embeds | Render something close to the actual dojo challenge UI directly in the landing page | |
| Guided demo only | Interactive-looking showcase with limited real solving, mainly for marketing flow | |

**User's choice:** Mini real previews
**Notes:** The landing section should become genuinely interactive rather than a static showcase.

---

## Mode Roster

| Option | Description | Selected |
|--------|-------------|----------|
| Parsons + Surgery + ELI5 + Mental + Big O | Best fit for short, self-contained previews with clear verification | Y |
| Swap in Faded Examples | Use fill-in-the-blanks instead of one of the harder analytical modes | |
| Swap in Rubber Duck | Use conversational debugging instead of one of the quiz-like modes | |

**User's choice:** Parsons + Surgery + ELI5 + Mental + Big O
**Notes:** The landing preview should focus on the five modes that are easiest to keep compact and verifiable.

---

## Verification Feedback

| Option | Description | Selected |
|--------|-------------|----------|
| Instant verdict + short why | Show correct/incorrect immediately, then reveal a compact explanation and next try | Y |
| Hint first, verdict after retry | Give a hint before saying fully right or wrong | |
| Scoreboard style | Show score, streak, and timer as the main feedback | |

**User's choice:** Instant verdict + short why
**Notes:** The preview should validate fast and explain briefly rather than leaning on gamified stats.

---

## Mode Switching UI

| Option | Description | Selected |
|--------|-------------|----------|
| Top tab rail | Five visible mode tabs/chips above one shared interactive preview panel | |
| Clickable cards | Five richer cards that each open their own preview state inline | Y |
| Auto-rotating carousel | A moving showcase where users can still manually switch modes | |

**User's choice:** Clickable cards
**Notes:** The selector should feel richer than simple tabs while still clearly exposing the top five modes.

---

## Post-Preview Handoff

| Option | Description | Selected |
|--------|-------------|----------|
| Offer next preview + Enter Dojo | Keep them in the landing experience, but also provide a clear CTA into the full dojo | Y |
| Jump straight to full dojo | Immediately route them into `/dojo` or `/learn` after one solved preview | |
| Stay on same mode only | Let them keep replaying the same preview without a stronger next-step push | |

**User's choice:** Offer next preview + Enter Dojo
**Notes:** The preview should support continued exploration without losing the conversion path into the full dojo.

---

## CTA Route

| Option | Description | Selected |
|--------|-------------|----------|
| Go to /dojo | Take them straight into the full dojo experience, matching the section they just used | Y |
| Go to /learn | Send them into the broader learning hub first | |
| It depends on mode | Use per-mode routing or a mixed handoff strategy | |

**User's choice:** Go to /dojo
**Notes:** The main CTA should take users directly to the full dojo route.

---

## the agent's Discretion

- Exact visual treatment of the five selector cards.
- Whether the selected mode is preserved when entering `/dojo`.
- The exact preview-sized dataset and explanation copy per mode.

## Deferred Ideas

- Expanding the landing preview to all dojo modes.
- Making scoreboard/streak/timer the center of the landing interaction.
