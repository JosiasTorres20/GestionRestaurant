
import { createClientSupabaseClient } from "@/lib/supabase"
import type { Menu, Category } from "@/hooks/use-menu-data"
export type MenuCategory = {
  id: string
  restaurant_id: string
  name: string
  description: string | null
  order: number
  created_at: string
  updated_at: string
  items?: MenuItem[]
}

export type MenuItem = {
  id: string
  category_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  created_at: string
  updated_at: string
}



// Fetch all menus for a restaurant
export async function getMenus(restaurantId: string): Promise<Menu[]> {
  try {
    const supabase = createClientSupabaseClient()

    // Get all branches for this restaurant
    const { data: branches, error: branchesError } = await supabase
      .from("branches")
      .select("id")
      .eq("restaurant_id", restaurantId)

    if (branchesError) throw branchesError

    if (!branches || branches.length === 0) {
      return []
    }

    const branchIds = branches.map((branch) => branch.id)

    // Get all menus for these branches
    const { data: menus, error: menusError } = await supabase
      .from("menus")
      .select("*")
      .in("branch_id", branchIds)
      .order("created_at", { ascending: false })

    if (menusError) throw menusError

    return menus || []
  } catch (error) {
    console.error("Error fetching menus:", error)
    throw error
  }
}

// Fetch all categories for a restaurant
export async function getCategories(restaurantId: string): Promise<Category[]> {
  try {
    const supabase = createClientSupabaseClient()

    const { data, error } = await supabase
      .from("menu_categories")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching categories:", error)
    throw error
  }
}

// Fetch all menu items for a category
export async function getMenuItems(categoryId: string): Promise<MenuItem[]> {
  try {
    const supabase = createClientSupabaseClient()

    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching menu items:", error)
    throw error
  }
}

// Create a new menu
export async function createMenu(menu: Partial<Menu>): Promise<Menu> {
  try {
    const supabase = createClientSupabaseClient()

    const { data, error } = await supabase
      .from("menus")
      .insert({
        name: menu.name,
        description: menu.description || null,
        branch_id: menu.branch_id,
        is_active: menu.is_active,
      })
      .select()

    if (error) throw error

    if (!data || data.length === 0) {
      throw new Error("No data returned after creating menu")
    }

    return data[0]
  } catch (error) {
    console.error("Error creating menu:", error)
    throw error
  }
}

// Update an existing menu
export async function updateMenu(menu: Menu): Promise<void> {
  try {
    const supabase = createClientSupabaseClient()

    const { error } = await supabase
      .from("menus")
      .update({
        name: menu.name,
        description: menu.description || null,
        branch_id: menu.branch_id,
        is_active: menu.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", menu.id)

    if (error) throw error
  } catch (error) {
    console.error("Error updating menu:", error)
    throw error
  }
}

// Delete a menu
export async function deleteMenu(menuId: string): Promise<void> {
  try {
    const supabase = createClientSupabaseClient()

    const { error } = await supabase.from("menus").delete().eq("id", menuId)

    if (error) throw error
  } catch (error) {
    console.error("Error deleting menu:", error)
    throw error
  }
}

// Create a new category
export async function createCategory(category: Partial<Category>): Promise<Category> {
  try {
    const supabase = createClientSupabaseClient()

    const { data, error } = await supabase
      .from("menu_categories")
      .insert({
        name: category.name,
        description: category.description || null,
        restaurant_id: category.restaurant_id,
        branch_id: category.branch_id,
      })
      .select()

    if (error) throw error

    if (!data || data.length === 0) {
      throw new Error("No data returned after creating category")
    }

    return data[0]
  } catch (error) {
    console.error("Error creating category:", error)
    throw error
  }
}

// Update an existing category
export async function updateCategory(category: Category): Promise<void> {
  try {
    const supabase = createClientSupabaseClient()

    const { error } = await supabase
      .from("menu_categories")
      .update({
        name: category.name,
        description: category.description || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", category.id)

    if (error) throw error
  } catch (error) {
    console.error("Error updating category:", error)
    throw error
  }
}

// Delete a category
export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    const supabase = createClientSupabaseClient()

    const { error } = await supabase.from("menu_categories").delete().eq("id", categoryId)

    if (error) throw error
  } catch (error) {
    console.error("Error deleting category:", error)
    throw error
  }
}

// Create a new menu item
export async function createMenuItem(menuItem: Partial<MenuItem>): Promise<MenuItem> {
  try {
    const supabase = createClientSupabaseClient()

    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        name: menuItem.name,
        description: menuItem.description || null,
        price: menuItem.price,
        image_url: menuItem.image_url || null,
        is_available: menuItem.is_available,
        category_id: menuItem.category_id,
      })
      .select()

    if (error) throw error

    if (!data || data.length === 0) {
      throw new Error("No data returned after creating menu item")
    }

    return data[0]
  } catch (error) {
    console.error("Error creating menu item:", error)
    throw error
  }
}

// Update an existing menu item
export async function updateMenuItem(menuItem: MenuItem): Promise<void> {
  try {
    const supabase = createClientSupabaseClient()

    const { error } = await supabase
      .from("menu_items")
      .update({
        name: menuItem.name,
        description: menuItem.description || null,
        price: menuItem.price,
        image_url: menuItem.image_url || null,
        is_available: menuItem.is_available,
        updated_at: new Date().toISOString(),
      })
      .eq("id", menuItem.id)

    if (error) throw error
  } catch (error) {
    console.error("Error updating menu item:", error)
    throw error
  }
}

// Delete a menu item
export async function deleteMenuItem(menuItemId: string): Promise<void> {
  try {
    const supabase = createClientSupabaseClient()

    const { error } = await supabase.from("menu_items").delete().eq("id", menuItemId)

    if (error) throw error
  } catch (error) {
    console.error("Error deleting menu item:", error)
    throw error
  }
}
