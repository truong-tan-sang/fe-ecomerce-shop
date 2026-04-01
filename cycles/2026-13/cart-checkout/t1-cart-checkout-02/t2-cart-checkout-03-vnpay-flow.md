# VNPay payment flow works end-to-end

Work Item: t2-cart-checkout-03
Tier 1: t1-cart-checkout-02 [v1.1.0 | Cart & Checkout] Wire checkout to real backend API (In Progress)
Module: Cart & Checkout
Spec: docs/specs/cart-checkout.md
Version Doc: docs/versions/v1.1.0/cart-checkout.md
Siblings: 4 total, 2 Done — t2-cart-checkout-01 DTOs/services (Done), t2-cart-checkout-02 COD flow (Done), t2-cart-checkout-04 UX polish (Todo)
Execution Order: Step 3 of 4 — prerequisites met (t2-01 + t2-02 Done)

## Context

Non-tech: Users can pay online via VNPay instead of COD. After placing an order, they're redirected to VNPay gateway, pay, and return to see confirmation.
Tech: Checkout page already supports paymentMethod state ("COD"|"VNPAY") but VNPay is disabled. paymentService + DTOs already exist from t2-01. Need to wire the redirect flow, create a return page, and update order status display.
Related: Backend IPN webhook (partner-managed) confirms payment server-side via ngrok tunnel. FE only handles the return URL redirect.

## Phase A: Enable VNPay in checkout + redirect to gateway

- [x] Enable VNPay radio button — remove `disabled` attr and `opacity-50` class
- [x] Add client IP helper — fetch from public API (ipify) with fallback to "127.0.0.1", used for `vnp_IpAddr`
- [x] Modify `handlePlaceOrder` for VNPay path — after order creation + cart item deletion, call `paymentService.createVNPayPaymentUrl()` with: `vnp_Amount` = `priceSummary.totalAmount`, `vnp_TxnRef` = `String(orderId)` (numeric, not "ORDER_" prefix — BE IPN does `Number(vnp_TxnRef)`), `vnp_OrderInfo`, `vnp_ReturnUrl`, `vnp_IpAddr`, plus required `vnp_Locale: "vn"`, `vnp_CurrCode: "VND"`, `vnp_OrderType: "other"`. Then `window.location.href` redirect.

## Phase B: VNPay return page

- [x] Create `src/app/(user)/checkout/vnpay-return/page.tsx` — client component
- [x] Read `vnp_*` query params from URL via `useSearchParams()`, map to `ReturnQueryFromVNPayDto`
- [x] Call `paymentService.verifyVNPayReturn()` on mount — show 3 states: loading (verifying), success (green check + order ID + amount), failure (red X + error message from response)
- [x] Both success/failure states link to order history (`/profile/orders`)

## Phase C: Order statuses for VNPay in order list

- [x] Update `getStatusText` in `OrdersContent.tsx` — add: `PAYMENT_PROCESSING` (amber "Cho thanh toan"), `PAYMENT_CONFIRMED` (blue "Da thanh toan"), `WAITING_FOR_PICKUP` (blue "Cho lay hang"), `COMPLETED` (green "Hoan thanh"), `RETURNED` (red "Da tra hang")
