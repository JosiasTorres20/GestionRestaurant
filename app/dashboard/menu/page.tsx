"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Store } from "lucide-react"
import { MenuList } from "@/components/dashboard/menu/menu-list"
import { MenuPreview } from "@/components/dashboard/menu/menu-preview"
import { MenuDialog } from "@/components/dashboard/menu/menu-dialog"
import { CategoryDialog } from "@/components/dashboard/menu/category-dialog"
import { MenuDataProvider, useMenuData } from "@/hooks/use-menu-data"
import { useAuth } from "@/components/providers/auth-provider"
import { getBranches } from "@/lib/services/branch-service"
import type { Branch } from "@/types"

// Create a wrapper component that uses the context
function MenuManagementContent() {
  const [activeTab, setActiveTab] = useState("menus")
  const [searchQuery, setSearchQuery] = useState("")
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [isLoadingBranches, setIsLoadingBranches] = useState(true)

  const { user, userDetails } = useAuth()
  const restaurantId = user?.restaurantId || (userDetails && userDetails.restaurant_id) || null

  const { menus, isLoading, createMenu, resetNewMenuForm, setSelectedMenu } = useMenuData()

  // Filter menus based on search query and selected branch
  const filteredMenus = useMemo(() => {
    let filtered = selectedBranchId ? menus.filter((menu) => menu.branch_id === selectedBranchId) : menus

    // Apply search filter if there's a search query
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase()
      filtered = filtered.filter((menu) => {
        // Check if menu name matches
        if (menu.name.toLowerCase().includes(searchLower)) return true

        // Check if any category name matches
        if (menu.categories?.some((category) => category.name.toLowerCase().includes(searchLower))) return true

        // Check if any menu item name matches
        if (
          menu.categories?.some((category) =>
            category.items?.some((item) => item.name.toLowerCase().includes(searchLower)),
          )
        )
          return true

        return false
      })
    }

    return filtered
  }, [menus, selectedBranchId, searchQuery])

  // Load branches only once when the component mounts or restaurantId changes
  useEffect(() => {
    let isMounted = true

    const loadBranches = async () => {
      if (!restaurantId) {
        if (isMounted) setIsLoadingBranches(false)
        return
      }

      try {
        const branchesData = await getBranches(String(restaurantId))

        // Only update state if the component is still mounted
        if (isMounted) {
          setBranches(branchesData)

          // Only set the selectedBranchId if it hasn't been set yet
          if (!selectedBranchId && branchesData.length > 0) {
            const mainBranch = branchesData.find((branch) => branch.is_main)
            if (mainBranch) {
              setSelectedBranchId(mainBranch.id)
            } else if (branchesData[0]) {
              setSelectedBranchId(branchesData[0].id)
            }
          }

          setIsLoadingBranches(false)
        }
      } catch (error) {
        console.error("Error al cargar sucursales:", error)
        if (isMounted) {
          setIsLoadingBranches(false)
        }
      }
    }

    loadBranches()

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false
    }
  }, [restaurantId, selectedBranchId])

  // Handle opening the menu dialog
  const handleOpenCreateMenuDialog = () => {
    setSelectedMenu(null) // Asegurarse de que estamos creando un nuevo menú
    resetNewMenuForm()
    setIsMenuDialogOpen(true)
  }

  // Handle opening the category dialog
  const handleOpenCreateCategoryDialog = () => {
    setIsCategoryDialogOpen(true)
  }

  // Handle branch selection change
  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBranchId(e.target.value)
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-heading">Gestión de Menús</h1>
          <p className="text-muted-foreground">Crea y administra los menús de tu restaurante</p>
        </div>
      </div>

      {/* Selector de sucursal */}
      <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/20">
        <Store className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium">Sucursal:</span>
        {isLoadingBranches ? (
          <span className="text-sm text-muted-foreground">Cargando sucursales...</span>
        ) : branches.length === 0 ? (
          <span className="text-sm text-muted-foreground">No hay sucursales disponibles</span>
        ) : (
          <select
            className="flex h-10 w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedBranchId || ""}
            onChange={handleBranchChange}
            disabled={isLoadingBranches}
          >
            <option value="" disabled>
              Seleccionar sucursal
            </option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name} {branch.is_main && "(Principal)"}
              </option>
            ))}
          </select>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="menus">Menús</TabsTrigger>
            <TabsTrigger value="preview">Vista Previa</TabsTrigger>
          </TabsList>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar..."
                className="pl-9 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleOpenCreateMenuDialog} className="gap-2" disabled={!selectedBranchId}>
                <Plus className="h-4 w-4" />
                Nuevo Menú
              </Button>
              <Button onClick={handleOpenCreateCategoryDialog} className="gap-2" disabled={!selectedBranchId}>
                <Plus className="h-4 w-4" />
                Nueva Categoría
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="menus" className="space-y-4">
          <MenuList menus={filteredMenus} isLoading={isLoading || isLoadingBranches} searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <MenuPreview menus={filteredMenus} />
        </TabsContent>
      </Tabs>

      <MenuDialog
        open={isMenuDialogOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedMenu(null)
          setIsMenuDialogOpen(open)
        }}
        onSubmit={createMenu}
        branchId={selectedBranchId || undefined}
        branches={branches}
      />

      <CategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        branchId={selectedBranchId || undefined}
        branches={branches}
      />
    </div>
  )
}


export default function MenuManagement() {
  return (
    <MenuDataProvider>
      <MenuManagementContent />
    </MenuDataProvider>
  )
}
