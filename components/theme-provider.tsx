"use client"

import type * as React from "react"
import { useTheme as useNextTheme } from "next-themes"

export function ThemeProvider({ children, ...props }: React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>) {
  return <NextUIThemeProvider {...props}>{children}</NextUIThemeProvider>
}

function NextUIThemeProvider({ children, ...props }: React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>) {
  return <div {...props}>{children}</div>
}

export function useTheme() {
  return useNextTheme()
}
