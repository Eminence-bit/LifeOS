# ADR-0001: Single-User First Architecture

**Date:** 16 July 2026  
**Status:** Accepted  
**Decider:** Project owner

---

## Context

Life OS needs to decide whether to build for single-user or multi-user from the start.

Multi-user support (shared spaces, roles, permissions) is a desirable long-term feature, but introduces significant complexity at the database, auth, and UI level.

## Decision

Build for a **single user first**. Version 1.0 is intentionally a personal operating system for one person.

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Single-user first** *(chosen)* | Simple, fast to build, easy to reason about | Requires migration to multi-user later |
| Multi-user from day one | No migration needed later | Massive complexity upfront, slows v1 delivery |
| Abstract early (space_id from day one) | Easier future migration | Premature abstraction, cognitive overhead with no benefit yet |

## Consequences

- All tables use `profile_id` as the ownership anchor
- No roles, permissions, or invitation flows in v1
- Version 2.0 will require a planned migration from `profile_id` → `space_id`
- See `ADR-0005` and `ARCHITECTURE_EVOLUTION.md` for migration strategy
