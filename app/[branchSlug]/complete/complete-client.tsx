"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

interface CompleteClientProps {
  branchSlug: string
}

export function CompleteClient({ branchSlug }: CompleteClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const orderNumber = searchParams.get("orderNumber")
  const amount = searchParams.get("amount")

  if (!orderNumber || !amount) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">주문 정보를 찾을 수 없습니다.</p>
            <Button onClick={() => router.push(`/${branchSlug}/products`)} className="mt-4">
              상품 목록으로
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold">결제가 완료되었습니다</h1>
            <div className="space-y-2 text-muted-foreground">
              <p>주문번호: {orderNumber}</p>
              <p className="text-xl font-semibold text-foreground">{Number(amount).toLocaleString()}원</p>
            </div>
            <div className="pt-4 space-y-2">
              <Button onClick={() => router.push(`/${branchSlug}/mypage`)} className="w-full">
                주문 내역 보기
              </Button>
              <Button onClick={() => router.push(`/${branchSlug}/products`)} variant="outline" className="w-full">
                상품 목록으로
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
