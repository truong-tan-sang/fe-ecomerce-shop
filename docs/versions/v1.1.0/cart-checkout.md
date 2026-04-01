# [v1.1.0 | Cart & Checkout] Wire checkout to real backend API

## Rationale
The checkout page was built as a mock during v1.0.0 with hardcoded pricing and an incompatible CreateOrderDto. The backend has since evolved to require GHN-validated addresses, a shipping preview endpoint for real pricing with auto-applied vouchers, and VNPay online payment support. The frontend needs to be rewired to this real API flow.

## Scope
**Included:**
- Rewrite checkout DTOs and services to match actual backend API
- Full COD flow: order-address validation → shipping preview → price detail display → order creation
- VNPay payment: URL generation, redirect, return page verification
- UX improvements: loading states, error handling, confirmation page

**Excluded:**
- Cart page changes (already functional from v1.1.0 codebase health work)
- Admin order management
- Coupon/voucher UI for manual entry (backend auto-selects best voucher)
- Multiple shipping carriers (use whatever GHN returns)

## Planning Decisions

### Wire checkout to real backend API — Breakdown (2026-03-28)
- **Decision:** 4 T2 items, 16 points total. Sequential execution: DTOs first, then COD, then VNPay, then UX polish.
  **Rationale:** Each step depends on the previous. DTOs are foundation, COD validates the pipeline, VNPay extends it, UX is last since flows must work first.
- **Decision:** Backend auto-applies best voucher/discount — no manual coupon entry UI needed.
  **Rationale:** Per BE partner, the preview endpoint handles voucher selection automatically (priority: variant > product > category for items, best user voucher for package).
- **Scope boundary:** Cart page is NOT touched — it already works from the codebase health T1.
- **Decision:** `phone` = recipient's contact number for the carrier to reach on delivery. Source: pre-filled from user profile (`userService.getUser`), editable at checkout. `carrier` = "Giao hàng nhanh" (hardcoded string, only integrated carrier).
  **Rationale:** These fields are for the carrier's delivery logistics — contacting the recipient and identifying which shipping service handles the package.

## Checkout DTOs and services match backend ({#t2-cart-checkout-01})

### Summary
- Rewrote `src/dto/order.ts` with real `CreateOrderDto` matching backend (userId, paymentMethod, carrier, phone, shippingAddress, packages)
- Added GHN address types to `src/dto/address.ts` (GhnProvinceDto, GhnDistrictDto, GhnWardDto, OrderAddressInGHNDto, CreateAddressForOrderResponseDto)
- Created `src/dto/payment.ts` (VNPay URL creation, return verification, response DTOs)
- Created `src/dto/shipment.ts` (PreviewFeeAndDiscountAndPriceForOrderDto with orderItems + validated address)
- Updated `src/services/order.ts` — createOrder returns OrderFullInformationEntity
- Added `createOrderAddress` to `src/services/address.ts` (POST /address/order-address)
- Created `src/services/payment.ts` (createVNPayPaymentUrl, verifyVNPayReturn)
- Created `src/services/shipment.ts` (previewShippingFeeForOrder)

### Files Changed
- `src/dto/order.ts` — full rewrite: CreateOrderDto, PackageDetailDto, PackageItemDetailDto, VoucherSnapshot, ChecksumInformationForOrderPreviewDto, OrderFullInformationEntity, legacy DTOs preserved
- `src/dto/address.ts` — added GHN types, CreateAddressForOrderResponseDto, DatabaseAddressDto, WhiteListClientDto/WardDto
- `src/dto/payment.ts` — new: BuildPaymentUrlDto, CreateVNPayPaymentUrlDto, ReturnQueryFromVNPayDto, VerifyVNPayReturnUrlDto, VNPayVerifyReturnUrlResponseDto
- `src/dto/shipment.ts` — new: PreviewOrderItemDto, PreviewFeeAndDiscountAndPriceForOrderDto
- `src/services/order.ts` — createOrder now typed to OrderFullInformationEntity
- `src/services/address.ts` — added createOrderAddress method
- `src/services/payment.ts` — new service
- `src/services/shipment.ts` — new service

## VNPay payment flow works end-to-end ({#t2-cart-checkout-03})

### Summary
- Enabled VNPay payment method in checkout (was disabled with "Sắp ra mắt")
- VNPay flow: create order → delete cart items → generate VNPay URL → redirect to gateway → return page verifies payment
- Created VNPay return page with 3 states: verifying (spinner), success (green check + order/amount/bank details), failure (red X + error code)
- Added `getClientIp()` helper using ipify API for `vnp_IpAddr`
- Added all missing order statuses to order list: PAYMENT_PROCESSING, PAYMENT_CONFIRMED, WAITING_FOR_PICKUP, COMPLETED, RETURNED

### Implementation
- Phase A: Enable VNPay in checkout + redirect to gateway — 3 tasks
- Phase B: VNPay return page — 4 tasks
- Phase C: Order status display — 1 task

### Files Changed
- `src/app/(user)/checkout/page.tsx` — enabled VNPay radio, added VNPay branch in handlePlaceOrder (IP fetch, URL generation, redirect), added vnp_Locale/CurrCode/OrderType
- `src/app/(user)/checkout/vnpay-return/page.tsx` — new: return page with query param parsing, verification call, success/failure UI
- `src/components/profile/OrdersContent.tsx` — added PAYMENT_PROCESSING, PAYMENT_CONFIRMED, WAITING_FOR_PICKUP, COMPLETED, RETURNED to status map
- `be-ecomerce-shop/src/payments/dto/create-vnpay-payment-url.dto.ts` — `@IsUrl()` → `@IsUrl({ require_tld: false })` for localhost dev

