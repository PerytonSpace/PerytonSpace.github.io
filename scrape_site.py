#!/usr/bin/env python3
"""Full-site scraper for peryton.space"""

import html as htmlmod
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

BASE = "https://peryton.space"
OUT = Path(__file__).resolve().parent
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
DELAY = 0.3


def fetch(url: str, binary: bool = False) -> bytes | str | None:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
            return data if binary else data.decode("utf-8", errors="replace")
    except Exception as e:
        print(f"  FAIL {url}: {e}")
        return None


def decode(s: str) -> str:
    s = htmlmod.unescape(s)
    return re.sub(r"&#(\d+);", lambda m: chr(int(m.group(1))), s)


def normalize_url(url: str, page_url: str = BASE) -> str | None:
    if not url or url.startswith(("#", "mailto:", "tel:", "javascript:")):
        return None
    full = urllib.parse.urljoin(page_url, url)
    parsed = urllib.parse.urlparse(full)
    if parsed.netloc and parsed.netloc not in ("peryton.space", "www.peryton.space"):
        return None
    path = parsed.path.rstrip("/") or "/"
    clean = urllib.parse.urlunparse(
        (parsed.scheme or "https", parsed.netloc or "peryton.space", path, "", parsed.query, "")
    )
    return clean


def slug_from_url(url: str) -> str:
    parsed = urllib.parse.urlparse(url)
    if parsed.query:
        return re.sub(r"[^\w.-]", "_", parsed.query)
    path = parsed.path.strip("/") or "index"
    return re.sub(r"[^\w.-]", "_", path)


def extract_links(html: str, page_url: str) -> list[str]:
    urls = []
    for m in re.finditer(r'href=["\']([^"\']+)["\']', html, re.I):
        u = normalize_url(m.group(1), page_url)
        if u:
            urls.append(u)
    return urls


def extract_images(html: str, page_url: str) -> list[dict]:
    images = []
    seen = set()
    for m in re.finditer(r"<img[^>]+>", html, re.I):
        tag = m.group(0)
        src = re.search(r'src=["\']([^"\']+)["\']', tag)
        if not src:
            continue
        full = urllib.parse.urljoin(page_url, src.group(1))
        if full in seen:
            continue
        seen.add(full)
        alt = re.search(r'alt=["\']([^"\']*)["\']', tag)
        images.append({"url": full, "alt": decode(alt.group(1)) if alt else ""})
    for m in re.finditer(r"url\(([^)]+)\)", html):
        u = m.group(1).strip("'\"")
        if u.startswith("http") or u.startswith("/"):
            full = urllib.parse.urljoin(page_url, u)
            if full not in seen and "uploads" in full:
                seen.add(full)
                images.append({"url": full, "alt": "background"})
    return images


def extract_text_content(html: str) -> dict:
    title_m = re.search(r"<title>([^<]*)</title>", html, re.I)
    title = decode(title_m.group(1).strip()) if title_m else ""

    meta = {}
    for m in re.finditer(r'<meta\s+([^>]+)>', html, re.I):
        attrs = dict(re.findall(r'(\w+)="([^"]*)"', m.group(1)))
        key = attrs.get("name") or attrs.get("property")
        if key:
            meta[key] = attrs.get("content", "")

    headings = []
    for level in range(1, 7):
        for m in re.finditer(rf"<h{level}[^>]*>(.*?)</h{level}>", html, re.S | re.I):
            text = decode(re.sub(r"<[^>]+>", " ", m.group(1)))
            text = re.sub(r"\s+", " ", text).strip()
            if text:
                headings.append({"level": level, "text": text})

    paragraphs = []
    for m in re.finditer(r"<p[^>]*>(.*?)</p>", html, re.S | re.I):
        text = decode(re.sub(r"<[^>]+>", " ", m.group(1)))
        text = re.sub(r"\s+", " ", text).strip()
        if text and len(text) > 1 and not text.startswith("function "):
            paragraphs.append(text)

    lists = []
    for m in re.finditer(r"<ul[^>]*>(.*?)</ul>", html, re.S | re.I):
        items = []
        for li in re.finditer(r"<li[^>]*>(.*?)</li>", m.group(1), re.S | re.I):
            text = decode(re.sub(r"<[^>]+>", " ", li.group(1)))
            text = re.sub(r"\s+", " ", text).strip()
            if text:
                items.append(text)
        if items:
            lists.append(items)

    # wp-block columns / figures captions
    captions = []
    for m in re.finditer(r"<figcaption[^>]*>(.*?)</figcaption>", html, re.S | re.I):
        text = decode(re.sub(r"<[^>]+>", " ", m.group(1)))
        text = re.sub(r"\s+", " ", text).strip()
        if text:
            captions.append(text)

    video_ids = list(set(re.findall(r"videopress\(\s*'([^']+)'", html)))

    body = re.sub(r"<script[^>]*>.*?</script>", "", html, flags=re.S | re.I)
    body = re.sub(r"<style[^>]*>.*?</style>", "", body, flags=re.S | re.I)
    body = re.sub(r"<[^>]+>", "\n", body)
    body = decode(body)
    body = re.sub(r"\n\s*\n+", "\n\n", body)
    visible_lines = [l.strip() for l in body.split("\n") if l.strip()]

    return {
        "title": title,
        "meta": meta,
        "headings": headings,
        "paragraphs": paragraphs,
        "lists": lists,
        "captions": captions,
        "video_ids": video_ids,
        "visible_text": visible_lines,
    }


