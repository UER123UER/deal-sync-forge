# Product UI System

## Purpose

This product must feel deliberately engineered. The standard is a disciplined brokerage platform with repeatable patterns, not a fast assembly of attractive fragments.

## What "vibe coded" means

In this codebase, "vibe coded" means any UI or interaction that was made by instinct without system pressure. It usually shows up as:

- inconsistent spacing between similar objects
- nearly identical components rendered with small visual differences
- arbitrary font sizes, line heights, or radii
- one-off layouts that do not align to a shared shell
- decorative styling without functional value
- controls that look finished but do not cover loading, disabled, empty, or error states
- page-by-page decisions that do not scale beyond the local screen

Any new UI that introduces one of those traits is a regression.

## Non-negotiable principles

### 1. System over intuition

- All spacing, typography, radius, elevation, and motion values come from shared tokens in `/Users/eric/Desktop/UER/src/index.css`.
- Tailwind theme aliases in `/Users/eric/Desktop/UER/tailwind.config.ts` must map back to those tokens.
- Do not introduce arbitrary numeric values unless there is a documented system gap.

### 2. Total consistency

- Use the shared page scaffold from `/Users/eric/Desktop/UER/src/components/system/page-shell.tsx`.
- Reuse shared primitives in `/Users/eric/Desktop/UER/src/components/ui`.
- The same interaction pattern must not be rebuilt in multiple slightly different ways.

### 3. Precision and restraint

- Styling must communicate hierarchy, grouping, or state.
- If an effect does not improve comprehension, remove it.
- Prefer fewer surfaces, fewer colors, and fewer alignment modes.

### 4. Real product behavior

- Every interactive surface must account for hover, focus, active, disabled, loading, empty, and error states.
- Long text, empty datasets, and partial data must render intentionally.
- Motion is brief and structural. No decorative animation.

### 5. Cohesive architecture

- Extract repeatable patterns once they appear in more than one operational page.
- Prefer composition over copy-paste.
- Keep naming explicit: `PageHeader`, `MetricCard`, `EmptyState`, not vague aliases.

### 6. Usability first

- Clear hierarchy beats visual novelty.
- Keyboard access and visible focus are required.
- Contrast and hit-area size are product requirements, not polish tasks.

## Active token system

### Spacing

Defined in `/Users/eric/Desktop/UER/src/index.css`:

- `--space-1: 0.25rem`
- `--space-2: 0.5rem`
- `--space-3: 0.75rem`
- `--space-4: 1rem`
- `--space-5: 1.25rem`
- `--space-6: 1.5rem`
- `--space-8: 2rem`
- `--space-10: 2.5rem`
- `--space-12: 3rem`

Usage rules:

- `space-2` to `space-4` inside compact controls
- `space-4` to `space-6` inside cards and form sections
- `space-6` to `space-8` between page sections
- avoid custom `px` values when an existing spacing token solves the problem

### Typography

Defined in `/Users/eric/Desktop/UER/src/index.css`:

- `--font-size-100` through `--font-size-600`
- `--line-height-tight`
- `--line-height-body`
- `--line-height-relaxed`

Usage rules:

- page titles: `font-size-600`
- section titles: `font-size-300` or `font-size-400`
- body copy: `font-size-200`
- metadata and headers: `font-size-100`
- no random font sizing to compensate for weak layout structure

### Radius

- `--radius-sm`
- `--radius-md`
- `--radius-lg`
- `--radius-xl`

Usage rules:

- inputs and compact controls: `sm` or `md`
- cards and surfaces: `lg`
- dialogs and larger overlays: `xl`

### Elevation

- `--shadow-1`
- `--shadow-2`
- `--shadow-focus`

Usage rules:

- surfaces use `shadow-1`
- floating layers use `shadow-2`
- focus visibility uses the shared focus shadow language

### Motion

- `--duration-fast`
- `--duration-base`
- `--duration-slow`
- `--ease-standard`

Usage rules:

- controls and hover states: fast
- overlay transitions: base
- do not use motion as decoration

## Layout rules

### Shared shell

Every authenticated product page should be built from:

- `PageShell`
- `PageHeader`
- `PageHeaderHeading`
- `PageHeaderActions` when needed
- `PageToolbar` for filters and page-level actions
- `PageContent`
- `PageStack`
- `PageSection`

Do not create page-specific shells unless the page is fundamentally not a standard application screen.

### Shared surface classes

Use the shared classes from `/Users/eric/Desktop/UER/src/index.css`:

- `.app-surface`
- `.app-surface-subtle`
- `.app-empty-state`
- `.app-form-grid`
- `.app-form-field`
- `.app-segmented`
- `.app-segmented-item`

These classes define consistent padding, border, background, and alignment behavior. New containers should start there.

## Component rules

### Buttons

Defined in `/Users/eric/Desktop/UER/src/components/ui/button.tsx`.

Requirements:

- identical focus handling everywhere
- identical height by size token
- no page-specific button clones
- loading and disabled states must preserve layout width

### Inputs, textareas, selects

Defined in:

- `/Users/eric/Desktop/UER/src/components/ui/input.tsx`
- `/Users/eric/Desktop/UER/src/components/ui/textarea.tsx`
- `/Users/eric/Desktop/UER/src/components/ui/select.tsx`

Requirements:

- same border, focus, disabled, and invalid language
- same text sizing
- same vertical rhythm inside forms

### Cards, tables, tabs, badges, dialogs

Defined in:

- `/Users/eric/Desktop/UER/src/components/ui/card.tsx`
- `/Users/eric/Desktop/UER/src/components/ui/table.tsx`
- `/Users/eric/Desktop/UER/src/components/ui/tabs.tsx`
- `/Users/eric/Desktop/UER/src/components/ui/badge.tsx`
- `/Users/eric/Desktop/UER/src/components/ui/dialog.tsx`

Requirements:

- tables must use the shared header case, spacing, and hover behavior
- tabs must not drift in height or active-state treatment
- dialogs must use the same overlay, radius, and close control logic

## State coverage checklist

Every component or page pattern must be checked against:

- default
- hover
- focus-visible
- active
- disabled
- loading
- empty
- error
- long text
- narrow width

If a pattern does not cover those states, it is incomplete.

## Engineering checklist for new UI

Before merging any new screen or component:

1. Does it use the shared shell instead of a local wrapper?
2. Are spacing and typography values from the token system?
3. Could any visual pattern be replaced by an existing primitive?
4. Are all interaction states present?
5. Does it still hold up with empty data, long values, or slow loading?
6. If duplicated elsewhere, should it be extracted now?

If any answer is "no" or "not sure", the UI is not ready.

## Current reusable product patterns

These are the baseline patterns for operational pages:

- page shell: `/Users/eric/Desktop/UER/src/components/system/page-shell.tsx`
- metric summary cards: `/Users/eric/Desktop/UER/src/components/system/metric-card.tsx`
- standardized operational pages:
  - `/Users/eric/Desktop/UER/src/pages/Transactions.tsx`
  - `/Users/eric/Desktop/UER/src/pages/Calendar.tsx`
  - `/Users/eric/Desktop/UER/src/pages/OpenHouse.tsx`
  - `/Users/eric/Desktop/UER/src/pages/Finances.tsx`
  - `/Users/eric/Desktop/UER/src/pages/Referral.tsx`
  - `/Users/eric/Desktop/UER/src/pages/Tasks.tsx`

New pages should start from those patterns instead of inventing a local approach.
