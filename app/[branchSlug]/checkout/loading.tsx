import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container px-4 py-3">
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="container px-4 py-6 max-w-2xl mx-auto space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  )
}
