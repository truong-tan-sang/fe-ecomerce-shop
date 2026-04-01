# Admin Products — v1.1.0

## Fix voucherId FK violation + infinite scroll with virtualization (t2-admin-products-01)

### Summary
- Fixed `Products_voucherId_fkey` FK constraint error when creating products without a voucher — `voucherId` is now optional, omitted from request when null
- Replaced click-based pagination with infinite scroll that auto-fetches next page on scroll
- Added row virtualization via `@tanstack/react-virtual` — only visible rows render in DOM
- Replaced large category card grid with compact horizontal chip bar
- Fixed double scrollbar by making admin layout and page `h-screen overflow-hidden` with flex column layout

### Implementation
- Phase 1: voucherId bug fix — 2 tasks (DTO + form fallback)
- Phase 2: infinite scroll + virtualization — replaced pagination state with accumulated products, added `@tanstack/react-virtual` virtualizer, switched table rows from `<tr>` to CSS Grid divs for correct absolute positioning
- Phase 3: layout fix — compact category chips, `h-screen overflow-hidden` on page + admin layout, flex-1 table container

### Files Changed
- `src/dto/product.ts` — made `voucherId` optional in `CreateProductDto`
- `src/app/admin/products/_components/ProductForm.tsx` — changed voucherId fallback from `0` to `undefined`
- `src/app/admin/products/list/page.tsx` — full rewrite: infinite scroll, virtualized rows, compact category chips, no pagination
- `src/app/admin/layout.tsx` — `h-screen overflow-hidden` on root + `overflow-hidden` on main (no double scrollbar)
