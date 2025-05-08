import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient, createServiceRoleClient } from "@/lib/supabase-route-handler"
import { cookies } from "next/headers"

export async function GET(request: Request, { params }: { params: Promise<{ restaurantId: string }> }) {
  try {
    const { restaurantId } = await params

    if (!restaurantId) {
      return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 })
    }

    const cookieStore = cookies()
    const allCookies = (await cookieStore).getAll()
    console.log(
      "All cookies in branches API route:",
      allCookies.map((c) => `${c.name}: ${c.value.substring(0, 20)}...`),
    )

    const authCookie = (await cookieStore).get("auth_session")
    console.log("Auth cookie exists in branches API:", !!authCookie)

    if (authCookie) {
      try {
        const sessionData = JSON.parse(authCookie.value)
        console.log("Auth cookie parsed successfully, userId:", sessionData.userId)
      } catch (error) {
        console.error("Failed to parse auth cookie:", error)
      }
    }

    const supabase = await createRouteHandlerSupabaseClient()

    try {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("is_main", { ascending: false })
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching branches:", error)
        throw error
      }

      return NextResponse.json(data)
    } catch (directError) {
      console.error("Direct approach failed:", directError)

      const adminSupabase = createServiceRoleClient()
      let userId = null
      if (authCookie) {
        try {
          const sessionData = JSON.parse(authCookie.value)
          userId = sessionData.userId
        } catch (error) {
          console.error("Failed to parse auth cookie:", error)
        }
      }

      if (!userId) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }

      console.log("Fallback: Using service role with user ID:", userId)

      const { data: userData, error: userError } = await adminSupabase
        .from("users")
        .select("id")
        .eq("id", userId)
        .single()

      if (userError || !userData) {
        console.error("User verification failed:", userError)
        return NextResponse.json({ error: "User not found" }, { status: 401 })
      }

      const { data, error } = await adminSupabase
        .from("branches")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("is_main", { ascending: false })
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching branches with service role:", error)
        return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 })
      }

      return NextResponse.json(data)
    }
  } catch (error) {
    console.error("Error in branches API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ restaurantId: string }> }) {
  try {
    const { restaurantId } = await params

    if (!restaurantId) {
      return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 })
    }

    const supabase = await createRouteHandlerSupabaseClient()
    const cookieStore = cookies()
    const authCookie = (await cookieStore).get("auth_session")

    if (!authCookie) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()

    if (!body.name || !body.address) {
      return NextResponse.json({ error: "Name and address are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("branches")
      .insert({
        restaurant_id: restaurantId,
        name: body.name,
        address: body.address,
        phone: body.phone || null,
        email: body.email || null,
        is_active: body.is_active !== undefined ? body.is_active : true,
        is_main: body.is_main || false,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating branch:", error)
      return NextResponse.json({ error: "Failed to create branch" }, { status: 500 })
    }

    if (body.is_main) {
      await supabase.from("branches").update({ is_main: false }).eq("restaurant_id", restaurantId).neq("id", data.id)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in create branch API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
