# Header prototypes (committee review)

Flip in `web/src/lib/site.ts`:

```ts
export const headerPrototype: HeaderPrototype = "drawer"; // or "rail"
```

| ID | Name | Behaviour |
|----|------|-----------|
| `drawer` | Left drawer (default) | Burger top-left; full-height panel portaled to `body`; logo = home |
| `rail` | Compact rail | Shorter bar; smaller logo; tagline on wide screens |

Both include: **logo as home**, nested nav, grey **Coming soon** items with hover tip, sponsors omitted when `sponsors.json` empty, frosted transparent header.

**Implementation note:** Drawer/backdrop must stay outside the frosted header (portal to `document.body`) — `backdrop-filter` on the header breaks `position: fixed` descendants.
