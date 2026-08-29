# Phase 0 — Content foundation (fold-in)

**Status:** Opportunistic — **not a gate before Phase 1**  
**Requirements:** CMS-01, CMS-02 (as needed for shells)  
**Code touchpoints:** `web/content/`, `web/src/lib/content.ts`

## Imperatives (must)

1. When Phase 2 needs a new page, add structured JSON + loader — do not invent WP HTML.
2. Keep scrape `pages.json` fallback for unmigrated slugs.
3. Sponsors JSON empty ⇒ consumers hide section (see SPON-02).
4. Nav/competition items support `live` vs `comingSoon` for grey + hover UX.

## Imperatives (must not)

1. Do not block Phase 1 on a full schema rewrite.
2. Do not introduce a hosted CMS.
3. Do not treat scrape CSS as the long-term style system (TBD).

## Acceptance

- [ ] First structured shell page works with fallback intact
- [ ] Authoring notes remain accurate (`docs/AUTHORING.md`)
