# Architecture

**Version:** 1.0  
**Stack:** Vite 8 · React 19 · TypeScript 6 · TailwindCSS v4 · Supabase · Drizzle ORM · Zustand · TanStack Query · Recharts

---

## Overview

Life OS is a **single-page application** (SPA) with an offline-first, local-first data layer that syncs to Supabase when a user is authenticated. The architecture is intentionally flat and module-driven — each life domain owns its own store, page, and sync logic.

```
┌─────────────────────────────────────────────────┐
│                   Browser (SPA)                 │
│                                                 │
│  ┌──────────┐    ┌──────────────────────────┐   │
│  │ AppShell │───▶│   React Router Routes    │   │
│  └──────────┘    └──────────────────────────┘   │
│                           │                     │
│              ┌────────────┼────────────┐        │
│              ▼            ▼            ▼        │
│         Feature       Feature      Feature      │
│          Pages         Pages        Pages       │
│              │            │            │        │
│              └────────────┼────────────┘        │
│                           ▼                     │
│                    Zustand Stores               │
│                  (persist → localStorage)       │
│                           │                     │
│                           ▼                     │
│                      SyncEngine                 │
│                           │                     │
└───────────────────────────┼─────────────────────┘
                            ▼
                        Supabase
                  (Auth + PostgreSQL + RLS)
```

---

## Directory Structure

```
src/
├── App.tsx                  # Root router & auth gate
├── main.tsx                 # React 19 entry point
├── index.css                # Global design system (CSS variables)
│
├── app/
│   └── layout/
│       └── AppShell.tsx     # Sidebar + main layout wrapper
│
├── features/                # One folder per life domain
│   ├── auth/
│   ├── dashboard/
│   ├── planning/
│   ├── finance/
│   ├── food/
│   ├── health/
│   ├── learning/
│   ├── career/
│   ├── documents/
│   └── settings/
│
├── store/                   # Zustand stores (one per module)
│   ├── authStore.ts
│   ├── planningStore.ts
│   ├── financeStore.ts
│   ├── foodStore.ts
│   ├── healthStore.ts
│   ├── learningStore.ts
│   ├── careerStore.ts
│   ├── documentsStore.ts
│   └── settingsStore.ts
│
├── db/
│   └── schema.ts            # Drizzle ORM table definitions
│
├── lib/
│   ├── syncEngine.ts        # Cloud sync orchestrator
│   ├── supabase.ts          # Supabase client
│   ├── crypto.ts            # API key encryption/decryption
│   └── utils.ts             # Shared helpers (createBaseEntity, cn)
│
├── services/                # Future: domain service layer
├── types/                   # Shared TypeScript types
└── components/              # Shared UI components (future expansion)
```

---

## Key Architectural Patterns

### 1. Feature Modules
Each module is self-contained:
- **Page component** in `src/features/<module>/`
- **Zustand store** in `src/store/<module>Store.ts`
- **Supabase table** in `src/db/schema.ts`
- **Sync methods** in `src/lib/syncEngine.ts`

Modules do not import from each other's stores directly. Cross-module data flows through the dashboard's computed properties only.

### 2. Data Layer: Local-First with Cloud Sync
Data is stored in **localStorage** via Zustand `persist`, with Supabase as the source of truth when authenticated.

```
User Action
  → Zustand store update (immediate, local)
  → syncEngine.push<Entity>() (async, cloud)

On Auth:
  → syncEngine.pullFromCloud() (hydrate all stores from Supabase)
  → syncEngine.migrateLocalIds() (one-time UUID fix for legacy data)
```

The `safeSet` guard prevents empty Supabase results from wiping local data (e.g. tables not yet created, RLS mismatch).

### 3. SyncEngine
`src/lib/syncEngine.ts` is a **singleton class** (`export const syncEngine = new SyncEngine()`).

- `initialize()` — called once on app mount, hooks into Supabase auth state changes
- `pullFromCloud()` — fetches all tables and hydrates all Zustand stores
- `push<Entity>()` — called by store actions on every mutation
- `delete<Entity>()` — called by store actions on deletion
- `migrateLocalIds()` — one-time migration from legacy short IDs to proper UUIDs

> ⚠️ Do not modify `SyncEngine` without explicit approval. It is the most sensitive piece of infrastructure in the codebase.

### 4. Authentication
Handled by Supabase Auth. `authStore.ts` holds the session state. `App.tsx` gates the entire app behind `isAuthenticated`.

Unauthenticated users see `AuthPage`. Authenticated users get the full app with data synced from Supabase.

### 5. Settings
`settingsStore.ts` uses Zustand `persist` and pushes changes to both `settings` (Supabase) and `profiles` tables on every update.

The Gemini API key is **encrypted at rest** in Supabase using `lib/crypto.ts` before being stored.

---

## Routing

Defined in `App.tsx`:

| Path | Feature |
|------|---------|
| `/` | Dashboard |
| `/planning/*` | Planner (Tasks, Goals, Calendar, Events) |
| `/finance/*` | Finance (Income, Expenses, Budgets, Savings, Reports) |
| `/food/*` | Food (Inventory, Recipes, Meal Planning, Shopping) |
| `/health/*` | Health (Workout, Weight, Water, Sleep, Metrics) |
| `/learning/*` | Learning (Topics, Sessions, Vocabulary) |
| `/career/*` | Career (Projects, Skills, Certificates, Applications) |
| `/documents/*` | Documents (Personal docs, Expiry tracking) |
| `/settings` | Settings |

---

## Data Flow: Module Mutation Example

```
User creates a Task
  ↓
planningStore.addTask(task) — writes to Zustand (localStorage persisted)
  ↓
syncEngine.pushTask(task) — upserts to Supabase `tasks` table
  ↓
Next auth login: pullFromCloud() restores all tasks from Supabase
```

---

## Version 2 Migration Considerations

The current `profile_id` anchor on all tables will evolve to a `space_id` anchor in Version 2. This migration is planned and should not be pre-built into Version 1. The SyncEngine and store architecture is designed to accommodate this shift with minimal breaking changes.

---

## External Dependencies

| Dependency | Purpose |
|-----------|---------|
| `@supabase/supabase-js` | Auth + database client |
| `drizzle-orm` | Type-safe schema definitions |
| `zustand` | Client-side state management |
| `@tanstack/react-query` | Future: server state / API caching |
| `react-router-dom` | Client-side routing |
| `react-hook-form` + `zod` | Form handling + schema validation |
| `recharts` | Data visualisation |
| `lucide-react` | Icon library |
| `date-fns` | Date manipulation |
| `class-variance-authority` + `clsx` + `tailwind-merge` | Conditional classname utilities |
