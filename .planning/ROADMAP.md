# Roadmap: Peryton Space Website

## Overview

WordPress scrape → committee-maintainable Next.js site: IA/chrome → shells → mission years → polish (incl. snap homepage + interim style) → Cloudflare host/handover. Bi-weekly Jim↔Severin until ~September. Engineering for known scope is shipped; cutover is human-gated.

## Phases

- [ ] **Phase 0: Content foundation** — *Demoted / fold-in* — only as needed for new shells (not a gate before nav)
- [x] **Phase 1: IA & chrome** — Burger nav, Home, grey+Coming soon, About/ethos, prototypes (human pick pending)
- [x] **Phase 2: Section shells** — Member Zone, Sponsors hide-if-empty, Team, StagWorks placeholders, Contact replacement
- [x] **Phase 3: Competition & mission content** — Year structure shipped; Severin write-ups pending
- [x] **Phase 4: Presentation polish** — Awards strip, video config, interim style decided
- [x] **Phase 5: Host & handover** — CF Pages chosen; cutover/handover docs; local static smoke

## Phase Details

### Phase 0: Content foundation (fold into 1–2)
**Goal**: Minimal structured JSON for new pages when shells need it — do not block Phase 1  
**Depends on**: Nothing  
**Requirements**: CMS-01, CMS-02 (as needed)  
**Success Criteria**:
  1. New shells can be JSON-backed without editing scrape HTML
  2. Scraped pages still fall back
**Plans**: opportunistic

Plans:
- [ ] 00-01: Minimal page JSON + loader when first new shell needs it
- [ ] 00-02: Authoring notes (already drafted in `docs/AUTHORING.md`)

### Phase 1: IA & chrome
**Goal**: Modern navigation and incomplete-page UX  
**Depends on**: Nothing (start here)  
**Requirements**: NAV-01…NAV-05, ABOUT-01, ABOUT-02, COMP-05  
**Success Criteria**:
  1. User opens menu from left; Home is explicit
  2. Nav matches target IA; incomplete comps/years grey + Coming soon on hover
  3. Ethos lives under About; ≥2 prototypes reviewed
**Plans**: 3 plans

Plans:
- [ ] 01-01: Redesign `SiteHeader` (burger + Home + incomplete-item UX)
- [ ] 01-02: Rewrite `navigation` in `site.ts` + route stubs / disabled items
- [ ] 01-03: About + ethos structure; ship prototypes for committee

### Phase 2: Section shells
**Goal**: Empty-but-real destinations for Member Zone, Sponsors, Team, StagWorks, Contact  
**Depends on**: Phase 1  
**Requirements**: MEM-*, CONTACT-*, SPON-*, STAG-*, TEAM-*  
**Success Criteria**:
  1. Member Zone public (no auth); courses live there
  2. Sponsors hidden when JSON empty; visible when populated
  3. Contact **replacement** ready for cutover (not WP debug)
**Plans**: 4 plans

Plans:
- [ ] 02-01: Member Zone shell + course slots (public)
- [ ] 02-02: Sponsors JSON + hide-when-empty behaviour
- [ ] 02-03: Team (current, historical, supervisors, wellbeing, LinkedIn opt-in)
- [ ] 02-04: Contact replacement + StagWorks placeholders

### Phase 3: Competition & mission content
**Goal**: Year-organised missions + updated competition copy  
**Depends on**: Phase 1 (nav); Phase 2 optional  
**Requirements**: COMP-01…COMP-04 (COMP-05 from Phase 1)  
**Success Criteria**:
  1. User can see mission evolution by year for SDC (and pattern for others)
  2. Completing a year flips it from grey/Coming soon to live
  3. Launch4Change has a proper section
**Plans**: 2 plans

Plans:
- [ ] 03-01: Year-based mission listing UI / content model
- [ ] 03-02: Content intake checklist for NRC, Mach, Race2Space, L4C, SDC

### Phase 4: Presentation polish
**Goal**: Home awards + media; adopt **new style system when TBD resolves**  
**Depends on**: Phases 1–2  
**Requirements**: HOME-01…HOME-03, STYLE-01  
**Success Criteria**:
  1. Awards strip looks consistent year-to-year
  2. Video asset path is swappable
  3. Style system decision recorded (or explicitly still TBD)
**Plans**: 2 plans

Plans:
- [ ] 04-01: Awards/wins redesign
- [ ] 04-02: Style system decision spike + (optional) CAD

### Phase 5: Host & handover
**Goal**: Deployable production path + next-owner docs  
**Depends on**: Phases 1–2 minimum; stakeholder chase before deploy  
**Requirements**: HOST-01 (**TODO**), HOST-02 (**TODO**), HOST-03, PROC-*  
**Success Criteria**:
  1. Hosting chosen, documented, smoke-tested
  2. Cutover plan (DNS / WP → new host) written
  3. Handover notes exist; reviews logged
**Plans**: 3 plans

Plans:
- [ ] 05-01: **TODO** — Hosting decision + deploy pipeline (Cloudflare preferred)
- [ ] 05-02: **TODO** — Domain / WordPress cutover plan
- [ ] 05-03: Handover + style notes

## Progress

**Execution Order:** 1 → 2 → 3 → 4 → 5 (Phase 0 folded into 1–2 as needed)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 0. Content foundation (fold-in) | 0/2 | Opportunistic | - |
| 1. IA & chrome | 3/3 | Complete (gates open) | 2026-08-08 |
| 2. Section shells | 4/4 | Complete | 2026-08-08 |
| 3. Competition & mission content | 2/2 | Complete (intake open) | 2026-08-08 |
| 4. Presentation polish | 2/2 | Complete | 2026-08-08 |
| 5. Host & handover | 3/3 | Complete (prod CF deploy human) | 2026-08-08 |

## Owners (human)

| Area | Owner |
|------|--------|
| Implementation, nav, schema, host | Jim |
| Competition/sponsor/StagWorks copy; LinkedIn asks | Severin |
| Ethos placement sign-off | Carys |
| Prototype pick | Committee |

---
*Roadmap created: 2026-08-08*
