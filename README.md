# Peryton Space website

Public society site: Next.js static export in `web/`. Content is JSON in Git (see `.planning/docs/AUTHORING.md`).

GitHub: [PerytonSpace/website](https://github.com/PerytonSpace/website) and [PerytonSpace.github.io](https://github.com/PerytonSpace/PerytonSpace.github.io) (same site; org Pages is the root URL).

## Local

```bash
cd web
npm ci
npm run dev
```

Open http://localhost:3000

## Deploy

GitHub Actions builds `web/` and publishes `web/out` to GitHub Pages on push to `main`: [https://perytonspace.github.io/](https://perytonspace.github.io/) (org repo) and [https://perytonspace.github.io/website/](https://perytonspace.github.io/website/) (`website` repo).

Cloudflare Pages (production domain `peryton.space`) is documented in `.planning/docs/HOSTING.md`.

## What is not in git

Unused WordPress scrape and the full `wp-content` media archive are gitignored. The site uses:

- `web/content/scrape/pages.json` — leftover WP HTML fallback
- `web/public/wp-content/` — curated uploads only (`npm run sync-media`)
