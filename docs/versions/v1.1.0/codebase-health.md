# [v1.1.0 | Codebase Health] Fix vibe-coding inconsistencies

## Rationale
Post-v1.0.0 audit found 10 inconsistencies from rapid vibe-coding. These cause bugs (cart system), type safety issues (any usage), and maintenance friction (duplicate types).

## Scope
Fix all issues listed below. No new features.

---

## Issue 1: Two Conflicting Cart Systems (CRITICAL — user-facing bug)

**Problem:** Two separate cart implementations that don't communicate:
- **localStorage cart:** `src/dto/cart.ts` + `src/utils/cart.ts` — used by `ProductGrid.tsx` (`addToCart`)
- **API cart:** `src/dto/cart-api.ts` + `src/services/cart.ts` — used by cart page + checkout page

**Bug:** Items added from homepage ProductGrid go to localStorage. Cart page reads from API. Users see an empty cart after adding products.

**Fix:** Decide on one system (likely API cart), update `ProductGrid` to call `cartService.createCartItem()` instead of localStorage `addToCart()`. Delete `src/utils/cart.ts` + `src/dto/cart.ts` if fully migrated. Or if offline cart is needed, sync localStorage → API on cart page load.

**Files:** `src/utils/cart.ts`, `src/dto/cart.ts`, `src/dto/cart-api.ts`, `src/components/product/ProductGrid.tsx`, `src/app/(user)/cart/page.tsx`, `src/app/(user)/checkout/page.tsx`

---

## Issue 2: Three Competing ProductVariant Types

**Problem:** Same backend entity, 3 different TypeScript shapes:

| Type | File | Shape |
|------|------|-------|
| `ProductVariantDto` | `dto/product-detail.ts` | Missing: weight/height/width/length/colorId/currencyUnit. Nullable variantColor/Size |
| `ProductVariantEntity` (aliased `ProductVariantDto`) | `dto/product-variant.ts` | Full fields. Non-nullable strings |
| `ProductVariantWithMediaEntity` | `dto/product.ts` | Full fields + `media[]` |

**Name collision:** Importing `ProductVariantDto` gives different types depending on source file.

**Fix:** One canonical `ProductVariantDto` with all fields, optional `media[]`. Delete duplicates. Update all imports.

**Files:** `src/dto/product-detail.ts`, `src/dto/product-variant.ts`, `src/dto/product.ts`

---

## Issue 3: Two Competing Media Types

**Problem:**
- `MediaEntity` in `dto/product.ts` — has `isShopLogo`, `isShopBanner`, `isCategoryFile`, `isAvatarFile`
- `MediaDto` in `dto/product-detail.ts` — has `altText`, simpler

**Fix:** One `MediaDto` that matches the actual API response. Delete the other.

**Files:** `src/dto/product.ts`, `src/dto/product-detail.ts`

---

## Issue 4: `cartService.getCartDetails()` Returns `any`

**Problem:** Returns `IBackendRes<any>`, forcing `as any` casts and manual field mapping in both cart and checkout pages (duplicated code).

**Fix:** Create a `CartDetailsResponse` DTO matching the actual API response shape. Type `getCartDetails` return properly. Extract the mapping logic into a shared function or remove it if the DTO matches directly.

**Files:** `src/services/cart.ts`, `src/dto/cart-api.ts`, `src/app/(user)/cart/page.tsx`, `src/app/(user)/checkout/page.tsx`

---

## Issue 5: Inconsistent Session Token Access

**Problem:** Three patterns:
- `session?.access_token || session?.user?.access_token` (admin pages)
- `session?.user?.access_token` (user pages)
- `next-auth.d.ts` declares `access_token` on BOTH `Session` and `IUser`

