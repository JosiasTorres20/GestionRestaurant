import { createClientSupabaseClient } from "@/lib/supabase"

export interface ThemeColors {
  primaryColor: string
  secondaryColor: string
}

export const ThemeService = {
  async getRestaurantColors(restaurantId: string): Promise<ThemeColors | null> {
    try {
      const supabase = createClientSupabaseClient()
      const { data, error } = await supabase
        .from("restaurants")
        .select("primary_color, secondary_color")
        .eq("id", restaurantId)
        .single()

      if (error) throw error

      return {
        primaryColor: data.primary_color || "#4f46e5",
        secondaryColor: data.secondary_color || "#f9fafb",
      }
    } catch (error) {
      console.error("Error al obtener colores del restaurante:", error)
      return null
    }
  },

  async updateRestaurantColors(
    restaurantId: string,
    colors: { primary_color?: string; secondary_color?: string },
  ): Promise<boolean> {
    try {
      const supabase = createClientSupabaseClient()
      const { error } = await supabase.from("restaurants").update(colors).eq("id", restaurantId)

      if (error) throw error

      return true
    } catch (error) {
      console.error("Error al actualizar colores del restaurante:", error)
      return false
    }
  },

  applyThemeColors(primaryColor: string, secondaryColor: string): void {
    document.documentElement.style.setProperty("--primary", primaryColor);
    document.documentElement.style.setProperty("--primary-foreground", this.getContrastColor(primaryColor));
    
    // Actualizar colores secundarios
    document.documentElement.style.setProperty("--secondary", secondaryColor);
    document.documentElement.style.setProperty("--secondary-foreground", this.getContrastColor(secondaryColor));
    
    // Actualizar colores de marca específicos
    document.documentElement.style.setProperty("--brand-primary", primaryColor);
    document.documentElement.style.setProperty("--brand-secondary", secondaryColor);
  },
  
  // Función para determinar si se debe usar texto claro u oscuro según el color de fondo
  getContrastColor(hexColor: string): string {
    // Convertir hex a RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calcular luminancia (fórmula estándar)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Usar texto blanco para fondos oscuros y texto negro para fondos claros
    return luminance > 0.5 ? "0 0% 0%" : "0 0% 100%";
  }
}
