"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

interface CompletePageClientProps {
  branchSlug: string
}

export function CompletePageClient({ branchSlug }: CompletePageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const orderNumber = searchParams.get("orderNumber")
  const amount = searchParams.get("amount")

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-12 pb-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900 p-4">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">주문이 완료되었습니다!</h1>
            <p className="text-muted-foreground">상품이 도착하면 카카오톡으로 알림을 보내드립니다.</p>
          </div>

          <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">주문번호</span>
              <span className="font-semibold">{orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">결제 금액</span>
              <span className="font-semibold">{amount ? Number.parseInt(amount).toLocaleString() : "0"}원</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => router.push(`/${branchSlug}/mypage`)} className="flex-1">
              주문 내역 보기
            </Button>
            <Button onClick={() => router.push(`/${branchSlug}/products`)} className="flex-1">
              홈으로
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
