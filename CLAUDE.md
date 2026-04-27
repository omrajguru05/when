# claude.md: WHEN Design System

## Overview

WHEN is a lightweight, open-source scheduling platform for creators who value simplicity and control. The design language reflects this philosophy: clean, purposeful, and built for clarity. No unnecessary decoration, no bloat, just direct communication.

**Design Principle:** Form follows function. Every visual choice serves the user's primary goal: booking or managing appointments with zero friction.

---

## Brand Identity

### Brand Essence
WHEN removes friction from scheduling. It's fast, trustworthy, and designed for people who respect their time (and yours).

### Core Values
- **Lightweight:** Minimal aesthetic, minimal code
- **Transparent:** No hidden fees, no dark patterns
- **Controlable:** Users own their design and data
- **Direct:** Clear information hierarchy, no ambiguity

---

## Color Palette

### Primary Colors

**Slate Base**
```css
--color-slate-50: #f8fafc
--color-slate-100: #f1f5f9
--color-slate-200: #e2e8f0
--color-slate-300: #cbd5e1
--color-slate-400: #94a3b8
--color-slate-500: #64748b
--color-slate-600: #475569
--color-slate-700: #334155
--color-slate-800: #1e293b
--color-slate-900: #0f172a
```

### Accent Color (Default Brand Color)
```css
--color-accent-primary: #3b82f6     /* Bright Blue */
--color-accent-light: #dbeafe       /* Light Blue */
--color-accent-dark: #1e40af        /* Dark Blue */
```

### Semantic Colors

**Success (Booking Confirmed)**
```css
--color-success: #10b981
--color-success-light: #d1fae5
--color-success-dark: #047857
```

**Warning (Conflicts, Limited Slots)**
```css
--color-warning: #f59e0b
--color-warning-light: #fef3c7
--color-warning-dark: #d97706
```

**Error (Cancellation, Issues)**
```css
--color-error: #ef4444
--color-error-light: #fee2e2
--color-error-dark: #dc2626
```

**Neutral (Disabled, Muted)**
```css
--color-neutral: #6b7280
--color-neutral-light: #f3f4f6
--color-neutral-dark: #1f2937
```

### Usage Notes
- **Primary Accent:** Buttons, links, selected states, booking confirmation
- **Slate:** Text, backgrounds, borders, structure
- **Success/Warning/Error:** Semantic feedback only; use sparingly
- **Event Type Colors:** Allow users to pick from a curated 8-color palette per event type

---

## Typography

### Font Stack

**Display Font (Headlines, Hero)**
```css
--font-display: 'Geist Mono', 'Courier New', monospace;
font-weight: 600;
letter-spacing: -0.02em;
```
Use for: Page titles, event type names, hero sections. Monospace gives technical, trustworthy feel.

**Heading Font (Section Headers)**
```css
--font-heading: 'Inter Var', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
font-weight: 600;
letter-spacing: -0.01em;
```
Use for: Dashboard section titles, form labels, card headers.

**Body Font (Content, UI)**
```css
--font-body: 'Inter Var', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
font-weight: 400;
line-height: 1.6;
```
Use for: Paragraph text, descriptions, form fields, notifications.

**Code Font (Inline Code, API Examples)**
```css
--font-mono: 'IBM Plex Mono', 'Courier New', monospace;
font-weight: 400;
```
Use for: Booking confirmation codes, slug references, documentation snippets.

### Type Scale

| Use Case | Size | Weight | Line Height | Letter Spacing |
|----------|------|--------|-------------|-----------------|
| Hero Title | 3.5rem (56px) | 700 | 1.1 | -0.02em |
| Page Title | 2.5rem (40px) | 700 | 1.2 | -0.02em |
| Section Header | 1.75rem (28px) | 600 | 1.3 | -0.01em |
| Subheader | 1.25rem (20px) | 600 | 1.4 | -0.01em |
| Body Large | 1.125rem (18px) | 400 | 1.6 | 0 |
| Body Regular | 1rem (16px) | 400 | 1.6 | 0 |
| Body Small | 0.875rem (14px) | 400 | 1.5 | 0 |
| Label | 0.75rem (12px) | 500 | 1.4 | 0.05em |
| Caption | 0.75rem (12px) | 400 | 1.4 | 0 |

