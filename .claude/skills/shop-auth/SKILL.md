---
name: shop-auth
description: Use when accessing user session, checking auth state, protecting routes, or extracting JWT tokens
---

# Auth Patterns

next-auth v5 with JWT strategy. Two access modes depending on component type.

## Server Components — `auth()`

```ts
import { auth } from "@/auth";

export default async function ProfilePage() {
  const session = await auth();
  const token = session?.user?.access_token;
  const userId = session?.user?.id;

  // Pass token to service for server-side fetch
  const res = await orderService.getAll(token);
  return <OrderList orders={res.data} />;
}
```

## Client Components — `useSession()`

```tsx
"use client";
import { useSession } from "next-auth/react";

export default function ChatWidget() {
  const { data: session } = useSession();
  const token = session?.user?.access_token ?? null;
  const email = session?.user?.email ?? null;
  const role = session?.user?.role; // "USER" | "ADMIN" | "OPERATOR"

  if (!session) return null; // not logged in
  return <div>...</div>;
}
```

## Session Shape

Defined in `src/types/next-auth.d.ts`:

```ts
interface IUser {
  id: string;
  name: string;
  email: string;
  access_token: string;
  role?: "USER" | "ADMIN" | "OPERATOR" | "";
  isAdmin?: boolean;
  firstName?: string;
  lastName?: string;
  image?: string;
}
```

Access token: `session.user.access_token`  
User ID: `session.user.id` (string — cast with `Number()` when backend expects number)  
Role: `session.user.role`

## Admin Guard

Server-side in `src/app/admin/layout.tsx`:

```ts
const session = await auth();
const isAdmin = session?.user?.role === "ADMIN" || session?.user?.isAdmin === true;
if (!isAdmin) return <Unauthorized />;
```

Client-side — hide UI, never rely on it for security:

```tsx
const { data: session } = useSession();
if (session?.user?.role !== "ADMIN") return null;
```

## Rules

| Context | Method | Token location |
|---|---|---|
| Server component / API route | `await auth()` | `session.user.access_token` |
| Client component | `useSession()` | `session?.user?.access_token` |
| Middleware | `auth` export from next-auth | `session.user` |
| WebSocket | Pass token from client session | `socket.handshake.auth.token` |

## Anti-Patterns

| Wrong | Correct |
|---|---|
| `getServerSession()` (v4 API) | `auth()` (v5 API) |
| Storing token in localStorage | Token lives in encrypted session cookie |
| `session.accessToken` | `session.user.access_token` |
| Trusting client-side role check for security | Always guard in middleware + server layout |
