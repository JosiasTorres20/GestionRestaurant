import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-route-handler"
import { cookies } from "next/headers"

export async function GET(request: Request, { params }: { params: Promise<{ categoryId: string }> }) {
  try {
    // En Next.js 15, params es una promesa que debe ser esperada
    const { categoryId } = await params

    if (!categoryId) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 })
    }

    // Usar el cliente centralizado
    const supabase = await createRouteHandlerSupabaseClient()

    // Verificar autenticación
    const cookieStore = cookies()
    const authCookie = (await cookieStore).get("auth_session")

    if (!authCookie) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Obtener los items de la categoría
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching menu items:", error)
      return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in menu items API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ categoryId: string }> }) {
  try {
    // En Next.js 15, params es una promesa que debe ser esperada
    const { categoryId } = await params

    if (!categoryId) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 })
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
    if (!body.name || body.price === undefined) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 })
    }

    // Crear el item
    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        category_id: categoryId,
        name: body.name,
        description: body.description || null,
        price: body.price,
        image_url: body.image_url || null,
        is_available: body.is_available !== undefined ? body.is_available : true,
        submenu_id: body.submenu_id || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating menu item:", error)
      return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in create menu item API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
