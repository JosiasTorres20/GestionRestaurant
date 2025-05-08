"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { toast } from "sonner"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import type {
  Menu,
  Category,
  MenuItem,
  ThemeSettings,
  NewMenuFormData,
  NewCategoryFormData,
  NewMenuItemFormData,
} from "@/types"

// Definir el tipo para el contexto
interface MenuDataContextType {
  // Estado
  menus: Menu[]
  categories: Category[]
  menuItems: MenuItem[]
  selectedMenu: Menu | null
  selectedCategory: Category | null
  selectedMenuItem: MenuItem | null
  themeSettings: ThemeSettings | null
  isLoading: boolean

  // Setters
  setMenus: (menus: Menu[]) => void
  setCategories: (categories: Category[]) => void
  setMenuItems: (menuItems: MenuItem[]) => void
  setSelectedMenu: (menu: Menu | null) => void
  setSelectedCategory: (category: Category | null) => void
  setSelectedMenuItem: (menuItem: MenuItem | null) => void
  setThemeSettings: (themeSettings: ThemeSettings | null) => void

  // Acciones para menús
  loadMenus: (restaurantId: string) => Promise<Menu[]>
  loadBranchMenus: (branchId: string) => Promise<Menu[]>
  getMenuById: (menuId: string) => Promise<Menu | null>
  createMenu: (menuData: NewMenuFormData) => Promise<boolean>
  updateMenu: (menuId: string, menuData: Partial<Menu>) => Promise<boolean>
  deleteMenu: (menuId: string) => Promise<boolean>

  // Acciones para categorías
  loadCategories: (restaurantId: string) => Promise<Category[]>
  createCategory: (categoryData: NewCategoryFormData) => Promise<boolean>
  updateCategory: (categoryId: string, categoryData: Partial<Category>) => Promise<boolean>
  deleteCategory: (categoryId: string) => Promise<boolean>
  reorderCategories: (orderedIds: string[]) => Promise<boolean>

  // Acciones para ítems de menú
  createMenuItem: (itemData: NewMenuItemFormData) => Promise<boolean>
  updateMenuItem: (itemId: string, itemData: Partial<MenuItem>) => Promise<boolean>
  deleteMenuItem: (itemId: string) => Promise<boolean>
  reorderMenuItems: (orderedIds: string[]) => Promise<boolean>

  // Acciones para temas
  updateThemeSettings: (menuId: string, themeData: Partial<ThemeSettings>) => Promise<boolean>

  // Utilidades
  resetMenuForm: () => void
  resetNewCategoryForm: () => void
  resetNewMenuItemForm: () => void
}

// Crear el contexto
const MenuDataContext = createContext<MenuDataContextType | undefined>(undefined)

