# [v1.1.0 | UI System]

## Rationale

The project was built rapidly (vibe-coded) with three different UI approaches: shadcn/ui for admin, Ant Design for parts of auth, and raw HTML + Tailwind for all customer-facing pages. This creates several problems:

- **Inconsistency:** Every raw button re-implements cursor-pointer, hover states, disabled states, focus rings manually — and frequently misses some (48 elements were missing cursor-pointer)
- **Bundle bloat:** Ant Design is a large dependency used in only 2 files, and its visual style (rounded, colorful) conflicts with the project's geometric black/white design
- **Developer speed:** Adding a new page means writing 5+ Tailwind classes per button instead of `<Button variant="outline">`
- **Accessibility gaps:** Raw HTML elements lack consistent focus-visible, aria attributes, and keyboard navigation that shadcn provides via Radix UI primitives

Standardizing on shadcn/ui eliminates all four problems while keeping full control over the code (shadcn copies components into the project, not installed as a locked dependency).

## Scope

**Included:**
- Migrate customer-facing pages (cart, checkout, product detail, profile, homepage) from raw HTML to shadcn/ui components
- Replace Ant Design usage in verify.tsx and modal.reactive.tsx with shadcn equivalents (Dialog, Form)
- Replace antd notification/message with a shadcn-compatible toast (Sonner or shadcn Toast)
- Retire the custom `components/button.tsx` and `components/input.tsx` in favor of shadcn Button and Input
- Add new shadcn components as needed (Dialog, DropdownMenu, Form, Label, Separator, Toast)

**Excluded:**
- Admin pages — already on shadcn, no changes needed
- Visual redesign — keep the exact same look, just swap the underlying components
- New features — this is pure refactoring
- Theme system changes — CSS variables stay as-is

## Planning Decisions

### Standardize customer UI on shadcn/ui — Breakdown (2026-03-30)
- **Decision:** 5 T2 items totaling 17 points. Install foundation first, then migrate auth/customer/navbar in parallel, remove antd last.
  **Rationale:** Parallel execution is safe because auth (antd→shadcn), customer pages (raw HTML→shadcn), and navbar (custom dropdown→DropdownMenu) touch entirely separate files. antd removal must be last because it can only happen after auth migration is complete.
- **Decision:** Auth migration (T2-2) includes retiring custom `components/button.tsx` and `components/input.tsx` since auth pages are their primary consumers.
  **Rationale:** These custom components duplicate what shadcn Button and Input already provide. Retiring them during auth migration avoids a separate cleanup step.
- **Decision:** Replace antd `notification`/`message` with a single toast solution (Sonner or shadcn Toast) as part of T2-2.
  **Rationale:** antd toast is the most widespread antd usage beyond the 2 auth files. Must be replaced before antd can be uninstalled in T2-5.
- **Scope boundary:** Admin pages are explicitly excluded — they already use shadcn and need no changes.
- **Scope boundary:** No visual redesign. Every migrated component must match the current look. The goal is swapping internals, not changing appearance.

### shadcn foundation — Planning (2026-03-30)
- **Decision:** Install DropdownMenu, Form, Separator, Sonner via `npx shadcn@latest add`. Form pulls in react-hook-form, @hookform/resolvers, zod as dependencies.
  **Rationale:** These 4 components are the exact set needed by sibling T2s (auth, customer pages, navbar). No other components identified as missing.
- **Decision:** Add `<Toaster />` from Sonner to the root layout as part of foundation setup, not deferred to T2-02.
  **Rationale:** Sonner requires a single `<Toaster />` provider. Adding it now means sibling T2s can import `toast()` immediately without layout changes.
- **Scope boundary:** No component customization or theming beyond what shadcn generates. Customization happens in sibling T2s when components are actually used.

### Customer page buttons and inputs — Planning (2026-03-30)
- **Decision:** Install shadcn Checkbox and RadioGroup for checkboxes/radios instead of keeping native HTML.
  **Rationale:** Consistent with the goal of standardizing on shadcn across all customer UI. Only ~10 instances but worth the consistency.
- **Decision:** Replace native `<select>` in checkout with shadcn Select (Radix-based).
  **Rationale:** Shadcn Select provides consistent styling and keyboard navigation. Only 1 instance in checkout.
