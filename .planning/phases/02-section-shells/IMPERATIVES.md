# Phase 2 — Section shells

**Status:** Complete (placeholders; form URL + real names before deploy)  


**Requirements:** MEM-*, CONTACT-*, SPON-*, STAG-*, TEAM-*  
**Code touchpoints:** structured pages, sponsors JSON, contact embed, team data

## Imperatives (must)

1. **Member Zone** shell: workshops, how to order/make, course resources — **public, no auth**.
2. Email/phone for access requests: point elsewhere / “on request” — do not build gated accounts.
3. Put **composites + electronics course** info in Member Zone (not StagWorks).
4. **Sponsors JSON** with Partnerships / Tier 1 / Tier 2 shape; **if empty/absent → hide nav + section**.
5. **Contact replacement** for post-WP hosting (Microsoft Forms preferred; Google Forms OK). Do not debug legacy WP form.
6. **StagWorks:** weather balloon + placeholders (RF / composites / FEPS); no old-project archaeology.
7. **Our Team:** current, historical, supervisors, wellbeing (easy to find), LinkedIn opt-in fields.

## Imperatives (must not)

1. Do not invent final sponsor offer copy (Severin; chase before deploy).
2. Do not show empty sponsor tiers publicly.
3. Do not bury wellbeing champions.

## Acceptance

- [x] Member Zone public and linked
- [x] Empty sponsors JSON hides Sponsors entirely; non-empty shows it
- [x] Contact replacement works in Next.js (Microsoft Forms `formEmbedUrl` set)
- [x] Team structure supports historical + wellbeing + supervisors
