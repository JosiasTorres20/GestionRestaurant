"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"
import { Download } from "lucide-react"

interface QRDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  url: string
  menuName: string
  branchName: string
}

export function QRDialog({ open, onOpenChange, url, menuName, branchName }: QRDialogProps) {
  const [size] = useState(250)

  const handleDownload = () => {
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `QR-${menuName}-${branchName}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Código QR para {menuName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <QRCodeSVG
              id="qr-code-svg"
              value={url}
              size={size}
              level="H"
              includeMargin
              imageSettings={{
                src: "/logo.png",
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
            <canvas id="qr-code-canvas" style={{ display: "none" }} width={size} height={size} />
          </div>
          <p className="mt-4 text-sm text-center text-muted-foreground">
            Escanea este código QR para acceder al menú {menuName} de {branchName}
          </p>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button onClick={handleDownload} className="w-full sm:w-auto gap-2">
            <Download className="h-4 w-4" />
            Descargar QR
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
