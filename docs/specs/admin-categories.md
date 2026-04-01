# Admin Categories

## Non-Technical Description

Admin interface for managing product categories. Admins can view all categories in a list, create new categories, edit existing ones via a dialog modal, and delete categories with confirmation.

- Category list table
- Add/edit category via dialog modal
- Delete with confirmation dialog

## Technical Implementation

**Page:** `src/app/admin/categories/page.tsx` — client component with full CRUD via dialog

**Services used:** `categoryService.getAllCategories`, `categoryService.createCategory`, `categoryService.getCategoryById`, `categoryService.getProductsByCategory`

**DTOs:** `CategoryDto`, `CreateCategoryDto` (from `dto/category.ts`)

**UI:** shadcn Dialog, Button, Input components

## Version History
- v1.0.0 — Baseline: category CRUD with dialog modal