### Typography Hierarchy

**Example: Booking Confirmation Page**
```
Hero Title (3.5rem, Geist Mono, 700)
"Your booking is confirmed"

Body Large (1.125rem, Inter, 400)
Event details, timing, and next steps

Label (0.75rem, Inter, 500, UPPERCASE)
"Event Details"

Body Regular (1rem, Inter, 400)
Event name, date, time, organizer info
```

---

## Spacing and Layout

### Spacing Scale
```css
--space-xs: 0.25rem (4px)
--space-sm: 0.5rem (8px)
--space-md: 1rem (16px)
--space-lg: 1.5rem (24px)
--space-xl: 2rem (32px)
--space-2xl: 3rem (48px)
--space-3xl: 4rem (64px)
```

### Grid and Layout
- **Maximum Content Width:** 1200px
- **Sidebar Width:** 280px (dashboard)
- **Card Padding:** 1.5rem (24px)
- **Section Spacing:** 3rem (48px)
- **Button Height:** 2.5rem (40px)
- **Input Height:** 2.5rem (40px)

### Spacing Rules
- Use consistent spacing in multiples of 4px
- Group related elements with smaller gaps (0.5rem–1rem)
- Separate sections with larger gaps (2rem–3rem)
- Never use negative margins; use flexbox/grid gaps instead

---

## Components

### Buttons

**Primary Button**
```css
background-color: var(--color-accent-primary);
color: white;
padding: 0.625rem 1.5rem;
border-radius: 0.5rem;
border: none;
font-weight: 600;
font-size: 1rem;
cursor: pointer;
transition: background-color 0.2s ease;

&:hover {
  background-color: var(--color-accent-dark);
}

&:active {
  transform: scale(0.98);
}

&:disabled {
  background-color: var(--color-slate-300);
  cursor: not-allowed;
}
```

**Secondary Button**
```css
background-color: transparent;
color: var(--color-accent-primary);
border: 1px solid var(--color-slate-300);
padding: 0.625rem 1.5rem;
border-radius: 0.5rem;
font-weight: 600;
font-size: 1rem;
cursor: pointer;
transition: border-color 0.2s ease, background-color 0.2s ease;

&:hover {
  background-color: var(--color-slate-50);
  border-color: var(--color-accent-primary);
}

&:active {
  transform: scale(0.98);
}
```

**Tertiary Button / Link**
```css
background: none;
border: none;
color: var(--color-accent-primary);
font-weight: 600;
cursor: pointer;
text-decoration: underline;
text-decoration-color: var(--color-accent-light);
text-underline-offset: 0.25rem;

&:hover {
  text-decoration-color: var(--color-accent-primary);
}
```

### Form Inputs

**Text Input**
```css
width: 100%;
padding: 0.625rem 1rem;
border: 1px solid var(--color-slate-300);
border-radius: 0.5rem;
font-size: 1rem;
font-family: var(--font-body);
transition: border-color 0.2s ease, box-shadow 0.2s ease;

&:focus {
  outline: none;
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 3px var(--color-accent-light);
}

&:disabled {
  background-color: var(--color-slate-100);
  cursor: not-allowed;
  color: var(--color-slate-400);
}

&::placeholder {
  color: var(--color-slate-400);
}
```

**Select Dropdown**
```css
appearance: none;
width: 100%;
padding: 0.625rem 1rem;
padding-right: 2.5rem;
border: 1px solid var(--color-slate-300);
border-radius: 0.5rem;
font-size: 1rem;
font-family: var(--font-body);
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
background-repeat: no-repeat;
background-position: right 1rem center;
cursor: pointer;
transition: border-color 0.2s ease;

&:focus {
  outline: none;
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 3px var(--color-accent-light);
}
```

**Checkbox**
```css
width: 1.25rem;
height: 1.25rem;
cursor: pointer;
accent-color: var(--color-accent-primary);
border: 1px solid var(--color-slate-300);
border-radius: 0.25rem;
transition: border-color 0.2s ease;

&:hover {
  border-color: var(--color-accent-primary);
}

&:focus {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 0.25rem;
}
```

