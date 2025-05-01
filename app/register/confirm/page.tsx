"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSupabase } from "@/components/providers/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ChefHat, XCircle } from "lucide-react"
import type { WebpayTransaction } from "@/types"

export default function ConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [transaction, setTransaction] = useState<WebpayTransaction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const transactionId = searchParams.get("txId")
  const status = searchParams.get("status")

  useEffect(() => {
    if (!transactionId) {
      setError("ID de transacción no encontrado")
      setIsLoading(false)
      return
    }

    const fetchTransaction = async () => {
      try {
        const { data, error } = await supabase.from("webpay_transactions").select("*").eq("id", transactionId).single()

        if (error) throw error

        setTransaction(data as WebpayTransaction)
      } catch (error) {
        console.error("Error fetching transaction:", error)
        setError("No se pudo obtener la información de la transacción")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransaction()
  }, [transactionId, supabase])

  const handleContinue = () => {
    if (status === "success") {
      // Si el pago fue exitoso, redirigir al formulario de registro
      router.push(`/register/form?txId=${transactionId}`)
    } else {
      // Si el pago falló, volver a la página de planes
      router.push("/register/plans")
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <ChefHat className="h-6 w-6" />
              <CardTitle className="text-2xl">RestaurantOS</CardTitle>
            </div>
            <CardDescription className="text-center">Cargando información de la transacción...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <ChefHat className="h-6 w-6" />
              <CardTitle className="text-2xl">RestaurantOS</CardTitle>
            </div>
            <CardDescription className="text-center">Error</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <XCircle className="mx-auto h-16 w-16 text-destructive" />
            <p className="mt-4">{error}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => router.push("/register/plans")}>
              Volver a intentar
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <ChefHat className="h-6 w-6" />
            <CardTitle className="text-2xl">RestaurantOS</CardTitle>
          </div>
          <CardTitle className="text-center">
            {status === "success" ? "Pago confirmado" : "Pago no completado"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          {status === "success" ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="mt-4 text-lg font-medium">Tu pago ha sido procesado con éxito</p>
              <p className="mt-2 text-muted-foreground">
                Ahora completa el registro de tu restaurante para comenzar a usar la plataforma.
              </p>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-destructive" />
              <p className="mt-4 text-lg font-medium">Tu pago no fue completado</p>
              <p className="mt-2 text-muted-foreground">
                Ha ocurrido un problema con el procesamiento del pago. Por favor, intenta nuevamente.
              </p>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleContinue}>
            {status === "success" ? "Continuar con el registro" : "Volver a intentar"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
