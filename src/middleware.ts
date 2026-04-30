import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function middleware(req: Request) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  const session = await auth();

  console.log("[Middleware] Pathname:", pathname);
  console.log("[Middleware] User role:", session?.user?.role);

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.isAdmin === true;
  const isOperator = session?.user?.role === "OPERATOR";

  // Redirect from home based on role
  if (pathname === "/" || pathname === "/homepage") {
    if (isAdmin) return NextResponse.redirect(new URL("/admin", url));
    if (isOperator) return NextResponse.redirect(new URL("/staff", url));
  }

  // Protect /admin — ADMIN only
  if (pathname.startsWith("/admin")) {
    if (!session) return NextResponse.redirect(new URL("/auth/login", url));
    if (!isAdmin) return NextResponse.redirect(new URL("/", url));
  }

  // Protect /staff — OPERATOR (and ADMIN for testing)
  if (pathname.startsWith("/staff")) {
    if (!session) return NextResponse.redirect(new URL("/auth/login", url));
    if (!isOperator && !isAdmin) return NextResponse.redirect(new URL("/", url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth|verify|$).*)"],
};
