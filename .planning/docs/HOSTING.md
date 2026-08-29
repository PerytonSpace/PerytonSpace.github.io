# Hosting — Cloudflare Pages

**Status:** Chosen + documented + local static smoke-tested  
**Date:** 2026-08-08  
**Production deploy:** Awaits Cloudflare account / API token (human). Source of truth for the rebuild is `PerytonSpace/PerytonSpace.github.io` (GitHub Pages on push to `main`).

## Choice

**Cloudflare Pages** for the Next.js `output: "export"` static site in `web/`.

Reasons (from meeting + project constraints):

- Fits static export (no Node server required)
- CDN + DDoS protections
- Free tier suitable for society site
- Simple Git-based or CLI deploys

## Build output

```bash
cd web
npm ci
npm run build    # prepare-content + sync-media + generate-seo + export → web/out/
```

`npm run sync-media` copies **only referenced** uploads into `web/public/wp-content/` (archive stays at repo `wp-content/`). Do not reintroduce a full-tree symlink — it ships ~360MB of unused media.

SEO files written to `public/` (then `out/`): `robots.txt`, `sitemap.xml`, Cloudflare `_headers`.

Local smoke test of the static export:

```bash
cd web
npm run start    # serves web/out via npx serve
```

## Deploy (when credentials available)

### Option A — Wrangler CLI

1. Create a Cloudflare Pages project (e.g. `peryton-space`).
2. Set secrets: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` (Pages edit).
3. From `web/`:

```bash
npx wrangler pages deploy out --project-name=peryton-space
```

`web/wrangler.toml` names the project.

### Option B — Git integration

- Connect the repo to Cloudflare Pages
- Root directory: `web`
- Build command: `npm run build`
- Output directory: `out`

### Option C — GitHub Pages (this repo)

Repo: [PerytonSpace/PerytonSpace.github.io](https://github.com/PerytonSpace/PerytonSpace.github.io). Workflow `.github/workflows/pages.yml` runs `cd web && npm ci && npm run build` and deploys `web/out`.

## Not done until human step

- [x] First GitHub Pages deploy path: `PerytonSpace/PerytonSpace.github.io` (Actions → `web/out`)
- [ ] Cloudflare account access confirmed
- [ ] First Cloudflare production deploy URL recorded here
- [ ] Custom domain attached (see CUTOVER.md)
