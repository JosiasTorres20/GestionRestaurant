export enum UserRole {
  ROOT_ADMIN = "root_admin",
  RESTAURANT_ADMIN = "restaurant_admin",
  KITCHEN = "kitchen",
}

export type Restaurant = {
  id: string
  name: string
  logo_url: string | null
  primary_color: string | null
  secondary_color: string | null
  created_at: string
  updated_at: string
  address: string | null
  phone: string | null
  whatsapp: string | null
  is_active: boolean
}

export interface Menu {
  id: string
  name: string
  description?: string | null
  is_active: boolean
  branch_id: string
  restaurant_id?: string
  created_at?: string
  updated_at?: string | null
  categories?: Category[]
  branches?: {
    id: string
    name: string
    is_main: boolean
    whatsapp?: string
  }
  branch?: {
    id: string
    name: string
    is_main: boolean
    whatsapp?: string
  }
  theme?: ThemeSettings | null
}

export interface Category {
  id: string
  name: string
  description?: string | null
  order?: number
  restaurant_id: string
  branch_id: string
  // Eliminamos menu_id ya que no existe en la tabla
  created_at?: string
  updated_at?: string | null
  items?: MenuItem[]
  menu_items?: MenuItem[] // Para respuesta de Supabase
}

export interface MenuItem {
  id: string
  name: string
  description?: string | null
  price: number
  image_url?: string | null
  is_available: boolean
  is_featured?: boolean
  category_id: string
  order?: number
  created_at?: string
  updated_at?: string | null
}

// Nuevo tipo para configuración de temas
export interface ThemeSettings {
  id?: string
  menu_id: string
  primary_color: string
  secondary_color: string
  font_family: string
  logo_url: string | null
  background_image_url: string | null
  show_prices: boolean
  enable_ordering: boolean
  header_style: "default" | "minimal" | "fullwidth"
  footer_style: "default" | "minimal" | "detailed"
  item_layout: "grid" | "list" | "compact"
  created_at?: string
  updated_at?: string | null
}

// Tipo para sucursales
export interface Branch {
  id: string
  restaurant_id: string
  name: string
  address?: string
  phone?: string
  whatsapp?: string
  email?: string
  is_main: boolean
  is_active: boolean
  created_at?: string
  updated_at?: string
}

// Tipos para formularios
export type NewMenuFormData = {
  name: string
  description: string
  is_active: boolean
  restaurant_id?: string
  branch_id?: string
}

export type NewCategoryFormData = {
  name: string
  description: string
  restaurant_id?: string
  branch_id?: string
  order?: number
  menu_id: string
}

export type NewMenuItemFormData = {
  name: string
  description: string
  price: number
  image_url: string
  is_available: boolean
  is_featured?: boolean
  category_id?: string
  order?: number
}

export type BranchFormData = {
  name: string
  address: string
  phone: string
  whatsapp: string
  email: string
  is_main: boolean
  is_active: boolean
  location?: {
    latitude: number
    longitude: number
  }
}

export type Order = {
  id: string
  restaurant_id: string
  customer_name: string
  customer_phone: string
  status: OrderStatus
  total: number
  created_at: string
  updated_at: string
  items: OrderItem[]
}

export type OrderItem = {
  id: string
  order_id: string
  menu_item_id: string
  quantity: number
  price: number
  notes: string | null
  menu_item: MenuItem
}

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PREPARING = "preparing",
  READY = "ready",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}
