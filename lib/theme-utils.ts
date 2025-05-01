import type { Restaurant } from "./services/restaurant-service"

export function applyRestaurantTheme(restaurant: Restaurant | null) {
  if (!restaurant) return

  // Apply primary color
  if (restaurant.primary_color) {
    document.documentElement.style.setProperty("--brand-primary", restaurant.primary_color)

    // Convert hex to RGB for opacity variants
    const primaryRgb = hexToRgb(restaurant.primary_color)
    if (primaryRgb) {
      document.documentElement.style.setProperty(
        "--brand-primary-rgb",
        `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`,
      )
    }
  }

  // Apply secondary color
  if (restaurant.secondary_color) {
    document.documentElement.style.setProperty("--brand-secondary", restaurant.secondary_color)

    // Convert hex to RGB for opacity variants
    const secondaryRgb = hexToRgb(restaurant.secondary_color)
    if (secondaryRgb) {
      document.documentElement.style.setProperty(
        "--brand-secondary-rgb",
        `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`,
      )
    }
  }
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null
}
