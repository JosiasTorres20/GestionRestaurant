import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Componente que muestra un esqueleto de carga para la página de sucursales
 * Utiliza el patrón de esqueleto para mejorar la experiencia de usuario durante la carga
 */
export function BranchesLoadingSkeleton() {
  // Número de tarjetas de esqueleto a mostrar
  const skeletonCount = 6

  return (
    <div className="space-y-6">
      {/* Encabezado de página */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Skeleton className="h-8 w-[250px] mb-2" />
          <Skeleton className="h-4 w-[350px]" />
        </div>
      </div>

      {/* Barra de búsqueda y botón */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-10 w-[150px]" />
      </div>

      {/* Cuadrícula de tarjetas de sucursales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <BranchCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}

/**
 * Componente que representa el esqueleto de una tarjeta de sucursal individual
 * Extraído para mejorar la legibilidad y reutilización
 */
function BranchCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-[150px] mb-2" />
        <Skeleton className="h-4 w-[100px]" />
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Skeleton className="h-4 w-4 mt-0.5" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-[120px]" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-[180px]" />
          </div>
        </div>
      </CardContent>
      <div className="p-6 pt-2 flex justify-between">
        <Skeleton className="h-9 w-[80px]" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-[150px]" />
          <Skeleton className="h-9 w-[80px]" />
        </div>
      </div>
    </Card>
  )
}
