"use client"

import type React from "react"

import { useEffect, useState } from "react"

export function DatabaseInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        // Esta función solo verificaría la conexión, no es necesaria para la inicialización
        // ya que las tablas ya están creadas mediante SQL
        setIsInitialized(true)
      } catch (err) {
        console.error("Error checking database:", err)
        setError("Error connecting to database")
      }
    }

    checkDatabase()
  }, [])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Database Error</h1>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Initializing Database...</h1>
          <p>Please wait while we set up the system.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
