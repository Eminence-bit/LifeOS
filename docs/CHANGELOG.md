# Changelog

All notable changes to Life OS are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] — v1.0 🟡 Active Development

### Added
- Dashboard: Mission, Life Pulse, Momentum, Coach Advice, Predictions, Daily Replay, Quick Actions widgets
- Planner: Tasks with priority/status/tags, Goals with task linking, Calendar with events
- Finance: Income, Expenses, Budgets, Savings Goals, Reports
- Food: Inventory management with expiry tracking, Recipe library, Meal Planner, Shopping List
- Health: Workout logs, Body metrics tracking, Water intake logger, Sleep log
- Learning: Topics with progress tracking, Study sessions, Vocabulary flashcards (German)
- Career: Portfolio projects, Skills inventory, Certificates, Job application tracker
- Documents: Personal document vault with expiry tracking and file storage
- Settings: Theme (dark/light), Theme Style (cozy-earth, slate-neutral, fresh-vitality, cyber-neon), Currency, Timezone, Week start, Notifications, Quick Notes, Gemini API key
- Auth: Supabase authentication (sign up, sign in, sign out)
- Sync: Full bidirectional sync with Supabase on login; all stores persist locally via localStorage
- SyncEngine: `pullFromCloud()`, `push<Entity>()`, `delete<Entity>()` for all 26 tables
- SyncEngine: Legacy ID migration — upgrades short random IDs to valid UUIDs automatically
- Settings: `themeStyle` and `disableDynamicAccents` sync bug fixed (22 July 2026)
- Dashboard: Migrated from 8/4 asymmetric grid to balanced 6/6 column layout (22 July 2026)

### Architecture
- Drizzle ORM schema: 26 tables, all user-centric (`profile_id` FK)
- Zustand stores: 9 domain stores with `persist` middleware
- TailwindCSS v4 + custom CSS token design system
- Per-feature dynamic accent colors via `data-feature` HTML attribute
- 4 theme palettes with light and dark variants (8 total combinations)
- Gemini API key encrypted at rest using `lib/crypto.ts`

---

*Future versions will be dated and added above this line.*

---

## Versioning Convention

- **MAJOR** — Platform evolution (v1 → v2: Shared Spaces)
- **MINOR** — New modules or significant feature additions
- **PATCH** — Bug fixes, polish, performance (v1.0.x)
