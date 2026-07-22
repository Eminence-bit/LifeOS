# Future Ideas — Integrations

Ideas for connecting Life OS to the outside world. These are explorations, not commitments.

---

## Data In

| Idea | What it does |
|------|-------------|
| **Google Calendar sync** | Two-way event sync |
| **Bank statement import** | Parse CSV exports for automatic expense logging |
| **Apple Health / Google Fit import** | Pull workout, steps, heart rate data into Health module |
| **Barcode scanner (Food)** | Scan packaged foods to add to inventory with nutrition data |
| **Garmin / Fitbit / Whoop** | Sync sleep, HRV, workout data automatically |

## Capture

| Idea | What it does |
|------|-------------|
| **WhatsApp capture** | Forward a message → Life OS adds it to Second Brain or tasks |
| **Email-to-task** | Forward an email → Life OS extracts the action item |
| **Browser extension** | Clip articles, prices, jobs directly into the relevant module |
| **Voice capture** | Record a thought → auto-transcribed into Quick Capture |

## Data Out

| Idea | What it does |
|------|-------------|
| **Public API** | Let third-party apps read/write Life OS data with permission |
| **Webhook support** | Trigger external actions on Life OS events (e.g., task completed → Slack message) |
| **Export to CSV/PDF** | Download any module's data for backup or sharing |

## Constraints

- All integrations must be opt-in with explicit user approval
- Raw credentials (bank passwords, etc.) are never stored — OAuth or CSV-only
- Integrations are a v1.2+ concern — not in v1.0