- **Decision:** AddressModal and checkout confirmation overlays keep their existing structure — only inner buttons/inputs are swapped to shadcn.
  **Rationale:** Refactoring to shadcn Dialog is a bigger change that risks breaking the custom overlay behavior. Stays in scope of "buttons and inputs".
- **Decision:** Phase ordering — (A) product pages, (B) cart + checkout, (C) profile pages. Each phase is independently shippable.
  **Rationale:** Product pages have the most button variety (size/color selectors, qty stepper, action buttons) so tackling first surfaces any pattern issues early.
- **Scope boundary:** Navbar is excluded (t2-ui-system-04). Auth pages excluded (t2-ui-system-02). Modal/overlay structure stays as-is.

### Auth flow shadcn migration — Planning (2026-03-30)
- **Decision:** Use native `<form>` + shadcn Input/Label instead of shadcn Form (react-hook-form) for auth pages.
  **Rationale:** Auth pages already use native forms with useState-based validation. Introducing react-hook-form would be a larger refactor than necessary — the goal is replacing antd, not changing form architecture. shadcn Form can be adopted later if needed.
- **Decision:** Replace antd Steps in modal.reactive.tsx with a custom Tailwind step indicator rather than installing a shadcn Stepper.
  **Rationale:** Only 3 fixed steps, used in one place. A custom indicator is simpler than adding a new component dependency.
- **Decision:** Replace custom `@/components/button` and `@/components/input` as part of this T2, then delete them.
  **Rationale:** These are only used by auth pages. After migration, they have zero consumers.
- **Scope boundary:** Auth pages keep their current layout and visual design. Only the component internals change (antd/custom → shadcn).

### Navbar dropdown — Planning (2026-03-30)
- **Decision:** Switch from hover-to-open to click-only for the account dropdown.
  **Rationale:** Hover doesn't work on touch devices, click aligns with Radix DropdownMenu's default behavior, and the trigger already had onClick as fallback.
- **Decision:** Single-file change (navbar.tsx only). Remove all custom state/ref/effect for dropdown management; let Radix handle it.
  **Rationale:** The custom implementation (useState + useRef + useEffect for click-outside) is exactly what Radix DropdownMenu provides out of the box.
- **Scope boundary:** No visual redesign — same items, same styling, same layout. Only the underlying dropdown mechanism changes.

### Product cards rich data — Breakdown (2026-03-30)
- **Decision:** Cards show one image per unique color, extracted from variant media. Pick any one size, then collect the first image from each distinct color's variant. Product-level `product.media[]` is unused/empty in practice — all images live on variants.
  **Rationale:** Variants are keyed by (size × color). Images only differ by color, not size — e.g., Black/S and Black/M have the same image. So pick a fixed size and deduplicate by color to get the distinct product images for browsing. Product detail page uses variant images per selected color for its gallery.
- **Decision:** Wire actual color swatches into ProductCard using `colorId` from variants + `GET /color` API for hex codes. Deduplicate by color. On card swatch click, swap the card image to that color's variant image.
  **Rationale:** ProductGrid currently passes `colors={[]}`. Variant data has `colorId` referencing the Color table which stores `name` and `hexCode`. Need one API call to fetch all colors, then map per product.
- **Decision:** Replace hardcoded `STANDARD_SIZES` and `STANDARD_COLORS` in ProductInfo with dynamic data. Sizes extracted from product's variants. Colors fetched from `GET /color` and matched via `colorId`.
  **Rationale:** Currently hardcoded to 5 sizes and 5 colors. Real products may have different sizes/colors. Color hex codes must come from the Color table to match what admin configured.
- **Decision:** Show price range / discount on cards — lowest variant price, original price strikethrough, % off badge.
  **Rationale:** Helps users see deals at a glance without clicking into every product.
- **Decision:** Skip rating/review display on cards. Keep it only on the product detail page.
  **Rationale:** Backend doesn't include rating in the product list response. Fetching reviews per card (20+ calls on page load) is too expensive. Can revisit if backend adds `averageRating` to the product list endpoint.
- **Decision:** Visual polish — refined hover effects, badge styling, spacing.
  **Rationale:** Cards are the primary browsing surface. Small polish improvements have outsized impact on perceived quality.
- **Scope boundary:** No secondary image on hover (would require product detail page changes). No quick add-to-cart.

