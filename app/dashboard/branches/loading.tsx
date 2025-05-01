import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function BranchesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Skeleton className="h-8 w-[250px] mb-2" />
          <Skeleton className="h-4 w-[350px]" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-10 w-[150px]" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
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
        ))}
      </div>
    </div>
  )
}
