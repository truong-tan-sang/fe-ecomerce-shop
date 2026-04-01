# [v1.0.0 | Admin Products] Product and variant management

## Rationale
Admin needs to manage the product catalog — create products with variants, upload images, manage inventory.

## Scope
- Product form (add/edit) with image upload via FormData
- Variant matrix (size x color) with per-cell stock/price
- Color management (create/edit colors inline)
- Color-specific image upload
- Product list with search, category filter, status tabs, pagination, delete
- Product variant CRUD with dimensions (weight, height, width, length)

## Summary
Fully implemented. 3 pages (add, edit/[id], list) + 2 stubs (media, reviews). 6 form components, product service (9 endpoints), variant service (5 endpoints), color service (4 endpoints).
