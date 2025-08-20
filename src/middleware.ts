// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // FORCE LOG untuk memastikan middleware berjalan
  // console.log("🔥🔥🔥 MIDDLEWARE RUNNING for:", pathname);

  // Get session menggunakan auth function
  const session = await auth();

  // console.log("🔥 Session:", session ? "Authenticated" : "Unauthenticated");
  if (session?.user) {
    // console.log("🔥 User Role:", session.user.role);
    // console.log("🔥 Full Session:", JSON.stringify(session.user, null, 2));
  }

  // --- 1. Handle unauthenticated users ---
  if (
    !session &&
    !pathname.startsWith("/sign-in") &&
    !pathname.startsWith("/sign-up") &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/_next/")
  ) {
    // console.log("🔥 REDIRECT: Unauthenticated user to /sign-in");
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // --- 2. Prevent authenticated users from accessing auth pages ---
  if (
    session &&
    (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up"))
  ) {
    // console.log("🔥 REDIRECT: Authenticated user to dashboard");
    // Role-based redirect after login
    const userRole = session.user.role;
    if (userRole === "SALES") {
      return NextResponse.redirect(new URL("/sales", request.url));
    } else {
      return NextResponse.redirect(new URL("/management/category", request.url));
    }
  }

  // --- 3. Block SALES users from accessing main dashboard ---
  if (session && pathname === "/" && session.user.role === "SALES") {
    return NextResponse.redirect(new URL("/sales", request.url));
  }

  // --- 4. Role-Based Access Control ---
  const protectedPrefixes = [
    "/management",
    "/sales",
    "/inventory",
    "/purchasing",
    "/finance",
    "/hr",
    "/settings",
  ];

  const isProtectedPath = protectedPrefixes.some(prefix =>
    pathname.startsWith(prefix)
  );

  if (session && isProtectedPath) {
    const userRole = session.user.role;
    // console.log(`🔥 RBAC CHECK: ${userRole} accessing ${pathname}`);

    // EXPLICIT BLOCKING untuk /management jika bukan OWNER atau ADMIN
    if (
      pathname.startsWith("/management") &&
      !["OWNER", "ADMIN"].includes(userRole)
    ) {
      // console.log(
      //   `🚫 BLOCKED: ${userRole} tried to access management module: ${pathname}`
      // );
      // Redirect SALES to their dashboard, others to main dashboard
      if (userRole === "SALES") {
        return NextResponse.redirect(new URL("/sales", request.url));
      }
      return NextResponse.redirect(new URL("/", request.url));
    }

    // EXPLICIT BLOCKING untuk /settings jika bukan OWNER atau ADMIN
    if (
      pathname.startsWith("/settings") &&
      !["OWNER", "ADMIN"].includes(userRole)
    ) {
      // console.log(
      //   `🚫 BLOCKED: ${userRole} tried to access settings module: ${pathname}`
      // );
      // Redirect SALES to their dashboard, others to main dashboard
      if (userRole === "SALES") {
        return NextResponse.redirect(new URL("/sales", request.url));
      }
      return NextResponse.redirect(new URL("/", request.url));
    }

    // EXPLICIT BLOCKING untuk /inventory jika bukan OWNER, ADMIN, atau WAREHOUSE
    if (
      pathname.startsWith("/inventory") &&
      !["OWNER", "ADMIN", "WAREHOUSE"].includes(userRole)
    ) {
      // console.log(
      //   `🚫 BLOCKED: ${userRole} tried to access inventory module: ${pathname}`
      // );
      // Redirect SALES to their dashboard, others to main dashboard
      if (userRole === "SALES") {
        return NextResponse.redirect(new URL("/sales", request.url));
      }
      return NextResponse.redirect(new URL("/", request.url));
    }

    // console.log(`✅ ALLOWED: ${userRole} can access ${pathname}`);
  }

  return NextResponse.next();
}

export const config = {
  // Matcher untuk semua URL yang perlu dilindungi
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
