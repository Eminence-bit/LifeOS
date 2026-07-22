# Product Principles

These principles are the filter for every feature decision. They are distinct from the Constitution — the Constitution defines *what* Life OS is, these principles define *why a feature earns its place*.

---

## The Feature Test

**Every feature must satisfy at least one of these:**

| Principle | Question to ask |
|-----------|----------------|
| ⏱️ **Save Time** | Does this reduce time spent on a recurring task? |
| 💰 **Save Money** | Does this help the user spend less or save more? |
| 💪 **Improve Health** | Does this directly support physical or mental wellbeing? |
| 🧠 **Improve Learning** | Does this help the user grow their knowledge or skills? |
| 😌 **Reduce Stress** | Does this remove friction, uncertainty, or cognitive load? |
| 👁️ **Increase Awareness** | Does this surface information the user didn't know they needed? |
| 🤖 **Automate Repetition** | Does this eliminate something the user has to do manually and repeatedly? |

**If a feature satisfies none of these, it probably doesn't belong in Life OS.**

---

## Applying the Test — Examples

| Feature | Principle(s) it satisfies |
|---------|--------------------------|
| Task due-date reminders | ⏱️ Save Time · 😌 Reduce Stress |
| Budget tracking | 💰 Save Money · 👁️ Increase Awareness |
| Meal planner with inventory | ⏱️ Save Time · 💰 Save Money |
| Sleep quality tracking | 💪 Improve Health · 👁️ Increase Awareness |
| Vocabulary spaced repetition | 🧠 Improve Learning · 🤖 Automate Repetition |
| Document expiry alerts | 😌 Reduce Stress · 👁️ Increase Awareness |
| Coach Advice (AI) | 😌 Reduce Stress · 👁️ Increase Awareness · 💪 Improve Health |
| Predictions dashboard | 👁️ Increase Awareness · 😌 Reduce Stress |
| Morning Briefing | ⏱️ Save Time · 👁️ Increase Awareness |

---

## Design Principles

Beyond features, the *design* of Life OS must also satisfy these:

1. **Calm over exciting** — The app should lower the user's heart rate, not raise it.
2. **Surfaced, not buried** — The right information appears without the user having to go looking.
3. **One action per moment** — Each screen answers: "What do I need to do right now?"
4. **Invisible intelligence** — AI doesn't announce itself. It just makes things smarter.
5. **No feature clutter** — A feature that adds UI complexity without clear value is a cost, not an asset.

---

## When to Say No

Use this checklist before approving a new feature:

- [ ] Does it satisfy at least one of the 7 principles?
- [ ] Does it fit within the current version scope?
- [ ] Does it reuse existing components and patterns?
- [ ] Can a user discover it without a tutorial?
- [ ] Does it maintain the calm, focused feel of the product?

If any answer is "no", the feature needs to be rethought or deferred.
