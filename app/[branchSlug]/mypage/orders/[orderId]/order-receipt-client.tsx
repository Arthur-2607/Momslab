"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { StatusBadge } from "@/components/status-badge"
import type { OrderWithDetails } from "@/lib/server"
import { getOrder } from "@/lib/server"
import { ArrowLeft, MapPin, Clock, AlertTriangle, Download, Share2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface OrderReceiptClientProps {
  branchSlug: string
  orderId: string
}

export function OrderReceiptClient({ branchSlug, orderId }: OrderReceiptClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [storageRequest, setStorageRequest] = useState("")
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch order data
  useEffect(() => {
    async function loadOrder() {
      try {
        const result = await getOrder(orderId)
        if (result.success && result.order) {
          setOrder(result.order as OrderWithDetails)
        } else {
          console.error("[OrderReceipt] Failed to load order:", result.error)
        }
      } catch (error) {
        console.error("[OrderReceipt] Error loading order:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadOrder()
  }, [orderId])

  const handleStorageRequest = () => {
    console.log("[OrderReceipt] Storage request:", storageRequest)
    toast({
      title: "요청이 접수되었습니다",
      description: "담당자가 확인 후 연락드리겠습니다.",
    })
    setStorageRequest("")
    setIsRequestDialogOpen(false)
  }

  const handleDownload = () => {
    toast({
      title: "영수증 다운로드",
      description: "영수증이 다운로드되었습니다.",
    })
  }

  const handleShare = () => {
    toast({
      title: "영수증 공유",
      description: "영수증 링크가 복사되었습니다.",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground mt-2">주문 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b">
          <div className="container px-4 py-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              주문 내역
            </Button>
          </div>
        </div>
        <div className="container px-4 py-12 max-w-2xl mx-auto text-center">
          <p className="text-muted-foreground">주문을 찾을 수 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            주문 내역
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* 영수증 헤더 */}
        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <h1 className="text-2xl font-bold">주문 영수증</h1>
            <p className="text-muted-foreground">{order.branchName || "지점"}</p>
            <div className="pt-4">
              <StatusBadge status={order.fulfillmentStatus} className="text-base px-4 py-2" />
            </div>
          </CardContent>
        </Card>

        {/* 주문 정보 */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">주문 정보</h2>
            <Separator />
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">주문번호</span>
                <span className="font-medium">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">주문일시</span>
                <span className="font-medium">{order.createdAt ? new Date(order.createdAt).toLocaleString("ko-KR") : "-"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">결제 상태</span>
                <span className="font-medium">
                  {order.paymentStatus === "pending" && "결제 대기"}
                  {order.paymentStatus === "completed" && "결제 완료"}
                  {order.paymentStatus === "failed" && "결제 실패"}
                  {order.paymentStatus === "refunded" && "환불 완료"}
                </span>
              </div>
              {order.pickupDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">픽업일시</span>
                  <span className="font-medium">{new Date(order.pickupDate).toLocaleString("ko-KR")}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 상품 정보 */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">상품 정보</h2>
            <Separator />
            <div className="flex gap-4">
              <div className="relative w-24 h-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                <Image
                  src={order.productImageUrl || "/placeholder.svg"}
                  alt={order.productName || "Product"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-medium">{order.productName || "상품"}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">단가</span>
                    <span>{order.unitPrice.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">수량</span>
                    <span>{order.quantity}개</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>소계</span>
                    <span>{order.totalAmount.toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 결제 정보 */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">결제 정보</h2>
            <Separator />
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">결제 상태</span>
                <span className="font-medium">
                  {order.paymentStatus === "pending" && "결제 대기"}
                  {order.paymentStatus === "completed" && "결제 완료"}
                  {order.paymentStatus === "failed" && "결제 실패"}
                  {order.paymentStatus === "refunded" && "환불 완료"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">상품 금액</span>
                <span>{order.totalAmount.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">배송비</span>
                <span>0원</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>총 결제 금액</span>
                <span className="text-primary">{order.totalAmount.toLocaleString()}원</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 픽업 안내 */}
        {order.fulfillmentStatus === "ready_for_pickup" && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-lg">픽업 안내</h2>
              <Separator />
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">{order.branchName}</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">서울시 강남구 테헤란로 123</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">영업시간: 10:00 - 20:00</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-900 dark:text-yellow-100">당일 수령 원칙</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">오늘 안으로 방문해주세요!</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsRequestDialogOpen(true)}>
                보관 요청하기 (부득이한 경우)
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 픽업 완료 */}
        {order.fulfillmentStatus === "picked_up" && order.pickupDate && (
          <Card>
            <CardContent className="p-6">
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                <p className="font-medium text-green-900 dark:text-green-100">픽업이 완료되었습니다</p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  {new Date(order.pickupDate).toLocaleString("ko-KR")}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 보관 요청 다이얼로그 */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>보관 요청</DialogTitle>
            <DialogDescription>부득이한 사유로 당일 수령이 어려운 경우 보관을 요청할 수 있습니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="사유를 입력해주세요 (최대 200자)"
              value={storageRequest}
              onChange={(e) => setStorageRequest(e.target.value.slice(0, 200))}
              rows={4}
            />
            <p className="text-xs text-muted-foreground text-right">{storageRequest.length}/200</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleStorageRequest} disabled={!storageRequest.trim()}>
              요청하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
