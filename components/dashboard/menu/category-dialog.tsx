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
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  branchId?: string
  branches: Branch[]
}

export function CategoryDialog({ open, onOpenChange, branchId, branches = [] }: CategoryDialogProps) {
  const { selectedCategory, newCategory, setNewCategory, createCategory, updateCategory, setSelectedCategory } =
    useMenuData()

  const { userDetails } = useAuth()
  const restaurantId = userDetails?.restaurant_id || null
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localCategory, setLocalCategory] = useState({
    name: "",
    description: "",
    branch_id: "",
    restaurant_id: "",
  })

  // Reset form when dialog opens/closes or when selectedCategory changes
  useEffect(() => {
    if (open) {
      setError(null)

      if (selectedCategory) {
        setLocalCategory({
          name: selectedCategory.name || "",
          description: selectedCategory.description || "",
          branch_id: selectedCategory.branch_id || "",
          restaurant_id: selectedCategory.restaurant_id || "",
        })
      } else if (branchId) {
        setLocalCategory({
          name: "",
          description: "",
          branch_id: branchId,
          restaurant_id: typeof restaurantId === "string" ? restaurantId : "",
        })

        // Only update newCategory when not editing
        setNewCategory((prev) => ({
          ...prev,
          branch_id: branchId,
          restaurant_id: typeof restaurantId === "string" ? restaurantId : "",
        }))
      }
    }

    if (!open) {
      setIsSubmitting(false)
      setError(null)
    }
  }, [open, branchId, restaurantId, selectedCategory, setNewCategory])

  const handleSubmit = async () => {
    setError(null)

    // Validar campos obligatorios
    if (selectedCategory && !localCategory.name?.trim()) {
      setError("El nombre de la categoría es obligatorio")
      return
    }

    if (!selectedCategory && !(newCategory.name?.trim() ?? "")) {
      setError("El nombre de la categoría es obligatorio")
      return
    }

    if (!selectedCategory && !newCategory.branch_id) {
      setError("Debes seleccionar una sucursal")
      return
    }

    setIsSubmitting(true)

    try {
      let success = false

      if (selectedCategory) {
        // Update selectedCategory with local values
        setSelectedCategory({
          ...selectedCategory,
          name: localCategory.name,
          description: localCategory.description,
        })
        success = await updateCategory()
      } else {
        // Filter out non-existent fields
        const filteredData = {
          name: newCategory.name,
          description: newCategory.description,
          branch_id: newCategory.branch_id,
          restaurant_id: newCategory.restaurant_id,
          menu_id: newCategory.menu_id || null,
        }

        // Log the data we're sending
        console.log("Creating category with filtered data:", JSON.stringify(filteredData, null, 2))
        success = await createCategory()
      }

      if (success) {
        onOpenChange(false)
        toast({
          title: "Éxito",
          description: selectedCategory ? "Categoría actualizada correctamente" : "Categoría creada correctamente",
        })
      } else {
        setError("No se pudo guardar la categoría. Verifica los datos e intenta nuevamente.")
      }
    } catch (error) {
      console.error("Error al guardar la categoría:", error)
      setError("Ocurrió un error al guardar la categoría. Por favor, intenta nuevamente.")
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

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
              value={selectedCategory ? localCategory.name : newCategory.name}
              onChange={(e) =>
                selectedCategory
                  ? setLocalCategory({ ...localCategory, name: e.target.value })
                  : setNewCategory({ ...newCategory, name: e.target.value })
              }
              placeholder="Ej: Entradas"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category-description">Descripción (opcional)</Label>
            <Textarea
              id="category-description"
              value={selectedCategory ? localCategory.description : (newCategory.description ?? "")}
              onChange={(e) =>
                selectedCategory
                  ? setLocalCategory({ ...localCategory, description: e.target.value })
                  : setNewCategory({ ...newCategory, description: e.target.value })
              }
              placeholder="Breve descripción de la categoría"
            />
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Datos que se enviarán:</p>
            <pre className="mt-1 p-2 bg-muted rounded-md overflow-x-auto">
              {JSON.stringify(
                selectedCategory
                  ? { ...selectedCategory, name: localCategory.name, description: localCategory.description }
                  : newCategory,
                null,
                2,
              )}
            </pre>
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
