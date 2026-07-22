# ADR-0005: Planned Space Migration Strategy (v2)

**Date:** 22 July 2026  
**Status:** Proposed (not yet active)  
**Decider:** Project owner

---

## Context

Version 2.0 introduces "Spaces" — shared environments for families, couples, and teams. The current `profile_id` ownership model must evolve. This ADR documents the migration strategy so future work is informed by deliberate decisions, not ad-hoc changes.

## Decision

**Additive migration, not a rewrite.** `space_id` is added alongside `profile_id`. Personal data stays personal. Shared data adds the space context.

## Migration Strategy

### Phase 1 — Add Spaces Infrastructure (v1.2 prep)
```sql
CREATE TABLE spaces (id UUID PRIMARY KEY, name TEXT, type TEXT, created_at TIMESTAMPTZ...);
CREATE TABLE space_members (space_id UUID, profile_id UUID, role TEXT...);
```

### Phase 2 — Dual-anchor tables (v2.0)
For shareable entities (tasks, budget, inventory), add `space_id` as nullable:
```sql
ALTER TABLE tasks ADD COLUMN space_id UUID REFERENCES spaces(id);
-- profile_id remains; NULL space_id = personal, non-NULL = shared
```

### Phase 3 — SyncEngine evolution (v2.0)
`syncEngine` gets a `spaceId` context. Push/pull operations are scoped to either `profile_id` or `space_id` based on context.

### Phase 4 — UI context switching (v2.0)
A "Personal" vs "Space" switcher in the sidebar. Modules render the correct scoped data.

## What WON'T Migrate
Some data will always remain personal and never be shared:
- Body metrics
- Sleep logs
- Weight / health data
- Vocabulary / learning sessions
- Career data
- Documents

## Rollback Strategy
Because `space_id` is additive and nullable, removing v2 space features simply means stopping populating the column. The personal `profile_id` path always remains valid.

## Consequences
- v1 code must not introduce `space_id` or any space-related logic
- Any cross-module data sharing in v2 goes through the space context, not direct foreign keys between profiles
- This ADR is the governing document when v2 work begins
