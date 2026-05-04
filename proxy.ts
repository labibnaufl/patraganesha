import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// In-memory rate limiter for auth routes
// Limits: 10 requests per IP per 60 seconds on /api/auth/... and login page
// ---------------------------------------------------------------------------
const rateLimit = new Map<string, { count: number; reset: number }>();

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.reset) {
    rateLimit.set(ip, { count: 1, reset: now + RATE_LIMIT_WINDOW_MS });
    return true; // allowed
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false; // blocked
  }

  entry.count++;
  return true; // allowed
}

// Periodically prune stale entries to avoid memory leak
// (runs at most once per request, ~1% of the time to keep overhead minimal)
function maybePruneRateLimit() {
  if (Math.random() > 0.01) return;
  const now = Date.now();
  rateLimit.forEach((value, key) => {
    if (now > value.reset) rateLimit.delete(key);
  });
}

// ---------------------------------------------------------------------------
// NextAuth edge middleware for route protection
// ---------------------------------------------------------------------------
const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const pathname = req.nextUrl.pathname;
  const session = (req as unknown as { auth?: { user?: { role?: string } } }).auth;

  // Apply rate limiting only to auth-related endpoints
  const isAuthEndpoint =
    pathname.startsWith("/api/auth") || pathname === "/login";

  if (isAuthEndpoint) {
    maybePruneRateLimit();

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    if (!checkRateLimit(ip)) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests. Please wait a minute and try again.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        },
      );
    }
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
    if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }

  // Protect dashboard
  if (pathname.startsWith("/dashboard")) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  // Match all routes except Next.js internals and static assets
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
