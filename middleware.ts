import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Log all cookies for debugging
  console.log(
    "Cookies in middleware:",
    req.cookies.getAll().map((c) => `${c.name}: ${c.value.substring(0, 20)}...`),
  )

  // Check for auth_session cookie
  const authSessionCookie = req.cookies.get("auth_session")
  console.log("Auth session cookie exists:", !!authSessionCookie)

  let isAuthenticated = false

  if (authSessionCookie) {
    try {
      const sessionData = JSON.parse(authSessionCookie.value)
      // Check if session has userId and is not expired
      if (sessionData && sessionData.userId && sessionData.expiresAt) {
        const expiresAt = new Date(sessionData.expiresAt)
        isAuthenticated = expiresAt > new Date()
        console.log("Auth session valid:", isAuthenticated, "Expires:", expiresAt.toISOString())
      }
    } catch (error) {
      console.error("Error parsing auth_session cookie:", error)
    }
  }

  // Protected routes
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      console.log("Not authenticated, redirecting to login")
      const loginUrl = new URL("/login", req.url)
      return NextResponse.redirect(loginUrl)
    }
    console.log("Authenticated, allowing access to dashboard")
  }

  // Auth routes (redirect to dashboard if already authenticated)
  if ((req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/") && isAuthenticated) {
    console.log("Already authenticated, redirecting to dashboard")
    const dashboardUrl = new URL("/dashboard", req.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/"],
}
