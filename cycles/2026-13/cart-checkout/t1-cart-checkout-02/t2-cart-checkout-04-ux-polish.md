# Checkout UX polish

Work Item: t2-cart-checkout-04
Tier 1: t1-cart-checkout-02 [v1.1.0 | Cart & Checkout] Wire checkout to real backend API (In Progress)
Module: Cart & Checkout
Spec: docs/specs/cart-checkout.md
Version Doc: docs/versions/v1.1.0/cart-checkout.md
Siblings: 4 total, 3 Done — t2-cart-checkout-01 DTOs/services (Done), t2-cart-checkout-02 COD flow (Done), t2-cart-checkout-03 VNPay flow (Done)
Execution Order: Step 4 of 4 — all prerequisites met

## Context

Non-tech: All checkout flows (COD + VNPay) are functional. This item polishes the user experience across the cart → checkout → payment return journey: Vietnamese translations, missing cursor pointers, navigation links, loading indicators, and a confirmation step before placing orders.
Tech: Cart page (`src/app/(user)/cart/page.tsx`), checkout page (`src/app/(user)/checkout/page.tsx`), VNPay return page (`src/app/(user)/checkout/vnpay-return/page.tsx`). All are client components. Uses Font Awesome icons and Tailwind CSS. Header height causes pt-32/pt-36 offset.
Related: OrdersContent.tsx buttons (Đánh giá, Mua lại, Yêu cầu hủy) are non-functional shells — deferred to a future user profile T2.

## Phase A: Cart page polish

- [x] Translate English strings to Vietnamese: "Loading cart..." → "Đang tải...", "Your cart is empty" → "Giỏ hàng của bạn đang trống", "Please log in to view your cart" → "Vui lòng đăng nhập để xem giỏ hàng"
- [x] Add `cursor-pointer` to quantity +/- buttons and "Xóa" delete links (CLAUDE.md rule: any clickable control must have visible pointer cursor)
- [x] Add "Tiếp tục mua sắm" link (← arrow + text) above the cart header row, linking to homepage or /product listing
- [x] Add confirmation before batch delete — `window.confirm("Xóa {N} sản phẩm đã chọn?")` guard in `removeSelected`

## Phase B: Checkout page polish

- [x] Add "← Quay lại giỏ hàng" back link at top of page (above "THANH TOÁN" heading), linking to /cart
- [x] Fix sticky sidebar offset — change `sticky top-4` to `sticky top-36` so the summary panel clears the fixed header
- [x] Add spinner icon to place-order button during "placing" step — show `<i className="fa-solid fa-spinner fa-spin mr-2" />` before "Đang xử lý..."
- [x] Improve address validation/shipping preview loading indicator — replace tiny "Đang xác thực..." text with a bordered status box containing a spinner icon + descriptive text, matching the error/warning box styling pattern already used
- [x] Add confirmation step before placing order — when user clicks "ĐẶT HÀNG", show a confirmation overlay/modal with: delivery address summary, payment method (COD/VNPay), total amount. Two buttons: "Xác nhận đặt hàng" (proceeds) and "Hủy" (cancels). Use simple state toggle, no new component needed.
- [x] Fix session re-poll bugs — add ref guards (cartLoadedRef, profileLoadedRef, addressesLoadedRef) to prevent data-loading effects from re-running on NextAuth tab-focus session refresh; add sessionStatus === "loading" check before auth redirect to prevent false redirect on page refresh

## Phase C: VNPay return + minor touches

- [x] Add "Trang chủ" link to both success and failure states on VNPay return page (alongside existing buttons)
- [x] Verify Font Awesome spinner renders on VNPay return "ĐANG XÁC MINH" state — FA loaded via CDN in layout.tsx (font-awesome 6.5.2), confirmed working
- [x] Fix homepage links — changed all `href="/"` to `href="/homepage"` (cart + VNPay return) because `src/app/page.tsx` renders the Login page, not storefront
