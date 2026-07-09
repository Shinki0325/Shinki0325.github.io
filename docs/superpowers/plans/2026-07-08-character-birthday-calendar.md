# Character Birthday Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a real, data-driven character birthday calendar that opens on the current month, highlights today, supports month navigation, and shows character names on avatar hover.

**Architecture:** Add focused calendar date helpers beside the birthday dataset, then render the interactive calendar as a React island inside a new Astro page. The UI reads `characterBirthdays` and `birthdayWorks`, so future data additions automatically appear without component edits.

**Tech Stack:** Astro, React 18, TypeScript, Vitest, local `/public/uploads/character-birthdays/` avatar assets.

---

### Task 1: Calendar Date Model

**Files:**
- Modify: `src/data/character-birthdays.ts`
- Modify: `tests/character-birthdays.test.ts`

- [ ] Add tests for month grid generation, month navigation, today matching, and birthday grouping.
- [ ] Implement small pure helpers: `getCalendarMonth`, `getAdjacentCalendarMonth`, and `isSameMonthDay`.
- [ ] Run `pnpm test tests/character-birthdays.test.ts`.

### Task 2: Interactive Calendar UI

**Files:**
- Create: `src/components/birthdays/CharacterBirthdayCalendar.tsx`
- Create: `src/components/birthdays/character-birthday-calendar.css`

- [ ] Render a 7-column month grid with leading/trailing adjacent-month days.
- [ ] Initialize client state from the supplied current date.
- [ ] Provide previous month, next month, and today controls.
- [ ] Highlight today when visible.
- [ ] Render contained avatar chips in each date cell and show name/work tooltip on hover.
- [ ] Collapse overflow birthdays behind a `+N` chip.

### Task 3: Page Integration

**Files:**
- Create: `src/pages/birthdays/index.astro`
- Modify: `src/config/site-shell.ts`

- [ ] Add the Astro page with a card matching the current translucent site style.
- [ ] Pass the dataset, work metadata, and current date into the React island.
- [ ] Add a `生日历` navigation item.

### Task 4: Verification

**Files:**
- Test: `tests/character-birthdays.test.ts`

- [ ] Run `pnpm test tests/character-birthdays.test.ts`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm build`.
