#!/usr/bin/env python3
"""Serve the scraped peryton.space mirror on http://localhost:3000"""

import json
import os
import re
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent
HTML_DIR = ROOT / "pages" / "html"
MIRROR_CSS = ROOT / "assets" / "mirror.css"
DEBUG_OUTLINE_CSS = ROOT / "assets" / "debug-outline.css"
# Set False (or PERYTON_DEBUG_OUTLINES=0) to remove element outlines.
DEBUG_OUTLINES = os.environ.get("PERYTON_DEBUG_OUTLINES", "1") != "0"
PORT = 3000
HOST = "127.0.0.1"
ORIGIN = "https://peryton.space"

ROUTES: dict[str, str] = {}

# WordPress paths the browser requests; return empty stubs so tabs don't hang.
STUB_CSS = b"/* offline mirror stub */\n"
STUB_JS = b"/* offline mirror stub */\n"


def log(msg: str) -> None:
    print(msg, flush=True)


def load_routes() -> None:
    index = ROOT / "index.json"
    if index.exists():
        data = json.loads(index.read_text(encoding="utf-8"))
        for url, page in data.get("live_pages", {}).items():
            parsed = urlparse(url)
            path = parsed.path.rstrip("/") or "/"
            html = HTML_DIR / f"{page['slug']}.html"
            if not html.exists():
                continue
            if parsed.query:
                ROUTES[f"/?{parsed.query}"] = page["slug"] + ".html"
            else:
                ROUTES[path] = page["slug"] + ".html"

    for html in HTML_DIR.glob("*.html"):
        slug = html.stem
        if slug == "index":
            ROUTES.setdefault("/", "index.html")
        else:
            ROUTES.setdefault(f"/{slug}", f"{slug}.html")


def path_to_html(path: str, query: str) -> Path | None:
    if query:
        hit = ROUTES.get(f"/?{query}")
        if hit:
            return HTML_DIR / hit

    clean = path.rstrip("/") or "/"
    if clean in ROUTES:
        return HTML_DIR / ROUTES[clean]

    slug = re.sub(r"[^\w.-]", "_", clean.strip("/"))
    candidate = HTML_DIR / f"{slug}.html"
    if candidate.exists():
        return candidate

    return None


def strip_wordpress_styles(body: str) -> str:
    """Remove broken WP stylesheets and inline CSS; mirror.css replaces them."""
    body = re.sub(r"<link[^>]+rel=['\"]stylesheet['\"][^>]*>", "", body, flags=re.I)
    body = re.sub(r"<style[^>]*>.*?</style>", "", body, flags=re.S | re.I)
    return body


def rewrite_html(body: str, port: int) -> bytes:
    local = f"http://{HOST}:{port}"

    body = body.replace(ORIGIN, local)
    body = body.replace("http://peryton.space", local)
    body = body.replace("https://peryton.space", local)
    body = body.replace("//peryton.space", f"//{HOST}:{port}")
    body = body.replace("https://perytonspace.wordpress.com", local)

    body = re.sub(
        r"<script id=[\"']wpcom_remote_login_js[\"']>.*?</script>",
        "",
        body,
        flags=re.S | re.I,
    )
    body = re.sub(
        r'<div id="actionbar".*?</div>\s*</div>\s*</div>',
        "",
        body,
        flags=re.S | re.I,
    )
    # Replace VideoPress hero div with local HTML5 video (before script strip).
    body = re.sub(
        r"<div id=['\"]cover_player_\d+['\"][^>]*></div>",
        f'<video class="ps-hero-video" autoplay muted loop playsinline '
        f'src="{local}/wp-content/uploads/2023/07/peryton-website-video-3.mp4"></video>',
        body,
        flags=re.I,
    )
    # Remove all scripts — stubbed WP JS breaks pages.
    body = re.sub(r"<script\b[^>]*>.*?</script>", "", body, flags=re.S | re.I)
    body = re.sub(r"<script\b[^>]*/>", "", body, flags=re.I)

    body = strip_wordpress_styles(body)

    head_inject = f'<link rel="stylesheet" href="{local}/assets/mirror.css">\n'
    if DEBUG_OUTLINES:
        head_inject += f'<link rel="stylesheet" href="{local}/assets/debug-outline.css">\n'
    if "</head>" in body:
        body = body.replace("</head>", head_inject + "</head>", 1)

    return body.encode("utf-8")


