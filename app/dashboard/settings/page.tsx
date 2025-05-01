"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { QrCode } from 'lucide-react'
import { useRestaurantSettings } from "@/hooks/settings/settings"

export default function SettingsPage() {
  const {
    restaurant,
    isLoading,
    isSaving,
    hasChanges,
    userDetails,
    handleSave,
    handleGenerateQR,
    handleRestaurantChange
  } = useRestaurantSettings()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Cargando ajustes...</p>
          <div className="h-4 w-32 bg-muted rounded animate-pulse mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight gradient-heading">Configuración</h1>
        <p className="text-muted-foreground">Administre la información y QR de su restaurante</p>
      </div>

      {userDetails?.restaurant_id ? (
        <>
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="qr">Código QR</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Información del Restaurante</CardTitle>
                  <CardDescription>Actualice la información básica de su restaurante</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Restaurante</Label>
                    <Input
                      id="name"
                      value={restaurant.name}
                      onChange={(e) => handleRestaurantChange('name', e.target.value)}
                      placeholder="Nombre del Restaurante"
                      disabled={false}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Textarea
                      id="address"
                      value={restaurant.address || ""}
                      onChange={(e) => handleRestaurantChange('address', e.target.value)}
                      placeholder="Dirección del Restaurante"
                      disabled={false}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Número de Teléfono</Label>
                      <Input
                        id="phone"
                        value={restaurant.phone || ""}
                        onChange={(e) => handleRestaurantChange('phone', e.target.value)}
                        placeholder="Número de Teléfono"
                        disabled={false}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">Número de WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        value={restaurant.whatsapp || ""}
                        onChange={(e) => handleRestaurantChange('whatsapp', e.target.value)}
                        placeholder="Número de WhatsApp"
                        disabled={false}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  className={`${
                    isSaving
                    ? "gradient-heading text-white hover:gradient-heading"
                    : hasChanges
                    ? "bg-[#4f46e5] text-white hover:bg-[#4f46e5]"
                    : "bg-muted text-muted-foreground"
                  }`}
                  >
                  {isSaving ? "Guardando..." : hasChanges ? "Guardar Cambios" : "Sin Cambios"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="qr" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Código QR del Menú</CardTitle>
                  <CardDescription>Genere un código QR para el menú de su restaurante</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative h-64 w-64 overflow-hidden rounded-lg border p-4">
                      <QrCode className="h-full w-full" />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleGenerateQR} disabled={false} className="brand-button gap-2">
                        <QrCode className="h-4 w-4" />
                        Generar Código QR
                      </Button>
                      <Button variant="outline" disabled={false}>
                        Descargar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No hay restaurante asignado</CardTitle>
            <CardDescription>
              Para acceder a los ajustes, primero debe crear o seleccionar un restaurante.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-amber-600 mb-4">
              Se ha detectado que su cuenta no tiene un restaurante asignado. Por favor, cree uno nuevo o seleccione uno
              existente para continuar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}