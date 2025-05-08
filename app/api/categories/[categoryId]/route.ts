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

    // Obtener la categoría con sus items
    const { data, error } = await supabase.from("menu_categories").select("*, menu_items (*)").eq("id", categoryId).single() // Changed from "categories" to "menu_categories"

    if (error) {
      console.error("Error fetching category:", error)
      return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in category API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ categoryId: string }> }) {
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
    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Actualizar la categoría
    const { data, error } = await supabase
      .from("menu_categories") // Changed from "categories" to "menu_categories"
      .update({
        name: body.name,
        description: body.description || null,
        menu_id: body.menu_id || null,
      })
      .eq("id", categoryId)
      .select()
      .single()

    if (error) {
      console.error("Error updating category:", error)
      return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in update category API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ categoryId: string }> }) {
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

    // Eliminar la categoría
    const { error } = await supabase.from("menu_categories").delete().eq("id", categoryId) // Changed from "categories" to "menu_categories"

    if (error) {
      console.error("Error deleting category:", error)
      return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in delete category API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
