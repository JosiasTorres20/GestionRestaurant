import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-route-handler"

export async function GET() {
  try {
    const cookieStore = cookies()
    const allCookies = (await cookieStore).getAll()
    const authCookie = (await cookieStore).get("auth_session")

    // Create Supabase client
    const supabase = await createRouteHandlerSupabaseClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    // Try to parse the auth cookie
    let parsedAuthCookie = null
    if (authCookie) {
      try {
        parsedAuthCookie = JSON.parse(authCookie.value)
      } catch (error) {
        console.error("Error parsing auth cookie:", error)
      }
    }

    return NextResponse.json({
      cookies: {
        all: allCookies.map((c: { name: string; value: string }) => `${c.name}: ${c.value.substring(0, 20)}...`),
        authCookieExists: !!authCookie,
        authCookieValue: parsedAuthCookie
          ? {
              userId: parsedAuthCookie.userId,
              tokenPreview: parsedAuthCookie.token ? parsedAuthCookie.token.substring(0, 10) + "..." : null,
              expiresAt: parsedAuthCookie.expiresAt,
            }
          : null,
      },
      auth: {
        success: !authError,
        error: authError ? authError.message : null,
        user: authData?.user
          ? {
              id: authData.user.id,
              email: authData.user.email,
            }
          : null,
      },
    })
  } catch (error) {
    console.error("Error in debug API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
