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
        const { pathname } = req.nextUrl;
        console.log('Middleware authorized check:', { pathname, hasToken: !!token, userRole: token?.role });

        // 1️⃣ Allow all auth routes without a token
        if (pathname.startsWith("/api/auth")) return true;

        // 2️⃣ Allow public API routes
        if (
          pathname.startsWith("/api/properties") ||
          pathname.startsWith("/api/agents") ||
          pathname.startsWith("/api/developers") ||
          pathname.startsWith("/api/search")
        ) {
          return true;
        }

        // 3️⃣ Protect all other API routes
        if (pathname.startsWith("/api/")) {
          return !!token;
        }

        // 4️⃣ Protect dashboard & booking pages with RBAC
        if (pathname.startsWith("/dashboard")) {
          if (!token) return false; // Must be authenticated for any dashboard
          
          const userRole = token.role as string;
          let requiredRole: string | null = null;

          if (pathname.startsWith("/dashboard/admin")) {
            requiredRole = "ADMIN";
          } else if (pathname.startsWith("/dashboard/owner")) {
            requiredRole = "OWNER";
          } else if (pathname.startsWith("/dashboard/agent")) {
            requiredRole = "AGENT";
          } else if (pathname.startsWith("/dashboard/user")) {
            requiredRole = "USER";
          } else if (pathname === "/dashboard") {
            return true; 
          }

          if (requiredRole && userRole !== requiredRole) {
            console.warn(`Access denied: User role '${userRole}' cannot access '${pathname}' (requires '${requiredRole}')`);
            return false; // Role mismatch
          }
          return true; // Authorized
        }
        
        if (pathname.startsWith("/booking")) {
          return !!token; // Booking pages just require authentication
        }
        
        // 5️⃣ Allow access to the homepage for all users (authenticated or not)
        if (pathname === "/") {
            return true;
        }

        // Default: If none of the above, deny access (or redirect to login)
        return false;
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