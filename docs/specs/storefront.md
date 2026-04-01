# Storefront

## Non-Technical Description

The public-facing shopping experience. Users land on the homepage, browse products with infinite scrolling, and click into product detail pages to see images, variant options (size/color), pricing, and customer reviews. The header uses a dark gradient bar with white text/logo and a search input. Product cards are minimal — clean borders, subtle hover, no decorative animations.

- Homepage with hero banner and product grid (SSR initial load + client-side infinite scroll)
- Product detail page with image gallery, variant selection, review section
- Average rating calculation from customer reviews
- Dark header with white logo (`LOGO-dark.svg`), search bar, cart, account dropdown
- Light-only theme — no dark mode support

## Technical Implementation

**Pages:**
- `src/app/(user)/homepage/page.tsx` — SSR, fetches 20 products via `productService.getAllProducts()`, passes to `ProductGrid`
- `src/app/(user)/product/[id]/page.tsx` — SSR, parallel fetch (product + variants + reviews via `Promise.all`), 404 via `notFound()`

**Components:**
- `src/components/product/ProductGrid.tsx` — infinite scroll product listing
- `src/components/product/ProductCard.tsx` — minimal card: image with subtle scale hover, stock/variant badges, color swatches. No gradients, no game-UI decorations
- `src/components/product/ProductGallery.tsx` — image gallery on detail page
- `src/components/product/ProductInfo.tsx` — variant selection, pricing display
- `src/components/product/ReviewSection.tsx` — reviews display
- `src/components/home/HeroBanner.tsx` — hero banner
- `src/components/header/navbar.tsx` — dark gradient header (`--gradient-header`), white text, auto-hide on scroll, account dropdown (light-themed overlay), search input with `bg-white/10`

**Design system:**
- `src/styles/theme.css` — CSS custom properties for colors, shadows, gradients (light only, no dark block)
- `src/lib/theme.ts` — TypeScript utility for type-safe access to CSS vars
- `src/app/globals.css` — `--radius: 0` (sharp edges throughout), shadcn color tokens (light only)

**Services used:** `productService.getAllProducts`, `getProductById`, `getProductVariants`, `getProductReviews`

**DTOs:** `ProductDto`, `ProductDetailDto`, `ProductVariantEntity` (from `dto/product-variant.ts`), `ReviewDto`

## Version History
- v1.0.0 — Baseline: homepage with infinite scroll, product detail with gallery/variants/reviews
- v1.1.0 — Removed dark mode, restyled header to dark gradient, simplified ProductCard (no gamified animations), enforced `--radius: 0`
