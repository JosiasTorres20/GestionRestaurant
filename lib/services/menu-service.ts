import { createServerSupabaseClient, createBrowserSupabaseClient } from "@/lib/supabase"
import type {
  Menu,
  Category,
  MenuItem,
  ThemeSettings,
  NewMenuFormData,
  NewCategoryFormData,
  NewMenuItemFormData,
} from "@/types"

// Función para obtener el cliente Supabase adecuado según el entorno
const getSupabase = () => {
  if (typeof window === "undefined") {
    return createServerSupabaseClient()
  }
  return createBrowserSupabaseClient()
}

// Tema por defecto
const DEFAULT_THEME: ThemeSettings = {
  id: "",
  menu_id: "",
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

// Obtener todos los menús de un restaurante
export async function getMenus(restaurantId: string): Promise<Menu[]> {
  const supabase = getSupabase()

  try {
    // 1. Obtener los menús
    const { data: menusData, error: menusError } = await supabase
      .from("menus")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })

    if (menusError) {
      console.error("Error al obtener menús:", menusError)
      throw menusError
    }

    if (!menusData || menusData.length === 0) {
      return []
    }

    // 2. Obtener todas las categorías para los menús
    const menuIds = menusData.map((menu) => menu.id)
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("menu_categories")
      .select("*")
      .in("menu_id", menuIds)
      .order("order", { ascending: true })

    if (categoriesError) {
      console.error("Error al obtener categorías:", categoriesError)
      throw categoriesError
    }

    // 3. Obtener todos los items para las categorías
    const categoryIds = categoriesData?.length > 0 ? categoriesData.map((category) => category.id) : []

    let itemsData: MenuItem[] = []

    if (categoryIds.length > 0) {
      const { data: menuItemsData, error: itemsError } = await supabase
        .from("menu_items")
        .select("*")
        .in("category_id", categoryIds)
        .order("order", { ascending: true })

      if (itemsError) {
        console.error("Error al obtener ítems del menú:", itemsError)
        throw itemsError
      }

      itemsData = menuItemsData || []
    }

    // 4. Obtener la configuración de tema
    const { data: themesData, error: themesError } = await supabase
      .from("theme_settings")
      .select("*")
      .in("menu_id", menuIds)

    if (themesError && themesError.code !== "PGRST116") {
      console.error("Error al obtener configuraciones de tema:", themesError)
      // No lanzar error, simplemente continuar con temas por defecto
    }

    // 5. Construir los menús completos
    const menus: Menu[] = menusData.map((menu) => {
      // Filtrar categorías para este menú
      const menuCategories = categoriesData ? categoriesData.filter((category) => category.menu_id === menu.id) : []

      // Para cada categoría, asignar sus items
      const categoriesWithItems = menuCategories.map((category) => {
        const categoryItems = itemsData.filter((item) => item.category_id === category.id)
        return {
          ...category,
          items: categoryItems,
        }
      })

      // Buscar el tema para este menú
      const menuTheme = themesData ? themesData.find((theme) => theme.menu_id === menu.id) : null

      return {
        ...menu,
        categories: categoriesWithItems,
        theme: menuTheme || { ...DEFAULT_THEME, menu_id: menu.id },
      }
    })

    return menus
  } catch (error) {
    console.error("Error en getMenus:", error)
    throw error
  }
}

// Obtener todos los menús de una sucursal
export async function getBranchMenus(branchId: string): Promise<Menu[]> {
  const supabase = getSupabase()

  try {
    // 1. Obtener los menús
    const { data: menusData, error: menusError } = await supabase
      .from("menus")
      .select("*")
      .eq("branch_id", branchId)
      .order("created_at", { ascending: false })

    if (menusError) {
      console.error("Error al obtener menús de sucursal:", menusError)
      throw menusError
    }

    if (!menusData || menusData.length === 0) {
      return []
    }

    // 2. Obtener todas las categorías para los menús
    const menuIds = menusData.map((menu) => menu.id)
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("menu_categories")
      .select("*")
      .in("menu_id", menuIds)
      .order("order", { ascending: true })

    if (categoriesError) {
      console.error("Error al obtener categorías:", categoriesError)
      throw categoriesError
    }

    // 3. Obtener todos los items para las categorías
    const categoryIds = categoriesData?.length > 0 ? categoriesData.map((category) => category.id) : []

    let itemsData: MenuItem[] = []

    if (categoryIds.length > 0) {
      const { data: menuItemsData, error: itemsError } = await supabase
        .from("menu_items")
        .select("*")
        .in("category_id", categoryIds)
        .order("order", { ascending: true })

      if (itemsError) {
        console.error("Error al obtener ítems del menú:", itemsError)
        throw itemsError
      }

      itemsData = menuItemsData || []
    }

    // 4. Obtener la configuración de tema
    const { data: themesData, error: themesError } = await supabase
      .from("theme_settings")
      .select("*")
      .in("menu_id", menuIds)

    if (themesError && themesError.code !== "PGRST116") {
      console.error("Error al obtener configuraciones de tema:", themesError)
      // No lanzar error, simplemente continuar con temas por defecto
    }

    // 5. Construir los menús completos
    const menus: Menu[] = menusData.map((menu) => {
      // Filtrar categorías para este menú
      const menuCategories = categoriesData ? categoriesData.filter((category) => category.menu_id === menu.id) : []

      // Para cada categoría, asignar sus items
      const categoriesWithItems = menuCategories.map((category) => {
        const categoryItems = itemsData.filter((item) => item.category_id === category.id)
        return {
          ...category,
          items: categoryItems,
        }
      })

      // Buscar el tema para este menú
      const menuTheme = themesData ? themesData.find((theme) => theme.menu_id === menu.id) : null

      return {
        ...menu,
        categories: categoriesWithItems,
        theme: menuTheme || { ...DEFAULT_THEME, menu_id: menu.id },
      }
    })

    return menus
  } catch (error) {
    console.error("Error en getBranchMenus:", error)
    throw error
  }
}

