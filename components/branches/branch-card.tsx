"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MapPin, Phone, Mail, Edit, Trash2 } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { deleteBranch } from "@/lib/services/branch-service"
import type { Branch } from "@/types"

interface BranchCardProps {
  branch: Branch
  onEdit: () => void
  onDelete: () => void
}

export function BranchCard({ branch, onEdit, onDelete }: BranchCardProps) {
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteBranch(branch.id)
      toast({
        title: "Sucursal eliminada",
        description: "La sucursal se ha eliminado correctamente",
      })
      onDelete()
    } catch (error: unknown) {
      console.error("Error al eliminar sucursal:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar la sucursal",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="h-2 bg-primary" />
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">{branch.name}</h3>
            <div className="flex gap-1">
              {branch.is_main && (
                <Badge variant="default" className="bg-primary">
                  Principal
                </Badge>
              )}
              {!branch.is_active && <Badge variant="outline">Inactiva</Badge>}
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <span>{branch.address}</span>
            </div>
            {branch.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{branch.phone}</span>
              </div>
            )}
            {branch.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{branch.email}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between bg-muted/50 px-6 py-3">
          <Button variant="ghost" size="sm" className="gap-1" onClick={onEdit}>
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-destructive hover:text-destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={branch.is_main && true} // No permitir eliminar la sucursal principal
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la sucursal &quot;{branch.name}&quot; y no se puede deshacer. Todos los menús asociados a esta
              sucursal también se eliminarán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground">
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