// Proveedor del contexto
export function MenuDataProvider({ children }: { children: ReactNode }) {
  // Estado
  const [menus, setMenus] = useState<Menu[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)
  const [themeSettings, setThemeSettings] = useState<ThemeSettings | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Acciones para menús
  const loadMenus = useCallback(async (restaurantId: string): Promise<Menu[]> => {
    try {
      const supabase = createBrowserSupabaseClient()
      setIsLoading(true)

      // Obtener menús
      const { data: menusData, error: menusError } = await supabase
        .from("menus")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false })

      if (menusError) {
        throw menusError
      }

      if (!menusData || menusData.length === 0) {
        setMenus([])
        return []
      }

      // Obtener categorías para estos menús
      const menuIds = menusData.map((menu) => menu.id)
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("menu_categories")
        .select("*")
        .in("menu_id", menuIds)
        .order("order", { ascending: true })

      if (categoriesError) {
        throw categoriesError
      }

      // Obtener items para estas categorías
      const categoryIds = categoriesData?.map((category) => category.id) || []
      let itemsData: MenuItem[] = []

      if (categoryIds.length > 0) {
        const { data: menuItemsData, error: itemsError } = await supabase
          .from("menu_items")
          .select("*")
          .in("category_id", categoryIds)
          .order("order", { ascending: true })

        if (itemsError) {
          throw itemsError
        }

        itemsData = menuItemsData || []
      }

      // Obtener configuraciones de tema
      const { data: themesData, error: themesError } = await supabase
        .from("theme_settings")
        .select("*")
        .in("menu_id", menuIds)

      if (themesError && themesError.code !== "PGRST116") {
        console.error("Error al obtener temas:", themesError)
      }

      // Construir menús completos
      const completeMenus = menusData.map((menu) => {
        // Filtrar categorías para este menú
        const menuCategories = categoriesData?.filter((category) => category.menu_id === menu.id) || []

        // Para cada categoría, asignar sus items
        const categoriesWithItems = menuCategories.map((category) => {
          const categoryItems = itemsData.filter((item) => item.category_id === category.id)
          return {
            ...category,
            items: categoryItems,
          }
        })

        // Buscar tema para este menú
        const menuTheme = themesData?.find((theme) => theme.menu_id === menu.id)

        return {
          ...menu,
          categories: categoriesWithItems,
          theme: menuTheme || null,
        }
      })

      setMenus(completeMenus)
      return completeMenus
    } catch (error) {
      console.error("Error loading menus:", error)
      toast.error("No se pudieron cargar los menús")
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadBranchMenus = useCallback(async (branchId: string): Promise<Menu[]> => {
    try {
      const supabase = createBrowserSupabaseClient()
      setIsLoading(true)

      // Obtener menús de la sucursal
      const { data: menusData, error: menusError } = await supabase
        .from("menus")
        .select("*")
        .eq("branch_id", branchId)
        .order("created_at", { ascending: false })

      if (menusError) {
        throw menusError
      }

      if (!menusData || menusData.length === 0) {
        setMenus([])
        return []
      }

      // Obtener categorías para estos menús
      const menuIds = menusData.map((menu) => menu.id)
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("menu_categories")
        .select("*")
        .in("menu_id", menuIds)
        .order("order", { ascending: true })

      if (categoriesError) {
        throw categoriesError
      }

      // Obtener items para estas categorías
      const categoryIds = categoriesData?.map((category) => category.id) || []
      let itemsData: MenuItem[] = []

      if (categoryIds.length > 0) {
        const { data: menuItemsData, error: itemsError } = await supabase
          .from("menu_items")
          .select("*")
          .in("category_id", categoryIds)
          .order("order", { ascending: true })

        if (itemsError) {
          throw itemsError
        }

        itemsData = menuItemsData || []
      }

      // Obtener configuraciones de tema
      const { data: themesData, error: themesError } = await supabase
        .from("theme_settings")
        .select("*")
        .in("menu_id", menuIds)

      if (themesError && themesError.code !== "PGRST116") {
        console.error("Error al obtener temas:", themesError)
      }

      // Construir menús completos
      const completeMenus = menusData.map((menu) => {
        // Filtrar categorías para este menú
        const menuCategories = categoriesData?.filter((category) => category.menu_id === menu.id) || []

        // Para cada categoría, asignar sus items
        const categoriesWithItems = menuCategories.map((category) => {
          const categoryItems = itemsData.filter((item) => item.category_id === category.id)
          return {
            ...category,
            items: categoryItems,
          }
        })

        // Buscar tema para este menú
        const menuTheme = themesData?.find((theme) => theme.menu_id === menu.id)

        return {
          ...menu,
          categories: categoriesWithItems,
          theme: menuTheme || null,
        }
      })

      setMenus(completeMenus)
      return completeMenus
    } catch (error) {
      console.error("Error loading branch menus:", error)
      toast("No se pudieron cargar los menús de la sucursal")
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getMenuById = useCallback(async (menuId: string): Promise<Menu | null> => {
    try {
      const supabase = createBrowserSupabaseClient()
      setIsLoading(true)

      // Obtener menú
      const { data, error } = await supabase.from("menus").select("*").eq("id", menuId).single()

      if (error) {
        throw error
      }

      if (!data) {
        return null
      }

      // Obtener categorías para este menú
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("menu_categories")
        .select("*")
        .eq("menu_id", menuId)
        .order("order", { ascending: true })

      if (categoriesError) {
        throw categoriesError
      }

      // Obtener items para estas categorías
      const categoryIds = categoriesData?.map((category) => category.id) || []
      let itemsData: MenuItem[] = []

      if (categoryIds.length > 0) {
        const { data: menuItemsData, error: itemsError } = await supabase
          .from("menu_items")
          .select("*")
          .in("category_id", categoryIds)
          .order("order", { ascending: true })

        if (itemsError) {
          throw itemsError
        }

        itemsData = menuItemsData || []
      }

      // Obtener configuración de tema
      const { data: themeData, error: themeError } = await supabase
        .from("theme_settings")
        .select("*")
        .eq("menu_id", menuId)
        .maybeSingle()

      if (themeError && themeError.code !== "PGRST116") {
        console.error("Error al obtener tema:", themeError)
      }

      // Construir categorías con sus items
      const categoriesWithItems =
        categoriesData?.map((category) => {
          const categoryItems = itemsData.filter((item) => item.category_id === category.id)
          return {
            ...category,
            items: categoryItems,
          }
        }) || []

      // Construir menú completo
      const menu: Menu = {
        ...data,
        categories: categoriesWithItems,
        theme: themeData || null,
      }

      setSelectedMenu(menu)
      if (themeData) {
        setThemeSettings(themeData)
      }

      return menu
    } catch (error) {
      console.error("Error loading menu:", error)
      toast("No se pudo cargar el menú")
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createMenu = useCallback(async (menuData: NewMenuFormData): Promise<boolean> => {
    try {
      const supabase = createBrowserSupabaseClient()

      // Crear menú
      const { data, error } = await supabase.from("menus").insert(menuData).select().single()

      if (error) {
        // Verificar si es un error de duplicado
        if (error.message.includes("duplicate") || error.message.includes("unique constraint")) {
          throw new Error(`Ya existe un menú con este nombre en esta sucursal`)
        }

        throw error
      }

      // Crear configuración de tema por defecto
      try {
        const themeData = {
          menu_id: data.id,
          primary_color: "#4f46e5",
          secondary_color: "#f9fafb",
          font_family: "Inter, sans-serif",
          logo_url: null,
          background_image_url: null,
          show_prices: true,
          enable_ordering: true,
          header_style: "default",
          footer_style: "default",
          item_layout: "grid",
        }

        await supabase.from("theme_settings").insert(themeData)
      } catch (themeError) {
        console.error("Error al crear tema:", themeError)
        // No interrumpir la creación del menú por un error en el tema
      }

      // Actualizar estado
      const newMenu: Menu = {
        ...data,
        categories: [],
        theme: null,
      }

      setMenus((prevMenus) => [newMenu, ...prevMenus])
      toast("Menú creado correctamente")

      return true
    } catch (error) {
      console.error("Error en createMenu:", error)
      toast(error instanceof Error ? error.message : "Error al crear el menú")

      return false
    }
  }, [])

  const updateMenu = useCallback(
    async (menuId: string, menuData: Partial<Menu>): Promise<boolean> => {
      try {
        const supabase = createBrowserSupabaseClient()

        // Filtrar propiedades que no pertenecen a la tabla menus
        // Usamos una variable temporal para evitar el error de TypeScript
        const tempData = { ...menuData }

        // Eliminar propiedades que no pertenecen a la tabla
        if ("categories" in tempData) delete tempData.categories
        if ("theme" in tempData) delete tempData.theme

        // Actualizar menú
        const { data, error } = await supabase.from("menus").update(tempData).eq("id", menuId).select().single()

        if (error) {
          // Verificar si es un error de duplicado
          if (error.message.includes("duplicate") || error.message.includes("unique constraint")) {
            throw new Error(`Ya existe un menú con este nombre en esta sucursal`)
          }

          throw error
        }

        // Actualizar estado
        setMenus((prevMenus) => prevMenus.map((menu) => (menu.id === menuId ? { ...menu, ...data } : menu)))

        // Si el menú seleccionado es el que se actualizó, actualizarlo también
        if (selectedMenu?.id === menuId) {
          setSelectedMenu((prev) => (prev ? { ...prev, ...data } : null))
        }

        toast({
          title: "Éxito",
          description: "Menú actualizado correctamente",
        })

        return true
      } catch (error) {
        console.error("Error en updateMenu:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Error al actualizar el menú",
          variant: "destructive",
        })

        return false
      }
    },
    [selectedMenu],
  )

  const deleteMenu = useCallback(async (menuId: string): Promise<boolean> => {
    try {
      const supabase = createBrowserSupabaseClient()

      // Eliminar menú
      const { error } = await supabase.from("menus").delete().eq("id", menuId)

      if (error) {
        throw error
      }

      // Actualizar estado
      setMenus((prevMenus) => prevMenus.filter((menu) => menu.id !== menuId))

      toast({
        title: "Éxito",
        description: "Menú eliminado correctamente",
      })

      return true
    } catch (error) {
      console.error("Error deleting menu:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el menú",
        variant: "destructive",
      })

      return false
    }
  }, [])

  // Cargar categorías
  const loadCategories = useCallback(async (): Promise<Category[]> => {
    // Esta función podría implementarse si necesitamos cargar categorías independientemente
    // Por ahora, devolvemos un array vacío ya que las categorías se cargan con los menús
    return []
  }, [])

  // Crear una categoría
  const createCategory = useCallback(
    async (categoryData: NewCategoryFormData): Promise<boolean> => {
      try {
        const supabase = createBrowserSupabaseClient()

        // Verificar si es un error de duplicado
        if (
          categoryData.name &&
          selectedMenu?.categories?.some((c) => c.name.toLowerCase() === categoryData.name.toLowerCase())
        ) {
          throw new Error(`Ya existe una categoría con el nombre "${categoryData.name}" en este menú`)
        }

        // Crear categoría
        const { data, error } = await supabase.from("menu_categories").insert(categoryData).select().single()

        if (error) {
          // Verificar si es un error de duplicado
          if (
            error.message.includes("duplicate") ||
            error.message.includes("unique constraint") ||
            error.message.includes("unique_category_per_menu")
          ) {
            throw new Error(`Ya existe una categoría con el nombre "${categoryData.name}" en este menú`)
          }

          throw error
        }

        // Actualizar estado
        const newCategory: Category = {
          ...data,
          items: [],
        }

        // Actualizar categorías
        setCategories((prevCategories) => [...prevCategories, newCategory])

        // Actualizar menú seleccionado si corresponde
        if (selectedMenu && selectedMenu.id === categoryData.menu_id) {
          setSelectedMenu((prevMenu) => {
            if (!prevMenu) return null

            return {
              ...prevMenu,
              categories: [...(prevMenu.categories || []), newCategory],
            }
          })
        }

        // Actualizar menús
        setMenus((prevMenus) =>
          prevMenus.map((menu) => {
            if (menu.id === categoryData.menu_id) {
              return {
                ...menu,
                categories: [...(menu.categories || []), newCategory],
              }
            }
            return menu
          }),
        )

        toast("Categoría creada correctamente")

        return true
      } catch (error) {
        console.error("Error en createCategory:", error)
        toast(error instanceof Error ? error.message : "Error al crear la categoría")

        return false
      }
    },
    [selectedMenu],
  )

  // Actualizar una categoría
  const updateCategory = useCallback(
    async (categoryId: string, categoryData: Partial<Category>): Promise<boolean> => {
      try {
        const supabase = createBrowserSupabaseClient()

        // Filtrar propiedades que no pertenecen a la tabla menu_categories
        // Usamos una variable temporal para evitar el error de TypeScript
        const tempData = { ...categoryData }

        // Eliminar propiedades que no pertenecen a la tabla
        if ("items" in tempData) delete tempData.items

        // Actualizar categoría
        const { data, error } = await supabase
          .from("menu_categories")
          .update(tempData)
          .eq("id", categoryId)
          .select()
          .single()

        if (error) {
          // Verificar si es un error de duplicado
          if (
            error.message.includes("duplicate") ||
            error.message.includes("unique constraint") ||
            error.message.includes("unique_category_per_menu")
          ) {
            throw new Error(`Ya existe una categoría con este nombre en este menú`)
          }

          throw error
        }

        // Actualizar estado
        setCategories((prevCategories) =>
          prevCategories.map((category) => (category.id === categoryId ? { ...category, ...data } : category)),
        )

        // Actualizar menús
        setMenus((prevMenus) =>
          prevMenus.map((menu) => {
            if (menu.categories?.some((category) => category.id === categoryId)) {
              return {
                ...menu,
                categories: menu.categories.map((category) =>
                  category.id === categoryId ? { ...category, ...data, items: category.items } : category,
                ),
              }
            }
            return menu
          }),
        )

        // Actualizar menú seleccionado si corresponde
        if (selectedMenu?.categories?.some((category) => category.id === categoryId)) {
          setSelectedMenu((prevMenu) => {
            if (!prevMenu) return null

            return {
              ...prevMenu,
              categories: (prevMenu.categories ?? []).map((category) =>
                category.id === categoryId ? { ...category, ...data, items: category.items } : category,
              ),
            }
          })
        }

        // Actualizar categoría seleccionada si corresponde
        if (selectedCategory?.id === categoryId) {
          setSelectedCategory((prev) => (prev ? { ...prev, ...data } : null))
        }

        toast({
          title: "Éxito",
          description: "Categoría actualizada correctamente",
        })

        return true
      } catch (error) {
        console.error("Error en updateCategory:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Error al actualizar la categoría",
          variant: "destructive",
        })

        return false
      }
    },
    [selectedMenu, selectedCategory],
  )

  // Eliminar una categoría
  const deleteCategory = useCallback(
    async (categoryId: string): Promise<boolean> => {
      try {
        const supabase = createBrowserSupabaseClient()

        // Eliminar categoría
        const { error } = await supabase.from("menu_categories").delete().eq("id", categoryId)

        if (error) {
          throw error
        }

        // Actualizar estado
        setCategories((prevCategories) => prevCategories.filter((category) => category.id !== categoryId))

        // Actualizar menús
        setMenus((prevMenus) =>
          prevMenus.map((menu) => {
            if (menu.categories?.some((category) => category.id === categoryId)) {
              return {
                ...menu,
                categories: menu.categories.filter((category) => category.id !== categoryId),
              }
            }
            return menu
          }),
        )

        // Actualizar menú seleccionado si corresponde
        if (selectedMenu?.categories?.some((category) => category.id === categoryId)) {
          setSelectedMenu((prevMenu) => {
            if (!prevMenu) return null

            return {
              ...prevMenu,
              categories: (prevMenu.categories ?? []).filter((category) => category.id !== categoryId),
            }
          })
        }

        // Si la categoría seleccionada es la que se eliminó, limpiarla
        if (selectedCategory?.id === categoryId) {
          setSelectedCategory(null)
        }

        toast("Categoría eliminada correctamente")

        return true
      } catch (error) {
        console.error("Error en deleteCategory:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar la categoría",
        })
        return false
      }
    },
    [selectedMenu, selectedCategory],
  )

  // Reordenar categorías
  const reorderCategories = useCallback(
    async (orderedIds: string[]): Promise<boolean> => {
      try {
        const supabase = createBrowserSupabaseClient()

        // Crear un array de actualizaciones para cada categoría con su nuevo orden
        const updates = orderedIds.map((id, index) => {
          return supabase.from("menu_categories").update({ order: index }).eq("id", id)
        })

        // Ejecutar todas las actualizaciones en paralelo
        await Promise.all(updates)

        // Actualizar estado (asumiendo que tenemos las categorías en el estado)
        if (selectedMenu) {
          // Crear un mapa para el nuevo orden
          const orderMap = new Map<string, number>()
          orderedIds.forEach((id, index) => {
            orderMap.set(id, index)
          })

          // Actualizar el menú seleccionado
          setSelectedMenu((prevMenu) => {
            if (!prevMenu) return null

            // Ordenar las categorías según el nuevo orden
            const sortedCategories = [...(prevMenu.categories ?? [])].sort((a, b) => {
              const orderA = orderMap.get(a.id) ?? 999
              const orderB = orderMap.get(b.id) ?? 999
              return orderA - orderB
            })

            return {
              ...prevMenu,
              categories: sortedCategories,
            }
          })

          // Actualizar los menús
          setMenus((prevMenus) =>
            prevMenus.map((menu) => {
              if (menu.id === selectedMenu.id) {
                // Ordenar las categorías según el nuevo orden
                const sortedCategories = [...(menu.categories ?? [])].sort((a, b) => {
                  const orderA = orderMap.get(a.id) ?? 999
                  const orderB = orderMap.get(b.id) ?? 999
                  return orderA - orderB
                })

                return {
                  ...menu,
                  categories: sortedCategories,
                }
              }
              return menu
            }),
          )
        }

        return true
      } catch (error) {
        console.error("Error en reorderCategories:", error)
        toast({
          title: "Error",
          description: "No se pudieron reordenar las categorías",
          variant: "destructive",
        })

        return false
      }
    },
    [selectedMenu],
  )

  // Crear un ítem de menú
  const createMenuItem = useCallback(
    async (itemData: NewMenuItemFormData): Promise<boolean> => {
      try {
        const supabase = createBrowserSupabaseClient()

        // Verificar si ya existe un ítem con el mismo nombre en la misma categoría
        if (
          itemData.name &&
          selectedCategory?.items?.some((item) => item.name.toLowerCase() === itemData.name.toLowerCase())
        ) {
          throw new Error(`Ya existe un ítem con el nombre "${itemData.name}" en esta categoría`)
        }

        // Crear ítem
        const { data, error } = await supabase.from("menu_items").insert(itemData).select().single()

        if (error) {
          // Verificar si es un error de duplicado
          if (
            error.message.includes("duplicate") ||
            error.message.includes("unique constraint") ||
            error.message.includes("unique_item_per_category")
          ) {
            throw new Error(`Ya existe un ítem con el nombre "${itemData.name}" en esta categoría`)
          }

          throw error
        }

        // Actualizar estado
        setMenuItems((prevItems) => [...prevItems, data])

        // Actualizar categoría seleccionada si corresponde
        if (selectedCategory && selectedCategory.id === itemData.category_id) {
          setSelectedCategory((prevCategory) => {
            if (!prevCategory) return null

            return {
              ...prevCategory,
              items: [...(prevCategory.items || []), data],
            }
          })
        }

        // Actualizar menú seleccionado si corresponde
        if (selectedMenu) {
          setSelectedMenu((prevMenu) => {
            if (!prevMenu) return null

            return {
              ...prevMenu,
              categories: (prevMenu.categories ?? []).map((category) => {
                if (category.id === itemData.category_id) {
                  return {
                    ...category,
                    items: [...(category.items || []), data],
                  }
                }
                return category
              }),
            }
          })
        }

        // Actualizar menús
        setMenus((prevMenus) =>
          prevMenus.map((menu) => {
            return {
              ...menu,
              categories: (menu.categories ?? []).map((category) => {
                if (category.id === itemData.category_id) {
                  return {
                    ...category,
                    items: [...(category.items || []), data],
                  }
                }
                return category
              }),
            }
          }),
        )

        toast({
          title: "Éxito",
          description: "Ítem creado correctamente",
        })

        return true
      } catch (error) {
        console.error("Error en createMenuItem:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Error al crear el ítem",
          variant: "destructive",
        })

        return false
      }
    },
    [selectedCategory, selectedMenu],
  )

  // Actualizar un ítem de menú
  const updateMenuItem = useCallback(
    async (itemId: string, itemData: Partial<MenuItem>): Promise<boolean> => {
      try {
        const supabase = createBrowserSupabaseClient()

        // Actualizar ítem
        const { data, error } = await supabase.from("menu_items").update(itemData).eq("id", itemId).select().single()

        if (error) {
          // Verificar si es un error de duplicado
          if (
            error.message.includes("duplicate") ||
            error.message.includes("unique constraint") ||
            error.message.includes("unique_item_per_category")
          ) {
            throw new Error(`Ya existe un ítem con este nombre en esta categoría`)
          }

          throw error
        }

        // Actualizar estado
        setMenuItems((prevItems) => prevItems.map((item) => (item.id === itemId ? { ...item, ...data } : item)))

        // Actualizar categoría seleccionada si corresponde
        if (selectedCategory?.items?.some((item) => item.id === itemId)) {
          setSelectedCategory((prevCategory) => {
            if (!prevCategory) return null

            return {
              ...prevCategory,
              items: (prevCategory.items ?? []).map((item) => (item.id === itemId ? { ...item, ...data } : item)),
            }
          })
        }

        // Actualizar menú seleccionado si corresponde
        if (selectedMenu) {
          setSelectedMenu((prevMenu) => {
            if (!prevMenu) return null

            return {
              ...prevMenu,
              categories: (prevMenu.categories ?? []).map((category) => {
                if (category.items?.some((item) => item.id === itemId)) {
                  return {
                    ...category,
                    items: category.items.map((item) => (item.id === itemId ? { ...item, ...data } : item)),
                  }
                }
                return category
              }),
            }
          })
        }

        // Actualizar menús
        setMenus((prevMenus) =>
          prevMenus.map((menu) => {
            return {
              ...menu,
              categories: (menu.categories ?? []).map((category) => {
                if (category.items?.some((item) => item.id === itemId)) {
                  return {
                    ...category,
                    items: category.items.map((item) => (item.id === itemId ? { ...item, ...data } : item)),
                  }
                }
                return category
              }),
            }
          }),
        )

        // Actualizar ítem seleccionado si corresponde
        if (selectedMenuItem?.id === itemId) {
          setSelectedMenuItem((prev) => (prev ? { ...prev, ...data } : null))
        }

        toast({
          title: "Éxito",
          description: "Ítem actualizado correctamente",
        })

        return true
      } catch (error) {
        console.error("Error en updateMenuItem:", error)
        toast.error(error instanceof Error ? error.message : "Error al actualizar el ítem")

        return false
      }
    },
    [selectedCategory, selectedMenu, selectedMenuItem],
  )

  // Eliminar un ítem de menú
  const deleteMenuItem = useCallback(
    async (itemId: string): Promise<boolean> => {
      try {
        const supabase = createBrowserSupabaseClient()

        // Eliminar ítem
        const { error } = await supabase.from("menu_items").delete().eq("id", itemId)

        if (error) {
          throw error
        }

        // Actualizar estado
        setMenuItems((prevItems) => prevItems.filter((item) => item.id !== itemId))

        // Actualizar categoría seleccionada si corresponde
        if (selectedCategory?.items?.some((item) => item.id === itemId)) {
          setSelectedCategory((prevCategory) => {
            if (!prevCategory) return null

            return {
              ...prevCategory,
              items: (prevCategory.items ?? []).filter((item) => item.id !== itemId),
            }
          })
        }

        // Actualizar menú seleccionado si corresponde
        if (selectedMenu) {
          setSelectedMenu((prevMenu) => {
            if (!prevMenu) return null

            return {
              ...prevMenu,
              categories: (prevMenu.categories ?? []).map((category) => {
                if (category.items?.some((item) => item.id === itemId)) {
                  return {
                    ...category,
                    items: category.items.filter((item) => item.id !== itemId),
                  }
                }
                return category
              }),
            }
          })
        }

        // Actualizar menús
        setMenus((prevMenus) =>
          prevMenus.map((menu) => {
            return {
              ...menu,
              categories: (menu.categories ?? []).map((category) => {
                if (category.items?.some((item) => item.id === itemId)) {
                  return {
                    ...category,
                    items: category.items.filter((item) => item.id !== itemId),
                  }
                }
                return category
              }),
            }
          }),
        )

        // Si el ítem seleccionado es el que se eliminó, limpiarlo
        if (selectedMenuItem?.id === itemId) {
          setSelectedMenuItem(null)
        }

        toast({
          title: "Éxito",
          description: "Ítem eliminado correctamente",
        })

        return true
      } catch (error) {
        console.error("Error en deleteMenuItem:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar el ítem",
          variant: "destructive",
        })

        return false
      }
    },
    [selectedCategory, selectedMenu, selectedMenuItem],
  )

  // Reordenar ítems de menú
  const reorderMenuItems = useCallback(
    async (orderedIds: string[]): Promise<boolean> => {
      try {
        const supabase = createBrowserSupabaseClient()

        // Crear un array de actualizaciones para cada ítem con su nuevo orden
        const updates = orderedIds.map((id, index) => {
          return supabase.from("menu_items").update({ order: index }).eq("id", id)
        })

        // Ejecutar todas las actualizaciones en paralelo
        await Promise.all(updates)

        // Actualizar estado (asumiendo que tenemos los ítems en el estado)
        if (selectedCategory) {
          // Crear un mapa para el nuevo orden
          const orderMap = new Map<string, number>()
          orderedIds.forEach((id, index) => {
            orderMap.set(id, index)
          })

          // Actualizar la categoría seleccionada
          setSelectedCategory((prevCategory) => {
            if (!prevCategory) return null

            // Ordenar los ítems según el nuevo orden
            const sortedItems = [...(prevCategory.items ?? [])].sort((a, b) => {
              const orderA = orderMap.get(a.id) ?? 999
              const orderB = orderMap.get(b.id) ?? 999
              return orderA - orderB
            })

            return {
              ...prevCategory,
              items: sortedItems,
            }
          })

          // Actualizar el menú seleccionado si corresponde
          if (selectedMenu) {
            setSelectedMenu((prevMenu) => {
              if (!prevMenu) return null

              return {
                ...prevMenu,
                categories: (prevMenu.categories ?? []).map((category) => {
                  if (category.id === selectedCategory.id) {
                    // Ordenar los ítems según el nuevo orden
                    const sortedItems = [...(category.items ?? [])].sort((a, b) => {
                      const orderA = orderMap.get(a.id) ?? 999
                      const orderB = orderMap.get(b.id) ?? 999
                      return orderA - orderB
                    })

                    return {
                      ...category,
                      items: sortedItems,
                    }
                  }
                  return category
                }),
              }
            })
          }

          // Actualizar los menús
          setMenus((prevMenus) =>
            prevMenus.map((menu) => {
              return {
                ...menu,
                categories: (menu.categories ?? []).map((category) => {
                  if (category.id === selectedCategory.id) {
                    // Ordenar los ítems según el nuevo orden
                    const sortedItems = [...(category.items ?? [])].sort((a, b) => {
                      const orderA = orderMap.get(a.id) ?? 999
                      const orderB = orderMap.get(b.id) ?? 999
                      return orderA - orderB
                    })

                    return {
                      ...category,
                      items: sortedItems,
                    }
                  }
                  return category
                }),
              }
            }),
          )
        }

        return true
      } catch (error) {
        console.error("Error en reorderMenuItems:", error)
        toast({
          title: "Error",
          description: "No se pudieron reordenar los ítems",
          variant: "destructive",
        toast.error("No se pudieron reordenar los ítems")
    [selectedCategory, selectedMenu],
  )

  // Actualizar configuración de tema
  const updateThemeSettings = useCallback(
    async (menuId: string, themeData: Partial<ThemeSettings>): Promise<boolean> => {
      try {
        const supabase = createBrowserSupabaseClient()

        // Verificar si ya existe una configuración de tema para este menú
        const { data: existingTheme, error: checkError } = await supabase
          .from("theme_settings")
          .select("*")
          .eq("menu_id", menuId)
          .maybeSingle()

        if (checkError && checkError.code !== "PGRST116") {
          throw checkError
        }

        let data

        if (existingTheme) {
          // Actualizar la configuración existente
          const { data: updatedData, error } = await supabase
            .from("theme_settings")
            .update(themeData)
            .eq("id", existingTheme.id)
            .select()
            .single()

          if (error) {
            throw error
          }

          data = updatedData
        } else {
          // Crear una nueva configuración
          const newThemeData = {
            menu_id: menuId,
            primary_color: themeData.primary_color || "#4f46e5",
            secondary_color: themeData.secondary_color || "#f9fafb",
            font_family: themeData.font_family || "Inter, sans-serif",
            logo_url: themeData.logo_url || null,
            background_image_url: themeData.background_image_url || null,
            show_prices: themeData.show_prices !== undefined ? themeData.show_prices : true,
            enable_ordering: themeData.enable_ordering !== undefined ? themeData.enable_ordering : true,
            header_style: themeData.header_style || "default",
            footer_style: themeData.footer_style || "default",
            item_layout: themeData.item_layout || "grid",
          }

          const { data: newData, error } = await supabase.from("theme_settings").insert(newThemeData).select().single()

          if (error) {
            throw error
          }

          data = newData
        }

        // Actualizar estado
        setThemeSettings(data)

        // Actualizar menú seleccionado si corresponde
        if (selectedMenu?.id === menuId) {
          setSelectedMenu((prevMenu) => {
            if (!prevMenu) return null

            return {
              ...prevMenu,
              theme: data,
            }
          })
        }

        // Actualizar menús
        setMenus((prevMenus) =>
          prevMenus.map((menu) => {
            if (menu.id === menuId) {
              return {
                ...menu,
                theme: data,
              }
            }
            return menu
          }),
        )

        toast({
          title: "Éxito",
          description: "Configuración de tema actualizada correctamente",
        })

        return true
      } catch (error) {
        console.error("Error en updateThemeSettings:", error)
        toast({
          title: "Error",
          description: "No se pudo actualizar la configuración de tema",
          variant: "destructive",
        })

        return false
      }
    },
    [selectedMenu],
  )

  // Utilidades
  const resetMenuForm = useCallback(() => {
    // Implementar si es necesario
  }, [])

  const resetNewCategoryForm = useCallback(() => {
    // Implementar si es necesario
  }, [])

  const resetNewMenuItemForm = useCallback(() => {
    // Implementar si es necesario
  }, [])

  // Valor del contexto
  const contextValue: MenuDataContextType = {
    // Estado
    menus,
    categories,
    menuItems,
    selectedMenu,
    selectedCategory,
    selectedMenuItem,
    themeSettings,
    isLoading,

    // Setters
    setMenus,
    setCategories,
    setMenuItems,
    setSelectedMenu,
    setSelectedCategory,
    setSelectedMenuItem,
    setThemeSettings,

    // Acciones para menús
    loadMenus,
    loadBranchMenus,
    getMenuById,
    createMenu,
    updateMenu,
    deleteMenu,

    // Acciones para categorías
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,

    // Acciones para ítems de menú
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    reorderMenuItems,

    // Acciones para temas
    updateThemeSettings,

    // Utilidades
    resetMenuForm,
    resetNewCategoryForm,
    resetNewMenuItemForm,
  }

  return <MenuDataContext.Provider value={contextValue}>{children}</MenuDataContext.Provider>
}

// Hook para usar el contexto
export function useMenuData() {
  const context = useContext(MenuDataContext)

  if (context === undefined) {
    throw new Error("useMenuData debe usarse dentro de un MenuDataProvider")
  }

  return context
}
