# Product Roadmap

> This roadmap is derived from `PROJECT_CONSTITUTION.md §7`. It tracks the delivery plan at the feature level.

---

## Version 1.0 — Personal OS (Current)

**Status:** 🟡 Active Development  
**Goal:** Feature Complete Personal Operating System

### Modules
| Module | Status |
|--------|--------|
| Dashboard (Mission, Life Pulse, Momentum, Coach, Predictions, Replay) | 🟡 In Progress |
| Planner (Tasks, Goals, Calendar, Events) | 🟡 In Progress |
| Finance (Income, Expenses, Budgets, Savings, Reports) | 🟡 In Progress |
| Food (Inventory, Recipes, Meal Planner, Shopping, Nutrition) | 🟡 In Progress |
| Health (Workout, Weight, Water, Sleep, Body Metrics) | 🟡 In Progress |
| Learning (Topics, Study Sessions, Vocabulary, German) | 🟡 In Progress |
| Career (Projects, Skills, Certificates, Applications) | 🟡 In Progress |
| Documents (Vault, Expiry Tracking, Storage) | 🟡 In Progress |
| Second Brain (Notes, Ideas, Quick Capture) | ⚪ Planned |
| Focus Mode | ⚪ Planned |
| AI Intelligence (Ambient, not chatbot) | 🟡 In Progress |

---

## Version 1.1 — Polish & Stability

**Goal:** Make what exists feel exceptional.  
**No new modules. No architecture changes.**

| Area | Work |
|------|------|
| Performance | Lazy loading, memoisation, render optimisation |
| Animations | Page transitions, micro-interactions, loading states |
| Accessibility | ARIA labels, keyboard nav, focus management |
| Offline | Better offline UX, sync conflict handling |
| Widgets | Configurable dashboard widgets |
| Dashboard | Improved layout options, personalisation |
| Calendar | Better week/month views, drag-drop |
| Reports | Richer Finance and Health reports |
| AI Insights | More data-driven, context-aware suggestions |
| Bug Fixes | Address any accumulated bugs from v1.0 |

---

## Version 1.2 — Architecture Evolution

**Goal:** Stabilise internals for Version 2 expansion.  
**App behaviour stays identical. No user-facing feature changes (besides notifications).**

| Area | Work |
|------|------|
| Backend Cleanup | Dead code removal, service extraction |
| API Versioning | Prepare stable internal API contracts |
| Service Layer | Extract syncEngine logic into domain services |
| Event System | Internal event bus for cross-module communication |
| Database Optimisation | Indexes, query tuning |
| Background Jobs | Deferred heavy computations |
| Caching | Memoised selectors, smart re-fetch |
| Realtime | Supabase realtime subscriptions for live updates |
| Notification Service | In-app notification centre (expiry, bills, study reminders) |
| Developer Documentation | Internal docs, code comments, ADRs |

---

## Version 2.0 — Shared Spaces

**Goal:** Evolve from personal OS to collaborative household/team OS.  
**This is a major platform evolution, not a feature addition.**

| Feature | Description |
|---------|-------------|
| Spaces | New top-level entity; replaces `profile_id` anchor |
| Members | Invite people to a Space |
| Roles & Permissions | Owner, Admin, Member, Viewer |
| Shared Dashboard | Space-level dashboard |
| Shared Planner | Tasks and goals visible to Space members |
| Shared Budget | Split expenses, shared budgets |
| Shared Inventory | Household pantry |
| Shared Meal Planning | Family meal schedule |
| Shared Grocery | Collaborative shopping list |
| Chore Management | Assignment, tracking, reminders |
| Responsibilities | Recurring ownership of tasks |
| Voting | Group decisions on shared items |
| Activity Feed | Real-time Space activity log |
| Space Types | Family, Apartment, Roommates, Couples, Teams |

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Complete |
| 🟡 | In Progress |
| ⚪ | Planned |
| 🔵 | Under Consideration |
