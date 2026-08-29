# Authoring guide (draft)

**Audience:** Severin and future committee updating the site without WordPress.

## Quick path (target after Phase 0)

1. Clone / open the repo (or edit on GitHub).
2. Edit the matching file under `web/content/` (see map below) following `.planning/contracts/CONTENT_SCHEMA.md`.
3. Run locally: `cd web && npm run dev` → http://localhost:3000
4. Open a PR; Jim (or CI) merges and deploys.

## Content layout

```text
web/content/
  scrape/pages.json          # legacy WP HTML (regen via npm run prepare-content)
  site/
    awards.json              # home awards strip
    media.json               # hero video + cues
    sponsors.json            # empty ⇒ hide Sponsors nav
  missions/index.json        # hubs, years, intake checklist
  team/
    index.json               # supervisors, wellbeing, historical committee index
    rosters/<slug>.json      # people grids (committee years, mission teams)
  pages/
    about.json, contact-us.json, member-zone.json, …
    committee/               # Our Team committee shells
    team/                    # supervisors + wellbeing shells
    stagworks/               # StagWorks overview + divisions
    rosters/                 # roster page shells (personGroups → team.rosters.*)
```

Route slug is the JSON `slug` field (file path is for humans). New page/roster files must be imported in `web/src/lib/structured.ts`.

## What to edit where

| Change | File |
|--------|------|
| Nav labels / order (also drives home “What we do”) | `web/src/lib/site.ts` |
| Header prototype | `headerPrototype` in `web/src/lib/site.ts` (`drawer` \| `rail`) |
| Homepage slide copy/structure | `web/src/components/HomeSnap.tsx` |
| New structured page body | `web/content/pages/**/<name>.json` |
| Missions / years / intake | `web/content/missions/index.json` |
| Awards strip | `web/content/site/awards.json` |
| Homepage video + timed cues | `web/content/site/media.json` |
| Sponsors (empty hides nav) | `web/content/site/sponsors.json` |
| Supervisors / wellbeing / committee year index | `web/content/team/index.json` |
| Roster members (photos, roles, notes) | `web/content/team/rosters/<slug>.json` |
| Roster page shell | `web/content/pages/rosters/<slug>.json` — `personGroups` + `source: team.rosters.<slug>` |
| Contact form embed | `web/content/pages/contact-us.json` → `embedForm.props.formEmbedUrl` (Microsoft Forms). **Cannot style inside the iframe from our CSS** (cross-origin). Match the site in Forms → **Style**: custom colour `#000000` (and a dark-compatible theme if offered). |
| Legacy scraped page | Avoid — migrate slug to structured JSON |

## Status values

- `placeholder` — structure only; copy TBD
- `draft` — in progress; may not be linked
- `published` — live

## Do not

- Paste WordPress export HTML into structured pages
- Invent a one-off look — follow `.planning/docs/STYLE_SYSTEM.md` (`--ps-*`, white-on-black)
- Put course resources under StagWorks — use Member Zone
- Add empty sponsor tiers and leave them visible — empty sponsors JSON hides the section
- Mark incomplete competition/year pages as live — use `comingSoon` (grey + hover)
