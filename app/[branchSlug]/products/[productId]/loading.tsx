import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container px-4 py-3">
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="container px-4 py-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-md" />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Skeleton className="h-10 w-3/4 mb-2" />
              <Skeleton className="h-12 w-1/2" />
            </div>
            <Card>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