def discover_seed_urls() -> tuple[set[str], set[str]]:
    seeds = {BASE + "/", BASE}
    sitemap_images: set[str] = set()
    sitemap_urls = [
        BASE + "/sitemap.xml",
        BASE + "/wp-sitemap.xml",
        BASE + "/sitemap_index.xml",
    ]
    for sm in sitemap_urls:
        xml = fetch(sm)
        if not xml:
            continue
        for loc in re.findall(r"<loc>([^<]+)</loc>", xml):
            u = normalize_url(loc.strip())
            if u:
                seeds.add(u)
        for img in re.findall(r"<image:loc>([^<]+)</image:loc>", xml):
            sitemap_images.add(img.strip())
    feed = fetch(BASE + "/feed/")
    if feed:
        for link in re.findall(r"<link>(https?://peryton\.space[^<]+)</link>", feed):
            u = normalize_url(link.strip())
            if u:
                seeds.add(u)
    return seeds, sitemap_images


def download_image(url: str, dest: Path) -> bool:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        return True
    data = fetch(url.split("?")[0] if "?" in url else url, binary=True)
    if data is None:
        data = fetch(url, binary=True)
    if data is None:
        return False
    dest.write_bytes(data)
    return True


def image_local_path(url: str) -> Path:
    parsed = urllib.parse.urlparse(url.split("?")[0])
    rel = parsed.path.lstrip("/")
    if not rel.startswith("wp-content"):
        rel = "assets/" + rel.split("/")[-1]
    return OUT / rel


def main():
    pages_dir = OUT / "pages"
    html_dir = pages_dir / "html"
    html_dir.mkdir(parents=True, exist_ok=True)

    print("Discovering URLs...")
    to_visit, sitemap_images = discover_seed_urls()
    print(f"  {len(to_visit)} seed URLs, {len(sitemap_images)} sitemap images")
    visited: set[str] = set()
    all_pages: dict[str, dict] = {}
    all_images: dict[str, dict] = {u: {"url": u, "alt": "sitemap"} for u in sitemap_images}

    while to_visit:
        url = to_visit.pop()
        norm = normalize_url(url) or url
        if norm in visited:
            continue
        visited.add(norm)

        print(f"Scraping: {norm}")
        html = fetch(norm)
        if html is None:
            continue
        time.sleep(DELAY)

        slug = slug_from_url(norm)
        html_path = html_dir / f"{slug}.html"
        html_path.write_text(html, encoding="utf-8")

        content = extract_text_content(html)
        links = extract_links(html, norm)
        images = extract_images(html, norm)

        for img in images:
            all_images[img["url"]] = img

        for link in links:
            if link not in visited:
                to_visit.add(link)

        all_pages[norm] = {
            "url": norm,
            "slug": slug,
            "html_file": str(html_path.relative_to(OUT)),
            "html_size": len(html),
            "title": content["title"],
            "meta_description": content["meta"].get("description", ""),
            "og_description": content["meta"].get("og:description", ""),
            "headings": content["headings"],
            "paragraphs": content["paragraphs"],
            "lists": content["lists"],
            "captions": content["captions"],
            "video_ids": content["video_ids"],
            "visible_text": content["visible_text"],
            "links_found": len(links),
            "images": images,
            "outbound_links": [
                {"url": l, "text": ""}
                for l in sorted(set(links))
                if normalize_url(l) is None and l.startswith("http")
            ],
        }

    print(f"\nDownloading {len(all_images)} images...")
    downloaded = 0
    for url, img in sorted(all_images.items()):
        dest = image_local_path(url)
        if download_image(url, dest):
            img["local_path"] = str(dest.relative_to(OUT))
            downloaded += 1
        time.sleep(0.1)

    site = {
        "source": BASE,
        "scraped_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "pages_count": len(all_pages),
        "images_count": len(all_images),
        "images_downloaded": downloaded,
        "pages": all_pages,
        "images": all_images,
        "urls": sorted(all_pages.keys()),
    }

    json_path = OUT / "site_scrape.json"
    json_path.write_text(json.dumps(site, indent=2, ensure_ascii=False), encoding="utf-8")

    # Markdown index
    md_lines = [
        f"# Peryton Space — Full Site Scrape\n",
        f"**Source:** {BASE}  ",
        f"**Scraped:** {site['scraped_at']}  ",
        f"**Pages:** {len(all_pages)}  ",
        f"**Images:** {downloaded}/{len(all_images)}\n",
        "---\n",
    ]
    for url in sorted(all_pages.keys()):
        p = all_pages[url]
        md_lines.append(f"## {p['title']}\n")
        md_lines.append(f"**URL:** {url}  ")
        md_lines.append(f"**HTML:** `{p['html_file']}`\n")
        if p["meta_description"]:
            md_lines.append(f"> {p['meta_description']}\n")
        if p["headings"]:
            md_lines.append("### Headings\n")
            for h in p["headings"]:
                md_lines.append(f"{'#' * h['level']} {h['text']}\n")
        if p["paragraphs"]:
            md_lines.append("### Content\n")
            for para in p["paragraphs"]:
                md_lines.append(f"{para}\n\n")
        if p["lists"]:
            md_lines.append("### Lists\n")
            for lst in p["lists"]:
                for item in lst:
                    md_lines.append(f"- {item}\n")
                md_lines.append("\n")
        if p["images"]:
            md_lines.append("### Images\n")
            for img in p["images"]:
                local = img.get("local_path", "")
                md_lines.append(f"- [{img.get('alt') or 'image'}]({img['url']})")
                if local:
                    md_lines.append(f" → `{local}`")
                md_lines.append("\n")
        md_lines.append("\n---\n\n")

    (OUT / "site_scrape.md").write_text("".join(md_lines), encoding="utf-8")

    print(f"\nDone: {len(all_pages)} pages, {downloaded} images")
    print(f"  {json_path}")
    print(f"  {OUT / 'site_scrape.md'}")
    print(f"  {html_dir}/")


if __name__ == "__main__":
    main()
