"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext, useCallback } from "react"
import { createClientSupabaseClient } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/providers/auth-provider"

export interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  image_url?: string
  is_available: boolean
  category_id: string
  created_at?: string
  updated_at?: string
}
export interface Submenu {
  id: string
  name: string
  description?: string
  menu_id: string
}
export interface Category {
  id: string
  name: string
  description?: string
  restaurant_id: string
  branch_id: string
  created_at?: string
  updated_at?: string
  items?: MenuItem[]
}

export interface Menu {
  id: string
  name: string
  description?: string
  branch_id: string
  is_active: boolean
  created_at?: string
  updated_at?: string
  categories?: Category[]
}

interface MenuDataContextType {
  menus: Menu[]
  categories: Category[]
  isLoading: boolean
  selectedMenu: Menu | null
  selectedCategory: Category | null
  selectedMenuItem: MenuItem | null
  newMenu: Partial<Menu>
  newCategory: Partial<Category>
  newMenuItem: Partial<MenuItem>
  setSelectedMenu: (menu: Menu | null) => void
  setSelectedCategory: (category: Category | null) => void
  setSelectedMenuItem: (item: MenuItem | null) => void
  setNewMenu: (menu: Partial<Menu>) => void
  setNewCategory: (category: Partial<Category>) => void
  setNewMenuItem: (item: Partial<MenuItem>) => void
  createMenu: () => Promise<boolean>
  updateMenu: () => Promise<boolean>
  deleteMenu: (id: string) => Promise<boolean>
  createCategory: () => Promise<boolean>
  updateCategory: () => Promise<boolean>
  deleteCategory: (id: string, menuId?: string) => Promise<boolean>
  createMenuItem: () => Promise<boolean>
  updateMenuItem: () => Promise<boolean>
  deleteMenuItem: (id: string, categoryId?: string) => Promise<boolean>
  resetNewMenuForm: () => void
  resetNewCategoryForm: () => void
  resetNewMenuItemForm: () => void
  selectedSubmenu: Submenu | null
  newSubmenu: Partial<Submenu>
  setNewSubmenu: (submenu: Partial<Submenu>) => void
  setSelectedSubmenu: (submenu: Submenu | null) => void
}

const MenuDataContext = createContext<MenuDataContextType | undefined>(undefined)

