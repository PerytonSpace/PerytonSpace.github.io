#!/usr/bin/env node
/**
 * Extract and clean page content from scraped WordPress HTML.
 * Reads ../index.json and ../pages/html/*.html, writes content/scrape/pages.json.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const HTML_DIR = path.join(ROOT, "pages", "html");
const INDEX_PATH = path.join(ROOT, "index.json");
const OUT_PATH = path.join(__dirname, "../content/scrape/pages.json");
const HERO_VIDEO = "/wp-content/uploads/2023/07/peryton-website-video-3.mp4";

/** Scrape artifacts / WP junk — never publish as routes. */
const SKIP_SLUG =
  /(cssminify|^feed$|comments_feed|share_twitter|share_facebook|category_|_feed$|^osd\.xml$|mu-plugins|hello-world|about-2|^m_\d|page_id_|\d{4}_\d{2}_\d{2}_|\d{4}\/\d{2}\/\d{2}\/)/i;

const QUERY_PATH_ALIASES = {
  "page_id=281": "contact-us",
  /** WP home is often only reachable as ?page_id=168 after scrape rebuild. */
  "page_id=168": "",
};

function shouldSkipSlug(slug, routePath) {
  if (SKIP_SLUG.test(slug) || SKIP_SLUG.test(routePath)) return true;
  // Numeric id-only leftovers (id-169 etc.) unless they are real content pages
  if (/^id-\d+$/i.test(slug) || /^p_\d+$/i.test(routePath) || /^page_id_/i.test(routePath)) {
    return true;
  }
  return false;
}

function urlToPath(url) {
  const u = new URL(url);
  if (u.search) {
    const key = u.search.slice(1);
    if (Object.hasOwn(QUERY_PATH_ALIASES, key)) return QUERY_PATH_ALIASES[key];
    return key.replace(/[^\w.-]/g, "_");
  }
  const pathname = u.pathname.replace(/\/$/, "");
  return pathname === "" ? "" : pathname.slice(1);
}

function extractMainContent(html) {
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (main) return main[1];

  const between = html.match(/<\/header>([\s\S]*?)<footer/i);
  if (between) return between[1];

  return "";
}

function cleanContent(html) {
  let body = html;

  body = body.replace(
    /<script id=["']wpcom_remote_login_js["']>[\s\S]*?<\/script>/gi,
    "",
  );
  body = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  body = body.replace(/<script\b[^>]*\/>/gi, "");
  body = body.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
  body = body.replace(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi, "");

  const videoTag = `<video class="ps-hero-video" autoplay muted loop playsinline src="${HERO_VIDEO}"></video>`;
  body = body.replace(/<div id=["']cover_player_\d+["'][^>]*><\/div>/gi, videoTag);
  body = body.replace(
    /<div id=["']cover_player_\d+["'][^>]*src=["'][^"']*["'][^>]*><\/div>/gi,
    videoTag,
  );

  body = body.replace(/https?:\/\/(?:www\.)?peryton\.space/gi, "");
  body = body.replace(/https?:\/\/perytonspace\.wordpress\.com/gi, "");

  body = body.replace(
    /(["'])(\/wp-content\/uploads\/[^"'?\s]+)(\?[^"']*)?(["'])/g,
    "$1$2$4",
  );

  body = body.replace(/\sdata-wp-[a-z-]+="[^"]*"/gi, "");
  body = body.replace(/\sdata-wp-[a-z-]+='[^']*'/gi, "");
  body = body.replace(/\stabindex="-1"/gi, "");

  return body.trim();
}

function loadIndex() {
  return JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
}

function main() {
  if (!fs.existsSync(INDEX_PATH) || !fs.existsSync(HTML_DIR)) {
    if (fs.existsSync(OUT_PATH)) {
      console.log(
        "Scrape HTML archive not present — keeping existing content/scrape/pages.json",
      );
      return;
    }
    console.error(
      "Missing pages/html + index.json and no existing scrape/pages.json",
    );
    process.exit(1);
  }

  const index = loadIndex();
  const pages = [];
  const pathToSlug = {};

  const sources = {
    ...(index.live_pages || {}),
    ...(index.draft_pages || {}),
  };

  for (const [url, meta] of Object.entries(sources)) {
    const slug = meta.slug || "untitled";
    const routePath = urlToPath(url);
    if (shouldSkipSlug(slug, routePath)) {
      continue;
    }
    const htmlFile = path.join(HTML_DIR, `${slug}.html`);

    if (!fs.existsSync(htmlFile)) {
      console.warn(`  skip missing: ${slug}.html (${url})`);
      continue;
    }

    const raw = fs.readFileSync(htmlFile, "utf8");
    const content = cleanContent(extractMainContent(raw));

    pages.push({
      slug,
      path: routePath,
      title: meta.title || slug,
      content,
      status: meta.status || undefined,
      postType: meta.post_type || undefined,
    });
    pathToSlug[routePath] = slug;
  }

  pages.sort((a, b) => a.path.localeCompare(b.path));

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(
    OUT_PATH,
    JSON.stringify({ generatedAt: new Date().toISOString(), pages, pathToSlug }, null, 2),
  );

  console.log(`Wrote ${pages.length} pages to ${OUT_PATH}`);
}

main();
