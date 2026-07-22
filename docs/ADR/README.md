# ADR Index

Architecture Decision Records for Life OS.

An ADR captures a significant architectural decision: the context it was made in, the alternatives considered, and the consequences expected.

---

| ADR | Title | Status |
|-----|-------|--------|
| [0001](./0001-single-user-first.md) | Single-User First Architecture | ✅ Accepted |
| [0002](./0002-local-first-sync.md) | Local-First with Cloud Sync | ✅ Accepted |
| [0003](./0003-zustand-choice.md) | Zustand for State Management | ✅ Accepted |
| [0004](./0004-profile-id-decision.md) | Profile-ID as Ownership Anchor | ✅ Accepted |
| [0005](./0005-space-migration.md) | Planned Space Migration Strategy (v2) | 🔵 Proposed |

---

## Statuses
- **✅ Accepted** — Decision is in effect
- **🔵 Proposed** — Documented for future, not yet active
- **🔄 Superseded** — Replaced by a newer ADR (link to successor)
- **❌ Rejected** — Considered but not adopted

## How to Add a New ADR

1. Create `docs/ADR/XXXX-short-title.md`
2. Use the template below
3. Add it to this index

```markdown
# ADR-XXXX: Title

**Date:**  
**Status:**  
**Decider:**

## Context
Why this decision is needed.

## Decision
What was decided.

## Alternatives Considered
| Option | Pros | Cons |
|--------|------|------|

## Consequences
What happens as a result of this decision.
```
