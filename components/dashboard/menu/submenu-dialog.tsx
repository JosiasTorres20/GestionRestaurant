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
import { useMenuData } from "@/hooks/use-menu-data"
import { useToast } from "@/components/ui/use-toast"

interface SubmenuDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menuId: string | null
  onSubmit?: () => Promise<boolean>
  onUpdate?: () => Promise<boolean>
}

export function SubmenuDialog({ 
  open, 
  onOpenChange, 
  menuId, 
  onSubmit, 
  onUpdate 
}: SubmenuDialogProps) {
  const {
    menus,
    selectedSubmenu,
    newSubmenu,
    setNewSubmenu,
    setSelectedSubmenu,
  } = useMenuData()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open && menuId && !selectedSubmenu) {
      setNewSubmenu({
        name: "",
        description: "",
        menu_id: menuId,
      })
    }
  }, [open, menuId, selectedSubmenu, setNewSubmenu])

  const handleSubmit = async () => {
    const submenuToValidate = selectedSubmenu || newSubmenu

    if (!submenuToValidate.name?.trim()) {
      toast({
        title: "Error",
        description: "El nombre del submenú es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (!submenuToValidate.menu_id) {
      toast({
        title: "Error",
        description: "Debes seleccionar un menú",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      let success = false

      if (selectedSubmenu && onUpdate) {
        success = await onUpdate()
      } else if (onSubmit) {
        success = await onSubmit()
      }

      if (success) {
        onOpenChange(false)
        toast({
          title: "Éxito",
          description: selectedSubmenu ? "Submenú actualizado correctamente" : "Submenú creado correctamente",
        })
      }
    } catch (error) {
      console.error("Error al guardar el submenú:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el submenú",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{selectedSubmenu ? "Editar Submenú" : "Crear Nuevo Submenú"}</DialogTitle>
          <DialogDescription>
            {selectedSubmenu
              ? "Actualiza la información de tu submenú"
              : "Crea un nuevo submenú para organizar tus platos"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="submenu-name">Nombre</Label>
            <Input
              id="submenu-name"
              value={selectedSubmenu ? selectedSubmenu.name : newSubmenu.name}
              onChange={(e) =>
                selectedSubmenu
                  ? setSelectedSubmenu({ ...selectedSubmenu, name: e.target.value })
                  : setNewSubmenu({ ...newSubmenu, name: e.target.value })
              }
              placeholder="Ej: Entradas"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="submenu-description">Descripción (opcional)</Label>
            <Textarea
              id="submenu-description"
              value={selectedSubmenu ? selectedSubmenu.description ?? "" : newSubmenu.description ?? ""}
              onChange={(e) =>
                selectedSubmenu
                  ? setSelectedSubmenu({ ...selectedSubmenu, description: e.target.value })
                  : setNewSubmenu({ ...newSubmenu, description: e.target.value })
              }
              placeholder="Breve descripción del submenú"
              disabled={isSubmitting}
            />
          </div>

          {!selectedSubmenu && (
            <div className="grid gap-2">
              <Label htmlFor="submenu-menu">Menú</Label>
              <select
                id="submenu-menu"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newSubmenu.menu_id}
                onChange={(e) => setNewSubmenu({ ...newSubmenu, menu_id: e.target.value })}
                disabled={!!menuId || isSubmitting}
              >
                <option value="">Seleccionar menú</option>
                {menus.map((menu) => (
                  <option key={menu.id} value={menu.id}>
                    {menu.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : selectedSubmenu ? "Guardar Cambios" : "Crear Submenú"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}