"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/status-badge"
import { getCurrentUser } from "@/lib/auth"
import type { OrderWithDetails } from "@/lib/server"
import { getOrdersByCustomer } from "@/lib/server"
import { ArrowLeft, ChevronRight, MapPin, Clock, AlertTriangle, MessageSquare, UserPlus, Filter, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MyPageClientProps {
  branchSlug: string
}

function OrderCard({
  order,
  branchSlug,
  onViewDetail,
}: { order: OrderWithDetails; branchSlug: string; onViewDetail: (order: OrderWithDetails) => void }) {
  return (
    <Card
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onViewDetail(order)}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
            <Image
              src={order.productImageUrl || "/placeholder.svg"}
              alt={order.productName || "Product"}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">
                  {order.orderNumber} · {new Date(order.createdAt || "").toLocaleDateString("ko-KR")}
                </p>
                <h3 className="font-semibold line-clamp-1">{order.productName || "상품"}</h3>
                <p className="text-sm text-muted-foreground">
                  {order.quantity}개 · {order.totalAmount.toLocaleString()}원
                </p>
              </div>
              <StatusBadge status={order.fulfillmentStatus} />
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 self-center" />
        </div>
      </CardContent>
    </Card>
  )
}

function OrderDetailDialog({
  order,
  open,
  onClose,
  branchSlug,
}: { order: OrderWithDetails | null; open: boolean; onClose: () => void; branchSlug: string }) {
  const { toast } = useToast()
  const [storageRequest, setStorageRequest] = useState("")
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)

  const handleStorageRequest = () => {
    console.log("[MyPage] Storage request:", storageRequest)
    toast({
      title: "요청이 접수되었습니다",
      description: "담당자가 확인 후 연락드리겠습니다.",
    })
    setStorageRequest("")
    setIsRequestDialogOpen(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>주문 상세</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* 주문 정보 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">주문번호</span>
                <span className="font-medium">{order?.orderNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">주문일시</span>
                <span className="font-medium">{order?.createdAt ? new Date(order.createdAt).toLocaleString("ko-KR") : ""}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">상태</span>
                {order && <StatusBadge status={order.fulfillmentStatus} />}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">지점</span>
                <span className="font-medium">{order?.branchName || "지점"}</span>
              </div>
            </div>

            {/* 상품 정보 */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">상품 정보</h3>
              <div className="flex gap-4">
                <div className="relative w-24 h-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={order?.productImageUrl || "/placeholder.svg"}
                    alt={order?.productName || "Product"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{order?.productName || "상품"}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {order?.unitPrice.toLocaleString()}원 x {order?.quantity}개 = {order?.totalAmount.toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>

            {/* 결제 정보 */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">결제 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">결제 상태</span>
                  <span className="font-medium">
                    {order?.paymentStatus === "pending" && "결제 대기"}
                    {order?.paymentStatus === "completed" && "결제 완료"}
                    {order?.paymentStatus === "failed" && "결제 실패"}
                    {order?.paymentStatus === "refunded" && "환불 완료"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">결제 금액</span>
                  <span className="font-medium">{order?.totalAmount.toLocaleString()}원</span>
                </div>
              </div>
            </div>

            {/* 픽업 안내 */}
            {order?.fulfillmentStatus === "ready_for_pickup" && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">픽업 안내</h3>
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">{order?.branchName}</p>
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
                <Button
                  variant="outline"
                  className="w-full mt-3 bg-transparent"
                  onClick={() => setIsRequestDialogOpen(true)}
                >
                  보관 요청하기 (부득이한 경우)
                </Button>
              </div>
            )}

            {/* 픽업 완료 */}
            {order?.fulfillmentStatus === "picked_up" && order.pickupDate && (
              <div className="border-t pt-4">
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    픽업 완료: {new Date(order.pickupDate).toLocaleString("ko-KR")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
    </>
  )
}

export function MyPageClient({ branchSlug }: MyPageClientProps) {
  const router = useRouter()
  const [user, setUser] = useState(getCurrentUser())
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)

  // Fetch orders on mount
  useEffect(() => {
    async function loadOrders() {
      if (!user?.id) {
        setIsLoadingOrders(false)
        return
      }

      try {
        const result = await getOrdersByCustomer(user.id)
        if (result.success && result.orders) {
          setOrders(result.orders)
        } else {
          console.error("[MyPage] Failed to load orders:", result.error)
        }
      } catch (error) {
        console.error("[MyPage] Error loading orders:", error)
      } finally {
        setIsLoadingOrders(false)
      }
    }

    loadOrders()
  }, [user?.id])

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = [...orders]

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date()
      const filterDate = new Date()

      if (dateFilter === "today") {
        filterDate.setHours(0, 0, 0, 0)
      } else if (dateFilter === "week") {
        filterDate.setDate(now.getDate() - 7)
      } else if (dateFilter === "month") {
        filterDate.setMonth(now.getMonth() - 1)
      } else if (dateFilter === "3months") {
        filterDate.setMonth(now.getMonth() - 3)
      }

      filtered = filtered.filter((o) => {
        const orderDate = new Date(o.createdAt || "")
        return orderDate >= filterDate
      })
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((o) => o.fulfillmentStatus === statusFilter)
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) =>
      new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
    )
  }, [orders, dateFilter, statusFilter])

  const handleViewDetail = (order: OrderWithDetails) => {
    setSelectedOrder(order)
    setIsDetailOpen(true)
  }

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        {/* 헤더 */}
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b">
          <div className="container px-4 py-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              마이페이지
            </Button>
          </div>
        </div>

        <div className="container px-4 py-6 max-w-md mx-auto">
          <Card>
            <CardContent className="p-8 space-y-4">
              <div className="text-center space-y-2 mb-6">
                <h2 className="text-2xl font-bold">로그인이 필요합니다</h2>
                <p className="text-muted-foreground">
                  주문 내역과 회원 정보를 확인하려면
                  <br />
                  로그인해주세요
                </p>
              </div>

              <Button
                onClick={() => router.push(`/${branchSlug}/signup?redirect=/${branchSlug}/mypage`)}
                className="w-full h-12 bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] font-semibold"
                size="lg"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                카카오 간편가입
              </Button>

              <Button
                onClick={() => router.push(`/${branchSlug}/login?redirect=/${branchSlug}/mypage`)}
                variant="outline"
                className="w-full h-12 font-semibold"
                size="lg"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                카카오 로그인
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            마이페이지
          </Button>
        </div>
      </div>

      <div className="container px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* 사용자 정보 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">{user?.name.charAt(0)}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">{user?.name} 님</h2>
                <p className="text-muted-foreground">{user?.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 주문 내역 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">주문 내역 ({filteredOrders.length})</h3>
          </div>

          {/* 필터 UI 섹션 */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">필터</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 날짜 필터 */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">날짜</label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="전체" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="today">오늘</SelectItem>
                      <SelectItem value="week">최근 1주일</SelectItem>
                      <SelectItem value="month">최근 1개월</SelectItem>
                      <SelectItem value="3months">최근 3개월</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 상태 필터 */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">상태</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="전체" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="preparing">상품 준비중</SelectItem>
                      <SelectItem value="ready_for_pickup">픽업대기</SelectItem>
                      <SelectItem value="picked_up">픽업 완료</SelectItem>
                      <SelectItem value="cancelled">취소됨</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {isLoadingOrders ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-muted-foreground mt-2">주문 내역을 불러오는 중...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">주문 내역이 없습니다.</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} branchSlug={branchSlug} onViewDetail={handleViewDetail} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* 주문 상세 다이얼로그 */}
      <OrderDetailDialog
        order={selectedOrder}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        branchSlug={branchSlug}
      />
    </div>
  )
}
