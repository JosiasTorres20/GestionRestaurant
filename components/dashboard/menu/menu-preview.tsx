"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChefHat, ChevronRight, ComputerIcon as Desktop, ExternalLink, Smartphone, Star, Store } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"
import { QRDialog } from "@/components/dashboard/menu/qr-dialog"
import { getPublicMenuUrl } from "@/lib/services/menu-service"
import type { Menu, ThemeSettings } from "@/types"

interface MenuPreviewProps {
  menu?: Menu
}

export function MenuPreview({ menu }: MenuPreviewProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("mobile")
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false)
  const [menuUrl, setMenuUrl] = useState("")

  // Establecer la URL del menú cuando cambia el menú seleccionado
  useEffect(() => {
    if (menu?.id && menu.restaurant_id) {
      const url = getPublicMenuUrl(menu.restaurant_id, menu.id)
      setMenuUrl(url)
    }
  }, [menu])

  // Abrir el menú en una nueva pestaña
  const openMenuInNewTab = () => {
    if (!menuUrl) {
      toast({
        title: "Error",
        description: "No se pudo generar la URL del menú",
        variant: "destructive",
      })
      return
    }

    const fullUrl = `${window.location.origin}${menuUrl}`
    window.open(fullUrl, "_blank")
  }

  // Si no hay menú seleccionado, mostrar mensaje
  if (!menu) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Store className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">Selecciona un menú para ver la vista previa</p>
        </CardContent>
      </Card>
    )
  }

  // Establecer colores y estilos del tema
  const themeSettings: ThemeSettings = menu.theme || {
    menu_id: menu.id,
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
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Vista Previa del Menú</CardTitle>
            <CardDescription>
              {menu.name} - {menu.branch?.name || "Sucursal"}
              {menu.is_active ? (
                <Badge variant="default" className="ml-2 bg-green-600">
                  Activo
                </Badge>
              ) : (
                <Badge variant="outline" className="ml-2">
                  Inactivo
                </Badge>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsQRDialogOpen(true)}>
              Código QR
            </Button>
            <Button onClick={openMenuInNewTab} className="gap-2">
              Ver Menú <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="w-full md:w-auto mx-auto grid grid-cols-2">
              <TabsTrigger value="mobile" className="gap-2">
                <Smartphone className="h-4 w-4" />
                <span>Móvil</span>
              </TabsTrigger>
              <TabsTrigger value="desktop" className="gap-2">
                <Desktop className="h-4 w-4" />
                <span>Escritorio</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mobile" className="flex justify-center">
              <div
                className="border rounded-3xl overflow-hidden w-[375px] h-[667px] flex flex-col"
                style={{
                  fontFamily: themeSettings.font_family,
                  backgroundColor: themeSettings.secondary_color,
                  backgroundImage: themeSettings.background_image_url
                    ? `url(${themeSettings.background_image_url})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Header */}
                <header
                  className="p-4 border-b flex items-center justify-between"
                  style={{
                    backgroundColor: themeSettings.primary_color,
                    color: themeSettings.secondary_color,
                  }}
                >
                  <div className="flex items-center gap-2">
                    {themeSettings.logo_url ? (
                      <Image
                        src={themeSettings.logo_url || "/placeholder.svg"}
                        alt={menu.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover bg-white"
                      />
                    ) : (
                      <ChefHat className="h-8 w-8" />
                    )}
                    {themeSettings.header_style !== "minimal" && <h1 className="text-lg font-bold">{menu.name}</h1>}
                  </div>
                  {themeSettings.enable_ordering && <Badge className="bg-white text-black">Ordenar</Badge>}
                </header>

                {/* Content area with scrolling */}
                <div className="flex-grow overflow-y-auto p-4 space-y-6">
                  {/* Categories and items */}
                  {menu.categories && menu.categories.length > 0 ? (
                    menu.categories.map((category) => (
                      <div key={category.id} className="space-y-3">
                        <h2 className="text-xl font-bold">{category.name}</h2>
                        {category.description && (
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        )}

                        <div className={themeSettings.item_layout === "grid" ? "grid grid-cols-2 gap-3" : "space-y-3"}>
                          {(category.items || []).map((item) => (
                            <div
                              key={item.id}
                              className={
                                themeSettings.item_layout === "grid"
                                  ? "border rounded-lg overflow-hidden bg-card"
                                  : "flex items-center gap-3 border rounded-lg p-3 bg-card"
                              }
                            >
                              {themeSettings.item_layout !== "compact" && (
                                <div
                                  className={
                                    themeSettings.item_layout === "grid"
                                      ? "relative h-24 w-full"
                                      : "relative h-16 w-16 flex-shrink-0"
                                  }
                                >
                                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                                    {item.image_url ? (
                                      <Image
                                        src={item.image_url || "/placeholder.svg"}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <Store className="h-6 w-6 text-muted-foreground" />
                                    )}
                                  </div>
                                  {item.is_featured && (
                                    <div className="absolute top-1 right-1">
                                      <Badge
                                        className="h-6 w-6 p-0 flex items-center justify-center"
                                        style={{
                                          backgroundColor: themeSettings.primary_color,
                                          color: themeSettings.secondary_color,
                                        }}
                                      >
                                        <Star className="h-3 w-3" />
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className={themeSettings.item_layout === "grid" ? "p-3" : "flex-grow"}>
                                <h3 className="font-medium text-sm">{item.name}</h3>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                                )}
                                <div className="flex items-center justify-between mt-1">
                                  {themeSettings.show_prices && (
                                    <span className="text-sm font-bold">${item.price.toFixed(2)}</span>
                                  )}
                                  {themeSettings.enable_ordering && (
                                    <button
                                      className="text-xs font-medium px-2 py-1 rounded-full"
                                      style={{
                                        backgroundColor: themeSettings.primary_color,
                                        color: themeSettings.secondary_color,
                                      }}
                                    >
                                      Añadir
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <p>No hay categorías en este menú</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <footer
                  className="p-3 text-center text-xs border-t"
                  style={{
                    backgroundColor: themeSettings.primary_color,
                    color: themeSettings.secondary_color,
                  }}
                >
                  {themeSettings.footer_style === "detailed" ? (
                    <div className="space-y-1">
                      <p className="font-bold">{menu.name}</p>
                      <p>{menu.branch?.name || "Sucursal"}</p>
                      <p>Tel: 123-456-7890</p>
                    </div>
                  ) : (
                    <p>
                      © {new Date().getFullYear()} {menu.name}
                    </p>
                  )}
                </footer>
              </div>
            </TabsContent>

            <TabsContent value="desktop" className="flex justify-center">
              <div
                className="border rounded-lg overflow-hidden w-full max-w-3xl h-[600px] flex flex-col"
                style={{
                  fontFamily: themeSettings.font_family,
                  backgroundColor: themeSettings.secondary_color,
                  backgroundImage: themeSettings.background_image_url
                    ? `url(${themeSettings.background_image_url})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Header - Desktop version */}
                <header
                  className={`p-6 border-b flex items-center ${
                    themeSettings.header_style === "fullwidth" ? "justify-center" : "justify-between"
                  }`}
                  style={{
                    backgroundColor: themeSettings.primary_color,
                    color: themeSettings.secondary_color,
                  }}
                >
                  <div className="flex items-center gap-3">
                    {themeSettings.logo_url ? (
                      <Image
                        src={themeSettings.logo_url || "/placeholder.svg"}
                        alt={menu.name}
                        width={50}
                        height={50}
                        className="h-12 w-12 rounded-full object-cover bg-white"
                      />
                    ) : (
                      <ChefHat className="h-10 w-10" />
                    )}
                    {themeSettings.header_style !== "minimal" && (
                      <div>
                        <h1 className="text-2xl font-bold">{menu.name}</h1>
                        {themeSettings.header_style === "fullwidth" && (
                          <p className="text-sm opacity-90">{menu.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                  {themeSettings.enable_ordering && themeSettings.header_style !== "fullwidth" && (
                    <Button
                      className="gap-2"
                      style={{
                        backgroundColor: "white",
                        color: themeSettings.primary_color,
                      }}
                    >
                      Ordenar Ahora <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </header>

                {/* Content area with scrolling - Desktop version */}
                <div className="flex-grow overflow-y-auto p-6">
                  <div className="max-w-4xl mx-auto">
                    {/* Categories and items */}
                    {menu.categories && menu.categories.length > 0 ? (
                      menu.categories.map((category) => (
                        <div key={category.id} className="mb-8">
                          <h2 className="text-2xl font-bold mb-1">{category.name}</h2>
                          {category.description && (
                            <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                          )}

                          <div
                            className={themeSettings.item_layout === "grid" ? "grid md:grid-cols-3 gap-4" : "space-y-4"}
                          >
                            {(category.items || []).map((item) => (
                              <div
                                key={item.id}
                                className={
                                  themeSettings.item_layout === "grid"
                                    ? "border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-card"
                                    : "flex items-center gap-4 border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
                                }
                              >
                                {themeSettings.item_layout !== "compact" && (
                                  <div
                                    className={
                                      themeSettings.item_layout === "grid"
                                        ? "relative h-40 w-full"
                                        : "relative h-20 w-20 flex-shrink-0"
                                    }
                                  >
                                    <div className="absolute inset-0 bg-muted flex items-center justify-center">
                                      {item.image_url ? (
                                        <Image
                                          src={item.image_url || "/placeholder.svg"}
                                          alt={item.name}
                                          fill
                                          className="object-cover"
                                        />
                                      ) : (
                                        <Store className="h-8 w-8 text-muted-foreground" />
                                      )}
                                    </div>
                                    {item.is_featured && (
                                      <div className="absolute top-2 right-2">
                                        <Badge
                                          className="px-2 py-1 flex items-center gap-1"
                                          style={{
                                            backgroundColor: themeSettings.primary_color,
                                            color: themeSettings.secondary_color,
                                          }}
                                        >
                                          <Star className="h-3 w-3" /> Destacado
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className={themeSettings.item_layout === "grid" ? "p-4" : "flex-grow"}>
                                  <h3 className="font-medium">{item.name}</h3>
                                  {item.description && (
                                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                                  )}
                                  <div className="flex items-center justify-between mt-2">
                                    {themeSettings.show_prices && (
                                      <span className="font-bold">${item.price.toFixed(2)}</span>
                                    )}
                                    {themeSettings.enable_ordering && (
                                      <Button
                                        size="sm"
                                        style={{
                                          backgroundColor: themeSettings.primary_color,
                                          color: themeSettings.secondary_color,
                                        }}
                                      >
                                        Añadir
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <p className="text-lg">No hay categorías en este menú</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer - Desktop version */}
                <footer
                  className="py-4 px-6 text-center border-t"
                  style={{
                    backgroundColor: themeSettings.primary_color,
                    color: themeSettings.secondary_color,
                  }}
                >
                  {themeSettings.footer_style === "detailed" ? (
                    <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
                      <div>
                        <h3 className="font-bold text-lg mb-2">Contacto</h3>
                        <p>Tel: 123-456-7890</p>
                        <p>Email: contacto@restaurant.com</p>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Horario</h3>
                        <p>Lun-Vie: 11:00 - 22:00</p>
                        <p>Sáb-Dom: 12:00 - 23:00</p>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Dirección</h3>
                        <p>{menu.branch?.name || "Sucursal"}</p>
                        <p>Calle Principal 123, Ciudad</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <ChefHat className="h-5 w-5" />
                      <p>
                        © {new Date().getFullYear()} {menu.name} - Todos los derechos reservados
                      </p>
                    </div>
                  )}
                </footer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <QRDialog
        open={isQRDialogOpen}
        onOpenChange={setIsQRDialogOpen}
        url={`${window.location.origin}${menuUrl}`}
        menuName={menu.name}
        branchName={menu.branch?.name || "Sucursal"}
      />
    </div>
  )
}
