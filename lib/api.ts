import { createClient } from "@/lib/supabase";
import { Menu, Submenu, MenuItem } from "@/types";

// Tipos para los parámetros de las funciones
type MenuData = Omit<Menu, "id" | "created_at" | "submenus">;
type SubmenuData = Omit<Submenu, "id" | "created_at" | "items">;
type MenuItemData = Omit<MenuItem, "id" | "created_at">;

// Funciones para el menú
export async function getMenus(restaurantId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("menus")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getMenuWithItems(menuId: string) {
  const supabase = createClient();

  // Obtener el menú
  const { data: menu, error: menuError } = await supabase
    .from("menus")
    .select("*")
    .eq("id", menuId)
    .single();

  if (menuError) throw menuError;

  // Obtener los submenús
  const { data: submenus, error: submenusError } = await supabase
    .from("submenus")
    .select("*")
    .eq("menu_id", menuId)
    .order("order", { ascending: true });

  if (submenusError) throw submenusError;

  // Obtener los items para todos los submenús
  const submenuIds = submenus.map(submenu => submenu.id);
  
  const { data: items, error: itemsError } = await supabase
    .from("menu_items")
    .select("*")
    .in("submenu_id", submenuIds)
    .order("order", { ascending: true });

  if (itemsError) throw itemsError;

  // Organizar los items por submenú
  const submenusWithItems = submenus.map(submenu => ({
    ...submenu,
    items: items.filter(item => item.submenu_id === submenu.id)
  }));

  return { 
    ...menu, 
    submenus: submenusWithItems 
  };
}

export async function createMenu(data: MenuData): Promise<Menu> {
  const supabase = createClient();

  const { data: newMenu, error } = await supabase
    .from("menus")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return newMenu;
}

export async function updateMenu(id: string, data: Partial<MenuData>): Promise<Menu> {
  const supabase = createClient();

  const { data: updatedMenu, error } = await supabase
    .from("menus")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return updatedMenu;
}

export async function deleteMenu(id: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("menus")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

// Funciones para los submenús
export async function createSubmenu(data: SubmenuData): Promise<Submenu> {
  const supabase = createClient();

  const { data: newSubmenu, error } = await supabase
    .from("submenus")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return newSubmenu;
}

export async function updateSubmenu(id: string, data: Partial<SubmenuData>): Promise<Submenu> {
  const supabase = createClient();

  const { data: updatedSubmenu, error } = await supabase
    .from("submenus")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return updatedSubmenu;
}

export async function deleteSubmenu(id: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("submenus")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

// Funciones para los items de menú
export async function createMenuItem(data: MenuItemData): Promise<MenuItem> {
  const supabase = createClient();

  const { data: newItem, error } = await supabase
    .from("menu_items")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return newItem;
}

export async function updateMenuItem(id: string, data: Partial<MenuItemData>): Promise<MenuItem> {
  const supabase = createClient();

  const { data: updatedItem, error } = await supabase
    .from("menu_items")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return updatedItem;
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("menu_items")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}
