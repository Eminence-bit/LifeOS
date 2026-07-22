# Database

**ORM:** Drizzle ORM (`drizzle-orm/pg-core`)  
**Backend:** Supabase (PostgreSQL + Row Level Security)  
**Schema file:** `src/db/schema.ts`  
**SQL reference:** `supabase_schema.sql`

---

## Philosophy

- All tables are **user-centric**: every row is owned by a `profile_id` referencing `profiles.id`
- `profiles.id` is the Supabase `auth.users` UUID — the user IS the profile
- `ON DELETE CASCADE` on all `profile_id` foreign keys: deleting a user wipes all their data cleanly
- UUIDs are used for all primary keys (`uuid().defaultRandom()`)
- Dates are stored as `text` in ISO 8601 format (`YYYY-MM-DD`) for simplicity
- Timestamps use `timestamp with timezone`, defaulting to `now()`
- JSON blobs are typed as `jsonb`

---

## Tables

### `profiles`
Core identity table. Linked to `auth.users`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | Matches Supabase `auth.users.id` |
| `name` | `text` | Required |
| `email` | `text` | Unique, required |
| `avatar_color` | `text` | Default `#7c3aed` |
| `bio` | `text` | Optional |
| `updated_at` | `timestamp tz` | Auto-updated |

---

### `settings`
One-to-one with `profiles`. Stores all user preferences.

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | `uuid` PK | — | References `profiles.id` (cascade) |
| `theme` | `text` | `dark` | `dark` or `light` |
| `theme_style` | `text` | `cozy-earth` | See UI_GUIDELINES.md |
| `disable_dynamic_accents` | `boolean` | `false` | |
| `currency` | `text` | `INR` | ISO 4217 code |
| `timezone` | `text` | `Asia/Kolkata` | IANA timezone |
| `week_starts_on` | `integer` | `1` | 0=Sun, 1=Mon |
| `notifications` | `jsonb` | See below | Per-category toggles |
| `quick_notes` | `text` | `''` | Dashboard quick scratchpad |
| `updated_at` | `timestamp tz` | `now()` | |

> **Note:** `gemini_api_key` is **not** a base schema column. It is conditionally added and probed at runtime by `syncEngine` via `hasGeminiApiKeyColumn`. Do not assume it exists.

**Notifications JSONB shape:**
```json
{ "inventory": true, "documents": true, "bills": true, "study": true, "workout": true }
```

---

### `tasks`
Planner module — individual action items.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `profile_id` | `uuid` FK → `profiles` | cascade |
| `title` | `text` | Required |
| `description` | `text` | Optional |
| `priority` | `text` | `low`, `medium`, `high` |
| `status` | `text` | `todo`, `in_progress`, `done` |
| `due_date` | `text` | ISO date string |
| `category` | `text` | Optional |
| `goal_id` | `uuid` | Optional FK to `goals` (not enforced) |
| `tags` | `text[]` | Default `[]` |
| `created_at` / `updated_at` | `timestamp tz` | |

---

### `events`
Calendar events.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `profile_id` | `uuid` FK | cascade |
| `title` | `text` | Required |
| `start_date` | `text` | Required |
| `end_date` | `text` | Optional (for multi-day) |
| `all_day` | `boolean` | Default `false` |
| `recurring` | `text` | Optional recurrence rule |
| `color` | `text` | Optional hex color |
| `category` | `text` | Optional |

---

### `goals`
Planner goals — can link to multiple tasks.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `profile_id` | `uuid` FK | cascade |
| `title` / `description` | `text` | |
| `target_date` | `text` | |
| `progress` | `integer` | 0–100 |
| `category` | `text` | |
| `task_ids` | `uuid[]` | Array of linked task IDs |

---

### Finance Tables

| Table | Purpose | Key Columns |
|-------|---------|------------|
| `expenses` | Outgoing money | `amount numeric`, `category`, `date`, `recurring` |
| `incomes` | Incoming money | `amount numeric`, `source`, `date`, `recurring` |
| `budgets` | Monthly category limits | `limit_amount numeric`, `month` (YYYY-MM) |
| `savings_goals` | Savings targets | `target_amount numeric`, `current_amount numeric`, `target_date` |

