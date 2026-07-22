# Module Contracts

Each module has a defined **contract** — what it owns, what it may read from other modules, and what it must never write to. This prevents accidental coupling and makes future expansion safe.

> **Rule:** Modules interact through data, never through direct store imports. Cross-module reads happen via computed values on the Dashboard, not by importing `useFinanceStore` inside `HealthPage`.

---

## Dashboard

**Owns:** Nothing persisted — it is a read layer only.

| Access | Modules |
|--------|---------|
| **Can read** | All modules (aggregates data for widgets) |
| **Cannot write** | Any module |

**Purpose:** Surface computed insights from all modules. Mission, Life Pulse, Momentum, Coach Advice, Predictions, Replay are all derived from data owned by other modules.

---

## Planner

**Owns:** Tasks · Goals · Events · Calendar entries

| Access | Modules |
|--------|---------|
| **Can read** | Finance (for bill deadlines), Health (for workout schedule), Learning (for study sessions) |
| **Cannot write** | Finance · Health · Learning · Career · Documents · Food |

---

## Finance

**Owns:** Expenses · Incomes · Budgets · Savings Goals

| Access | Modules |
|--------|---------|
| **Can read** | Planner (for bill-linked tasks) |
| **Cannot write** | Planner · Health · Learning · Career · Documents · Food |

---

## Food

**Owns:** Inventory · Recipes · Meal Plans · Shopping List

| Access | Modules |
|--------|---------|
| **Can read** | Finance (to flag grocery budget impact) |
| **Cannot write** | Finance · Planner · Health · Learning · Career · Documents |

**Notes:**
- Shopping list items prefixed `auto-*` are derived from meal plans — they are never written to Supabase
- `meal_plans.recipe_id` is the only cross-entity FK within the Food module (recipes → meal plans)

---

## Health

**Owns:** Workout Logs · Body Metrics · Water Intakes · Sleep Logs

| Access | Modules |
|--------|---------|
| **Can read** | Planner (for workout-linked events) |
| **Cannot write** | Planner · Finance · Food · Learning · Career · Documents |

**Notes:** Health data (weight, sleep, body fat) is personal and will **never** be shareable in v2 Spaces.

---

## Learning

**Owns:** Learning Topics · Study Sessions · Vocabulary Items

| Access | Modules |
|--------|---------|
| **Can read** | Planner (for study session scheduling) |
| **Cannot write** | Planner · Finance · Food · Health · Career · Documents |

**Notes:**
- `study_sessions.topic_id` → `learning_topics.id` is the only cross-entity FK within Learning
- `vocabulary_items.topic_id` → `learning_topics.id` is the same

---

## Career

**Owns:** Projects · Skills · Certificates · Job Applications

| Access | Modules |
|--------|---------|
| **Can read** | Planner (for deadline-linked applications) |
| **Cannot write** | Planner · Finance · Food · Health · Learning · Documents |

**Notes:** Career data is personal and will **never** be shareable in v2 Spaces.

---

## Documents

**Owns:** Personal Documents (vault entries + file URLs)

| Access | Modules |
|--------|---------|
| **Can read** | Career (certificates cross-reference), Finance (bill documents) |
| **Cannot write** | Any module |

**Notes:**
- File storage is Supabase Storage, URLs stored in `documents.file_url`
- Expiry tracking is computed from `expiry_date`, not a separate table

---

## Settings

**Owns:** User preferences · Profile data · Gemini API key

| Access | Modules |
|--------|---------|
| **Can read** | All modules (currency, timezone, theme) |
| **Cannot write** | Any module — only the user can change settings |

---

## Second Brain *(Planned)*

**Owns:** Notes · Ideas · Quick Captures

| Access | Modules |
|--------|---------|
| **Can read** | All modules (for linking notes to tasks, goals, etc.) |
| **Cannot write** | Any module |

---

## Contract Enforcement Rules

1. Never `import useFinanceStore from '@/store/financeStore'` inside a non-Finance feature page
2. Cross-module data on the Dashboard is passed as props or read via a dedicated dashboard selector, not by importing multiple stores into the same component
3. New modules must define their contract here before development begins
4. Any intentional cross-module coupling must be documented here as an exception with a justification