**Fix:** Pick one canonical path (likely `session?.user?.access_token` since that's where NextAuth puts user data). Remove the top-level `Session.access_token` declaration if not needed, or standardize all callers to one pattern.

**Files:** `src/types/next-auth.d.ts`, all files accessing session token

---

## Issue 6: `sendRequest` Swallows Errors as Success

**Problem:** `src/utils/api.ts` returns HTTP error responses as the generic type `T` instead of throwing. Callers must check `statusCode` manually but most don't — silent failures.

**Fix:** Either throw on non-ok responses (breaking change — need to audit all callers), or add a typed error wrapper like `IBackendRes` that always has `statusCode` and callers can check. At minimum, add a `sendRequest` wrapper or helper that throws.

**Files:** `src/utils/api.ts`, all service consumers

---

## Issue 7: `utils/actions.ts` — Legacy Server Actions

**Problem:** `handleCreateUserAction`, `handleUpdateUserAction`, `handleDeleteUserAction` bypass `userService`, use `any` types, and call `revalidateTag("list-users")` which nothing uses.

**Fix:** Delete or migrate to use `userService`. Check if anything imports these — if not, delete.

**Files:** `src/utils/actions.ts`

---

## Issue 8: Heavy `any` Usage

**Problem:** CLAUDE.md says "never use any" but there are 30+ instances:
- `auth.ts` — 13 `as any` casts for NextAuth user object
- `authService` — 5 endpoints return `IBackendRes<any>`
- Auth components — `props: any`, `values: any`
- `backend.d.ts` — `queryParams?: any`, `headers?: any`, `nextOption?: any`

**Fix:**
- `auth.ts`: Use the `IUser` type through NextAuth callbacks properly instead of casting
- `authService`: Create DTOs for `checkCode`, `retryActive`, `retryPassword`, `changePassword`, `profile` responses
- Auth components: Type the props and form values
- `backend.d.ts`: Type `queryParams` as `Record<string, string | number | boolean>`, `headers` as `HeadersInit | Record<string, string>`, etc.

**Files:** `src/auth.ts`, `src/services/auth.ts`, `src/components/auth/*.tsx`, `src/types/backend.d.ts`

---

## Issue 9: `window as any` for Theme Toggle

**Problem:** `navbar.tsx` calls `(window as any).toggleTheme?.()`, `theme-provider.tsx` sets `(window as any).toggleTheme`. No type declaration.

**Fix:** Extend the `Window` interface in a `.d.ts` file:
```ts
interface Window { toggleTheme?: () => void; }
```

**Files:** `src/components/header/navbar.tsx`, `src/components/theme-provider.tsx`

---

## Issue 10: Possibly Dead Code

**Problem:**
- `src/utils/cart.ts` + `src/dto/cart.ts` — localStorage cart, only imported by ProductGrid
- `PaginatedProductsResponse` in `dto/product.ts` — exported but never imported
- `src/utils/customHook.ts` — may be unused

**Fix:** Verify imports via grep. Delete confirmed dead code.

**Files:** listed above

**Verified (2026-03-28):**
- `PaginatedProductsResponse` — imported by `src/services/product.ts` → NOT dead
- `useHasMounted` in `customHook.ts` — imported by `src/components/auth/modal.reactive.tsx` → NOT dead
- `src/utils/cart.ts` + `src/dto/cart.ts` — cart dead code, belongs to T2-01 scope

---

## Planning Decisions

### Fix vibe-coding inconsistencies — Breakdown (2026-03-28)
- **Decision:** Group 10 issues into 6 T2 features by functional area, not by issue number
  **Rationale:** Issues 1+4+10 all relate to cart; issues 2+3 both relate to DTO duplication; issues 7+8(backend)+9+10(non-cart) are small infra fixes. Grouping by area reduces context-switching and enables parallel execution.
- **Decision:** Cart fix (T2-1) scheduled late in execution order despite being CRITICAL
  **Rationale:** Cart fix depends on canonical DTOs (T2-2) and proper error handling (T2-4) being in place first. Fixing cart on a broken foundation would require rework.
- **Decision:** sendRequest error handling (T2-4) is a breaking change, not a wrapper
  **Rationale:** Adding a wrapper leaves the original silent-failure path available — callers would need to opt-in. Changing the core behavior forces all callers to handle errors, which is the goal.
- **Decision:** Add T2-7 to remove dark mode entirely
  **Rationale:** Dark mode was vibe-coded but never polished — inconsistent coverage (~10 files). Removing it simplifies the codebase and eliminates Issue 9 (`window as any` for toggleTheme) as a side effect. T2-06 scope for Issue 9 becomes moot once dark mode is removed.
- **Scope boundary:** No new features. No backend changes. Only intentional UI change is dark mode removal — the app should otherwise behave identically (except the cart bug fix) after completion.

### Single canonical product variant and media DTOs — Planning (2026-03-28)
- **Decision:** Keep `MediaEntity` in `dto/product.ts`, not a separate file
  **Rationale:** It's already there, used by `ProductDto` and `ProductVariantWithMediaEntity` in the same file. Moving adds a file for no consumer benefit.
- **Decision:** Standardize on `ProductVariantEntity` name, drop all `ProductVariantDto` aliases
  **Rationale:** OpenAPI schema uses `ProductVariantEntity`. The `Dto` alias in `product-variant.ts` was a compat shim that caused the name collision with the different `ProductVariantDto` in `product-detail.ts`.
- **Decision:** Delete `AggregatedProductData` from `product-detail.ts`
  **Rationale:** Never imported by any file — confirmed dead code.
- **Scope boundary:** Only DTO consolidation and import updates. No behavioral changes. No changes to Create/Update DTOs.

### Infrastructure types and dead code cleanup — Planning (2026-03-28)
- **Decision:** Phase A types IRequest fields properly — `queryParams` as `Record<string, string | number | boolean>`, `headers` as `HeadersInit | Record<string, string>`, `nextOption` as `{ revalidate?: number | false; tags?: string[] }`, `body` as `Record<string, unknown>`
  **Rationale:** These are the actual shapes used by callers. Strictest types that still fit current usage.
- **Decision:** Phase B (window.toggleTheme typing) is kept despite T2-07 removing dark mode
  **Rationale:** T2-06 and T2-07 are parallel in execution order. If T2-06 lands first, the `as any` casts should be fixed. If T2-07 lands first, Phase B becomes a no-op (files already deleted). No conflict either way.
- **Decision:** `authenticate()` stays in `actions.ts`, its `as any` casts belong to T2-05 (auth layer)
  **Rationale:** `authenticate()` is used by the login page and is auth-domain code. Its error typing is an auth concern, not infra.
- **Decision:** `PaginatedProductsResponse` and `useHasMounted` are NOT dead code
  **Rationale:** Both have active consumers — `product.ts` service and `modal.reactive.tsx` respectively. Version doc Issue 10 was incorrect.
- **Scope boundary:** Only `backend.d.ts` types, `window` type declaration, and dead server action removal. No behavioral changes.

## Infrastructure types and dead code cleanup (t2-codebase-health-06)

### Summary
- Replaced 4 `any` fields in `IRequest` (`backend.d.ts`) with proper types: `body` → `object | FormData`, `queryParams` → `Record<string, string | number | boolean>`, `headers` → `Record<string, string>`, `nextOption` → `{ revalidate?: number | false; tags?: string[] }`
- Created `src/types/window.d.ts` with `Window.toggleTheme` declaration, removed `as any` casts from navbar and theme-provider
- Deleted 3 dead server actions (`handleCreateUserAction`, `handleUpdateUserAction`, `handleDeleteUserAction`) from `utils/actions.ts`
- Verified `PaginatedProductsResponse` and `useHasMounted` are NOT dead code (both have active consumers)

### Implementation
- Phase A: Type IRequest properly — 5 tasks (4 field replacements + tsc)
- Phase B: Fix window as any — 4 tasks (create .d.ts, update 2 files, tsc)
- Phase C: Remove dead code — 3 tasks (delete functions, clean imports, tsc)
- Phase D: Verify dead code claims — 3 tasks (2 confirmations, update Issue 10 notes)

### Files Changed
- `src/types/backend.d.ts` — IRequest fields typed properly, no more `any`
- `src/types/window.d.ts` — new file, Window interface extension for toggleTheme
- `src/components/theme-provider.tsx` — `(window as any).toggleTheme` → `window.toggleTheme`
- `src/components/header/navbar.tsx` — `(window as any).toggleTheme?.()` → `window.toggleTheme?.()`
- `src/utils/actions.ts` — removed 3 dead server actions, kept only `authenticate()`

---

## Single canonical product variant and media DTOs (t2-codebase-health-02)

### Summary
- Deleted duplicate `ProductVariantDto` (incomplete, 7 missing fields) from `dto/product-detail.ts`
- Deleted duplicate `MediaDto` (missing 4 boolean flags, had non-existent `altText`) from `dto/product-detail.ts`
- Deleted dead `AggregatedProductData` interface (zero consumers)
- Removed `ProductVariantDto` compatibility alias from `dto/product-variant.ts`
- Updated 6 consumer files to import `ProductVariantEntity` from `@/dto/product-variant`

### Implementation
- Phase A: Consolidate Media type — 3 tasks (delete MediaDto, update ReviewWithMedia, add import)
- Phase B: Consolidate ProductVariant type — 9 tasks (delete duplicate, remove alias, update 6 consumers + annotations)
- Phase C: Clean up product-detail.ts — 2 tasks (delete AggregatedProductData, verify remaining exports)
- Phase D: Verify — 2 tasks (tsc pass, grep clean)

### Files Changed
- `src/dto/product-detail.ts` — removed ProductVariantDto, MediaDto, AggregatedProductData; added MediaEntity import for ReviewWithMedia
- `src/dto/product-variant.ts` — removed ProductVariantDto alias
- `src/services/product.ts` — import switched to ProductVariantEntity from product-variant
- `src/app/(user)/product/[id]/page.tsx` — import + type annotations updated
- `src/components/product/ProductInfo.tsx` — import + type annotations updated
- `src/components/product/ReviewSection.tsx` — import + type annotations updated
- `src/components/product/ReviewItem.tsx` — import + type annotations updated
- `src/components/product/ReviewForm.tsx` — import + type annotations updated

### Consistent session token access — Planning (2026-03-28)
- **Decision:** Standardize on `session.user.access_token` as the single canonical path
  **Rationale:** `auth.ts` session callback only sets `session.user = token.user` — the top-level `session.access_token` is declared in `next-auth.d.ts` but never populated, so it's always `undefined` at runtime. The `||` fallback in admin pages masks this.
- **Decision:** Remove `access_token`, `refresh_token`, `access_expire`, `error` from the `Session` interface entirely
  **Rationale:** None of these are set in the session callback. They exist on `JWT` (where they're used internally by NextAuth), but exposing them on `Session` is misleading and invites the wrong access pattern.
- **Scope boundary:** Only type declaration cleanup and 3 admin page caller fixes. No changes to `auth.ts` callbacks or JWT structure. `as any` casts in `auth.ts` belong to T2-05.

### Remove dark mode — Planning (2026-03-28)
- **Decision:** Keep `lib/theme.ts` and light-mode CSS variables in `styles/theme.css` — only remove the dark theme block
  **Rationale:** The CSS variable system (`theme.bg.primary`, `theme.gradient.header`, etc.) is used by navbar, ProductCard, and toast for light-mode styling. Removing it would require rewriting those components.
- **Decision:** Strip `dark:` classes from shadcn/ui components rather than leaving them
  **Rationale:** With dark mode infra deleted, `dark:` classes are dead code. Stripping them keeps the codebase honest — no dark mode means no dark mode classes.
- **Decision:** Delete `src/types/window.d.ts` (created by T2-06 Phase B for `window.toggleTheme` typing)
  **Rationale:** T2-06 and T2-07 are parallel. T2-06 typed the `as any` casts; T2-07 removes the feature entirely. The type declaration has no remaining consumers.
- **Decision:** Remove `suppressHydrationWarning` from `<html>` tag
  **Rationale:** It was added solely to prevent React hydration mismatch when ThemeProvider toggled the `dark` class client-side. Without ThemeProvider, there's no mismatch risk.
- **Scope boundary:** Only dark mode removal. No changes to light-mode styling, CSS variable values, or component behavior. The `theme.ts` utility and `:root` CSS vars are untouched.
- **Decision (follow-up):** Restyle header to dark gradient with white text/logo
  **Rationale:** With dark mode removed, the header was plain white — user wanted a dark header bar as the design direction. Changed `--gradient-header` to `#1a1a1a → #111111`, all navbar text to white.
- **Decision (follow-up):** Enforce `--radius: 0` globally
  **Rationale:** Design system is sharp/geometric. The `0.625rem` radius was a shadcn default, not a design choice. Set to 0, added rule to CLAUDE.md.
- **Decision (follow-up):** Strip gamified animations from ProductCard
  **Rationale:** Corner brackets, floating shapes, scan lines, grid overlays, and gradient overlays were vibe-coded and didn't match the clean/minimal aesthetic. Replaced with simple `border hover:border-black` and subtle image zoom.

---

## Remove dark mode (t2-codebase-health-07)

### Summary
- Deleted dark mode infrastructure: `theme-provider.tsx`, `window.d.ts`, dark CSS var blocks, `.dark` shadcn block, `@custom-variant dark`
- Stripped `dark:` Tailwind classes from layout, 7 shadcn/ui components, and ProductCard
- Removed ThemeProvider wrapper, theme toggle button (Moon/Sun), isDark state from navbar
- Restyled header to dark gradient (`#1a1a1a → #111111`) with white text, white logo, dark search input
- Set `--radius: 0` globally (design system: sharp edges)
- Rewrote ProductCard — removed all gamified decorations (corner brackets, floating shapes, scan lines, grid/gradient overlays), replaced with minimal border + subtle image zoom

### Implementation
- Phase A: Remove dark mode infrastructure — 5 tasks (delete 2 files, remove dark blocks from theme.css + globals.css)
- Phase B: Clean navbar — 4 tasks (remove toggle UI, isDark state, duplicate logo)
- Phase C: Strip dark: classes — 9 tasks (layout + ProductCard + 7 shadcn/ui components)
- Phase D: Clean layout.tsx — 4 tasks (remove ThemeProvider, suppressHydrationWarning, transition)
- Phase E: Restyle header to dark gradient — 4 tasks (CSS var, navbar colors, search input)
- Phase F: Design system radius — 3 tasks (--radius: 0, remove rounded, CLAUDE.md rule)
- Phase G: Simplify ProductCard — 10 tasks (remove all game-UI decorations, rewrite to minimal)
- Phase H: Verify — 3 tasks (tsc, grep checks)

### Files Changed
- `src/components/theme-provider.tsx` — deleted (dark mode toggle logic)
- `src/types/window.d.ts` — deleted (toggleTheme type declaration)
- `src/styles/theme.css` — removed dark theme block (57 lines), changed `--gradient-header` to dark
- `src/app/globals.css` — removed `.dark` block, `@custom-variant dark`, set `--radius: 0`
- `src/app/layout.tsx` — removed ThemeProvider wrapper, suppressHydrationWarning, dark: classes, transition
- `src/components/header/navbar.tsx` — removed toggle button/isDark state/Moon+Sun imports/duplicate logo; restyled to white text, dark search input
- `src/components/product/ProductCard.tsx` — full rewrite: removed game-UI decorations, theme import, inline JS hover handlers; now minimal border + subtle zoom
- `src/components/ui/button.tsx` — stripped dark: class segments
- `src/components/ui/input.tsx` — stripped dark: class segments
- `src/components/ui/textarea.tsx` — stripped dark: class segments
- `src/components/ui/badge.tsx` — stripped dark: class segments
- `src/components/ui/select.tsx` — stripped dark: class segments
- `src/components/ui/switch.tsx` — stripped dark: class segments
- `src/components/ui/tabs.tsx` — stripped dark: class segments
- `CLAUDE.md` — added border-radius rule

---

### API errors surfaced, not swallowed — Planning (2026-03-28)
- **Decision:** Make `sendRequest` throw `ApiError` on `!res.ok` — breaking change, not a wrapper
  **Rationale:** Per earlier planning decision. Wrapper leaves silent-failure path available. Breaking change forces all 20 consumer files to handle errors.
- **Decision:** Create typed `ApiError` class extending `Error` with `statusCode`, `message`, `error` fields
  **Rationale:** Callers need structured error info (e.g., `auth.ts` checks statusCode 401 vs 400). A plain `Error` loses this.
- **Decision:** Files with existing try/catch (10 files) need no structural change — thrown errors propagate through service layer into existing catch blocks
  **Rationale:** Services don't catch — they just `return sendRequest(...)`. Throw propagates to the page/component consumer.
- **Decision:** Files using `(res as any).statusCode >= 400` pattern (ProfileContent, ProductForm) must be rewritten to try/catch
  **Rationale:** The `as any` cast was needed because `IBackendRes<T>` doesn't distinguish success from error. With throw-on-error, this pattern is unnecessary.
- **Scope boundary:** Only `sendRequest`/`sendRequestFile` throw behavior and caller updates. No service layer changes. No new UI components. Toast system already exists.

---

## API errors surfaced, not swallowed (t2-codebase-health-04)

### Summary
- Created typed `ApiError` class (`statusCode`, `message`, `error` fields) at `src/utils/api-error.ts`
- Changed `sendRequest` and `sendRequestFile` to throw `ApiError` on `!res.ok` instead of returning error responses cast as `T`
- Replaced `options: any` with `RequestInit` in both functions
- Updated 8 consumer files with new try/catch error handling patterns
- 10 files with existing try/catch required no changes — thrown errors now propagate into previously-dead catch blocks
- Removed all `(res as any).statusCode` cast patterns

### Implementation
- Phase A: Create ApiError and update sendRequest — 4 tasks (new class, update 2 functions, type options)
- Phase B: Update auth layer callers — 6 tasks (auth.ts, signup, forgot-password, change-password, verify, modal.reactive)
- Phase C: Update profile/admin callers — 2 tasks (ProfileContent remove `as any` pattern, ProductForm switch to `Promise.allSettled`)
- Phase D: Verify remaining callers — 2 tasks (both already had try/catch, no changes needed)
- Phase E: Verify — 3 tasks (tsc pass, grep clean)

### Files Changed
- `src/utils/api-error.ts` — new file, `ApiError` class extending `Error`
- `src/utils/api.ts` — `sendRequest`/`sendRequestFile` throw `ApiError` on error; `options: any` → `RequestInit`
- `src/auth.ts` — authorize wraps login in try/catch, catches `ApiError` for 401/400
- `src/app/auth/signup/page.tsx` — try/catch around `authService.signup()`
- `src/app/auth/forgot-password/page.tsx` — try/catch around `authService.retryPassword()`
- `src/app/auth/change-password/page.tsx` — try/catch around `retryPassword()` and `changePassword()`
- `src/components/auth/verify.tsx` — try/catch around `authService.checkCode()`
- `src/components/auth/modal.reactive.tsx` — try/catch around `retryActive()` and `checkCode()`
- `src/components/profile/ProfileContent.tsx` — removed `(res as any).statusCode >= 400` pattern, catch `ApiError` instead
- `src/app/admin/products/_components/ProductForm.tsx` — `Promise.all` → `Promise.allSettled`, removed `resAny.statusCode` cast

---

### Cart system works end-to-end — Planning (2026-03-28)
- **Decision:** No need to migrate ProductGrid to API cart — quick-add button was removed during t2-07 ProductCard rewrite. The localStorage cart is entirely dead code.
  **Rationale:** `ProductCard.onQuickAdd` prop exists in the interface but is never rendered (no button calls it). `ProductGrid.handleQuickAdd` and the `addToCart` import are unreachable dead code.
- **Decision:** Estimate reduced from 8pts to 5pts
  **Rationale:** Original 8pts assumed rewriting ProductGrid's add-to-cart flow from localStorage to API. With quick-add removed, the work is: type `getCartDetails` (Issue 4), extract shared mapping, delete dead code (Issues 1+10). One end-to-end slice, not a cross-cutting rewrite.
- **Decision:** Add `CartItemWithVariantEntity` and `CartDetailEntity` DTOs matching OpenAPI schema, reusing `ProductVariantWithMediaEntity` from `dto/product.ts`
  **Rationale:** The OpenAPI spec defines these entities. `getCartDetails` returns `CartDetailEntity` which contains `cartItems: CartItemWithVariantEntity[]`. Each item has a nested `productVariant: ProductVariantWithMediaEntity`.
- **Decision:** Extract `mapCartItemToDetails()` as a shared function rather than duplicating mapping in cart + checkout
  **Rationale:** Cart page and checkout page have identical 10-line mapping blocks converting `CartItemWithVariantEntity` → `CartItemWithDetails`.
- **Scope boundary:** Only cart typing, mapping dedup, and dead code deletion. No changes to cart API endpoints, cart service methods, or add-to-cart flows (ProductInfo's API cart flow is already correct).

---

## Cart system works end-to-end (t2-codebase-health-01)

### Summary
- Created `CartItemWithVariantEntity` and `CartDetailEntity` DTOs matching OpenAPI schema in `src/dto/cart-api.ts`
- Typed `cartService.getCartDetails()` from `IBackendRes<any>` to `IBackendRes<CartDetailEntity>`
- Extracted shared `mapCartItemToDetails()` function, replacing duplicated 10-line `as any` mapping blocks in cart page and checkout page
- Removed dead localStorage cart system: `handleQuickAdd` in ProductGrid, `onQuickAdd` prop in ProductCard, `src/utils/cart.ts`, `src/dto/cart.ts`

### Implementation
- Phase A: Create cart detail DTOs and type getCartDetails — 3 tasks (2 DTOs, 1 service type fix)
- Phase B: Extract shared mapping, remove as any — 3 tasks (mapping function, cart page, checkout page)
- Phase C: Remove dead quick-add and localStorage cart — 4 tasks (ProductGrid, ProductCard, delete 2 files)
- Phase D: Verify — 3 tasks (tsc, grep as any, grep dead imports)

### Files Changed
- `src/dto/cart-api.ts` — added `CartItemWithVariantEntity`, `CartDetailEntity`, `mapCartItemToDetails()`
- `src/services/cart.ts` — `getCartDetails()` typed `IBackendRes<CartDetailEntity>`
- `src/app/(user)/cart/page.tsx` — replaced `as any` mapping with `mapCartItemToDetails`
- `src/app/(user)/checkout/page.tsx` — replaced `as any` mapping with `mapCartItemToDetails`
- `src/components/product/ProductGrid.tsx` — removed dead `handleQuickAdd`, `addToCart` import, `onQuickAdd` prop pass
- `src/components/product/ProductCard.tsx` — removed `onQuickAdd` from props interface
- `src/utils/cart.ts` — deleted (localStorage cart dead code)
- `src/dto/cart.ts` — deleted (localStorage cart DTOs dead code)

### Auth layer fully typed — Planning (2026-03-28)
- **Decision:** Extend NextAuth `User` interface with custom fields (`access_token`, `role`, `isAdmin`, `firstName`, `lastName`) to eliminate all 13 `(user as any)` casts in `auth.ts`
  **Rationale:** NextAuth's default `User` only has `id`, `name`, `email`, `image`. Our `authorize()` and `signIn()` callbacks attach custom fields which require `as any`. Extending the type makes them first-class.
- **Decision:** Create `AuthResponseEntity` and `ProfileResponseEntity` DTOs from OpenAPI schemas for the 4 `IBackendRes<any>` endpoints (`checkCode`, `retryActive`, `retryPassword`, `changePassword`, `profile`)
  **Rationale:** These endpoints have well-defined response schemas in openapi.json. `checkCode` returns `UserEntity`, `retryActive`/`retryPassword`/`changePassword` return `AuthResponseEntity`, `profile` returns `ProfileResponseEntity`.
- **Decision:** Type `ProfileData` strictly — remove `[key: string]: any` index signature, use `UserEntity` fields from API
  **Rationale:** The index signature was a workaround for unknown profile shape. With `userService.getUser` properly typed, we know the exact fields.
- **Decision:** Use `instanceof` checks for auth errors in `actions.ts` instead of `(error as any).name`
  **Rationale:** `InvalidEmailPasswordError` and `InactiveAccountError` extend `AuthError` — `instanceof` is type-safe and eliminates the cast.
- **Decision:** Clean unused JWT fields (`refresh_token`, `access_expire`, `error`) — they are declared but never set
  **Rationale:** T2-03 removed them from `Session` but left them on `JWT`. They're vestigial.
- **Scope boundary:** Only auth-related `any` removal. Cart `as any` belongs to T2-01. `theme.ts` internal `any` is a utility concern. `AddressModal` catch `err: any` is a minor catch-block issue, not auth scope.
