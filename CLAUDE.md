# Claude Code Project Rules for fe-ecomerce-shop

## Language
- All user-facing UI text MUST be written in Vietnamese by default — no exceptions.
- This applies to: labels, placeholders, buttons, empty states, error messages, tooltips, loading text, section headers, aria-labels — anything a user sees on screen.
- Do not wait to be told. Every component you write or modify must follow this rule automatically.

## Core Principles
- Never use `any`. Strictly type everything via DTOs from `openapi.json`.
- Run `npx tsc --noEmit` after changes.
- Services use `sendRequest<IBackendRes<T>>()` with typed DTOs.
- Protected endpoints: `Authorization: Bearer <token>`.
- Any clickable control (`button`, clickable `div`, custom triggers) must use a visible pointer cursor (Tailwind `cursor-pointer` or CSS `cursor: pointer`).
- All border-radius must be 0 (sharp/geometric edges). The design system uses `--radius: 0`. Never add `rounded-*` classes unless explicitly overridden.

## File Structure
- Services: `src/services/<entity>.ts` → export `<entity>Service`
- DTOs: `src/dto/<entity>.ts` → match OpenAPI names
- Components: `src/components/<area>/` → use `"use client"` only when needed
- Server components: use `auth()` for session/token

## Task Workflow
- For multi-step work: create TODO list first (what, which files, why)
- After implementation: run `npx tsc --noEmit` and fix errors
- Use `// TODO:` comments for future work

## Logging
- Format: `console.log("[ComponentName] message:", data);`
- Log API requests/responses in services: `[ServiceName] Request/Response:`
- Log important state changes in components
- Don't leak full tokens (truncate if needed)

## Admin Pages
- Scoped theme: `src/styles/theme-admin.css` (imported in admin layout) overrides globals
- Border radius: 8px (`--radius: 0.5rem`) — `rounded-lg` / `rounded-md` ARE correct in admin
- Accent palette (green): `var(--admin-green-light)` #eaf8e7 · `var(--admin-green-mid)` #c1e6ba · `var(--admin-green-dark)` #023337
- Active state: `bg-[var(--admin-green-mid)] text-[var(--admin-green-dark)]`
- Cards: `bg-white rounded-lg shadow-[var(--admin-card-shadow)]`
- Collapsible sidebar, expanded menu sections
- NOTE: Core Principles (`--radius: 0`, black/white accents) apply to **storefront only**, not admin

### Admin component checklist — apply every time you write OR touch any admin file
**Raw HTML → shadcn substitution (NEVER use the raw version in admin):**
| Raw HTML | shadcn replacement |
|---|---|
| `<button>` | `<Button>` (variant: default/outline/ghost/destructive/icon) |
| `<input>` | `<Input>` |
| `<select>` / `<option>` | `<Select>` + `<SelectTrigger>` + `<SelectContent>` + `<SelectItem>` |
| `<label>` | `<Label>` |
| `<span>` status/type badge | `<Badge>` |
| custom toggle/switch | `<Switch>` |
| manual tab bar (`<button>` row) | `<Tabs>` + `<TabsList>` + `<TabsTrigger>` |

**Color rule — NEVER hardcode palette hex in admin:**
- ❌ `#4ea674`, `#023337`, `#eaf8e7`, `#c1e6ba`, `bg-black`, `bg-blue-*`, `bg-orange-*`
- ✅ `var(--admin-green-light/mid/dark)`, or just use default shadcn `<Button>` / `<Badge>` and let `--primary` handle it
- Red for destructive actions is OK. `bg-black/50` modal overlays are OK.

**Portal fix — already solved globally:** `AdminBodyTheme` in `src/app/admin/layout.tsx` adds `admin-theme` to `<body>`, so all Dialog/Sheet/Popover portals inherit the theme automatically. Never add `admin-theme` to individual `DialogContent`.

## Examples
```ts
// Service
getAllProducts(accessToken?: string) {
  return sendRequest<IBackendRes<ProductDto[]>>({
    url: `${BASE_URL}/products`,
    method: "GET",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
}

// Type-safe state
type Gender = "MALE" | "FEMALE" | "OTHER" | "";
const gender: Gender = profile?.gender || "";
```

## Custom Commands
- `/gitpush` — Smart git commit & push (groups changes into logical commits)
- `/tsc` — Run TypeScript check (`npx tsc --noEmit`)
- `/test` — Run project tests
