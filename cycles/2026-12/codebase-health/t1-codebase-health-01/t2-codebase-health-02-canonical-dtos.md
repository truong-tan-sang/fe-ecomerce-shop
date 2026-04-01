# Single canonical product variant and media DTOs

Work Item: t2-codebase-health-02
Tier 1: t1-codebase-health-01 [v1.1.0 | Codebase Health] Fix vibe-coding inconsistencies (In Progress)
Module: Codebase Health
Spec: docs/specs/admin-products.md (DTOs section)
Version Doc: docs/versions/v1.1.0/codebase-health.md
Siblings: 6 total, 0 Done — t2-codebase-health-01 Cart (Todo), t2-codebase-health-03 Session tokens (Todo), t2-codebase-health-04 Error handling (Todo), t2-codebase-health-05 Auth typed (Todo), t2-codebase-health-06 Infra cleanup (Todo)
Execution Order: Step 1 of 3 — no blockers (parallel with t2-03 and t2-06)

## Context

Non-tech: Eliminate duplicate/conflicting type definitions for product variants and media so the codebase has one source of truth per API entity.
Tech: Three ProductVariant shapes across dto/product-detail.ts, dto/product-variant.ts, dto/product.ts. Two Media shapes across dto/product-detail.ts and dto/product.ts. OpenAPI spec is the authority. Six consumer files need import updates.
Related: [Cart] — cart DTOs reference ProductVariantWithMediaEntity; [Admin Products] — admin form uses ProductVariantEntity

## Phase A: Consolidate Media type

- [x] Delete `MediaDto` interface from `src/dto/product-detail.ts`
- [x] Update `ReviewWithMedia` in `src/dto/product-detail.ts` to use `MediaEntity` from `@/dto/product` for its `medias` field
- [x] Add `import type { MediaEntity } from "@/dto/product"` to `src/dto/product-detail.ts`

## Phase B: Consolidate ProductVariant type

- [x] Delete the incomplete `ProductVariantDto` interface from `src/dto/product-detail.ts`
- [x] Remove the `export type ProductVariantDto = ProductVariantEntity` alias from `src/dto/product-variant.ts`
- [x] Update `src/services/product.ts` — change `ProductVariantDto` import to `ProductVariantEntity` from `@/dto/product-variant`
- [x] Update `src/app/(user)/product/[id]/page.tsx` — change `ProductVariantDto` import to `ProductVariantEntity` from `@/dto/product-variant`
- [x] Update `src/components/product/ReviewSection.tsx` — change `ProductVariantDto` import to `ProductVariantEntity` from `@/dto/product-variant`
- [x] Update `src/components/product/ReviewItem.tsx` — change `ProductVariantDto` import to `ProductVariantEntity` from `@/dto/product-variant`
- [x] Update `src/components/product/ReviewForm.tsx` — change `ProductVariantDto` import to `ProductVariantEntity` from `@/dto/product-variant`
- [x] Update `src/components/product/ProductInfo.tsx` — change `ProductVariantDto` import to `ProductVariantEntity` from `@/dto/product-variant`
- [x] Update all type annotations in these files: `ProductVariantDto` → `ProductVariantEntity`

## Phase C: Clean up product-detail.ts

- [x] Delete `AggregatedProductData` interface (never imported — dead code)
- [x] Verify `product-detail.ts` retains only: `ProductDetailDto`, `ReviewDto`, `ReviewWithMedia`, `CreateReviewDto`, `UpdateReviewDto`

## Phase D: Verify

- [x] Run `npx tsc --noEmit` — zero errors
- [x] Grep for any remaining references to `ProductVariantDto`, `MediaDto`, `AggregatedProductData` — should find none
