# UI Guidelines

**Design System:** Custom CSS (Vanilla CSS + TailwindCSS v4)  
**Font:** Inter (Google Fonts) — weights 300, 400, 500, 600, 700, 800  
**Icon Library:** Lucide React  
**Charts:** Recharts

---

## Design Principles

1. **Feels like an OS, not a dashboard** — calm, focused, purposeful
2. **Every page answers: "What do I need to do now?"**
3. **Clean and minimal** — no visual noise, no decorative elements without purpose
4. **Fast** — interactions should feel instantaneous
5. **Consistent** — same patterns, same tokens, everywhere

---

## Theme System

Themes are applied via `data-theme` and `data-theme-style` HTML attributes.

### Theme Modes
| Value | Description |
|-------|-------------|
| `dark` (default) | Dark background |
| `light` | Light background |

### Theme Styles (Palettes)
| `data-theme-style` | Character |
|--------------------|-----------|
| `cozy-earth` *(default)* | Warm gold, clay, sage — earthy and focused |
| `slate-neutral` | Obsidian, stone, silver — minimal and precise |
| `fresh-vitality` | Deep teal-mint, emerald, sky blue — alive and energetic |
| `cyber-neon` | Dark navy, violet, electric blue — technical and sharp |

Each palette defines the full set of CSS variables below.

### Applying a Theme
```html
<!-- Dark + Cozy Earth (default) -->
<html data-theme="dark" data-theme-style="cozy-earth">

<!-- Light + Slate -->
<html data-theme="light" data-theme-style="slate-neutral">
```

### Feature Accent Overrides
Each route section gets a unique accent color applied via `data-feature`:

| `data-feature` | Accent |
|---------------|--------|
| `dashboard` / `planning` | Violet |
| `finance` | Green |
| `food` | Amber |
| `health` | Red / Pink |
| `learning` | Cyan |
| `career` | Blue |
| `documents` | Pink |
| `settings` | Blue / Violet |

---

## CSS Token Reference

All tokens are CSS custom properties on `:root` / `[data-theme-style]`.

### Background Tokens
| Token | Usage |
|-------|-------|
| `--bg-primary` | Page background |
| `--bg-secondary` | Slightly elevated surfaces (inputs, tab bars) |
| `--bg-card` | Card backgrounds |
| `--bg-card-hover` | Card hover state |
| `--bg-sidebar` | Sidebar background |

### Border Tokens
| Token | Usage |
|-------|-------|
| `--border` | Default subtle border |
| `--border-strong` | Stronger border for inputs, active states |

### Text Tokens
| Token | Usage |
|-------|-------|
| `--text-primary` | Main content |
| `--text-secondary` | Labels, captions, descriptions |
| `--text-muted` | Disabled, placeholder, empty states |

### Accent Tokens
| Token | Usage |
|-------|-------|
| `--accent-primary` | Current active accent (feature-dependent) |
| `--accent-primary-rgb` | RGB tuple for `rgba()` opacity mixing |
| `--accent-primary-light` | Lighter accent for hover states |
| `--accent-violet` | Violet |
| `--accent-blue` | Blue |
| `--accent-cyan` | Cyan |
| `--accent-green` | Green / Emerald |
| `--accent-amber` | Amber / Gold |
| `--accent-red` | Red / Danger |
| `--accent-pink` | Pink / Magenta |

### Gradient Tokens
| Token | Usage |
|-------|-------|
| `--gradient-primary` | Primary CTA gradient |
| `--gradient-success` | Success states |
| `--gradient-danger` | Error / destructive states |
| `--gradient-amber` | Warning states |

---

## Component Classes

All reusable UI components are defined as CSS utility classes in `src/index.css`. **Always use these classes — do not write one-off inline styles for things already covered.**

### Layout
```css
.card              /* Base card: bg-card, border, border-radius 16px, transition */
.card:hover        /* Elevated border + shadow */
.card-interactive  /* cursor:pointer */
.card-interactive:hover  /* translateY(-1px) lift */
.glass             /* Backdrop blur panel */
```

### Typography
```css
.section-title     /* 18px, weight 700, text-primary */
.section-subtitle  /* 13px, text-secondary */
.stat-value        /* 28px, weight 800, -0.5px tracking */
.stat-label        /* 12px, uppercase, letter-spacing 0.5px */
.gradient-text     /* gradient fill text */
.widget-title      /* 14px, weight 600, text-secondary, uppercase */
```

### Navigation
```css
.nav-item          /* Sidebar link: icon + text, with hover + active states */
.nav-item.active   /* accent-primary background tint + border */
```

### Buttons
```css
.btn               /* Base: flex, gap 8, padding 8/16, border-radius 10, font-size 14 */
.btn-primary       /* gradient-primary background + glow shadow */
.btn-secondary     /* bg-card-hover + border-strong */
.btn-ghost         /* Transparent, text-secondary */
.btn-danger        /* Red tinted background */
.btn-sm            /* Compact: padding 6/12, font-size 13 */
.btn-icon          /* Square icon button: padding 8 */
```

### Forms
```css
.input             /* Full-width, bg-secondary, border-strong, focus glow */
.label             /* 13px, weight 500, text-secondary, margin-bottom 6px */
textarea.input     /* min-height 80px, resize:vertical */
select.input       /* cursor:pointer */
```

### Feedback
```css
.badge             /* Pill badge: flex, gap 4, radius 999px, 12px, weight 500 */
.progress-bar      /* Track: height 6px, border-strong bg */
.progress-bar-fill /* Fill: gradient-primary, transition 0.5s cubic-bezier */
.alert-chip        /* Alert row: flex, icon + text, radius 12px */
.alert-chip-warning / -danger / -info / -success
.empty-state       /* Centered column, 48px padding */
.empty-state-icon  /* 56×56 icon container, bg-secondary, radius 16px */
```

### Modals
```css
.modal-backdrop    /* Fixed inset, blur(4px) backdrop, z-50, fadeIn animation */
.modal             /* bg-card, border-strong, radius 20px, max-w 520px, slideUp animation */
.modal-lg          /* max-w 720px */
```

### Tabs
```css
.tabs              /* bg-secondary pill container, radius 12px, padding 4px */
.tab               /* flex-1, radius 8px, 13px, weight 500 */
.tab.active        /* bg-card, text-primary, shadow */
```

### Widgets
```css
.widget-header     /* flex, space-between, margin-bottom 16px */
.widget-title      /* 14px, uppercase, letter-spacing */
.widget-icon       /* 32×32, radius 8px */
```

---

## Animations

| Keyframe | Effect | Used on |
|----------|--------|---------|
| `fadeIn` | opacity 0→1 | Modal backdrop |
| `slideUp` | opacity + translateY + scale | Modal content |
| `pulse-glow` | Box shadow pulse | Focus indicators, live elements |

Transition defaults:
- Interactive elements: `transition: all 0.15s ease`
- Progress bars: `transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1)`
- Cards: `transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease`

---

## Scrollbar

Custom minimal scrollbar: 6px wide/tall, transparent track, `--border-strong` thumb, hover `--text-muted`.

---

## Rules

1. **Never hardcode colors** — always use CSS tokens
2. **Never write new one-off button or card styles** — use the existing classes and extend if needed
3. **Never change `--bg-primary` or `--accent-primary` inline** — these are controlled by the theme system
4. **Respect the feature accent system** — `data-feature` attribute drives the per-page accent; don't override it manually
5. **Keep components calm** — avoid excessive animations, large shadows, or heavy gradients on content areas
6. **Maintain the Inter font** — do not introduce other typefaces
