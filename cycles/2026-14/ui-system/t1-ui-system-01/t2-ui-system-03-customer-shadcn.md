# Customer page buttons and inputs use shadcn

Work Item: t2-ui-system-03
Tier 1: t1-ui-system-01 [v1.1.0 | UI System] Standardize customer UI on shadcn/ui (In Progress)
Module: UI System
Spec: docs/specs/ui-system.md
Version Doc: docs/versions/v1.1.0/ui-system.md
Siblings: 5 total, 1 Done — t2-ui-system-01 Foundation (Done), t2-ui-system-02 Auth flow (Todo), t2-ui-system-04 Navbar dropdown (Todo), t2-ui-system-05 Remove antd (Todo)
Execution Order: Step 2 of 3 — no blockers (foundation done)

## Context

Non-tech: Replace all raw HTML buttons, inputs, selects, textareas, checkboxes, and radios on customer-facing pages with shadcn/ui equivalents. Visual appearance must stay the same — this is an internal swap, not a redesign.
Tech: 10 files across product detail, cart, checkout, and profile. ~80+ raw HTML elements → shadcn Button, Input, Textarea, Select, Checkbox, RadioGroup. Checkbox and RadioGroup need to be installed first. Quantity steppers become composite Button + Input patterns.
Related: t2-ui-system-02 (auth) and t2-ui-system-04 (navbar) run in parallel — no file overlap.

## Phase A: Install missing shadcn components

- [x] Run `npx shadcn@latest add checkbox radio-group` to install Checkbox and RadioGroup
- [x] Verify new files in src/components/ui/ (checkbox.tsx, radio-group.tsx)
- [x] Remove `dark:` classes from new components if present
- [x] Run `npx tsc --noEmit` to verify no type errors

## Phase B: Product pages (ProductInfo, ReviewForm, ProductGallery)

- [x] ProductInfo.tsx — replace size selector buttons with shadcn Button (variant mapping: selected=default, available=outline, disabled=outline+disabled)
- [x] ProductInfo.tsx — replace color selector buttons with shadcn Button (ghost variant, keep ColorSwatch rendering inside)
- [x] ProductInfo.tsx — replace quantity stepper buttons with shadcn Button (ghost variant), Input for display
- [x] ProductInfo.tsx — replace "Add to cart" button with shadcn Button (default variant, full width)
- [x] ProductInfo.tsx — replace action buttons (compare, ask, share, favorite) with shadcn Button (outline/ghost variant)
- [x] ProductInfo.tsx — replace quantity display input with shadcn Input (readOnly)
- [x] ReviewForm.tsx — replace star rating buttons with shadcn Button (ghost variant)
- [x] ReviewForm.tsx — replace variant selection buttons with shadcn Button (variant mapping: selected=default, available=outline)
- [x] ReviewForm.tsx — replace textarea with shadcn Textarea
- [x] ReviewForm.tsx — replace submit/cancel buttons with shadcn Button (default + outline variants)
- [x] ProductGallery.tsx — replace thumbnail button with shadcn Button (ghost variant)
- [x] Run `npx tsc --noEmit` to verify no type errors

## Phase C: Cart and checkout pages

- [x] cart/page.tsx — replace "select all" and item checkboxes with shadcn Checkbox
- [x] cart/page.tsx — replace quantity stepper buttons with shadcn Button (ghost variant)
- [x] cart/page.tsx — replace quantity display input with shadcn Input (readOnly)
- [x] cart/page.tsx — replace "Xóa" (remove) buttons with shadcn Button (ghost variant, destructive on hover)
- [x] cart/page.tsx — replace "Mua hàng" (buy) button with shadcn Button (default variant)
- [x] checkout/page.tsx — replace address `<select>` with shadcn Select component
- [x] checkout/page.tsx — replace phone input with shadcn Input
- [x] checkout/page.tsx — replace textarea (order notes) with shadcn Textarea
- [x] checkout/page.tsx — replace payment radio buttons with shadcn RadioGroup
- [x] checkout/page.tsx — replace "ĐẶT HÀNG" button with shadcn Button (default variant)
- [x] checkout/page.tsx — replace confirmation overlay buttons (Hủy / Xác nhận) with shadcn Button (outline + default)
- [x] Run `npx tsc --noEmit` to verify no type errors

## Phase D: Profile pages

- [x] ProfileContent.tsx — replace sub-tab buttons with shadcn Button (ghost variant, active state via className)
- [x] ProfileContent.tsx — replace text inputs (username, fullName, phone) with shadcn Input
- [x] ProfileContent.tsx — replace gender radio buttons with shadcn RadioGroup
- [x] ProfileContent.tsx — replace save/edit button with shadcn Button (default variant)
- [x] ProfileContent.tsx — replace "Chọn Ảnh" button with shadcn Button (outline variant)
- [x] ProfileContent.tsx — replace address action buttons (Xóa, Cập nhật, Đặt làm mặc định, Thêm địa chỉ mới) with shadcn Button (destructive/outline variants)
- [x] AddressModal.tsx — replace all text/tel inputs with shadcn Input
- [x] AddressModal.tsx — replace close button (×) with shadcn Button (ghost variant)
- [x] AddressModal.tsx — replace cancel/submit buttons with shadcn Button (outline + default)
- [x] OrdersContent.tsx — replace search input with shadcn Input
- [x] OrdersContent.tsx — replace search button with shadcn Button (ghost variant)
- [x] OrdersContent.tsx — replace order action buttons (Đánh giá, Mua lại, Yêu cầu hủy, etc.) with shadcn Button (outline/destructive variants)
- [x] VouchersContent.tsx — replace search input with shadcn Input
- [x] VouchersContent.tsx — replace tab buttons with shadcn Button (ghost variant)
- [x] VouchersContent.tsx — replace "Dùng ngay" / action buttons with shadcn Button (link/ghost variant)
- [x] NotificationsContent.tsx — replace button with shadcn Button (link variant)
- [x] Run `npx tsc --noEmit` to verify no type errors
