# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-08)

**Core value:** Find identity, missions by year, resources/contact, and sponsor value without WordPress friction.  
**Current focus:** Human gates (chase + CF deploy). Chrome hygiene from 2026-08-29 audit is done.

## Current Position

Phase: 5 of 5 (Host & handover)  
Status: Engineering shipped; **2026-08-29 full-page visual audit** walked every user-reachable route  
Last activity: 2026-08-29 — Replaced `PerytonSpace.github.io` with the Next.js rebuild; unused scrape/archive gitignored

Progress: Known scrape fold-in done · remaining years still Severin · a few chrome defects vs COMP-05 / public copy · deploy/cutover human-gated

## Performance Metrics

**By Phase:**

| Phase | Status |
|-------|--------|
| 0. Content foundation (fold-in) | Done via structured JSON |
| 1. IA & chrome | Done (evolved — see Decisions) |
| 2. Section shells | Done |
| 3. Competition content | Shells + draft fold-in; remaining years Severin |
| 4. Presentation polish | Done + homepage snap IA |
| 5. Host & handover | Docs + local smoke; CF prod deploy open |

## Accumulated Context

### Decisions (live site)

- **Home:** 5 full-viewport snap slides (`HomeSnap.tsx`) — video → activities → achievements → sponsors → connect; ↑/↓ + dots; wheel threshold; footer hidden on home; scroll invitation on first slide after intro
- **Home brand intro:** Once per load/reload — single header logo node expands center → collapses into header slot (0.5s hold); name+backdrop only as overlay; no clone/handoff
- **Activities slide:** Mirrors burger groups via `getActivityNavGroups()` — Launch / Missions / StagWorks (not Rocketry/Satellite labels)
- **Home control:** Logo is the home affordance (user preference); text “Home” removed from bar; logo top-centre in header
- **Header:** Colourless frosted bar (`backdrop-filter` blur); drawer/backdrop **portaled to `document.body`** (fixed positioning broken inside backdrop-filter header)
- **Nav drawer:** Full-viewport dark panel; comingSoon grey + tip; sponsors omitted when JSON empty
- **Layout:** `--ps-shell-max: 1600px`, `--ps-content-max: 1400px` (tokens in globals.css only)
- **Style cascade:** `scrape.css` (WP blocks) then `globals.css` (wins); no Google Fonts runtime; Space Mono via `next/font`
- **Colour:** White text on black (`--ps-fg/#fff` on `--ps-bg/#000`) enforced in globals; WP light backgrounds overridden
- **Footer:** `.ps-footer` new chrome (not WP footer classes)
- **Public media:** Curated copy via `npm run sync-media` (not full `wp-content` symlink); archive remains at repo `wp-content/`
- **SEO:** `public/robots.txt`, `sitemap.xml`, Cloudflare `_headers` generated on build
- **Units:** Landscape ≥720p (1280×720+) — logo/grid/intro proportions in `em`; hairlines stay `px`
- **Awards / video:** `site/awards.json`, `site/media.json` (hero cues; mobile landscape=`contain` / portrait=`cover`; orientation flips pause→DOM fit→paint→play at marked frames)
- **Missions:** `missions/index.json` drives hubs, years, nav year children
- **Content layout:** `scrape/` · `site/` · `missions/` · `team/{index,rosters}` · `pages/{committee,team,stagworks,rosters,…}`
- **Multi-year comps:** Year children shown in hover/focus flyout (burger + home activities); not stacked lists. Hub pages still list years.
- **Team pages:** Committee years + mission team archives are structured (`team/rosters/*` + `personGroups`); scrape HTML overridden for those slugs. Portrait grid uses `--ps-*` elevated cards.
- **NRC early years:** Legacy `/nrc-2/` “For 2021” / “For 2022” → `/nationalrocketry/2021-2022/` and `/nationalrocketry/2022-2023/` (`published`); `/nrc-2/` aliases hub.
- **Mach-23:** Legacy `/competitions/` write-up → `/mach/2022-2023/`; `/competitions/` aliases that year page; draft media/tech as year `extraSections`.
- **Mach-24 / NRC 2023–24 / Race2Space / IOSM:** Folded from WP `draft-*` pages in master.md scrape; draft URLs alias to structured years/hubs. Mission years may carry `extraSections` (same section types as hubs).
- **Host:** Cloudflare Pages chosen + documented; prod deploy awaits credentials
- **2026-08-29 chrome hygiene:** Placeholder years are `comingSoon` in menus (not live links); hub pages published (no COPY TBD pill); unpublished year URLs are visitor “Coming soon” shells; current committee canonical `/committee-2025-2026/` (`/committee-2023-2024-copy/` aliases)

