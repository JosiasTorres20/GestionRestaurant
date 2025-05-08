"use client"

import { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash } from 'lucide-react'
import { useMenuData } from "@/hooks/use-menu-data"
import { MenuItemDialog } from "@/components/dashboard/menu/menu-item-dialog"
import type { MenuItem } from "@/types"
import { useToast } from "@/components/ui/use-toast"

export interface MenuItemCardProps {
  item: MenuItem
  onDelete: () => Promise<boolean>
  onUpdate: () => Promise<boolean>
  onCreate: () => Promise<boolean>
}

export function MenuItemCard({ item, onDelete, onUpdate, onCreate }: MenuItemCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { setSelectedMenuItem } = useMenuData()
  const { toast } = useToast()

  const handleEdit = () => {
    setSelectedMenuItem(item)
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    try {
      const success = await onDelete()
      if (success) {
        toast({
          title: "Éxito",
          description: "Item eliminado correctamente",
        })
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el item",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <div className="border rounded-md p-3 bg-background hover:bg-muted/50 transition-colors">
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-md">
              <Image
                src={item.image_url || "/placeholder.svg"}
                alt={item.name || "Ítem del menú"}
                fill
                className="object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h5 className="font-medium">{item.name}</h5>
                {!item.is_available && (
                  <Badge variant="outline" className="text-muted-foreground">
                    No disponible
                  </Badge>
                )}
              </div>
              {item.description && <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>}
              <p className="text-sm font-medium mt-1">${item.price.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleEdit}>
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={handleDelete}>
              <Trash className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <MenuItemDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        categoryId={item.category_id}
        onUpdate={onUpdate}
        onSubmit={onCreate}
      />
    </>
  )
}
