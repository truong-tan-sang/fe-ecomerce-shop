---
name: shop-service-layer
description: Use when creating or editing service files in src/services/, making API calls, or wiring up new backend endpoints
---

# Service Layer

All backend communication flows through typed service objects in `src/services/`.

## File Pattern

One file per entity: `src/services/<entity>.ts` → exports `<entity>Service`.

```ts
// src/services/product.ts
import { sendRequest } from "@/utils/api";
import { ProductDto } from "@/dto/product";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const productService = {
  getAll(page = 1, perPage = 20) {
    return sendRequest<IBackendRes<ProductDto[]>>({
      url: `${BASE_URL}/products?page=${page}&perPage=${perPage}`,
      method: "GET",
    });
  },

  getById(id: number, accessToken?: string) {
    return sendRequest<IBackendRes<ProductDto>>({
      url: `${BASE_URL}/products/${id}`,
      method: "GET",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
  },
};
```

## Rules

### Always use `sendRequest<IBackendRes<T>>()`

Never use raw `fetch()` in service files. `sendRequest` handles error formatting and response parsing.

### Protected endpoints need auth headers

```ts
// ✅ Correct
headers: { Authorization: `Bearer ${accessToken}` }

// ❌ Wrong — raw token, missing Bearer prefix
headers: { Authorization: accessToken }
```

### Query params in URL string

Encode user-provided values. Static params can be inline.

```ts
// ✅ Correct
url: `${BASE_URL}/search?q=${encodeURIComponent(query)}&page=${page}`

// ❌ Wrong — unencoded user input
url: `${BASE_URL}/search?q=${query}`
```

### Logging

Every service method logs its request:

```ts
console.log("[productService] Request: GET /products", { page, perPage });
```

Format: `[serviceName] Request: METHOD /path`

### Client-component calls need CORS proxy

If a service is called from a `"use client"` component (browser → backend), the browser sends a cross-origin request to `localhost:4000` which gets blocked by CORS.

**Solution:** Use a Next.js API proxy route. See `shop-api-proxy` skill.

```ts
// ✅ Client-safe — proxied through Next.js
const CHAT_BASE = "/api/proxy/chat";

// ❌ Broken from client components — CORS blocked
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
```

Server components can call `BASE_URL` directly (server-to-server, no CORS).

## Anti-Patterns

| Wrong | Correct |
|---|---|
| Raw `fetch()` in service file | `sendRequest<IBackendRes<T>>()` |
| `any` return type | Typed DTO: `IBackendRes<ProductDto>` |
| Hardcoded URL | `BASE_URL` from env |
| Missing auth header on protected endpoint | Always pass `accessToken` param |
| `body: payload` without typing | Type the payload as a DTO |
