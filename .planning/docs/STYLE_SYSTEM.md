# Style system

**Status:** Interim layout + chrome — live  
**Updated:** 2026-09-05 (Space Mono 400/700 only; leftover WP font classes stripped)

## Source of truth

| Layer | File | Role |
|-------|------|------|
| **Canonical** | `web/src/app/globals.css` | Tokens, fonts, header/drawer/snap/structured/footer |
| **Scrape only** | `web/src/styles/scrape.css` | Leftover WordPress block HTML layout |
| **Font** | `web/src/app/layout.tsx` | `Space_Mono` via `next/font` → `--font-space-mono` |

Import order in `layout.tsx`: `scrape.css` then `globals.css` so **new always wins**.

Do **not** redefine `--ps-*` or load Google Fonts in `scrape.css`.

## Layout tokens

| Token | Value | Role |
|-------|--------|------|
| `--ps-shell-max` | `1600px` | Header, main, footer, snap inners outer |
| `--ps-content-max` | `1400px` | Structured inners, constrained blocks |
| `--ps-gutter` | `clamp(1rem, 3vw, 2.5rem)` | Horizontal padding |

Do **not** reintroduce a ~720px site-wide content column.

**Root scale:** `html { font-size: 108%; }` in globals — slight site-wide bump; rem/em chrome tracks it.

**Landscape ≥720p** (`orientation: landscape` + `min-width: 1280px` + `min-height: 720px`): proportional sizes (logo caps, grid mins, intro offsets) use **em**, not px. Hairlines / blur radii stay px.

## Colour (locked interim)

| Token | Value | Role |
|-------|--------|------|
| `--ps-bg` | `#000000` | Page / panel background |
| `--ps-fg` / `--ps-text` | `#ffffff` | Primary text |
| `--ps-muted` / `--ps-text-muted` | `#b3b3b3` | Secondary text |
| `--ps-border` | `#333333` | Rules / card edges |
| `--ps-elevated` / `--ps-bg-elevated` | `#141414` | Cards / inset surfaces |

**Rule:** White text on black background site-wide. Scrape light-theme WP classes are overridden in globals (and mirrored in scrape.css).

## Typography (locked interim)

| Token | Face | Role |
|-------|------|------|
| `--ps-font-body` | Space Mono (`next/font`) | Body + UI |
| `--ps-font-heading` / `--ps-font-mono` | Space Mono | Headings + chrome |

Only **400** and **700** are loaded. Do not use 500/600 (browsers fake those cuts). Leftover WP classes (`has-commissioner-font-family`, etc.) inherit Space Mono.

Roboto / Google Fonts CSS runtime **removed**. Full brand redesign still deferred.

## Chrome

| Surface | Spec |
|---------|------|
| Nav rail | Persistent left bar (no top chrome); logo = home; hover/tap expand, click page collapse; thin dark scrollbar when open |
| Home snap | `100dvh` slides; `scroll-snap` proximity; fixed ↑/↓ chrome |
| Footer | `.ps-footer` in globals (not WP footer classes) |

## Decisions

1. New UI (`globals.css` + `--ps-*`) is canonical; scrape CSS is subordinate.
2. Space Mono site-wide until committee brand pass.
3. Full brand redesign deferred — **palette locked to white-on-black**.

## Key files

- `web/src/app/globals.css`
- `web/src/styles/scrape.css`
- `web/src/app/layout.tsx`
- `web/src/components/SiteHeader.tsx`
- `web/src/components/HomeSnap.tsx`
- `web/src/components/SiteFooter.tsx`
