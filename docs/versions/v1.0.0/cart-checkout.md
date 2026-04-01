# [v1.0.0 | Cart & Checkout] Shopping cart and order placement

## Rationale
Purchase flow — users need to manage cart items and place orders.

## Scope
- Cart page: selection, quantity control, single/batch delete
- Checkout page: address selection, order summary, COD payment
- Order creation workflow: create order → create items → delete cart items → redirect
- Address integration (select existing or add new via modal)

## Summary
Fully implemented. 2 client pages, cart service (7 endpoints), order service (7 endpoints), address service (5 endpoints).
