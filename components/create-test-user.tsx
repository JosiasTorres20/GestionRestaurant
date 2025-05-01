"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSupabase } from "@/components/providers/supabase-provider"
import { UserRole } from "@/types"
import crypto from "crypto"

// Función de hash para coincidir con el método de PostgreSQL
const hashPassword = (password: string, salt: string) => {
  return crypto
    .createHash("sha256")
    .update(password + salt)
    .digest("hex")
}

// Función de generación de salt para mantener consistencia
const generateSalt = () => crypto.randomBytes(16).toString("hex")

export function CreateTestUser() {
  const { supabase } = useSupabase()
  const [username, setUsername] = useState("admin")
  const [email, setEmail] = useState("admin@example.com")
  const [password, setPassword] = useState("password")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const createTestUser = async () => {
    setLoading(true)
    setResult(null)

    try {
      // 1. Verificar si el usuario ya existe
      const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single()

      if (existingUser) {
        setResult({
          success: false,
          message: `El usuario con email ${email} ya existe. Intenta con otro email.`,
        })
        return
      }

      // 2. Crear usuario
      const { data: userData, error: userError } = await supabase
        .from("users")
        .insert({
          email: email,
          role: UserRole.ROOT_ADMIN,
          restaurant_id: null,
        })
        .select()

      if (userError) {
        throw new Error(`Error al crear usuario: ${userError.message}`)
      }

      if (!userData || userData.length === 0) {
        throw new Error("No se pudo crear el usuario")
      }

      const userId = userData[0].id

      // 3. Crear credenciales
      const salt = generateSalt()
      const hashedPassword = hashPassword(password, salt)

      const { error: credentialError } = await supabase.from("credentials").insert({
        user_id: userId,
        username: username,
        password_hash: hashedPassword,
        salt: salt,
        failed_attempts: 0,
        is_locked: false,
      })

      if (credentialError) {
        // Eliminar el usuario si no se pudieron crear las credenciales
        await supabase.from("users").delete().eq("id", userId)
        throw new Error(`Error al crear credenciales: ${credentialError.message}`)
      }

      setResult({
        success: true,
        message: `Usuario de prueba creado exitosamente. Usuario: ${username}, Contraseña: ${password}`,
      })
    } catch (error: unknown) {
      console.error("Error al crear usuario de prueba:", error)
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Error al crear usuario de prueba",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Crear Usuario de Prueba</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Nombre de usuario</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
            />
          </div>

          <Button onClick={createTestUser} disabled={loading} variant="outline" size="sm">
            {loading ? "Creando..." : "Crear Usuario de Prueba"}
          </Button>

          {result && (
            <div
              className={`text-sm p-2 rounded ${result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {result.message}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
