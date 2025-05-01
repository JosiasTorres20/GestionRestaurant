"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus, Store } from "lucide-react"
import { MenuItemDialog } from "@/components/dashboard/menu/menu-item-dialog"
import { MenuDialog } from "@/components/dashboard/menu/menu-dialog"
import { CategoryDialog } from "@/components/dashboard/menu/category-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useMenuData, type Menu, type Category, type MenuItem } from "@/hooks/use-menu-data"
import { Skeleton } from "@/components/ui/skeleton"
import { getBranches } from "@/lib/services/branch-service"
import { useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import type { Branch } from "@/types"


interface MenuListProps {
  menus: Menu[]
  isLoading: boolean
  searchQuery: string
}

export function MenuList({ menus, isLoading, searchQuery }: MenuListProps) {
  const {
    setSelectedMenu,
    setSelectedCategory,
    setSelectedMenuItem,
    deleteMenu,
    deleteCategory,
    deleteMenuItem,
    updateMenu,
    updateMenuItem,
  } = useMenuData()
  const { user, userDetails } = useAuth()
  const restaurantId = user?.restaurantId || (userDetails && userDetails.restaurant_id) || null

  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isMenuItemDialogOpen, setIsMenuItemDialogOpen] = useState(false)
  const [selectedCategoryForItem, setSelectedCategoryForItem] = useState<string | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])

  const [menuToDelete, setMenuToDelete] = useState<string | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [menuItemToDelete, setMenuItemToDelete] = useState<string | null>(null)
  const [categoryIdForItem, setCategoryIdForItem] = useState<string | null>(null)

  // Cargar sucursales
  useEffect(() => {
    const loadBranches = async () => {
      if (!restaurantId) return

      try {
        const branchesData = await getBranches(String(restaurantId))
        setBranches(branchesData)
      } catch (error) {
        console.error("Error al cargar sucursales:", error)
      }
    }

    loadBranches()
  }, [restaurantId])

  const handleEditMenu = (menu: Menu) => {
    setSelectedMenu(menu)
    setIsMenuDialogOpen(true)
  }

  const handleDeleteMenu = (menuId: string) => {
    setMenuToDelete(menuId)
  }

  const confirmDeleteMenu = async () => {
    if (menuToDelete) {
      await deleteMenu(menuToDelete)
      setMenuToDelete(null)
    }
  }

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category)
    setIsCategoryDialogOpen(true)
  }

  const handleDeleteCategory = (categoryId: string) => {
    setCategoryToDelete(categoryId)
  }

  const confirmDeleteCategory = async () => {
    if (categoryToDelete) {
      await deleteCategory(categoryToDelete)
      setCategoryToDelete(null)
    }
  }

  const handleAddMenuItem = (categoryId: string) => {
    setSelectedMenuItem(null) // Crear nuevo item (no editar uno existente)
    setSelectedCategoryForItem(categoryId)
    setIsMenuItemDialogOpen(true)
  }

  const handleEditMenuItem = (item: MenuItem, categoryId: string) => {
    setSelectedMenuItem(item) // Editar item existente
    setSelectedCategoryForItem(categoryId)
    setIsMenuItemDialogOpen(true)
  }

  const handleDeleteMenuItem = (itemId: string, categoryId: string) => {
    setMenuItemToDelete(itemId)
    setCategoryIdForItem(categoryId)
  }

  const confirmDeleteMenuItem = async () => {
    if (menuItemToDelete && categoryIdForItem) {
      await deleteMenuItem(menuItemToDelete, categoryIdForItem)
      setMenuItemToDelete(null)
      setCategoryIdForItem(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="w-full">
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2].map((j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-6 w-36" />
                    <div className="pl-4 space-y-2">
                      {[1, 2, 3].map((k) => (
                        <Skeleton key={k} className="h-4 w-full" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (menus.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No hay menús disponibles</CardTitle>
          <CardDescription>
            {searchQuery ? "No se encontraron resultados para tu búsqueda" : "Crea un nuevo menú para comenzar"}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {menus.map((menu) => (
        <Card key={menu.id} className="w-full">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>{menu.name}</CardTitle>
                <Badge
                  variant={menu.is_active ? "default" : "outline"}
                  style={menu.is_active ? { backgroundColor: "var(--brand-primary)" } : {}}
                >
                  {menu.is_active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Store className="h-3.5 w-3.5" />
                <span>Sucursal: {branches.find((b) => b.id === menu.branch_id)?.name || menu.branch_id}</span>
              </CardDescription>
              {menu.description && <p className="text-sm text-muted-foreground mt-2">{menu.description}</p>}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleEditMenu(menu)}
                className="hover:border-brand-primary hover:text-brand-primary"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleDeleteMenu(menu.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {menu.categories && menu.categories.length > 0 ? (
                menu.categories.map((category) => (
                  <div key={category.id} className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{category.name}</h3>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleAddMenuItem(category.id)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                    )}
                    <div className="pl-4 space-y-2 mt-3">
                      {category.items && category.items.length > 0 ? (
                        category.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between group">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={!item.is_available ? "text-muted-foreground line-through" : ""}>
                                  {item.name}
                                </span>
                                {!item.is_available && (
                                  <Badge variant="outline" className="text-xs">
                                    No disponible
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>${item.price.toFixed(2)}</span>
                                {item.description && <span>• {item.description}</span>}
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditMenuItem(item, category.id)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDeleteMenuItem(item.id, category.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No hay items en esta categoría</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">No hay categorías en este menú</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Diálogos de edición */}
      <MenuDialog
        open={isMenuDialogOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedMenu(null)
          setIsMenuDialogOpen(open)
        }}
        onUpdate={updateMenu}
        branches={branches}
      />

      <CategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedCategory(null)
          setIsCategoryDialogOpen(open)
        }}
        branches={branches}
      />

      <MenuItemDialog
        open={isMenuItemDialogOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedMenuItem(null)
          setIsMenuItemDialogOpen(open)
        }}
        categoryId={selectedCategoryForItem}
        submenuId={null}
        onUpdate={updateMenuItem}
      />

      {/* Delete Modals */}
      <AlertDialog open={!!menuToDelete} onOpenChange={() => setMenuToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción eliminará el menú y no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMenu}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la categoría y todos sus items. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!menuItemToDelete} onOpenChange={() => setMenuItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el item del menú. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMenuItem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
