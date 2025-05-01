import { createServerActionClient } from "@/lib/server"
import type { OrderStatus } from "@/types"

export type OrderItem = {
  id: string
  order_id: string
  menu_item_id: string
  quantity: number
  price: number
  notes: string | null
  created_at: string
  menu_item?: {
    name: string
  }
}

export type Order = {
  id: string
  restaurant_id: string
  customer_name: string
  customer_phone: string
  status: OrderStatus
  total: number
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export async function getOrdersByRestaurantId(restaurantId: string): Promise<Order[]> {
  const supabase = createServerActionClient()

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      items:order_items(
        *,
        menu_item:menu_items(name)
      )
    `)
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
    return []
  }

  return data as Order[]
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
  const supabase = createServerActionClient()

  const { data, error } = await supabase.from("orders").update({ status }).eq("id", orderId).select().single()

  if (error) {
    console.error("Error updating order status:", error)
    return null
  }

  return data as Order
}
