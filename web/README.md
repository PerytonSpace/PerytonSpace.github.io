# Peryton Space — web

Next.js static site (`output: "export"`). Planning lives in `../.planning/`.

## Develop

```bash
npm ci
npm run dev
```

Open http://localhost:3000

`dev` / `build` run: `prepare-content` → `sync-media` → (build also `generate-seo`).

## Build & local static smoke test

```bash
npm run build   # → out/ (~90MB curated media, not full wp-content dump)
npm run start   # serve out/
```

## Media

- **Archive:** `../wp-content/uploads/` (full WP dump; not deployed)
- **Deployed:** `public/wp-content/uploads/` via `npm run sync-media` (referenced assets only)
- Hero video kept; non-hero videos >20MB (e.g. NRC `trimmedgx…`) stay in archive only

## Deploy

Cloudflare Pages — see `../.planning/docs/HOSTING.md`.

```bash
npm run build
npx wrangler pages deploy out --project-name=peryton-space
```

## Content

Edit JSON under `content/` (missions, awards, pages, team, sponsors, site-media).  
Authoring notes: `../.planning/docs/AUTHORING.md`.
