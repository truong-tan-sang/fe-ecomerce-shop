# Infrastructure types and dead code cleanup

Work Item: t2-codebase-health-06
Tier 1: t1-codebase-health-01 [v1.1.0 | Codebase Health] Fix vibe-coding inconsistencies (In Progress)
Module: Codebase Health
Spec: docs/specs/ (no dedicated spec — cross-cutting)
Version Doc: docs/versions/v1.1.0/codebase-health.md
Siblings: 6 total, 0 Done — t2-01 Cart (Todo), t2-02 DTOs (In Progress), t2-03 Session (In Progress), t2-04 Errors (Todo), t2-05 Auth types (Todo)
Execution Order: Step 1 of 3 — parallel with t2-02 and t2-03, no blockers

## Context

Non-tech: Clean up loose infrastructure types and remove dead code left over from rapid prototyping.
Tech: `src/types/backend.d.ts` (3 `any` fields in IRequest), `src/components/header/navbar.tsx` + `src/components/theme-provider.tsx` (window as any), `src/utils/actions.ts` (3 dead server actions), `src/utils/customHook.ts` + `src/dto/product.ts` PaginatedProductsResponse (verified NOT dead).
Related: T2-05 (auth layer) — `authenticate()` in actions.ts has `as any` casts but those belong to auth scope, not this T2.

## Phase A: Type IRequest properly in backend.d.ts

- [x] Replace `body?: { [key: string]: any }` with `body?: object | FormData` (Record<string,unknown> rejected — incompatible with typed DTOs lacking index signatures)
- [x] Replace `queryParams?: any` with `queryParams?: Record<string, string | number | boolean>`
- [x] Replace `headers?: any` with `headers?: Record<string, string>`
- [x] Replace `nextOption?: any` with `nextOption?: { revalidate?: number | false; tags?: string[] }`
- [x] Run `npx tsc --noEmit` — pass

## Phase B: Fix window as any for theme toggle

- [x] Create `src/types/window.d.ts` with Window interface extension: `toggleTheme?: () => void`
- [x] Update `src/components/theme-provider.tsx` — remove `as any` cast, use typed `window.toggleTheme`
- [x] Update `src/components/header/navbar.tsx` — remove `as any` cast, use typed `window.toggleTheme`
- [x] Run `npx tsc --noEmit` — pass

## Phase C: Remove dead code from utils/actions.ts

- [x] Delete `handleCreateUserAction`, `handleUpdateUserAction`, `handleDeleteUserAction` from `src/utils/actions.ts`
- [x] Remove unused imports (`auth`, `revalidateTag`, `sendRequest`) — keep only `signIn` for `authenticate()`
- [x] Run `npx tsc --noEmit` — pass

## Phase D: Verify and close possibly-dead-code items

- [x] Confirm `PaginatedProductsResponse` is used by `src/services/product.ts` — NOT dead
- [x] Confirm `useHasMounted` is used by `src/components/auth/modal.reactive.tsx` — NOT dead
- [x] Update Issue 10 notes in `docs/versions/v1.1.0/codebase-health.md` to reflect findings
