# Requirements: Peryton Space Website

**Defined:** 2026-08-08  
**Core Value:** Find society identity, missions by year, resources/contact, and sponsor value without WordPress friction.

## v1 Requirements

### Navigation & chrome

- [x] **NAV-01**: User can open a left burger (or equivalent) menu on desktop and mobile
- [x] **NAV-02**: User can return home via the header logo (affordance; text Home control removed by design)
- [x] **NAV-03**: Nav exposes Launch, Missions, StagWorks, Our Team, About, Contact, Member Zone, Sponsors/Partnerships
- [x] **NAV-04**: Missions (esp. Satellite Design) can be browsed by year / evolution path
- [x] **NAV-05**: Committee can review ≥2 header/home prototypes before one is locked
- [x] **NAV-06**: Header is colourless frosted (`backdrop-filter`); drawer portaled outside header
- [x] **HOME-SNAP-01**: Homepage is 5 snappable full-viewport slides (video, activities, achievements, sponsors, connect)
- [x] **HOME-SNAP-02**: Activities slide uses burger groupings (Launch / Missions / StagWorks)

### About & ethos

- [x] **ABOUT-01**: About retains Who we are / about-us content
- [x] **ABOUT-02**: Ethos appears under About (subsection or sibling), not as homepage hero

### Member Zone & contact

- [x] **MEM-01**: Member Zone page exists with placeholders for workshops, ordering/making process, and course resources
- [x] **MEM-02**: Composites + electronics course info lives in Member Zone (not StagWorks)
- [x] **MEM-03**: Member Zone is public (no auth); access requests for email/phone handled elsewhere, not via gated accounts
- [x] **CONTACT-01**: Replacement contact form ships for post-WordPress hosting (do not debug legacy WP form)
- [x] **CONTACT-02**: Contact entry remains discoverable from main nav

### Sponsors

- [x] **SPON-01**: Sponsors data model supports Partnerships, Tier 1, Tier 2
- [x] **SPON-02**: When sponsors JSON is empty/absent, Sponsors nav item and section are fully hidden
- [x] **SPON-03**: When sponsors JSON has entries, Sponsors/Partnerships is reachable from nav

### Competitions & missions content

- [x] **COMP-01**: Competition pages can accept updated copy without redesigning chrome
- [x] **COMP-02**: Launch4Change has a proper section shell
- [x] **COMP-03**: SDC / missions years after Myers are representable (incl. Best Innovation narrative)
- [x] **COMP-04**: Content backlog owned by Severin: NRC (−2y), Mach (−1y), Race2Space, Space uncertain
- [x] **COMP-05**: Incomplete competition/year items appear greyed in menus with “Coming soon” on hover (not linked as live)

### StagWorks

- [x] **STAG-01**: StagWorks keeps current/new focus (weather balloon + new placeholders)
- [x] **STAG-02**: Placeholders exist for RF, composite testing, FEPS boards (filled when confirmed)
- [x] **STAG-03**: No mandatory rewrite of old StagWorks projects

### Team

- [ ] **TEAM-01**: Current committee page is accurate / renew-able
- [x] **TEAM-02**: Historical committees are browsable by year
- [x] **TEAM-03**: Academic supervisors listed (Chris OK; Andrew assumed OK)
- [x] **TEAM-04**: Wellbeing champions are easy to find quickly
- [x] **TEAM-05**: Opt-in LinkedIn links supported for committee (past/present)

### Presentation & home

- [x] **HOME-01**: Awards/wins display does not rely on inconsistent leaf graphics
- [x] **HOME-02**: Home video can be swapped when a newer asset exists (`site-media.json`)
- [x] **HOME-03**: Interim fonts OK; scrape CSS not long-term
- [x] **STYLE-01**: Interim layout/chrome tokens adopted (shell 1600 / content 1400); full brand redesign still deferred

### Content system & ops

- [x] **CMS-01**: New/updated structured pages editable via JSON (or schema-backed files) in Git
- [x] **CMS-02**: Schema documents fields so Severin can edit without inventing HTML
- [x] **HOST-01**: Hosting approach chosen, documented, and locally smoke-tested (Cloudflare Pages; prod deploy human)
- [x] **HOST-02**: Domain/WordPress cutover plan written (DNS, ownership, when to switch)
- [x] **HOST-03**: Handover / style notes exist so next owner can update the site
- [x] **PROC-01**: Bi-weekly Jim↔Severin review until ~September
- [ ] **PROC-02**: Stakeholder inputs chased before deployment (does not block shell builds)

## v2 Requirements

### Polish / stretch

- **CAD-01**: Rotatable 3JS CAD + pinned hotspots on a flagship mission page
- **FONT-01**: Font swap if post-structure review fails Space Mono
- **CMS-03**: Evaluate David’s remembered CMS only if JSON-in-Git fails in practice
- **SPON-03**: Final sponsor offer copy + careers-talk packaging (Severin)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Member Zone auth / accounts | Explicitly out — public resources only |
| Ethos on homepage hero | Explicitly rejected in meeting |
| Full BMad install for this milestone | Overhead > benefit for content site |
| WordPress continued as CMS | Migrating away |
| Rewriting all scraped HTML at once | Page-by-page; new style system TBD |
| Comms/CDR team process changes | Not website scope |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| NAV-01 … NAV-06, HOME-SNAP-* | Phase 1 + post | Complete |
| ABOUT-01, ABOUT-02 | Phase 1 | Complete |
| COMP-05 | Phase 1 | Complete (placeholder years grey + Coming soon; not live-linked) |
| MEM-*, CONTACT-*, SPON-01/02, STAG-*, TEAM-02…05 | Phase 2 | Complete (TEAM-01 still pending confirm) |
| SPON-03 | Phase 2 | Complete (Kunkune + Easy Composites; nav + `/sponsorships/` live) |
| TEAM-01 | Phase 2 | Pending (2025–2026 page at `/committee-2025-2026/`; humans confirm names) |
| CMS-01, CMS-02 | Phase 1–2 | Complete |
| COMP-01 … COMP-04 | Phase 3 | Complete (shells; intake open) |
| HOME-01 … HOME-03, STYLE-01 | Phase 4 + polish | Complete |
| HOST-01…03 | Phase 5 | Complete (prod CF human) |
| PROC-01 | Phase 5 | Acknowledged |
| PROC-02 | Phase 5 | Pending chase |

---
*Requirements defined: 2026-08-08*  
*Last updated: 2026-08-29 — chrome hygiene (COMP-05, public copy, committee slug)*
