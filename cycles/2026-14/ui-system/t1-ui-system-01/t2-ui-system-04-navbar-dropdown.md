# Navbar dropdown uses shadcn DropdownMenu

Work Item: t2-ui-system-04
Tier 1: t1-ui-system-01 [v1.1.0 | UI System] Standardize customer UI on shadcn/ui (In Progress)
Module: UI System
Spec: docs/specs/ui-system.md
Version Doc: docs/versions/v1.1.0/ui-system.md
Siblings: 5 total, 1 Done — t2-ui-system-01 Foundation (Done), t2-ui-system-02 Auth flow (Todo), t2-ui-system-03 Customer pages (Todo), t2-ui-system-05 Remove antd (Todo)
Execution Order: Step 2 of 3 — no blockers (foundation done)

## Context

Non-tech: Replace the hand-built account dropdown in the site header with the standard shadcn DropdownMenu so it gains keyboard navigation, accessibility, and consistent styling for free.
Tech: Single file change — src/components/header/navbar.tsx. Custom dropdown uses useState + useRef + useEffect for open/close and click-outside. Replace with Radix DropdownMenu primitives from src/components/ui/dropdown-menu.tsx. Click-only (no hover-to-open).
Related: None — navbar is self-contained.

## Phase A: Replace custom dropdown with shadcn DropdownMenu

- [x] Import DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator from `@/components/ui/dropdown-menu`
- [x] Wrap the account menu area in `<DropdownMenu modal={false}>`, replace trigger `<button>` with `<DropdownMenuTrigger asChild>` wrapping the same button (remove onMouseEnter/onClick toggle). `modal={false}` prevents body scroll lock that causes scrollbar layout jag on Windows.
- [x] Replace the dropdown `<div>` with `<DropdownMenuContent align="end" className="w-48">` — match current width and right-alignment
- [x] Replace each `<Link>` item with `<DropdownMenuItem asChild><Link>...</Link></DropdownMenuItem>` — preserve href, text, and styling
- [x] Replace `<hr>` with `<DropdownMenuSeparator />`
- [x] Replace logout `<button>` with `<DropdownMenuItem variant="destructive" onClick={handleLogout}>` — preserve red text styling
- [x] Remove `showAccountMenu` state, `accountMenuRef` ref, and the click-outside `useEffect`
- [x] Add `cursor-pointer` to DropdownMenuItem classes (override Radix default `cursor-default`)

## Phase B: Verify design system compliance

- [x] Confirm dropdown visual: white bg, sharp edges (--radius: 0), correct padding, red logout text
- [x] Verify keyboard navigation: arrow keys cycle items, Escape closes, Enter activates
- [x] Run `npx tsc --noEmit` — no type errors
