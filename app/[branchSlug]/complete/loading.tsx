import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function CompleteLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">결제 처리 중...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
