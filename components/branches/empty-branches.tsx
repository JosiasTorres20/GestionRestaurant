"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Store } from "lucide-react"

interface EmptyBranchesProps {
  searchQuery: string
  onCreate: () => void
}

/**
 * Componente que se muestra cuando no hay sucursales o no se encontraron resultados
 */
export function EmptyBranches({ searchQuery, onCreate }: EmptyBranchesProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-10">
        <Store className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium">No hay sucursales</p>
        <p className="text-sm text-muted-foreground">
          {searchQuery ? "No se encontraron resultados para tu búsqueda" : "Crea tu primera sucursal para comenzar"}
        </p>
        {!searchQuery && (
          <Button onClick={onCreate} className="mt-4 brand-button">
            Crear Sucursal
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
