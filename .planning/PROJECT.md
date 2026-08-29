# Peryton Space Website Rebuild

## What This Is

The University of Surrey UKSEDS / space society public site: Next.js App Router (`web/`) with a snap homepage, frosted burger chrome, structured JSON pages, and mission hubs — plus fallback scraped WordPress HTML in `pages.json` for unmigrated routes. Goal: modern IA, sponsor- and member-useful surfaces, content editable without WordPress.

## Core Value

Visitors (members, NRC peers, sponsors) can find who we are, what we build by year, how to get resources/contact, and why to partner with us — without fighting outdated WordPress chrome.

## Requirements

### Validated

- ✓ Static Next.js site + scrape fallback — `content/scrape/pages.json`
- ✓ Burger nav + frosted header + logo-home — `SiteHeader` / `site.ts`
- ✓ Snap homepage (5 slides) — `HomeSnap.tsx`
- ✓ Structured pages + mission hubs override scrape
- ✓ Catch-all routes — `app/[...slug]/page.tsx`

### Active

See `.planning/REQUIREMENTS.md` (NAV-*, CONTENT-*, TEAM-*, HOST-*).

### Out of Scope

- Full CMS (Wix / Squarespace / headless WP) — JSON-in-Git accepted
- Member Zone authentication / gated accounts — public resources only
- Ethos on the homepage hero — About section only
- Archaeological StagWorks history rewrite — new projects + placeholders only
- Interactive CAD on every mission — optional later on one flagship page
- WordPress admin parity — replace contact form at cutover; do not reimplement WP
- Debugging legacy WP contact form — confirmed working in WP dashboard; focus on replacement

## Context

- **Codebase:** `web/` (Next.js), assets under `web/public/wp-content/`, scrape tooling at repo root.
- **Stakeholders:** Jim (build/host), Severin (copy/sponsors/competitions), Carys (ethos/placement), committee (prototype pick).
- **Cadence:** Bi-weekly until ~September 2026; then possibly expand contributors.
- **Style:** Interim `--ps-*` tokens + wide layout live; full brand redesign deferred.
- **Content backlog:** Competition prose + team names still human intake.

## Constraints

- **Tech stack:** Next.js App Router static export in `web/`.
- **Visual:** Interim tokens; scrape CSS transitional; full brand redesign deferred.
- **Content authoring:** JSON via GitHub.
- **Incomplete pages:** Grey + “Coming soon” on hover.
- **Sponsors:** Empty JSON ⇒ hide from **nav**; home sponsors slide may still show partner CTA.
- **Hosting:** Cloudflare Pages chosen; production deploy human (HOSTING.md).
- **Handover / chase:** See HANDOVER.md + PREDEPLOY_CHASE.md.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| GSD + lightweight SDD | Feature-iterative content site | ✓ Good |
| JSON-in-Git content | Accepted | ✓ Good |
| No Member Zone auth | Public resources | ✓ Good |
| Incomplete comps grey + Coming soon | Avoid fake completeness | ✓ Good |
| Empty sponsors JSON hides **nav** item | Empty tiers worse than absent | ✓ Good |
| Logo as home control | Later design choice (replaced text Home) | ✓ Good |
| Frosted header + body-portaled drawer | Blur chrome; fixed containing-block fix | ✓ Good |
| Snap homepage (5 slides) | Full-page storytelling | ✓ Good |
| Activities = Launch/Missions/StagWorks | Match burger grouping | ✓ Good |
| Style: interim `--ps-*` + wide shell | Full redesign deferred | ✓ Good |
| Host: Cloudflare Pages | Documented + local smoke | ✓ Good |
| Ethos under About | Not on homepage hero | ✓ Good |
| Courses in Member Zone | Not StagWorks primary | ✓ Good |
| Hero video cues in site-media.json | Timed lower-third labels sync to reel | ✓ Good |
| Multi-year comps: years on hover | Nav/home stay compact; hub pages keep year lists | ✓ Good |
| Home brand intro once per load | One logo node: expand center → collapse to header | ✓ Good |
| White text on black site-wide | Interim palette until full brand redesign | ✓ Good |
| Draft WP write-ups → mission years | Fold master.md drafts into `missions/index.json`; alias `/draft-*` | ✓ Good |
| Year `extraSections` | Rich media/tech without pasted WP HTML | ✓ Good |
| Style: globals over scrape | Tokens/fonts in globals; scrape.css subordinate; Space Mono via next/font | ✓ Good |
| Public coming-soon years | Incomplete years grey in menus; direct URL is a Coming soon shell (no JSON authoring copy) | ✓ Good |

---
*Last updated: 2026-08-29 — chrome hygiene; COMP-05 placeholder years*
