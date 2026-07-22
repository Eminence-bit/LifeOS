# ADR-0003: Zustand for State Management

**Date:** 18 July 2026  
**Status:** Accepted  
**Decider:** Project owner

---

## Context

Life OS requires client-side state management for 9 domain modules, each with their own data. The solution needs to support `localStorage` persistence, simple mutations, and async sync operations.

## Decision

**Zustand** with the `persist` middleware.

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Zustand** *(chosen)* | Tiny (~1.5kb), minimal boilerplate, works perfectly with persist middleware, no providers | No devtools ecosystem as rich as Redux |
| Redux Toolkit | Excellent devtools, large community | Heavy boilerplate, overkill for local-first single-user app |
| MobX | Reactive, elegant | Requires decorators or class-based patterns, adds complexity |
| React Context API | Built-in, no dependency | Poor performance on frequent updates, re-renders entire tree |
| Jotai | Atomic, minimal | Less mature, smaller community, less clear persistence story |

## Consequences

- Each module has its own store: `use<Module>Store`
- All stores use `persist` middleware with a `lifeos-<module>` key
- Store actions are the only place business logic lives — components are kept dumb
- Redux middleware (redux-saga, redux-observable) is not available — this is acceptable
- Migrating away from Zustand in v2 would be expensive — this is an accepted risk given Zustand's stability
