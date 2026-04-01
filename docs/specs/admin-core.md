# Admin Core

## Non-Technical Description

The admin panel shell — layout, navigation, and shared admin infrastructure. Provides a collapsible sidebar with navigation sections (main menu, products, admin management), role-based access guard, and a customer list page.

- Collapsible sidebar (260px ↔ 64px) with 3 sections: main menu (7 items), products (3 items), admin (2 items)
- Role-guarded layout (checks `isAdmin` before rendering)
- Customer list table with SSR data loading
- User profile display in sidebar footer with logout
- "Your Shop" link

## Technical Implementation

**Layout:** `src/app/admin/layout.tsx` — checks admin session, renders sidebar + content

**Sidebar:** `src/app/admin/sidebar.tsx` — client component, collapsible, active link highlighting (bg-black), Lucide icons, logout via `signOut()`

**Pages:**
- `src/app/admin/page.tsx` — dashboard (stub: TODO)
- `src/app/admin/users/page.tsx` — SSR customer table via `userService.getAll()`

**Stub pages:** dashboard, orders, transactions, coupons, brands, reviews, roles, authority, shop, chat

**Services used:** `userService.getAll` (for customers page)

## Version History
- v1.0.0 — Baseline: sidebar, layout guard, customer list. Dashboard and 9 other pages are stubs.
