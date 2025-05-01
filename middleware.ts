import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const authSession = req.cookies.get("auth_session")?.value;
  let isAuthenticated = false;

  if (authSession) {
    try {
      const sessionData = JSON.parse(authSession);
      if (sessionData && sessionData.userId && sessionData.expiresAt) {
        isAuthenticated = new Date(sessionData.expiresAt) > new Date();
        if (!isAuthenticated) {
          res.cookies.delete("auth_session");
        }
      }
    } catch {
      res.cookies.delete("auth_session");
    }
  }

  isAuthenticated = isAuthenticated || !!session;

  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (req.nextUrl.pathname === "/login" && isAuthenticated) {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/"],
};
