---
name: bible-react-hotkeys
description: Use when creating or modifying keyboard shortcuts/hotkeys in frontend code
---

# React Hotkeys

Use `react-hotkeys-hook` for all keyboard shortcuts. Manual `keydown`/`keyup` listeners are only for continuous input (WASD camera movement, game-style held keys).

## Basic Usage

```typescript
import { useHotkeys } from "react-hotkeys-hook";

export const useHotkeys_PageDashboard = () => {
    // Simple hotkey (blocked in inputs by default)
    useHotkeys("space", () => togglePlayback(), { preventDefault: true });

    // Escape — ALWAYS use enableOnFormTags: true
    useHotkeys("escape", () => clearSelection(), { enableOnFormTags: true });

    // Conditional hotkey (check inside callback)
    useHotkeys("f", () => {
        if (!canFullscreen) return;
        toggleFullscreen();
    }, { preventDefault: true });
};
```

## Naming & Location

**Hook naming:** `useHotkeys_[ComponentName]` — co-located with the component.

```
Page_Dashboard/
├── Page_Dashboard.tsx                    # calls useHotkeys_PageDashboard()
├── useHotkeys_PageDashboard.ts
└── PageDashboard_Timeline/
    ├── PageDashboard_Timeline.tsx        # calls useHotkeys_PageDashboard_Timeline()
    └── useHotkeys_PageDashboard_Timeline.ts
```

## Options

| Option                    | Default | Description                                      |
| ------------------------- | ------- | ------------------------------------------------ |
| `preventDefault`          | `false` | Prevent browser default (use for Space, F, etc.) |
| `enableOnFormTags`        | `false` | Allow in input/textarea/select                   |
| `enableOnContentEditable` | `false` | Allow in contentEditable elements                |
| `enabled`                 | `true`  | Conditionally enable/disable                     |

## Rules

### 1. Default Input Protection

Hotkeys are blocked in input/textarea/select by default — this is desired behavior.

### 2. Escape Always Works

Always add `enableOnFormTags: true` for Escape:

```typescript
useHotkeys("escape", () => cancel(), { enableOnFormTags: true });
```

### 3. Prevent Browser Defaults

For keys with browser defaults (Space scrolls, F triggers forms):

```typescript
useHotkeys("space", () => play(), { preventDefault: true });
```

### 4. Dependencies

If the callback reads external state, declare deps:

```typescript
// ✅ Reading external value — declare deps
useHotkeys("delete", () => {
    if (selectedId) deleteItem(selectedId);
}, { preventDefault: true }, [selectedId, deleteItem]);

// ✅ No external deps — functional update, no deps needed
useHotkeys("space", () => {
    setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
}, { preventDefault: true });
```

| Scenario                               | Deps needed? |
| -------------------------------------- | ------------ |
| Reading external state/values          | Yes          |
| Functional update only (`prev => ...`) | No           |
| Calling function with captured ID      | Yes          |

### 5. Conditional Enabling

```typescript
// Pattern A: Check inside callback (simpler, preferred)
useHotkeys("f", () => {
    if (selectedType !== "item") return;
    toggleFullscreen();
});

// Pattern B: Use enabled option (prevents callback entirely)
useHotkeys("f", () => toggleFullscreen(), {
    enabled: selectedType === "item",
}, [selectedType]);
```

### 6. Multi-Key Shortcuts

```typescript
useHotkeys("ctrl+s, cmd+s", () => save(), { preventDefault: true });
useHotkeys(["ctrl+z", "cmd+z"], () => undo());
```

## NOT For Continuous Input

Do NOT use `react-hotkeys-hook` for held-key input (WASD camera, game controls). Use manual listeners with refs:

```typescript
const keys = useRef({ w: false, a: false, s: false, d: false });

useEffect(() => {
    const down = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase();
        if (key in keys.current) keys.current[key as keyof typeof keys.current] = true;
    };
    const up = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase();
        if (key in keys.current) keys.current[key as keyof typeof keys.current] = false;
    };
    document.addEventListener("keydown", down);
    document.addEventListener("keyup", up);
    return () => {
        document.removeEventListener("keydown", down);
        document.removeEventListener("keyup", up);
    };
}, []);
```

## Anti-Patterns

| Wrong | Correct |
|---|---|
| Manual `addEventListener('keydown')` for shortcuts | `useHotkeys()` from library |
| Missing `enableOnFormTags` for Escape | Always add it for Escape |
| Reading external state without deps | Declare deps array |
| `react-hotkeys-hook` for WASD/held keys | Manual listeners with refs |

## Onboarding

### Decisions
None — `react-hotkeys-hook` is the standard.

### Scaffolding
Install: `pnpm add react-hotkeys-hook`
