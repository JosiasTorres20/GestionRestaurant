"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/providers/auth-provider"
import { useTheme } from "@/components/providers/theme-provider"

export function DebugSettings() {
  const { userDetails } = useAuth()
  const { colors } = useTheme()
  const [isVisible, setIsVisible] = useState(true)

  // Solo mostrar en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      setIsVisible(false)
    }
  }, [])

  if (!isVisible) return null

  return (
    <Card className="mb-4 border-red-500">
      <CardHeader>
        <CardTitle className="text-sm">Depuración de Ajustes</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div>
          <strong>Usuario ID:</strong> {String(userDetails?.id || "No disponible")}
        </div>
        <div>
          <strong>Restaurante ID:</strong> {String(userDetails?.restaurantId || "No disponible")}
        </div>
        <div>
          <strong>Color Primario:</strong> {colors.primaryColor}
        </div>
        <div>
          <strong>Color Secundario:</strong> {colors.secondaryColor}
        </div>
        <div className="text-red-500">
          Si los campos están bloqueados, haga clic en el botón a continuación para desbloquearlos:
        </div>
        <button
          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
          onClick={() => {
            // Forzar la actualización de la página
            window.location.reload()
          }}
        >
          Desbloquear Campos
        </button>
      </CardContent>
    </Card>
  )
}
