"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/providers/auth-provider"
import { useMenuData } from "@/hooks/use-menu-data"
import type { Branch } from "@/types"

interface QrDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menuId: string | null
  branches: Branch[]
}

export function QrDialog({ open, onOpenChange, menuId, branches = [] }: QrDialogProps) {
  const { toast } = useToast()
  const { menus } = useMenuData()
  const { user } = useAuth()
  const [qrValue, setQrValue] = useState("")
  const [menuName, setMenuName] = useState("")
  const [branchName, setBranchName] = useState("")

  useEffect(() => {
    if (open && menuId) {
      const menu = menus.find((m) => m.id === menuId)
      if (menu) {
        const branch = branches.find((b) => b.id === menu.branch_id)
        setMenuName(menu.name)
        setBranchName(branch ? branch.name : "")

        // Crear URL para el QR
        const baseUrl = window.location.origin
        setQrValue(`${baseUrl}/public-menu/${user?.restaurantId}?menu=${menuId}`)
      }
    }
  }, [open, menuId, menus, user, branches])

  const handleDownload = () => {
    const svg = document.getElementById("qr-code")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL("image/png")

      // Descargar imagen
      const downloadLink = document.createElement("a")
      downloadLink.download = `qr-menu-${menuName.toLowerCase().replace(/\s+/g, "-")}.png`
      downloadLink.href = pngFile
      downloadLink.click()

      toast({
        title: "QR descargado",
        description: "El código QR se ha descargado correctamente",
      })
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Código QR para {menuName}</DialogTitle>
          <DialogDescription>
            Escanea este código QR para acceder al menú digital de la sucursal {branchName}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          <QRCodeSVG
            id="qr-code"
            value={qrValue}
            size={200}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"H"}
            includeMargin={true}
          />
          <p className="mt-4 text-sm text-center text-muted-foreground">
            Este código QR dirige a los clientes al menú digital de {menuName} en la sucursal {branchName}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button onClick={handleDownload}>Descargar QR</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
