"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  CalendarDays,
  CircleUser,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  Store,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/components/providers/auth-provider"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultCollapsed?: boolean
}

export function DashboardSidebar({ className, defaultCollapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const isAdmin = user?.role === ("admin" as string)
  const isRestaurantAdmin = user?.role === ("restaurant_admin" as string)

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
      role: ["admin", "restaurant_admin", "staff"],
    },
    {
      label: "Pedidos",
      icon: Package,
      href: "/dashboard/orders",
      active: pathname === "/dashboard/orders",
      role: ["staff"],
    },
    {
      label: "Menú",
      icon: Menu,
      href: "/dashboard/menu",
      active: pathname === "/dashboard/menu",
      role: ["admin", "restaurant_admin", "staff"],
    },
    {
      label: "Sucursales",
      icon: Store,
      href: "/dashboard/branches",
      active: pathname === "/dashboard/branches",
      role: ["admin", "restaurant_admin", "staff"],
    },
    {
      label: "Reservas",
      icon: CalendarDays,
      href: "/dashboard/reservations",
      active: pathname === "/dashboard/reservations",
      role: ["admin", "restaurant_admin", "staff"],
    },
    {
      label: "Mensajes",
      icon: MessageSquare,
      href: "/dashboard/messages",
      active: pathname === "/dashboard/messages",
      role: ["admin", "restaurant_admin", "staff"],
    },
    {
      label: "Analíticas",
      icon: BarChart3,
      href: "/dashboard/analytics",
      active: pathname === "/dashboard/analytics",
      role: ["admin", "restaurant_admin", "staff"],
    },
    {
      label: "Usuarios",
      icon: Users,
      href: "/dashboard/users",
      active: pathname === "/dashboard/users",
      role: ["admin", "restaurant_admin", "staff"],
    },

    {
      label: "Configuración",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings",
      role: ["admin", "restaurant_admin", "staff"],
    },
  ]

  const filteredRoutes = routes.filter((route) => {
    if (isAdmin) return true
    if (isRestaurantAdmin) return route.role.includes("restaurant_admin")
    return route.role.includes("staff")
  })

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Restaurant Manager</h2>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3">
                <nav className="grid gap-1">
                  {filteredRoutes.map((route, i) => (
                    <Link
                      key={i}
                      href={route.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                        route.active ? "bg-accent text-accent-foreground" : "",
                      )}
                    >
                      <route.icon className="h-5 w-5" />
                      {route.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <div className="flex items-center gap-3 mb-2">
                <CircleUser className="h-5 w-5" />
                <div className="text-sm font-medium truncate">{user?.email}</div>
              </div>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex md:flex-col h-full border-r bg-background",
          defaultCollapsed ? "md:w-16" : "md:w-64",
          className,
        )}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className={cn("text-lg font-semibold", defaultCollapsed && "hidden")}>Restaurant Manager</h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-3">
            <nav className="grid gap-1">
              {filteredRoutes.map((route, i) => (
                <Link
                  key={i}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    route.active ? "bg-accent text-accent-foreground" : "",
                  )}
                >
                  <route.icon className="h-5 w-5" />
                  <span className={cn(defaultCollapsed && "hidden")}>{route.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className={cn("flex items-center gap-3 mb-2", defaultCollapsed && "justify-center")}>
            <CircleUser className="h-5 w-5" />
            <div className={cn("text-sm font-medium truncate", defaultCollapsed && "hidden")}>{user?.email}</div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className={cn("w-full justify-start gap-2", defaultCollapsed && "justify-center")}
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4" />
            <span className={cn(defaultCollapsed && "hidden")}>Cerrar Sesión</span>
          </Button>
        </div>
      </div>
    </>
  )
}