### Cards and Containers

**Card**
```css
background-color: white;
border: 1px solid var(--color-slate-200);
border-radius: 0.75rem;
padding: 1.5rem;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
transition: box-shadow 0.2s ease, border-color 0.2s ease;

&:hover {
  border-color: var(--color-slate-300);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

**Card (Interactive / Selectable)**
```css
/* Add to card above */
cursor: pointer;
border: 2px solid var(--color-slate-200);

&.selected {
  border-color: var(--color-accent-primary);
  background-color: var(--color-accent-light);
}
```

### Time Slot Component

**Available Slot (Bookable)**
```css
display: inline-block;
padding: 0.75rem 1rem;
background-color: var(--color-accent-light);
border: 1px solid var(--color-accent-primary);
border-radius: 0.5rem;
font-weight: 500;
color: var(--color-accent-dark);
cursor: pointer;
transition: all 0.2s ease;

&:hover {
  background-color: var(--color-accent-primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

&:active {
  transform: translateY(0);
}
```

**Unavailable Slot (Blocked)**
```css
display: inline-block;
padding: 0.75rem 1rem;
background-color: var(--color-slate-100);
border: 1px solid var(--color-slate-300);
border-radius: 0.5rem;
font-weight: 500;
color: var(--color-slate-400);
cursor: not-allowed;
```

**Selected Slot**
```css
/* Use Available Slot styles but with selected state */
background-color: var(--color-accent-primary);
color: white;
border-color: var(--color-accent-dark);
box-shadow: 0 0 0 3px var(--color-accent-light);
```

### Badge / Tag

**Badge**
```css
display: inline-block;
padding: 0.25rem 0.75rem;
background-color: var(--color-slate-100);
color: var(--color-slate-700);
border-radius: 9999px;
font-size: 0.75rem;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.05em;
```

**Badge (Success)**
```css
/* Add to badge above */
background-color: var(--color-success-light);
color: var(--color-success-dark);
```

**Badge (Warning)**
```css
/* Add to badge above */
background-color: var(--color-warning-light);
color: var(--color-warning-dark);
```

### Notification / Alert

**Alert Container**
```css
padding: 1rem;
border-radius: 0.5rem;
border-left: 4px solid;
background-color: var(--color-slate-50);
border-color: var(--color-slate-300);
display: flex;
gap: 1rem;
align-items: flex-start;

&.success {
  border-color: var(--color-success);
  background-color: var(--color-success-light);
}

&.warning {
  border-color: var(--color-warning);
  background-color: var(--color-warning-light);
}

&.error {
  border-color: var(--color-error);
  background-color: var(--color-error-light);
}
```

**Alert Text**
```css
font-size: 0.875rem;
font-weight: 500;
color: var(--color-slate-700);

.success & {
  color: var(--color-success-dark);
}

.warning & {
  color: var(--color-warning-dark);
}

.error & {
  color: var(--color-error-dark);
}
```

---

## Interactions and Animations

### Micro-interactions

**Button Click**
```css
transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);

&:active {
  transform: scale(0.95);
}
```

**Link Hover**
```css
transition: color 0.2s ease, text-decoration-color 0.2s ease;
```

**Input Focus**
```css
transition: border-color 0.2s ease, box-shadow 0.2s ease;
```

### Page Transitions

**Fade In (New Page Load)**
```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

animation: fadeIn 0.3s ease-out;
```

**Slide In (Calendar / Sidebar)**
```css
@keyframes slideInUp {
  from {
    transform: translateY(1rem);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
```

**Stagger Child Elements**
```css
.slot-container > div {
  animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation-fill-mode: both;
}

.slot-container > div:nth-child(1) { animation-delay: 0.05s; }
.slot-container > div:nth-child(2) { animation-delay: 0.1s; }
.slot-container > div:nth-child(3) { animation-delay: 0.15s; }
/* ... and so on */
```

### Loading States

**Skeleton Loader**
```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-slate-200) 25%,
    var(--color-slate-100) 50%,
    var(--color-slate-200) 75%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
  border-radius: 0.5rem;
}
```

---

## Accessibility Standards

### Color Contrast
- All text must meet WCAG AA standards (4.5:1 for body, 3:1 for large text)
- Do not rely on color alone to convey meaning (use icons, text, or patterns)

### Focus States
- All interactive elements have visible focus states
- Focus indicator is at least 3px, with sufficient contrast
- Use `focus-visible` for cleaner keyboard navigation

### Semantic HTML
- Use proper heading hierarchy (h1 > h2 > h3, etc.)
- Form labels associated with inputs via `htmlFor` or wrapping
- Buttons and links are semantically correct (not divs)

### Screen Reader Support
- Add `aria-label` to icon-only buttons
- Use `aria-live` for real-time updates (booking confirmation)
- Provide alt text for all images
- Skip to main content link on all pages

---

## Dark Mode (Future, v1.5+)

When dark mode support is added:

**Dark Palette**
```css
--color-bg-primary: var(--color-slate-900);
--color-bg-secondary: var(--color-slate-800);
--color-text-primary: var(--color-slate-50);
--color-text-secondary: var(--color-slate-300);
--color-border: var(--color-slate-700);
```

**Preserve Accent Colors**
Accent colors (blue, green, red) remain the same for consistency.

---

## Installation and Usage

### Setup
```bash
npm install boneyard-js
npx skills add omrajguru05/om-design-skill
```

### CSS Variables in Next.js
```css
/* app/globals.css */
:root {
  --color-accent-primary: #3b82f6;
  --font-display: 'Geist Mono', monospace;
  --font-heading: 'Inter Var', sans-serif;
  --font-body: 'Inter Var', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;
  /* ... all colors and spacing from above */
}

@supports (font-variation-settings: normal) {
  :root {
    --font-heading: 'Inter Var', sans-serif;
    --font-body: 'Inter Var', sans-serif;
  }
}
```

### Component Example (React)
```jsx
'use client';

export default function BookingButton({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-6 py-2.5 bg-accent-primary text-white font-semibold rounded-lg hover:bg-accent-dark active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200"
    >
      Confirm Booking
    </button>
  );
}
```

### Tailwind Configuration (if used)
```javascript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        accent: {
          primary: 'var(--color-accent-primary)',
          light: 'var(--color-accent-light)',
          dark: 'var(--color-accent-dark)',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        heading: 'var(--font-heading)',
        body: 'var(--font-body)',
        mono: 'var(--font-mono)',
      },
      spacing: {
        xs: 'var(--space-xs)',
        sm: 'var(--space-sm)',
        md: 'var(--space-md)',
        lg: 'var(--space-lg)',
        xl: 'var(--space-xl)',
        '2xl': 'var(--space-2xl)',
        '3xl': 'var(--space-3xl)',
      },
    },
  },
};
```

---

## Design Decisions

### Why Monospace for Headlines?
Monospace typefaces (Geist Mono) convey precision and technical confidence. WHEN is designed for people who code or value systems. Monospace in headlines creates a distinctive brand voice without being loud.

### Why Blue as Primary Accent?
Blue (#3b82f6) is trustworthy, calm, and universally accessible. It's the default accent for critical interactions (booking confirmation, primary CTAs). Event types can override with custom colors.

### Why Minimal Animations?
Every animation serves a purpose: feedback on interaction, clarity on state change, or delight on key moments (booking confirmation). Gratuitous animations slow down the experience and feel untrustworthy.

### Why 40px Buttons?
Touch targets should be at least 44px on mobile, 40px minimum on desktop. This follows WCAG standards and feels substantial without appearing clunky.

### Why 0.75rem Border Radius?
Sharp corners feel modern and precise (technical). Rounded corners (16px+) feel playful. 0.75rem (12px) strikes a balance: friendly but professional.

---

## Files and References

- **Boneyard.js:** https://github.com/your-org/boneyard-js (component library)
- **Om Design Skill:** `npx skills add omrajguru05/om-design-skill`
- **Tailwind CSS:** https://tailwindcss.com
- **Shadcn/ui:** https://ui.shadcn.com (for component inspiration)
- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | April 26, 2026 | Initial design system (MVP) |

---

# boneyard-js

Pixel-perfect skeleton loading screens, extracted directly from your real DOM. No manual measurement, no hand-tuned placeholders.

## How it works

1. Wrap your component with `<Skeleton>` and give it a `name`
2. Optionally add a `fixture` prop with mock data for the build step
3. Run `npx boneyard-js build` — it crawls your app, snapshots every named Skeleton, and writes `.bones.json` files + a `registry.js`
4. Add `import './bones/registry'` once in your app entry — every Skeleton auto-resolves its bones by name

## Install

```
npm install boneyard-js
```

## Quick start

```tsx
// app/layout.tsx — import the registry once (must be client-side for Next.js)
import './bones/registry'
```

```tsx
import { Skeleton } from 'boneyard-js/react'

