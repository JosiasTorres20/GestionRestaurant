"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  ChefHat,
  ChevronRight,
  ShoppingBag,
  Search,
  Star,
  X,
  Plus,
  Minus,
  ArrowLeft,
  Filter,
  LayoutGrid,
  LayoutList,
  AlignLeft,
  Utensils,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { createClientSupabaseClient } from "@/lib/supabase"
import type { Menu, Category, MenuItem, ThemeSettings } from "@/types"

interface CartItem {
  item: MenuItem
  quantity: number
}

export default function PublicMenuPage({ params }: { params: { restaurantId: string } }) {
  const { restaurantId } = params
  const searchParams = useSearchParams()
  const menuId = searchParams.get("menu")

  const [isLoading, setIsLoading] = useState(true)
  const [menu, setMenu] = useState<Menu | null>(null)
  const [restaurant, setRestaurant] = useState({
    name: "",
    logo_url: "",
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showCart, setShowCart] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    menu_id: "",
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
  const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("grid")

  // Cargar datos del menú
  useEffect(() => {
    const fetchMenuData = async () => {
      setIsLoading(true)
      try {
        const supabase = createClientSupabaseClient()

        // Primero obtener información del restaurante
        const { data: restaurantData, error: restaurantError } = await supabase
          .from("restaurants")
          .select("*")
          .eq("id", restaurantId)
          .single()

        if (restaurantError) {
          console.error("Error fetching restaurant:", restaurantError)
          return
        }

        setRestaurant({
          name: restaurantData.name,
          logo_url: restaurantData.logo_url || "/placeholder.svg?height=80&width=80",
        })

        // Si se proporciona un ID de menú específico
        if (menuId) {
          const { data: menuData, error: menuError } = await supabase
            .from("menus")
            .select(`
              *,
              branches(name, is_main),
              menu_categories(
                *,
                menu_items(*)
              ),
              theme_settings(*)
            `)
            .eq("id", menuId)
            .eq("restaurant_id", restaurantId)
            .single()

          if (menuError) {
            console.error("Error fetching specific menu:", menuError)
            return
          }

          if (menuData) {
            const processedMenu = {
              ...menuData,
              branch: menuData.branches,
              categories:
                menuData.menu_categories?.map((category: Category) => ({
                  ...category,
                  items: category.menu_items || [],
                })) || [],
              theme: menuData.theme_settings?.[0] || null,
            }

            setMenu(processedMenu)
            setCategories(processedMenu.categories || [])

            // Establecer la primera categoría como activa
            if (processedMenu.categories && processedMenu.categories.length > 0) {
              setActiveCategory(processedMenu.categories[0].id)
            }

            // Aplicar configuración de tema si existe
            if (processedMenu.theme) {
              setThemeSettings(processedMenu.theme)
              // Establecer el modo de vista según el tema
              setViewMode(processedMenu.theme.item_layout || "grid")
            }

            // Combinar todos los ítems para búsqueda
            const allItems: MenuItem[] = []
            processedMenu.categories?.forEach((category: Category) => {
              if (category.items) {
                allItems.push(...category.items)
              }
            })
            setMenuItems(allItems)
          }
        } else {
          // Si no se proporciona ID, cargar el menú activo predeterminado
          const { data: defaultMenu, error: defaultMenuError } = await supabase
            .from("menus")
            .select(`
              *,
              branches(name, is_main),
              menu_categories(
                *,
                menu_items(*)
              ),
              theme_settings(*)
            `)
            .eq("restaurant_id", restaurantId)
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

          if (defaultMenuError && defaultMenuError.code !== "PGRST116") {
            // PGRST116 es el código para "no se encontraron resultados"
            console.error("Error fetching default menu:", defaultMenuError)
            return
          }

          if (defaultMenu) {
            const processedMenu = {
              ...defaultMenu,
              branch: defaultMenu.branches,
              categories:
                defaultMenu.menu_categories?.map((category: Category) => ({
                  ...category,
                  items: category.menu_items || [],
                })) || [],
              theme: defaultMenu.theme_settings?.[0] || null,
            }

            setMenu(processedMenu)
            setCategories(processedMenu.categories || [])

            // Establecer la primera categoría como activa
            if (processedMenu.categories && processedMenu.categories.length > 0) {
              setActiveCategory(processedMenu.categories[0].id)
            }

            // Aplicar configuración de tema si existe
            if (processedMenu.theme) {
              setThemeSettings(processedMenu.theme)
              setViewMode(processedMenu.theme.item_layout || "grid")
            }

            // Combinar todos los ítems para búsqueda
            const allItems: MenuItem[] = []
            processedMenu.categories?.forEach((category: Category) => {
              if (category.items) {
                allItems.push(...category.items)
              }
            })
            setMenuItems(allItems)
          }
        }
      } catch (error) {
        console.error("Error loading menu data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMenuData()
  }, [restaurantId, menuId])

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.item.id === item.id)
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.item.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      }
      return [...prevCart, { item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.item.id === itemId)
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((cartItem) =>
          cartItem.item.id === itemId ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem,
        )
      }
      return prevCart.filter((cartItem) => cartItem.item.id !== itemId)
    })
  }

  const getTotalPrice = () => {
    return cart.reduce((total, cartItem) => total + cartItem.item.price * cartItem.quantity, 0)
  }

  const getItemsByCategory = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category?.items || []
  }

  const getFeaturedItems = () => {
    return menuItems.filter((item) => item.is_featured)
  }

  const filteredItems = searchQuery
    ? menuItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : []

  // Función corregida para enviar pedidos por WhatsApp
  const sendOrderToWhatsApp = () => {
    if (cart.length === 0 || !menu) return

    const restaurantName = restaurant.name || menu.name
    const branchName = menu.branch?.name || ""

    const orderText = `*Nuevo Pedido para ${restaurantName} - ${branchName}*\n\n${cart
      .map(
        (cartItem) =>
          `${cartItem.quantity}x ${cartItem.item.name} - $${(cartItem.item.price * cartItem.quantity).toFixed(2)}`,
      )
      .join("\n")}\n\n*Total: $${getTotalPrice().toFixed(2)}*`

    const encodedText = encodeURIComponent(orderText)

    // Utilizar el número de WhatsApp de la sucursal si está disponible
    // Primero verificamos si existe la propiedad whatsapp en menu.branch
    const whatsappNumber =
      menu.branch && "whatsapp" in menu.branch
        ? menu.branch.whatsapp
        : menu.branches && menu.branches.whatsapp
          ? menu.branches.whatsapp
          : "5491112345678" // Número de ejemplo como fallback

    window.open(`https://wa.me/${whatsappNumber}?text=${encodedText}`, "_blank")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-950 dark:to-brand-900">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <ChefHat className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary" />
        </div>
        <p className="mt-4 text-lg font-medium">Cargando menú...</p>
      </div>
    )
  }

  if (!menu) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <ChefHat className="h-16 w-16 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Menú no encontrado</h1>
          <p className="text-muted-foreground max-w-md">
            Lo sentimos, el menú que estás buscando no existe o no está disponible en este momento.
          </p>
          <Button asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (selectedItem) {
    return (
      <div
        className="flex min-h-screen flex-col"
        style={{
          fontFamily: themeSettings.font_family,
          backgroundColor: themeSettings.secondary_color,
          color: "black",
          backgroundImage: themeSettings.background_image_url
            ? `url(${themeSettings.background_image_url})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <header
          className="sticky top-0 z-40 border-b p-4"
          style={{
            backgroundColor: themeSettings.primary_color,
            color: themeSettings.secondary_color,
          }}
        >
          <div className="container flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedItem(null)}
              style={{
                color: themeSettings.secondary_color,
              }}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <span className="ml-2 text-xl font-bold">{selectedItem.name}</span>
          </div>
        </header>

        <main className="container flex-1 py-6">
          <div className="space-y-6"></div>
          <div className="relative h-64 w-full overflow-hidden rounded-xl">
            {selectedItem.image_url ? (
              <Image
                src={selectedItem.image_url || "/placeholder.svg"}
                alt={selectedItem.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-muted flex items-center justify-center">
                <Utensils className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            {selectedItem.is_featured && (
              <div className="absolute top-4 right-4">
                <Badge
                  className="flex items-center gap-1"
                  style={{
                    backgroundColor: themeSettings.primary_color,
                    color: themeSettings.secondary_color,
                  }}
                >
                  <Star className="h-3 w-3 fill-current" /> Destacado
                </Badge>
              </div>
            )}
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-bold">{selectedItem.name}</h1>
            {themeSettings.show_prices && <p className="text-xl font-bold mt-1">${selectedItem.price.toFixed(2)}</p>}
            {selectedItem.description && <p className="mt-2 text-muted-foreground">{selectedItem.description}</p>}
          </div>

          {themeSettings.enable_ordering && (
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-none h-10"
                  onClick={() => {
                    const existingItem = cart.find((item) => item.item.id === selectedItem.id)
                    if (existingItem && existingItem.quantity > 0) {
                      removeFromCart(selectedItem.id)
                    }
                  }}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="w-12 text-center">
                  {cart.find((item) => item.item.id === selectedItem.id)?.quantity || 0}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-none h-10"
                  onClick={() => addToCart(selectedItem)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                className="gap-2"
                size="lg"
                onClick={() => {
                  addToCart(selectedItem)
                  setSelectedItem(null)
                }}
                style={{
                  backgroundColor: themeSettings.primary_color,
                  color: themeSettings.secondary_color,
                }}
              >
                Añadir al Pedido
              </Button>
            </div>
          )}
        </main>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        fontFamily: themeSettings.font_family,
        backgroundColor: themeSettings.secondary_color,
        color: "black",
        backgroundImage: themeSettings.background_image_url ? `url(${themeSettings.background_image_url})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <header
        className="sticky top-0 z-40 border-b p-4"
        style={{
          backgroundColor: themeSettings.primary_color,
          color: themeSettings.secondary_color,
        }}
      >
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            {themeSettings.logo_url || restaurant.logo_url ? (
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white">
                <Image
                  src={themeSettings.logo_url || restaurant.logo_url || "/placeholder.svg"}
                  alt={restaurant.name || menu.name}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <ChefHat className="h-6 w-6" />
            )}
            <span className="text-xl font-bold">{restaurant.name || menu.name}</span>
          </div>
          {themeSettings.enable_ordering && (
            <div className="relative">
              <Button
                variant="outline"
                className="gap-2"
                style={{
                  borderColor: themeSettings.secondary_color,
                  color: themeSettings.secondary_color,
                }}
                onClick={() => setShowCart(true)}
              >
                <ShoppingBag className="h-5 w-5" />
                <span>{cart.length > 0 ? cart.reduce((total, item) => total + item.quantity, 0) : 0}</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="container flex-1 py-6">
        {themeSettings.header_style === "fullwidth" && (
          <div className="mb-8 -mt-4 -mx-4 relative h-40 md:h-60 overflow-hidden">
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              {themeSettings.background_image_url ? (
                <Image
                  src={themeSettings.background_image_url || "/placeholder.svg"}
                  alt={menu.name}
                  fill
                  className="object-cover opacity-80"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-700" />
              )}
              <div className="relative text-center text-white z-10">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{menu.name}</h1>
                {menu.description && <p className="text-lg opacity-90">{menu.description}</p>}
                {menu.branch && (
                  <p className="text-sm mt-2 opacity-80">
                    {menu.branch.name} {menu.branch.is_main && "(Principal)"}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          {themeSettings.header_style !== "fullwidth" && (
            <>
              <h1 className="text-2xl font-bold text-center">{menu.name}</h1>
              {menu.description && <p className="text-center text-muted-foreground">{menu.description}</p>}
            </>
          )}

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar en el menú..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {searchQuery ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Resultados de búsqueda</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-muted" : ""}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-muted" : ""}
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("compact")}
                  className={viewMode === "compact" ? "bg-muted" : ""}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No se encontraron resultados para &quot;{searchQuery}&quot;</p>
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
                {filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    className={`overflow-hidden hover:shadow-md transition-shadow ${
                      viewMode === "list" ? "flex flex-row" : ""
                    }`}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col cursor-pointer" onClick={() => setSelectedItem(item)}>
                        {viewMode !== "compact" && (
                          <div
                            className={
                              viewMode === "grid" ? "relative h-48 w-full" : "relative h-24 w-24 flex-shrink-0"
                            }
                          >
                            {item.image_url ? (
                              <Image
                                src={item.image_url || "/placeholder.svg"}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-muted flex items-center justify-center">
                                <Utensils className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            {item.is_featured && (
                              <div className="absolute top-1 left-1">
                                <Badge
                                  className="flex items-center gap-1 px-1.5 py-0.5"
                                  style={{
                                    backgroundColor: themeSettings.primary_color,
                                    color: themeSettings.secondary_color,
                                  }}
                                >
                                  <Star className="h-3 w-3 fill-current" />
                                </Badge>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex flex-1 flex-col justify-between p-4">
                          <div>
                            <h3 className="font-bold">{item.name}</h3>
                            {item.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            {themeSettings.show_prices && <span className="font-medium">${item.price.toFixed(2)}</span>}
                            {themeSettings.enable_ordering && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  addToCart(item)
                                }}
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {getFeaturedItems().length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Destacados</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {getFeaturedItems().map((item) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <div className="cursor-pointer" onClick={() => setSelectedItem(item)}>
                          <div className="relative h-40 w-full">
                            {item.image_url ? (
                              <Image
                                src={item.image_url || "/placeholder.svg"}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-muted flex items-center justify-center">
                                <Utensils className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute top-1 left-1">
                              <Badge
                                className="flex items-center gap-1 px-1.5 py-0.5"
                                style={{
                                  backgroundColor: themeSettings.primary_color,
                                  color: themeSettings.secondary_color,
                                }}
                              >
                                <Star className="h-3 w-3 fill-current" /> Destacado
                              </Badge>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold">{item.name}</h3>
                            {item.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              {themeSettings.show_prices && (
                                <span className="font-medium">${item.price.toFixed(2)}</span>
                              )}
                              {themeSettings.enable_ordering && (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    addToCart(item)
                                  }}
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Nuestro Menú</h2>
              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      <span className="hidden sm:inline">Categorías</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Categorías</SheetTitle>
                    </SheetHeader>
                    <div className="py-4">
                      <ul className="space-y-2">
                        {categories.map((category) => (
                          <li key={category.id}>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => {
                                setActiveCategory(category.id)
                                document
                                  .getElementById(`category-${category.id}`)
                                  ?.scrollIntoView({ behavior: "smooth" })
                              }}
                            >
                              {category.name}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </SheetContent>
                </Sheet>
                <div className="flex border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setViewMode("grid")}
                    data-active={viewMode === "grid"}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setViewMode("list")}
                    data-active={viewMode === "list"}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setViewMode("compact")}
                    data-active={viewMode === "compact"}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Tabs defaultValue={activeCategory || ""} className="space-y-8">
              <TabsList className="flex w-full overflow-x-auto hide-scrollbar mb-4">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex-1 whitespace-nowrap"
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="space-y-4">
                  <div id={`category-${category.id}`} className="mb-4 scroll-mt-20">
                    <h2 className="text-xl font-bold">{category.name}</h2>
                    {category.description && <p className="text-muted-foreground">{category.description}</p>}
                  </div>

                  <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
                    {getItemsByCategory(category.id).map((item) => (
                      <Card
                        key={item.id}
                        className={`overflow-hidden hover:shadow-md transition-shadow ${
                          viewMode === "list" ? "flex flex-row" : ""
                        }`}
                      >
                        <CardContent className="p-0">
                          <div
                            className={`cursor-pointer ${viewMode === "list" ? "flex" : "flex flex-col"}`}
                            onClick={() => setSelectedItem(item)}
                          >
                            {viewMode !== "compact" && (
                              <div
                                className={
                                  viewMode === "grid" ? "relative h-40 w-full" : "relative h-24 w-24 flex-shrink-0"
                                }
                              >
                                {item.image_url ? (
                                  <Image
                                    src={item.image_url || "/placeholder.svg"}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-muted flex items-center justify-center">
                                    <Utensils className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                )}
                                {item.is_featured && (
                                  <div className="absolute top-1 left-1">
                                    <Badge
                                      className="flex items-center gap-1 px-1.5 py-0.5"
                                      style={{
                                        backgroundColor: themeSettings.primary_color,
                                        color: themeSettings.secondary_color,
                                      }}
                                    >
                                      <Star className="h-3 w-3 fill-current" />
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex flex-1 flex-col justify-between p-4">
                              <div>
                                <h3 className="font-bold">{item.name}</h3>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                                )}
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                {themeSettings.show_prices && (
                                  <span className="font-medium">${item.price.toFixed(2)}</span>
                                )}
                                {themeSettings.enable_ordering && (
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      addToCart(item)
                                    }}
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
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}
      </main>

      {/* Cart Sheet */}
      {themeSettings.enable_ordering && (
        <Sheet open={showCart} onOpenChange={setShowCart}>
          <SheetContent
            side="bottom"
            className="h-[85vh] sm:max-w-md sm:h-screen sm:left-auto sm:right-0 sm:top-0 sm:rounded-t-[0]"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Tu Pedido</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowCart(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-grow overflow-auto">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <ShoppingBag className="mb-2 h-12 w-12 text-muted-foreground" />
                    <p className="text-center text-muted-foreground">
                      Tu carrito está vacío. Añade algunos productos para realizar un pedido.
                    </p>
                    <Button variant="outline" className="mt-4" onClick={() => setShowCart(false)}>
                      Ver Menú
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((cartItem) => (
                      <div
                        key={cartItem.item.id}
                        className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          {cartItem.item.image_url && (
                            <div className="relative h-16 w-16 overflow-hidden rounded-md">
                              <Image
                                src={cartItem.item.image_url || "/placeholder.svg"}
                                alt={cartItem.item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{cartItem.item.name}</p>
                            <p className="text-sm text-muted-foreground">${cartItem.item.price.toFixed(2)} c/u</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border rounded-lg overflow-hidden">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-none h-8 w-8"
                              onClick={() => removeFromCart(cartItem.item.id)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <div className="w-8 text-center text-sm">{cartItem.quantity}</div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-none h-8 w-8"
                              onClick={() => addToCart(cartItem.item)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="font-medium w-20 text-right">
                            ${(cartItem.item.price * cartItem.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="mt-auto pt-4">
                  <div className="flex items-center justify-between border-t pt-4 mb-4">
                    <p className="text-lg font-bold">Total</p>
                    <p className="text-lg font-bold">${getTotalPrice().toFixed(2)}</p>
                  </div>

                  <Button
                    className="w-full gap-2"
                    size="lg"
                    onClick={() => {
                      sendOrderToWhatsApp()
                      setShowCart(false)
                    }}
                    style={{
                      backgroundColor: themeSettings.primary_color,
                      color: themeSettings.secondary_color,
                    }}
                  >
                    Realizar Pedido por WhatsApp
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}

      <footer
        className="border-t py-6 text-center"
        style={{
          backgroundColor: themeSettings.primary_color,
          color: themeSettings.secondary_color,
        }}
      >
        <div className="container">
          {themeSettings.footer_style === "detailed" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div>
                <h3 className="text-lg font-bold mb-2">Contacto</h3>
                <p className="text-sm">Tel: 123-456-7890</p>
                <p className="text-sm">Email: contacto@restaurant.com</p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Horario</h3>
                <p className="text-sm">Lun-Vie: 11:00 - 22:00</p>
                <p className="text-sm">Sáb-Dom: 12:00 - 23:00</p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Dirección</h3>
                <p className="text-sm">{menu.branch?.name}</p>
                <p className="text-sm">Calle Principal 123, Ciudad</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <ChefHat className="h-5 w-5" />
              <p className="text-sm">
                © {new Date().getFullYear()} {restaurant.name || menu.name}
              </p>
            </div>
          )}
        </div>
      </footer>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        [data-active="true"] {
          background-color: ${themeSettings.primary_color}20;
        }
      `}</style>
    </div>
  )
}
