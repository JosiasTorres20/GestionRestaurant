import * as z from "zod"

// Esquema de validación para menú
export const menuSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
})

// Esquema de validación para categoría
export const categorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  order: z.number().optional(),
})

// Esquema de validación para ítem de menú
export const menuItemSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
  image_url: z.string().optional().nullable(),
  is_available: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  order: z.number().optional(),
})

// Esquema de validación para configuración de tema
export const themeSettingsSchema = z.object({
  primary_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color inválido"),
  secondary_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color inválido"),
  font_family: z.string().default("Inter, sans-serif"),
  logo_url: z.string().nullable().optional(),
  background_image_url: z.string().nullable().optional(),
  show_prices: z.boolean().default(true),
  enable_ordering: z.boolean().default(true),
  header_style: z.enum(["default", "minimal", "fullwidth"]).default("default"),
  footer_style: z.enum(["default", "minimal", "detailed"]).default("default"),
  item_layout: z.enum(["grid", "list", "compact"]).default("grid"),
})

// Esquema de validación para usuario
export const userSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  role: z.enum(["admin", "manager", "staff"]),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

// Esquema de validación para configuración de restaurante
export const restaurantSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  logo_url: z.string().optional(),
  currency: z.string().default("EUR"),
  tax_percentage: z.coerce.number().min(0).max(100).default(0),
})

// Esquema de validación para orden
export const orderSchema = z.object({
  customer_name: z.string().min(1, "El nombre es requerido"),
  customer_email: z.string().email("Email inválido").optional(),
  customer_phone: z.string().optional(),
  delivery_address: z.string().optional(),
  order_type: z.enum(["delivery", "pickup", "dine_in"]),
  table_number: z.string().optional(),
  notes: z.string().optional(),
})