function BlogPage() {
  const { data, isLoading } = useFetch('/api/post')
  return (
    <Skeleton
      name="blog-card"
      loading={isLoading}
      fixture={<BlogCard data={MOCK_DATA} />}
    >
      {data && <BlogCard data={data} />}
    </Skeleton>
  )
}
```

## The fixture prop

Apps often have authentication or user-specific data that isn't available during the build step. The `fixture` prop provides mock content that only renders when the CLI is capturing — never in production.

```tsx
<Skeleton
  name="dashboard"
  loading={isLoading}
  fixture={<Dashboard data={{
    title: "Sample Title",
    stats: [{ label: "Revenue", value: "$12.3k" }]
  }} />}
>
  {data && <Dashboard data={data} />}
</Skeleton>
```

The mock data doesn't need to be real — it just needs to produce the same layout shape (same number of cards, similar text lengths, etc.).

## Generate the bones

With your dev server running:

```
npx boneyard-js build
```

The CLI:
- Auto-detects your dev server by scanning common ports (3000, 5173, 4321, 8080…)
- Auto-detects Tailwind breakpoints from your config (falls back to 375, 768, 1280)
- Crawls all internal links starting from the root URL
- Finds every `<Skeleton name="...">` on each page
- Captures bones at every breakpoint
- Writes `.bones.json` files + a `registry.js` to your output directory
- Auto-installs Chromium on first run

Or pass a URL explicitly: `npx boneyard-js build http://localhost:5173`

