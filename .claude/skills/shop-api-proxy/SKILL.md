---
name: shop-api-proxy
description: Use when a client component needs to call the backend REST API and hits CORS errors, or when creating new API proxy routes
---

# API Proxy for CORS

When a `"use client"` component calls the backend directly (browser → `localhost:4000`), the browser sends a cross-origin request that gets blocked by CORS preflight. The fix: route through a Next.js API catch-all route that proxies server-side.

## When You Need a Proxy

| Caller | Backend URL | CORS? | Solution |
|---|---|---|---|
| Server component | `http://localhost:4000/...` | No — server-to-server | Direct call via `BASE_URL` |
| Client component | `http://localhost:4000/...` | **Yes — blocked** | Proxy via `/api/proxy/...` |
| Client component | `/api/proxy/...` | No — same origin | Already proxied |

## Creating a Proxy Route

Catch-all route at `src/app/api/proxy/<entity>/[...path]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathname = path.join("/");
  const search = req.nextUrl.search;
  const targetUrl = `${BACKEND_URL}/<entity>/${pathname}${search}`;

  const headers = new Headers();
  const auth = req.headers.get("authorization");
  if (auth) headers.set("authorization", auth);
  headers.set("content-type", "application/json");

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody ? await req.text() : undefined;

  let backendRes: Response;
  try {
    backendRes = await fetch(targetUrl, { method: req.method, headers, body });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[proxy] fetch failed: ${message}`);
    return NextResponse.json(
      { error: "Backend unreachable", detail: message },
      { status: 502 }
    );
  }

  const text = await backendRes.text();
  return new NextResponse(text, {
    status: backendRes.status,
    headers: { "content-type": "application/json" },
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
```

## Service Usage

In the service file, use the proxy path instead of `BASE_URL`:

```ts
// ✅ Client-safe — same origin, no CORS
const CHAT_BASE = "/api/proxy/chat";

export const chatService = {
  getAllRooms(accessToken: string) {
    return sendRequest<IBackendRes<ChatRoomDto[]>>({
      url: `${CHAT_BASE}/rooms`,
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
};
```

## Existing Proxies

| Proxy path | Backend target | Used by |
|---|---|---|
| `/api/proxy/chat/*` | `/chat/*` | `chatService` (FloatingChat, AdminChat) |

## Rules

- Always forward the `Authorization` header
- Always forward query strings (`req.nextUrl.search`)
- Always handle fetch errors with try/catch → 502 response
- Never proxy from server components — call backend directly
- One proxy per entity group (not one per endpoint)
