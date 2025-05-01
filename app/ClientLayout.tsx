"use client"

import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ProtectedRoute>
          {children}
        </ProtectedRoute>
      </body>
    </html>
  )
}
