import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

export async function GET(request: Request, { params }: { params: Promise<{ restaurantId: string }> }) {
  try {
    // En Next.js 15, params es una promesa que debe ser esperada
    const { restaurantId } = await params

    if (!restaurantId) {
      return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 })
    }

    // Crear un cliente Supabase anónimo para acceso público
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    // Obtener los menús activos del restaurante
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
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching public menus:", error)
      return NextResponse.json({ error: "Failed to fetch menus" }, { status: 500 })
    }

    // Define types for category and menu_item
    type MenuItem = {
      is_available: boolean
      [key: string]: unknown
    }

    type Category = {
      menu_items?: MenuItem[]
      [key: string]: unknown
    }

    // Filtrar solo los items disponibles para el menú público
    const filteredData = data.map((menu) => ({
      ...menu,
      categories:
        menu.categories?.map((category: Category) => ({
          ...category,
          items: category.menu_items?.filter((item: MenuItem) => item.is_available) || [],
        })) || [],
    }))

    return NextResponse.json(filteredData)
  } catch (error) {
    console.error("Error in public menus API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
