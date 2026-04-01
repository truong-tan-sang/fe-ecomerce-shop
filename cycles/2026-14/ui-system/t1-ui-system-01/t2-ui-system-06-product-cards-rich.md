# Product cards show rich data and correct images

Work Item: t2-ui-system-06
Tier 1: t1-ui-system-01 [v1.1.0 | UI System] Standardize customer UI on shadcn/ui (In Progress)
Module: UI System
Spec: docs/specs/ui-system.md
Version Doc: docs/versions/v1.1.0/ui-system.md
Siblings: 6 total, 3 Done — t2-ui-system-01 Foundation (Done), t2-ui-system-02 Auth (Done), t2-ui-system-03 Customer pages (In Progress), t2-ui-system-04 Navbar (Done), t2-ui-system-05 Remove antd (Todo)
Execution Order: Step 4 of 4 — no blockers (independent of other steps)

## Context

Non-tech: Product cards currently show wrong images (variant images instead of per-color browsing images), no color swatches, no discount info, and hardcoded sizes/colors on the detail page. Fix all of this so cards display rich, correct data and the detail page uses dynamic sizes/colors from the API.
Tech: ProductCard.tsx, ProductGrid.tsx, ProductInfo.tsx, ProductGallery.tsx, homepage/page.tsx, product/[id]/page.tsx. Color data from `GET /color` API (ColorEntity: id, name, hexCode). Product list response includes `productVariants[].media[]`. Variant images are duplicated across sizes — only differ by color. Detail page variants endpoint (`GET /products/:id/product-variants`) returns ProductVariantEntity without media; need to use product response's `productVariants` which includes media, or call `/product-variants/:id/media-list`.
Related: Product detail page image gallery is currently a placeholder — needs real images from variants.

## Phase A: Fetch colors and wire data pipeline

- [x] homepage/page.tsx — fetch `colorService.getAllColors()` in SSR, pass `colors` to ProductGrid
- [x] ProductGrid.tsx — accept `colors: ColorEntity[]` prop, pass to ProductCard and also pass through for infinite scroll pages
- [x] product/[id]/page.tsx — fetch `colorService.getAllColors()` in SSR, pass to ProductInfo
- [x] Run `npx tsc --noEmit` to verify no type errors

## Phase B: Product cards — images, swatches, price/discount

- [x] ProductCard.tsx — update props: accept `variants: ProductVariantWithMediaEntity[]` and `colors: ColorEntity[]` instead of raw `imageUrl`, `price`, `colors`
- [x] ProductCard.tsx — extract unique colors from variants using `colorId` → match to ColorEntity for hex code and name. Deduplicate by colorId.
- [x] ProductCard.tsx — image logic: pick first available size, collect first media URL from each color's variant of that size. Default to first color's image. Swatch click swaps card image.
- [x] ProductCard.tsx — price display: compute lowest variant price, highest variant price. Show lowest price. If different from highest, show strikethrough original + % off badge.
- [x] ProductGrid.tsx — update ProductCard invocation: pass full `variants` and `colors` instead of computed `imageUrl`/`price`/`colors={[]}`
- [x] ProductGrid.tsx — update infinite scroll fetch to also pass colors to new cards
- [x] Run `npx tsc --noEmit` to verify no type errors

## Phase C: Product detail page — dynamic sizes/colors and gallery

- [x] ProductInfo.tsx — remove hardcoded `STANDARD_SIZES` and `STANDARD_COLORS` constants
- [x] ProductInfo.tsx — accept `colors: ColorEntity[]` prop. Extract available sizes from `variants[].variantSize` (deduplicated). Extract available colors by matching `variants[].colorId` to ColorEntity.
- [x] ProductInfo.tsx — update size selector to render dynamic sizes from variants
- [x] ProductInfo.tsx — update color selector to use ColorEntity hex codes instead of hardcoded hex values
- [x] product/[id]/page.tsx — use product response's `productVariants` (with media) for gallery images instead of placeholder. Created ProductDetailClient wrapper.
- [x] ProductGallery.tsx — reset selectedIndex on images change (useEffect). Gallery images passed as prop from ProductDetailClient.
- [x] ProductInfo.tsx + ProductDetailClient — onColorChange callback updates gallery images to show selected color's variant media
- [x] Run `npx tsc --noEmit` to verify no type errors

## Phase D: Visual polish

- [x] ProductCard.tsx — refine hover effect (shadow on hover), improve badge positioning and styling (backdrop-blur, bold discount)
- [x] ProductCard.tsx — improve spacing between image, name, price, and swatches (gap-2.5, items-baseline on price)
- [x] ProductCard.tsx — out-of-stock: card opacity-60, image grayscale-30%, bold black "Hết hàng" badge, hide variant/discount badges
- [x] Run `npx tsc --noEmit` to verify no type errors
