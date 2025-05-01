import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChefHat } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <ChefHat className="h-6 w-6" />
            <span className="text-xl font-bold">RestaurantOS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex max-w-[980px] flex-col items-start gap-2">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
              Complete Restaurant Management System
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground">
              A white-label solution for restaurants to manage menus, orders, and branding. Fully customizable and
              scalable.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
            <Link href="/public-menu/demo">
              <Button variant="outline">View Demo Menu</Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
