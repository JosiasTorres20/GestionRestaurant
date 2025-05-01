import { createClientSupabaseClient } from "@/lib/supabase"
import type { Order, OrderStatus, OrderItem } from "@/types"

export async function getOrders(restaurantId: string): Promise<Order[]> {
  try {
    const supabase = createClientSupabaseClient()
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return data as Order[]
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw error
  }
}

export async function updateOrderStatus(
  orderId: string, 
  status: OrderStatus
): Promise<{ success: boolean, data?: Order, error?: string }> {
  try {
    const supabase = createClientSupabaseClient()
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select()
      .single()

    if (error) throw error

    return { success: true, data: data as Order }
  } catch (error) {
    console.error("Error updating order status:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

export async function getOrderDetails(
  orderId: string
): Promise<{ success: boolean, data?: Order, error?: string }> {
  try {
    const supabase = createClientSupabaseClient()
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single()

    if (error) throw error

    return { success: true, data: data as Order }
  } catch (error) {
    console.error("Error fetching order details:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

export async function createOrder(orderData: {
  restaurantId: string,
  customerName: string,
  customerPhone: string,
  total: number,
  items: OrderItem[]
}): Promise<{ success: boolean, data?: Order, error?: string }> {
  try {
    const supabase = createClientSupabaseClient()
    const { data, error } = await supabase
      .from("orders")
      .insert({
        restaurant_id: orderData.restaurantId,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        total: orderData.total,
        items: orderData.items,
        status: "pending" // Estado inicial
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, data: data as Order }
  } catch (error) {
    console.error("Error creating order:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

export async function deleteOrder(
  orderId: string
): Promise<{ success: boolean, error?: string }> {
  try {
    const supabase = createClientSupabaseClient()
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error deleting order:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}