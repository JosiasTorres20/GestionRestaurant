import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider as NextThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/toaster"
import { SupabaseProvider } from "@/components/providers/supabase-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { DatabaseInitializer } from "@/components/providers/database-initializer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema de Gestión de Restaurantes",
  description: "Una solución completa para gestionar su restaurante",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <NextThemeProvider attribute="class" defaultTheme="system">
          <SupabaseProvider>
            <DatabaseInitializer>
              <AuthProvider>
                <ThemeProvider>
                  {children}
                  <Toaster />
                </ThemeProvider>
              </AuthProvider>
            </DatabaseInitializer>
          </SupabaseProvider>
        </NextThemeProvider>
      </body>
    </html>
  )
}
