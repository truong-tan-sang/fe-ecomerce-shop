# Hydration Mismatch — Login Page Inputs

## Status
Unresolved. `suppressHydrationWarning` applied but error still appears.

## Error
React hydration mismatch on `<input type="email">` and `<input type="password">` — className attribute differs between server-rendered HTML and client.

## Suspected cause
Browser password manager / extension (Chrome built-in, LastPass, Bitwarden, etc.) modifies input attributes before React hydrates. The `className` diff is extension-injected.

## What was tried
- Removed Google sign-in button (separate mismatch on that button — resolved)
- Added `suppressHydrationWarning` to both `<Input>` usages — error persists

## Next debug steps
1. Reproduce in Chrome incognito with all extensions disabled — if gone, it IS the extension
2. If still present in incognito: log the exact className diff (not truncated) to identify what's different
3. Check if `SessionProvider` initial session state causes a server/client mismatch on first paint
4. Check if `cn()` / tailwind-merge produces different output server vs client (unlikely but possible with config mismatch)

## Files involved
- `src/app/auth/login/page.tsx`
- `src/components/ui/input.tsx` (shadcn Input, already has disabled: classes baked in)
