import { createClient } from "@/lib/supabase"
import type { Branch, BranchFormData } from "@/types"

// Obtener todas las sucursales de un restaurante
export async function getBranches(restaurantId: string): Promise<Branch[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("is_main", { ascending: false })
    .order("name", { ascending: true })

  if (error) {
    console.error("Error al obtener sucursales:", error)
    throw error
  }

  return data || []
}

// Obtener una sucursal específica
export async function getBranch(branchId: string): Promise<Branch> {
  const supabase = createClient()

  const { data, error } = await supabase.from("branches").select("*").eq("id", branchId).single()

  if (error) {
    console.error("Error al obtener sucursal:", error)
    throw error
  }

  return data
}

// Crear una nueva sucursal
export async function createBranch(restaurantId: string, branchData: BranchFormData): Promise<Branch> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("branches")
    .insert({
      ...branchData,
      restaurant_id: restaurantId,
    })
    .select()
    .single()

  if (error) {
    console.error("Error al crear sucursal:", error)
    throw error
  }

  return data
}

// Actualizar una sucursal existente
export async function updateBranch(branchId: string, branchData: Partial<BranchFormData>): Promise<Branch> {
  const supabase = createClient()

  const { data, error } = await supabase.from("branches").update(branchData).eq("id", branchId).select().single()

  if (error) {
    console.error("Error al actualizar sucursal:", error)
    throw error
  }

  return data
}

// Eliminar una sucursal
export async function deleteBranch(branchId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from("branches").delete().eq("id", branchId)

  if (error) {
    console.error("Error al eliminar sucursal:", error)
    throw error
  }
}

// Establecer una sucursal como principal
export async function setMainBranch(branchId: string, restaurantId: string): Promise<void> {
  const supabase = createClient()

  // Primero, quitamos el estado principal de todas las sucursales
  const { error: updateError } = await supabase
    .from("branches")
    .update({ is_main: false })
    .eq("restaurant_id", restaurantId)

  if (updateError) {
    console.error("Error al actualizar sucursales:", updateError)
    throw updateError
  }

  // Luego, establecemos la sucursal seleccionada como principal
  const { error } = await supabase.from("branches").update({ is_main: true }).eq("id", branchId)

  if (error) {
    console.error("Error al establecer sucursal principal:", error)
    throw error
  }
}
