# Cart & Checkout

## Non-Technical Description

Shopping cart and order placement flow. Users manage their cart (select items, adjust quantities, remove items with confirmation), then proceed to checkout. At checkout, users select a delivery address which is automatically validated with GHN (Giao Hàng Nhanh) shipping service with visible loading feedback. The system auto-calculates shipping fees and applies the best available vouchers/discounts. Users review a detailed price breakdown, confirm their order via a confirmation overlay showing address, payment method, and total, then place an order via COD or VNPay online payment.

- Cart page with item selection via checkboxes, quantity controls, batch delete with confirmation dialog, Vietnamese UI throughout
- Checkout: address selection triggers auto GHN validation + shipping preview with blue status indicator
- Detailed price breakdown: subtotal, shipping fee, per-item discounts, package-level voucher discounts
- Per-item discount detail: strikethrough original price, discount type/percentage, voucher code tags
- Recipient info (name from user profile, phone pre-filled from profile, editable)
- Order confirmation overlay before placement (address summary, payment method, total)
- COD and VNPay payment methods
- VNPay: order created first, then redirect to VNPay gateway, return page verifies payment with success/failure states and navigation links
- Order creation: POST /orders with real CreateOrderDto (packages + checksums + validated address)
- Order list displays all backend statuses including VNPay-specific states (PAYMENT_PROCESSING, PAYMENT_CONFIRMED)

## Technical Implementation

**Pages:**
- `src/app/(user)/cart/page.tsx` — client component. Loads cart via `cartService.getCartDetails()`, manages selection state with `Set<number>`, quantity updates, single/batch delete with `window.confirm()`. "Tiếp tục mua sắm" back link to `/homepage`. Links to checkout with `?items=1,2,3` param. All UI strings in Vietnamese. `cursor-pointer` on all interactive elements.
- `src/app/(user)/checkout/page.tsx` — client component. Step-based flow (loading → ready → previewing → previewed → placing). Auto-triggers GHN validation + shipping preview when address changes with blue status box indicator. Supports COD (redirect to orders) and VNPay (redirect to gateway). Order confirmation overlay before placement. "Quay lại giỏ hàng" back link. Sticky sidebar with `top-36` offset (clears fixed header). Ref guards (`cartLoadedRef`, `profileLoadedRef`, `addressesLoadedRef`) prevent re-fetching on NextAuth session refresh. `sessionStatus` check prevents false redirect to login on page refresh. Includes `getClientIp()` helper for VNPay's `vnp_IpAddr`.
- `src/app/(user)/checkout/vnpay-return/page.tsx` — client component. VNPay return page after payment. Reads `vnp_*` query params, calls `verifyVNPayReturn()`, shows verifying/success/failure states with order details. Success/failure states include links to order history, cart, and homepage (`/homepage`).

**Services:**
- `cartService` (`src/services/cart.ts`) — `getCartDetails`, `updateCartItem`, `deleteCartItem`, `createCartItem`, `getCartById`
- `orderService` (`src/services/order.ts`) — `createOrder` (returns `OrderFullInformationEntity`), `getUserOrders`, `getOrderById`, `updateOrder`, `createOrderItem`, `updateOrderItem`, `deleteOrderItem`
- `addressService` (`src/services/address.ts`) — `createAddress`, `createOrderAddress` (GHN validation), `getUserAddresses`, `getAddressById`, `updateAddress`, `deleteAddress`
- `shipmentService` (`src/services/shipment.ts`) — `previewShippingFeeForOrder`
- `paymentService` (`src/services/payment.ts`) — `createVNPayPaymentUrl`, `verifyVNPayReturn`
- `userService` (`src/services/user.ts`) — `getUser` (for phone pre-fill)

**DTOs:**
- `src/dto/cart-api.ts` — CartDto, CartItemDto, CartItemWithDetails, mapCartItemToDetails
- `src/dto/order.ts` — CreateOrderDto (real: userId, paymentMethod, carrier, phone, shippingAddress, packages), OrderFullInformationEntity, PackageDetailDto, PackageItemDetailDto, PreviewPackageDetailWithChecksumDto, VoucherSnapshot, ChecksumInformationForOrderPreviewDto, plus legacy OrderDto/OrderItemDto for list pages
- `src/dto/address.ts` — CreateAddressDto, AddressDto, CreateAddressForOrderResponseDto, OrderAddressInGHNDto, GhnProvinceDto, GhnDistrictDto, GhnWardDto, DatabaseAddressDto
- `src/dto/payment.ts` — CreateVNPayPaymentUrlDto, BuildPaymentUrlDto, VerifyVNPayReturnUrlDto, ReturnQueryFromVNPayDto, VNPayVerifyReturnUrlResponseDto
- `src/dto/shipment.ts` — PreviewFeeAndDiscountAndPriceForOrderDto, PreviewOrderItemDto

**Checkout API Flow:**
1. POST `/address/order-address` with CreateAddressDto → returns CreateAddressForOrderResponseDto (DB address + GHN province/district/ward)
2. POST `/shipments/preview-shipping-fee-detail-and-discount-detail-and-price-detail-for-order` with `{ orderItems, createNewAddressForOrderResponseDto }` → returns packages map (shop ID → PackageDetailWithChecksum)
3. POST `/orders` with `{ userId, paymentMethod, carrier, phone, shippingAddress, packages }` → returns OrderFullInformationEntity
4. (COD) → redirect to /profile/orders
5. (VNPay) POST `/payments/vnpay-payment-url` with `{ data: { vnp_Amount, vnp_TxnRef: orderId, vnp_OrderInfo, vnp_IpAddr, vnp_ReturnUrl, vnp_Locale, vnp_CurrCode, vnp_OrderType } }` → returns VNPay gateway URL → browser redirect
6. (VNPay return) POST `/payments/check-vnpay-return` with `{ data: vnp_* query params }` → verification response (isSuccess, isVerified, message)

## Version History
- v1.0.0 — Baseline: API cart management, checkout with address selection and COD (mock wiring)
- v1.1.0 — Rewrote checkout DTOs/services to match real backend API; wired COD flow end-to-end with GHN address validation, auto shipping preview, detailed discount/voucher display; wired VNPay payment flow with gateway redirect and return page verification; added full order status mapping for VNPay states; polished UX across cart/checkout/VNPay return (Vietnamese translations, cursor-pointers, navigation links, loading indicators, order confirmation overlay, session re-poll bugfixes)
