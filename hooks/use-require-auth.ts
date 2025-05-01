"use client"

import { useAuth } from "../components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export const useRequireAuth = (redirectUrl = '/login') => {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectUrl)
    }
  }, [isLoading, user, router, redirectUrl])

  return { user, isLoading }
}