---

### Food Tables

| Table | Purpose | Key Columns |
|-------|---------|------------|
| `inventory_items` | Pantry stock | `quantity numeric`, `unit`, `min_quantity`, `expiry_date`, `store` |
| `shopping_items` | Shopping list | `quantity numeric`, `unit`, `bought boolean` |
| `recipes` | Recipe library | `ingredients jsonb`, `instructions text[]`, `nutrition jsonb`, `prep_time`, `cook_time` |
| `meal_plans` | Daily meal schedule | `date`, `meal_type`, `recipe_id → recipes`, `cooked boolean` |

**Ingredients JSONB shape:**
```json
[{ "name": "string", "quantity": number, "unit": "string" }]
```

**Nutrition JSONB shape:**
```json
{ "calories": 0, "protein": 0, "carbs": 0, "fat": 0 }
```

---

### Health Tables

| Table | Purpose | Key Columns |
|-------|---------|------------|
| `workout_logs` | Exercise sessions | `exercises jsonb`, `duration`, `calories_burned` |
| `body_metrics` | Physical measurements | `weight`, `height`, `chest`, `waist`, `hips`, `body_fat` (all plain `numeric`, nullable) |
| `water_intakes` | Daily hydration | `date`, `amount integer` (ml) |
| `sleep_logs` | Sleep tracking | `bed_time`, `wake_time`, `duration numeric`, `quality integer` (1–10) |

**Exercises JSONB shape:**
```json
[{ "name": "string", "sets": number, "reps": number, "weight": number }]
```

---

### Learning Tables

| Table | Purpose | Key Columns |
|-------|---------|------------|
| `learning_topics` | Subject areas | `category`, `color`, `progress integer`, `target_date` |
| `study_sessions` | Study logs | `topic_id → learning_topics`, `duration integer` (minutes) |
| `vocabulary_items` | Flashcard vocabulary | `word`, `translation`, `language` (default `de`), `mastered boolean`, `review_count`, `next_review` |

---

### Career Tables

| Table | Purpose | Key Columns |
|-------|---------|------------|
| `job_applications` | Job tracker | `company`, `role`, `status` (saved/applied/interview/offer/rejected), `applied_date`, `deadline`, `remote boolean` |
| `projects` | Portfolio projects | `status` (planning/active/completed/archived), `technologies text[]`, `url`, `github_url` |
| `certificates` | Credentials | `issuer`, `issue_date`, `expiry_date`, `credential_id` |
| `career_skills` | Skill inventory | `level` (beginner/intermediate/advanced/expert), `years_of_experience numeric` |

---

### `documents`
Personal document vault.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `profile_id` | `uuid` FK | cascade |
| `title` | `text` | Required |
| `type` | `text` | Passport, ID, Visa, etc. |
| `issuer` | `text` | Optional |
| `issue_date` / `expiry_date` | `text` | ISO date |
| `document_number` | `text` | Optional |
| `country` | `text` | Optional |
| `file_url` | `text` | Supabase Storage URL |
| `status` | `text` | `valid`, `expiring`, `expired` |

---

## Conventions

1. **Never use non-UUID IDs** — `syncEngine` has a hard guard that skips upserts with invalid IDs
2. **All mutations go through syncEngine** — never write directly to Supabase from a component
3. **Numeric amounts use `numeric(12,2)`** — prevents floating-point precision bugs in finance
4. **Dates are ISO strings** — never store `Date` objects or Unix timestamps
5. **JSONB columns have documented shapes** — follow the shapes above when reading/writing

---

## Version 2 Migration Plan (Do Not Implement in v1)

```sql
-- Future: add spaces table
CREATE TABLE spaces (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Future: add space_id to all tables
ALTER TABLE tasks ADD COLUMN space_id UUID REFERENCES spaces(id);
-- profile_id becomes nullable, eventually removed
```

This migration is **intentionally deferred** until Version 2.0. See `PROJECT_CONSTITUTION.md §8`.