// Obtener un menú específico por ID
export async function getMenu(menuId: string): Promise<Menu | null> {
  const supabase = getSupabase()

  try {
    // 1. Obtener el menú
    const { data: menuData, error: menuError } = await supabase.from("menus").select("*").eq("id", menuId).single()

    if (menuError) {
      if (menuError.code === "PGRST116") {
        return null // No se encontró el menú
      }
      console.error("Error al obtener menú:", menuError)
      throw menuError
    }

    // 2. Obtener las categorías para este menú
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("menu_categories")
      .select("*")
      .eq("menu_id", menuId)
      .order("order", { ascending: true })

    if (categoriesError) {
      console.error("Error al obtener categorías:", categoriesError)
      throw categoriesError
    }

    // 3. Si hay categorías, obtener los items para esas categorías
    let itemsData: MenuItem[] = []

    if (categoriesData && categoriesData.length > 0) {
      const categoryIds = categoriesData.map((category) => category.id)

      const { data: menuItemsData, error: itemsError } = await supabase
        .from("menu_items")
        .select("*")
        .in("category_id", categoryIds)
        .order("order", { ascending: true })

      if (itemsError) {
        console.error("Error al obtener ítems del menú:", itemsError)
        throw itemsError
      }

      itemsData = menuItemsData || []
    }

    // 4. Obtener la configuración de tema
    const { data: themeData, error: themeError } = await supabase
      .from("theme_settings")
      .select("*")
      .eq("menu_id", menuId)
      .maybeSingle()

    if (themeError && themeError.code !== "PGRST116") {
      console.error("Error al obtener configuración de tema:", themeError)
      // No lanzar error, simplemente continuar con tema por defecto
    }

    // 5. Construir las categorías con sus items
    const categoriesWithItems = categoriesData.map((category) => {
      const categoryItems = itemsData.filter((item) => item.category_id === category.id)
      return {
        ...category,
        items: categoryItems,
      }
    })

    // 6. Construir el menú completo
    const menu: Menu = {
      ...menuData,
      categories: categoriesWithItems,
      theme: themeData || { ...DEFAULT_THEME, menu_id: menuId },
    }

    return menu
  } catch (error) {
    console.error("Error en getMenu:", error)
    throw error
  }
}

// Crear un nuevo menú
export async function createMenu(menuData: NewMenuFormData): Promise<Menu> {
  const supabase = getSupabase()

  try {
    // Crear el menú
    const { data, error } = await supabase.from("menus").insert(menuData).select().single()

    if (error) {
      console.error("Error al crear menú:", error)

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
      console.error("Error al crear configuración de tema:", themeError)
      // No lanzar error aquí para no interrumpir la creación del menú
    }

    return data
  } catch (error) {
    console.error("Error en createMenu:", error)
    throw error
  }
}

// Actualizar un menú existente
export async function updateMenu(menuId: string, menuData: Partial<Menu>): Promise<Menu> {
  const supabase = getSupabase()

  try {
    // Filtrar propiedades que no pertenecen a la tabla menus
    const { categories, theme, ...cleanMenuData } = menuData as any

    // Actualizar el menú
    const { data, error } = await supabase.from("menus").update(cleanMenuData).eq("id", menuId).select().single()

    if (error) {
      console.error("Error al actualizar menú:", error)

      // Verificar si es un error de duplicado
      if (error.message.includes("duplicate") || error.message.includes("unique constraint")) {
        throw new Error(`Ya existe un menú con este nombre en esta sucursal`)
      }

      throw error
    }

    return data
  } catch (error) {
    console.error("Error en updateMenu:", error)
    throw error
  }
}

