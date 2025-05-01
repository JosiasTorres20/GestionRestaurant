"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/providers/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, ChefHat } from "lucide-react"
import type { Plan } from "@/types"

// Reemplazar la definición hardcodeada de planes con una carga desde la base de datos

// Eliminar esta constante:
// Y reemplazarla con:
export default function PlansPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoadingPlans, setIsLoadingPlans] = useState(true)
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  // Agregar este useEffect para cargar los planes desde la base de datos
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from("plans")
          .select("*")
          .eq("is_active", true)
          .order("price", { ascending: true })

        if (error) throw error

        // Convertir las características de JSONB a array
        const formattedPlans = data.map((plan) => ({
          ...plan,
          features: Array.isArray(plan.features) ? plan.features : [],
        }))

        setPlans(formattedPlans)
      } catch (error) {
        console.error("Error fetching plans:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los planes disponibles",
          variant: "destructive",
        })
      } finally {
        setIsLoadingPlans(false)
      }
    }

    fetchPlans()
  }, [supabase, toast])

  const handleContinue = async () => {
    if (!email || !selectedPlan) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu email y selecciona un plan",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Verificar si el email ya está registrado
      const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).maybeSingle()

      if (existingUser) {
        toast({
          title: "Error",
          description: "Este email ya está registrado. Por favor inicia sesión.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // 2. Crear transacción de pago pendiente
      const { data: transaction, error } = await supabase
        .from("webpay_transactions")
        .insert({
          user_email: email,
          amount: selectedPlan.price,
          plan_id: selectedPlan.id,
          status: "pending",
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating transaction:", error)
        toast({
          title: "Error",
          description: "No se pudo crear la transacción",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // 3. Iniciar proceso de pago con Webpay
      router.push(`/register/payment?txId=${transaction.id}`)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/40 p-4">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2">
            <ChefHat className="h-8 w-8" />
            <h1 className="text-3xl font-bold">RestaurantOS</h1>
          </div>
          <h2 className="mt-6 text-3xl font-bold">Selecciona tu plan</h2>
          <p className="mt-2 text-muted-foreground">Elige el plan que mejor se adapte a tu restaurante</p>
        </div>

        <div className="mb-8">
          <Card className="mx-auto max-w-md shadow-sm">
            <CardHeader>
              <CardTitle>Ingresa tu email</CardTitle>
              <CardDescription>Te enviaremos información del pago y acceso a tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </CardContent>
          </Card>
        </div>

        {/* Modificar la sección de renderizado de planes para mostrar un estado de carga */}
        {/* Reemplazar la sección de grid de planes con: */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          {isLoadingPlans ? (
            <>
              <Card className="shadow-sm">
                <CardHeader className="space-y-2">
                  <div className="h-7 w-1/2 animate-pulse rounded bg-muted"></div>
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
                  <div className="h-8 w-1/3 animate-pulse rounded bg-muted"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-pulse rounded-full bg-muted"></div>
                        <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="h-10 w-full animate-pulse rounded bg-muted"></div>
                </CardFooter>
              </Card>
              <Card className="shadow-sm">
                <CardHeader className="space-y-2">
                  <div className="h-7 w-1/2 animate-pulse rounded bg-muted"></div>
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
                  <div className="h-8 w-1/3 animate-pulse rounded bg-muted"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-pulse rounded-full bg-muted"></div>
                        <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="h-10 w-full animate-pulse rounded bg-muted"></div>
                </CardFooter>
              </Card>
              <Card className="shadow-sm">
                <CardHeader className="space-y-2">
                  <div className="h-7 w-1/2 animate-pulse rounded bg-muted"></div>
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
                  <div className="h-8 w-1/3 animate-pulse rounded bg-muted"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-pulse rounded-full bg-muted"></div>
                        <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="h-10 w-full animate-pulse rounded bg-muted"></div>
                </CardFooter>
              </Card>
            </>
          ) : plans.length > 0 ? (
            plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all duration-200 ${
                  selectedPlan?.id === plan.id ? "border-primary shadow-md" : "shadow-sm hover:shadow"
                } ${plan.is_popular ? "border-primary" : ""}`}
                onClick={() => setSelectedPlan(plan)}
              >
                {plan.is_popular && (
                  <div className="absolute right-0 top-0 bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-2 text-3xl font-bold">
                    {formatPrice(plan.price)}
                    <span className="text-sm font-normal text-muted-foreground">/mes</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={selectedPlan?.id === plan.id ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setSelectedPlan(plan)}
                  >
                    {selectedPlan?.id === plan.id ? "✓ Seleccionado" : "Seleccionar"}
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-muted-foreground">No hay planes disponibles en este momento.</p>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            disabled={!selectedPlan || !email || isSubmitting}
            onClick={handleContinue}
            className="px-8"
          >
            {isSubmitting ? "Procesando..." : "Continuar con el pago"}
          </Button>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Al continuar, aceptas nuestros{" "}
          <a href="#" className="underline hover:text-primary">
            Términos y Condiciones
          </a>{" "}
          y{" "}
          <a href="#" className="underline hover:text-primary">
            Política de Privacidad
          </a>
        </div>
      </div>
    </div>
  )
}
