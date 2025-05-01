"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabase } from "@/components/providers/supabase-provider"

export function DebugCredentials() {
  const { supabase } = useSupabase()
  interface Credential {
    username: string
    user_id: string
    is_locked: boolean
    failed_attempts: number
    email?: string
    role?: string
  }

  const [credentials, setCredentials] = useState<Credential[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCredentials = async () => {
    setLoading(true)
    setError(null)
    try {
      // Obtener credenciales (solo para depuración)
      const { data, error } = await supabase
        .from("credentials")
        .select("username, user_id, is_locked, failed_attempts")
        .order("username")

      if (error) {
        throw error
      }

      // Obtener información de usuarios relacionada
      if (data && data.length > 0) {
        const userIds = data.map(cred => cred.user_id)
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, email, role")
          .in("id", userIds)

        if (usersError) {
          throw usersError
        }

        // Combinar datos
        const combinedData = data.map(cred => {
          const user = usersData?.find(u => u.id === cred.user_id)
          return {
            ...cred,
            email: user?.email,
            role: user?.role
          }
        })

        setCredentials(combinedData)
      } else {
        setCredentials([])
      }
    } catch (err: unknown) {
      console.error("Error al obtener credenciales:", err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Error al obtener credenciales")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Credenciales Disponibles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={fetchCredentials} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? "Cargando..." : "Verificar Credenciales"}
          </Button>

          {error && (
            <div className="text-sm text-destructive">
              Error: {error}
            </div>
          )}

          {credentials.length > 0 ? (
            <div className="text-sm">
              <div className="font-medium mb-2">Credenciales encontradas:</div>
              <div className="bg-muted p-2 rounded overflow-auto max-h-60">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-1">Usuario</th>
                      <th className="text-left p-1">Email</th>
                      <th className="text-left p-1">Rol</th>
                      <th className="text-left p-1">Bloqueado</th>
                      <th className="text-left p-1">Intentos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {credentials.map((cred, i) => (
                      <tr key={i} className="border-b border-muted-foreground/20">
                        <td className="p-1">{cred.username}</td>
                        <td className="p-1">{cred.email || "N/A"}</td>
                        <td className="p-1">{cred.role || "N/A"}</td>
                        <td className="p-1">{cred.is_locked ? "Sí" : "No"}</td>
                        <td className="p-1">{cred.failed_attempts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Nota: Para pruebas, la contraseña por defecto suele ser password o el mismo nombre de usuario.
              </div>
            </div>
          ) : credentials.length === 0 && !loading && !error ? (
            <div className="text-sm text-muted-foreground">
              No se encontraron credenciales. Haz clic en Verificar Credenciales para buscar.
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
