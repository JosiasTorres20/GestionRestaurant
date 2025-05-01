"use client"

import React, { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChefHat } from "lucide-react"
import Link from "next/link"


export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, user } = useAuth()

  const [redirectionInProgress, setRedirectionInProgress] = useState(false)
  
  // Check if already authenticated
  useEffect(() => {
    if (user) {
      console.log("[LoginPage] User already authenticated, redirecting to dashboard");
      setRedirectionInProgress(true);
      router.replace("/dashboard");
    }
  }, [user, router]);
  
  // Handle username changes safely
  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setUsername(e.target.value);
  }, []);
  
  // Handle password changes safely
  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setPassword(e.target.value);
  }, []);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    console.log("[handleLogin] Login button pressed");
  
    if (isLoading || redirectionInProgress) return;
  
    setIsLoading(true);
  
    try {
      console.log("[handleLogin] Attempting login with:", username);
      const result = await signIn(username.trim(), password);
      console.log("[handleLogin] Sign in result:", result);
  
      if (result.error) {
        console.error("[handleLogin] Login error:", result.error);
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.success) {
        console.log("[handleLogin] Login successful. Redirecting...");
        console.log("[handleLogin] User after login:", result.user);
        toast({
          title: "Éxito",
          description: "Inicio de sesión exitoso. Redirigiendo...",
        });
        setRedirectionInProgress(true);
        router.replace("/dashboard");
      } else {
        console.error("[handleLogin] Unexpected result:", result);
      }
    } catch (error) {
      console.error("[handleLogin] Unexpected error:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  


  // Go to register safely
  const goToRegister = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    console.log("[goToRegister] Register button clicked");
    router.push("/register/plans");
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md mb-4">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <ChefHat className="h-6 w-6" />
            <CardTitle className="text-2xl">JTaste</CardTitle>
          </div>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder a tu panel de control
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="Nombre de usuario"
                value={username}
                onChange={handleUsernameChange}
                disabled={isLoading || redirectionInProgress}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
                  ¿Has olvidado tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                disabled={isLoading || redirectionInProgress}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || redirectionInProgress}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">O</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={goToRegister}
              disabled={isLoading || redirectionInProgress}
            >
              Registra tu restaurante
            </Button>
          </CardFooter>
        </form>
      </Card>

    </div>
  )
}