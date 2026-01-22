# Centralized Theme System Refactoring

## Overview
Implemented a centralized light/dark theme system using CSS variables and TypeScript utilities to replace scattered `dark:` classes throughout the codebase.

## Changes Made

### 1. **CSS Variables System** (`src/styles/theme.css`)
- Created comprehensive CSS variable palette with light and dark theme variants
- Variables organized by category:
  - **Backgrounds**: `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--bg-overlay`, `--bg-button`
  - **Text Colors**: `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-inverse`
  - **Borders**: `--border-primary`, `--border-light`, `--border-lighter`, `--border-accent`
  - **Shadows**: `--shadow-sm`, `--shadow-md`, `--shadow-lg`
  - **Accents**: `--accent-primary`, `--accent-secondary`
  - **UI Elements**: `--ui-shape-primary`, `--ui-shape-hover`, `--ui-scan`, `--ui-grid`
  - **Status Colors**: `--status-success`, `--status-error`, `--status-warning`, `--status-info`
  - **Gradients**: `--gradient-header`, `--gradient-info`, `--gradient-toast`

- Light theme (default) applied to `:root`
- Dark theme applied via `[data-theme="dark"]` and `html.dark` selectors

### 2. **TypeScript Theme Utilities** (`src/lib/theme.ts`)
- Created typed `theme` object for type-safe access to CSS variables
- Structure mirrors CSS variable organization:
  ```typescript
  theme.bg.primary        // Returns "var(--bg-primary)"
  theme.text.primary      // Returns "var(--text-primary)"
  theme.shadow.lg         // Returns "var(--shadow-lg)"
  theme.status.error      // Returns "var(--status-error)"
  theme.ui.shape.primary  // Returns "var(--ui-shape-primary)"
  ```
- Added `themeVar()` helper function for dynamic variable access

### 3. **Component Refactoring**

#### ProductCard (`src/components/product/ProductCard.tsx`)
- **Before**: Hardcoded colors, mixed inline styles and Tailwind classes
- **After**: Uses theme variables throughout:
  - Shadows: `theme.shadow.sm/md`
  - Overlays: `theme.accent.primary`, `theme.text.primary`
  - Badges: Inline styles with `var(--accent-primary)` and `var(--accent-secondary)`
  - Gradients: `theme.gradient.info`
  - Icons/shapes: `theme.ui.shape.primary/hover`, `theme.ui.scan`

#### Header/Navbar (`src/components/header/navbar.tsx`)
- **Before**: Mixed `dark:` Tailwind classes with hardcoded colors
- **After**: Replaced with theme variables:
  - Header gradient: `theme.gradient.header`
  - Menu backgrounds: `theme.bg.secondary`
  - Text colors: `theme.text.primary/secondary/tertiary`
  - Borders: `theme.border.light`, `theme.border.accent`
  - Button styles: `theme.bg.button`
  - Status colors: `theme.status.error`
  - Shadows: `theme.shadow.lg`

#### Toast (`src/components/toast.tsx`)
- **Before**: Hardcoded dark styling with monochrome appearance
- **After**: Full theme integration:
  - Background: `theme.gradient.toast`
  - Text: `theme.text.primary`
  - Icons: Status colors (`theme.status.success/error/info`)
  - Borders: `theme.border.light`, `theme.border.accent`
  - Shapes: `theme.ui.shape.primary`
  - Accent line: `theme.accent.primary`

### 4. **Global Configuration** (`src/app/globals.css`)
- Added import: `@import "../styles/theme.css"`
- Theme.css is loaded before any component styles
- Ensures all CSS variables are available globally

## Benefits

1. **Single Source of Truth**: All colors/styles defined in one place (`theme.css`)
2. **Type Safety**: TypeScript object ensures correct property access
3. **Easy Maintenance**: Update colors in `theme.css`, automatically reflected everywhere
4. **Consistent Light/Dark Support**: Light and dark variants paired as variables
5. **Scalability**: Easy to add new themes or extend with additional variables
6. **Clean Code**: No scattered `dark:` prefixes throughout components
7. **Performance**: CSS variables are native browser feature, no runtime overhead

## Usage Examples

### Using Theme Variables in Inline Styles
```typescript
<div style={{ background: theme.bg.primary, color: theme.text.primary }}>
  Content
</div>
```

### Using CSS Variables Directly
```typescript
<div style={{ borderColor: "var(--accent-primary)" }}>
  Content
</div>
```

### Combining with Tailwind
```typescript
<div className="border border-[var(--border-light)] rounded-md">
  Content
</div>
```

## Theme Toggle Implementation
The existing `ThemeProvider` component handles theme toggling:
1. Reads `localStorage('theme')`
2. Checks system preference as fallback
3. Toggles `.dark` class on `documentElement`
4. CSS variables automatically switch via selectors

## Testing
- All modified components compile without TypeScript errors
- No breaking changes to component APIs
- Backward compatible with existing functionality
- Theme toggle functionality preserved

## Future Enhancements
- Add more theme variants (high-contrast, custom user themes)
- Create theme builder utility
- Add theme preview/editor component
- Extend with animation timings, spacing, border radius as variables