Re-run whenever your layout changes to regenerate. The CLI uses incremental builds — it hashes each skeleton's content and skips unchanged components. Use `--force` to bypass the cache and recapture everything.

**Next.js App Router:** The generated `registry.js` includes `"use client"` automatically. `<Skeleton>` uses hooks — add `"use client"` to any file that imports it.

## Excluding elements from capture

Add `data-no-skeleton` to any element you want to exclude from bone capture:

```tsx
<nav data-no-skeleton>
  {/* No bone will be generated for this element */}
</nav>
```

**Note:** This only affects the capture/snapshot phase — excluded elements won't have bones drawn over them, but they are still hidden at runtime along with all other slot content (via `visibility: hidden`). To keep an element visible during loading, place it **outside** the `<Skeleton>` wrapper.

Or use `snapshotConfig` for more control:

```tsx
<Skeleton
  snapshotConfig={{
    excludeSelectors: ['.icon', '[data-no-skeleton]', 'svg'],
    excludeTags: ['nav', 'footer'],
  }}
>
```

## Dark mode

The component auto-detects dark mode via the `.dark` class on `<html>` or any parent element (standard Tailwind convention). It uses `darkColor` when dark mode is active. Does NOT use `prefers-color-scheme` — only the `.dark` class, giving the app developer explicit control.

Colors are best set in `boneyard.config.json`. Per-component overrides:

```tsx
<Skeleton color="#e5e5e5" darkColor="#2a2a2a" />
```

