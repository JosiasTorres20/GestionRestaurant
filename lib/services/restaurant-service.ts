import { createServerActionClient } from "@/lib/server"

export type Restaurant = {
  id: string
  name: string
  address: string | null
  phone: string | null
  whatsapp: string | null
  logo_url: string | null
  primary_color: string | null
  secondary_color: string | null
  is_active: boolean
  created_at: string
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  const supabase = createServerActionClient()

  const { data, error } = await supabase.from("restaurants").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching restaurant:", error)
    return null
  }

  return data as Restaurant
}

export async function getRestaurantByUserId(userId: string): Promise<Restaurant | null> {
  const supabase = createServerActionClient()

  // First get the user to find their restaurant_id
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("restaurant_id")
    .eq("id", userId)
    .single()

  if (userError || !userData?.restaurant_id) {
    console.error("Error fetching user restaurant id:", userError)
    return null
  }

  // Then get the restaurant
  const { data, error } = await supabase.from("restaurants").select("*").eq("id", userData.restaurant_id).single()

  if (error) {
    console.error("Error fetching restaurant:", error)
    return null
  }

  return data as Restaurant
}

export async function getAllRestaurants(): Promise<Restaurant[]> {
  const supabase = createServerActionClient()

  const { data, error } = await supabase.from("restaurants").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching restaurants:", error)
    return []
  }

  return data as Restaurant[]
}

export async function updateRestaurantSettings(id: string, settings: Partial<Restaurant>): Promise<Restaurant | null> {
  const supabase = createServerActionClient()

  const { data, error } = await supabase.from("restaurants").update(settings).eq("id", id).select().single()

  if (error) {
    console.error("Error updating restaurant settings:", error)
    return null
  }

  return data as Restaurant
}
