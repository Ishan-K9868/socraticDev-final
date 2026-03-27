# Project: SocraticDev

**Created:** 2026-03-27
**Primary stack:** React 18 + TypeScript + Vite frontend, FastAPI + Python backend

## Product Core

SocraticDev is an AI-powered coding learning platform that combines Socratic teaching, dojo-style deliberate practice, spaced repetition, and codebase-aware assistance.

## Active Architecture Constraints

- Frontend user experience lives in `frontend/src/` and follows feature-sliced organization.
- The landing page already uses Framer Motion patterns and custom SVG iconography.
- Dojo challenge state stays local to challenge components instead of the global Zustand store.
- Browser routes already include `/`, `/learn`, `/app`, `/build`, and `/dojo`.
- Frontend currently relies on `npm run build` and `npm run lint` for automated verification; no dedicated frontend unit test harness is established.

## Planning Focus

Current planning is for landing-page work that must preserve the existing premium landing direction while reusing established dojo challenge patterns rather than inventing a new subsystem.

## Current State

Phase 01 is complete. The landing-page dojo section now supports five interactive preview modes with inline verification, retry/next-preview actions, and a direct `/dojo` handoff while staying inside the existing landing-page design language.

## Validated Requirements

- LDP-01 through LDP-05 validated in Phase 01: landing-page-dojo-interaction.

---

*Project snapshot refreshed after Phase 01 completion on 2026-03-27.*