### Skeleton props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| loading | boolean | required | Show skeleton when true, real content when false |
| name | string | required | Unique name — the CLI uses this to generate the `.bones.json` file |
| fixture | ReactNode | — | Mock content rendered only during `npx boneyard-js build`. Never touches production |
| initialBones | ResponsiveBones | — | Optional manual override. If you use the registry, you don't need this |
| color | string | #f0f0f0 | Bone fill color for light mode |
| darkColor | string | #222222 | Bone fill color for dark mode (`.dark` class) |
| animate | "pulse" &#124; "shimmer" &#124; "solid" | "pulse" | Animation style (also accepts true/false) |
| className | string | — | Extra CSS class on the wrapper div |
| fallback | ReactNode | — | What to show if bones haven't been generated yet |
| snapshotConfig | SnapshotConfig | — | Control which elements are included/excluded during capture |

### snapshotConfig

| Option | Default | Description |
|--------|---------|-------------|
| excludeSelectors | [] | CSS selectors to skip (with all children) |
| excludeTags | [] | HTML tags to skip entirely |
| leafTags | p, h1–h6, li, tr | Tags treated as one solid block (merged with defaults) |
| captureRoundedBorders | true | Capture containers with border + border-radius as bones |

### npx boneyard-js build options

```
npx boneyard-js build [url] [options]
  --out <dir>          Output directory (default: ./src/bones)
  --breakpoints <bp>   Viewport widths, comma-separated (auto-detects Tailwind)
  --wait <ms>          Extra wait after page load (default: 800)
  --force              Recapture all (skip incremental cache)
  --watch              Re-capture when your app changes (listens for HMR)
  --no-scan            Skip filesystem route scanning (only crawl links)
  --env-file <path>    Load env vars from file (useful for Bun runtime)
  --native             React Native mode — scans from device (no browser)
```

## Bone format

Bones are stored as compact arrays: `[x, y, w, h, r]` with an optional 6th element `c` for container bones. `x` and `w` are percentages of container width. `y` and `h` are pixels. `r` is border radius (number or "50%"). The runtime also supports the legacy object format `{ x, y, w, h, r, c? }` for backwards compatibility.

## Low-level API (non-React)

```ts
import { snapshotBones } from 'boneyard-js'
const result = snapshotBones(document.querySelector('.card'))

import { renderBones } from 'boneyard-js'
const html = renderBones(result, '#d4d4d4')
container.innerHTML = html

// Manual bone registration (what the generated registry.js does automatically)
import { registerBones } from 'boneyard-js/react'
registerBones({ 'my-card': bonesJson })
```

## Authentication & protected routes

**Web (React/Svelte):** Configure auth in `boneyard.config.json`:
```json
{
  "auth": {
    "cookies": [{ "name": "session", "value": "env[SESSION_TOKEN]", "domain": "localhost" }],
    "headers": { "Authorization": "Bearer env[API_TOKEN]" }
  },
  "resolveEnvVars": true
}
```
Or use the `fixture` prop to provide mock content that renders without auth.

**React Native:** Auth is a non-issue with `--native`. The app is already running on device with the user logged in — just open the screen you want to scan.

## React Native

```tsx
import { Skeleton } from 'boneyard-js/native'

<Skeleton name="profile" loading={isLoading}>
  <ProfileCard />
</Skeleton>
```

Generate bones: `npx boneyard-js build --native --out ./bones`, then open your app on device. The Skeleton component auto-scans in dev mode — walks the React fiber tree, measures each view via UIManager, and sends bone data to the CLI. In production, scan code is completely inactive.

**Dynamic Type:** Always generate bones at default font scale (1.0). At runtime, boneyard renders children invisibly behind the skeleton overlay to measure the real content height, then scales bone positions proportionally via `scaleY`. This handles iOS Dynamic Type and Android font scaling automatically — no need to capture at multiple sizes.

After generating, add `import './bones/registry'` and reload the app.

## Preact

```tsx
import { Skeleton } from 'boneyard-js/preact'
import './bones/registry'

function App() {
  const [loading, setLoading] = useState(true)
  return (
    <Skeleton name="card" loading={loading}>
      <Card />
    </Skeleton>
  )
}
```

Native Preact integration — uses `preact/hooks` directly, no `preact/compat` needed. Same API as React. Same CLI: `npx boneyard-js build`. Works with the Vite plugin.

