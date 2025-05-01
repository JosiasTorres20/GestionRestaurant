"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/providers/auth-provider"
import { UserRole } from "@/types"

// Tipos
export type UserWithCredentials = {
  id: string
  email: string
  role: UserRole
  restaurant_id: string | null
  restaurant_name?: string
  created_at: string
  username?: string
}

export type Restaurant = {
  id: string
  name: string
}

export function useUserData() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const { user } = useAuth()

  const [users, setUsers] = useState<UserWithCredentials[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [selectedUser, setSelectedUser] = useState<UserWithCredentials | null>(null)

  const [newUser, setNewUser] = useState({
    email: "",
    username: "",
    password: "",
    role: UserRole.RESTAURANT_ADMIN,
    restaurant_id: "",
  })

  const isRootAdmin = user?.role === UserRole.ROOT_ADMIN

  // Cargar datos
  useEffect(() => {
    if (!user) return

    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        let query = supabase
          .from("users")
          .select(`
            id,
            email,
            role,
            restaurant_id,
            created_at,
            restaurants(name)
          `)
          .order("created_at", { ascending: false })

        // Si no es root admin, filtrar por restaurante
        if (!isRootAdmin && user.restaurantId) {
          query = query.eq("restaurant_id", user.restaurantId)
        }

        const { data: usersData, error: usersError } = await query

        if (usersError) throw usersError

        // Obtener credenciales (usernames)
        const { data: credentialsData, error: credentialsError } = await supabase
          .from("credentials")
          .select("user_id, username")
          .in(
            "user_id",
            usersData.map((u) => u.id),
          )

        if (credentialsError) throw credentialsError

        // Combinar datos
        const usersWithCredentials = usersData.map((userData) => {
          const credential = credentialsData.find((c) => c.user_id === userData.id)
          return {
            ...userData,
            username: credential?.username || "",
            restaurant_name: userData.restaurants?.name,
          }
        })

        setUsers(usersWithCredentials)

        // Cargar restaurantes si es root admin
        if (isRootAdmin) {
          const { data: restaurantsData, error: restaurantsError } = await supabase
            .from("restaurants")
            .select("id, name")
            .order("name")

          if (restaurantsError) throw restaurantsError

          setRestaurants(restaurantsData)
        } else if (user.restaurantId) {
          // Si es admin de restaurante, cargar solo su restaurante
          const { data: restaurantData, error: restaurantError } = await supabase
            .from("restaurants")
            .select("id, name")
            .eq("id", user.restaurantId)
            .single()

          if (restaurantError) throw restaurantError

          setRestaurants([restaurantData])
        }
      } catch (error) {
        console.error("Error al cargar usuarios:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [supabase, user, isRootAdmin, toast])

  // Crear usuario
  const createUser = async () => {
    if (!newUser.email || !newUser.username || !newUser.password) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      })
      return false
    }

    if (newUser.role !== UserRole.ROOT_ADMIN && !newUser.restaurant_id) {
      toast({
        title: "Error",
        description: "Debes seleccionar un restaurante para este usuario",
        variant: "destructive",
      })
      return false
    }

    try {
      // 1. Crear usuario en la tabla users
      const { data: userData, error: userError } = await supabase
        .from("users")
        .insert({
          email: newUser.email,
          role: newUser.role,
          restaurant_id: newUser.role === UserRole.ROOT_ADMIN ? null : newUser.restaurant_id,
        })
        .select()

      if (userError) throw userError

      // 2. Crear credenciales
      const { error: credentialError } = await supabase.from("credentials").insert({
        user_id: userData[0].id,
        username: newUser.username,
        password: newUser.password, // Nota: En producción, esto debería estar hasheado
      })

      if (credentialError) throw credentialError

      // 3. Obtener nombre del restaurante si aplica
      let restaurantName = null
      if (newUser.restaurant_id) {
        const restaurant = restaurants.find((r) => r.id === newUser.restaurant_id)
        restaurantName = restaurant?.name
      }

      // 4. Actualizar estado local
      const newUserWithDetails: UserWithCredentials = {
        ...userData[0],
        username: newUser.username,
        restaurant_name: restaurantName,
      }

      setUsers([newUserWithDetails, ...users])
      resetNewUserForm()

      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      })

      return true
    } catch (error) {
      console.error("Error al crear usuario:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el usuario",
        variant: "destructive",
      })
      return false
    }
  }

  // Actualizar usuario
  const updateUser = async () => {
    if (!selectedUser) return false

    if (!selectedUser.email) {
      toast({
        title: "Error",
        description: "El email es obligatorio",
        variant: "destructive",
      })
      return false
    }

    if (selectedUser.role !== UserRole.ROOT_ADMIN && !selectedUser.restaurant_id) {
      toast({
        title: "Error",
        description: "Debes seleccionar un restaurante para este usuario",
        variant: "destructive",
      })
      return false
    }

    try {
      // 1. Actualizar usuario
      const { error: userError } = await supabase
        .from("users")
        .update({
          email: selectedUser.email,
          role: selectedUser.role,
          restaurant_id: selectedUser.role === UserRole.ROOT_ADMIN ? null : selectedUser.restaurant_id,
        })
        .eq("id", selectedUser.id)

      if (userError) throw userError

      // 2. Actualizar credenciales si cambió el username
      if (selectedUser.username) {
        const { error: credentialError } = await supabase
          .from("credentials")
          .update({
            username: selectedUser.username,
          })
          .eq("user_id", selectedUser.id)

        if (credentialError) throw credentialError
      }

      // 3. Actualizar estado local
      setUsers(users.map((u) => (u.id === selectedUser.id ? selectedUser : u)))

      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado exitosamente",
      })

      return true
    } catch (error) {
      console.error("Error al actualizar usuario:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        variant: "destructive",
      })
      return false
    }
  }

  // Eliminar usuario
  const deleteUser = async (userId: string) => {
    try {
      // Eliminar usuario (las credenciales se eliminarán por la restricción de clave foránea)
      const { error } = await supabase.from("users").delete().eq("id", userId)

      if (error) throw error

      // Actualizar estado local
      setUsers(users.filter((u) => u.id !== userId))

      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente",
      })

      return true
    } catch (error) {
      console.error("Error al eliminar usuario:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive",
      })
      return false
    }
  }

  // Resetear formulario
  const resetNewUserForm = () => {
    setNewUser({
      email: "",
      username: "",
      password: "",
      role: UserRole.RESTAURANT_ADMIN,
      restaurant_id: "",
    })
  }

  return {
    // Estado
    users,
    restaurants,
    isLoading,
    selectedUser,
    newUser,

    // Setters
    setSelectedUser,
    setNewUser,

    // CRUD
    createUser,
    updateUser,
    deleteUser,

    // Utilidades
    resetNewUserForm,
  }
}
