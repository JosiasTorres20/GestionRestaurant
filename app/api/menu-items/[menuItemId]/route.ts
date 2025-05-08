import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-route-handler"
import { cookies } from "next/headers"

export async function GET(request: Request, { params }: { params: Promise<{ menuItemId: string }> }) {
  try {
    // En Next.js 15, params es una promesa que debe ser esperada
    const { menuItemId } = await params

    if (!menuItemId) {
      return NextResponse.json({ error: "Menu Item ID is required" }, { status: 400 })
    }

    // Usar el cliente centralizado
    const supabase = await createRouteHandlerSupabaseClient()

    // Verificar autenticación
    const cookieStore = cookies()
    const authCookie = (await cookieStore).get("auth_session")

    if (!authCookie) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Obtener el item
    const { data, error } = await supabase.from("menu_items").select("*").eq("id", menuItemId).single()

    if (error) {
      console.error("Error fetching menu item:", error)
      return NextResponse.json({ error: "Failed to fetch menu item" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in menu item API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ menuItemId: string }> }) {
  try {
    // En Next.js 15, params es una promesa que debe ser esperada
    const { menuItemId } = await params

    if (!menuItemId) {
      return NextResponse.json({ error: "Menu Item ID is required" }, { status: 400 })
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

    // Actualizar el item
    const { data, error } = await supabase
      .from("menu_items")
      .update({
        name: body.name,
        description: body.description || null,
        price: body.price,
        image_url: body.image_url || null,
        is_available: body.is_available !== undefined ? body.is_available : true,
        submenu_id: body.submenu_id || null,
        category_id: body.category_id || undefined,
      })
      .eq("id", menuItemId)
      .select()
      .single()

    if (error) {
      console.error("Error updating menu item:", error)
      return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in update menu item API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ menuItemId: string }> }) {
  try {
    // En Next.js 15, params es una promesa que debe ser esperada
    const { menuItemId } = await params

    if (!menuItemId) {
      return NextResponse.json({ error: "Menu Item ID is required" }, { status: 400 })
    }

    // Usar el cliente centralizado
    const supabase = await createRouteHandlerSupabaseClient()

    // Verificar autenticación
    const cookieStore = cookies()
    const authCookie = (await cookieStore).get("auth_session")

    if (!authCookie) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Eliminar el item
    const { error } = await supabase.from("menu_items").delete().eq("id", menuItemId)

    if (error) {
      console.error("Error deleting menu item:", error)
      return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in delete menu item API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
