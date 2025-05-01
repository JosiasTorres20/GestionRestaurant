"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientSupabaseClient } from "@/lib/supabase"

type ThemeProviderProps = {
  children: React.ReactNode
}

type ThemeContextType = {
  colors: {
    primaryColor: string
    secondaryColor: string
  }
  isLoading: boolean
  updateColors: (primary: string, secondary: string) => Promise<void>
  applyColorsToDOM: (primary: string, secondary: string) => void
}

const defaultColors = {
  primaryColor: "#4f46e5",
  secondaryColor: "#f9fafb",
}


const LOCAL_STORAGE_KEY = "restaurant-theme-colors"

const ThemeContext = createContext<ThemeContextType>({
  colors: defaultColors,
  isLoading: true,
  updateColors: async () => {},
  applyColorsToDOM: () => {},
})

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [colors, setColors] = useState(defaultColors)
  const [isLoading, setIsLoading] = useState(true)


  const applyColorsToDOM = (primary: string, secondary: string) => {
    // Aplicar colores a las variables CSS
    document.documentElement.style.setProperty("--primary", primary)
    document.documentElement.style.setProperty("--brand-primary", primary)
    document.documentElement.style.setProperty("--secondary", secondary)
    document.documentElement.style.setProperty("--brand-secondary", secondary)
    document.documentElement.style.setProperty("--color-primary", primary)
    document.documentElement.style.setProperty("--color-primary-foreground", "#ffffff")

    // Generar variantes de color para el tema
    const primaryDark = `color-mix(in srgb, ${primary} 70%, black)`
    const primaryLight = `color-mix(in srgb, ${primary} 20%, white)`

    // Aplicar variantes
    document.documentElement.style.setProperty("--primary-dark", primaryDark)
    document.documentElement.style.setProperty("--primary-light", primaryLight)

    // Guardar en localStorage para persistencia entre recargas
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        primaryColor: primary,
        secondaryColor: secondary,
      })
    )
  }

  // Función para actualizar colores
  const updateColors = async (primary: string, secondary: string) => {
    try {
      setColors({
        primaryColor: primary,
        secondaryColor: secondary,
      })
      
      applyColorsToDOM(primary, secondary)
      
      // Obtener el usuario actual
      const supabase = createClientSupabaseClient()
      const { data: userData } = await supabase.auth.getUser()
      
      if (!userData.user) return
      
      // Obtener el ID del restaurante
      const { data: userDetails } = await supabase
        .from("user_profiles")
        .select("restaurant_id")
        .eq("user_id", userData.user.id)
        .single()
      
      if (!userDetails?.restaurant_id) return
      
      // Actualizar los colores en la base de datos
      await supabase
        .from("restaurants")
        .update({
          primary_color: primary,
          secondary_color: secondary,
        })
        .eq("id", userDetails.restaurant_id)
      
    } catch (error) {
      console.error("Error al actualizar colores:", error)
    }
  }

  // Cargar colores al iniciar
  useEffect(() => {
    const loadColors = async () => {
      try {
        // se busca los locals storage
        const savedColors = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (savedColors) {
          const parsedColors = JSON.parse(savedColors)
          setColors(parsedColors)
          applyColorsToDOM(parsedColors.primaryColor, parsedColors.secondaryColor)
        }

        // Luego cargar desde la base de datos en la tabla users
        const supabase = createClientSupabaseClient()
        const { data: userData } = await supabase.auth.getUser()

        if (!userData.user) {
          setIsLoading(false)
          return
        }

        const { data: userDetails } = await supabase
          .from("user_profiles")
          .select("restaurant_id")
          .eq("user_id", userData.user.id)
          .single()

        if (!userDetails?.restaurant_id) {
          setIsLoading(false)
          return
        }

        const { data: restaurantData } = await supabase
          .from("restaurants")
          .select("primary_color, secondary_color")
          .eq("id", userDetails.restaurant_id)
          .single()

        if (restaurantData) {
          const primary = restaurantData.primary_color || defaultColors.primaryColor
          const secondary = restaurantData.secondary_color || defaultColors.secondaryColor

          // Actualizar el estado y aplicar los colores
          setColors({
            primaryColor: primary,
            secondaryColor: secondary,
          })
          applyColorsToDOM(primary, secondary)
        }
      } catch (error) {
        console.error("Error al cargar colores:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadColors()
  }, [])

  return (
    <ThemeContext.Provider value={{ colors, isLoading, updateColors, applyColorsToDOM }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
