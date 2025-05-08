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

    // Obtener las categorías del restaurante
    const { data, error } = await supabase
      .from("menu_categories") // Changed from "categories" to "menu_categories"
      .select("*, menu_items (*)")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching categories:", error)
      return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in categories API:", error)
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

    // Crear la categoría
    const { data, error } = await supabase
      .from("menu_categories") // Changed from "categories" to "menu_categories"
      .insert({
        restaurant_id: restaurantId,
        branch_id: body.branch_id,
        name: body.name,
        description: body.description || null,
        menu_id: body.menu_id || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating category:", error)
      return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in create category API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
