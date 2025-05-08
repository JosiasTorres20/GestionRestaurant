import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Variables para almacenar las instancias singleton
let serverSupabaseInstance: ReturnType<typeof createClient<Database>> | null = null
let browserSupabaseInstance: ReturnType<typeof createClient<Database>> | null = null

// Cliente para el servidor (Server Components)
export function createServerSupabaseClient() {
  // En el cliente, redirigir a la instancia del cliente
  if (typeof window !== "undefined") {
    return createBrowserSupabaseClient()
  }

  // Si ya existe una instancia en el servidor, la devolvemos
  if (serverSupabaseInstance) {
    return serverSupabaseInstance
  }

  // Si no existe, creamos una nueva instancia
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  serverSupabaseInstance = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false, // Importante para el servidor
    },
  })

  return serverSupabaseInstance
}

// Cliente para el navegador (Client Components)
export function createBrowserSupabaseClient() {
  // Solo crear una nueva instancia si estamos en el cliente y no existe ya
  if (typeof window !== "undefined") {
    if (browserSupabaseInstance) {
      return browserSupabaseInstance
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    browserSupabaseInstance = createClient<Database>(supabaseUrl, supabaseKey)
    return browserSupabaseInstance
  }

  // Fallback para el SSR
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
}

// IMPORTANTE: Mantener compatibilidad con código existente
export const createClientSupabaseClient = createBrowserSupabaseClient
export const clientSupabase = createBrowserSupabaseClient
