import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ShoppingBag, Utensils, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import type { MenuCategory } from "@/lib/services/menu-service"
import type { Order } from "@/lib/services/order-service"

interface RestaurantAdminDashboardProps {
  isLoading: boolean
  stats: {
    totalOrders: number
    pendingOrders: number
    preparingOrders: number
    readyOrders: number
    menuItems: number
    categories: number
    revenue: number
    customers: number
  }
  recentOrders: Order[]
  menuCategories: MenuCategory[]
  monthlyGrowth: {
    orders: number
    revenue: number
    customers: number
    restaurants: number
  }
}

export function RestaurantAdminDashboard({
  isLoading,
  stats,
  recentOrders,
  menuCategories,
  monthlyGrowth,
}: RestaurantAdminDashboardProps) {
  return (
    <>
      <div className="rounded-xl border bg-gradient-to-br from-brand-50 to-brand-100 p-6 dark:from-brand-950 dark:to-brand-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">¡Bienvenido de nuevo!</h2>
            <p className="text-muted-foreground">Así está funcionando su restaurante hoy.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2 bg-white/50 backdrop-blur-sm dark:bg-gray-900/50">
              <span>{new Date().toLocaleDateString("es-ES", { month: "short", year: "numeric" })}</span>
            </Button>
            <Button className="gap-2">Ver Reportes</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total de Pedidos</CardTitle>
            <CardDescription>Todos los pedidos procesados</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <div className="dashboard-stat">
                <div className="dashboard-stat-value">{stats.totalOrders}</div>
                <div className="dashboard-stat-label">
                  <span
                    className={`flex items-center ${monthlyGrowth.orders >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    <TrendingUp className="mr-1 h-3 w-3" /> {monthlyGrowth.orders >= 0 ? "+" : ""}
                    {monthlyGrowth.orders}% este mes
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Pedidos Pendientes</CardTitle>
            <CardDescription>Pedidos en espera de procesamiento</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <div className="dashboard-stat">
                <div className="dashboard-stat-value text-amber-500">{stats.pendingOrders}</div>
                <div className="dashboard-stat-label">
                  {stats.pendingOrders > 0 ? "Requiere atención" : "No hay pedidos pendientes"}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Ingresos</CardTitle>
            <CardDescription>Ganancias totales</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <div className="dashboard-stat">
                <div className="dashboard-stat-value">${stats.revenue.toFixed(2)}</div>
                <div className="dashboard-stat-label">
                  <span
                    className={`flex items-center ${monthlyGrowth.revenue >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    <TrendingUp className="mr-1 h-3 w-3" /> {monthlyGrowth.revenue >= 0 ? "+" : ""}
                    {monthlyGrowth.revenue}% este mes
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Clientes</CardTitle>
            <CardDescription>Clientes únicos</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <div className="dashboard-stat">
                <div className="dashboard-stat-value">{stats.customers}</div>
                <div className="dashboard-stat-label">
                  <span
                    className={`flex items-center ${monthlyGrowth.customers >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    <TrendingUp className="mr-1 h-3 w-3" /> {monthlyGrowth.customers >= 0 ? "+" : ""}
                    {monthlyGrowth.customers}% este mes
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders">Pedidos Recientes</TabsTrigger>
          <TabsTrigger value="menu">Resumen del Menú</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Pedidos Recientes</CardTitle>
              <CardDescription>Pedidos recientes de su restaurante en las últimas 24 horas</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <ShoppingBag className="mb-2 h-10 w-10 text-muted-foreground" />
                  <p className="text-muted-foreground">No se encontraron pedidos recientes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between rounded-lg border p-4 hover-card">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                              : order.status === "preparing"
                                ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"
                                : "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                          }`}
                        >
                          <ShoppingBag className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {order.id.substring(0, 8)} - {order.customer_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order.status === "delivered"
                              ? "Entregado"
                              : order.status === "preparing"
                                ? "Preparando"
                                : order.status === "pending"
                                  ? "Pendiente"
                                  : order.status === "ready"
                                    ? "Listo"
                                    : order.status}{" "}
                            • {new Date(order.created_at).toLocaleTimeString()} • ${order.total?.toFixed(2) || "0.00"}
                          </div>
                        </div>
                      </div>
                      <Link href={`/dashboard/orders/${order.id}`}>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Categorías del Menú</CardTitle>
              <CardDescription>Resumen de las categorías y elementos de su menú</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : menuCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Utensils className="mb-2 h-10 w-10 text-muted-foreground" />
                  <p className="text-muted-foreground">No se encontraron categorías de menú</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {menuCategories.map((category) => {
                    const totalItems = category.items?.length || 0
                    const availableItems = category.items?.filter((item) => item.is_available)?.length || 0

                    return (
                      <div key={category.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Utensils className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{category.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {totalItems} elementos • {availableItems} disponibles
                              </div>
                            </div>
                          </div>
                          <Link href={`/dashboard/menu?category=${category.id}`}>
                            <Button variant="ghost" size="icon" className="rounded-full">
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                        <Progress value={(availableItems / (totalItems || 1)) * 100} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
