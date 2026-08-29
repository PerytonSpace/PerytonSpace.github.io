# Contract: Content authoring

**Status:** Spec (implement in Phase 0)  
**Consumers:** `web/src/lib/content.ts`, future structured loaders, Severin edits via GitHub

## Principles

1. Scraped WordPress HTML in `web/content/scrape/pages.json` remains valid until a page is migrated.
2. **New** and **rewritten** pages use structured JSON (or MDX later) — not pasted WP HTML.
3. Schema is the contract agents and humans must satisfy before UI work claims "done."

## Layout (live)

```text
web/content/
  scrape/pages.json           # legacy WP HTML (regen: npm run prepare-content)
  site/
    awards.json
    media.json                # hero video + annotations
    sponsors.json
  missions/index.json
  team/
    index.json                # supervisors, wellbeing, historicalCommittees
    rosters/<slug>.json       # person groups for personGroups sections
  pages/
    about.json
    contact-us.json
    member-zone.json
    …
    committee/                # committee shells
    team/                     # supervisors / wellbeing shells
    stagworks/                # StagWorks shells
    rosters/                  # roster page shells
```

Route slug is the JSON `slug` field (file path is for humans). Register new shells/rosters in `web/src/lib/structured.ts`.

## Minimal page schema (draft)

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

## Mission-by-year schema (draft)

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
      "description": "Optional structured sections (heading/richtext/…) after summary; same section types as pages",
      "items": { "$ref": "#/definitions/section" }
    },
    "teamHref": { "type": "string" },
    "cadModel": { "type": ["string", "null"] }
  }
}
```

Hubs already support `extraSections` on the mission object; year pages render `year.extraSections` the same way via `buildMissionYearPage`.

## Team member schema (draft)

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

## Team data

- `web/content/team/index.json` — `supervisors`, `wellbeing`, `historicalCommittees`
- `web/content/team/rosters/<slug>.json` — grouped members; referenced as `team.rosters.<slug>` from `personGroups`
- Page shells under `web/content/pages/rosters/` (and committee/) only define title/sections

Committee year pages and mission team archives are structured JSON (not scrape HTML).

## Loader rules

1. If structured file exists for slug → render via section components.
2. Else → fall back to `pages.json` HTML (`PageContent`).
3. Never delete scrape entries until structured page verified.

## Sponsors JSON visibility rule

- File `web/content/site/sponsors.json` with `partnerships[]`, `tier1[]`, `tier2[]`.
- If file missing **or** all arrays empty → UI **hides** Sponsors nav + section.
- Non-empty → show Partnerships / Tier 1 / Tier 2 as populated.

## Non-goals (this contract)

- Live CMS UI
- WordPress sync
- Auth-gated member content (Member Zone is public; email/phone access requests elsewhere)
