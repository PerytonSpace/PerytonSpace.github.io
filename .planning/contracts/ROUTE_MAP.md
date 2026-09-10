# Contract: Route & navigation map

**Status:** Live (synced 2026-08-29)  
**Source of truth:** `web/src/lib/site.ts` → `getNavigation()` / `getActivityNavGroups()`  
**Homepage:** `web/src/components/HomeSnap.tsx` (not scrape HTML)

## Burger nav (live)

Collapsed rail icons (left): Home · Launch · Missions · StagWorks · Our Team · About · Member Zone · Contact. Expanded rail is the tree below.

```text
[Logo → /]   (home affordance in frosted header bar)
Launch ▾
  National Rocketry Championship → /nationalrocketry (years on hover)
  Mach-X                         → /mach (years on hover; 2023–2024 Mach-24 published)
  Race2Space                     → /race2space (years on hover; PHYRE on hub + 2024–2025)
  Launch4Change                  → /launch4change (years on hover; hub copy from scrape)
Missions ▾
  Olympus Rover Trials           → /olympus-rover-trials
  Satellite Design Competition   → /satellite-design-competition (years on hover; 2022–2023 D.A.V.E published)
  IOSM                           → /ukseds-in-orbit-servicing-and-manufacturing (2023–2024 win)
StagWorks ▾
  Overview                       → /stagworks
  Weather Balloon                → /weather-balloon-division
  RF / Composites / FEPS         → /stagworks/rf|composites|feps
Our Team ▾
  Current Committee              → /committee-2026-2027  (2025–2026 is historical; WP leftover `/committee-2023-2024-copy` still aliases 2025–2026)
  Historical Committees          → /committee                 (year index → structured year pages)
  Academic Supervisors           → /team/supervisors
  Wellbeing Champions            → /team/wellbeing
Mission team archives (linked from missions, not burger):
  /teammach23 · /teamsdc · /mach-x-teams · /satellite-design-competition-teams
  (all structured via content.json team.rosters + pages[])
About ▾
  Who We Are                     → /about
  Ethos                          → /about#ethos
Member Zone                      → /member-zone
Contact ▾
  Contact Us                     → /contact-us
  Sponsors / Partnerships        → /sponsorships  (omitted if content.json sponsors empty)
```

## Homepage snap slides (live)

| # | Slide id | Content |
|---|----------|---------|
| 1 | `video` | Full-bleed hero video (`site/media.json`) |
| 2 | `activities` | Launch / Missions / StagWorks from `getActivityNavGroups()` |
| 3 | `achievements` | `awards.json` |
| 4 | `sponsors` | Sponsors list or partner CTA if empty |
| 5 | `connect` | Member Zone + Contact |

Controls: ↑/↓, dots, wheel threshold, arrow keys. Site footer hidden on home.

## Chrome rules

| Rule | Spec |
|------|------|
| Menu | Persistent left rail only (no top bar / burger). Hover or tap expands; click page collapses. Collapsed = logo + section icons; expanded = sidebar tree |
| Home | **Logo** at top of the left rail goes to `/` and the hero video slide |
| Ethos | Under About (`#ethos`), not homepage hero |
| Activities IA | Same grouping as burger: Launch, Missions, StagWorks |
| Multi-year comps | Year children in hover/focus flyout (nav + home); hub pages still list years |
| Courses | Member Zone, not StagWorks primary |
| Incomplete comps/years | `comingSoon`: greyed; “Coming soon” on hover |
| Sponsors | Empty JSON ⇒ omit from nav; home sponsors slide still shows CTA |
| Member Zone | Public; no auth |
| Style | Interim `--ps-*` tokens; shell 1600 / content 1400 — see STYLE_SYSTEM.md |

## Nav item status

```ts
type NavItemStatus = "live" | "comingSoon";
// comingSoon ⇒ muted + “Coming soon” tip; href optional/ignored
```

## Legacy aliases (structured)

| Old scrape slug | Serves |
|-----------------|--------|
| `/contact` | `/contact-us` |
| `/nrc-2` | `/nationalrocketry` hub |
| `/competitions` | `/mach/2022-2023` |
| `/draft-mach-x` | `/mach/2023-2024` |
| `/draft-nrc-2023-2024` | `/nationalrocketry/2023-2024` |
| `/draft-race2space` | `/race2space` |
| `/draft-ukseds-in-orbit-servicing-and-manufacturing` | `/ukseds-in-orbit-servicing-and-manufacturing` |
| `/committee-2023-2024-copy` | `/committee-2025-2026` |
| `/satellite` · `/satellite-2` | `/satellite-design-competition` |
| `/777878-2` | 404 (LinkedIn widget stub) |

## Fallback scrape routes

Unmigrated junk/stubs still served from `pages.json` (hello-world, about-2, category/*, satellite, LinkedIn widget, dated blog). Structured JSON / mission hubs override same slugs.
