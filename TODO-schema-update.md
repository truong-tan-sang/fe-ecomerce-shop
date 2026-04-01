# TODO: OpenAPI Schema Update — Remove ShopOffice & Related Changes

## Summary of Backend Changes (openapi.json vs openapi.json.old)

### Removed Endpoints (13)
- `GET/POST/DELETE /shop-offices` — CRUD for shop offices
- `GET/PUT /shop-offices/{id}` — Get/update shop office by ID
- `GET /shop-offices/{shopOfficeId}/products` — Products per shop office
- `GET /orders/{id}/shop-office` — Shop office for order
- `POST /addresses/ghn-districts` — GHN district lookup
- `POST /addresses/ghn-wards` — GHN ward lookup
- `GET /paymentMethods` — Payment methods list
- `POST/DELETE/GET /staff/{staffId}/shop-offices` — Staff-to-shop-office linking

### Removed Schemas (13)
- `ShopOfficeEntity`, `CreateShopOfficeDto`, `UpdateShopOfficeDto`, `ShopOfficeResponseDto`
- `GhnDistrictResponseDto`, `GhnProvinceResponseDto`, `GhnWardResponseDto`
- `GhnProvinceEntity`, `GhnDistrictEntity`, `GhnWardEntity`
- `PaymentMethodEntity`, `PaymentMethodResponseDto`
- `StaffShopOfficeEntity`

### Fields Removed from Existing Schemas
- `ProductEntity.shopOfficeId` — removed
- `CategoryEntity.shopOfficeId` — removed
- `AddressEntity.shopOfficeId` — removed
- `ShipmentEntity.shopOfficeId` — removed

### Endpoint Rename
- `POST /payments/vnpay-ipn` -> `POST /payments/vnpay_ipn`

### Unchanged
- `ProductVariantEntity` — no changes
- All other schemas remain the same

---

## Frontend Files Affected

### Files to DELETE
- [x] `src/dto/shop-office.ts` — DELETED
- [x] `src/services/shop-office.ts` — DELETED

### Files to MODIFY

#### 1. DTOs — Remove shopOfficeId fields
- [x] `src/dto/product.ts` — Removed `shopOfficeId` from ProductDto, CreateProductDto, UpdateProductDto
- [x] `src/dto/product-detail.ts` — Removed `shopOfficeId` from ProductDetailDto

#### 2. Product Form Types — Remove shopOfficeId from form state
- [x] `src/app/admin/products/_types.ts` — Removed `shopOfficeId` from ProductFormState

#### 3. ProductForm.tsx — Remove all shopOffice logic
- [x] Removed import of `shopOfficeService` and `ShopOfficeEntity`
- [x] Removed `shopOffices` state
- [x] Removed `shopOfficeId: null` from initialFormState
- [x] Removed `shopOfficeService.getAllShopOffices(token)` from fetchData
- [x] Removed `officeRes` handling
- [x] Removed `shopOfficeId` from product load, update, and create
- [x] Removed `shopOffices` prop from `<VariantMatrixSection />`
- [x] Added `onAddColor` prop + `handleAddColor` callback (fixes addColor bug)

#### 4. VariantMatrixSection.tsx — Remove branch tabs + fix addColor
- [x] Removed `ShopOfficeEntity` import
- [x] Removed `shopOffices` from props
- [x] Removed `activeBranch` state
- [x] Removed branch tabs UI section
- [x] Replaced local `addColor` with `onAddColor` prop (called from ProductForm's `handleAddColor` which does all 3 state updates atomically in one `setFormState`)

---

## Verification Checklist
- [x] Run `npx tsc --noEmit` — 0 errors
- [ ] Product list page loads without errors
- [ ] Add product page works (no shopOfficeId sent)
- [ ] Edit product page loads and saves correctly
- [ ] addColor function works (colors appear in matrix + colorImages)
- [ ] addSize function still works
- [ ] Delete `openapi.json.old` when done (optional, confirm with user)
