import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Check if user is trying to access dashboard routes
  if (pathname.startsWith("/dashboard")) {
    // Redirect sales users from main dashboard to sales dashboard
    if (pathname === "/dashboard" && (session?.user as any)?.role === "SALES") {
      return NextResponse.redirect(new URL("/dashboard/sales", req.url));
    }

    // Define role-based access control
    const rolePermissions = {
      OWNER: [
        "/dashboard",
        "/dashboard/orders",
        "/dashboard/customers",
        "/dashboard/products",
        "/dashboard/stock",
        "/dashboard/delivery",
        "/dashboard/visits",
        "/dashboard/finance",
        "/dashboard/invoices",
        "/dashboard/reports",
        "/dashboard/settings",
      ],
      ADMIN: [
        "/dashboard",
        "/dashboard/orders",
        "/dashboard/customers",
        "/dashboard/products",
        "/dashboard/stock",
        "/dashboard/delivery",
        "/dashboard/visits",
        "/dashboard/finance",
        "/dashboard/invoices",
        "/dashboard/reports",
        "/dashboard/settings",
      ],
      SALES: [
        "/dashboard/sales",
        "/dashboard/orders",
        "/dashboard/customers",
        "/dashboard/delivery",
        "/dashboard/visits",
      ],
      WAREHOUSE: [
        "/dashboard",
        "/dashboard/orders",
        "/dashboard/products",
        "/dashboard/stock",
        "/dashboard/delivery",
      ],
    };

    const userRole = (session?.user as any)
      ?.role as keyof typeof rolePermissions;
    const allowedPaths = rolePermissions[userRole] || [];

    // Check if current path is allowed for user role
    if (!allowedPaths.includes(pathname)) {
      // Redirect to first allowed path for their role
      const firstAllowedPath = allowedPaths[0] || "/dashboard/sales";
      return NextResponse.redirect(new URL(firstAllowedPath, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
