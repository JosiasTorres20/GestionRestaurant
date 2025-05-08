"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"

export default function DebugPage() {
  const { user, userDetails } = useAuth()
  const [cookies, setCookies] = useState<string[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [apiResponse, setApiResponse] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Get all cookies
    const allCookies = document.cookie.split(";").map((cookie) => cookie.trim())
    setCookies(allCookies)
  }, [])

  const checkApi = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/debug-session")
      const data = await response.json()
      setApiResponse(data)
    } catch (error) {
      console.error("Error checking API:", error)
      setApiResponse({ error: "Failed to fetch API" })
    } finally {
      setLoading(false)
    }
  }

  const setTestCookie = () => {
    document.cookie = `test_cookie=value; path=/; max-age=${60 * 60}`
    const allCookies = document.cookie.split(";").map((cookie) => cookie.trim())
    setCookies(allCookies)
  }

  return (
    <div className="container py-10 space-y-6">
      <h1 className="text-3xl font-bold">Authentication Debug</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Client-Side Auth State</CardTitle>
            <CardDescription>Current authentication state in the browser</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">User:</h3>
                <pre className="mt-2 p-4 bg-muted rounded-md overflow-auto text-xs">
                  {user ? JSON.stringify(user, null, 2) : "Not authenticated"}
                </pre>
              </div>

              <div>
                <h3 className="font-medium">User Details:</h3>
                <pre className="mt-2 p-4 bg-muted rounded-md overflow-auto text-xs">
                  {userDetails ? JSON.stringify(userDetails, null, 2) : "No user details"}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cookies</CardTitle>
            <CardDescription>Current cookies in the browser</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={setTestCookie} variant="outline" size="sm">
                Set Test Cookie
              </Button>

              {cookies.length > 0 ? (
                <ul className="space-y-2">
                  {cookies.map((cookie, index) => (
                    <li key={index} className="p-2 bg-muted rounded-md text-xs font-mono">
                      {cookie}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No cookies found</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>API Authentication Check</CardTitle>
            <CardDescription>Check if the server recognizes your authentication</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button onClick={checkApi} disabled={loading}>
                  {loading ? "Checking..." : "Check API Authentication"}
                </Button>
              </div>

              {apiResponse && (
                <pre className="mt-2 p-4 bg-muted rounded-md overflow-auto text-xs">
                  {apiResponse ? JSON.stringify(apiResponse, null, 2) : ''}
                </pre>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
