"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function WebpaySimulatorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cardNumber, setCardNumber] = useState("4051 8856 0044 6623") // Número de tarjeta de prueba
  const [expiryDate, setExpiryDate] = useState("12/25")
  const [cvv, setCvv] = useState("123")

  const token = searchParams.get("token")

  const handlePayment = async (success: boolean) => {
    if (!token) {
      toast({
        title: "Error",
        description: "Token no válido",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Confirmar el pago con el backend
      const response = await fetch("/api/webpay/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, success }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al confirmar el pago")
      }

      const data = await response.json()

      // Redirigir a la página de confirmación
      router.push(`/register/confirm?txId=${data.transactionId}&status=${success ? "success" : "failure"}`)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error inesperado",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gradient-to-b from-blue-100 to-white min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-blue-700 text-white rounded-t-lg space-y-1">
          <div className="flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40" fill="none">
              <path
                d="M10 8H110C112.761 8 115 10.2386 115 13V33C115 35.7614 112.761 38 110 38H10C7.23858 38 5 35.7614 5 33V13C5 10.2386 7.23858 8 10 8Z"
                fill="white"
              />
              <path d="M35.5 18L31 22.5L35.5 27" stroke="#0055AA" strokeWidth="2" />
              <path d="M53.5 18L58 22.5L53.5 27" stroke="#0055AA" strokeWidth="2" />
              <path d="M48 15L41 30" stroke="#0055AA" strokeWidth="2" />
              <path d="M65 21H75" stroke="#0055AA" strokeWidth="2" />
              <path d="M65 24H75" stroke="#0055AA" strokeWidth="2" />
              <path d="M80 18V27" stroke="#0055AA" strokeWidth="2" />
              <path
                d="M80 18H85C86.1046 18 87 18.8954 87 20V20C87 21.1046 86.1046 22 85 22H80"
                stroke="#0055AA"
                strokeWidth="2"
              />
              <path
                d="M80 22H85C86.1046 22 87 22.8954 87 24V24C87 25.1046 86.1046 26 85 26H80"
                stroke="#0055AA"
                strokeWidth="2"
              />
              <path
                d="M90 18H92C94.2091 18 96 19.7909 96 22V22C96 24.2091 94.2091 26 92 26H90"
                stroke="#0055AA"
                strokeWidth="2"
              />
              <path d="M90 18V27" stroke="#0055AA" strokeWidth="2" />
            </svg>
          </div>
          <CardTitle className="text-center font-bold text-lg">PAGO DE PRUEBA</CardTitle>
          <CardDescription className="text-center text-blue-100">Simula una transacción de Webpay</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="text-center bg-blue-50 p-2 rounded-md text-blue-800 mb-6">
            <p className="text-sm">Esto es un simulador para demostración.</p>
            <p className="text-sm">En producción, se conectaría con la API real de Webpay.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Número de tarjeta</Label>
            <Input
              id="cardNumber"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="0000 0000 0000 0000"
              className="font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Fecha de vencimiento</Label>
              <Input
                id="expiryDate"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="MM/YY"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="123"
                className="font-mono"
                type="password"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col space-y-3">
          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => handlePayment(true)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Pagar y continuar"
            )}
          </Button>
          <Button
            variant="outline"
            className="w-full border-red-300 text-red-600 hover:bg-red-50"
            onClick={() => handlePayment(false)}
            disabled={isSubmitting}
          >
            Cancelar pago
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
