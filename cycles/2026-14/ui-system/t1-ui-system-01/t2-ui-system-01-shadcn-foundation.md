# shadcn foundation components installed and configured

Work Item: t2-ui-system-01
Tier 1: t1-ui-system-01 [v1.1.0 | UI System] Standardize customer UI on shadcn/ui (Todo)
Module: UI System
Spec: docs/specs/ui-system.md
Version Doc: docs/versions/v1.1.0/ui-system.md
Siblings: 5 total, 0 Done — t2-ui-system-02 Auth flow (Todo), t2-ui-system-03 Customer pages (Todo), t2-ui-system-04 Navbar dropdown (Todo), t2-ui-system-05 Remove antd (Todo)
Execution Order: Step 1 of 3 — no blockers

## Context

Non-tech: Install the remaining shadcn/ui components that sibling work items need, so migration can proceed in parallel.
Tech: 13 shadcn components already in src/components/ui/. Need DropdownMenu, Form, Separator, Sonner. Config (components.json, globals.css, lib/utils.ts) is already correct.
Related: Codebase Health — t2-codebase-health-07 (remove dark mode) already done, so no dark: classes to worry about.

## Phase A: Install missing shadcn components and dependencies

- [x] Run `npx shadcn@latest add dropdown-menu separator sonner` to install DropdownMenu, Separator, and Sonner
- [x] Run `npx shadcn@latest add form` to install Form (pulls in react-hook-form, @hookform/resolvers, zod)
- [x] Verify all new files appear in src/components/ui/ (dropdown-menu.tsx, separator.tsx, sonner.tsx, form.tsx)

## Phase B: Verify design system compatibility

- [x] Check all new component files for hardcoded rounded-* classes — ensure they respect --radius: 0
- [x] Check for any dark: classes in new components — remove if present (dark mode removed in v1.1.0)
- [x] Run `npx tsc --noEmit` to verify no type errors
- [x] Verify Sonner toaster integrates with app layout (add <Toaster /> to layout.tsx)
