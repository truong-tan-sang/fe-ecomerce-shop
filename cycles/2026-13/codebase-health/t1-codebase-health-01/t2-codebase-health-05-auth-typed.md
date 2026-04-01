# Auth layer fully typed

Work Item: t2-codebase-health-05
Tier 1: t1-codebase-health-01 [v1.1.0 | Codebase Health] Fix vibe-coding inconsistencies (In Progress)
Module: Codebase Health / Auth
Spec: docs/specs/auth.md
Version Doc: docs/versions/v1.1.0/codebase-health.md
Siblings: 6 total, 4 Done — t2-01 Cart (Todo), t2-02 DTOs (Done), t2-03 Session (Done), t2-04 Errors (Done), t2-06 Infra (Done), t2-07 Dark mode (Done)
Execution Order: Step 3 of 3 — parallel with t2-01, depends on t2-02 + t2-04 (both Done)

## Context

Non-tech: The auth layer has 30+ `any` usages from rapid prototyping — type-unsafe user objects in NextAuth callbacks, untyped service responses, untyped component props.
Tech: `src/auth.ts` (13 `as any` casts on NextAuth `user` object), `src/services/auth.ts` (4 endpoints return `IBackendRes<any>`), `src/types/next-auth.d.ts` (needs `User` extension + JWT cleanup), `src/components/auth/verify.tsx` + `modal.reactive.tsx` (props/values: any), `src/utils/actions.ts` (`(error as any).name`), `src/utils/errors.ts` (`message?: any`), `src/components/profile/ProfileDataProvider.tsx` + `ProfileContext.tsx` (`d: any`, `[key: string]: any`).
Related: T2-04 (error handling) — `auth.ts` now uses `ApiError`, that stays. T2-03 (session tokens) — cleaned Session interface, JWT fields remain.

## Phase A: Extend NextAuth User type

- [x] Add `access_token`, `role` (`UserRole`), `isAdmin`, `firstName`, `lastName` to NextAuth `User` interface in `src/types/next-auth.d.ts`
- [x] In `src/auth.ts` `authorize()` — remove `as any` on the return object (line 73), return typed object matching extended `User`
- [x] In `src/auth.ts` `signIn()` — replace all `(user as any).xxx` reads/writes (lines 107-108, 190-192, 198-199) with direct `user.xxx`
- [x] In `src/auth.ts` `jwt()` — replace all `(user as any).xxx` reads (lines 224-228) with direct `user.xxx`

## Phase B: Create auth response DTOs + type service

- [x] Add `AuthResponseEntity` to `src/dto/auth.ts` — `{ message: string; data?: { _id?: string; id?: number } }` (from OpenAPI `AuthResponseEntity`)
- [x] Add `ProfileResponseEntity` to `src/dto/auth.ts` — `{ userId: number; username: string; role: UserRole; firstName?: string; lastName?: string; name?: string }` (from OpenAPI)
- [x] Update `authService.checkCode` return: `IBackendRes<any>` → `IBackendRes<UserEntity>` (OpenAPI: returns `UserEntity`). Add `UserEntity` import or use existing if available
- [x] Update `authService.retryActive` return: `IBackendRes<any>` → `IBackendRes<AuthResponseEntity>`
- [x] Update `authService.retryPassword` return: `IBackendRes<any>` → `IBackendRes<AuthResponseEntity>`
- [x] Update `authService.changePassword` return: `IBackendRes<any>` → `IBackendRes<AuthResponseEntity>`
- [x] Update `authService.profile` return: `IBackendRes<any>` → `IBackendRes<ProfileResponseEntity>`

## Phase C: Type auth components

- [x] `src/components/auth/verify.tsx` — replace `props: any` with `{ id: string }`, replace `values: any` with `{ id: string; codeActive: string }`
- [x] `src/components/auth/modal.reactive.tsx` — replace `props: any` with `{ isModalOpen: boolean; setIsModalOpen: (v: boolean) => void; userEmail: string }`, replace `values: any` on `onFinishStep0` with `{ email: string }`, on `onFinishStep1` with `{ code: string }`
- [x] Fix `modal.reactive.tsx` line 33: `res?.data?._id` — now typed as `AuthResponseEntity`, access `res.data?.data?._id` or adjust based on actual shape

## Phase D: Type actions.ts errors + errors.ts

- [x] `src/utils/actions.ts` — replace `(error as any).name` checks with `error instanceof InvalidEmailPasswordError` and `error instanceof InactiveAccountError`. Import error classes.
- [x] Replace `(error as any).type` with `(error as InvalidEmailPasswordError).type` (or access static `.type` from the class)
- [x] `src/utils/errors.ts` — change `constructor(message?: any)` to `constructor(message?: string)`

## Phase E: Type ProfileDataProvider + ProfileContext

- [x] `src/components/profile/ProfileDataProvider.tsx` — remove `const d: any = res.data`, use typed response from `userService.getUser`. Map fields explicitly.
- [x] `src/components/profile/ProfileContext.tsx` — remove `[key: string]: any` from `ProfileData` type. Add specific optional fields that the profile actually uses.
- [x] Check all `useProfile()` consumers for field access patterns that depend on the index signature — update if needed

## Phase F: Clean JWT interface

- [x] Remove `refresh_token`, `access_expire`, `error` from `JWT` interface in `next-auth.d.ts` — only keep `user: IUser` and `access_token` (if used)
- [x] Verify no code reads `token.refresh_token`, `token.access_expire`, or `token.error`

## Phase G: Verify

- [x] Run `npx tsc --noEmit` — pass
- [x] Grep for `as any` in auth-related files (auth.ts, services/auth.ts, components/auth/*, utils/actions.ts, utils/errors.ts) — should be zero
- [x] Grep for `: any` in same files — should be zero (except catch blocks if unavoidable)
