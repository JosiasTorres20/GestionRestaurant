import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-route-handler"
import { cookies } from "next/headers"

export async function GET(request: Request, { params }: { params: Promise<{ restaurantId: string }> }) {
  try {
    // En Next.js 15, params es una promesa que debe ser esperada
    const { restaurantId } = await params

    if (!restaurantId) {
      return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 })
    }

    // Usar el cliente centralizado
    const supabase = await createRouteHandlerSupabaseClient()

    // Verificar autenticación
    const cookieStore = cookies()
    const authCookie = (await cookieStore).get("auth_session")

    if (!authCookie) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Obtener los menús del restaurante
    const { data, error } = await supabase
      .from("menus")
      .select(`
        *,
        branches (name, is_main),
        categories (
          *,
          menu_items (*)
        )
      `)
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching menus:", error)
      return NextResponse.json({ error: "Failed to fetch menus" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in menus API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ restaurantId: string }> }) {
  try {
    // En Next.js 15, params es una promesa que debe ser esperada
    const { restaurantId } = await params

    if (!restaurantId) {
      return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 })
    }

    // Usar el cliente centralizado
    const supabase = await createRouteHandlerSupabaseClient()

    // Verificar autenticación
    const cookieStore = cookies()
    const authCookie = (await cookieStore).get("auth_session")

    if (!authCookie) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()

    // Validar datos requeridos
    if (!body.name || !body.branch_id) {
      return NextResponse.json({ error: "Name and branch_id are required" }, { status: 400 })
    }

    // Crear el menú
    const { data, error } = await supabase
      .from("menus")
      .insert({
        restaurant_id: restaurantId,
        branch_id: body.branch_id,
        name: body.name,
        description: body.description || null,
        is_active: body.is_active !== undefined ? body.is_active : true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating menu:", error)
      return NextResponse.json({ error: "Failed to create menu" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in create menu API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
