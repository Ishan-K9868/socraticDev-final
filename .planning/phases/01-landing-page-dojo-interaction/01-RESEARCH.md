# Phase 01 Research: Landing Page Dojo Interaction

**Phase:** 01
**Status:** Complete
**Date:** 2026-03-27

## Goal

Determine the safest implementation approach for turning the landing-page dojo area into a real mini-preview experience without replacing the full dojo flow.

## Findings

### Existing code to reuse

- `frontend/src/components/DojoSection.tsx` already owns the landing dojo section, selector metadata, Framer Motion entry animation, and CTA placement.
- `frontend/src/features/dojo/ParsonsChallenge.tsx`, `CodeSurgery.tsx`, `ELI5Challenge.tsx`, `MentalCompiler.tsx`, and `BigOBattle.tsx` already contain useful challenge-specific validation rules, copy patterns, and hardcoded example sources.
- `frontend/src/features/dojo/ChallengeIcons.tsx` already provides custom SVG icons for all five required modes.
- `frontend/src/hooks/useReducedMotion.ts` already exposes the reduced-motion signal used elsewhere on the landing page.

### Recommended architecture

- Do not embed `DojoPage.tsx` or the full challenge components inside the landing page. Those flows are full-screen, multi-step, and materially larger than the requested mini-preview scope.
- Create a small landing-preview module under `frontend/src/features/dojo/landingPreview/` with:
  - shared mode/type contracts,
  - hardcoded preview scenarios for the five approved modes,
  - pure validation helpers that return verdict + explanation,
  - one shared preview panel component that swaps between mode renderers.
- Keep preview state local to the landing preview module or `DojoSection.tsx`, matching the existing dojo pattern of local challenge state.

### Constraints to preserve

- Use exactly these five modes from context decision `D-03`: Parsons Problem, Code Surgery, ELI5 Mode, Mental Compiler, Big O Battle.
- Use clickable cards, not auto-rotation or tabs, per `D-04`.
- Submission feedback must be immediate and include a short why explanation per `D-05` and `D-06`.
- The main conversion CTA must route to `/dojo` per `D-08`.
- No new dependencies are needed; current frontend dependencies already cover icons, motion, and any challenge-specific behavior needed for mini previews.

### Verification strategy

- Primary automated verification: `npm run build` from `frontend/`.
- Secondary automated verification: `npm run lint` from `frontend/` if touched files introduce lint-visible regressions.
- Manual spot-check after implementation: use the landing page on desktop and mobile widths, switch all five previews, submit one correct and one incorrect answer, and confirm `/dojo` CTA routing.

## Decision

Proceed with a small dedicated landing-preview feature slice and wire it into `DojoSection.tsx`. This keeps the landing experience real and interactive without coupling it to the full dojo shell.

---

*Research complete for phase 01.*