## Svelte

```svelte
<script>
  import Skeleton from 'boneyard-js/svelte'
  import '../bones/registry'
  let loading = true
</script>

<Skeleton name="card" {loading}>
  <Card />
</Skeleton>
```

Uses Svelte 5 snippets for `fallback` and `fixture`. Same CLI: `npx boneyard-js build`.

## Known limitations

- **Images**: Bone captures the bounding box — works even before the image loads
- **Dynamic content**: Bones reflect the layout at capture time. Re-run the build if layout changes
- **CSS transforms**: Bones use bounding rects, so transforms affect position but not bone sizing
- **React portals**: Elements outside the snapshot root aren't captured
- **Viewport vs container**: Breakpoints are based on viewport width, not container width

## Responsive

The CLI captures bones at multiple breakpoints (default: 375, 768, 1280). At runtime, `<Skeleton>` uses ResizeObserver to pick the closest match. Bones store `x` and `w` as percentages so they scale within a breakpoint range.

Custom breakpoints: `npx boneyard-js build --breakpoints 390,820,1440`

Tailwind breakpoints are auto-detected from your config.

## Config file

Create `boneyard.config.json` in your project root. This is the primary way to customize boneyard. Controls both the CLI build and runtime defaults for all `<Skeleton>` components:

```json
{
  "breakpoints": [375, 640, 768, 1024, 1280, 1536],
  "out": "./src/bones",
  "wait": 800,
  "color": "#e5e5e5",
  "darkColor": "#2a2a2a",
  "animate": "shimmer",
  "shimmerColor": "#ebebeb",
  "darkShimmerColor": "#333333",
  "speed": "2s",
  "shimmerAngle": 110
}
```

### Build-time options
| Key | Default | Description |
|-----|---------|-------------|
| breakpoints | [375, 768, 1280] | Viewport widths captured by CLI |
| out | ./src/bones | Output directory |
| wait | 800 | ms to wait after page load before capturing |

### Runtime options (baked into registry.js)
| Key | Default | Description |
|-----|---------|-------------|
| color | #f0f0f0 | Bone fill color (light mode) |
| darkColor | #222222 | Bone fill color (dark mode, `.dark` class) |
| animate | "pulse" | Animation: "pulse", "shimmer", or "solid" |
| shimmerColor | #f7f7f7 | Shimmer highlight color (light mode) |
| darkShimmerColor | #2c2c2c | Shimmer highlight color (dark mode) |
| speed | "2s" (shimmer) / "1.8s" (pulse) | Animation duration |
| shimmerAngle | 110 | Shimmer gradient angle in degrees |
| stagger | false | Delay between bones in ms (true = 80ms) |
| transition | false | Fade transition when loading ends in ms (true = 300ms) |
| boneClass | — | CSS class applied to each bone element |

Runtime options are automatically included in the generated `registry.js` via `configureBoneyard()`. Per-component props override config values.

## Package exports

- `boneyard-js` — snapshotBones, renderBones, fromElement
- `boneyard-js/react` — Skeleton, registerBones, configureBoneyard
- `boneyard-js/preact` — Skeleton, registerBones, configureBoneyard (native Preact, no compat needed)
- `boneyard-js/native` — Skeleton, registerBones, configureBoneyard (React Native)
- `boneyard-js/svelte` — Skeleton component, registerBones
- `boneyard-js/vue` — Skeleton component, registerBones, configureBoneyard
- `boneyard-js/angular` — SkeletonComponent, registerBones, configureBoneyard
- `boneyard-js/vite` — boneyardPlugin() Vite plugin for auto-capture

## Vite plugin

For Vite-based projects (Vue, Svelte, React with Vite), add the plugin to your vite.config.ts — no CLI needed:

```ts
import { boneyardPlugin } from 'boneyard-js/vite'

export default defineConfig({
  plugins: [boneyardPlugin()]
})
```

Captures bones on dev server start and re-captures on every HMR update. Options: `out`, `breakpoints`, `wait`, `framework`, `skipInitial`.


**Design System Maintained By:** Om Rajguru  
**Last Updated:** April 26, 2026