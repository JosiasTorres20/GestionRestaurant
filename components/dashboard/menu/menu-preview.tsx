"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { Menu } from "@/hooks/use-menu-data"

interface MenuPreviewProps {
  menus: Menu[]
}

export function MenuPreview({ menus }: MenuPreviewProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(menus.length > 0 ? menus[0].id : null)

  if (menus.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vista previa no disponible</CardTitle>
          <CardDescription>No hay menús disponibles para mostrar</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const activeMenu = menus.find((menu) => menu.id === activeMenuId) || menus[0]

  return (
    <div className="space-y-4">
      <Tabs value={activeMenuId || ""} onValueChange={setActiveMenuId} className="w-full">
        <TabsList className="w-full max-w-full overflow-x-auto flex-wrap">
          {menus.map((menu) => (
            <TabsTrigger key={menu.id} value={menu.id} className="flex items-center gap-2">
              {menu.name}
              {!menu.is_active && (
                <Badge variant="outline" className="ml-1">
                  Inactivo
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{activeMenu.name}</CardTitle>
          {activeMenu.description && <CardDescription className="text-base">{activeMenu.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {activeMenu.categories && activeMenu.categories.length > 0 ? (
              activeMenu.categories.map((category) => (
                <div key={category.id} className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                    {category.description && <p className="text-muted-foreground">{category.description}</p>}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {category.items && category.items.length > 0 ? (
                      category.items
                        .filter((item) => item.is_available)
                        .map((item) => (
                          <div key={item.id} className="flex justify-between gap-2 p-4 border rounded-md">
                            <div className="space-y-1">
                              <h4 className="font-medium">{item.name}</h4>
                              {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                            </div>
                            <div className="font-medium whitespace-nowrap">${item.price.toFixed(2)}</div>
                          </div>
                        ))
                    ) : (
                      <p className="text-muted-foreground col-span-2">No hay items disponibles en esta categoría</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Este menú no tiene categorías</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
