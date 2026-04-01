# Cart system works end-to-end

Work Item: t2-codebase-health-01
Tier 1: t1-codebase-health-01 [v1.1.0 | Codebase Health] (In Progress)
Module: Codebase Health
Spec: docs/specs/codebase-health.md
Version Doc: docs/versions/v1.1.0/codebase-health.md
Siblings: 7 total, 5 Done — [t2-02 DTOs (Done), t2-03 Session (Done local), t2-04 Errors (Done), t2-05 Auth typed (Todo), t2-06 Infra cleanup (Done), t2-07 Remove dark mode (Done)]
Execution Order: Step 3 of 3 — Steps 1+2 Done, no blockers

## Context

Non-tech: The homepage "quick add" button was removed during the ProductCard rewrite (t2-07). The localStorage cart system is now dead code. The API cart works but `getCartDetails` returns `any`, forcing duplicated `as any` mapping in cart page and checkout page.
Tech: `src/utils/cart.ts` + `src/dto/cart.ts` (localStorage, dead), `src/services/cart.ts` (`getCartDetails` returns `any`), `src/dto/cart-api.ts` (missing `CartDetailEntity`/`CartItemWithVariantEntity`), `src/app/(user)/cart/page.tsx` + `checkout/page.tsx` (duplicated `as any` mapping), `src/components/product/ProductGrid.tsx` (dead `handleQuickAdd`), `src/components/product/ProductCard.tsx` (dead `onQuickAdd` prop).
Related: t2-02 (canonical DTOs) — `ProductVariantWithMediaEntity` already exists in `dto/product.ts`, reused here. t2-04 (error handling) — cart/checkout already have try/catch from that work.

## Phase A: Create cart detail DTOs and type getCartDetails

- [x] Add `CartItemWithVariantEntity` interface to `src/dto/cart-api.ts` — `{ id, cartId, productVariantId, quantity, createdAt, updatedAt, productVariant: ProductVariantWithMediaEntity }` (matches OpenAPI `CartItemWithVariantEntity`)
- [x] Add `CartDetailEntity` interface to `src/dto/cart-api.ts` — `{ id, userId, createdAt, updatedAt, cartItems: CartItemWithVariantEntity[] }` (matches OpenAPI `CartDetailEntity`)
- [x] Update `cartService.getCartDetails()` return type from `IBackendRes<any>` to `IBackendRes<CartDetailEntity>`

## Phase B: Extract shared mapping, remove as any in cart/checkout

- [x] Add `mapCartItemToDetails(item: CartItemWithVariantEntity): CartItemWithDetails` function in `src/dto/cart-api.ts`
- [x] Update `src/app/(user)/cart/page.tsx` — use typed `CartDetailEntity` response + `mapCartItemToDetails` (remove `as any` casts and inline mapping)
- [x] Update `src/app/(user)/checkout/page.tsx` — same typed response + `mapCartItemToDetails` (remove `as any` casts and inline mapping)

## Phase C: Remove dead quick-add and localStorage cart code

- [x] `src/components/product/ProductGrid.tsx` — remove `handleQuickAdd` function, `addToCart` import, `onQuickAdd` prop pass to ProductCard
- [x] `src/components/product/ProductCard.tsx` — remove `onQuickAdd` from props interface
- [x] Delete `src/utils/cart.ts`
- [x] Delete `src/dto/cart.ts`

## Phase D: Verify

- [x] Run `npx tsc --noEmit` — pass
- [x] Grep for remaining `as any` in cart/checkout files — zero found
- [x] Grep for remaining `utils/cart` or `dto/cart.ts` imports — zero found
