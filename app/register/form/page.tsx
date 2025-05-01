"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSupabase } from "@/components/providers/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChefHat, Loader2 } from "lucide-react"
import Link from "next/link"
import type { UserRole } from "@/types"
import crypto from "crypto"

export default function RegistrationFormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("restaurant")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const transactionId = searchParams.get("txId")

  // Restaurant information
  const [restaurantName, setRestaurantName] = useState("")
  const [restaurantAddress, setRestaurantAddress] = useState("")
  const [restaurantPhone, setRestaurantPhone] = useState("")
  const [restaurantWhatsapp, setRestaurantWhatsapp] = useState("")
  const [primaryColor, setPrimaryColor] = useState("#4f46e5")
  const [secondaryColor, setSecondaryColor] = useState("#10b981")

  // Admin information
  const [adminEmail, setAdminEmail] = useState("")
  const [adminUsername, setAdminUsername] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const navigateTab = (tab: string) => {
    setActiveTab(tab)
  }

  // Helper para generar salt
  const generateSalt = () => crypto.randomBytes(16).toString("hex")

  // Helper para generar hash seguro
  const hashPassword = (password: string, salt: string) => {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  }

  // Función para validar el formulario
  const validateForm = () => {
    if (!restaurantName) {
      toast({
        title: "Error",
        description: "El nombre del restaurante es obligatorio",
        variant: "destructive",
      })
      setActiveTab("restaurant")
      return false
    }

    if (!adminEmail || !adminUsername || !adminPassword) {
      toast({
        title: "Error",
        description: "Todos los campos del administrador son obligatorios",
        variant: "destructive",
      })
      setActiveTab("admin")
      return false
    }

    if (adminPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      })
      setActiveTab("admin")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Verificar que el pago se haya completado
      if (transactionId) {
        const { data: transaction, error: txError } = await supabase
          .from("webpay_transactions")
          .select("*")
          .eq("id", transactionId)
          .eq("status", "completed")
          .single()

        if (txError || !transaction) {
          toast({
            title: "Error",
            description: "No se encontró una transacción de pago válida",
            variant: "destructive",
          })
          router.push("/register/plans")
          return
        }

        setAdminEmail(transaction.user_email)
      }

      // 1. Crear restaurante
      const { data: restaurant, error: restaurantError } = await supabase
        .from("restaurants")
        .insert({
          name: restaurantName,
          address: restaurantAddress,
          phone: restaurantPhone,
          whatsapp: restaurantWhatsapp,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          is_active: true,
        })
        .select()
        .single()

      if (restaurantError) {
        throw new Error(`Error al crear el restaurante: ${restaurantError.message}`)
      }

      // 2. Crear usuario
      const userRole: UserRole = "restaurant_admin"
      const userId = crypto.randomUUID()

      const { error: userError } = await supabase.from("users").insert({
        id: userId,
        email: adminEmail,
        role: userRole,
        restaurant_id: restaurant.id,
      })

      if (userError) {
        // Revertir la creación del restaurante
        await supabase.from("restaurants").delete().eq("id", restaurant.id)
        throw new Error(`Error al crear el usuario: ${userError.message}`)
      }

      // 3. Crear credenciales
      const salt = generateSalt()
      const passwordHash = hashPassword(adminPassword, salt)

      const { error: credentialError } = await supabase.from("credentials").insert({
        user_id: userId,
        username: adminUsername,
        password_hash: passwordHash,
        salt: salt,
        failed_attempts: 0,
        is_locked: false,
      })

      if (credentialError) {
        // Revertir creaciones anteriores
        await supabase.from("users").delete().eq("id", userId)
        await supabase.from("restaurants").delete().eq("id", restaurant.id)
        throw new Error(`Error al crear credenciales: ${credentialError.message}`)
      }

      // 4. Redirigir a página de éxito
      toast({
        title: "Registro completado",
        description: "Tu cuenta ha sido creada con éxito",
      })

      // Redirigir al login
      router.push("/login")
    } catch (error) {
      console.error("Error in registration:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ocurrió un error durante el registro",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/40 p-4">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2">
            <ChefHat className="h-8 w-8" />
            <h1 className="text-3xl font-bold">RestaurantOS</h1>
          </div>
          <h2 className="mt-6 text-3xl font-bold">Completa tu registro</h2>
          <p className="mt-2 text-muted-foreground">Configura tu restaurante y cuenta de administrador</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información de registro</CardTitle>
            <CardDescription>Completa los siguientes datos para configurar tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="restaurant">Restaurante</TabsTrigger>
                <TabsTrigger value="admin">Administrador</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit}>
                <TabsContent value="restaurant" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="restaurantName">Nombre del restaurante *</Label>
                    <Input
                      id="restaurantName"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="restaurantAddress">Dirección</Label>
                    <Input
                      id="restaurantAddress"
                      value={restaurantAddress}
                      onChange={(e) => setRestaurantAddress(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="restaurantPhone">Teléfono</Label>
                      <Input
                        id="restaurantPhone"
                        value={restaurantPhone}
                        onChange={(e) => setRestaurantPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="restaurantWhatsapp">WhatsApp</Label>
                      <Input
                        id="restaurantWhatsapp"
                        value={restaurantWhatsapp}
                        onChange={(e) => setRestaurantWhatsapp(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Color primario</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="h-10 w-10 cursor-pointer p-1"
                        />
                        <Input
                          type="text"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Color secundario</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="h-10 w-10 cursor-pointer p-1"
                        />
                        <Input
                          type="text"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button type="button" onClick={() => navigateTab("admin")}>
                      Continuar
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="admin" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Email *</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminUsername">Nombre de usuario *</Label>
                    <Input
                      id="adminUsername"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Contraseña *</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" type="button" onClick={() => navigateTab("restaurant")}>
                      Atrás
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Completando registro...
                        </>
                      ) : (
                        "Completar registro"
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </form>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="text-primary underline underline-offset-4">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
