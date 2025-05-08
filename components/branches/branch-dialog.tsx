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
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { createBranch, updateBranch } from "@/lib/services/branch-service"
import type { Branch } from "@/types"

interface BranchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  branch: Branch | null
  restaurantId: string
  onBranchUpdated: () => void
}

export function BranchDialog({ open, onOpenChange, branch, restaurantId, onBranchUpdated }: BranchDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    is_active: true,
    is_main: false,
  })

  // Cargar datos de la sucursal si estamos editando
  useEffect(() => {
    if (branch) {
      setFormData({
        name: branch.name || "",
        address: branch.address || "",
        phone: branch.phone || "",
        email: branch.email || "",
        is_active: branch.is_active !== undefined ? branch.is_active : true,
        is_main: branch.is_main || false,
      })
    } else {
      // Resetear el formulario si estamos creando
      setFormData({
        name: "",
        address: "",
        phone: "",
        email: "",
        is_active: true,
        is_main: false,
      })
    }
  }, [branch, open])

  const handleSubmit = async () => {
    // Validar campos obligatorios
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la sucursal es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (!formData.address.trim()) {
      toast({
        title: "Error",
        description: "La dirección de la sucursal es obligatoria",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (branch) {
        // Actualizar sucursal existente
        await updateBranch(branch.id, formData)
        toast({
          title: "Sucursal actualizada",
          description: "La sucursal se ha actualizado correctamente",
        })
      } else {
        // Crear nueva sucursal
        await createBranch(formData, restaurantId)
        toast({
          title: "Sucursal creada",
          description: "La sucursal se ha creado correctamente",
        })
      }

      onBranchUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error("Error al guardar la sucursal:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar la sucursal",
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
          <DialogTitle>{branch ? "Editar Sucursal" : "Crear Nueva Sucursal"}</DialogTitle>
          <DialogDescription>
            {branch ? "Actualiza la información de tu sucursal" : "Crea una nueva sucursal para tu restaurante"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="branch-name">Nombre</Label>
            <Input
              id="branch-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Sucursal Centro"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="branch-address">Dirección</Label>
            <Input
              id="branch-address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Ej: Av. Principal 123"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="branch-phone">Teléfono (opcional)</Label>
            <Input
              id="branch-phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Ej: +1234567890"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="branch-email">Email (opcional)</Label>
            <Input
              id="branch-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Ej: sucursal@restaurante.com"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="branch-active" className="flex-1">
              Sucursal activa
            </Label>
            <Switch
              id="branch-active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="branch-main" className="flex-1">
              Sucursal principal
            </Label>
            <Switch
              id="branch-main"
              checked={formData.is_main}
              onCheckedChange={(checked) => setFormData({ ...formData, is_main: checked })}
              disabled={isSubmitting || (branch ? !!branch.is_main : false)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : branch ? "Guardar Cambios" : "Crear Sucursal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
