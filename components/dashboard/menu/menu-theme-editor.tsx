"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useMenuData } from "@/hooks/use-menu-data"
import { getPublicMenuUrl } from "@/lib/services/menu-service"
import { QRCode } from "@/components/dashboard/menu/qr-code"
import {
  AlertCircle,
  CheckCircle,
  Clipboard,
  ExternalLink,
  Eye,
  ImageIcon,
  Palette,
  TypeIcon as Typography,
} from "lucide-react"
import type { ThemeSettings } from "@/types"

interface MenuThemeEditorProps {
  menuId: string
}

export function MenuThemeEditor({ menuId }: MenuThemeEditorProps) {
  const { toast } = useToast()
  const { themeSettings, getMenuById, updateThemeSettings } = useMenuData()
  const [activeTab, setActiveTab] = useState("colors")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [localTheme, setLocalTheme] = useState<ThemeSettings | null>(null)
  const [menuUrl, setMenuUrl] = useState("")

  // Cargar datos del menú y tema
  useEffect(() => {
    const loadMenuData = async () => {
      setIsLoading(true)
      try {
        const menu = await getMenuById(menuId)
        if (menu && menu.theme) {
          setLocalTheme(menu.theme)
          // Generar URL para el menú público
          const url = getPublicMenuUrl(menu.restaurant_id || "", menu.id)
          setMenuUrl(url)
        } else {
          setLocalTheme({
            menu_id: menuId,
            primary_color: "#4f46e5",
            secondary_color: "#f9fafb",
            font_family: "Inter, sans-serif",
            logo_url: null,
            background_image_url: null,
            show_prices: true,
            enable_ordering: true,
            header_style: "default",
            footer_style: "default",
            item_layout: "grid",
          })
        }
      } catch (error) {
        console.error("Error loading menu theme:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del tema",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadMenuData()
  }, [menuId, getMenuById, toast])

  // Manejar cambios en el tema
  const handleThemeChange = (field: keyof ThemeSettings, value: any) => {
    if (localTheme) {
      setLocalTheme({
        ...localTheme,
        [field]: value,
      })
    }
  }

  // Guardar cambios en el tema
  const handleSaveTheme = async () => {
    if (!localTheme) return

    setIsSaving(true)
    try {
      const success = await updateThemeSettings(localTheme)
      if (success) {
        toast({
          title: "Éxito",
          description: "Tema actualizado correctamente",
        })
      }
    } catch (error) {
      console.error("Error saving theme:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el tema",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Copiar URL al portapapeles
  const copyUrlToClipboard = () => {
    const fullUrl = `${window.location.origin}${menuUrl}`
    navigator.clipboard.writeText(fullUrl)
    toast({
      title: "URL copiada",
      description: "La URL del menú ha sido copiada al portapapeles",
    })
  }

  // Abrir el menú en una nueva pestaña
  const openMenuInNewTab = () => {
    const fullUrl = `${window.location.origin}${menuUrl}`
    window.open(fullUrl, "_blank")
  }

  if (isLoading || !localTheme) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <span>Cargando configuración del tema...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-7">
      <div className="space-y-6 md:col-span-4">
        <Card>
          <CardHeader>
            <CardTitle>Personalización del Menú</CardTitle>
            <CardDescription>
              Personaliza la apariencia de tu menú público para adaptarlo a la identidad de tu restaurante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="colors" className="gap-2 items-center">
                  <Palette className="h-4 w-4" />
                  <span>Colores</span>
                </TabsTrigger>
                <TabsTrigger value="typography" className="gap-2 items-center">
                  <Typography className="h-4 w-4" />
                  <span>Tipografía</span>
                </TabsTrigger>
                <TabsTrigger value="images" className="gap-2 items-center">
                  <ImageIcon className="h-4 w-4" />
                  <span>Imágenes</span>
                </TabsTrigger>
                <TabsTrigger value="layout" className="gap-2 items-center">
                  <Eye className="h-4 w-4" />
                  <span>Diseño</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="colors" className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="primary-color">Color Primario</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-10 h-10 rounded-md border"
                        style={{ backgroundColor: localTheme.primary_color }}
                      />
                      <Input
                        id="primary-color"
                        type="text"
                        value={localTheme.primary_color}
                        onChange={(e) => handleThemeChange("primary_color", e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Este color se usará para botones, encabezados y acentos
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="secondary-color">Color Secundario</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-10 h-10 rounded-md border"
                        style={{ backgroundColor: localTheme.secondary_color }}
                      />
                      <Input
                        id="secondary-color"
                        type="text"
                        value={localTheme.secondary_color}
                        onChange={(e) => handleThemeChange("secondary_color", e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Este color se usará para fondos y textos de contraste
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="typography" className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="font-family">Familia de Fuente</Label>
                    <Select
                      value={localTheme.font_family}
                      onValueChange={(value) => handleThemeChange("font_family", value)}
                    >
                      <SelectTrigger id="font-family">
                        <SelectValue placeholder="Selecciona una fuente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter, sans-serif">Inter (Moderna)</SelectItem>
                        <SelectItem value="Merriweather, serif">Merriweather (Elegante)</SelectItem>
                        <SelectItem value="Montserrat, sans-serif">Montserrat (Versátil)</SelectItem>
                        <SelectItem value="Playfair Display, serif">Playfair Display (Clásica)</SelectItem>
                        <SelectItem value="Roboto, sans-serif">Roboto (Limpia)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">La fuente afectará a todos los textos de tu menú</p>
                  </div>

                  <div className="mt-4 p-4 rounded border">
                    <p className="mb-4 font-semibold" style={{ fontFamily: localTheme.font_family }}>
                      Vista previa de la fuente: {localTheme.font_family.split(",")[0]}
                    </p>
                    <p style={{ fontFamily: localTheme.font_family }}>
                      ABCDEFGHIJKLMNOPQRSTUVWXYZ
                      <br />
                      abcdefghijklmnopqrstuvwxyz
                      <br />
                      1234567890
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="images" className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="logo-url">URL del Logo</Label>
                    <Input
                      id="logo-url"
                      type="text"
                      value={localTheme.logo_url || ""}
                      onChange={(e) => handleThemeChange("logo_url", e.target.value || null)}
                      placeholder="https://ejemplo.com/logo.png"
                    />
                    <p className="text-xs text-muted-foreground">
                      La URL de la imagen de tu logo (formato recomendado: PNG con fondo transparente)
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="background-image-url">URL de Imagen de Fondo</Label>
                    <Input
                      id="background-image-url"
                      type="text"
                      value={localTheme.background_image_url || ""}
                      onChange={(e) => handleThemeChange("background_image_url", e.target.value || null)}
                      placeholder="https://ejemplo.com/fondo.jpg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Una imagen de fondo para la página de tu menú (opcional)
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="layout" className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="header-style">Estilo de Encabezado</Label>
                    <Select
                      value={localTheme.header_style}
                      onValueChange={(value: "default" | "minimal" | "fullwidth") =>
                        handleThemeChange("header_style", value)
                      }
                    >
                      <SelectTrigger id="header-style">
                        <SelectValue placeholder="Selecciona un estilo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Estándar (Logo y nombre)</SelectItem>
                        <SelectItem value="minimal">Minimalista (Solo logo)</SelectItem>
                        <SelectItem value="fullwidth">Completo (Banner con imagen)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="footer-style">Estilo de Pie de Página</Label>
                    <Select
                      value={localTheme.footer_style}
                      onValueChange={(value: "default" | "minimal" | "detailed") =>
                        handleThemeChange("footer_style", value)
                      }
                    >
                      <SelectTrigger id="footer-style">
                        <SelectValue placeholder="Selecciona un estilo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Estándar (Básico)</SelectItem>
                        <SelectItem value="minimal">Minimalista (Solo copyright)</SelectItem>
                        <SelectItem value="detailed">Detallado (Con información de contacto)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="item-layout">Disposición de Items</Label>
                    <Select
                      value={localTheme.item_layout}
                      onValueChange={(value: "grid" | "list" | "compact") => handleThemeChange("item_layout", value)}
                    >
                      <SelectTrigger id="item-layout">
                        <SelectValue placeholder="Selecciona un estilo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Cuadrícula (Imágenes grandes)</SelectItem>
                        <SelectItem value="list">Lista (Con imágenes en fila)</SelectItem>
                        <SelectItem value="compact">Compacto (Sin imágenes)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-prices">Mostrar Precios</Label>
                      <p className="text-xs text-muted-foreground">
                        Determina si los precios se muestran en el menú público
                      </p>
                    </div>
                    <Switch
                      id="show-prices"
                      checked={localTheme.show_prices}
                      onCheckedChange={(checked) => handleThemeChange("show_prices", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enable-ordering">Permitir Pedidos</Label>
                      <p className="text-xs text-muted-foreground">
                        Habilita la opción de realizar pedidos desde el menú
                      </p>
                    </div>
                    <Switch
                      id="enable-ordering"
                      checked={localTheme.enable_ordering}
                      onCheckedChange={(checked) => handleThemeChange("enable_ordering", checked)}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveTheme} disabled={isSaving} className="gap-2">
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6 md:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Menú Público</CardTitle>
            <CardDescription>Comparte tu menú con los clientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-48 h-48">
                <QRCode
                  value={`${window.location.origin}${menuUrl}`}
                  size={192}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"L"}
                />
              </div>
              <div className="text-sm text-center text-muted-foreground">Escanea este código QR para ver tu menú</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="menu-url">URL del Menú</Label>
              <div className="flex items-center gap-2">
                <Input id="menu-url" value={`${window.location.origin}${menuUrl}`} readOnly />
                <Button variant="outline" size="icon" onClick={copyUrlToClipboard} title="Copiar URL">
                  <Clipboard className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={openMenuInNewTab} title="Abrir en nueva pestaña">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-md bg-amber-50 p-4 mt-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800">Importante</h4>
                  <div className="text-sm text-amber-700 mt-1">
                    <p>Los cambios en el tema se reflejarán inmediatamente en tu menú público después de guardar.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