class Handler(BaseHTTPRequestHandler):
    server_port: int = PORT

    def log_message(self, fmt: str, *args) -> None:
        log(f"  {self.path} -> {fmt % args}")

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = unquote(parsed.path)
        query = parsed.query

        rel = path.lstrip("/")
        if rel == "assets/mirror.css" and MIRROR_CSS.is_file():
            return self._send_bytes(MIRROR_CSS.read_bytes(), ".css")
        if rel == "assets/debug-outline.css" and DEBUG_OUTLINE_CSS.is_file():
            return self._send_bytes(DEBUG_OUTLINE_CSS.read_bytes(), ".css")
        if rel.startswith("wp-content/") or rel.startswith("assets/"):
            file_path = ROOT / rel.split("?")[0]
            if file_path.is_file():
                return self._send_bytes(file_path.read_bytes(), file_path.suffix)

        # Stub missing WordPress assets so the browser doesn't wait on 404s.
        if (
            path.startswith("/_static")
            or path.startswith("/wp-content/plugins")
            or path.startswith("/wp-content/themes")
            or path.startswith("/wp-content/mu-plugins")
            or path.startswith("/wp-content/js")
            or path.endswith(".css")
        ):
            return self._send_bytes(STUB_CSS, ".css")
        if path.endswith(".js") or path.startswith("/wp-includes"):
            return self._send_bytes(STUB_JS, ".js")
        if path in ("/remote-login.php", "/wp-admin/admin-ajax.php"):
            self.send_response(204)
            self.end_headers()
            return
        if path.endswith("/feed") or path.endswith("/feed/"):
            self._send_bytes(b'<?xml version="1.0"?><rss version="2.0"></rss>', ".xml")
            return

        html_path = path_to_html(path, query)
        if html_path and html_path.is_file():
            content = rewrite_html(
                html_path.read_text(encoding="utf-8", errors="replace"),
                self.server_port,
            )
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return

        self.send_error(404, f"Not found: {path}")

    def send_error(self, code, message=None, explain=None):
        if code == 404:
            local = f"http://{HOST}:{self.server_port}"
            msg = message or "Page not found"
            debug_css = (
                f'<link rel="stylesheet" href="{local}/assets/debug-outline.css">\n'
                if DEBUG_OUTLINES
                else ""
            )
            body = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8">
<link rel="stylesheet" href="{local}/assets/mirror.css">
{debug_css}<title>Not found — Peryton Space</title></head>
<body><div class="wp-site-blocks" style="padding:4rem 2rem;text-align:center">
<h1>Page not found</h1>
<p>{msg}</p>
<p><a href="{local}/">← Back to home</a></p>
</div></body></html>""".encode()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().send_error(code, message, explain)

    def _send_bytes(self, data: bytes, suffix: str) -> None:
        types = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp",
            ".gif": "image/gif",
            ".svg": "image/svg+xml",
            ".css": "text/css",
            ".js": "application/javascript",
            ".xml": "application/xml",
            ".mp4": "video/mp4",
            ".webm": "video/webm",
        }
        self.send_response(200)
        self.send_header("Content-Type", types.get(suffix.lower(), "application/octet-stream"))
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def main() -> None:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    load_routes()

    class BoundHandler(Handler):
        server_port = port

    server = ThreadingHTTPServer((HOST, port), BoundHandler)
    log("")
    log(f"  Peryton Space mirror running")
    log(f"  Open:  http://{HOST}:{port}/")
    log(f"  Routes: {len(ROUTES)} pages")
    if DEBUG_OUTLINES:
        log(f"  Debug:  element outlines ON (set PERYTON_DEBUG_OUTLINES=0 to disable)")
    log(f"  Stop:  Ctrl+C  (the terminal sitting idle is normal)")
    log("")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        log("\nStopped.")
        server.server_close()


if __name__ == "__main__":
    main()
