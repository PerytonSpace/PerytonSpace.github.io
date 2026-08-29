# Phase 5 — Host & handover

**Status:** Docs + local smoke complete; production CF deploy is human  
**Requirements:** HOST-01…HOST-03, PROC-*

## Delivered

1. Hosting choice: Cloudflare Pages — `docs/HOSTING.md`, `web/wrangler.toml`, `npm run deploy:cf`
2. Cutover plan — `docs/CUTOVER.md`
3. Handover — `docs/HANDOVER.md` + AUTHORING/STYLE
4. Chase checklist — `docs/PREDEPLOY_CHASE.md`
5. Local static smoke: `npm run build` → `serve out` (:3456)

## Still human

- First Cloudflare production deploy + custom domain
- PREDEPLOY_CHASE completion before DNS cutover
- Bi-weekly reviews (process, not code)

## Acceptance

- [x] HOST-01 done (chosen, documented, local smoke) — prod URL pending human
- [x] HOST-02 cutover plan written
- [x] Handover doc exists
- [ ] Pre-deploy stakeholder chase complete (human)
