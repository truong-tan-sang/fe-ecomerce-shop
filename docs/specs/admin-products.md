# Admin Products

## Non-Technical Description

Admin interface for managing the product catalog. Admins can create and edit products with images, manage product variants using a size-by-color matrix, upload color-specific images, and browse products in a virtualized infinite-scroll list.

- Product add form with basic info, image upload, variant matrix (size x color), color-specific images
- Product edit form (same form, pre-populated)
- Product list with search, horizontal category chip filter, status tabs (all/on sale/out of stock), infinite scroll with row virtualization, delete
- Color management (create new colors inline during product creation)
- Variant creation with dimensions (weight, height, width, length) and SKU
- VoucherId is optional on product creation — omitted when no voucher is selected

## Technical Implementation

**Pages:**
- `src/app/admin/products/add/page.tsx` → renders `ProductForm`
- `src/app/admin/products/edit/[id]/page.tsx` → renders `ProductForm` with product ID
- `src/app/admin/products/list/page.tsx` — client component with search, filters, infinite scroll (virtualized via `@tanstack/react-virtual`), delete dialog
- `src/app/admin/products/media/page.tsx` — stub (TODO)
- `src/app/admin/products/reviews/page.tsx` — stub (TODO)

**Components:**
- `src/app/admin/products/_components/ProductForm.tsx` — main form orchestrator
- `src/app/admin/products/_components/ProductBasicInfoCard.tsx` — name, description, price, stock, category, status
- `src/app/admin/products/_components/ProductImageCard.tsx` — product image upload
- `src/app/admin/products/_components/VariantMatrixSection.tsx` — size x color matrix with stock/price per cell
- `src/app/admin/products/_components/ColorImageUploadSection.tsx` — per-color image upload
- `src/app/admin/products/_components/ProductFormActions.tsx` — save/cancel buttons

**Types:** `src/app/admin/products/_types.ts` — `ProductFormState`, `VariantMatrix`, `ColorEntry`, `ColorImage`
**Constants:** `src/app/admin/products/_constants.ts`

**Services used:** `productService` (CRUD + file upload), `productVariantService` (CRUD + file upload), `categoryService.getAllCategories`, `colorService` (CRUD)

**DTOs:**
- `ProductDto`, `CreateProductDto`, `UpdateProductDto` — `src/dto/product.ts`
- `ProductVariantEntity`, `CreateProductVariantDto`, `UpdateProductVariantDto` — `src/dto/product-variant.ts` (canonical variant type)
- `ProductVariantWithMediaEntity` — `src/dto/product.ts` (variant + media[], used in ProductDto)
- `MediaEntity` — `src/dto/product.ts` (canonical media type, also used by `ReviewWithMedia` in `dto/product-detail.ts`)
- `ProductDetailDto`, `ReviewDto`, `ReviewWithMedia`, `CreateReviewDto`, `UpdateReviewDto` — `src/dto/product-detail.ts`
- `ColorEntity`, `CreateColorDto` — `src/dto/color.ts`

## Version History
- v1.0.0 — Baseline: product CRUD with variants, images, color management
- v1.1.0 — Consolidated duplicate ProductVariant and Media types into single canonical DTOs
- v1.1.0 — Fixed voucherId FK violation on product creation; replaced pagination with infinite scroll + virtualization; compact category chips; overflow-hidden admin layout
