import { useEffect, useState } from "react"
import { Order, OrderStatus } from "@/types"
import { getOrders, updateOrderStatus as updateOrderStatusAction } from "@/app/dashboard/orders/actions"

export function useOrders(restaurantId: string) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      if (!restaurantId) return
      
      try {
        setIsLoading(true)
        // Make sure restaurantId is a valid URL path segment
        const sanitizedRestaurantId = encodeURIComponent(restaurantId)
        const orders = await getOrders(sanitizedRestaurantId)
        setOrders(orders)
        setError(null)
      } catch (err) {
        console.error("Error fetching orders:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch orders")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
    
    // Set up a polling interval to refresh orders
    const intervalId = setInterval(fetchOrders, 30000) // Poll every 30 seconds
    
    return () => clearInterval(intervalId)
  }, [restaurantId])

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const result = await updateOrderStatusAction(orderId, newStatus)
      
      if (result.success) {
        // Update local state optimistically
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        )
      } else {
        console.error("Failed to update order status:", result.error)
      }
      
      return result
    } catch (error) {
      console.error("Error updating order status:", error)
      throw error
    }
  }

  // Helper functions
  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case OrderStatus.PENDING:
        return OrderStatus.CONFIRMED
      case OrderStatus.CONFIRMED:
        return OrderStatus.PREPARING
      case OrderStatus.PREPARING:
        return OrderStatus.READY
      case OrderStatus.READY:
        return OrderStatus.DELIVERED
      default:
        return null
    }
  }

  const activeOrders = orders.filter(
    order => ![OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(order.status)
  )

  const completedOrders = orders.filter(
    order => [OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(order.status)
  )

  return {
    orders,
    activeOrders,
    completedOrders,
    isLoading,
    error,
    updateOrderStatus,
    getNextStatus
  }
}