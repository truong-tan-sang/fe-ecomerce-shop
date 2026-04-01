# UI System

## Non-Technical Description

Cross-cutting module governing the component library strategy for the entire frontend. The project is standardizing on shadcn/ui across all layers. Admin pages, auth flow, and navbar all use shadcn/ui. Customer pages still use raw HTML + Tailwind — migration in progress.

- 17 shadcn/ui components installed and configured
- Auth flow fully migrated: no Ant Design imports remain in `src/`
- Navbar account dropdown uses shadcn DropdownMenu (click-to-open, keyboard nav, accessible)
- Toast system: Sonner mounted globally, all auth pages use `toast()` from sonner
- Custom `components/button.tsx` and `components/input.tsx` retired and deleted
- Design system: black/white, `--radius: 0`, light-only

## Technical Implementation

### Component inventory (src/components/ui/)

Button, Badge, Input, Select, Switch, Table, Tabs, Textarea, Label, Card, Popover, Dialog, Command, DropdownMenu, Form, Separator, Sonner

### Navbar (migrated to shadcn DropdownMenu)

- `src/components/header/navbar.tsx` — account dropdown uses DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator
- `modal={false}` on root to prevent body scroll lock (avoids scrollbar layout jag)
- Click-only (no hover-to-open), keyboard navigation via Radix
- Items: Profile, Notifications, Orders, Vouchers + destructive Logout

### Auth flow (fully migrated to shadcn)

| File | Components used |
|------|----------------|
| verify.tsx | Input, Button, Label, Separator, ArrowLeft (lucide) |
| modal.reactive.tsx | Dialog, Input, Button, Label, custom StepIndicator, User/ShieldCheck/Smile (lucide) |
| login/page.tsx | Input, Button, LoaderCircle (lucide), toast (sonner) |
| signup/page.tsx | Input, Button, LoaderCircle (lucide), toast (sonner) |
| change-password/page.tsx | Input, Button, LoaderCircle (lucide), toast (sonner) |
| forgot-password/page.tsx | Input, Button, Label, LoaderCircle/Mail (lucide), toast (sonner) |

### Files still using raw HTML + Tailwind (to be migrated — T2-03)

Customer pages: cart, checkout, product detail, profile, homepage — use raw `<button>`, `<input>`, `<select>` with inline Tailwind.

### Antd status

Zero antd imports in `src/`. Package still in `package.json` — removal is T2-05.

### Configuration

- `components.json` — new-york style, neutral base color, CSS variables enabled
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `src/app/globals.css` — `--radius: 0`, all shadcn CSS variables (oklch), light-only
- `src/styles/theme.css` — custom design tokens
- `src/app/layout.tsx` — `<Toaster />` from sonner mounted globally

## Version History

- [v1.1.0] — Installed DropdownMenu, Form, Separator, Sonner; added Toaster to layout; cleaned dark: classes
- [v1.1.0] — Migrated auth flow from antd to shadcn (verify, modal, login, signup, change-password, forgot-password); retired custom Button/Input components
- [v1.1.0] — Navbar account dropdown replaced with shadcn DropdownMenu (click-only, modal=false, keyboard nav)
