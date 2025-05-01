"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, MapPin, Phone, Mail, Store } from "lucide-react"
import { BranchDialog } from "@/components/branches/branch-dialog"
import type { Branch } from "@/types"
import { useBranches } from "@/hooks/branches/branches-hook"

export default function BranchesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  
  const {
    branches,
    isLoading,
    restaurantId,
    handleDeleteBranch,
    handleSetMainBranch,
    handleBranchesUpdated
  } = useBranches()


  const filteredBranches = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleEditBranch = (branch: Branch) => {
    setSelectedBranch(branch)
    setIsDialogOpen(true)
  }
  const handleCreateBranch = () => {
    setSelectedBranch(null)
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-heading">Sucursales</h1>
          <p className="text-muted-foreground">Cargando información de sucursales...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 w-24 rounded-md bg-muted"></div>
                <div className="h-4 w-32 rounded-md bg-muted"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full rounded-md bg-muted"></div>
                  <div className="h-4 w-3/4 rounded-md bg-muted"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-heading">Sucursales</h1>
          <p className="text-muted-foreground">Gestiona las sucursales de tu restaurante</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar sucursales..."
            className="pl-9 w-full sm:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button onClick={handleCreateBranch} className="gap-2 w-full sm:w-auto brand-button">
          <Plus className="h-4 w-4" />
          Nueva Sucursal
        </Button>
      </div>

      {filteredBranches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Store className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">No hay sucursales</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "No se encontraron resultados para tu búsqueda" : "Crea tu primera sucursal para comenzar"}
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateBranch} className="mt-4 brand-button">
                Crear Sucursal
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBranches.map((branch) => (
            <Card key={branch.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {branch.name}
                      {branch.is_main && <Badge className="bg-primary text-primary-foreground">Principal</Badge>}
                      {!branch.is_active && (
                        <Badge variant="outline" className="text-muted-foreground">
                          Inactiva
                        </Badge>
                      )}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">{branch.address}</span>
                  </div>
                  {branch.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{branch.phone}</span>
                    </div>
                  )}
                  {branch.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{branch.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditBranch(branch)}
                  className="border-brand-primary text-brand-primary"
                >
                  Editar
                </Button>
                <div className="flex gap-2">
                  {!branch.is_main && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetMainBranch(branch)}
                      className="border-brand-primary text-brand-primary"
                    >
                      Establecer como Principal
                    </Button>
                  )}
                  {!branch.is_main && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDeleteBranch(branch)}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {restaurantId && (
        <BranchDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          branch={selectedBranch}
          restaurantId={String(restaurantId)}
          onBranchUpdated={handleBranchesUpdated}
        />
      )}
    </div>
  )
}