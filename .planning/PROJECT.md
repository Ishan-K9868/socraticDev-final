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

---

*Project snapshot prepared for phase planning on 2026-03-27.*
