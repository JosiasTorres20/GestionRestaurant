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
import { useToast } from "@/components/ui/use-toast"
import { createBranch, updateBranch } from "@/lib/services/branch-service"
import type { Branch, BranchFormData } from "@/types"

interface BranchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  branch: Branch | null
  restaurantId: string
  onBranchUpdated: (branch: Branch, isNew: boolean) => void
}

export function BranchDialog({ open, onOpenChange, branch, restaurantId, onBranchUpdated }: BranchDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<BranchFormData>({
    name: "",
    address: "",
    phone: "",
    whatsapp: "",
    email: "",
    is_main: false,
    is_active: true,
  })

  // Cargar datos de la sucursal si estamos editando
  useEffect(() => {
    if (branch) {
      setFormData({
        name: branch.name,
        address: branch.address,
        phone: branch.phone || "",
        whatsapp: branch.whatsapp || "",
        email: branch.email || "",
        is_main: branch.is_main,
        is_active: branch.is_active,
        location: branch.location,
      })
    } else {
      // Resetear formulario para nueva sucursal
      setFormData({
        name: "",
        address: "",
        phone: "",
        whatsapp: "",
        email: "",
        is_main: false,
        is_active: true,
      })
    }
  }, [branch, open])

  const handleSubmit = async () => {
    // Validar campos obligatorios
    if (!formData.name || !formData.address) {
      toast({
        title: "Error",
        description: "El nombre y la dirección son obligatorios",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      let updatedBranch: Branch

      if (branch) {
        // Actualizar sucursal existente
        updatedBranch = await updateBranch(branch.id, formData)
        toast({
          title: "Sucursal actualizada",
          description: "La sucursal ha sido actualizada correctamente",
        })
      } else {
        // Crear nueva sucursal
        updatedBranch = await createBranch(restaurantId, formData)
        toast({
          title: "Sucursal creada",
          description: "La sucursal ha sido creada correctamente",
        })
      }

      onBranchUpdated(updatedBranch, !branch)
      onOpenChange(false)
    } catch (error) {
      console.error("Error al guardar sucursal:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la sucursal",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{branch ? "Editar Sucursal" : "Crear Nueva Sucursal"}</DialogTitle>
          <DialogDescription>
            {branch
              ? "Actualiza la información de la sucursal"
              : "Completa la información para crear una nueva sucursal"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre de la Sucursal*</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Sucursal Centro"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Dirección*</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Dirección completa de la sucursal"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Ej: +1 234 567 8900"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="Ej: +1 234 567 8900"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Ej: sucursal@restaurante.com"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="is_main" className="flex-1">
              Sucursal Principal
            </Label>
            <Switch
              id="is_main"
              checked={formData.is_main}
              onCheckedChange={(checked) => setFormData({ ...formData, is_main: checked })}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="is_active" className="flex-1">
              Sucursal Activa
            </Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              disabled={isSubmitting}
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
