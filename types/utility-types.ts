import type { Menu, Category, MenuItem, ThemeSettings, Branch } from "./index"

// Tipo de utilidad para manejar propiedades adicionales
export type WithExtraProps<T, E> = T & E

// Tipo para menú con todas sus relaciones
export interface MenuWithRelations extends Menu {
  categories?: Category[]
  branch?: Branch | { id: string; name: string; is_main: boolean; whatsapp?: string }
  branches?: { id: string; name: string; is_main: boolean; whatsapp?: string }
  theme?: ThemeSettings | null
  menu_categories?: Category[]
  theme_settings?: ThemeSettings
}

// Tipo para categoría con sus relaciones
export interface CategoryWithRelations extends Category {
  items?: MenuItem[]
  menu_items?: MenuItem[]
}
