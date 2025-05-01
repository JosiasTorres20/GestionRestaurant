"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Clock, ShoppingBag } from "lucide-react"
import { OrderStatus } from "@/types"
import { useOrders } from "@/hooks/orders/orders-hooks"
import { useEffect, useState } from "react"
import { createClientSupabaseClient } from "@/lib/supabase"

export default function OrdersPage() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [isLoading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchRestaurantId = async () => {
      const supabase = createClientSupabaseClient()
      
      try {
        // Opción 1: Obtener el ID del usuario autenticado
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Asume que tienes una tabla que relaciona usuarios con restaurantes
          const { data } = await supabase
            .from("user_restaurants")
            .select("restaurant_id")
            .eq("user_id", user.id)
            .single()
          
          if (data) {
            setRestaurantId(data.restaurant_id)
          }
        }
        
        // Opción 2: Obtener de localStorage si es necesario
        const storedId = localStorage.getItem("restaurantId")
        if (storedId) {
          setRestaurantId(storedId)
        }
      } catch (error) {
        console.error("Error fetching restaurant ID:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchRestaurantId()
  }, [])

  const { 
    activeOrders, 
    completedOrders, 
    error,
    updateOrderStatus, 
    getNextStatus
  } = useOrders(restaurantId || "") // Pasa cadena vacía si es null
  const getStatusBadgeColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "bg-blue-100 text-blue-800"
      case OrderStatus.CONFIRMED:
        return "bg-purple-100 text-purple-800"
      case OrderStatus.PREPARING:
        return "bg-yellow-100 text-yellow-800"
      case OrderStatus.READY:
        return "bg-green-100 text-green-800"
      case OrderStatus.DELIVERED:
        return "bg-gray-100 text-gray-800"
      case OrderStatus.CANCELLED:
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      day: "numeric",
      month: "short",
    }).format(date)
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} min ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  }

  // Display any error messages
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
          <p className="text-muted-foreground">View and manage customer orders</p>
        </div>
        
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please check your API configuration and make sure your backend is running.
            </p>
            <Button 
              className="mt-4" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
        <p className="text-muted-foreground">View and manage customer orders</p>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Orders ({activeOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed Orders ({completedOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-6 w-24 rounded-md bg-muted"></div>
                    <div className="h-4 w-32 rounded-md bg-muted"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 w-full rounded-md bg-muted"></div>
                      <div className="h-4 w-3/4 rounded-md bg-muted"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium">No active orders</p>
                <p className="text-sm text-muted-foreground">When customers place orders, they will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {order.id}
                          <Badge className={getStatusBadgeColor(order.status)}>{order.status}</Badge>
                        </CardTitle>
                        <CardDescription>
                          {order.customer_name} • {order.customer_phone} 
                        </CardDescription>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {getTimeAgo(order.created_at)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Items:</div>
                      <ul className="space-y-1 text-sm">
                        {order.items.map((item, index) => (
                          <li key={index} className="flex justify-between">
                            <span>
                              {item.quantity}x {item.id}
                            </span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex justify-between border-t pt-2 font-medium">
                        <span>Total:</span>
                        <span>${order.total.toFixed(2)}</span>
                      </div>
                      <div className="pt-2">
                        {getNextStatus(order.status) && (
                          <Button
                            className="w-full"
                            onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                          >
                            Mark as {getNextStatus(order.status)}
                          </Button>
                        )}
                        {order.status !== OrderStatus.CANCELLED && (
                          <Button
                            variant="outline"
                            className="mt-2 w-full text-destructive hover:bg-destructive/10"
                            onClick={() => updateOrderStatus(order.id, OrderStatus.CANCELLED)}
                          >
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-6 w-24 rounded-md bg-muted"></div>
                    <div className="h-4 w-32 rounded-md bg-muted"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 w-full rounded-md bg-muted"></div>
                      <div className="h-4 w-3/4 rounded-md bg-muted"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : completedOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium">No completed orders</p>
                <p className="text-sm text-muted-foreground">Completed orders will be shown here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {order.id}
                          <Badge className={getStatusBadgeColor(order.status)}>{order.status}</Badge>
                        </CardTitle>
                        <CardDescription>
                          {order.customer_name} • {order.customer_phone}
                        </CardDescription>
                      </div>
                      <div className="text-xs text-muted-foreground">{formatDate(order.created_at)}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Items:</div>
                      <ul className="space-y-1 text-sm">
                        {order.items.map((item, index) => (
                          <li key={index} className="flex justify-between">
                            <span>
                              {item.quantity}x {item.id}
                            </span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex justify-between border-t pt-2 font-medium">
                        <span>Total:</span>
                        <span>${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}