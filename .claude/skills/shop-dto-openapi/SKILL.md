---
name: shop-dto-openapi
description: Use when creating or updating TypeScript interfaces in src/dto/, syncing types with backend, or the user mentions openapi.json
---

# DTOs from OpenAPI

All TypeScript interfaces for API data live in `src/dto/`. The single source of truth is `openapi.json` at the project root.

## File Pattern

One file per entity: `src/dto/<entity>.ts`

```ts
// src/dto/product.ts
export interface ProductDto {
  id: number;
  name: string;
  description: string | null;
  price: number;
  createdAt: string;
  updatedAt: string;
}
```

## Rules

### Never use `any`

Every API response must be typed. If the OpenAPI schema is incomplete, define the interface from the actual response shape.

```ts
// ✅ Correct
return sendRequest<IBackendRes<ProductDto[]>>({ ... });

// ❌ Wrong
return sendRequest<any>({ ... });
```

### Match OpenAPI schema names

Interface names should mirror the OpenAPI `components.schemas` names:

| OpenAPI Schema | DTO Interface |
|---|---|
| `CreateRoomDto` | `CreateRoomDto` |
| `ProductEntity` | `ProductDto` (drop "Entity", add "Dto") |
| `LoginResponse` | `LoginResponse` |

### Nullable fields use `| null`

```ts
// ✅ Correct — matches OpenAPI "nullable: true"
description: string | null;

// ❌ Wrong
description?: string;  // optional is different from nullable
```

### Request DTOs separate from response DTOs

```ts
// Response (what the API returns)
export interface ProductDto {
  id: number;
  name: string;
  price: number;
}

// Request (what we send)
export interface CreateProductRequest {
  name: string;
  price: number;
  categoryId: number;
}
```

### Backend response wrapper

All API responses are wrapped in `IBackendRes<T>`:

```ts
// Defined in src/types/backend.d.ts
interface IBackendRes<T> {
  data?: T;
  message?: string;
  statusCode?: number;
}
```

## Workflow: Adding a New Endpoint

1. Read the endpoint in `openapi.json` — find the path, method, request/response schemas
2. Create or update the DTO file in `src/dto/<entity>.ts`
3. Add the service method in `src/services/<entity>.ts` using the DTO
4. Use the typed response in the component

## Anti-Patterns

| Wrong | Correct |
|---|---|
| `any` | Named interface |
| Inline type `{ id: number; name: string }` in service call | Import from `src/dto/` |
| Guessing field names | Read `openapi.json` first |
| `string` for enums | Union type: `"MALE" \| "FEMALE" \| "OTHER"` |
| Duplicating types across files | Single definition in `src/dto/`, import everywhere |
