import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Inicialización de cliente Supabase para server-side
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Buscar la transacción por el token de Webpay
    const { data: transaction, error } = await supabase
      .from("webpay_transactions")
      .select("*")
      .eq("webpay_token", token)
      .single()

    if (error || !transaction) {
      console.error("Error fetching transaction:", error)
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // En un entorno real, aquí se confirmaría el pago con la API de Webpay
    // Para fines de demostración, simularemos una confirmación exitosa

    // Actualizar estado de la transacción
    await supabase
      .from("webpay_transactions")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction.id)

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
    })
  } catch (error) {
    console.error("Error confirming Webpay payment:", error)
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 })
  }
}
