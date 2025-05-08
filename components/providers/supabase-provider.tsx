"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import type { Session, SupabaseClient } from "@supabase/supabase-js"

const SupabaseContext = createContext<{
  supabase: SupabaseClient
  session: Session | null
  isLoading: boolean
}>({
  supabase: null as unknown as SupabaseClient,
  session: null,
  isLoading: true,
})

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [supabase] = useState(() => createBrowserSupabaseClient())
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      setIsLoading(false)
    }

    getSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [supabase])

  return <SupabaseContext.Provider value={{ supabase, session, isLoading }}>{children}</SupabaseContext.Provider>
}

export const useSupabase = () => {
  return useContext(SupabaseContext)
}
