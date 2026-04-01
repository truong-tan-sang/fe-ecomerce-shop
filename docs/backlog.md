# Backlog

Master tracking file for all work items. Managed by `/pm`, `/p`, `/pp`.

States: `Backlog` → `Todo` → `In Progress` → `Done` | `Cancelled`

---

## v1.0.0 (retroactive baseline)

### T1: [v1.0.0 | Auth] Authentication system — Done {#t1-auth-01}
- (baseline — no T2 breakdown)

### T1: [v1.0.0 | Storefront] Product browsing and detail — Done {#t1-storefront-01}
- (baseline — no T2 breakdown)

### T1: [v1.0.0 | Cart & Checkout] Shopping cart and order placement — Done {#t1-cart-checkout-01}
- (baseline — no T2 breakdown)

### T1: [v1.0.0 | User Profile] User profile and order history — Done {#t1-user-profile-01}
- (baseline — no T2 breakdown)

### T1: [v1.0.0 | Admin Products] Product and variant management — Done {#t1-admin-products-01}
- (baseline — no T2 breakdown)

### T1: [v1.0.0 | Admin Categories] Category management — Done {#t1-admin-categories-01}
- (baseline — no T2 breakdown)

### T1: [v1.0.0 | Admin Core] Admin layout, sidebar, customers — Done {#t1-admin-core-01}
- (baseline — no T2 breakdown)

---

## v1.1.0

### T1: [v1.1.0 | Codebase Health] Fix vibe-coding inconsistencies — In Progress {#t1-codebase-health-01}
1. T2: Cart system works end-to-end (5pts, was 8pts) — Done {#t2-codebase-health-01}
2. T2: Single canonical product variant and media DTOs (3pts, was 5pts) — Done {#t2-codebase-health-02}
3. T2: Consistent session token access (3pts) — In Progress {#t2-codebase-health-03}
4. T2: API errors surfaced, not swallowed (8pts) — Done {#t2-codebase-health-04}
5. T2: Auth layer fully typed (5pts) — In Progress {#t2-codebase-health-05}
6. T2: Infrastructure types and dead code cleanup (3pts, was 5pts) — Done {#t2-codebase-health-06}
7. T2: Remove dark mode (5pts, was 3pts) — Done {#t2-codebase-health-07}

Execution Order:
1. t2-codebase-health-02 + t2-codebase-health-03 + t2-codebase-health-06 + t2-codebase-health-07 (parallel — foundational cleanup)
2. t2-codebase-health-04 (depends on clean infra types)
3. t2-codebase-health-01 + t2-codebase-health-05 (parallel — depends on DTOs + error handling)

### T1: [v1.1.0 | UI System] Standardize customer UI on shadcn/ui — In Progress {#t1-ui-system-01}
1. T2: shadcn foundation components installed and configured (2pts) — Done {#t2-ui-system-01}
2. T2: Auth flow uses shadcn instead of Ant Design (5pts) — Done {#t2-ui-system-02}
3. T2: Customer page buttons and inputs use shadcn (5pts) — In Progress {#t2-ui-system-03}
4. T2: Navbar dropdown uses shadcn DropdownMenu (3pts) — Done {#t2-ui-system-04}
5. T2: Ant Design dependency removed from project (2pts) — Todo {#t2-ui-system-05}
6. T2: Product cards show rich data and correct images (8pts) — In Progress {#t2-ui-system-06}

Execution Order:
1. t2-ui-system-01 (foundation — components must be installed first)
2. t2-ui-system-02 + t2-ui-system-03 + t2-ui-system-04 (parallel — independent page areas)
3. t2-ui-system-05 (last — can only remove antd after t2-02 is complete)
4. t2-ui-system-06 (parallel with step 2/3 — independent, only touches ProductCard/ProductGrid/ProductDetail)

### T1: [v1.1.0 | Admin Products] Product list UX and bug fixes — Done {#t1-admin-products-02}
1. T2: Fix voucherId FK violation + infinite scroll with virtualization (3pts) — Done {#t2-admin-products-01}

### T1: [v1.1.0 | Cart & Checkout] Wire checkout to real backend API — Done {#t1-cart-checkout-02}
1. T2: Checkout DTOs and services match backend (5pts, was 3pts) — Done {#t2-cart-checkout-01}
2. T2: COD checkout flow works end-to-end (5pts) — Done {#t2-cart-checkout-02}
3. T2: VNPay payment flow works end-to-end (5pts) — Done {#t2-cart-checkout-03}
4. T2: Checkout UX polish (3pts) — Done {#t2-cart-checkout-04}

Execution Order:
1. t2-cart-checkout-01 (foundation — all flows depend on correct DTOs/services)
2. t2-cart-checkout-02 (core COD flow — validates the whole pipeline)
3. t2-cart-checkout-03 (VNPay — builds on working order flow)
4. t2-cart-checkout-04 (polish — last, once flows work)

