# User Profile

## Non-Technical Description

User account management area. Users can view and edit their profile information, see their order history, manage notifications, view vouchers, and manage delivery addresses.

- Profile page with personal info editing (name, email, phone, gender)
- Orders history page
- Notifications page
- Vouchers page
- Address modal for creating/editing delivery addresses
- Profile sidebar navigation

## Technical Implementation

**Pages:**
- `src/app/(user)/profile/page.tsx` → renders `ProfileContent`
- `src/app/(user)/profile/orders/page.tsx` → renders `OrdersContent`
- `src/app/(user)/profile/notifications/page.tsx` → renders `NotificationsContent`
- `src/app/(user)/profile/vouchers/page.tsx` → renders `VouchersContent`
- `src/app/(user)/profile/layout.tsx` — profile layout with sidebar

**Components:**
- `src/components/profile/ProfileContent.tsx` — profile editing form, calls `userService.updateUser`
- `src/components/profile/OrdersContent.tsx` — order history list
- `src/components/profile/NotificationsContent.tsx` — notifications display
- `src/components/profile/VouchersContent.tsx` — voucher list
- `src/components/profile/ProfileSidebar.tsx` — sidebar navigation
- `src/components/profile/ProfileContext.tsx` — context provider for profile data
- `src/components/profile/ProfileDataProvider.tsx` — data loading provider
- `src/components/profile/AddressModal.tsx` — modal for address CRUD

**Services used:** `userService.getUser`, `userService.updateUser`, `orderService.getUserOrders`, `addressService.*`

## Version History
- v1.0.0 — Baseline: profile editing, orders, notifications, vouchers, address management