// Eliminar un menú
export async function deleteMenu(menuId: string): Promise<boolean> {
  const supabase = getSupabase()

  try {
    // Eliminar el menú
    const { error } = await supabase.from("menus").delete().eq("id", menuId)

    if (error) {
      console.error("Error al eliminar menú:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Error en deleteMenu:", error)
    throw error
  }
}

// Crear una nueva categoría
export async function createCategory(categoryData: NewCategoryFormData): Promise<Category> {
  const supabase = getSupabase()

  try {
    // Asegurarse de que menu_id esté presente
    if (!categoryData.menu_id) {
      throw new Error("El ID del menú es obligatorio para crear una categoría")
    }

    // Crear la categoría
    const { data, error } = await supabase.from("menu_categories").insert(categoryData).select().single()

    if (error) {
      console.error("Error al crear categoría:", error)

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

    return data
  } catch (error) {
    console.error("Error en createCategory:", error)
    throw error
  }
}

// Actualizar una categoría existente
export async function updateCategory(categoryId: string, categoryData: Partial<Category>): Promise<Category> {
  const supabase = getSupabase()

  try {
    // Filtrar propiedades que no pertenecen a la tabla menu_categories
    const { items, ...cleanCategoryData } = categoryData as any

    // Actualizar la categoría
    const { data, error } = await supabase
      .from("menu_categories")
      .update(cleanCategoryData)
      .eq("id", categoryId)
      .select()
      .single()

    if (error) {
      console.error("Error al actualizar categoría:", error)

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

    return data
  } catch (error) {
    console.error("Error en updateCategory:", error)
    throw error
  }
}

// Eliminar una categoría
export async function deleteCategory(categoryId: string): Promise<boolean> {
  const supabase = getSupabase()

  try {
    // Eliminar la categoría
    const { error } = await supabase.from("menu_categories").delete().eq("id", categoryId)

    if (error) {
      console.error("Error al eliminar categoría:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Error en deleteCategory:", error)
    throw error
  }
}

// Reordenar categorías
export async function reorderCategories(orderedIds: string[]): Promise<boolean> {
  const supabase = getSupabase()

  try {
    // Crear un array de actualizaciones para cada categoría con su nuevo orden
    const updates = orderedIds.map((id, index) => {
      return supabase.from("menu_categories").update({ order: index }).eq("id", id)
    })

    // Ejecutar todas las actualizaciones en paralelo
    await Promise.all(updates)
    return true
  } catch (error) {
    console.error("Error al reordenar categorías:", error)
    throw error
  }
}

// Crear un nuevo ítem de menú
export async function createMenuItem(itemData: NewMenuItemFormData): Promise<MenuItem> {
  const supabase = getSupabase()

  try {
    // Crear el ítem
    const { data, error } = await supabase.from("menu_items").insert(itemData).select().single()

    if (error) {
      console.error("Error al crear ítem de menú:", error)

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

    return data
  } catch (error) {
    console.error("Error en createMenuItem:", error)
    throw error
  }
}

// Actualizar un ítem de menú existente
export async function updateMenuItem(itemId: string, itemData: Partial<MenuItem>): Promise<MenuItem> {
  const supabase = getSupabase()

  try {
    // Actualizar el ítem
    const { data, error } = await supabase.from("menu_items").update(itemData).eq("id", itemId).select().single()

    if (error) {
      console.error("Error al actualizar ítem de menú:", error)

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

    return data
  } catch (error) {
    console.error("Error en updateMenuItem:", error)
    throw error
  }
}

// Eliminar un ítem de menú
export async function deleteMenuItem(itemId: string): Promise<boolean> {
  const supabase = getSupabase()

  try {
    // Eliminar el ítem
    const { error } = await supabase.from("menu_items").delete().eq("id", itemId)

    if (error) {
      console.error("Error al eliminar ítem de menú:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Error en deleteMenuItem:", error)
    throw error
  }
}

// Reordenar ítems de menú
export async function reorderMenuItems(orderedIds: string[]): Promise<boolean> {
  const supabase = getSupabase()

  try {
    // Crear un array de actualizaciones para cada ítem con su nuevo orden
    const updates = orderedIds.map((id, index) => {
      return supabase.from("menu_items").update({ order: index }).eq("id", id)
    })

    // Ejecutar todas las actualizaciones en paralelo
    await Promise.all(updates)
    return true
  } catch (error) {
    console.error("Error al reordenar ítems de menú:", error)
    throw error
  }
}

// Actualizar configuración de tema
export async function updateThemeSettings(menuId: string, themeData: Partial<ThemeSettings>): Promise<ThemeSettings> {
  const supabase = getSupabase()

  try {
    // Verificar si ya existe una configuración de tema para este menú
    const { data: existingTheme, error: checkError } = await supabase
      .from("theme_settings")
      .select("*")
      .eq("menu_id", menuId)
      .maybeSingle()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error al verificar configuración de tema existente:", checkError)
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
        console.error("Error al actualizar configuración de tema:", error)
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
        console.error("Error al crear configuración de tema:", error)
        throw error
      }

      data = newData
    }

    return data
  } catch (error) {
    console.error("Error en updateThemeSettings:", error)
    throw error
  }
}
