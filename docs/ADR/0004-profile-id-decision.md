# ADR-0004: Profile-ID as Ownership Anchor

**Date:** 18 July 2026  
**Status:** Accepted  
**Decider:** Project owner

---

## Context

Every data table in Life OS needs an ownership anchor — a way to know which user owns each row. We need to decide what that anchor looks like in v1.

## Decision

Use `profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE` on every data table.

`profiles.id` maps directly to Supabase `auth.users.id`. The user IS the profile.

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **`profile_id` on every table** *(chosen)* | Simple, no indirection, natural for single-user | Requires migration to `space_id` for v2 |
| Abstract to `owner_id` (could be user or space) | More flexible for future | Premature abstraction, ambiguous semantics in v1 |
| `space_id` from day one (with personal space per user) | No v2 migration | Massive complexity, every query needs space context |

## Consequences

- Row Level Security (RLS) in Supabase is trivially simple: `profile_id = auth.uid()`
- Deleting a user's profile cascades and wipes all their data cleanly
- In Version 2, `space_id` will be introduced alongside `profile_id`, with a phased migration
- `profile_id` will not be removed in v2 — personal data stays personal, shared data adds `space_id`
- See `ADR-0005` and `ARCHITECTURE_EVOLUTION.md` for the full migration plan
