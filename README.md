# Life OS

**An intelligent personal operating system for every aspect of your life.**

> Not another productivity app. An operating system for life.

---

## What is Life OS?

Life OS unifies Planning, Finance, Food, Health, Learning, Career, Documents, and Personal Knowledge into one connected ecosystem — powered by AI intelligence that feels invisible.

---

## Modules

| Module | Features |
|--------|---------|
| **Dashboard** | Mission, Life Pulse, Momentum, Coach Advice, Predictions, Daily Replay |
| **Planner** | Tasks, Goals, Calendar, Events |
| **Finance** | Income, Expenses, Budgets, Savings, Reports |
| **Food** | Inventory, Recipes, Meal Planner, Shopping List, Nutrition |
| **Health** | Workout, Body Metrics, Water, Sleep |
| **Learning** | Topics, Study Sessions, Vocabulary, German Learning |
| **Career** | Projects, Skills, Certificates, Job Applications |
| **Documents** | Personal vault, Expiry tracking, File storage |
| **Second Brain** | Notes, Ideas, Quick Capture *(coming soon)* |

---

## Tech Stack

- **Frontend:** React 19 · TypeScript · Vite 8
- **Styling:** TailwindCSS v4 · Custom CSS design system
- **State:** Zustand (persisted to localStorage)
- **Backend:** Supabase (Auth + PostgreSQL + RLS)
- **ORM:** Drizzle ORM
- **Charts:** Recharts
- **AI:** Google Gemini

---

## Getting Started

```bash
npm install
npm run dev
```

Requires a `.env` file with:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

---

## Documentation

All project docs live in [`/docs`](./docs/README.md):

| Doc | Purpose |
|-----|---------|
| [PROJECT_CONSTITUTION.md](./docs/PROJECT_CONSTITUTION.md) | ⭐ Vision, principles, version roadmap |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Tech stack, data flow, SyncEngine |
| [DATABASE.md](./docs/DATABASE.md) | All tables, columns, conventions |
| [UI_GUIDELINES.md](./docs/UI_GUIDELINES.md) | Theme system, CSS tokens, components |
| [AI_INSTRUCTIONS.md](./docs/AI_INSTRUCTIONS.md) | AI operating rules |
| [PRODUCT_ROADMAP.md](./docs/PRODUCT_ROADMAP.md) | v1.0 → v2.0 delivery plan |
| [FUTURE_IDEAS.md](./docs/FUTURE_IDEAS.md) | Ideas and explorations |

---

## Version

**v1.0** — Single-user personal operating system *(Active Development)*
