import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-route-handler"
import { cookies } from "next/headers"

export async function GET(request: Request, { params }: { params: Promise<{ menuId: string }> }) {
  try {
    // En Next.js 15, params es una promesa que debe ser esperada
    const { menuId } = await params

    if (!menuId) {
      return NextResponse.json({ error: "Menu ID is required" }, { status: 400 })
    }

    // Usar el cliente centralizado
    const supabase = await createRouteHandlerSupabaseClient()

    // Verificar autenticación
    const cookieStore = cookies()
    const authCookie = (await cookieStore).get("auth_session")

    if (!authCookie) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Obtener el menú con sus categorías e items
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
      .eq("id", menuId)
      .single()

    if (error) {
      console.error("Error fetching menu:", error)
      return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in menu API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ menuId: string }> }) {
  try {
    // En Next.js 15, params es una promesa que debe ser esperada
    const { menuId } = await params

    if (!menuId) {
      return NextResponse.json({ error: "Menu ID is required" }, { status: 400 })
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
    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Actualizar el menú
    const { data, error } = await supabase
      .from("menus")
      .update({
        name: body.name,
        description: body.description || null,
        is_active: body.is_active !== undefined ? body.is_active : true,
        branch_id: body.branch_id || undefined,
      })
      .eq("id", menuId)
      .select()
      .single()

    if (error) {
      console.error("Error updating menu:", error)
      return NextResponse.json({ error: "Failed to update menu" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in update menu API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ menuId: string }> }) {
  try {
    // En Next.js 15, params es una promesa que debe ser esperada
    const { menuId } = await params

    if (!menuId) {
      return NextResponse.json({ error: "Menu ID is required" }, { status: 400 })
    }

    // Usar el cliente centralizado
    const supabase = await createRouteHandlerSupabaseClient()

    // Verificar autenticación
    const cookieStore = cookies()
    const authCookie = (await cookieStore).get("auth_session")

    if (!authCookie) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Eliminar el menú
    const { error } = await supabase.from("menus").delete().eq("id", menuId)

    if (error) {
      console.error("Error deleting menu:", error)
      return NextResponse.json({ error: "Failed to delete menu" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in delete menu API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
