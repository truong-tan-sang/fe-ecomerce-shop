# Consistent session token access

Work Item: t2-codebase-health-03
Tier 1: t1-codebase-health-01 [v1.1.0 | Codebase Health] Fix vibe-coding inconsistencies (In Progress)
Module: Auth / Codebase Health
Spec: docs/specs/auth.md
Version Doc: docs/versions/v1.1.0/codebase-health.md
Siblings: 6 total, 0 Done — t2-codebase-health-01 Cart (Todo), t2-codebase-health-02 DTOs (Todo), t2-codebase-health-04 Errors (Todo), t2-codebase-health-05 Auth typed (Todo), t2-codebase-health-06 Infra cleanup (Todo)
Execution Order: Step 1 of 3 — no blockers (parallel with t2-02 and t2-06)

## Context

Non-tech: Developers accessing session tokens inconsistently — admin pages use a fallback pattern that masks the fact that top-level session.access_token is always undefined.
Tech: `src/types/next-auth.d.ts` (type declarations), `src/auth.ts` (session callback), 3 admin pages with wrong pattern, ~30 user-side files with correct pattern.
Related: t2-codebase-health-05 (auth typing) — will clean up `as any` casts in auth.ts; this T2 only fixes token access path.

## Phase A: Clean Session type declaration

- [x]Remove `access_token`, `refresh_token`, `access_expire`, `error` from `Session` interface in `src/types/next-auth.d.ts` (keep them on `JWT` where they belong)
- [x]Verify `IUser` still has `access_token: string`

## Phase B: Fix admin page callers

- [x]`src/app/admin/categories/page.tsx` — change `session?.access_token || session?.user?.access_token || ""` to `session?.user?.access_token || ""`
- [x]`src/app/admin/users/page.tsx` — change `session?.access_token || session?.user?.access_token` to `session?.user?.access_token`
- [x]`src/app/admin/products/list/page.tsx` — change `session?.access_token || session?.user?.access_token || ""` to `session?.user?.access_token || ""`

## Phase C: Verify

- [x]Run `npx tsc --noEmit` — confirm no type errors from removing Session fields
- [x]Grep for any remaining `session?.access_token` or `session.access_token` references (should be zero outside of `auth.ts` JWT/signIn callbacks)
