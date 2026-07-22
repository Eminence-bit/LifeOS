# Architecture Evolution

This document is the **governing reference** for how Life OS's architecture evolves from v1 to v2 and beyond. When you finally build Shared Spaces, start here.

---

## Why v1 is Profile-Based

Every data table in v1 uses `profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE` as its ownership anchor.

**Reasons:**

1. **Simplicity** — One user, one profile, all data belongs to that profile. Zero indirection.
2. **Supabase RLS** — Row Level Security is trivially expressed: `profile_id = auth.uid()`
3. **No premature abstraction** — Adding `space_id` before we have spaces solves a problem we don't yet have
4. **Speed** — Single-user schema ships faster, with no multi-tenancy complexity to debug

See `ADR-0001` and `ADR-0004` for the decision record.

---

## Why v2 Becomes Space-Based

A "Space" is a shared environment — a family, apartment, couple, or team — where multiple users operate together.

In v2:
- A **Space** is a top-level entity, like a profile but shareable
- **Members** join a space with roles (Owner, Admin, Member, Viewer)
- Shared data (tasks, budget, inventory, meals) belongs to the space
- Personal data (health, career, learning, documents) remains profile-owned

```
v1 model:
  Profile → Task (always personal)

v2 model:
  Profile → Personal Task
  Space   → Shared Task (members can see/edit based on role)
```

---

## Migration Strategy

### ⚠️ This is additive — not a rewrite.

The v1 `profile_id` model is NOT replaced. It remains the anchor for personal data. v2 adds `space_id` as a second anchor for shared data.

### Phase 1 — Infrastructure (v1.2 prep)

Add the foundational tables without changing existing ones:

```sql
CREATE TABLE spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT, -- 'family', 'apartment', 'team', etc.
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE space_members (
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- owner, admin, member, viewer
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (space_id, profile_id)
);
```

### Phase 2 — Dual-anchor on shared tables (v2.0)

For tables that will be shareable, add `space_id` as nullable:

```sql
ALTER TABLE tasks ADD COLUMN space_id UUID REFERENCES spaces(id);
ALTER TABLE goals ADD COLUMN space_id UUID REFERENCES spaces(id);
ALTER TABLE expenses ADD COLUMN space_id UUID REFERENCES spaces(id);
ALTER TABLE inventory_items ADD COLUMN space_id UUID REFERENCES spaces(id);
ALTER TABLE meal_plans ADD COLUMN space_id UUID REFERENCES spaces(id);
ALTER TABLE shopping_items ADD COLUMN space_id UUID REFERENCES spaces(id);
```

**Invariant:** `space_id IS NULL` = personal data. `space_id IS NOT NULL` = shared data.

### Phase 3 — SyncEngine Evolution (v2.0)

`SyncEngine` gets a `currentSpaceId: string | null` context. All push/pull operations check this:

```typescript
// Personal context (current behaviour, unchanged)
syncEngine.setContext({ spaceId: null });

// Space context (new in v2)
syncEngine.setContext({ spaceId: 'abc-123' });
```

### Phase 4 — UI Context Switching (v2.0)

A space/personal switcher in `AppShell`. The sidebar, routes, and stores all respond to the active context.

---

## Data That Will NEVER Be Shared

These tables remain `profile_id`-only forever. They are personal health and career data and are not appropriate for spaces:

- `body_metrics`
- `sleep_logs`
- `water_intakes`
- `workout_logs`
- `career_skills`
- `job_applications`
- `vocabulary_items`
- `study_sessions`
- `learning_topics`
- `documents`
- `certificates`

---

## Data That WILL Be Shareable in v2

| Table | Space behaviour |
|-------|----------------|
| `tasks` | Personal or space-owned |
| `goals` | Personal or space-owned |
| `events` | Personal or space-owned |
| `expenses` | Can be shared (household budget) |
| `budgets` | Can be shared (household budget) |
| `inventory_items` | Can be shared (household pantry) |
| `shopping_items` | Can be shared (household shopping) |
| `meal_plans` | Can be shared (family meal planning) |
| `recipes` | Can be shared (family recipe library) |

---

## Risks

| Risk | Mitigation |
|------|-----------|
| Sync conflicts between space members | Implement last-write-wins first, then add conflict indicators in v2.1 |
| RLS complexity with dual-anchor tables | Use Supabase policies with `OR` conditions: `profile_id = auth.uid() OR space_id IN (select space_id from space_members where profile_id = auth.uid())` |
| localStorage per-user isolation | Each user's localStorage is already isolated by browser session — no change needed |
| Migration of existing personal data | No migration needed — `space_id IS NULL` rows retain their personal behaviour |

---

## Rollback Strategy

Because `space_id` is always additive and nullable:
- Removing space features = stop populating `space_id` and remove the UI switcher
- The `profile_id` personal path is never removed
- All v1 data is unaffected

---

## Things NOT to Migrate

These design choices from v1 should be preserved in v2, not replaced:

- Local-first sync pattern (`syncEngine` architecture)
- Zustand stores per module (add `spaceId` context, don't replace)
- The personal profile model (it runs alongside spaces)
- The `safeSet` guard in `pullFromCloud`
- UUID-only IDs (never revert to shorter IDs)
