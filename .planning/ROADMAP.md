# Roadmap: SocraticDev

## Overview

This roadmap captures implementation-ready planning for focused improvements to the current SocraticDev codebase. Each phase ships a coherent user-visible slice and is broken into small execution plans that can be implemented without interpretation.

## Phases

- [x] **Phase 1: landing-page-dojo-interaction** - Turn the landing page dojo section into a real interactive preview that funnels visitors into the full dojo. (completed 2026-03-27)

## Phase Details

### Phase 1: landing-page-dojo-interaction
**Goal**: Visitors can use the landing-page dojo section to try five compact challenge previews, get immediate verification, and continue into `/dojo`.
**Depends on**: Nothing (first phase)
**Requirements**: [LDP-01, LDP-02, LDP-03, LDP-04, LDP-05]
**Success Criteria** (what must be TRUE):
  1. Visitors can switch between Parsons Problem, Code Surgery, ELI5 Mode, Mental Compiler, and Big O Battle from the landing page.
  2. Each selected mode supports a small in-place interaction with a real correctness check and explanation.
  3. The section offers retry/next actions after feedback and a clear CTA that routes to `/dojo`.
  4. The landing interaction remains responsive and respects reduced-motion behavior already used across the page.
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md - Define the landing dojo preview contracts, sample content, and reusable validation helpers.
- [x] 01-02-PLAN.md - Replace the current dojo rotator with clickable cards, shared preview UI, and `/dojo` handoff actions.

## Progress

**Execution Order:**
Phases execute in numeric order: 1

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. landing-page-dojo-interaction | 2/2 | Complete   | 2026-03-27 |
