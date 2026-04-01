# UI System

## Non-Technical Description

Cross-cutting module governing the component library strategy for the entire frontend. The project is standardized on shadcn/ui across all layers: admin, auth, navbar, and customer-facing pages. Ant Design has zero imports remaining — package removal is the final step.

- 19 shadcn/ui components installed and configured (including Checkbox, RadioGroup)
- All customer pages migrated: cart, checkout, product detail, profile pages use shadcn Button, Input, Textarea, Select, Checkbox, RadioGroup, Label
- Auth flow fully migrated: no Ant Design imports remain in `src/`
- Navbar account dropdown uses shadcn DropdownMenu
- Product cards show real variant images per color, interactive color swatches, price range with discount badges, out-of-stock styling
- Product detail page uses dynamic sizes/colors from API (no hardcoded constants), gallery syncs with color selection
- Toast system: Sonner mounted globally
- Design system: black/white, `--radius: 0`, light-only

## Technical Implementation

### Component inventory (src/components/ui/)

Button, Badge, Input, Select, Switch, Table, Tabs, Textarea, Label, Card, Popover, Dialog, Command, DropdownMenu, Form, Separator, Sonner, Checkbox, RadioGroup

### Customer pages (migrated to shadcn)

| Area | Files | Components used |
|------|-------|----------------|
| Cart | cart/page.tsx | Button, Input, Checkbox |
| Checkout | checkout/page.tsx | Button, Input, Textarea, Select, RadioGroup, Label |
| Product detail | ProductInfo.tsx, ReviewForm.tsx, ProductGallery.tsx | Button, Input, Textarea |
| Profile | ProfileContent.tsx | Button, Input, RadioGroup, Label |
| Address modal | AddressModal.tsx | Button, Input |
| Orders | OrdersContent.tsx | Button, Input |
| Vouchers | VouchersContent.tsx | Button, Input |
| Notifications | NotificationsContent.tsx | Button |

### Product cards and detail (rich data)

- `ProductCard.tsx` — accepts `variants: ProductVariantWithMediaEntity[]` and `colors: ColorEntity[]`. Extracts images per color (pick one size, deduplicate by colorId). Color swatch click swaps card image. Shows price range with discount badge. Out-of-stock styling (opacity, grayscale, black badge).
- `ProductGrid.tsx` — passes `variants` and `colors` to each card. Colors fetched in SSR from `GET /color`.
- `ProductDetailClient.tsx` — client wrapper coordinating ProductGallery and ProductInfo. Gallery images update when user selects a different color via `onColorChange` callback.
- `ProductInfo.tsx` — dynamic sizes extracted from `variants[].variantSize`, colors from `ColorEntity[]` matched via `colorId`. No hardcoded constants.
- `ProductGallery.tsx` — resets to first image when images array changes (color switch).

### Navbar (migrated to shadcn DropdownMenu)

- `src/components/header/navbar.tsx` — DropdownMenu with `modal={false}`, click-only, keyboard nav via Radix

### Auth flow (fully migrated to shadcn)

- verify.tsx, modal.reactive.tsx, login, signup, change-password, forgot-password — all use shadcn Input/Button/Label + Sonner toast
- Custom `components/button.tsx` and `components/input.tsx` retired and deleted

### Antd status

Zero antd imports in `src/`. Package still in `package.json` — removal is T2-05.

### Configuration

- `components.json` — new-york style, neutral base color, CSS variables enabled
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `src/app/globals.css` — `--radius: 0`, all shadcn CSS variables (oklch), light-only
- `src/styles/theme.css` — custom design tokens
- `src/app/layout.tsx` — `<Toaster />` from sonner mounted globally

## Version History

- [v1.1.0] — Installed DropdownMenu, Form, Separator, Sonner; added Toaster to layout; cleaned dark: classes
- [v1.1.0] — Migrated auth flow from antd to shadcn; retired custom Button/Input components
- [v1.1.0] — Navbar account dropdown replaced with shadcn DropdownMenu
- [v1.1.0] — Customer pages (cart, checkout, product detail, profile) migrated from raw HTML to shadcn Button/Input/Textarea/Select/Checkbox/RadioGroup; installed Checkbox and RadioGroup components
- [v1.1.0] — Product cards: real variant images per color, color swatches, price range/discount badges, out-of-stock styling. Detail page: dynamic sizes/colors from API, gallery syncs with color selection via ProductDetailClient wrapper
