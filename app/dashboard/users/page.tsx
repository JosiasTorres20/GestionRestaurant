"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus } from "lucide-react"
import { UserList } from "@/components/users/user-list"
import { UserDialog } from "@/components/users/user-dialog"
import { useUserData } from "@/hooks/use-user-data"
import { useAuth } from "@/components/providers/auth-provider"
import { UserRole } from "@/types"

export default function UsersManagement() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)

  const { user } = useAuth()
  const { users, isLoading, resetNewUserForm } = useUserData()

  const isRootAdmin = user?.role === UserRole.ROOT_ADMIN

  const handleOpenCreateDialog = () => {
    resetNewUserForm()
    setIsUserDialogOpen(true)
  }

  // Filtrar usuarios según la pestaña activa
  const getFilteredUsers = () => {
    let filtered = users

    // Filtrar por rol según la pestaña
    if (activeTab === "admins") {
      filtered = users.filter((u) => u.role === UserRole.ROOT_ADMIN || u.role === UserRole.RESTAURANT_ADMIN)
    } else if (activeTab === "kitchen") {
      filtered = users.filter((u) => u.role === UserRole.KITCHEN)
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (u) => u.email.toLowerCase().includes(query) || (u.username && u.username.toLowerCase().includes(query)),
      )
    }

    return filtered
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-heading">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            {isRootAdmin ? "Administra todos los usuarios del sistema" : "Administra los usuarios de tu restaurante"}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all">Todos</TabsTrigger>
            {isRootAdmin && (
              <>
                <TabsTrigger value="admins">Administradores</TabsTrigger>
                <TabsTrigger value="kitchen">Personal de Cocina</TabsTrigger>
              </>
            )}
          </TabsList>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar usuarios..."
                className="pl-9 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button onClick={handleOpenCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Usuario
            </Button>
          </div>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          <UserList users={getFilteredUsers()} isLoading={isLoading} />
        </TabsContent>
      </Tabs>

      <UserDialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen} />
    </div>
  )
}
