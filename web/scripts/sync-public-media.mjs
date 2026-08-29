#!/usr/bin/env node
/**
 * Curate web/public/wp-content/uploads from the archive at ../../wp-content.
 * Only copies assets referenced by the live app (content + src).
 * Skips oversized non-hero videos that only appear in overridden scrape HTML.
 *
 * Replaces the old full-tree symlink so Cloudflare Pages does not ship ~360MB.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(__dirname, "..");
const ROOT = path.resolve(WEB, "..");
const ARCHIVE = path.join(ROOT, "wp-content", "uploads");
const PUBLIC_WP = path.join(WEB, "public", "wp-content");
const PUBLIC_UPLOADS = path.join(PUBLIC_WP, "uploads");

const HERO_VIDEO = "/wp-content/uploads/2023/07/peryton-website-video-3.mp4";
/** Non-hero videos larger than this are omitted from public (kept in archive). */
const MAX_NON_HERO_VIDEO_BYTES = 20 * 1024 * 1024;

const REF_RE = /\/wp-content\/uploads\/[^\s"'`)\\>]+/g;

function walkFiles(dir, exts) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === ".next" || ent.name === "out") {
        continue;
      }
      out.push(...walkFiles(p, exts));
    } else if (exts.has(path.extname(ent.name).toLowerCase())) {
      out.push(p);
    }
  }
  return out;
}

function collectRefs() {
  const refs = new Set();
  const roots = [
    path.join(WEB, "content"),
    path.join(WEB, "src"),
  ];
  const exts = new Set([".json", ".ts", ".tsx", ".css", ".mjs", ".js", ".md", ".html"]);
  for (const root of roots) {
    for (const file of walkFiles(root, exts)) {
      // scrape/pages.json is regenerated; still scan for images used by fallback routes
      const text = fs.readFileSync(file, "utf8");
      for (const m of text.matchAll(REF_RE)) {
        refs.add(m[0].split("?")[0].replace(/\\+$/, ""));
      }
    }
  }
  // Always keep hero + site chrome
  refs.add(HERO_VIDEO);
  refs.add("/wp-content/uploads/2024/01/transparentlogo.png");
  refs.add("/wp-content/uploads/2023/08/cropped-pertyon-wide-1.png");
  return refs;
}

function archivePath(webPath) {
  // /wp-content/uploads/... → ROOT/wp-content/uploads/...
  const rel = webPath.replace(/^\/wp-content\//, "");
  return path.join(ROOT, "wp-content", rel);
}

function publicPath(webPath) {
  const rel = webPath.replace(/^\/wp-content\//, "");
  return path.join(WEB, "public", "wp-content", rel);
}

function isVideo(p) {
  return /\.(mp4|webm|mov)$/i.test(p);
}

function main() {
  if (!fs.existsSync(ARCHIVE)) {
    if (fs.existsSync(PUBLIC_UPLOADS)) {
      console.log(
        "WP media archive not present — keeping existing public/wp-content/",
      );
      return;
    }
    console.error(`Archive missing: ${ARCHIVE}`);
    process.exit(1);
  }

  // Replace symlink or stale tree with curated uploads only
  if (fs.existsSync(PUBLIC_WP)) {
    const st = fs.lstatSync(PUBLIC_WP);
    if (st.isSymbolicLink()) {
      fs.unlinkSync(PUBLIC_WP);
    } else {
      fs.rmSync(PUBLIC_WP, { recursive: true, force: true });
    }
  }
  fs.mkdirSync(PUBLIC_UPLOADS, { recursive: true });

  const refs = collectRefs();
  let copied = 0;
  let skippedMissing = 0;
  let skippedLargeVideo = 0;
  let bytes = 0;

  for (const ref of [...refs].sort()) {
    const src = archivePath(ref);
    if (!fs.existsSync(src) || !fs.statSync(src).isFile()) {
      skippedMissing++;
      continue;
    }
    const size = fs.statSync(src).size;
    if (isVideo(ref) && ref !== HERO_VIDEO && size > MAX_NON_HERO_VIDEO_BYTES) {
      skippedLargeVideo++;
      console.log(`  skip large non-hero video (${(size / 1e6).toFixed(1)}MB): ${ref}`);
      continue;
    }
    const dest = publicPath(ref);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    copied++;
    bytes += size;
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    copied,
    bytes,
    skippedMissing,
    skippedLargeVideo,
    heroVideo: HERO_VIDEO,
    note: "Archive remains at repo wp-content/; public only has referenced assets.",
  };
  fs.writeFileSync(
    path.join(PUBLIC_WP, "MANIFEST.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );

  console.log(
    `Public media: copied ${copied} files (${(bytes / 1e6).toFixed(1)}MB)` +
      ` | missing ${skippedMissing} | skipped large videos ${skippedLargeVideo}`,
  );
}

main();
