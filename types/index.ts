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
export interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  image_url?: string
  is_available: boolean
  category_id: string
  submenu_id?: string | null
}

export type Submenu = {
  id: string
  name: string
  description: string
  menu_id: string
  order: number
  created_at: string
  items?: MenuItem[]
}

export type Menu = {
  items: boolean
  id: string
  name: string
  description: string
  restaurant_id: string
  branch_id?: string // Añadimos referencia a la sucursal
  is_active: boolean
  order: number
  created_at: string
  submenus?: Submenu[]
}

// Nuevo tipo para sucursales
export type Branch = {
  id: string
  name: string
  address: string
  phone: string
  whatsapp: string
  email: string
  is_main: boolean
  is_active: boolean
  restaurant_id: string
  created_at: string
  location?: {
    latitude: number
    longitude: number
  }
}

// Tipos para formularios
export type NewMenuFormData = {
  name: string
  description: string
  is_active: boolean
  restaurant_id?: string
  branch_id?: string // Añadimos campo para sucursal
}

export type NewSubmenuFormData = {
  name: string
  description: string
  menu_id: string
}

export type NewMenuItemFormData = {
  name: string
  description: string
  price: number
  image_url: string
  is_available: boolean
  submenu_id: string
  category_id?: string
}

// Nuevo tipo para formulario de sucursales
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
