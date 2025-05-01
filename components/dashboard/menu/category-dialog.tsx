"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMenuData } from "@/hooks/use-menu-data"
import type { Branch } from "@/types"
import { useAuth } from "@/components/providers/auth-provider"

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  branchId?: string
  branches: Branch[]
}

export function CategoryDialog({ open, onOpenChange, branchId, branches = [] }: CategoryDialogProps) {
  const { selectedCategory, newCategory, setNewCategory, createCategory, updateCategory, setSelectedCategory } =
    useMenuData()

  const { user, userDetails } = useAuth()
  const restaurantId = user?.restaurantId || (userDetails && userDetails.restaurant_id) || null

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && branchId && !selectedCategory) {
      setNewCategory({
        ...newCategory,
        branch_id: branchId,
        restaurant_id: typeof restaurantId === "string" ? restaurantId : ""
      });
    }
  
    if (!open) {
      setIsSubmitting(false);
    }
  }, [open, branchId, restaurantId, selectedCategory, setNewCategory]);
  

  const handleSubmit = async () => {
    // Validar campos obligatorios
    if (selectedCategory && !selectedCategory.name.trim()) {
      alert("El nombre de la categoría es obligatorio")
      return
    }

    if (!selectedCategory && !(newCategory.name?.trim() ?? "")) {
      alert("El nombre de la categoría es obligatorio")
      return
    }

    if (!selectedCategory && !newCategory.branch_id) {
      alert("Debes seleccionar una sucursal")
      return
    }

    setIsSubmitting(true)

    try {
      let success = false

      if (selectedCategory) {
        success = await updateCategory()
      } else {
        success = await createCategory()
      }

      if (success) {
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Error al guardar la categoría:", error)
      alert("Ocurrió un error al guardar la categoría")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{selectedCategory ? "Editar Categoría" : "Crear Nueva Categoría"}</DialogTitle>
          <DialogDescription>
            {selectedCategory
              ? "Actualiza la información de tu categoría"
              : "Crea una nueva categoría para organizar tus platos"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!selectedCategory && (
            <div className="grid gap-2">
              <Label htmlFor="category-branch">Sucursal</Label>
              <Select
                value={newCategory.branch_id}
                onValueChange={(value) => setNewCategory({ ...newCategory, branch_id: value })}
                disabled={isSubmitting || !!branchId}
              >
                <SelectTrigger id="category-branch">
                  <SelectValue placeholder="Seleccionar sucursal" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} {branch.is_main && "(Principal)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="category-name">Nombre</Label>
            <Input
              id="category-name"
              value={selectedCategory ? selectedCategory.name : newCategory.name}
              onChange={(e) =>
                selectedCategory
                  ? setSelectedCategory({ ...selectedCategory, name: e.target.value })
                  : setNewCategory({ ...newCategory, name: e.target.value })
              }
              placeholder="Ej: Entradas"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category-description">Descripción (opcional)</Label>
            <Textarea
              id="category-description"
              value={selectedCategory ? selectedCategory.description ?? "" : newCategory.description ?? ""}
              onChange={(e) =>
                selectedCategory
                  ? setSelectedCategory({ ...selectedCategory, description: e.target.value })
                  : setNewCategory({ ...newCategory, description: e.target.value })
              }
              placeholder="Breve descripción de la categoría"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : selectedCategory ? "Guardar Cambios" : "Crear Categoría"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