### VNPay payment flow — Implementation (2026-03-29)
- **Decision:** `vnp_TxnRef` must be numeric order ID (not "ORDER_123") because BE IPN handler does `Number(vnp_TxnRef)` to look up the order.
  **Rationale:** Discovered from reading BE `handleVNPayIPNCall` source.
- **Decision:** Must include `vnp_Locale: "vn"`, `vnp_CurrCode: "VND"`, `vnp_OrderType: "other"` in payment URL request — VNPay sandbox rejects without these.
  **Rationale:** VNPay returned error code 03 ("Invalid data format") until these were added.
- **Decision:** BE `@IsUrl()` changed to `@IsUrl({ require_tld: false })` to accept localhost return URLs during development.
  **Rationale:** Free ngrok tier can't run 2 tunnels. FE return URL uses localhost, BE IPN uses ngrok.

### VNPay payment flow — Planning (2026-03-29)
- **Decision:** Order-first approach — create order (status PAYMENT_PROCESSING), delete cart items, then redirect to VNPay. On return, verify payment. BE IPN webhook confirms server-side.
  **Rationale:** BE expects order to exist before payment. PAYMENT_PROCESSING status tracks pre-payment orders. Cart cleanup before redirect avoids orphaned items if user doesn't return.
- **Decision:** Client IP via public API (ipify) with "127.0.0.1" fallback for vnp_IpAddr.
  **Rationale:** BE passes it through to VNPay with no validation. VNPay sandbox accepts any string but real IP is better practice.
- **Decision:** Return page at `/checkout/vnpay-return` — reads vnp_* query params, calls verifyVNPayReturn, shows success/failure.
  **Rationale:** Standard VNPay redirect flow. Separate page keeps checkout logic clean.
- **Scope boundary:** IPN webhook is BE-only (partner-managed via ngrok). FE does not handle IPN.

## COD checkout flow works end-to-end ({#t2-cart-checkout-02})

### Summary
- Full rewrite of checkout page with step-based flow (loading → ready → previewing → previewed → placing)
- Auto-triggers GHN address validation + shipping preview on address selection (no manual button)
- Displays recipient name (from session) and phone (pre-filled from user profile, editable) in address card
- Detailed price breakdown from backend: subtotal, shipping fee, per-item discounts, package voucher discounts
- Per-item: strikethrough original price, discount type/percentage display, voucher code tags, description
- Package-level: voucher detail row (code + amount) or "Không có voucher" placeholder
- Summary always shows all 4 lines (subtotal, shipping, item discount, voucher discount) — green when active, gray when 0
- Abort controller prevents stale preview responses on rapid address switching

### Files Changed
- `src/app/(user)/checkout/page.tsx` — full rewrite (~820 lines): step-based checkout, auto-preview, user profile fetch, detailed discount/voucher display

### Checkout UX polish — Planning (2026-03-29)
- **Decision:** Scope covers both cart page and checkout page polish, plus VNPay return minor touches. Cart page has English strings and missing cursor-pointers that violate CLAUDE.md rules.
  **Rationale:** Cart is the entry point to checkout — polishing only checkout but not cart would feel inconsistent.
- **Decision:** Order confirmation via inline overlay/modal before placing, not a separate step/page.
  **Rationale:** Keeps the single-page checkout flow. A separate confirmation page would add unnecessary navigation.
- **Decision:** OrdersContent action buttons (Đánh giá, Mua lại, Yêu cầu hủy) are out of scope — deferred to a future user profile T2.
  **Rationale:** These require their own API wiring (reviews, order cancellation, re-order cart population) — too much for a 3pt polish item.
- **Scope boundary:** No mobile responsive layout — desktop-first is the current target.

## Checkout UX polish ({#t2-cart-checkout-04})

### Summary
- Translated all English strings in cart page to Vietnamese (loading, empty, unauthenticated states)
- Added `cursor-pointer` to all interactive elements across cart page (quantity buttons, delete links, buy button)
- Added navigation links: "Tiếp tục mua sắm" (cart → homepage), "Quay lại giỏ hàng" (checkout → cart), "TRANG CHỦ" (VNPay return → homepage)
- Added order confirmation overlay before placement showing address, payment method, and total
- Fixed checkout session bugs: ref guards prevent data re-fetching on NextAuth tab-focus refresh; sessionStatus check prevents false login redirect on page refresh
- Fixed homepage links from "/" to "/homepage" (root route renders Login page)

### Implementation
- Phase A: Cart page polish — 4 tasks (translations, cursor-pointer, back link, batch delete confirmation)
- Phase B: Checkout page polish — 6 tasks (back link, sticky offset fix, spinner, loading indicator, confirmation overlay, session bugfixes)
- Phase C: VNPay return + minor — 3 tasks (homepage links, FA spinner verification, link path fix)

### Files Changed
- `src/app/(user)/cart/page.tsx` — Vietnamese translations, cursor-pointer on buttons, "Tiếp tục mua sắm" Link to /homepage, window.confirm on batch delete
- `src/app/(user)/checkout/page.tsx` — "Quay lại giỏ hàng" Link, sticky top-36, spinner on placing button, blue loading box for address validation, order confirmation overlay with showConfirm state, ref guards (cartLoadedRef/profileLoadedRef/addressesLoadedRef), sessionStatus loading check
- `src/app/(user)/checkout/vnpay-return/page.tsx` — "TRANG CHỦ" link on success/failure states, href changed from "/" to "/homepage"
