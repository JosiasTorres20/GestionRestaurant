import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import type { Restaurant } from "@/lib/services/restaurant-service"
import { 
  fetchRestaurantData, 
  saveRestaurantData, 
  getChangedFields,
  createDefaultRestaurant
} from "@/app/dashboard/settings/actions"

export function useRestaurantSettings() {
  const { toast } = useToast()
  const { userDetails } = useAuth() as { userDetails: { restaurant_id?: string } | undefined }
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [restaurant, setRestaurant] = useState<Restaurant>(createDefaultRestaurant())
  const [originalRestaurant, setOriginalRestaurant] = useState<Restaurant | null>(null)
  const [hasChanges, setHasChanges] = useState<boolean>(false)
  const [changedFields, setChangedFields] = useState<Set<keyof Restaurant>>(new Set())

  // Fetch restaurant data on mount
  useEffect(() => {
    const loadRestaurantData = async () => {
      if (!userDetails?.restaurant_id) {
        setIsLoading(false)
        return
      }

      try {
        const restaurantData = await fetchRestaurantData(userDetails.restaurant_id)
        
        if (restaurantData) {
          setRestaurant(restaurantData)
          setOriginalRestaurant(restaurantData)
          setChangedFields(new Set())
          setHasChanges(false)
        } else {
          throw new Error("No se pudieron cargar los datos del restaurante")
        }
      } catch (error) {
        console.error("Error al obtener datos del restaurante:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los ajustes del restaurante",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (userDetails) {
      loadRestaurantData()
    } else if (!userDetails) {
      setIsLoading(false)
    }
  }, [userDetails, toast])

  // Track changes to the restaurant object
  useEffect(() => {
    if (!originalRestaurant) return

    const newChangedFields = getChangedFields(restaurant, originalRestaurant)
    setChangedFields(newChangedFields)
    setHasChanges(newChangedFields.size > 0)
  }, [restaurant, originalRestaurant])

  // Handle field changes
  const handleRestaurantChange = (field: keyof Restaurant, value: string | boolean) => {
    setRestaurant(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle save
  const handleSave = async () => {
    if (!userDetails?.restaurant_id || !hasChanges || !originalRestaurant) return

    setIsSaving(true)

    try {
      const updates: Partial<Record<keyof Restaurant, string | boolean>> = {}

      changedFields.forEach((field) => {
        if (field in restaurant) {
          const value = restaurant[field]
          if (value !== null) {
            updates[field] = value
          }
        }
      })

      const success = await saveRestaurantData(userDetails.restaurant_id, updates)

      if (success) {
        setOriginalRestaurant(restaurant)
        setChangedFields(new Set())
        setHasChanges(false)

        toast({
          title: "Ajustes guardados",
          description: "Los ajustes de su restaurante se han actualizado correctamente.",
        })
      } else {
        throw new Error("No se pudieron guardar los ajustes")
      }
    } catch (error) {
      console.error("Error al guardar ajustes del restaurante:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar los ajustes del restaurante",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle QR code generation
  const handleGenerateQR = () => {
    if (!userDetails?.restaurant_id) return

    toast({
      title: "Código QR generado",
      description: "El código QR de su restaurante se ha generado correctamente.",
    })
  }

  return {
    restaurant,
    isLoading,
    isSaving,
    hasChanges,
    userDetails,
    handleSave,
    handleGenerateQR,
    handleRestaurantChange
  }
}