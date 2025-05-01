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
import { Button } from "@/components/ui/button"
import { useUserData } from "@/hooks/use-user-data"
import { UserRole } from "@/types"
import { useAuth } from "@/components/providers/auth-provider"

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: "create" | "edit"
}

export function UserDialog({ open, onOpenChange, mode = "create" }: UserDialogProps) {
  const { 
    selectedUser, 
    setSelectedUser,
    newUser, 
    setNewUser,
    restaurants,
    createUser,
    updateUser
  } = useUserData()
  
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const isRootAdmin = user?.role === UserRole.ROOT_ADMIN
  const isEditing = mode === "edit"

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setIsSubmitting(false)
    }
  }, [open])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      let success = false
      
      if (isEditing) {
        success = await updateUser()
      } else {
        success = await createUser()
      }
      
      if (success) {
        onOpenChange(false)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Actualiza la información del usuario" 
              : "Crea un nuevo usuario en el sistema"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={isEditing ? selectedUser?.email : newUser.email}
              onChange={(e) =>
                isEditing
                  ? selectedUser && setSelectedUser({ ...selectedUser, email: e.target.value })
                  : setNewUser({ ...newUser, email: e.target.value })
              }
              placeholder="usuario@ejemplo.com"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="username">Nombre de usuario</Label>
            <Input
              id="username"
              value={isEditing ? selectedUser?.username : newUser.username}
              onChange={(e) =>
                isEditing
                  ? selectedUser && setSelectedUser({ ...selectedUser, username: e.target.value })
                  : setNewUser({ ...newUser, username: e.target.value })
              }
              placeholder="nombre_usuario"
            />
          </div>
          
          {!isEditing && (
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="role">Rol</Label>
            <select
              id="role"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={isEditing ? selectedUser?.role : newUser.role}
              onChange={(e) => {
                const role = e.target.value as UserRole
                if (isEditing) {
                  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                  selectedUser && setSelectedUser({ ...selectedUser, role })
                } else {
                  setNewUser({ ...newUser, role })
                }
              }}
            >
              {isRootAdmin && <option value={UserRole.ROOT_ADMIN}>Admin Raíz</option>}
              <option value={UserRole.RESTAURANT_ADMIN}>Admin Restaurante</option>
              <option value={UserRole.KITCHEN}>Personal de Cocina</option>
            </select>
          </div>
          
          {((isEditing && selectedUser?.role !== UserRole.ROOT_ADMIN) || 
             (!isEditing && newUser.role !== UserRole.ROOT_ADMIN)) && (
            <div className="grid gap-2">
              <Label htmlFor="restaurant">Restaurante</Label>
              <select
                id="restaurant"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={isEditing ? selectedUser?.restaurant_id || "" : newUser.restaurant_id}
                onChange={(e) => {
                  const restaurant_id = e.target.value
                  if (isEditing) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                    selectedUser && setSelectedUser({ ...selectedUser, restaurant_id })
                  } else {
                    setNewUser({ ...newUser, restaurant_id })
                  }
                }}
              >
                <option value="">Seleccionar restaurante</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isEditing ? "Guardar Cambios" : "Crear Usuario"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  
}
