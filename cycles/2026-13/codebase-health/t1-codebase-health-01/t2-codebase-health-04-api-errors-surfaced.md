# API errors surfaced, not swallowed

Work Item: t2-codebase-health-04
Tier 1: t1-codebase-health-01 [v1.1.0 | Codebase Health] (In Progress)
Module: Codebase Health
Spec: docs/specs/codebase-health.md
Version Doc: docs/versions/v1.1.0/codebase-health.md
Siblings: 7 total, 4 Done — [t2-01 Legacy server actions (Todo), t2-02 Typed DTOs (Done), t2-03 Session/token (Done local), t2-05 Console.log cleanup (Todo), t2-06 Infra cleanup (Done), t2-07 Remove dark mode (Done local)]
Execution Order: Step 2 of 3 — Step 1 effectively Done

## Context

Non-tech: API errors are silently swallowed — users see blank screens or stale data instead of error messages when backend calls fail.
Tech: `sendRequest` in `src/utils/api.ts` returns error responses cast as `T` instead of throwing. 20 consumer files across auth, user pages, and admin pages. Toast system exists at `src/components/toast.tsx`.
Related: t2-02 (Typed DTOs) — proper typing enables typed error class; t2-03 (Session/token) — auth flow is a key consumer.

## Phase A: Create ApiError and update sendRequest

- [x] Create `src/utils/api-error.ts` — typed `ApiError` class with `statusCode: number`, `message: string`, `error: string | string[]` fields, extending `Error`
- [x] Update `sendRequest` in `src/utils/api.ts` — throw `ApiError` when `!res.ok` instead of returning error response cast as `T`
- [x] Update `sendRequestFile` in `src/utils/api.ts` — same throw-on-error behavior
- [x] Type `options` parameter in both functions (replace `any` with `RequestInit`)

## Phase B: Update auth layer callers

- [x] `src/auth.ts` (authorize) — wrap `authService.login()` in try/catch, catch `ApiError` and check `statusCode` for 401 (InvalidEmailPasswordError) and 400 (InactiveAccountError), rethrow unknown
- [x] `src/app/auth/signup/page.tsx` — wrap `authService.signup()` in try/catch, show toast on ApiError
- [x] `src/app/auth/forgot-password/page.tsx` — wrap `authService.retryPassword()` in try/catch, show toast on ApiError
- [x] `src/app/auth/change-password/page.tsx` — wrap `retryPassword` and `changePassword` calls in try/catch, show toast on ApiError
- [x] `src/components/auth/verify.tsx` — wrap `authService.checkCode()` in try/catch, show error state on ApiError
- [x] `src/components/auth/modal.reactive.tsx` — wrap `retryActive` and `checkCode` calls in try/catch, show toast on ApiError

## Phase C: Update profile/admin callers with pattern change

- [x] `src/components/profile/ProfileContent.tsx` — remove `(res as any).statusCode >= 400` pattern, use try/catch with ApiError instead
- [x] `src/app/admin/products/_components/ProductForm.tsx` — remove `(resAny.statusCode)` cast pattern, use `Promise.allSettled` + check `result.status === "rejected"` instead

## Phase D: Add error handling to remaining callers

- [x] `src/components/profile/ProfileDataProvider.tsx` — already has try/catch, throw now propagates into existing catch block (no code change needed)
- [x] `src/components/profile/OrdersContent.tsx` — already has try/catch, throw now propagates into existing catch block (no code change needed)

## Phase E: Verify

- [x] Run `npx tsc --noEmit` — pass
- [x] Grep for remaining `as any` casts related to statusCode/error checking — zero found
- [x] Grep for `res.statusCode` usage outside api.ts — zero found
