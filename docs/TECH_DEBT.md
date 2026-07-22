# Tech Debt

A conscious, documented backlog of known shortcuts and deferred improvements. The goal is not to feel bad about these — it's to avoid forgetting them.

> Every item here was a deliberate decision with a known future cost. That's not bad engineering. That's pragmatic engineering with a memory.

---

## Active Tech Debt

### TD-001 — Dates Stored as Text Strings

| Field | Value |
|-------|-------|
| **What** | Date fields across all tables (`due_date`, `start_date`, etc.) are stored as `text` (ISO 8601 strings) |
| **Why** | Simpler for v1, no timezone conversion headaches, works with Drizzle's type system cleanly |
| **Cost** | Cannot do server-side date arithmetic, range queries, or ordering without casting |
| **Future fix** | Migrate to `date` or `timestamptz` columns in v1.2+ |
| **Target** | v1.2 |

---

### TD-002 — Goals.task_ids as UUID Array

| Field | Value |
|-------|-------|
| **What** | `goals.task_ids uuid[]` stores linked task IDs as a PostgreSQL array on the goal row |
| **Why** | Simple for v1 single-user use case — no need for a join table with one user |
| **Cost** | Cannot query "which goal does this task belong to?" efficiently from the task side; array manipulation is cumbersome at scale |
| **Future fix** | Replace with a `goal_tasks (goal_id, task_id)` join table |
| **Target** | v1.2 |

---

### TD-003 — No Conflict Resolution in Sync

| Field | Value |
|-------|-------|
| **What** | `syncEngine` uses last-write-wins for all upserts. No conflict detection. |
| **Why** | Single user on v1 — conflicts are rare and recovery is acceptable |
| **Cost** | If the same user edits on two devices simultaneously, data may be silently overwritten |
| **Future fix** | Add `updated_at` comparison before upsert; consider operational transforms or CRDTs for v2 Spaces |
| **Target** | v2.0 |

---

### TD-004 — Shopping List Auto-Items Not in Supabase

| Field | Value |
|-------|-------|
| **What** | Shopping items prefixed `auto-*` are derived from meal plans and exist only in memory — they bypass sync |
| **Why** | Deriving them from meal plans is correct; storing them was considered redundant |
| **Cost** | Auto-items are lost on refreshes if not regenerated; inconsistent with other shopping items |
| **Future fix** | Either fully derive on load (no storage) or store all items uniformly |
| **Target** | v1.1 |

---

### TD-005 — `gemini_api_key` Column Not in Base Schema

| Field | Value |
|-------|-------|
| **What** | `gemini_api_key` in `settings` is a conditionally-added column, not in the original schema |
| **Why** | Added after initial schema; `hasGeminiApiKeyColumn` flag used to probe at runtime |
| **Cost** | Fragile runtime column check; new Supabase instances won't have it without a migration |
| **Future fix** | Add to base schema via proper migration; remove the runtime probe |
| **Target** | v1.1 |

---

### TD-006 — No Numeric Precision Enforcement in Supabase

| Field | Value |
|-------|-------|
| **What** | Drizzle ORM defines `numeric(12,2)` and `numeric(5,2)` precision on finance and health columns, but the actual Supabase DDL uses plain `numeric` |
| **Why** | The Supabase table was created before stricter Drizzle constraints were added |
| **Cost** | Supabase won't reject values with more than 2 decimal places |
| **Future fix** | Apply `ALTER COLUMN ... TYPE numeric(12,2)` migrations |
| **Target** | v1.2 |

---

### TD-007 — Single-File Feature Pages

| Field | Value |
|-------|-------|
| **What** | Feature modules are each a single large page component (e.g., `DashboardPage.tsx` is 2000+ lines) |
| **Why** | Fast to build in v1, all logic in one place |
| **Cost** | Becomes hard to navigate, hard to test, and slow to parse as features grow |
| **Future fix** | Extract sub-sections into child components in v1.1 polish pass |
| **Target** | v1.1 |

---

## Resolved Tech Debt

| ID | What was resolved | Version |
|----|------------------|---------|
| — | Legacy short-ID localStorage data | Resolved in v1.0 via `migrateLocalIds()` in SyncEngine |
| — | `themeStyle` + `disableDynamicAccents` not syncing | Fixed in v1.0 22 July 2026 session |

---

## How to Add a New Item

When you consciously defer something, document it here immediately:

```markdown
### TD-XXX — Short Title

| Field | Value |
|-------|-------|
| **What** | What the shortcut is |
| **Why** | Why it was acceptable now |
| **Cost** | What problem it will cause later |
| **Future fix** | What the proper solution looks like |
| **Target** | Which version to address it |
```
