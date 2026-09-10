# Contract: Content authoring

**Status:** Live  
**Consumers:** `web/src/lib/catalog.ts`, `structured.ts`, `missions.ts`, `sponsors.ts`; Severin edits via GitHub

## Principles

1. **Non-home content has one source:** `web/content/content.json`.
2. Homepage stays out of that file: slides in `HomeSnap.tsx`, awards in `site/awards.json`, hero video in `site/media.json`.
3. Scraped WordPress HTML in `web/content/scrape/pages.json` remains a fallback until a slug is in `content.json`.
4. Schema is the contract agents and humans must satisfy before UI work claims "done."

## Layout (live)

```text
web/content/
  content.json                # ALL non-home structured content
  scrape/pages.json           # legacy WP HTML (regen: npm run prepare-content)
  site/
    awards.json               # home awards strip only
    media.json                # home hero video + annotations + activityCovers
```

Do not add new `pages/*.json`, `missions/index.json`, or `team/rosters/*.json`. Edit `content.json`.

## Master file (`peryton.content`)

```json
{
  "$id": "peryton.content",
  "pages": [],
  "missions": [],
  "intake": {},
  "team": {
    "supervisors": [],
    "wellbeing": [],
    "historicalCommittees": [],
    "rosters": {}
  },
  "sponsors": {
    "partnerships": [],
    "tier1": [],
    "tier2": []
  },
  "aliases": {}
}
```

| Key | Role |
|-----|------|
| `pages` | Structured shells (About, Contact, Member Zone, committee, StagWorks, roster pages, …) |
| `missions` | Competition hubs + years (synthesized into pages by `missions.ts`) |
| `intake` | Severin write-up checklist (not shown to visitors) |
| `team.supervisors` / `team.wellbeing` | Person grids via `personGrid` `source` |
| `team.historicalCommittees` | Committee year list via `yearList` |
| `team.rosters.<slug>` | Person groups via `personGroups` `source: team.rosters.<slug>` |
| `sponsors` | Partnerships / Tier 1 / Tier 2. Empty arrays ⇒ hide Sponsors nav + section |
| `aliases` | Legacy WP slugs → canonical `pages[].slug` or mission hub/year slug |

Route slug is `pages[].slug` (or `{hubSlug}` / `{hubSlug}/{year.id}` for missions). New pages go in `pages[]`; new people go in `team`; no extra TypeScript import.

## Page schema (`peryton.page`)

```json
{
  "$id": "peryton.page",
  "type": "object",
  "required": ["slug", "title", "sections"],
  "properties": {
    "slug": { "type": "string", "pattern": "^[a-z0-9/-]+$" },
    "title": { "type": "string" },
    "navLabel": { "type": "string" },
    "status": { "enum": ["draft", "placeholder", "published"] },
    "sections": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["type"],
        "properties": {
          "type": {
            "enum": [
              "heading",
              "richtext",
              "image",
              "gallery",
              "cta",
              "personGrid",
              "personGroups",
              "tierList",
              "yearList",
              "missionYears",
              "embedForm",
              "placeholder"
            ]
          },
          "id": { "type": "string" },
          "props": { "type": "object" }
        }
      }
    }
  }
}
```

## Mission-by-year schema (`peryton.missionYear`)

Lives under `missions[].years[]` in `content.json`.

```json
{
  "$id": "peryton.missionYear",
  "type": "object",
  "required": ["missionId", "year", "title"],
  "properties": {
    "missionId": { "enum": ["sdc", "nrc", "mach", "race2space", "l4c", "ort", "iosm"] },
    "year": { "type": "string", "pattern": "^[0-9]{4}(-[0-9]{4})?$" },
    "title": { "type": "string" },
    "summary": { "type": "string" },
    "highlights": { "type": "array", "items": { "type": "string" } },
    "awards": { "type": "array", "items": { "type": "string" } },
    "extraSections": {
      "type": "array",
      "description": "Optional structured sections after summary; same section types as pages",
      "items": { "$ref": "#/definitions/section" }
    },
    "teamHref": { "type": "string" },
    "coverImage": {
      "type": "string",
      "description": "Public URL of a people/hardware photo for year cards; must match this competition (and year when set on a year object). Hub-level coverImage is the fallback."
    },
    "cadModel": { "type": ["string", "null"] }
  }
}
```

Hubs already support `extraSections` on the mission object; year pages render `year.extraSections` the same way via `buildMissionYearPage`.

Two or more `<img>` inside `<figure>` blocks in a year/hub `richtext` extraSection are lifted into a `gallery` carousel at render time (`liftRichtextGalleries`). You can also author a gallery directly:

```json
{
  "type": "gallery",
  "props": {
    "images": [
      { "src": "/wp-content/uploads/…/photo.jpg", "alt": "Mach-23 rocket" }
    ]
  }
}
```

`image` is a single photo: `{ "type": "image", "props": { "src": "/…", "alt": "" } }`. Team portrait grids stay grids (not carousels).

## Team member schema (`peryton.teamMember`)

```json
{
  "$id": "peryton.teamMember",
  "type": "object",
  "required": ["name", "role"],
  "properties": {
    "name": { "type": "string" },
    "role": { "type": "string" },
    "year": { "type": "string" },
    "photo": { "type": ["string", "null"] },
    "linkedin": { "type": ["string", "null"] },
    "note": { "type": "string" },
    "category": {
      "enum": ["committee", "supervisor", "wellbeing", "historical"]
    }
  }
}
```

## Loader rules

1. If `content.json` has a page (or synthesized mission page) for the slug → render via section components.
2. Else → fall back to scrape `pages.json` HTML (`PageContent`).
3. Never delete scrape entries until structured page verified.

## Sponsors visibility rule

- `content.json` → `sponsors` with `partnerships[]`, `tier1[]`, `tier2[]`.
- If all arrays empty → UI **hides** Sponsors nav + section.
- Non-empty → show Partnerships / Tier 1 / Tier 2 as populated.

## Non-goals (this contract)

- Live CMS UI
- WordPress sync
- Auth-gated member content (Member Zone is public; email/phone access requests elsewhere)
- Putting homepage slides/awards/video into `content.json`
