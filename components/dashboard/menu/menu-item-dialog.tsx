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
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { DollarSign, ImageIcon } from "lucide-react"
import { useMenuData } from "@/hooks/use-menu-data"
import { useToast } from "@/components/ui/use-toast"

interface MenuItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryId?: string | null
  submenuId?: string | null
  onSubmit?: () => Promise<boolean>
  onUpdate?: () => Promise<boolean>
}

export function MenuItemDialog({ open, onOpenChange, categoryId, submenuId }: MenuItemDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const {
    categories,
    selectedMenuItem,
    newMenuItem,
    setNewMenuItem,
    setSelectedMenuItem,
    createMenuItem,
    updateMenuItem,
  } = useMenuData()

  const [localMenuItem, setLocalMenuItem] = useState({
    name: "",
    description: "",
    price: 0,
    image_url: "",
    is_available: true,
    category_id: "",
    submenu_id: null as string | null,
  })

  useEffect(() => {
    if (open) {
      if (selectedMenuItem) {
        // Initialize local state with selected item values
        setLocalMenuItem({
          name: selectedMenuItem.name || "",
          description: selectedMenuItem.description || "",
          price: selectedMenuItem.price || 0,
          image_url: selectedMenuItem.image_url || "",
          is_available: selectedMenuItem.is_available !== false,
          category_id: selectedMenuItem.category_id || "",
          submenu_id: selectedMenuItem.submenu_id || null,
        })
      } else if (categoryId) {
        // Initialize local state for new item
        setLocalMenuItem({
          name: "",
          description: "",
          price: 0,
          image_url: "",
          is_available: true,
          category_id: categoryId,
          submenu_id: submenuId || null,
        })

        // Only update newMenuItem when not editing
        setNewMenuItem({
          name: "",
          description: "",
          price: 0,
          image_url: "",
          is_available: true,
          category_id: categoryId,
          submenu_id: submenuId || null,
        })
      }
    }

    // Limpiar estado al cerrar
    if (!open) {
      setIsSubmitting(false)
    }
  }, [open, categoryId, submenuId, selectedMenuItem, setNewMenuItem])

  const handleSubmit = async () => {
    const itemToValidate = selectedMenuItem ? localMenuItem : newMenuItem

    if (!itemToValidate?.name?.trim()) {
      toast({
        title: "Error",
        description: "El nombre del item es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (!itemToValidate.category_id && !categoryId) {
      toast({
        title: "Error",
        description: "Debes seleccionar una categoría",
        variant: "destructive",
      })
      return
    }

    if (Number(itemToValidate.price) <= 0) {
      toast({
        title: "Error",
        description: "El precio debe ser mayor que cero",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      let success = false

      if (selectedMenuItem) {
        // Update selectedMenuItem with local values
        setSelectedMenuItem({
          ...selectedMenuItem,
          name: localMenuItem.name,
          description: localMenuItem.description,
          price: localMenuItem.price,
          image_url: localMenuItem.image_url,
          is_available: localMenuItem.is_available,
        })
        success = await updateMenuItem()
      } else {
        success = await createMenuItem()
      }

      if (success) {
        onOpenChange(false)
        toast({
          title: "Éxito",
          description: selectedMenuItem ? "Item actualizado correctamente" : "Item creado correctamente",
        })
      }
    } catch (error) {
      console.error("Error al guardar el item:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el item",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{selectedMenuItem ? "Editar Item" : "Crear Nuevo Item"}</DialogTitle>
          <DialogDescription>
            {selectedMenuItem ? "Actualiza la información de tu item de menú" : "Añade un nuevo plato a tu menú"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="item-name">Nombre</Label>
            <Input
              id="item-name"
              value={selectedMenuItem ? localMenuItem.name : newMenuItem.name}
              onChange={(e) =>
                selectedMenuItem
                  ? setLocalMenuItem({ ...localMenuItem, name: e.target.value })
                  : setNewMenuItem({ ...newMenuItem, name: e.target.value })
              }
              placeholder="Ej: Ensalada César"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="item-description">Descripción (opcional)</Label>
            <Textarea
              id="item-description"
              value={selectedMenuItem ? localMenuItem.description : (newMenuItem.description ?? "")}
              onChange={(e) =>
                selectedMenuItem
                  ? setLocalMenuItem({ ...localMenuItem, description: e.target.value })
                  : setNewMenuItem({ ...newMenuItem, description: e.target.value })
              }
              placeholder="Breve descripción del plato"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="item-price">Precio</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="item-price"
                type="number"
                step="0.01"
                value={selectedMenuItem ? localMenuItem.price : newMenuItem.price}
                onChange={(e) =>
                  selectedMenuItem
                    ? setLocalMenuItem({ ...localMenuItem, price: Number(e.target.value) || 0 })
                    : setNewMenuItem({ ...newMenuItem, price: Number(e.target.value) || 0 })
                }
                placeholder="0.00"
                className="pl-9"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="item-image">URL de Imagen (opcional)</Label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="item-image"
                value={selectedMenuItem ? (localMenuItem.image_url ?? "") : (newMenuItem.image_url ?? "")}
                onChange={(e) =>
                  selectedMenuItem
                    ? setLocalMenuItem({ ...localMenuItem, image_url: e.target.value })
                    : setNewMenuItem({ ...newMenuItem, image_url: e.target.value })
                }
                placeholder="https://ejemplo.com/imagen.jpg"
                className="pl-9"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {!selectedMenuItem && !categoryId && categories && categories.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="item-category">Categoría</Label>
              <select
                id="item-category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newMenuItem.category_id}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, category_id: e.target.value })}
                disabled={isSubmitting}
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Label htmlFor="item-available" className="flex-1">
              Disponible
            </Label>
            <Switch
              id="item-available"
              checked={selectedMenuItem ? localMenuItem.is_available : newMenuItem.is_available}
              onCheckedChange={(checked) =>
                selectedMenuItem
                  ? setLocalMenuItem({ ...localMenuItem, is_available: checked })
                  : setNewMenuItem({ ...newMenuItem, is_available: checked })
              }
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : selectedMenuItem ? "Guardar Cambios" : "Crear Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
