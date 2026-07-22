# AI Instructions

These instructions apply whenever an AI agent (me, or any other) is working on the Life OS codebase. They are derived from the `PROJECT_CONSTITUTION.md` and `AI_GUARDRAILS.md`, and expanded with codebase-specific operating rules.

---

## Identity & Terminology

Always use the canonical Life OS vocabulary. Never rename, rephrase, or invent alternative names for these concepts without explicit user approval:

| Canonical Term | Do NOT use |
|---------------|-----------|
| **Life Pulse** | "health score", "wellness index" |
| **Momentum** | "streak", "productivity score" |
| **Replay** | "daily summary", "recap" |
| **Second Brain** | "notes", "knowledge base" |
| **Coach Advice** | "AI tips", "suggestions panel" |
| **Predictions** | "forecast", "analytics" |
| **Mission** | "daily goal", "focus" |
| **Quick Actions** | "shortcuts", "action buttons" |

---

## Hard Rules (Never Violate Without Explicit Approval)

1. **Do not modify `src/lib/syncEngine.ts`** without the user explicitly requesting it. This is the most sensitive file in the codebase.
2. **Do not change the Drizzle schema** (`src/db/schema.ts`) or suggest database migrations without explicit instruction.
3. **Do not rename any module, route, or store** without approval.
4. **Do not introduce Version 2 concepts** (Spaces, Members, Roles, Permissions, shared anything) into Version 1 code.
5. **Do not switch state management libraries.** Zustand is the standard. Do not suggest MobX, Redux, Jotai, or Context API.
6. **Do not replace the CSS design system** with Tailwind utility classes, styled-components, or CSS Modules. Extend `index.css` instead.
7. **Do not hardcode colors, fonts, or spacing.** Always use CSS tokens (`--accent-primary`, `--bg-card`, etc.).
8. **Do not add new npm dependencies** without flagging it first. Especially avoid large libraries (e.g., full date pickers, rich text editors) unless the added value is clearly justified.

---

## Architecture Rules

- **Feature boundaries are sacred.** Stores do not import from other stores. Pages do not import from other feature pages.
- **All data mutations must go through the Zustand store**, which then calls `syncEngine.push<Entity>()`. Never write to Supabase directly from a component.
- **Business logic belongs in the store**, not in components. Components are for rendering only.
- **All new tables must follow the schema conventions** in `DATABASE.md`: UUID PKs, `profile_id` FK, `created_at` / `updated_at`, ISO date strings for date fields.
- **New features must follow the existing store pattern**: `create<Name>Store` with `persist` middleware, exporting `use<Name>Store`.

---

## Development Workflow Rules

- **Prefer extending over replacing.** If a component exists, add a prop or a variant — don't rewrite it.
- **Never break the existing feature set** when adding new features.
- **Always check `index.css` before writing new CSS.** The class you need probably already exists.
- **New components should use existing CSS classes** (`.card`, `.btn`, `.input`, `.badge`, `.modal`, etc.) before reaching for TailwindCSS utilities.
- **Maintain backward compatibility.** If you change a store's state shape, account for data already in localStorage.

---

## AI Feature Rules

- AI features use the Gemini API via the `geminiApiKey` stored in `settingsStore`.
- AI should feel **ambient and invisible** — not a chatbot panel, not a separate AI section.
- AI output appears within existing module UI: insight cards, advice panels, prediction widgets.
- Do not build standalone "AI chat" UIs unless explicitly instructed.
- AI features belong on the Dashboard (Mission, Life Pulse, Momentum, Coach Advice, Predictions, Replay) and within module pages as contextual suggestions.

---

## Version Control

- **v1.0:** Feature complete (current)
- **v1.1:** Polish, performance, accessibility
- **v1.2:** Architecture prep for v2
- **v2.0:** Shared Spaces (multi-user)

When working on a feature, always confirm which version it belongs to. If it sounds like a v1.2 or v2 feature, stop and ask.

---

## What to Do When Uncertain

- If you're unsure whether a change is in scope for Version 1 → **ask, don't assume**.
- If a change touches `syncEngine.ts`, `schema.ts`, or `App.tsx` routing → **highlight this explicitly** before making the change.
- If a design decision isn't covered by `UI_GUIDELINES.md` → **match existing patterns** from the nearest similar component.
- If you're about to add a new npm package → **state what it does and why it's needed**, wait for approval.
