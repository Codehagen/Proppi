import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Next.js Proxy (formerly Middleware).
 *
 * Important: keep this as an *optimistic* check only.
 * We only check for presence of Better Auth session cookie and redirect if absent.
 */
export function proxy(request: NextRequest) {
  // Optimistic cookie-only check (NOT full validation).
  // This is the recommended approach for Next.js Proxy to avoid blocking requests.
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    // Keep it simple; the sign-in page can decide whether to use this param.
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
