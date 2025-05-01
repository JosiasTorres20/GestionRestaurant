"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "./providers/supabase-provider"
import { useAuth } from "./providers/auth-provider"

export function RestaurantAssigner() {
  const { toast } = useToast()
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [restaurantName, setRestaurantName] = useState("")

  const createAndAssignRestaurant = async () => {
    if (!restaurantName.trim() || !user?.id) return

    setIsLoading(true)

    try {
      // 1. Crear un nuevo restaurante
      const { data: restaurantData, error: restaurantError } = await supabase
        .from("restaurants")
        .insert({
          name: restaurantName,
          primary_color: "#4f46e5",
          secondary_color: "#f9fafb",
          is_active: true,
        })
        .select()
        .single()

      if (restaurantError) throw restaurantError

      // 2. Asignar el restaurante al usuario
      const { error: userError } = await supabase
        .from("users")
        .update({ restaurant_id: restaurantData.id })
        .eq("id", user.id)

      if (userError) throw userError

      toast({
        title: "Restaurante creado",
        description: `El restaurante "${restaurantName}" ha sido creado y asignado a tu cuenta.`,
      })

      // Recargar la página para aplicar los cambios
      window.location.reload()
    } catch (error) {
      console.error("Error al crear restaurante:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el restaurante",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Asignar Restaurante</CardTitle>
        <CardDescription>No tienes un restaurante asignado. Crea uno nuevo para continuar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="restaurant-name">Nombre del Restaurante</Label>
          <Input
            id="restaurant-name"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            placeholder="Nombre del restaurante"
            disabled={isLoading}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={createAndAssignRestaurant} disabled={isLoading || !restaurantName.trim()} className="w-full">
          {isLoading ? "Creando..." : "Crear y Asignar Restaurante"}
        </Button>
      </CardFooter>
    </Card>
  )
}
