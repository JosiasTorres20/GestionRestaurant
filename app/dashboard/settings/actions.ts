import { createClientSupabaseClient } from "@/lib/supabase"
import type { Restaurant } from "@/lib/services/restaurant-service"

/**
 * Fetches restaurant data from Supabase
 * @param restaurantId The ID of the restaurant to fetch
 * @returns The restaurant data or null if there was an error
 */
export async function fetchRestaurantData(restaurantId: string): Promise<Restaurant | null> {
  try {
    const supabase = createClientSupabaseClient()
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", restaurantId)
      .single()

    if (error) {
      throw error
    }

    return data as Restaurant
  } catch (error) {
    console.error("Error al obtener datos del restaurante:", error)
    return null
  }
}

/**
 * Saves restaurant data to Supabase
 * @param restaurantId The ID of the restaurant to update
 * @param updates The fields to update
 * @returns True if the update was successful, false otherwise
 */
export async function saveRestaurantData(
  restaurantId: string,
  updates: Partial<Record<keyof Restaurant, string | boolean>>
): Promise<boolean> {
  try {
    const supabase = createClientSupabaseClient()
    const { error } = await supabase
      .from("restaurants")
      .update(updates)
      .eq("id", restaurantId)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error al guardar ajustes del restaurante:", error)
    return false
  }
}

/**
 * Identifies which fields have changed between two restaurant objects
 * @param current The current restaurant data
 * @param original The original restaurant data
 * @returns A Set of keys that have changed
 */
export function getChangedFields(
  current: Restaurant, 
  original: Restaurant
): Set<keyof Restaurant> {
  const changedFields = new Set<keyof Restaurant>()
  
  ;(Object.keys(current) as Array<keyof Restaurant>).forEach((key: keyof Restaurant) => {
    const currentValue = current[key]
    const originalValue = original[key]

    if (currentValue !== originalValue) {
      changedFields.add(key)
    }
  })

  return changedFields
}

/**
 * Creates a default restaurant object with empty/default values
 * @returns A default Restaurant object
 */
export function createDefaultRestaurant(): Restaurant {
  return {
    id: "",
    name: "",
    address: "",
    phone: "",
    whatsapp: "",
    logo_url: "/placeholder.svg?height=200&width=200",
    primary_color: "",
    secondary_color: "",
    is_active: true,
    created_at: "",
  }
}