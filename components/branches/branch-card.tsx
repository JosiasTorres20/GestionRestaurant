"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Mail } from "lucide-react"
import type { Branch } from "@/types"

interface BranchCardProps {
  branch: Branch
  onEdit: (branch: Branch) => void
  onDelete: (branch: Branch) => void
  onSetMain: (branch: Branch) => void
}

/**
 * Componente que muestra una tarjeta con la información de una sucursal
 */
export function BranchCard({ branch, onEdit, onDelete, onSetMain }: BranchCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {branch.name}
              {branch.is_main && <Badge className="bg-primary text-primary-foreground">Principal</Badge>}
              {!branch.is_active && (
                <Badge variant="outline" className="text-muted-foreground">
                  Inactiva
                </Badge>
              )}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span className="text-sm">{branch.address}</span>
          </div>
          {branch.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{branch.phone}</span>
            </div>
          )}
          {branch.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{branch.email}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(branch)}
          className="border-brand-primary text-brand-primary"
        >
          Editar
        </Button>
        <div className="flex gap-2">
          {!branch.is_main && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetMain(branch)}
              className="border-brand-primary text-brand-primary"
            >
              Establecer como Principal
            </Button>
          )}
          {!branch.is_main && (
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => onDelete(branch)}>
              Eliminar
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
