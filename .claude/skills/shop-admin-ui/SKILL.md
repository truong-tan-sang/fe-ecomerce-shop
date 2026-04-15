---
name: shop-admin-ui
description: Use when building or modifying pages under /admin — layout, tables, forms, sidebar navigation
---

# Admin UI

All admin pages share a consistent visual language: light theme, black/white accents, sharp edges, shadcn/ui components.

## Layout

```
┌──────────┬────────────────────────────┐
│          │                            │
│ Sidebar  │     Main content           │
│ (260px)  │     (flex-1, scrollable)   │
│          │                            │
│          │                            │
└──────────┴────────────────────────────┘
```

- Sidebar: `src/app/admin/sidebar.tsx` — collapsible, black bg on active links
- Layout: `src/app/admin/layout.tsx` — server component, admin guard via `auth()`
- Main: `overflow-y-auto` on the content area, sidebar is fixed height

## Adding a New Admin Page

1. Create `src/app/admin/<feature>/page.tsx`
2. Add sidebar link in `src/app/admin/sidebar.tsx` under the correct menu group
3. Use shadcn/ui components for all UI elements

```tsx
// src/app/admin/feature/page.tsx
import { auth } from "@/auth";
import FeaturePageClient from "@/components/admin/feature/FeaturePageClient";

export default async function FeaturePage() {
  const session = await auth();
  // server-side data fetching if needed
  return <FeaturePageClient />;
}
```

## Sidebar Menu Structure

```ts
// Menu groups in sidebar.tsx
const mainMenuItems = [
  { label: "Trang chủ", href: "/admin", icon: Home },
  { label: "Quản lý đơn hàng", href: "/admin/orders", icon: ShoppingCart },
  // ... new items go here
];

const productItems = [
  { label: "Danh sách sản phẩm", href: "/admin/products/list", icon: List },
  // ...
];
```

Active link style: `bg-black text-white font-bold`  
Inactive: `text-[#6a717f] font-normal hover:bg-gray-100`

## Component Usage

Use shadcn/ui for all form elements and data display:

| Element | Component | Import |
|---|---|---|
| Buttons | `Button` | `@/components/ui/button` |
| Data tables | `Table, TableRow, TableCell` | `@/components/ui/table` |
| Status labels | `Badge` | `@/components/ui/badge` |
| Form inputs | `Input, Select, Checkbox` | `@/components/ui/*` |
| Modals | `Dialog` | `@/components/ui/dialog` |
| Tabs | `Tabs, TabsList, TabsTrigger` | `@/components/ui/tabs` |

## Color Palette

```
Background:  bg-gray-50 (page), bg-white (cards/panels)
Text:        text-black (primary), text-gray-500 (secondary)
Accents:     bg-black text-white (active states, primary buttons)
Borders:     border-gray-200
Hover:       hover:bg-gray-100
```

No colors beyond black/white/gray unless displaying data (status badges, charts).

## Page Header Pattern

```tsx
<div className="px-6 py-6 border-b border-gray-200 bg-white">
  <h1 className="text-xl font-bold">Quản lý đơn hàng</h1>
  <p className="text-sm text-gray-500 mt-1">Danh sách tất cả đơn hàng</p>
</div>
```

## Anti-Patterns

| Wrong | Correct |
|---|---|
| Custom styled `<input>` | `<Input />` from shadcn/ui |
| Colored backgrounds/accents | Black/white/gray only |
| `rounded-lg` on cards | No border radius (sharp edges) |
| English page titles | Vietnamese: "Quản lý đơn hàng" not "Order Management" |
| Putting client logic in page.tsx | Extract to `src/components/admin/<feature>/` |
