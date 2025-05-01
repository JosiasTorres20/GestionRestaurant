"use client"

import { useState } from "react"
import type React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Upload, X } from "lucide-react"
import { createClientSupabaseClient } from "@/lib/supabase"
import { useAuth } from "@/components/providers/auth-provider"

interface MenuAttachmentProps {
  menuItemId: string
  existingImageUrl?: string | null
  onImageUploaded: (url: string) => void
  onImageRemoved?: () => void
}

export function MenuAttachment({ menuItemId, existingImageUrl, onImageUploaded, onImageRemoved }: MenuAttachmentProps) {
  const { toast } = useToast()
  const { userDetails } = useAuth()

  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl ?? null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return
    if (!userDetails?.restaurantId) return

    const file = e.target.files[0]

    if (file.size > 5 * 1024 * 1024) { // Máximo 5MB
      toast({
        title: "Archivo demasiado grande",
        description: "La imagen debe pesar menos de 5MB.",
        variant: "destructive",
      })
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    setIsUploading(true)

    try {
      const supabase = createClientSupabaseClient()

      const fileExt = file.name.split(".").pop()
      const fileName = `${menuItemId}-${Date.now()}.${fileExt}`
      const filePath = `menu-items/${fileName}`

      const { error: uploadError } = await supabase.storage.from("public").upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage.from("public").getPublicUrl(filePath)

      if (!publicUrlData?.publicUrl) {
        throw new Error("No se pudo obtener la URL pública")
      }

      onImageUploaded(publicUrlData.publicUrl)

      toast({
        title: "Imagen subida",
        description: "La imagen del item ha sido subida exitosamente.",
      })

    } catch (error) {
      console.error("Error subiendo imagen:", error)

      toast({
        title: "Error al subir imagen",
        description: "Hubo un problema al intentar subir la imagen.",
        variant: "destructive",
      })

      if (existingImageUrl) {
        setPreviewUrl(existingImageUrl)
      } else {
        setPreviewUrl(null)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    if (onImageRemoved) {
      onImageRemoved()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Imagen del Item</CardTitle>
        <CardDescription>Sube una imagen para ilustrar este plato o producto.</CardDescription>
      </CardHeader>
      <CardContent>
        {previewUrl ? (
          <div className="relative">
            <div className="relative h-48 w-full overflow-hidden rounded-lg border">
              <Image
                src={previewUrl}
                alt="Vista previa del item"
                fill
                className="object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
              />
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 rounded-full"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <Upload className="mb-4 h-8 w-8 text-muted-foreground" />
            <p className="mb-2 text-sm font-medium">Arrastra y suelta una imagen o haz clic para buscar</p>
            <p className="text-xs text-muted-foreground">Formatos PNG, JPG o WEBP (máximo 5MB)</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="w-full">
          <Label htmlFor="image-upload" className="sr-only">
            Subir imagen
          </Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            className="cursor-pointer"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
      </CardFooter>
    </Card>
  )
}
