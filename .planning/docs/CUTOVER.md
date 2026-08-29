# Cutover — WordPress → Cloudflare Pages

**Status:** Plan written — execute only after pre-deploy chase  
**Date:** 2026-08-08

## Preconditions (do not switch DNS until all true)

- [ ] Committee locked header prototype (`drawer` / `rail`)
- [ ] Ethos copy confirmed (Carys / Severin)
- [x] Contact `formEmbedUrl` set (Microsoft Forms) — re-test on staging URL
- [ ] Team / wellbeing / supervisor names confirmed
- [ ] Critical mission write-ups at least “good enough” (or accepted as placeholders)
- [ ] Staging URL on Cloudflare reviewed by Jim + Severin
- [ ] PREDEPLOY_CHASE.md checklist complete
- [x] WordPress.com WXR archive saved — `exports/perytonspace.WordPress.2026-08-08.xml` (text/content only; media stays in `web/public/wp-content/uploads/`)

## DNS / domain

1. Identify current DNS host for `peryton.space` (and www).
2. Note existing WordPress.com (or other) records.
3. In Cloudflare Pages project → Custom domains → add `peryton.space` / `www.peryton.space`.
4. Lower TTL on current records ~24–48h before cutover if possible.
5. Switch records to Cloudflare-required targets (usually CNAME for www; apex per CF docs).
6. Keep WordPress live but unpublished/unlinked for ~1 week rollback window.

## Rollback

- Revert DNS to previous WordPress targets.
- Static site on CF Pages can remain as staging.

## Ownership

| Item | Owner |
|------|--------|
| CF account / deploy | Jim |
| Domain registrar access | Confirm with society signatories |
| Content freeze during cutover | Severin + Jim |
| Announce new site | Committee / socials |

## Post-cutover

- [ ] Update social bios / SU links
- [ ] Archive WP admin credentials in society password store (not chat)
- [ ] Confirm contact form submissions arrive
- [ ] Update HANDOVER.md with live URLs
