# Auth flow uses shadcn instead of Ant Design

Work Item: t2-ui-system-02
Tier 1: t1-ui-system-01 [v1.1.0 | UI System] Standardize customer UI on shadcn/ui (In Progress)
Module: UI System
Spec: docs/specs/ui-system.md
Version Doc: docs/versions/v1.1.0/ui-system.md
Siblings: 5 total, 1 Done — t2-ui-system-01 Foundation (Done), t2-ui-system-03 Customer pages (Todo), t2-ui-system-04 Navbar dropdown (In Progress), t2-ui-system-05 Remove antd (Todo)
Execution Order: Step 2 of 3 — prerequisite t2-ui-system-01 Done

## Context

Non-tech: Replace all Ant Design usage in the auth flow with shadcn/ui equivalents, and retire the custom Button/Input components. No visual redesign — same look, different internals.
Tech: 6 files use antd (verify.tsx, modal.reactive.tsx, login, signup, change-password, forgot-password). 4 auth pages also use custom @/components/button and @/components/input. Sonner <Toaster /> already mounted in layout.tsx.
Related: Codebase Health — t2-codebase-health-04 (API errors surfaced) established the ApiError pattern used in all auth catch blocks.

## Phase A: Replace antd notification/message with toast()

- [x] verify.tsx — replace `message.success()` and `notification.error()` with `toast.success()` and `toast.error()` from sonner; remove antd notification/message imports
- [x] modal.reactive.tsx — replace `notification.error()` with `toast.error()` from sonner; remove antd notification import
- [x] login/page.tsx — replace `notification` import from antd/es/notification with `toast` from sonner; remove `@ant-design/v5-patch-for-react-19` import
- [x] signup/page.tsx — replace `notification.error()` with `toast.error()` from sonner; remove antd imports
- [x] change-password/page.tsx — replace all `notification.success/error()` with `toast.success/error()` from sonner; remove antd imports
- [x] forgot-password/page.tsx — replace all `notification.success/error()` with `toast.success/error()` from sonner; remove antd imports

## Phase B: Rewrite verify.tsx with shadcn

- [x] Replace antd Row/Col with Tailwind flex layout (centered, responsive max-width)
- [x] Replace antd Form/Form.Item with native `<form>` + shadcn Input + Label
- [x] Replace antd Button with shadcn Button
- [x] Replace antd Divider with shadcn Separator
- [x] Replace ArrowLeftOutlined (@ant-design/icons) with ArrowLeft from lucide-react
- [x] Preserve form validation (required activation code) using native HTML required or inline validation
- [x] Preserve existing functionality: submit calls authService.checkCode, redirects to login on success

## Phase C: Rewrite modal.reactive.tsx with shadcn Dialog

- [x] Replace antd Modal with shadcn Dialog (DialogContent, DialogHeader, DialogTitle)
- [x] Replace antd Steps with custom Tailwind step indicator (3 steps: Login → Verification → Done, highlight current)
- [x] Replace antd Form/Form.Item with native `<form>` + shadcn Input + Label for step 0 (email) and step 1 (code)
- [x] Replace antd Button with shadcn Button
- [x] Replace @ant-design/icons (UserOutlined, SolutionOutlined, SmileOutlined) with lucide-react equivalents (User, ShieldCheck, Smile)
- [x] Preserve 3-step flow: step 0 (resend email), step 1 (enter code), step 2 (success message)
- [x] Preserve controlled open/close via isModalOpen/setIsModalOpen props mapped to Dialog open/onOpenChange

## Phase D: Swap custom Button/Input to shadcn in auth pages

- [x] login/page.tsx — replace `@/components/button` with shadcn Button (type="submit", full-width, loading state via disabled + LoaderCircle icon); replace `@/components/input` with shadcn Input + inline error display
- [x] signup/page.tsx — same Button/Input swap as login
- [x] change-password/page.tsx — same Button/Input swap; preserve 2-step form and grid layout
- [x] forgot-password/page.tsx — same Button/Input swap; replace DummyLogo with Image (matching other auth pages)
- [x] Delete src/components/button.tsx (custom submit button — no longer imported)
- [x] Delete src/components/input.tsx (custom input with label/error/icon — no longer imported)
- [x] Run `npx tsc --noEmit` to verify no type errors
