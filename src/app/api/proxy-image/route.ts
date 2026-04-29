import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side image proxy used by the admin ProductForm to fetch S3 images
 * without CORS restrictions. The browser's fetch() API triggers a CORS preflight
 * that S3 blocks; routing the fetch through this server-side route avoids that.
 *
 * Usage: GET /api/proxy-image?url=<encoded-image-url>
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url parameter is required" }, { status: 400 });
  }

  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store" });
  } catch (err) {
    console.error("[proxy-image] Fetch failed for URL:", url, err);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 });
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: `Upstream returned ${response.status}` },
      { status: response.status }
    );
  }

  const buffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") || "image/jpeg";

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
