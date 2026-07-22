# Definition of Done

A feature is not "done" when the UI works. It is done when every item in this checklist is satisfied.

> Use this checklist for every feature before marking it complete — whether in a PR review, a sprint review, or a personal check-in.

---

## The Checklist

### ✅ UI
- [ ] Component renders correctly in all expected states (empty, loading, error, populated)
- [ ] No layout breaks at standard viewport sizes (1280px, 1440px, >1600px)
- [ ] Uses existing CSS classes (`.card`, `.btn`, `.input`, etc.) — no one-off inline styles
- [ ] Dark and light themes both look correct
- [ ] All 4 theme palettes (cozy-earth, slate-neutral, fresh-vitality, cyber-neon) look correct
- [ ] Feature accent colour applied correctly via `data-feature` attribute

### ✅ State
- [ ] Data lives in the correct Zustand store (not in component `useState` for persistent data)
- [ ] Store actions handle the mutation completely — no business logic in the component
- [ ] State is correctly initialised with sensible defaults in the store

### ✅ Sync
- [ ] All mutations call the corresponding `syncEngine.push*()` method
- [ ] All deletions call the corresponding `syncEngine.delete*()` method
- [ ] Data is correctly mapped in `syncEngine.pullFromCloud()` if new tables were added
- [ ] `migrateLocalIds()` updated if new cross-referenced entities were added

### ✅ Validation
- [ ] Forms use `react-hook-form` + `zod` schema validation
- [ ] Required fields are enforced
- [ ] No invalid data can be submitted (empty strings where UUIDs expected, etc.)
- [ ] Error messages are user-friendly, not raw error objects

### ✅ Offline
- [ ] Feature works when Supabase is unreachable (data loads from localStorage)
- [ ] Zustand `persist` key is set correctly — data survives page refresh
- [ ] `safeSet` guard is used in `pullFromCloud()` for new tables (no empty-result wipe)

### ✅ Responsive
- [ ] Layout doesn't break at 1280px width (minimum target)
- [ ] Modals are scrollable on smaller screens
- [ ] No horizontal overflow

### ✅ Accessibility
- [ ] Interactive elements have visible focus states (`:focus-visible`)
- [ ] Buttons and inputs have accessible labels or `aria-label`
- [ ] Colour is not the only way information is conveyed (icons or text accompany colour indicators)
- [ ] Modals trap focus correctly

### ✅ Documentation
- [ ] If a new table was added: `DATABASE.md` updated
- [ ] If a new route was added: `ARCHITECTURE.md` routing table updated
- [ ] If a new module was added: `MODULE_CONTRACTS.md` updated
- [ ] If a significant architectural decision was made: ADR created in `docs/ADR/`
- [ ] `CHANGELOG.md` updated with what was added or changed

### ✅ Release Notes
- [ ] `CHANGELOG.md` entry written, filed under the correct version
- [ ] Feature described from the user's perspective, not in technical terms

---

## Future Additions *(v1.1+)*

- [ ] **Performance:** No unnecessary re-renders (check with React DevTools)
- [ ] **Animation:** Transitions match the 0.15s / 0.2s standard
- [ ] **Tests:** Unit tests for store actions, integration tests for sync behaviour

---

## Quick Pre-Commit Check

Before committing, confirm:

1. Does it look right in dark mode + cozy-earth?
2. Does the data survive a page refresh?
3. Does it survive offline (Supabase disconnected)?
4. Is `CHANGELOG.md` updated?
