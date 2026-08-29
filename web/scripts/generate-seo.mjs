#!/usr/bin/env node
/**
 * Write robots.txt, sitemap.xml, and Cloudflare _headers into web/public/
 * (copied into out/ on next build).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(__dirname, "..");
const PUBLIC = path.join(WEB, "public");
const SITE = "https://peryton.space";

function collectRoutes() {
  const routes = new Set(["/"]);
  const scrapePath = path.join(WEB, "content", "scrape", "pages.json");
  if (fs.existsSync(scrapePath)) {
    const data = JSON.parse(fs.readFileSync(scrapePath, "utf8"));
    for (const p of data.pages || []) {
      const route = p.path ? `/${p.path}/` : "/";
      routes.add(route);
    }
  }
  // Structured shells / missions — walk content JSON for slug fields
  const contentRoot = path.join(WEB, "content");
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === "scrape") continue;
        walk(p);
      } else if (ent.name.endsWith(".json")) {
        try {
          const j = JSON.parse(fs.readFileSync(p, "utf8"));
          if (j && typeof j.slug === "string" && j.slug) {
            routes.add(`/${j.slug.replace(/^\/|\/$/g, "")}/`);
          }
          if (Array.isArray(j.missions)) {
            for (const m of j.missions) {
              if (m.hubSlug) routes.add(`/${m.hubSlug}/`);
              for (const y of m.years || []) {
                if (
                  y.id &&
                  (y.status === "published" || y.status === "live")
                ) {
                  routes.add(`/${m.hubSlug}/${y.id}/`);
                }
              }
            }
          }
        } catch {
          /* ignore */
        }
      }
    }
  }
  walk(contentRoot);
  const SITE_SKIP = new Set(["/committee-2023-2024-copy/"]);
  return [...routes].filter((r) => !SITE_SKIP.has(r)).sort((a, b) => a.localeCompare(b));
}

function main() {
  fs.mkdirSync(PUBLIC, { recursive: true });

  fs.writeFileSync(
    path.join(PUBLIC, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`,
  );

  const routes = collectRoutes();
  const urls = routes
    .map(
      (r) => `  <url>
    <loc>${SITE}${r === "/" ? "/" : r}</loc>
  </url>`,
    )
    .join("\n");
  fs.writeFileSync(
    path.join(PUBLIC, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
  );

  fs.writeFileSync(
    path.join(PUBLIC, "_headers"),
    `# Cloudflare Pages headers — see .planning/docs/HOSTING.md
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

/wp-content/uploads/*
  Cache-Control: public, max-age=604800

/
  Cache-Control: public, max-age=0, must-revalidate
`,
  );

  console.log(
    `SEO: robots.txt + sitemap.xml (${routes.length} urls) + _headers → public/`,
  );
}

main();
