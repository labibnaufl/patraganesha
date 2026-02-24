import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config (no Prisma/bcrypt imports).
 * Used by middleware.ts for route protection.
 *
 * IMPORTANT: The jwt/session callbacks MUST be here (not just in lib/auth.ts)
 * so the edge middleware can read custom fields like `role` from the token.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [], // Providers configured in lib/auth.ts (not edge-compatible)
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.status = user.status;
        token.nim = user.nim;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.status = token.status;
        session.user.nim = token.nim;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Public routes — always accessible (guests + users)
      const publicRoutes = ["/login", "/register", "/verify-email", "/"];
      const isPublicRoute =
        publicRoutes.includes(pathname) ||
        pathname.startsWith("/articles") ||
        pathname.startsWith("/events") ||
        pathname.startsWith("/academic") ||
        pathname.startsWith("/profile");
      const isAuthApi = pathname.startsWith("/api/auth");

      if (isPublicRoute || isAuthApi) {
        // Redirect logged-in users away from auth pages
        if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
          return Response.redirect(new URL("/", nextUrl));
        }

        // Auto-redirect Admins checking out the landing page ("/") straight back to their dashboard ("/admin")
        if (isLoggedIn && pathname === "/") {
          const role = auth?.user?.role;
          if (role === "SUPER_ADMIN" || role === "ADMIN") {
            return Response.redirect(new URL("/admin", nextUrl));
          }
        }

        return true;
      }

      // Admin routes — require SUPER_ADMIN or ADMIN role
      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) return false;
        const role = auth?.user?.role;
        if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      // All other routes — require authentication
      return isLoggedIn;
    },
  },
};
