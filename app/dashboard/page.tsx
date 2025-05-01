"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { UserRole } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { QrCode, ShoppingBag, Utensils, Clock } from "lucide-react"
import Link from "next/link"
import { createClientSupabaseClient } from "@/lib/supabase"
import type { Restaurant } from "@/lib/services/restaurant-service"
import type { Order } from "@/lib/services/order-service"
import { useTheme } from "@/components/providers/theme-provider"
import { RootAdminDashboard } from "@/components/dashboard/root-admin-dashboard"
import { RestaurantAdminDashboard } from "@/components/dashboard/restaurant-admin-dashboard"
import type { MenuCategory } from "@/lib/services/menu-service"

export default function DashboardPage() {
  const { userDetails } = useAuth()
  const { isLoading: isThemeLoading } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    menuItems: 0,
    categories: 0,
    revenue: 0,
    customers: 0,
  })
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([])
  const [monthlyGrowth, setMonthlyGrowth] = useState({
    orders: 0,
    revenue: 0,
    customers: 0,
    restaurants: 0,
  })

  const isRootAdmin = userDetails?.role === UserRole.ROOT_ADMIN
  const isKitchenStaff = userDetails?.role === UserRole.KITCHEN

  useEffect(() => {
    const fetchData = async () => {
      if (!userDetails) return

      const supabase = createClientSupabaseClient()

      try {
        if (isRootAdmin) {
          // Fetch all restaurants for root admin
          const { data: restaurantsData } = await supabase
            .from("restaurants")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(3)

          setRestaurants(restaurantsData || [])

          // Get all orders
          const { data: allOrders } = await supabase.from("orders").select("*")
          const orders = allOrders || []

          // Calculate total revenue
          const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)

          // Calculate orders by status
          const pendingOrders = orders.filter((order) => order.status === "pending").length
          const preparingOrders = orders.filter((order) => order.status === "preparing").length
          const readyOrders = orders.filter((order) => order.status === "ready").length

          // Calculate unique customers
          const uniqueCustomers = new Set(orders.map((order) => order.customer_phone)).size

          // Calculate monthly growth (comparing to previous month)
          const now = new Date()
          const currentMonth = now.getMonth()
          const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
          const currentYear = now.getFullYear()
          const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear

          const currentMonthStart = new Date(currentYear, currentMonth, 1).toISOString()
          const previousMonthStart = new Date(previousYear, previousMonth, 1).toISOString()
          const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0).toISOString()
          const previousMonthEnd = new Date(previousYear, previousMonth + 1, 0).toISOString()

          // Current month orders
          const { data: currentMonthOrders } = await supabase
            .from("orders")
            .select("*")
            .gte("created_at", currentMonthStart)
            .lte("created_at", currentMonthEnd)

          // Previous month orders
          const { data: previousMonthOrders } = await supabase
            .from("orders")
            .select("*")
            .gte("created_at", previousMonthStart)
            .lte("created_at", previousMonthEnd)

          // Current month restaurants
          const { data: currentMonthRestaurants } = await supabase
            .from("restaurants")
            .select("*")
            .gte("created_at", currentMonthStart)
            .lte("created_at", currentMonthEnd)

          // Previous month restaurants
          const { data: previousMonthRestaurants } = await supabase
            .from("restaurants")
            .select("*")
            .gte("created_at", previousMonthStart)
            .lte("created_at", previousMonthEnd)

          // Calculate growth percentages
          const currentMonthOrderCount = currentMonthOrders?.length || 0
          const previousMonthOrderCount = previousMonthOrders?.length || 0
          const orderGrowth =
            previousMonthOrderCount === 0
              ? 100
              : Math.round(((currentMonthOrderCount - previousMonthOrderCount) / previousMonthOrderCount) * 100)

          const currentMonthRevenue = (currentMonthOrders || []).reduce((sum, order) => sum + (order.total || 0), 0)
          const previousMonthRevenue = (previousMonthOrders || []).reduce((sum, order) => sum + (order.total || 0), 0)
          const revenueGrowth =
            previousMonthRevenue === 0
              ? 100
              : Math.round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100)

          const currentMonthCustomers = new Set((currentMonthOrders || []).map((order) => order.customer_phone)).size
          const previousMonthCustomers = new Set((previousMonthOrders || []).map((order) => order.customer_phone)).size
          const customerGrowth =
            previousMonthCustomers === 0
              ? 100
              : Math.round(((currentMonthCustomers - previousMonthCustomers) / previousMonthCustomers) * 100)

          const currentMonthRestaurantCount = currentMonthRestaurants?.length || 0
          const previousMonthRestaurantCount = previousMonthRestaurants?.length || 0
          const restaurantGrowth =
            previousMonthRestaurantCount === 0
              ? 100
              : Math.round(
                  ((currentMonthRestaurantCount - previousMonthRestaurantCount) / previousMonthRestaurantCount) * 100,
                )

          setMonthlyGrowth({
            orders: orderGrowth,
            revenue: revenueGrowth,
            customers: customerGrowth,
            restaurants: restaurantGrowth,
          })

          // Fetch recent orders across all restaurants
          const { data: recentOrdersData } = await supabase
            .from("orders")
            .select(`
              *,
              restaurant:restaurants(name)
            `)
            .order("created_at", { ascending: false })
            .limit(3)

          setRecentOrders(recentOrdersData || [])

          setStats({
            totalOrders: orders.length,
            pendingOrders,
            preparingOrders,
            readyOrders,
            menuItems: 0, // Not needed for root admin
            categories: 0, // Not needed for root admin
            revenue: totalRevenue,
            customers: uniqueCustomers,
          })
        } else if (userDetails.restaurantId) {
          // Fetch restaurant-specific data
          const restaurantId = userDetails.restaurantId

          // Fetch orders for this restaurant
          const { data: ordersData } = await supabase.from("orders").select("*").eq("restaurant_id", restaurantId)

          const orders = ordersData || []

          // Fetch menu categories and items
          const { data: categoriesData } = await supabase
            .from("menu_categories")
            .select(`
              *,
              items:menu_items(*)
            `)
            .eq("restaurant_id", restaurantId)

          const categories = categoriesData || []
          setMenuCategories(categories)

          // Count menu items
          const menuItemCount = categories.reduce((sum, category) => sum + (category.items?.length || 0), 0)

          // Calculate stats
          const totalOrders = orders.length
          const pendingOrders = orders.filter((order) => order.status === "pending").length
          const preparingOrders = orders.filter((order) => order.status === "preparing").length
          const readyOrders = orders.filter((order) => order.status === "ready").length
          const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
          const uniqueCustomers = new Set(orders.map((order) => order.customer_phone)).size

          // Calculate monthly growth
          const now = new Date()
          const currentMonth = now.getMonth()
          const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
          const currentYear = now.getFullYear()
          const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear

          const currentMonthStart = new Date(currentYear, currentMonth, 1).toISOString()
          const previousMonthStart = new Date(previousYear, previousMonth, 1).toISOString()
          const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0).toISOString()
          const previousMonthEnd = new Date(previousYear, previousMonth + 1, 0).toISOString()

          // Current month orders for this restaurant
          const { data: currentMonthOrders } = await supabase
            .from("orders")
            .select("*")
            .eq("restaurant_id", restaurantId)
            .gte("created_at", currentMonthStart)
            .lte("created_at", currentMonthEnd)

          // Previous month orders for this restaurant
          const { data: previousMonthOrders } = await supabase
            .from("orders")
            .select("*")
            .eq("restaurant_id", restaurantId)
            .gte("created_at", previousMonthStart)
            .lte("created_at", previousMonthEnd)

          // Calculate growth percentages
          const currentMonthOrderCount = currentMonthOrders?.length || 0
          const previousMonthOrderCount = previousMonthOrders?.length || 0
          const orderGrowth =
            previousMonthOrderCount === 0
              ? 100
              : Math.round(((currentMonthOrderCount - previousMonthOrderCount) / previousMonthOrderCount) * 100)

          const currentMonthRevenue = (currentMonthOrders || []).reduce((sum, order) => sum + (order.total || 0), 0)
          const previousMonthRevenue = (previousMonthOrders || []).reduce((sum, order) => sum + (order.total || 0), 0)
          const revenueGrowth =
            previousMonthRevenue === 0
              ? 100
              : Math.round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100)

          const currentMonthCustomers = new Set((currentMonthOrders || []).map((order) => order.customer_phone)).size
          const previousMonthCustomers = new Set((previousMonthOrders || []).map((order) => order.customer_phone)).size
          const customerGrowth =
            previousMonthCustomers === 0
              ? 100
              : Math.round(((currentMonthCustomers - previousMonthCustomers) / previousMonthCustomers) * 100)

          setMonthlyGrowth({
            orders: orderGrowth,
            revenue: revenueGrowth,
            customers: customerGrowth,
            restaurants: 0, // Not applicable for restaurant admin
          })

          // Fetch recent orders for this restaurant
          const { data: recentOrdersData } = await supabase
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
            .limit(3)

          setRecentOrders(recentOrdersData || [])

          // Set stats
          setStats({
            totalOrders,
            pendingOrders,
            preparingOrders,
            readyOrders,
            menuItems: menuItemCount,
            categories: categories.length,
            revenue: totalRevenue,
            customers: uniqueCustomers,
          })
        }
      } catch (error) {
        console.error("Error al obtener datos del dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Esperar a que el tema esté cargado antes de cargar los datos
    if (userDetails && !isThemeLoading) {
      fetchData()
    }
  }, [userDetails, isRootAdmin, isKitchenStaff, isThemeLoading])

  if (isKitchenStaff) {
    // Redirect kitchen staff to orders page
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight gradient-heading">Panel de Cocina</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{new Date().toLocaleDateString("es-ES", { weekday: "long", month: "long", day: "numeric" })}</span>
          </div>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-brand-50 to-brand-100 p-8 dark:from-brand-950 dark:to-brand-900">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-primary/10 p-3">
              <ShoppingBag className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Bienvenido al Panel de Cocina</h2>
            <p className="max-w-md text-muted-foreground">
              Ha iniciado sesión como personal de cocina. Puede ver y gestionar todos los pedidos entrantes desde aquí.
            </p>
            <Link href="/dashboard/orders">
              <Button size="lg" className="mt-2 gap-2">
                <ShoppingBag className="h-5 w-5" />
                Ir a Pedidos
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="dashboard-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Pedidos Pendientes</CardTitle>
              <CardDescription>Pedidos esperando ser preparados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="dashboard-stat">
                <div className="dashboard-stat-value text-amber-500">
                  {isLoading ? <Skeleton className="h-10 w-16" /> : stats.pendingOrders}
                </div>
                <div className="dashboard-stat-label">
                  {stats.pendingOrders > 0 ? "Requiere atención inmediata" : "No hay pedidos pendientes"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">En Preparación</CardTitle>
              <CardDescription>Pedidos actualmente en preparación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="dashboard-stat">
                <div className="dashboard-stat-value text-blue-500">
                  {isLoading ? <Skeleton className="h-10 w-16" /> : stats.preparingOrders}
                </div>
                <div className="dashboard-stat-label">
                  {stats.preparingOrders > 0 ? "Actualmente en cocina" : "No hay pedidos en preparación"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Listos para Entrega</CardTitle>
              <CardDescription>Pedidos listos para ser servidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="dashboard-stat">
                <div className="dashboard-stat-value text-green-500">
                  {isLoading ? <Skeleton className="h-10 w-16" /> : stats.readyOrders}
                </div>
                <div className="dashboard-stat-label">
                  {stats.readyOrders > 0 ? "Listos para ser servidos" : "No hay pedidos listos"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-heading">Panel de Control</h1>
          <p className="text-muted-foreground">
            {isRootAdmin
              ? "Descripción general de todos los restaurantes y el rendimiento del sistema"
              : "Descripción general del rendimiento de su restaurante"}
          </p>
        </div>
        {!isRootAdmin && (
          <div className="flex gap-2">
            <Link href="/dashboard/menu">
              <Button variant="outline" className="gap-2">
                <Utensils className="h-4 w-4" />
                Gestionar Menú
              </Button>
            </Link>
            <Link href="/public-menu/demo">
              <Button className="gap-2">
                <QrCode className="h-4 w-4" />
                Ver QR del Menú
              </Button>
            </Link>
          </div>
        )}
      </div>

      {isRootAdmin ? (
        <RootAdminDashboard
          isLoading={isLoading}
          stats={stats}
          restaurants={restaurants}
          recentOrders={recentOrders}
          monthlyGrowth={monthlyGrowth}
        />
      ) : (
        <RestaurantAdminDashboard
          isLoading={isLoading}
          stats={stats}
          recentOrders={recentOrders}
          menuCategories={menuCategories}
          monthlyGrowth={monthlyGrowth}
        />
      )}
    </div>
  )
}
