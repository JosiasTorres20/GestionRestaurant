"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Store, LayoutGrid, Palette } from "lucide-react"
import { MenuList } from "@/components/dashboard/menu/menu-list"
import { MenuPreview } from "@/components/dashboard/menu/menu-preview"
import { MenuThemeEditor } from "@/components/dashboard/menu/menu-theme-editor"
import { MenuDialog } from "@/components/dashboard/menu/menu-dialog"
import { CategoryDialog } from "@/components/dashboard/menu/category-dialog"
import { useMenuData } from "@/hooks/use-menu-data"
import { useAuth } from "@/components/providers/auth-provider"
import { getBranches } from "@/lib/services/branch-service"
import type { Branch } from "@/types"
import { useToast } from "@/components/ui/use-toast"
import { MenuDataProvider } from "@/hooks/use-menu-data"
import { Card, CardContent } from "@/components/ui/card"

function MenuManagementContent() {
  const [activeTab, setActiveTab] = useState("menus")
  const [searchQuery, setSearchQuery] = useState("")
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [isLoadingBranches, setIsLoadingBranches] = useState(true)

  const { toast } = useToast()
  const { userDetails } = useAuth()
  const restaurantId = userDetails?.restaurant_id || null

  const {
    menus,
    isLoading,
    setIsLoading,
    loadMenus,
    loadBranchMenus,
    createMenu,
    updateMenu,
    resetNewMenuForm,
    setSelectedMenu,
    newMenu,
    selectedMenu,
  } = useMenuData()

  const filteredMenus = useMemo(() => {
    let filtered = selectedBranchId ? menus.filter((m) => m.branch_id === selectedBranchId) : menus

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter((menu) => {
        // Buscar en el nombre y descripción del menú
        if (menu.name.toLowerCase().includes(q) || (menu.description && menu.description.toLowerCase().includes(q))) {
          return true
        }

        // Buscar en categorías
        if (
          Array.isArray(menu.categories) &&
          menu.categories.some(
            (cat) =>
              cat.name.toLowerCase().includes(q) ||
              (cat.description && cat.description.toLowerCase().includes(q)) ||
              // Buscar en items
              (Array.isArray(cat.items) &&
                cat.items.some(
                  (item) =>
                    item.name.toLowerCase().includes(q) ||
                    (item.description && item.description.toLowerCase().includes(q)),
                )),
          )
        ) {
          return true
        }

        return false
      })
    }

    return filtered
  }, [menus, selectedBranchId, searchQuery])

  // Cargar sucursales al inicio
  useEffect(() => {
    let isMounted = true

    const loadBranches = async () => {
      if (!restaurantId) {
        setIsLoadingBranches(false)
        return
      }

      try {
        const branchesData = await getBranches(String(restaurantId))

        if (isMounted) {
          setBranches(branchesData || [])

          // Seleccionar la sucursal principal por defecto
          if (!selectedBranchId && branchesData && branchesData.length > 0) {
            const mainBranch = branchesData.find((b) => b.is_main)
            setSelectedBranchId(mainBranch?.id || branchesData[0].id)
          }

          setIsLoadingBranches(false)
        }
      } catch (error) {
        console.error("Error loading branches:", error)

        if (isMounted) {
          toast({
            title: "Error",
            description: "No se pudieron cargar las sucursales",
            variant: "destructive",
          })

          setIsLoadingBranches(false)
        }
      }
    }

    loadBranches()

    return () => {
      isMounted = false
    }
  }, [restaurantId, selectedBranchId, toast])

  // Cargar menús cuando cambia la sucursal seleccionada
  useEffect(() => {
    let isMounted = true

    const loadMenuData = async () => {
      if (!restaurantId && !selectedBranchId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        if (selectedBranchId) {
          await loadBranchMenus(selectedBranchId)
        } else if (restaurantId) {
          await loadMenus(String(restaurantId))
        }
      } catch (error) {
        console.error("Error loading menus:", error)

        if (isMounted) {
          toast({
            title: "Error",
            description: "No se pudieron cargar los menús",
            variant: "destructive",
          })
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadMenuData()

    return () => {
      isMounted = false
    }
  }, [restaurantId, selectedBranchId, loadBranchMenus, loadMenus, setIsLoading, toast])

  const handleOpenCreateMenuDialog = () => {
    setSelectedMenu(null)
    resetNewMenuForm()
    setIsMenuDialogOpen(true)
  }

  const handleCreateMenu = async () => {
    try {
      const success = await createMenu(newMenu)

      if (success) {
        setIsMenuDialogOpen(false)
      }

      return success
    } catch (error) {
      console.error("Error creating menu:", error)

      toast({
        title: "Error",
        description: "No se pudo crear el menú",
        variant: "destructive",
      })

      return false
    }
  }

  const handleUpdateMenu = async () => {
    try {
      const success = await updateMenu()

      if (success) {
        setIsMenuDialogOpen(false)
      }

      return success
    } catch (error) {
      console.error("Error updating menu:", error)

      toast({
        title: "Error",
        description: "No se pudo actualizar el menú",
        variant: "destructive",
      })

      return false
    }
  }

  // Renderizado del componente
  return (
    <div className="space-y-6">
      {/* Encabezado */}
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
            onChange={(e) => setSelectedBranchId(e.target.value)}
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

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="menus" className="gap-2 items-center">
              <LayoutGrid className="h-4 w-4" />
              <span>Menús</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2 items-center">
              <Store className="h-4 w-4" />
              <span>Vista Previa</span>
            </TabsTrigger>
            <TabsTrigger value="theme" className="gap-2 items-center">
              <Palette className="h-4 w-4" />
              <span>Personalización</span>
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar..."
                className="pl-9 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleOpenCreateMenuDialog} className="gap-2" disabled={!selectedBranchId}>
                <Plus className="h-4 w-4" />
                Nuevo Menú
              </Button>
              <Button
                onClick={() => setIsCategoryDialogOpen(true)}
                className="gap-2"
                disabled={!selectedBranchId || !selectedMenu}
              >
                <Plus className="h-4 w-4" />
                Nueva Categoría
              </Button>
            </div>
          </div>
        </div>

        {/* Contenido de las tabs */}
        <TabsContent value="menus" className="space-y-4">
          <MenuList menus={filteredMenus} isLoading={isLoading || isLoadingBranches} searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {selectedMenu ? (
            <MenuPreview menu={selectedMenu} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Store className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">Selecciona un menú para ver la vista previa</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="theme" className="space-y-4">
          {selectedMenu ? (
            <MenuThemeEditor menuId={selectedMenu.id} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Palette className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">Selecciona un menú para personalizar su apariencia</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Diálogos */}
      <MenuDialog
        open={isMenuDialogOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedMenu(null)
          setIsMenuDialogOpen(open)
        }}
        onSubmit={selectedMenu ? handleUpdateMenu : handleCreateMenu}
        branchId={selectedBranchId || undefined}
        branches={branches}
      />

      <CategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        // menuId={selectedMenu?.id}
        branchId={selectedBranchId || undefined}
        branches={branches}
      />
    </div>
  )
}

export default function MenuManagementPage() {
  return (
    <MenuDataProvider>
      <MenuManagementContent />
    </MenuDataProvider>
  )
}