### Pending Todos

**Agent-doable fold-in (scrape already has copy; structured override hid it):**

- [x] SDC 2022–2023 (D.A.V.E win) — published year + hub intro from scrape
- [x] Olympus Rover Trials hub — scrape aims + logo
- [x] Launch4Change hub — Durham / ARIA / 8 km / climate payload + `l4c-2.png`
- [x] `team-mach-25.html` — Mach-24 accordion empty; Mach-23 is a duplicate of `/teammach23` (already structured)
- [x] Stubs checked empty: `/satellite/`, `/satellite-2/` (coming soon only), `/777878-2/` (LinkedIn widget), merch form, empty StagWorks scrape, dated opportunities blog fluff
- [x] Leftover unique scrape on overridden pages: Kunkune + Easy Composites → `sponsors.json`; Duke of Kent address → contact; Mach-23 `/competitions/` gallery extras

**Agent-doable chrome hygiene (found 2026-08-29 visual audit — matches locked product rules, not new scope):**

- [x] **COMP-05:** `placeholder` years are live links in burger + home flyouts (`yearIsNavigable` treats placeholder as live). Grey + “Coming soon” on hover; do not present as live.
- [x] **Public copy:** placeholder year pages tell visitors to edit `web/content/missions/index.json` — authoring note, not visitor copy.
- [x] **Hub badges:** `buildMissionHubPage` hardcodes `status: "placeholder"`, so NRC/SDC/Mach hubs with real intros still show “Placeholder — copy TBD”.
- [x] **Drawer:** “Header prototype: drawer · flip `headerPrototype` in `site.ts`” is visible to every visitor. Keep the prototype switch; hide the code note until committee picks.
- [x] **Current committee URL:** live slug is still WP leftover `/committee-2023-2024-copy/` (title is 2025–2026).
- [x] **Repo:** rebuild lives in [PerytonSpace/PerytonSpace.github.io](https://github.com/PerytonSpace/PerytonSpace.github.io) (WP scrape HTML + full `wp-content` archive gitignored).

**Human-gated (visually confirmed still open):**

- [ ] Cloudflare account → first production deploy (record URL in HOSTING.md)
- [ ] Committee: `headerPrototype` drawer vs rail (both still available)
- [ ] Ethos copy (Carys / Severin) — About `#ethos` still says wording TBD before launch
- [x] `formEmbedUrl` in contact-us.json — Microsoft Forms loads (Subject / Name / Message / Email + Submit)
- [ ] Confirm names: supervisors still “Chris” / “Andrew”; wellbeing is a literal Placeholder card; empty “University wellbeing (SU)” heading
- [ ] Confirm current committee 2025–2026 names/roles (page populated: Matt / Carys / Severin / Caitlin + Tommy / Mya)
- [ ] LinkedIn opt-ins — none shown on committee/team cards
- [ ] Member Zone workshop + course copy (shells with TBD, as designed)
- [ ] Severin write-ups still open: NRC/Mach 2024–25, SDC 2023–25, L4C year, radiation blurb year (Phase 3 INTAKE)
- [ ] Awards wording (home lists SDC Best Innovation 2024–2025 while that year page is still a placeholder)
- [ ] Execute CUTOVER.md after PREDEPLOY_CHASE.md

### Blockers/Concerns

Cutover still blocked on chase + CF credentials. Chrome hygiene from the visual audit is done; remaining work is human copy + first CF deploy.

## Deferred Items

| Category | Item | Status |
|----------|------|--------|
| Intake | Space / uncertain pages | Deferred |
| v2 | 3JS CAD hotspots | Deferred |
| Design | Full brand redesign | Deferred (interim tokens + layout live) |
| Scrape junk | hello-world, about-2, category/*, satellite stub, LinkedIn widget, dated blog | Leave / ignore |

## Session Continuity

Last session: 2026-08-29  
Stopped at: Agent chrome hygiene shipped and verified locally  
Resume file: None  
Next action: Confirm GitHub Pages Action; humans still own PREDEPLOY_CHASE + CF/`peryton.space` cutover
