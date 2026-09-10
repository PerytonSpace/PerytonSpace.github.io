# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-08)

**Core value:** Find identity, missions by year, resources/contact, and sponsor value without WordPress friction.  
**Current focus:** Human gates (chase + CF deploy). 2026-09-02 UI audit engineering fixes landed.

## Current Position

Phase: 5 of 5 (Host & handover)  
Status: Engineering shipped; **2026-09-02 UI audit fixes** hid public authoring leaks and COMP-05 award/flyout defects  
Last activity: 2026-09-10 — Restored Pages custom domain `projects.peryton.space` onto the society rebuild. Human: names, ethos sign-off, write-ups, CF deploy.

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
- **Home control:** Logo in the left rail is the home affordance; click always returns to the hero video snap slide
- **Chrome:** No top bar or burger. Persistent left rail only
- **Nav rail:** Collapsed = logo + section icons (Launch / Missions / StagWorks / Our Team / About / Member Zone / Contact); expanded = sidebar tree. Hover or tap expands; click the page (or Escape) collapses. comingSoon grey + tip; sponsors omitted when JSON empty
- **Layout:** `--ps-shell-max: 1600px`, `--ps-content-max: 1400px` (tokens in globals.css only)
- **Style cascade:** `scrape.css` (WP blocks) then `globals.css` (wins); no Google Fonts runtime; Space Mono via `next/font`
- **Colour:** White text on black (`--ps-fg/#fff` on `--ps-bg/#000`) enforced in globals; WP light backgrounds overridden
- **Footer:** `.ps-footer` new chrome (not WP footer classes)
- **Public media:** Curated copy via `npm run sync-media` (not full `wp-content` symlink); archive remains at repo `wp-content/`
- **SEO:** `public/robots.txt`, `sitemap.xml`, Cloudflare `_headers` generated on build
- **Units:** Landscape ≥720p (1280×720+) — logo/grid/intro proportions in `em`; hairlines stay `px`. Cards (`--ps-card-*`) size from `vw`/`svh`/`dvh` so they track the screen.
- **Awards / video:** `site/awards.json`, `site/media.json` (hero cues; mobile landscape=`contain` / portrait=`cover`; orientation flips pause→DOM fit→paint→play at marked frames)
- **Missions:** `content.json` `missions[]` drives hubs, years, nav year children; 2+ photos in extraSection figures become a `gallery` carousel
- **Fonts:** Space Mono only (next/font 400 + 700). Intermediate weights and leftover WP font-family classes are forced back to those cuts.
- **Content layout:** `content.json` (all non-home structured) · `scrape/pages.json` (WP fallback) · `site/{awards,media}.json` (home only)
- **Multi-year comps:** Year children shown in hover/focus flyout (burger + home activities); not stacked lists. Hub pages still list years.
- **Team pages:** Committee years + mission team archives are structured (`content.json` `team.rosters` + `personGroups`); scrape HTML overridden for those slugs. Portrait grid uses `--ps-*` elevated cards.
- **NRC early years:** Legacy `/nrc-2/` “For 2021” / “For 2022” → `/nationalrocketry/2021-2022/` and `/nationalrocketry/2022-2023/` (`published`); `/nrc-2/` aliases hub.
- **Mach-23:** Legacy `/competitions/` write-up → `/mach/2022-2023/`; `/competitions/` aliases that year page; draft media/tech as year `extraSections`.
- **Mach-24 / NRC 2023–24 / Race2Space / IOSM:** Folded from WP `draft-*` pages in master.md scrape; draft URLs alias to structured years/hubs. Mission years may carry `extraSections` (same section types as hubs).
- **Host:** Cloudflare Pages still the `peryton.space` target; org GitHub Pages is https://projects.peryton.space/ (`PerytonSpace.github.io`); project Pages remains https://perytonspace.github.io/website/ (`basePath=/website`). Jekyll projects tree archived on `archive-jekyll-projects`.
- **2026-08-29 committee:** 2025–2026 (Matt Pres) moved to historical; current is 2026–2027 from org chart (Carys Pres, Miruna VP, Sev Tres, Caitlin VP Launch, Jim VP Mission, Anya HoO, Vihanya Social)
- **2026-08-29 card covers:** Competition snap / awards / year cards use matching people/hardware photos (`coverImage` / `activityCovers`); Race2Space, IOSM, Launch4Change, and unmatched years stay plain — no mismatched shots

