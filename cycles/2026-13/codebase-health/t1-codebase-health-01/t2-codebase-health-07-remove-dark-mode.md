# Remove dark mode

Work Item: t2-codebase-health-07
Tier 1: t1-codebase-health-01 [v1.1.0 | Codebase Health] Fix vibe-coding inconsistencies (In Progress)
Module: Codebase Health
Spec: docs/specs/ (no dedicated spec — cross-cutting)
Version Doc: docs/versions/v1.1.0/codebase-health.md
Siblings: 6 total, 1 Done — t2-01 Cart (Todo), t2-02 DTOs (Done), t2-03 Session (In Progress, locally complete), t2-04 Errors (Todo), t2-05 Auth types (Todo), t2-06 Infra cleanup (In Progress, locally complete)
Execution Order: Step 1 of 3 — parallel with t2-02, t2-03, t2-06, no blockers

## Context

Non-tech: Dark mode was vibe-coded but never polished — inconsistent coverage across ~10 files. Removing it simplifies the codebase and eliminates the `window as any` issue (Issue 9) as a side effect. Follow-up: header restyled to dark gradient with white text/logo, design system enforced `--radius: 0`, ProductCard stripped of gamified animations.
Tech: `theme-provider.tsx` (toggle logic), `window.d.ts` (type decl from T2-06), `styles/theme.css` (dark CSS vars + header gradient), `globals.css` (.dark block + @custom-variant + --radius), `navbar.tsx` (toggle button + isDark state + dark header restyle), `layout.tsx` (ThemeProvider wrapper + dark: body classes), `lib/theme.ts` (CSS var utility — light vars stay), 7 shadcn/ui components + `ProductCard.tsx` (dark: classes + gamified animation removal).
Related: T2-06 Phase B typed `window.toggleTheme` — this T2 deletes those files entirely, making that work moot.

## Phase A: Remove dark mode infrastructure

- [x] Delete `src/components/theme-provider.tsx`
- [x] Delete `src/types/window.d.ts` (toggleTheme type declaration, created by T2-06)
- [x] Remove dark theme block from `src/styles/theme.css` — keep `:root` light vars and base rules
- [x] Remove `.dark { ... }` block from `src/app/globals.css`
- [x] Remove `@custom-variant dark (&:is(.dark *));` from `src/app/globals.css`

## Phase B: Clean navbar — remove toggle UI

- [x] Remove `Moon`, `Sun` imports from lucide-react in `src/components/header/navbar.tsx`
- [x] Remove `isDark` / `setIsDark` state and the dark-mode-check `useEffect`
- [x] Remove the theme toggle `<button>` block
- [x] Remove duplicate logo `<Image>` — keep single `LOGO-dark.svg` (white fill)

## Phase C: Strip dark: Tailwind classes

- [x] `src/app/layout.tsx` — remove `dark:bg-black dark:text-white`
- [x] `src/components/product/ProductCard.tsx` — remove `dark:group-hover:brightness-110`
- [x] `src/components/ui/button.tsx` — strip all `dark:` class segments
- [x] `src/components/ui/input.tsx` — strip all `dark:` class segments
- [x] `src/components/ui/textarea.tsx` — strip all `dark:` class segments
- [x] `src/components/ui/badge.tsx` — strip all `dark:` class segments
- [x] `src/components/ui/select.tsx` — strip all `dark:` class segments
- [x] `src/components/ui/switch.tsx` — strip all `dark:` class segments
- [x] `src/components/ui/tabs.tsx` — strip all `dark:` class segments

## Phase D: Clean layout.tsx — remove ThemeProvider

- [x] Remove `ThemeProvider` import from `src/app/layout.tsx`
- [x] Remove `<ThemeProvider>` wrapper around children (keep `<NextAuthWrapper>`)
- [x] Remove `suppressHydrationWarning` from `<html>` tag
- [x] Remove `transition-colors duration-300` from body className

## Phase E: Restyle header to dark gradient (user follow-up)

- [x] Change `--gradient-header` in `theme.css` from white to `#1a1a1a → #111111`
- [x] Navbar header text color → `text-white`, utility bar → `text-white/70`
- [x] Search input → `bg-white/10 text-white`, search button → `bg-white text-black`
- [x] Keep `LOGO-dark.svg` (white fill, correct for dark header)

## Phase F: Design system — enforce zero border-radius (user follow-up)

- [x] Set `--radius: 0` in `globals.css` (was `0.625rem`)
- [x] Remove `rounded` from search form
- [x] Add border-radius rule to `CLAUDE.md`

## Phase G: Simplify ProductCard — remove gamified animations (user follow-up)

- [x] Remove corner bracket accents (4 divs)
- [x] Remove floating shapes (3 divs with clipPath)
- [x] Remove scan line animation + `@keyframes scan` + `<style jsx>`
- [x] Remove grid overlay effect
- [x] Remove two gradient overlays on image hover
- [x] Remove `gradient-info` background on info section
- [x] Remove gradient separator line
- [x] Remove `theme` import (no longer needed)
- [x] Remove inline style boxShadow/transform with JS hover handlers
- [x] Replace with clean: `border-gray-200 hover:border-black`, subtle `scale-[1.03]` on image

## Phase H: Verify

- [x] Run `npx tsc --noEmit` — pass
- [x] Grep for remaining `dark:` classes in src/ — zero
- [x] Grep for remaining `toggleTheme`, `isDark`, `theme-provider` references — zero
