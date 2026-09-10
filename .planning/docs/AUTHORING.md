# Authoring guide (draft)

**Audience:** Severin and future committee updating the site without WordPress.

## Quick path

1. Clone / open the repo (or edit on GitHub).
2. Edit `web/content/content.json` (see map below) following `.planning/contracts/CONTENT_SCHEMA.md`.
3. Run locally: `cd web && npm run dev` → http://localhost:3000
4. Open a PR; Jim (or CI) merges and deploys.

## Content layout

```text
web/content/
  content.json               # ALL non-home pages, missions, team, sponsors, aliases
  scrape/pages.json          # legacy WP HTML (regen via npm run prepare-content)
  site/
    awards.json              # home awards strip
    media.json               # home hero video + cues
```

## What to edit where

| Change | File |
|--------|------|
| Nav labels / order (also drives home “What we do”) | `web/src/lib/site.ts` |
| Homepage slide copy/structure | `web/src/components/HomeSnap.tsx` |
| Any structured page (About, Contact, Member Zone, StagWorks, committee, rosters, …) | `web/content/content.json` → `pages[]` |
| Missions / years / intake | `web/content/content.json` → `missions` / `intake` (2+ photos in year `extraSections` render as a carousel) |
| Awards strip | `web/content/site/awards.json` |
| Homepage video + timed cues | `web/content/site/media.json` |
| Sponsors (empty hides nav) | `web/content/content.json` → `sponsors` |
| Supervisors / wellbeing / committee year index | `web/content/content.json` → `team` |
| Roster members (photos, roles, notes) | `web/content/content.json` → `team.rosters.<slug>` |
| Legacy WP URL | `web/content/content.json` → `aliases` |
| Contact form embed | `pages[]` entry `contact-us` → `embedForm.props.formEmbedUrl` (Microsoft Forms). **Cannot style inside the iframe from our CSS** (cross-origin). Match the site in Forms → **Style**: custom colour `#000000` (and a dark-compatible theme if offered). |
| Legacy scraped page | Avoid — migrate slug into `content.json` `pages[]` |

## Status values

- `placeholder` — structure only; copy TBD
- `draft` — in progress; may not be linked
- `published` — live

## Do not

- Paste WordPress export HTML into structured pages
- Invent a one-off look — follow `.planning/docs/STYLE_SYSTEM.md` (`--ps-*`, white-on-black)
- Put course resources under StagWorks — use Member Zone
- Add empty sponsor tiers and leave them visible — empty sponsors hides the section
- Mark incomplete competition/year pages as live — use `comingSoon` (grey + hover)
- Split content back into per-page JSON files
