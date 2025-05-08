"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import * as branchService from "@/lib/services/branch-service"
import type { Branch } from "@/types"

/**
 * Hook personalizado para gestionar la lógica de las sucursales
 */
export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const { toast } = useToast()
  const { user, userDetails, signOut } = useAuth()
  const router = useRouter()

  const restaurantId = user?.restaurantId || (userDetails && userDetails.restaurant_id) || null

  /**
   * Carga las sucursales del restaurante
   */
  const loadBranches = useCallback(async () => {
    if (!restaurantId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const data = await branchService.getBranches(String(restaurantId))
      setBranches(data)
      setError(null)
    } catch (err) {
      console.error("Error al cargar sucursales:", err)
      setError(err instanceof Error ? err : new Error("Error desconocido al cargar sucursales"))

      // Solo cerrar sesión si es un error 401 explícito y confirmado
      if (err instanceof Error && 
          err.message.includes("401") && 
          err.message.includes("Authentication error")) {
        toast({
          title: "Error de autenticación",
          description: "Por favor, inicia sesión nuevamente",
          variant: "destructive",
        })
        // Cerrar sesión y redirigir al login
        await signOut()
        router.push("/login")
      } else {
        // Para otros errores, solo mostrar un mensaje pero no cerrar sesión
        toast({
          title: "Error",
          description: "No se pudieron cargar las sucursales. Intente nuevamente.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [restaurantId, toast, signOut, router])

  /**
   * Elimina una sucursal
   */
  const handleDeleteBranch = useCallback(
    async (branch: Branch) => {
      try {
        await branchService.deleteBranch(branch.id)
        setBranches((prev) => prev.filter((b) => b.id !== branch.id))
        toast({
          title: "Sucursal eliminada",
          description: `La sucursal ${branch.name} ha sido eliminada correctamente`,
        })
      } catch (err) {
        console.error("Error al eliminar sucursal:", err)
        // Solo cerrar sesión si es un error 401 explícito y confirmado
        if (err instanceof Error && 
            err.message.includes("401") && 
            err.message.includes("Unauthorized")) {
          toast({
            title: "Error de autenticación",
            description: "Por favor, inicia sesión nuevamente",
            variant: "destructive",
          })
          await signOut()
          router.push("/login")
        } else {
          toast({
            title: "Error",
            description: "No se pudo eliminar la sucursal",
            variant: "destructive",
          })
        }
      }
    },
    [toast, signOut, router],
  )

  /**
   * Establece una sucursal como principal
   */
  const handleSetMainBranch = useCallback(
    async (branch: Branch) => {
      if (!restaurantId) return

      try {
        await branchService.setMainBranch(branch.id, String(restaurantId))

        // Actualiza el estado local para reflejar el cambio
        setBranches((prev) =>
          prev.map((b) => ({
            ...b,
            is_main: b.id === branch.id,
          })),
        )

        toast({
          title: "Sucursal principal actualizada",
          description: `${branch.name} es ahora la sucursal principal`,
        })
      } catch (err) {
        console.error("Error al establecer sucursal principal:", err)
        // Solo cerrar sesión si es un error 401 explícito y confirmado
        if (err instanceof Error && 
            err.message.includes("401") && 
            err.message.includes("Unauthorized")) {
          toast({
            title: "Error de autenticación",
            description: "Por favor, inicia sesión nuevamente",
            variant: "destructive",
          })
          await signOut()
          router.push("/login")
        } else {
          toast({
            title: "Error",
            description: "No se pudo establecer la sucursal principal",
            variant: "destructive",
          })
        }
      }
    },
    [restaurantId, toast, signOut, router],
  )

  /**
   * Actualiza el estado después de crear o editar una sucursal
   */
  const handleBranchesUpdated = useCallback(() => {
    loadBranches()
  }, [loadBranches])

  // Cargar sucursales al montar el componente
  useEffect(() => {
    loadBranches()
  }, [loadBranches])

  return {
    branches,
    isLoading,
    error,
    restaurantId,
    handleDeleteBranch,
    handleSetMainBranch,
    handleBranchesUpdated,
    refreshBranches: loadBranches,
  }
}
