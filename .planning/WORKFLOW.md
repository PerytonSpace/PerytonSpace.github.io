# Workflow Choice: GSD + Lightweight SDD

**Chosen:** [GSD (Get Stuff Done)](https://github.com/gsd-build/get-shit-done) with Spec-Driven Development as the underlying philosophy.  
**Rejected for now:** Full BMad Method, Pure OpenAPI contract-first.

## Why GSD (not BMad, not pure API-SDD)

| Option | Fit for Peryton site rebuild | Verdict |
|--------|------------------------------|---------|
| **GSD + lightweight SDD** | Iterative UI/IA/content work; bi-weekly reviews; JSON content contracts; Next.js mirror of scraped WordPress | **Best** |
| Full BMad | Personas (Architect / FE / BE / QA) for long-lived full-stack with auth, APIs, DB | Overkill — no backend domain split |
| Pure OpenAPI SDD | Microservices / heavy third-party API surface | Wrong shape — content + routing contracts, not APIs |

This project is an **existing Next.js content site** (`web/`) shipping phased UX and content changes. Momentum matters more than multi-agent ceremony. Specs still gate hallucinations (nav IA, content schema, routes).

## Operating model

1. **Spec first** — Every phase has imperatives + success criteria under `.planning/phases/` before code.
2. **Contracts** — Content/edit surface defined under `.planning/contracts/` (JSON schemas, route map).
3. **Execute in waves** — One phase plan at a time; verify against REQUIREMENTS.md checkboxes.
4. **State always current** — Update `STATE.md` after each session; read it first next session.
5. **Human gates** — Committee prototype review (nav/home); Severin content fill; Carys ethos placement.

## Agent orchestration (lightweight)

Use Cursor Task / subagents as GSD-style roles when a phase is large; do **not** install full BMad unless scope grows to real backend + auth.

| Role | When to spawn | Output |
|------|---------------|--------|
| Planner | Start of phase | `##-##-PLAN.md` under phase folder |
| Executor | After plan approved | Code changes in `web/` |
| Verifier | End of phase | Checklist vs REQUIREMENTS IDs |
| Content editor (human) | After shells exist | Severin fills copy |

## Commands (if GSD CLI installed later)

```text
/gsd:plan-phase N
/gsd:execute-phase N
/gsd:verify-work
```

Without the CLI, treat this folder as the source of truth and follow the same loop manually:

`STATE.md` → phase `IMPERATIVES.md` → implement → tick `REQUIREMENTS.md` → update `STATE.md`.

## Source of meeting decisions

Meeting: Peryton Website — 1 Aug 2026 (Jim Lam, Severin Tretzmueller).  
Imperatives below capture only **website delivery** commitments; team process digressions (comms/CDR) are out of band.

## Agent enforcement

- Always-on Cursor rule: `.cursor/rules/gsd-planning.mdc` (`alwaysApply: true`)
- `web/AGENTS.md` points agents at `.planning/STATE.md`
- Executing agents must update `STATE.md` after meaningful work

## Locked product decisions (risk review)

See PROJECT.md Key Decisions. Summary: no auth; grey+Coming soon for incomplete comps; hide empty sponsors; Phase 1 next; style system TBD; hosting TODO; contact = replacement.

## Evolution

If the site gains auth, member accounts, or a real CMS API, revisit **BMad** or **contract-first OpenAPI**. Until then, stay on GSD.

---
*Chosen: 2026-08-08 · Decisions locked: 2026-08-08*
