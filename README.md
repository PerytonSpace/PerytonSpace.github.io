# Peryton Space website

Public society site: Next.js static export in `web/`. Content is JSON in Git (see `.planning/docs/AUTHORING.md`).

This repository previously hosted the Jekyll projects site at [projects.peryton.space](https://projects.peryton.space). That history remains in git; `main` now carries the main website rebuild.

## Local

```bash
cd web
npm ci
npm run dev
```

Open http://localhost:3000

## Deploy

GitHub Actions builds `web/` and publishes `web/out` to GitHub Pages on push to `main`.

Cloudflare Pages (production domain `peryton.space`) is documented in `.planning/docs/HOSTING.md`.

## What is not in git

Unused WordPress scrape and the full `wp-content` media archive are gitignored. The site uses:

- `web/content/scrape/pages.json` — leftover WP HTML fallback
- `web/public/wp-content/` — curated uploads only (`npm run sync-media`)
