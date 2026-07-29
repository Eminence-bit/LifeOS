# Life OS /docs

Canonical project documentation. The source of truth for architecture, design, AI behaviour, and long-term planning.

---

## Core

| Document | Purpose |
|----------|---------|
| [PROJECT_CONSTITUTION.md](./PROJECT_CONSTITUTION.md) | ⭐ Vision, principles, version roadmap — the governing document |
| [AI_GUARDRAILS.md](./AI_GUARDRAILS.md) | Hard rules that govern all AI-assisted development |
| [AI_INSTRUCTIONS.md](./AI_INSTRUCTIONS.md) | Expanded AI rules: terminology, architecture constraints, escalation |
| [PRODUCT_PRINCIPLES.md](./PRODUCT_PRINCIPLES.md) | The 7-principle feature test — if a feature fails this, it doesn't belong |
| [VISION.md](./VISION.md) | The 5-stage evolution path of Life OS beyond v2 |

## Architecture

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Tech stack, directory structure, data flow, SyncEngine, routing |
| [ARCHITECTURE_EVOLUTION.md](./ARCHITECTURE_EVOLUTION.md) | ⭐ v1→v2 migration bible — the governing doc when building Shared Spaces |
| [DATABASE.md](./DATABASE.md) | All 26 tables, column types, JSONB shapes, conventions |
| [MODULE_CONTRACTS.md](./MODULE_CONTRACTS.md) | What each module owns, can read, and cannot write |
| [UI_GUIDELINES.md](./UI_GUIDELINES.md) | Theme system, CSS tokens, component classes, animation timings |

## Planning

| Document | Purpose |
|----------|---------|
| [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md) | Feature-level delivery plan: v1.0 → v2.0 |
| [GOM_PRODUCT_ROADMAP_PRD.md](./GOM_PRODUCT_ROADMAP_PRD.md) | Product roadmap PRD for GOM: v1.0 → v3.0 |
| [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) | Strict definition of 'Done' criteria for v1.0 |
| [CHANGELOG.md](./CHANGELOG.md) | Running log of all notable changes by version |
| [VERSION_HISTORY.md](./VERSION_HISTORY.md) | Narrative milestone log per major version |
| [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md) | Checklist a feature must pass before being considered complete |
| [TECH_DEBT.md](./TECH_DEBT.md) | Conscious backlog of known shortcuts and their future cost |

## Decisions

| Document | Purpose |
|----------|---------|
| [ADR/README.md](./ADR/README.md) | Architecture Decision Record index + template |
| [ADR/0001](./ADR/0001-single-user-first.md) | Why single-user first |
| [ADR/0002](./ADR/0002-local-first-sync.md) | Why local-first with cloud sync |
| [ADR/0003](./ADR/0003-zustand-choice.md) | Why Zustand over Redux/MobX/Context |
| [ADR/0004](./ADR/0004-profile-id-decision.md) | Why profile_id as ownership anchor |
| [ADR/0005](./ADR/0005-space-migration.md) | Planned v2 Space migration strategy |

## Future Ideas

| Document | Purpose |
|----------|---------|
| [FUTURE_IDEAS/AI.md](./FUTURE_IDEAS/AI.md) | AI intelligence ideas |
| [FUTURE_IDEAS/Integrations.md](./FUTURE_IDEAS/Integrations.md) | External integration ideas |
| [FUTURE_IDEAS/Modules.md](./FUTURE_IDEAS/Modules.md) | Module enhancement ideas |
| [FUTURE_IDEAS/Version3Plus.md](./FUTURE_IDEAS/Version3Plus.md) | Stage 3–5 ideas |
| [FUTURE_IDEAS/CrazyIdeas.md](./FUTURE_IDEAS/CrazyIdeas.md) | Speculative, high-imagination ideas |

---

## Quick Reference

**Start here →** `PROJECT_CONSTITUTION.md`  
**Building a feature →** `ARCHITECTURE.md` · `DATABASE.md` · `UI_GUIDELINES.md` · `MODULE_CONTRACTS.md` · `DEFINITION_OF_DONE.md`  
**Using AI assistance →** `AI_GUARDRAILS.md` · `AI_INSTRUCTIONS.md`  
**Planning Shared Spaces →** `ARCHITECTURE_EVOLUTION.md` · `ADR/0005`  
**Reviewing a feature decision →** `PRODUCT_PRINCIPLES.md` · `ADR/README.md`