export const MenuDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [menus, setMenus] = useState<Menu[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)

  const [newMenu, setNewMenu] = useState<Partial<Menu>>({
    name: "",
    description: "",
    branch_id: "",
    is_active: true,
  })

  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: "",
    description: "",
    branch_id: "",
    restaurant_id: "",
  })

  const [newMenuItem, setNewMenuItem] = useState<Partial<MenuItem>>({
    name: "",
    description: "",
    price: 0,
    is_available: true,
    category_id: "",
  })

  const [selectedSubmenu, setSelectedSubmenu] = useState<Submenu | null>(null)
  const [newSubmenu, setNewSubmenu] = useState<Partial<Submenu>>({
    name: "",
    description: "",
    menu_id: "",
  })

  const { toast } = useToast()
  const { user, userDetails } = useAuth()
  const restaurantId = user?.restaurantId || (userDetails && userDetails.restaurant_id) || null

  useEffect(() => {
    const fetchMenuData = async () => {
      if (!restaurantId) {
        setIsLoading(false)
        return
      }

      try {
        const supabase = createClientSupabaseClient()

        const { data: branches, error: branchesError } = await supabase
          .from("branches")
          .select("id")
          .eq("restaurant_id", restaurantId)

        if (branchesError) throw branchesError

        if (!branches || branches.length === 0) {
          setIsLoading(false)
          return
        }

        const branchIds = branches.map((branch) => branch.id)

        const { data: menusData, error: menusError } = await supabase
          .from("menus")
          .select("*")
          .in("branch_id", branchIds)
          .order("created_at", { ascending: false })

        if (menusError) throw menusError

        const { data: categoriesData, error: categoriesError } = await supabase
          .from("menu_categories")
          .select("*")
          .eq("restaurant_id", restaurantId)
          .order("created_at", { ascending: false })

        if (categoriesError) throw categoriesError

        const { data: menuItemsData, error: menuItemsError } = await supabase
          .from("menu_items")
          .select("*")
          .order("created_at", { ascending: false })

        if (menuItemsError) throw menuItemsError

        const processedCategories = categoriesData.map((category) => {
          const items = menuItemsData.filter((item) => item.category_id === category.id)
          return { ...category, items }
        })

        const processedMenus = menusData.map((menu) => {
          const menuCategories = processedCategories.filter((category) => category.branch_id === menu.branch_id)
          return { ...menu, categories: menuCategories }
        })

        setMenus(processedMenus)
        setCategories(processedCategories)
      } catch (error) {
        console.error("Error al cargar datos del menú:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del menú",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMenuData()
  }, [restaurantId, toast])

  const resetNewMenuForm = useCallback(() => {
    setNewMenu({
      name: "",
      description: "",
      branch_id: "",
      is_active: true,
    })
  }, [])

  const resetNewCategoryForm = useCallback(() => {
    setNewCategory({
      name: "",
      description: "",
      branch_id: "",
      restaurant_id: typeof restaurantId === "string" ? restaurantId : "",
    })
  }, [restaurantId])

  const resetNewMenuItemForm = useCallback(() => {
    setNewMenuItem({
      name: "",
      description: "",
      price: 0,
      is_available: true,
      category_id: "",
    })
  }, [])

  const createMenu = async (): Promise<boolean> => {
    if (!newMenu.name || !newMenu.branch_id) {
      toast({
        title: "Error",
        description: "El nombre y la sucursal son obligatorios",
        variant: "destructive",
      })
      return false
    }

    try {
      const supabase = createClientSupabaseClient()

      const { data, error } = await supabase
        .from("menus")
        .insert({
          name: newMenu.name,
          description: newMenu.description || null,
          branch_id: newMenu.branch_id,
          is_active: newMenu.is_active,
        })
        .select()

      if (error) throw error

      if (data && data[0]) {
        setMenus((prev) => [{ ...data[0], categories: [] }, ...prev])
        toast({
          title: "Éxito",
          description: "Menú creado correctamente",
        })
        resetNewMenuForm()
        return true
      }

      return false
    } catch (error) {
      console.error("Error al crear menú:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el menú",
        variant: "destructive",
      })
      return false
    }
  }

  const updateMenu = async (): Promise<boolean> => {
    if (!selectedMenu || !selectedMenu.id) return false

    try {
      const supabase = createClientSupabaseClient()

      const { error } = await supabase
        .from("menus")
        .update({
          name: selectedMenu.name,
          description: selectedMenu.description || null,
          branch_id: selectedMenu.branch_id,
          is_active: selectedMenu.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedMenu.id)

      if (error) throw error

      setMenus((prev) => prev.map((menu) => (menu.id === selectedMenu.id ? selectedMenu : menu)))

      toast({
        title: "Éxito",
        description: "Menú actualizado correctamente",
      })

      setSelectedMenu(null)
      return true
    } catch (error) {
      console.error("Error al actualizar menú:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el menú",
        variant: "destructive",
      })
      return false
    }
  }

  const deleteMenu = async (id: string): Promise<boolean> => {
    try {
      const supabase = createClientSupabaseClient()

      const { error } = await supabase.from("menus").delete().eq("id", id)

      if (error) throw error

      setMenus((prev) => prev.filter((menu) => menu.id !== id))

      toast({
        title: "Éxito",
        description: "Menú eliminado correctamente",
      })

      return true
    } catch (error) {
      console.error("Error al eliminar menú:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el menú",
        variant: "destructive",
      })
      return false
    }
  }

  const createCategory = async (): Promise<boolean> => {
    if (!newCategory.name || !newCategory.branch_id) {
      toast({
        title: "Error",
        description: "El nombre y la sucursal son obligatorios",
        variant: "destructive",
      })
      return false
    }

    try {
      const supabase = createClientSupabaseClient()

      const { data, error } = await supabase
        .from("menu_categories")
        .insert({
          name: newCategory.name,
          description: newCategory.description || null,
          restaurant_id: restaurantId,
          branch_id: newCategory.branch_id,
        })
        .select()

      if (error) throw error

      if (data && data[0]) {
        const newCategoryWithItems = { ...data[0], items: [] }

        setCategories((prev) => [newCategoryWithItems, ...prev])

        setMenus((prev) =>
          prev.map((menu) => {
            if (menu.branch_id === newCategory.branch_id) {
              return {
                ...menu,
                categories: [...(menu.categories || []), newCategoryWithItems],
              }
            }
            return menu
          }),
        )

        toast({
          title: "Éxito",
          description: "Categoría creada correctamente",
        })

        resetNewCategoryForm()
        return true
      }

      return false
    } catch (error) {
      console.error("Error al crear categoría:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la categoría",
        variant: "destructive",
      })
      return false
    }
  }

  const updateCategory = async (): Promise<boolean> => {
    if (!selectedCategory || !selectedCategory.id) return false

    try {
      const supabase = createClientSupabaseClient()

      const { error } = await supabase
        .from("menu_categories")
        .update({
          name: selectedCategory.name,
          description: selectedCategory.description || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedCategory.id)

      if (error) throw error

      setCategories((prev) =>
        prev.map((category) => (category.id === selectedCategory.id ? selectedCategory : category)),
      )

      setMenus((prev) =>
        prev.map((menu) => {
          if (menu.branch_id === selectedCategory.branch_id) {
            return {
              ...menu,
              categories: (menu.categories || []).map((category) =>
                category.id === selectedCategory.id ? selectedCategory : category,
              ),
            }
          }
          return menu
        }),
      )

      toast({
        title: "Éxito",
        description: "Categoría actualizada correctamente",
      })

      setSelectedCategory(null)
      return true
    } catch (error) {
      console.error("Error al actualizar categoría:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la categoría",
        variant: "destructive",
      })
      return false
    }
  }

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      const supabase = createClientSupabaseClient()

      const { error } = await supabase.from("menu_categories").delete().eq("id", id)

      if (error) throw error

      const categoryToDelete = categories.find((category) => category.id === id)

      setCategories((prev) => prev.filter((category) => category.id !== id))

      if (categoryToDelete) {
        setMenus((prev) =>
          prev.map((menu) => {
            if (menu.branch_id === categoryToDelete.branch_id) {
              return {
                ...menu,
                categories: (menu.categories || []).filter((category) => category.id !== id),
              }
            }
            return menu
          }),
        )
      }

      toast({
        title: "Éxito",
        description: "Categoría eliminada correctamente",
      })

      return true
    } catch (error) {
      console.error("Error al eliminar categoría:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría",
        variant: "destructive",
      })
      return false
    }
  }

  const createMenuItem = async (): Promise<boolean> => {
    if (!newMenuItem.name || !newMenuItem.category_id || newMenuItem.price === undefined || newMenuItem.price <= 0) {
      toast({
        title: "Error",
        description: "El nombre, la categoría y el precio son obligatorios",
        variant: "destructive",
      })
      return false
    }

    try {
      const supabase = createClientSupabaseClient()

      const { data, error } = await supabase
        .from("menu_items")
        .insert({
          name: newMenuItem.name,
          description: newMenuItem.description || null,
          price: newMenuItem.price,
          image_url: newMenuItem.image_url || null,
          is_available: newMenuItem.is_available,
          category_id: newMenuItem.category_id,
        })
        .select()

      if (error) throw error

      if (data && data[0]) {
        const categoryId = newMenuItem.category_id

        setCategories((prev) =>
          prev.map((category) => {
            if (category.id === categoryId) {
              return {
                ...category,
                items: [...(category.items || []), data[0]],
              }
            }
            return category
          }),
        )

        setMenus((prev) =>
          prev.map((menu) => {
            return {
              ...menu,
              categories: (menu.categories || []).map((category) => {
                if (category.id === categoryId) {
                  return {
                    ...category,
                    items: [...(category.items || []), data[0]],
                  }
                }
                return category
              }),
            }
          }),
        )

        toast({
          title: "Éxito",
          description: "Item creado correctamente",
        })

        resetNewMenuItemForm()
        return true
      }

      return false
    } catch (error) {
      console.error("Error al crear item:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el item",
        variant: "destructive",
      })
      return false
    }
  }

  const updateMenuItem = async (): Promise<boolean> => {
    if (!selectedMenuItem || !selectedMenuItem.id) return false

    try {
      const supabase = createClientSupabaseClient()

      const { error } = await supabase
        .from("menu_items")
        .update({
          name: selectedMenuItem.name,
          description: selectedMenuItem.description || null,
          price: selectedMenuItem.price,
          image_url: selectedMenuItem.image_url || null,
          is_available: selectedMenuItem.is_available,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedMenuItem.id)

      if (error) throw error

      const categoryId = selectedMenuItem.category_id

      setCategories((prev) =>
        prev.map((category) => {
          if (category.id === categoryId) {
            return {
              ...category,
              items: (category.items || []).map((item) => (item.id === selectedMenuItem.id ? selectedMenuItem : item)),
            }
          }
          return category
        }),
      )

      setMenus((prev) =>
        prev.map((menu) => {
          return {
            ...menu,
            categories: (menu.categories || []).map((category) => {
              if (category.id === categoryId) {
                return {
                  ...category,
                  items: (category.items || []).map((item) =>
                    item.id === selectedMenuItem.id ? selectedMenuItem : item,
                  ),
                }
              }
              return category
            }),
          }
        }),
      )

      toast({
        title: "Éxito",
        description: "Item actualizado correctamente",
      })

      setSelectedMenuItem(null)
      return true
    } catch (error) {
      console.error("Error al actualizar item:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el item",
        variant: "destructive",
      })
      return false
    }
  }

  const deleteMenuItem = async (id: string, categoryId?: string): Promise<boolean> => {
    try {
      const supabase = createClientSupabaseClient()

      const { error } = await supabase.from("menu_items").delete().eq("id", id)

      if (error) throw error

      let itemCategoryId = categoryId
      if (!itemCategoryId) {
        for (const category of categories) {
          if (category.items?.some((item) => item.id === id)) {
            itemCategoryId = category.id
            break
          }
        }
      }

      if (itemCategoryId) {
        setCategories((prev) =>
          prev.map((category) => {
            if (category.id === itemCategoryId) {
              return {
                ...category,
                items: (category.items || []).filter((item) => item.id !== id),
              }
            }
            return category
          }),
        )

        setMenus((prev) =>
          prev.map((menu) => {
            return {
              ...menu,
              categories: (menu.categories || []).map((category) => {
                if (category.id === itemCategoryId) {
                  return {
                    ...category,
                    items: (category.items || []).filter((item) => item.id !== id),
                  }
                }
                return category
              }),
            }
          }),
        )
      }

      toast({
        title: "Éxito",
        description: "Item eliminado correctamente",
      })

      return true
    } catch (error) {
      console.error("Error al eliminar item:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el item",
        variant: "destructive",
      })
      return false
    }
  }

  return (
    <MenuDataContext.Provider
      value={{
        menus,
        categories,
        isLoading,
        selectedMenu,
        selectedCategory,
        selectedMenuItem,
        newMenu,
        newCategory,
        newMenuItem,
        setSelectedMenu,
        setSelectedCategory,
        setSelectedMenuItem,
        setNewMenu,
        setNewCategory,
        setNewMenuItem,
        createMenu,
        updateMenu,
        deleteMenu,
        createCategory,
        updateCategory,
        deleteCategory,
        createMenuItem,
        updateMenuItem,
        deleteMenuItem,
        resetNewMenuForm,
        resetNewCategoryForm,
        resetNewMenuItemForm,
        selectedSubmenu,
        newSubmenu,
        setNewSubmenu,
        setSelectedSubmenu,
      }}
    >
      {children}
    </MenuDataContext.Provider>
  )
}

export const useMenuData = () => {
  const context = useContext(MenuDataContext)
  if (context === undefined) {
    throw new Error("useMenuData must be used within a MenuDataProvider")
  }
  return context
}
