# ADR-0002: Local-First with Cloud Sync

**Date:** 17 July 2026  
**Status:** Accepted  
**Decider:** Project owner

---

## Context

Life OS is a personal data-heavy application. Users need it to work even without an internet connection, and data must not be lost if Supabase is temporarily unreachable.

We need to decide where the source of truth lives and how data moves between local and cloud.

## Decision

**Local-first with Supabase as secondary sync target.**

- All data is stored in `localStorage` via Zustand `persist`
- On every mutation, the change is immediately reflected locally, then asynchronously pushed to Supabase
- On auth login, data is pulled from Supabase and hydrates the local stores
- A `safeSet` guard prevents empty Supabase responses from wiping locally-persisted data

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Local-first + sync** *(chosen)* | Works offline, fast, data survives network issues | Sync conflicts possible, complex to implement |
| Cloud-only (fetch on every page) | Always fresh data, no sync logic | Requires internet, latency on every interaction |
| IndexedDB + sync | More storage capacity | Much higher complexity, overkill for v1 |

## Consequences

- `syncEngine.ts` is the single orchestrator for all cloud operations
- `pullFromCloud()` runs on every auth state change
- Every store action must call the relevant `syncEngine.push*()` method
- UUID migration (`migrateLocalIds`) needed for legacy pre-UUID localStorage data
- Conflict resolution is last-write-wins (acceptable for single-user v1)
