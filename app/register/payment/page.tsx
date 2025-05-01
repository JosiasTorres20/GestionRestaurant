"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChefHat, Loader2 } from "lucide-react"

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const transactionId = searchParams.get("txId")

  useEffect(() => {
    if (!transactionId) {
      setError("ID de transacción no encontrado")
      setIsLoading(false)
      return
    }

    const initializePayment = async () => {
      try {
        // Inicializar pago con Webpay
        const response = await fetch("/api/webpay/init", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ transactionId }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Error al inicializar el pago")
        }

        const data = await response.json()

        // Redirigir a la URL de Webpay
        router.push(data.url)
      } catch (error) {
        console.error("Error:", error)
        setError(error instanceof Error ? error.message : "Error inesperado")
        setIsLoading(false)
      }
    }

    initializePayment()
  }, [transactionId, router, toast])

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <ChefHat className="h-6 w-6" />
            <CardTitle className="text-2xl">RestaurantOS</CardTitle>
          </div>
          <CardDescription className="text-center">Procesando tu pago</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p>Conectando con la pasarela de pago...</p>
            </div>
          ) : error ? (
            <div className="text-center text-destructive">
              <p className="mb-4">{error}</p>
              <Button variant="outline" onClick={() => router.push("/register/plans")}>
                Volver a intentar
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
