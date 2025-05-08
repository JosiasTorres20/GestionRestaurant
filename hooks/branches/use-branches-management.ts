"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/providers/auth-provider"
import * as branchService from "@/lib/services/branch-service"
import type { Branch } from "@/types"

/**
 * Hook personalizado para gestionar la lógica de las sucursales
 */
export function useBranchesManagement() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const { toast } = useToast()
  const { user, userDetails, signOut } = useAuth()


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
      setError(err instanceof Error ? err : new Error("Error desconocido al cargar sucursales"))

      // Mostrar mensaje de error específico para 401
      if (err instanceof Error && err.message.includes("401")) {
        toast({
          title: "Error de autenticación",
          description: "Por favor, inicia sesión nuevamente",
          variant: "destructive",
        })
        // Cerrar sesión y redirigir al login
        await signOut()
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar las sucursales",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [restaurantId, toast, signOut])

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
      } catch {
        toast({
          title: "Error",
          description: "No se pudo eliminar la sucursal",
          variant: "destructive",
        })
      }
    },
    [toast],
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
      } catch  {
        toast({
          title: "Error",
          description: "No se pudo establecer la sucursal principal",
          variant: "destructive",
        })
      }
    },
    [restaurantId, toast],
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