### Pending Todos

**Agent-doable fold-in (scrape already has copy; structured override hid it):**

- [x] SDC 2022–2023 (D.A.V.E win) — published year + hub intro from scrape
- [x] Olympus Rover Trials hub — scrape aims + logo
- [x] Launch4Change hub — Durham / ARIA / 8 km / climate payload + `l4c-2.png`
- [x] `team-mach-25.html` — Mach-24 accordion empty; Mach-23 is a duplicate of `/teammach23` (already structured)
- [x] Stubs checked empty: `/satellite/`, `/satellite-2/` (coming soon only), `/777878-2/` (LinkedIn widget), merch form, empty StagWorks scrape, dated opportunities blog fluff
- [x] Leftover unique scrape on overridden pages: Kunkune + Easy Composites → `content.json` sponsors; Duke of Kent address → contact; Mach-23 `/competitions/` gallery extras

**Agent-doable chrome hygiene (found 2026-08-29 visual audit — matches locked product rules, not new scope):**

- [x] **COMP-05:** `placeholder` years are live links in burger + home flyouts (`yearIsNavigable` treats placeholder as live). Grey + “Coming soon” on hover; do not present as live.
- [x] **Public copy:** placeholder year pages tell visitors to edit `web/content/content.json` — authoring note, not visitor copy.
- [x] **Hub badges:** `buildMissionHubPage` hardcodes `status: "placeholder"`, so NRC/SDC/Mach hubs with real intros still show “Placeholder — copy TBD”.
- [x] **Drawer:** “Header prototype: drawer · flip `headerPrototype` in `site.ts`” is visible to every visitor. Keep the prototype switch; hide the code note until committee picks.
- [x] **Current committee URL:** live slug is still WP leftover `/committee-2023-2024-copy/` (title is 2025–2026).
- [x] **Repo:** rebuild lives in [PerytonSpace/website](https://github.com/PerytonSpace/website) and [PerytonSpace.github.io](https://github.com/PerytonSpace/PerytonSpace.github.io) (org root Pages).

**Human-gated (visually confirmed still open):**

- [ ] Cloudflare account → first production deploy (record URL in HOSTING.md)
- [x] Committee: `headerPrototype` drawer vs rail — superseded 2026-09-05 (no top bar; left rail only)
- [ ] Ethos copy (Carys / Severin) — About `#ethos` still says wording TBD before launch
- [x] `formEmbedUrl` on contact-us in `content.json` — Microsoft Forms loads (Subject / Name / Message / Email + Submit)
- [ ] Confirm names: supervisors still “Chris” / “Andrew”; wellbeing is a literal Placeholder card; empty “University wellbeing (SU)” heading
- [ ] Confirm surnames for Miruna / Anya / Vihanya; 2026–2027 committee is live (Carys Pres); 2025–2026 is historical
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
| Scrape junk | hello-world, about-2, category/*, dated blog | Leave / ignore (`/satellite` aliases SDC hub; `/777878-2` 404s) |

## Session Continuity

Last session: 2026-09-10  
Stopped at: `projects.peryton.space` custom domain restored on org Pages  
Resume file: None  
Next action: Humans still own PREDEPLOY_CHASE + CF/`peryton.space` cutover; surnames for Miruna/Anya/Vihanya and supervisor/wellbeing names if they want them on cards. Jekyll projects tree remains on `archive-jekyll-projects` if it needs a new home.
