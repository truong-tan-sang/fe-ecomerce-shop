import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathname = path.join("/");

  // Forward query string
  const search = req.nextUrl.search;
  const targetUrl = `${BACKEND_URL}/chat/${pathname}${search}`;


  const headers = new Headers();
  const auth = req.headers.get("authorization");
  if (auth) headers.set("authorization", auth);
  headers.set("content-type", "application/json");

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody ? await req.text() : undefined;

  let backendRes: Response;
  try {
    backendRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[chat-proxy] fetch failed: ${message}`);
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
