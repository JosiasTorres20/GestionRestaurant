"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ChefHat, ChevronRight, ShoppingBag, Search, Star, X, Plus, Minus, ArrowLeft } from "lucide-react"
import Image from "next/image"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  categoryId: string
  featured: boolean
}
interface Category {
  id: string
  name: string
  description: string
}

export default function PublicMenuPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [restaurant, setRestaurant] = useState({
    name: "",
    logoUrl: "",
    primaryColor: "",
    secondaryColor: "",
    whatsapp: "",
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showCart, setShowCart] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setRestaurant({
        name: "Demo Restaurant",
        logoUrl: "/placeholder.svg?height=80&width=80",
        primaryColor: "#5e5eff",
        secondaryColor: "#f9fafb",
        whatsapp: "+1234567890",
      })

      setCategories([
        { id: "1", name: "Appetizers", description: "Start your meal right" },
        { id: "2", name: "Main Courses", description: "Delicious entrees" },
        { id: "3", name: "Desserts", description: "Sweet treats" },
        { id: "4", name: "Drinks", description: "Refreshing beverages" },
      ])

      setMenuItems([
        {
          id: "1",
          name: "Caesar Salad",
          description: "Fresh romaine lettuce with Caesar dressing, croutons, and parmesan",
          price: 8.99,
          imageUrl: "/placeholder.svg?height=200&width=200",
          categoryId: "1",
          featured: true,
        },
        {
          id: "2",
          name: "Margherita Pizza",
          description: "Classic pizza with tomato sauce, mozzarella, and basil",
          price: 12.99,
          imageUrl: "/placeholder.svg?height=200&width=200",
          categoryId: "2",
          featured: false,
        },
        {
          id: "3",
          name: "Chocolate Cake",
          description: "Rich chocolate cake with ganache frosting",
          price: 6.99,
          imageUrl: "/placeholder.svg?height=200&width=200",
          categoryId: "3",
          featured: true,
        },
        {
          id: "4",
          name: "Iced Tea",
          description: "Refreshing iced tea with lemon",
          price: 2.99,
          imageUrl: "/placeholder.svg?height=200&width=200",
          categoryId: "4",
          featured: false,
        },
        {
          id: "5",
          name: "Chicken Wings",
          description: "Spicy buffalo wings with blue cheese dip",
          price: 10.99,
          imageUrl: "/placeholder.svg?height=200&width=200",
          categoryId: "1",
          featured: true,
        },
        {
          id: "6",
          name: "Pasta Carbonara",
          description: "Creamy pasta with bacon and parmesan",
          price: 14.99,
          imageUrl: "/placeholder.svg?height=200&width=200",
          categoryId: "2",
          featured: false,
        },
        {
          id: "7",
          name: "Tiramisu",
          description: "Classic Italian dessert with coffee and mascarpone",
          price: 5.99,
          imageUrl: "/placeholder.svg?height=200&width=200",
          categoryId: "3",
          featured: true,
        },
        {
          id: "8",
          name: "Lemonade",
          description: "Fresh squeezed lemonade",
          price: 3.99,
          imageUrl: "/placeholder.svg?height=200&width=200",
          categoryId: "4",
          featured: false,
        },
      ])

      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

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
    return menuItems.filter((item) => item.categoryId === categoryId)
  }

  const getFeaturedItems = () => {
    return menuItems.filter((item) => item.featured)
  }

  const filteredItems = searchQuery
    ? menuItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  const sendOrderToWhatsApp = () => {
    if (cart.length === 0) return

    const orderText = `*New Order from ${restaurant.name}*\n\n${cart
      .map(
        (cartItem) =>
          `${cartItem.quantity}x ${cartItem.item.name} - $${(cartItem.item.price * cartItem.quantity).toFixed(2)}`,
      )
      .join("\n")}\n\n*Total: $${getTotalPrice().toFixed(2)}*`

    const encodedText = encodeURIComponent(orderText)
    window.open(`https://wa.me/${restaurant.whatsapp}?text=${encodedText}`, "_blank")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-950 dark:to-brand-900">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <ChefHat className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary" />
        </div>
        <p className="mt-4 text-lg font-medium">Loading menu...</p>
      </div>
    )
  }

  if (selectedItem) {
    return (
      <div
        className="flex min-h-screen flex-col"
        style={{
          backgroundColor: restaurant.secondaryColor,
          color: restaurant.primaryColor,
        }}
      >
        <header
          className="sticky top-0 z-40 border-b p-4"
          style={{
            backgroundColor: restaurant.primaryColor,
            color: restaurant.secondaryColor,
          }}
        >
          <div className="container flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedItem(null)}
              style={{
                color: restaurant.secondaryColor,
              }}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <span className="ml-2 text-xl font-bold">{selectedItem.name}</span>
          </div>
        </header>

        <main className="container flex-1 py-6">
          <div className="space-y-6">
          </div>
            <div className="relative h-64 w-full overflow-hidden rounded-xl">
              <Image
                src={selectedItem.imageUrl || "/placeholder.svg"}
                alt={selectedItem.name}
                fill
                className="object-cover"
              />
              {selectedItem.featured && (
                <div className="absolute top-4 right-4">
                  <Badge
                    className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600"
                    style={{
                      backgroundColor: restaurant.primaryColor,
                      color: restaurant.secondaryColor,
                    }}
                  >
                    <Star className="h-3 w-3 fill-current" /> Featured
                  </Badge>
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold">{selectedItem.name}</h1>
              <p className="text-xl font-bold mt-1">${selectedItem.price.toFixed(2)}</p>
              <p className="mt-2 text-muted-foreground">{selectedItem.description}</p>
            </div>

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
                  backgroundColor: restaurant.primaryColor,
                  color: restaurant.secondaryColor,
                }}
              >
                Add to Order
              </Button>
            </div>
          </main>
        </div>
      )
    }
    

    return (
      <div
        className="flex min-h-screen flex-col"
        style={{
          backgroundColor: restaurant.secondaryColor,
          color: restaurant.primaryColor,
        }}
      >
        <header
          className="sticky top-0 z-40 border-b p-4"
          style={{
            backgroundColor: restaurant.primaryColor,
            color: restaurant.secondaryColor,
          }}
        >
          <div className="container flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white">
                <Image
                  src={restaurant.logoUrl || "/placeholder.svg"}
                  alt={restaurant.name}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold">{restaurant.name}</span>
            </div>
            <div className="relative">
              <Button
                variant="outline"
                className="gap-2"
                style={{
                  borderColor: restaurant.secondaryColor,
                  color: restaurant.secondaryColor,
                }}
                onClick={() => setShowCart(true)}
              >
                <ShoppingBag className="h-5 w-5" />
                <span>{cart.length > 0 ? cart.reduce((total, item) => total + item.quantity, 0) : 0}</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="container flex-1 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-center">Our Menu</h1>
            <p className="text-center text-muted-foreground">Scan the QR code or browse our menu below</p>
            
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search menu..."
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
              <h2 className="text-xl font-bold">Search Results</h2>
              {filteredItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No items found matching &quot;{searchQuery}&quot;</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                      <CardContent className="p-0">
                        <div className="flex cursor-pointer" onClick={() => setSelectedItem(item)}>
                          <div className="relative h-24 w-24 flex-shrink-0">
                            <Image
                              src={item.imageUrl || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                            {item.featured && (
                              <div className="absolute top-1 left-1">
                                <Badge
                                  className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 px-1.5 py-0.5"
                                  style={{
                                    backgroundColor: restaurant.primaryColor,
                                    color: restaurant.secondaryColor,
                                  }}
                                >
                                  <Star className="h-3 w-3 fill-current" />
                                </Badge>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col justify-between p-4">
                            <div>
                              <h3 className="font-bold">{item.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">${item.price.toFixed(2)}</span>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(item);
                                }}
                                style={{
                                  backgroundColor: restaurant.primaryColor,
                                  color: restaurant.secondaryColor,
                                }}
                              >
                                Add
                              </Button>
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
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-4">Featured Items</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {getFeaturedItems().map((item) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                      <CardContent className="p-0">
                        <div className="flex cursor-pointer" onClick={() => setSelectedItem(item)}>
                          <div className="relative h-24 w-24 flex-shrink-0">
                            <Image
                              src={item.imageUrl || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute top-1 left-1">
                              <Badge
                                className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 px-1.5 py-0.5"
                                style={{
                                  backgroundColor: restaurant.primaryColor,
                                  color: restaurant.secondaryColor,
                                }}
                              >
                                <Star className="h-3 w-3 fill-current" />
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-1 flex-col justify-between p-4">
                            <div>
                              <h3 className="font-bold">{item.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">${item.price.toFixed(2)}</span>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(item);
                                }}
                                style={{
                                  backgroundColor: restaurant.primaryColor,
                                  color: restaurant.secondaryColor,
                                }}
                              >
                                Add
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Tabs defaultValue={categories[0]?.id} className="space-y-4">
                <TabsList className="flex w-full overflow-x-auto">
                  {categories.map((category) => (
                    <TabsTrigger key={category.id} value={category.id} className="flex-1 whitespace-nowrap">
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {categories.map((category) => (
                  <TabsContent key={category.id} value={category.id} className="space-y-4">
                    <div className="mb-4">
                      <h2 className="text-xl font-bold">{category.name}</h2>
                      <p className="text-muted-foreground">{category.description}</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {getItemsByCategory(category.id).map((item) => (
                        <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                          <CardContent className="p-0">
                            <div className="flex cursor-pointer" onClick={() => setSelectedItem(item)}>
                              <div className="relative h-24 w-24 flex-shrink-0">
                                <Image
                                  src={item.imageUrl || "/placeholder.svg"}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                                {item.featured && (
                                  <div className="absolute top-1 left-1">
                                    <Badge
                                      className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 px-1.5 py-0.5"
                                      style={{
                                        backgroundColor: restaurant.primaryColor,
                                        color: restaurant.secondaryColor,
                                      }}
                                    >
                                      <Star className="h-3 w-3 fill-current" />
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-1 flex-col justify-between p-4">
                                <div>
                                  <h3 className="font-bold">{item.name}</h3>
                                  <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">${item.price.toFixed(2)}</span>
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addToCart(item);
                                    }}
                                    style={{
                                      backgroundColor: restaurant.primaryColor,
                                      color: restaurant.secondaryColor,
                                    }}
                                  >
                                    Add
                                  </Button>
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
        {showCart && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
            <div 
              className="fixed bottom-0 left-0 right-0 max-h-[85vh] rounded-t-xl bg-background p-6 shadow-2xl animate-slide-in-bottom overflow-auto"
              style={{
                backgroundColor: restaurant.secondaryColor,
                color: restaurant.primaryColor,
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Your Order</h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowCart(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <ShoppingBag className="mb-2 h-12 w-12 text-muted-foreground" />
                  <p className="text-center text-muted-foreground">
                    Your cart is empty. Add some items to place an order.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowCart(false)}
                  >
                    Browse Menu
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
                        <div className="relative h-16 w-16 overflow-hidden rounded-md">
                          <Image
                            src={cartItem.item.imageUrl || "/placeholder.svg"}
                            alt={cartItem.item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{cartItem.item.name}</p>
                          <p className="text-sm text-muted-foreground">${cartItem.item.price.toFixed(2)} each</p>
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
                        <p className="font-medium w-20 text-right">${(cartItem.item.price * cartItem.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between border-t pt-4 mt-4">
                    <p className="text-lg font-bold">Total</p>
                    <p className="text-lg font-bold">${getTotalPrice().toFixed(2)}</p>
                  </div>

                  <Button
                    className="w-full gap-2"
                    size="lg"
                    onClick={() => {
                      sendOrderToWhatsApp();
                      setShowCart(false);
                    }}
                    style={{
                      backgroundColor: restaurant.primaryColor,
                      color: restaurant.secondaryColor,
                    }}
                  >
                    Place Order via WhatsApp
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        <footer
          className="border-t py-6 text-center"
          style={{
            backgroundColor: restaurant.primaryColor,
            color: restaurant.secondaryColor,
          }}
        >
          <div className="container">
            <div className="flex items-center justify-center gap-2">
              <ChefHat className="h-5 w-5" />
              <p className="text-sm">
                Powered by <span className="font-bold">RestaurantOS</span>
              </p>
            </div>
          </div>
        </footer>
      </div>

  )
}