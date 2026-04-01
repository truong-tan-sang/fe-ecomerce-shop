# Codebase Health

## Non-Technical Description

Cross-cutting cleanup module that fixes inconsistencies introduced during rapid vibe-coding in v1.0.0. No new features — only type safety, error handling, and dead code removal. The goal is a reliable foundation for future feature work.

- Canonical DTOs: single `ProductVariantEntity` and `MediaEntity` used everywhere
- Session tokens: accessed consistently via `session.user.access_token`
- Error handling: `sendRequest` throws `ApiError` on HTTP errors; all callers use try/catch with structured error display
- Infrastructure types: `IRequest` fields fully typed (no `any`)
- Cart system: single API cart (`cartService`), fully typed `CartDetailEntity` response, no localStorage cart
- Dark mode: removed entirely (light-only design system with CSS variables)

## Technical Implementation

### API Error Handling (`src/utils/api.ts`, `src/utils/api-error.ts`)
- `sendRequest<T>()` and `sendRequestFile<T>()` throw `ApiError` when `!res.ok`
- `ApiError` extends `Error` with `statusCode: number`, `message: string`, `error: string | string[]`
- All service consumers catch `ApiError` for structured error messages (toast, alert, state)
- Services (`src/services/*.ts`) are pass-through — they don't catch, so throws propagate to page/component consumers

### Consumer Error Patterns
- **Auth layer** (`src/auth.ts`): catches `ApiError`, maps 401→InvalidEmailPasswordError, 400→InactiveAccountError
- **Auth pages** (signup, forgot-password, change-password, verify, modal.reactive): try/catch with notification toast
- **Profile/Admin pages**: try/catch with error state or alert
- **Pages with existing try/catch** (cart, checkout, product detail, homepage, admin lists): throws propagate into existing catch blocks

### DTO Consolidation (`src/dto/`)
- `ProductVariantEntity` in `dto/product-variant.ts` — single canonical type (OpenAPI-aligned)
- `MediaEntity` in `dto/product.ts` — single canonical type with all boolean flags
- Deleted: duplicate `ProductVariantDto`, `MediaDto`, `AggregatedProductData` from `dto/product-detail.ts`

### Session Token Access
- Single path: `session.user.access_token` (via `IUser` interface)
- Removed: `Session.access_token`, `Session.refresh_token`, `Session.access_expire`, `Session.error` from `next-auth.d.ts`

### Infrastructure Types (`src/types/backend.d.ts`)
- `IRequest.body`: `object | FormData`
- `IRequest.queryParams`: `Record<string, string | number | boolean>`
- `IRequest.headers`: `Record<string, string>`
- `IRequest.nextOption`: `{ revalidate?: number | false; tags?: string[] }`

### Cart System (`src/services/cart.ts`, `src/dto/cart-api.ts`)
- Single API cart via `cartService` — no localStorage cart (deleted `utils/cart.ts` + `dto/cart.ts`)
- `CartDetailEntity` and `CartItemWithVariantEntity` DTOs match OpenAPI schema
- `getCartDetails()` returns typed `IBackendRes<CartDetailEntity>` (was `any`)
- Shared `mapCartItemToDetails()` converts API entity → UI `CartItemWithDetails` (used by cart page + checkout page)
- ProductGrid no longer has quick-add; ProductCard has no `onQuickAdd` prop

### Dark Mode Removal
- Deleted: `theme-provider.tsx`, `window.d.ts`, dark CSS blocks, `dark:` Tailwind classes
- Design system: `--radius: 0` (sharp edges), dark header gradient, light body

## Version History

- [v1.1.0] — Canonical DTOs (t2-02), session token consistency (t2-03), API error handling (t2-04), cart system typed + dead code removed (t2-01), infra types + dead code cleanup (t2-06), dark mode removal (t2-07)
