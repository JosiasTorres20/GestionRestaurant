"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus } from "lucide-react"

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onCreate: () => void
}

/**
 * Barra de búsqueda y botón para crear nueva sucursal
 */
export function SearchBar({ searchQuery, onSearchChange, onCreate }: SearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar sucursales..."
          className="pl-9 w-full sm:w-[300px]"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <Button onClick={onCreate} className="gap-2 w-full sm:w-auto brand-button">
        <Plus className="h-4 w-4" />
        Nueva Sucursal
      </Button>
    </div>
  )
}
