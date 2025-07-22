// middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth(req => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Logging untuk debugging (bisa dihapus nanti)
  console.log("Middleware hit for:", pathname);
  console.log("Session:", session ? "Authenticated" : "Unauthenticated");
  if (session?.user) {
    console.log("User Role:", session.user.role);
  }

  // --- 1. Handle unauthenticated users ---
  // Jika tidak ada sesi DAN pathname BUKAN halaman sign-in, redirect ke sign-in
  // Pastikan '/sign-in' tidak ada dalam matcher jika auth() tidak otomatis mengecualikannya
  if (!session && pathname !== "/sign-in") {
    console.log("Unauthenticated user, redirecting to /sign-in");
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // --- 2. Handle specific redirects (e.g., '/' to a default dashboard) ---
  // Ini adalah redirect untuk URL root ("/")
  // Perhatikan: ini adalah redirect sisi server. Redirect sisi client di SideBar
  // akan menangani kasus ketika user sudah di client dan navigasi ke "/".
  // Server side redirect lebih baik untuk first load.
  if (session && pathname === "/") {
    // Anda bisa memilih halaman default berdasarkan role, misalnya:
    // if (session.user.role === "SALES") {
    //   return NextResponse.redirect(new URL("/sales", req.url));
    // }
    // return NextResponse.redirect(new URL("/management/category", req.url)); // Contoh default
    // Karena Anda punya "/dashboard" di menuItems yang href-nya "/",
    // kita harus memilih kemana redirect default yang benar.
    // Jika Anda tidak ingin ada "/dashboard" di URL sama sekali, maka sesuaikan menuItems juga.
    console.log("Root path hit, redirecting to /management/category");
    return NextResponse.redirect(new URL("/management/category", req.url)); // Ganti ini ke halaman default aplikasi Anda
  }

  // --- 3. Role-Based Access Control (RBAC) ---
  // Pastikan semua path yang ingin dilindungi ada di 'matcher' di bawah
  const protectedPrefixes = [
    "/management",
    "/sales",
    "/inventory",
    "/purchasing",
    "/finance",
    "/hr",
    "/settings",
  ]; // Tambahkan semua prefix modul utama Anda

  const isProtectedPath = protectedPrefixes.some(prefix =>
    pathname.startsWith(prefix)
  );

  if (session && isProtectedPath) {
    // Hanya jalankan RBAC jika user terautentikasi dan path terlindungi
    const rolePermissions = {
      OWNER: [
        "/management/category",
        "/management/me",
        "/sales", // Tambahkan rute induk jika merupakan halaman
        "/sales/fields",
        "/sales/field-visits",
        "/sales/orders",
        "/sales/order-history",
        "/sales/invoice",
        "/inventory/dashboard",
        "/inventory/items",
        "/inventory/stock",
        "/inventory/stocktaking",
        "/purchasing/orders",
        "/purchasing/payments",
        "/finance/revenue",
        "/finance/expenses",
        "/hr/attendance",
        "/settings/users",
        "/settings/roles",
        "/settings/permissions",
        // ... tambahkan semua path yang diizinkan untuk OWNER
      ],
      ADMIN: [
        "/management/category",
        "/management/me",
        // ... pastikan semua rute admin yang sesuai ada di sini
        // Sesuaikan dengan menuItems Anda
      ],
      SALES: [
        "/sales",
        "/sales/fields",
        "/sales/field-visits",
        "/sales/orders",
        "/sales/order-history",
        // ...
      ],
      WAREHOUSE: [
        "/inventory/dashboard",
        "/inventory/items",
        "/inventory/stock",
        "/inventory/stocktaking",
        // ...
      ],
      // ... dan role lainnya
    };

    const userRole = session.user.role; // Sekarang aman, tidak perlu 'as any'
    const allowedPaths = rolePermissions[userRole] || [];

    // Jika path saat ini tidak diizinkan untuk role user
    if (!allowedPaths.includes(pathname)) {
      console.log(
        `User role ${userRole} not allowed on ${pathname}, redirecting.`
      );
      // Redirect ke halaman default untuk role tersebut
      const firstAllowedPath = allowedPaths[0] || "/sign-in"; // Fallback ke sign-in jika tidak ada path yang diizinkan
      return NextResponse.redirect(new URL(firstAllowedPath, req.url));
    }
  }

  // Lanjutkan jika tidak ada redirect yang diperlukan
  return NextResponse.next();
});

export const config = {
  // Matche semua URL yang Anda ingin lindungi
  matcher: [
    "/management/:path*",
    "/sales/:path*",
    "/inventory/:path*",
    "/purchasing/:path*",
    "/finance/:path*",
    "/hr/:path*",
    "/settings/:path*",
    // Tambahkan root path jika Anda ingin middleware menangani redirect awal dari "/"
    // tetapi pastikan logika di dalam middleware tidak menimbulkan loop
    "/", // Match root path untuk redirect awal
    // Exclude /sign-in to prevent infinite redirect if auth() doesn't handle it.
    // Make sure this is explicit if necessary.
  ],
};
