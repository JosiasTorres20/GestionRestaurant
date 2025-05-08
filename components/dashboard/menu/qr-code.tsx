"use client"

import { useEffect, useRef } from "react"
import QRCodeStyling from "qr-code-styling"

interface QRCodeProps {
  value: string
  size?: number
  bgColor?: string
  fgColor?: string
  level?: "L" | "M" | "Q" | "H"
  imageSize?: number
  imageUrl?: string
}

export function QRCode({
  value,
  size = 200,
  bgColor = "#FFFFFF",
  fgColor = "#000000",
  level = "L",
  imageSize = 0.3,
  imageUrl,
}: QRCodeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const qrRef = useRef<QRCodeStyling | null>(null)

  useEffect(() => {
    if (!ref.current) return

    if (!qrRef.current) {
      qrRef.current = new QRCodeStyling({
        width: size,
        height: size,
        type: "svg",
        data: value,
        dotsOptions: {
          color: fgColor,
          type: "rounded",
        },
        backgroundOptions: {
          color: bgColor,
        },
        cornersSquareOptions: {
          type: "extra-rounded",
        },
        cornersDotOptions: {
          type: "dot",
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 5,
        },
        qrOptions: {
          errorCorrectionLevel: level,
        },
      })

      qrRef.current.append(ref.current)
    } else {
      qrRef.current.update({
        data: value,
        width: size,
        height: size,
        dotsOptions: {
          color: fgColor,
        },
        backgroundOptions: {
          color: bgColor,
        },
        qrOptions: {
          errorCorrectionLevel: level,
        },
      })
    }

    // Agregar logo si se proporciona
    if (imageUrl && qrRef.current) {
      qrRef.current.update({
        image: imageUrl,
        imageOptions: {
          hideBackgroundDots: true,
          imageSize,
          crossOrigin: "anonymous",
          margin: 5,
        },
      })
    }
  }, [value, size, bgColor, fgColor, level, imageSize, imageUrl])

  return <div ref={ref} className="flex items-center justify-center" />
}
