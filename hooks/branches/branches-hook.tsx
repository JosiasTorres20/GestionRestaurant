import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/providers/auth-provider"
import { useTheme } from "@/components/providers/theme-provider"
import type { Branch } from "@/types"
import { getBranches, deleteBranch, setMainBranch } from "@/lib/services/branch-service"

export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { toast } = useToast()
  const { user, userDetails } = useAuth()
  const { isLoading: isThemeLoading } = useTheme()
  const restaurantId = user?.restaurantId || (userDetails && userDetails.restaurant_id) || null

  useEffect(() => {
    const loadBranches = async () => {
      if (!restaurantId || isThemeLoading) {
        if (!isThemeLoading) setIsLoading(false)
        return
      }

      try {
        const data = await getBranches(String(restaurantId))
        setBranches(data)
      } catch (error) {
        console.error("Error al cargar sucursales:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las sucursales",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadBranches()
  }, [restaurantId, toast, isThemeLoading])

  const handleDeleteBranch = async (branch: Branch) => {
    if (branch.is_main) {
      toast({
        title: "Error",
        description: "No puedes eliminar la sucursal principal",
        variant: "destructive",
      })
      return
    }

    if (window.confirm(`¿Estás seguro de que deseas eliminar la sucursal ${branch.name}?`)) {
      try {
        await deleteBranch(branch.id)
        setBranches(branches.filter((b) => b.id !== branch.id))
        toast({
          title: "Sucursal eliminada",
          description: "La sucursal ha sido eliminada correctamente",
        })
      } catch (error) {
        console.error("Error al eliminar sucursal:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar la sucursal",
          variant: "destructive",
        })
      }
    }
  }

  const handleSetMainBranch = async (branch: Branch) => {
    if (branch.is_main) return
    if (!restaurantId) return

    try {
      await setMainBranch(branch.id, String(restaurantId))


      setBranches(
        branches.map((b) => ({
          ...b,
          is_main: b.id === branch.id,
        })),
      )

      toast({
        title: "Sucursal principal actualizada",
        description: `${branch.name} es ahora la sucursal principal`,
      })
    } catch (error) {
      console.error("Error al establecer sucursal principal:", error)
      toast({
        title: "Error",
        description: "No se pudo establecer la sucursal principal",
        variant: "destructive",
      })
    }
  }
  const handleBranchesUpdated = (updatedBranch: Branch, isNew: boolean) => {
    if (isNew) {
      setBranches([...branches, updatedBranch])
    } else {
      setBranches(branches.map((b) => (b.id === updatedBranch.id ? updatedBranch : b)))
    }
  }

  return {
    branches,
    isLoading: isLoading || isThemeLoading,
    restaurantId,
    handleDeleteBranch,
    handleSetMainBranch,
    handleBranchesUpdated
  }
}