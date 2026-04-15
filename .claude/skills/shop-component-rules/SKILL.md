---
name: shop-component-rules
description: Use when writing any React component — JSX, event handlers, styling, text content, file naming
---

# Component Rules

Enforced on every component in the project. No exceptions unless explicitly overridden.

## Language

All user-facing UI text MUST be Vietnamese. No English on screen — ever.

```tsx
// ✅ Correct
<Button>Lưu thay đổi</Button>
<p>Không tìm thấy kết quả</p>
placeholder="Nhập tin nhắn..."
aria-label="Đóng"

// ❌ Wrong
<Button>Save Changes</Button>
<p>No results found</p>
placeholder="Type a message..."
aria-label="Close"
```

Applies to: labels, placeholders, buttons, empty states, error messages, tooltips, loading text, section headers, aria-labels — anything visible on screen.

## File Naming

Components use **PascalCase** filenames. Always.

```
src/components/product/ProductCard.tsx     ✅
src/components/chat/FloatingChat.tsx       ✅
src/components/header/navbar.tsx           ❌ → Navbar.tsx
src/components/app-logo.tsx                ❌ → AppLogo.tsx
src/components/auth/modal.reactive.tsx     ❌ → ModalReactive.tsx
```

Pages follow Next.js conventions (`page.tsx`, `layout.tsx`).

## Exports

Components: `export default function ComponentName()`  
Services: `export const entityService = {}`  
DTOs: `export interface EntityDto {}`  
Hooks: `export function useHookName()`

## Clickable Elements

Every clickable element MUST have `cursor-pointer`:

```tsx
// ✅ Correct
<button className="cursor-pointer" onClick={handleClick}>Submit</button>
<div className="cursor-pointer" onClick={() => setOpen(true)}>Open</div>

// ❌ Wrong — missing cursor-pointer
<button onClick={handleClick}>Submit</button>
<div onClick={() => setOpen(true)}>Open</div>
```

## Sharp Edges — No Border Radius

The design system uses `--radius: 0`. Never add `rounded-*` classes to custom components.

```tsx
// ✅ Correct
<div className="border border-gray-200">Sharp box</div>
<div className="bg-black text-white">Sharp button</div>

// ❌ Wrong
<div className="rounded-lg border">...</div>
<div className="rounded-full">Avatar</div>
```

Exceptions:
- shadcn/ui base components (`src/components/ui/`) — they inherit `--radius: 0` from CSS variables
- Actual circles (loading spinners) — use inline `style={{ borderRadius: '50%' }}` not Tailwind class

## "use client" Directive

Only add `"use client"` when the component uses:
- Hooks (`useState`, `useEffect`, `useSession`, etc.)
- Event handlers (`onClick`, `onChange`, etc.)
- Browser-only APIs (`window`, `document`, etc.)

Server components (no directive) when the component only renders props/children.

## Component Folder Structure

```
src/components/
├── ui/              ← shadcn/ui primitives (don't modify)
├── admin/           ← admin-only components
│   └── chat/
├── chat/            ← storefront chat widget
├── header/          ← navigation/header
├── home/            ← homepage-specific
├── product/         ← product display
├── profile/         ← user profile
└── auth/            ← login/signup
```

Colocation: page-specific components go in their area folder. Shared across areas → create a new top-level folder or use `ui/`.
