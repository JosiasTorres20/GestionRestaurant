import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Inicialización de cliente Supabase para server-side
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const { transactionId } = await request.json()

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 })
    }

    // Obtener la transacción de la base de datos
    const { data: transaction, error } = await supabase
      .from("webpay_transactions")
      .select("*")
      .eq("id", transactionId)
      .single()

    if (error || !transaction) {
      console.error("Error fetching transaction:", error)
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // En un entorno real, aquí se inicializaría Webpay con la biblioteca oficial
    // Para fines de demostración, simularemos la respuesta de Webpay

    // URL de retorno después del pago

    // Generar un token y session_id simulados para Webpay
    const webpayToken = `WEBPAY-${Math.random().toString(36).substring(2, 15)}`
    const sessionId = `SESSION-${Math.random().toString(36).substring(2, 15)}`

    // Actualizar la transacción con los datos de Webpay
    await supabase
      .from("webpay_transactions")
      .update({
        webpay_token: webpayToken,
        webpay_session_id: sessionId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction.id)

    // URL simulada de redirección a Webpay
    // En producción, esta URL la proporcionaría la API de Webpay
    const webpayUrl = `/register/webpay-simulator?token=${webpayToken}`

    return NextResponse.json({
      token: webpayToken,
      url: webpayUrl,
    })
  } catch (error) {
    console.error("Error initializing Webpay:", error)
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 })
  }
}
