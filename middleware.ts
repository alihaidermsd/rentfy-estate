import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Removed redirect logic for "/"
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Development mode: allow all requests (no middleware restrictions)
        // This temporarily disables all RBAC, auth guards, and API protections so the app can be developed quickly.
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/",                 // handle homepage
    "/api/:path*",       // protect selected API routes
    "/dashboard/:path*", // protected area
    "/booking/:path*",   // protected area
  ],
};