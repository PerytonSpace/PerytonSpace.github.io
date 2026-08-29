# Peryton Space — GSD planning root

**Workflow:** GSD + lightweight Spec-Driven Development (see [WORKFLOW.md](./WORKFLOW.md)).

## Read order (every session)

Enforced by `.cursor/rules/gsd-planning.mdc` (alwaysApply) and `web/AGENTS.md`.

1. [STATE.md](./STATE.md) — where we are  
2. [PROJECT.md](./PROJECT.md) — what / why  
3. Active phase `phases/NN-*/IMPERATIVES.md` (**Phase 1 next**)  
4. [REQUIREMENTS.md](./REQUIREMENTS.md) — tick done items when verifying  

**Open TODOs (human):** CF production deploy, chase checklist (see STATE.md).  
**Live site notes:** snap homepage, frosted header, logo-home — see `contracts/ROUTE_MAP.md`.

## Tree

```text
.planning/
  WORKFLOW.md          ← why GSD (not BMad)
  PROJECT.md
  REQUIREMENTS.md
  ROADMAP.md
  STATE.md
  contracts/
    CONTENT_SCHEMA.md  ← content authoring contract
    ROUTE_MAP.md       ← nav / routes contract
  phases/
    00-content-foundation/IMPERATIVES.md
    01-ia-chrome/IMPERATIVES.md
    02-section-shells/IMPERATIVES.md
    03-competition-content/IMPERATIVES.md
    04-presentation-polish/IMPERATIVES.md
    05-host-handover/IMPERATIVES.md
  docs/
    AUTHORING.md
```

## Loop

```text
plan phase → implement against imperatives → verify REQUIREMENTS IDs → update STATE
```

Optional later: install [GSD](https://github.com/gsd-build/get-shit-done) CLI and use `/gsd:plan-phase` / `/gsd:execute-phase` against this folder.
