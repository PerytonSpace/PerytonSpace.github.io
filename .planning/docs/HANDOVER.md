# Handover notes

**Audience:** Next owner after Jim / Severin cutover  
**Companion docs:** AUTHORING.md, STYLE_SYSTEM.md, HOSTING.md, CUTOVER.md, PREDEPLOY_CHASE.md

## Where content lives

| Change | File |
|--------|------|
| All non-home structured content | `web/content/content.json` |
| Awards (home only) | `web/content/site/awards.json` |
| Homepage video + cues | `web/content/site/media.json` |
| Nav | `web/src/lib/site.ts` |
| Legacy scraped HTML | `web/content/scrape/pages.json` (regen via `npm run prepare-content`) |
| WP.com content archive (WXR) | `exports/perytonspace.WordPress.2026-08-08.xml` |
| Parsed WXR dump (all items) | `exports/wxr/` — re-run `python3 exports/extract_wxr.py` |
| Media (video, photos) | `web/public/wp-content/uploads/` — URLs in WXR, bytes downloaded separately |

Structured routes **override** scrape for the same slug. Add new pages to `content.json` `pages[]` (and people to `team`); no extra TypeScript import.

**Note:** WordPress export XML is content/metadata only (~1.5 MB). Large assets (e.g. homepage video ~40 MB) were never in that file — keep the mirrored uploads tree as the media source of truth.

## Ops

- Local: `cd web && npm run dev`
- Build: `npm run build` (static `out/`)
- Host: Cloudflare Pages — see HOSTING.md
- Cutover checklist: CUTOVER.md (after PREDEPLOY_CHASE.md)
