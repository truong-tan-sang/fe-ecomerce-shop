# Product Bible

## Product Vision

Vietnamese e-commerce platform (PPL Paple) with a customer-facing storefront and an admin back-office. Customers browse products, manage carts, place orders via COD, and manage their profile. Admins manage products (with color/size variants and image uploads), categories, and view customers. The backend is a separate NestJS API; this repo is the Next.js frontend only.

## Architecture Overview

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript 5
- **Styling:** Tailwind CSS v4 + Ant Design 5 + Radix UI (shadcn/ui)
- **Auth:** NextAuth 5 beta — credentials, Google OAuth, Facebook OAuth. Role-based middleware (`ADMIN`/`USER`/`OPERATOR`). Session carries JWT `access_token`.
- **API pattern:** Service layer (`src/services/`) → `sendRequest<IBackendRes<T>>()` utility → backend REST API. DTOs in `src/dto/` mirror OpenAPI schema. `sendRequest` throws `ApiError` on non-ok HTTP responses; all consumers must use try/catch.
- **Rendering:** SSR for public pages (homepage, product detail), CSR for interactive pages (cart, checkout, profile, admin).
- **State:** Component-level `useState`/`useMemo`. No global store.
- **Localization:** Vietnamese UI text, VND currency formatting.
- **Icons:** Lucide React.

## Module Map

| Module | Description | Status |
|--------|-------------|--------|
| Auth | Login, signup, email verification, OAuth (Google/Facebook), password management, role middleware | Done |
| Storefront | Homepage with SSR + infinite scroll, product detail (gallery, variants, reviews) | Done |
| Cart & Checkout | Cart management, checkout with GHN address validation + auto shipping preview, COD and VNPay payment, order confirmation overlay, VNPay return page | Done |
| User Profile | Profile editing, orders history, notifications, vouchers, address management | Done |
| Admin Products | Product add/edit form, variant matrix (size x color), image upload, product list with filters | Done |
| Admin Categories | Category CRUD with dialog modal | Done |
| Admin Core | Collapsible sidebar, role-guarded layout, customer list table | Done |
| UI System | Component library standardization — migrate raw HTML + antd to shadcn/ui | Backlog |
| Admin Dashboard | Metrics and overview widgets | Stub |
| Admin Orders | Order management for admins | Stub |
| Admin Transactions | Transaction tracking | Stub |
| Admin Coupons | Voucher/coupon management | Stub |
| Admin Brands | Brand management | Stub |
| Admin Reviews | Review moderation | Stub |
| Admin Roles | Role management | Stub |
| Admin Authority | Permission management | Stub |
| Admin Shop | Shop settings | Stub |
