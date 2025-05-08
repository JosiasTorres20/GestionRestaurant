import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-route-handler"
import { cookies } from "next/headers"

export async function PATCH(request: Request, { params }: { params: Promise<{ restaurantId: string }> }) {
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

    if (!body.branch_id) {
      return NextResponse.json({ error: "Branch ID is required" }, { status: 400 })
    }

    // Primero, establecer todas las sucursales como no principales
    const { error: updateError } = await supabase
      .from("branches")
      .update({ is_main: false })
      .eq("restaurant_id", restaurantId)

    if (updateError) {
      console.error("Error updating branches:", updateError)
      return NextResponse.json({ error: "Failed to update branches" }, { status: 500 })
    }

    // Luego, establecer la sucursal seleccionada como principal
    const { data, error } = await supabase
      .from("branches")
      .update({ is_main: true })
      .eq("id", body.branch_id)
      .eq("restaurant_id", restaurantId)
      .select()
      .single()

    if (error) {
      console.error("Error setting main branch:", error)
      return NextResponse.json({ error: "Failed to set main branch" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in set main branch API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
