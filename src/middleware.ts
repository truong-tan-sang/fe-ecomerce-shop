import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function middleware(req: Request) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  const session = await auth();

  // Debug logging
  console.log("[Middleware] Pathname:", pathname);
  console.log("[Middleware] Session:", JSON.stringify(session, null, 2));
  console.log("[Middleware] User role:", session?.user?.role);
  console.log("[Middleware] User isAdmin:", session?.user?.isAdmin);

  // Redirect admins to /admin when landing on home or homepage
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.isAdmin === true;
  if ((pathname === "/" || pathname === "/homepage") && isAdmin) {
    console.log("[Middleware] Redirecting admin to /admin");
    return NextResponse.redirect(new URL("/admin", url));
  }

  // Protect /admin for admin role only
  if (pathname.startsWith("/admin")) {
    if (!session) {
      console.log("[Middleware] No session, redirecting to login");
      return NextResponse.redirect(new URL("/auth/login", url));
    }
    if (!isAdmin) {
      console.log("[Middleware] User is not admin, redirecting to /");
      return NextResponse.redirect(new URL("/", url));
    }
    console.log("[Middleware] Admin access granted");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth|verify|$).*)"],
};