## shadcn foundation components (t2-ui-system-01)

### Summary
- Installed 4 new shadcn components: DropdownMenu, Form, Separator, Sonner
- Added new dependencies: sonner, react-hook-form, @hookform/resolvers, zod, @radix-ui/react-dropdown-menu, @radix-ui/react-separator
- Mounted `<Toaster />` globally in root layout for toast notifications
- Cleaned `dark:` classes from updated Button and DropdownMenu components
- Restored `cursor-pointer` on Button base styles after shadcn overwrite

### Implementation
- Phase A: Install missing shadcn components and dependencies — 3 tasks
- Phase B: Verify design system compatibility — 4 tasks

### Files Changed
- src/components/ui/dropdown-menu.tsx — new, Radix DropdownMenu with dark: class removed
- src/components/ui/form.tsx — new, react-hook-form integration with Radix Label
- src/components/ui/separator.tsx — new, Radix Separator (horizontal/vertical)
- src/components/ui/sonner.tsx — new, Sonner toast with hardcoded light theme (no next-themes)
- src/components/ui/button.tsx — updated by shadcn (new xs/icon-xs sizes), dark: classes removed, cursor-pointer restored
- src/components/ui/label.tsx — updated by shadcn (minor style refresh)
- src/app/layout.tsx — added `<Toaster />` import and render

## Auth flow migrated to shadcn (t2-ui-system-02)

### Summary
- Replaced antd notification/message with `toast()` from sonner across all 6 auth files
- Rewrote verify.tsx: antd Row/Col/Form/Divider/Icons → Tailwind flex + shadcn Input/Button/Label/Separator + lucide
- Rewrote modal.reactive.tsx: antd Modal → shadcn Dialog, antd Steps → custom Tailwind StepIndicator, antd Form → native form + shadcn components
- Swapped custom `@/components/button` and `@/components/input` to shadcn equivalents in login, signup, change-password, forgot-password
- Deleted src/components/button.tsx and src/components/input.tsx (zero remaining consumers)
- Fixed pre-existing bug: signup loader not resetting on API error (added `finally { setShowLoader(false) }`)
- Fixed pre-existing bug: login loader not resetting when inactive-account modal opens (code === 2 branch)

### Implementation
- Phase A: Replace antd notification/message with toast() — 6 tasks
- Phase B: Rewrite verify.tsx with shadcn — 7 tasks
- Phase C: Rewrite modal.reactive.tsx with shadcn Dialog — 7 tasks
- Phase D: Swap custom Button/Input to shadcn in auth pages — 7 tasks

### Files Changed
- src/components/auth/verify.tsx — full rewrite: antd → shadcn Input/Button/Label/Separator + lucide ArrowLeft
- src/components/auth/modal.reactive.tsx — full rewrite: antd Modal/Steps/Form → shadcn Dialog + custom StepIndicator + native form
- src/app/auth/login/page.tsx — shadcn Button/Input, toast from sonner, loader bugfix for code===2
- src/app/auth/signup/page.tsx — shadcn Button/Input, toast from sonner, loader bugfix (finally block)
- src/app/auth/change-password/page.tsx — shadcn Button/Input, toast from sonner
- src/app/auth/forgot-password/page.tsx — shadcn Button/Input/Label, toast from sonner, replaced DummyLogo with Image
- src/components/button.tsx — deleted (retired)
- src/components/input.tsx — deleted (retired)

## Navbar dropdown migrated to shadcn (t2-ui-system-04)

### Summary
- Replaced hand-built account dropdown (useState + useRef + useEffect) with shadcn DropdownMenu
- Switched from hover-to-open to click-only (better for touch devices, aligns with Radix default)
- Added `modal={false}` to prevent body scroll lock that caused scrollbar layout jag on Windows
- All menu items have `cursor-pointer`, logout uses `variant="destructive"`
- Keyboard navigation (arrow keys, Escape, Enter) provided by Radix out of the box

### Implementation
- Phase A: Replace custom dropdown with shadcn DropdownMenu — 8 tasks
- Phase B: Verify design system compliance — 3 tasks

### Files Changed
- src/components/header/navbar.tsx — replaced custom dropdown with DropdownMenu/Trigger/Content/Item/Separator; removed showAccountMenu state, accountMenuRef, click-outside useEffect
