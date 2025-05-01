"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash, User } from "lucide-react"
import type { UserWithCredentials } from "@/hooks/use-user-data"

import { useUserData } from "@/hooks/use-user-data"
import { UserRole } from "@/types"
import { useAuth } from "@/components/providers/auth-provider"

interface UserListProps {
  users: UserWithCredentials[]
  isLoading: boolean
}

export function UserList({ users, isLoading }: UserListProps){


  const { setSelectedUser } = useUserData()
  const { user } = useAuth()

  const isRootAdmin = user?.role === UserRole.ROOT_ADMIN

  const handleEditUser = (user: UserWithCredentials) => {
    setSelectedUser(user)
  }



  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ROOT_ADMIN:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case UserRole.RESTAURANT_ADMIN:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case UserRole.KITCHEN:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case UserRole.ROOT_ADMIN:
        return "Admin Raíz"
      case UserRole.RESTAURANT_ADMIN:
        return "Admin Restaurante"
      case UserRole.KITCHEN:
        return "Personal de Cocina"
      default:
        return "Usuario"
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-6 w-24 rounded-md bg-muted"></div>
              <div className="h-4 w-32 rounded-md bg-muted"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 w-full rounded-md bg-muted"></div>
                <div className="h-4 w-3/4 rounded-md bg-muted"></div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="h-9 w-full rounded-md bg-muted"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <User className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">No se encontraron usuarios</p>
          <p className="text-sm text-muted-foreground">Añade un nuevo usuario para comenzar</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id} className="hover-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">{user.email}</CardTitle>
                  {user.username && <CardDescription>Usuario: {user.username}</CardDescription>}
                </div>
                <Badge className={getRoleBadgeColor(user.role)}>{getRoleName(user.role)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Creado:</span> {formatDate(user.created_at)}
              </div>
              {user.restaurant_name && (
                <div className="text-sm">
                  <span className="font-medium">Restaurante:</span> {user.restaurant_name}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" className="gap-1" onClick={() => handleEditUser(user)}>
                <Edit className="h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-destructive hover:text-destructive"

                disabled={user.role === UserRole.ROOT_ADMIN && !isRootAdmin}
              >
                <Trash className="h-4 w-4" />
                Eliminar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>



    </>
  )
  }