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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMenuData } from "@/hooks/use-menu-data"
import type { Branch } from "@/types"
import { useToast } from "@/components/ui/use-toast"

interface MenuDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: () => Promise<boolean>
  onUpdate?: () => Promise<boolean>
  branchId?: string
  branches: Branch[]
}

export function MenuDialog({ open, onOpenChange, onSubmit, onUpdate, branchId, branches = [] }: MenuDialogProps) {
  const { selectedMenu, newMenu, setNewMenu, setSelectedMenu } = useMenuData()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open && branchId && !selectedMenu) {
      setNewMenu({
        name: "",
        description: "",
        branch_id: branchId || "",
        is_active: true,
      })
    }

    // Limpiar estado al cerrar
    if (!open) {
      setIsSubmitting(false)
    }
  }, [open, branchId, selectedMenu, setNewMenu])

  const handleSubmit = async () => {
    // Validar campos obligatorios
    if (selectedMenu && !selectedMenu.name?.trim()) {
      toast({
        title: "Error",
        description: "El nombre del menú es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (!selectedMenu && !(newMenu.name?.trim() ?? "")) {
      toast({
        title: "Error",
        description: "El nombre del menú es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (!selectedMenu?.branch_id && !newMenu.branch_id) {
      toast({
        title: "Error",
        description: "Debe seleccionar una sucursal",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      let success = false

      if (selectedMenu && onUpdate) {
        success = await onUpdate()
      } else if (onSubmit) {
        success = await onSubmit()
      }

      if (success) {
        onOpenChange(false)
        toast({
          title: "Éxito",
          description: selectedMenu ? "Menú actualizado correctamente" : "Menú creado correctamente",
        })
      }
    } catch (error) {
      console.error("Error al guardar el menú:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el menú",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{selectedMenu ? "Editar Menú" : "Crear Nuevo Menú"}</DialogTitle>
          <DialogDescription>
            {selectedMenu ? "Actualiza la información de tu menú" : "Crea un nuevo menú para tu restaurante"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="menu-branch">Sucursal</Label>
            <Select
              value={selectedMenu ? selectedMenu.branch_id : newMenu.branch_id}
              onValueChange={(value) =>
                selectedMenu
                  ? setSelectedMenu({ ...selectedMenu, branch_id: value })
                  : setNewMenu({ ...newMenu, branch_id: value })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger id="menu-branch">
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

          <div className="grid gap-2">
            <Label htmlFor="menu-name">Nombre</Label>
            <Input
              id="menu-name"
              value={selectedMenu ? selectedMenu.name : newMenu.name}
              onChange={(e) =>
                selectedMenu
                  ? setSelectedMenu({ ...selectedMenu, name: e.target.value })
                  : setNewMenu({ ...newMenu, name: e.target.value })
              }
              placeholder="Ej: Menú Principal"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="menu-description">Descripción (opcional)</Label>
            <Textarea
              id="menu-description"
              value={selectedMenu ? selectedMenu.description || "" : newMenu.description || ""}
              onChange={(e) =>
                selectedMenu
                  ? setSelectedMenu({ ...selectedMenu, description: e.target.value })
                  : setNewMenu({ ...newMenu, description: e.target.value })
              }
              placeholder="Breve descripción del menú"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="menu-active" className="flex-1">
              Menú activo
            </Label>
            <Switch
              id="menu-active"
              checked={selectedMenu ? selectedMenu.is_active : newMenu.is_active}
              onCheckedChange={(checked) => {
                if (selectedMenu) {
                  setSelectedMenu({ ...selectedMenu, is_active: checked })
                } else {
                  setNewMenu({ ...newMenu, is_active: checked })
                }
              }}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : selectedMenu ? "Guardar Cambios" : "Crear Menú"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
