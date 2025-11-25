import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-12 pb-8 text-center space-y-6">
          <div className="flex justify-center">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">결제 처리 중...</h1>
            <p className="text-muted-foreground">잠시만 기다려주세요.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
