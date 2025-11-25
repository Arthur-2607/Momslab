"use client"

import { useState, useEffect, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Download, Search, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getOrdersByBranch,
  getAdminSession,
  type OrderWithDetails,
} from "@/lib/server"

export default function BranchOrdersPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [branchId, setBranchId] = useState<string>("")
  const [branchName, setBranchName] = useState<string>("")

  // Filter states
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [autoRefresh, setAutoRefresh] = useState(false)

  useEffect(() => {
    loadOrders()

    // Auto-refresh every 30 seconds if enabled
    let interval: NodeJS.Timeout | null = null
    if (autoRefresh) {
      interval = setInterval(() => {
        loadOrders()
      }, 30000) // 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  async function loadOrders() {
    setLoading(true)

    // Get admin session to get branch ID
    const session = await getAdminSession()

    if (!session) {
      toast({
        title: "인증 오류",
        description: "로그인 세션이 만료되었습니다",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    setBranchName(session.name)

    // Determine which branch to show orders for
    let targetBranchId: string | undefined

    if (session.role === "super_admin") {
      // Super admin: Redirect or show info
      toast({
        title: "안내",
        description: "슈퍼 관리자는 '주문 통합 관리' 페이지를 이용해주세요",
      })
      setLoading(false)
      setTimeout(() => {
        window.location.href = "/admin/orders"
      }, 2000)
      return
    } else if (session.role === "branch_owner") {
      if (!session.branchId) {
        toast({
          title: "오류",
          description: "지점 정보를 찾을 수 없습니다. 다시 로그인해주세요.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }
      targetBranchId = session.branchId
    } else {
      toast({
        title: "권한 오류",
        description: `접근 권한이 없습니다. 현재 역할: ${session.role}`,
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    setBranchId(targetBranchId)

    // Build filter object for server-side filtering
    const filters: any = {}

    if (dateFrom) {
      filters.dateFrom = new Date(dateFrom).toISOString()
    }

    if (dateTo) {
      const endDate = new Date(dateTo)
      endDate.setHours(23, 59, 59, 999)
      filters.dateTo = endDate.toISOString()
    }

    if (statusFilter !== "all") {
      filters.fulfillmentStatus = statusFilter
    }

    if (searchQuery.trim()) {
      filters.search = searchQuery.trim()
    }

    // Fetch orders for this branch with filters
    const result = await getOrdersByBranch(targetBranchId, filters)

    if (result.success && result.orders) {
      setOrders(result.orders)
    } else {
      toast({
        title: "오류",
        description: result.error || "주문 목록을 불러올 수 없습니다",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  // Calculate stats from server-filtered orders
  const stats = useMemo(() => {
    return {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      preparing: orders.filter(o => o.fulfillmentStatus === "preparing").length,
      readyForPickup: orders.filter(o => o.fulfillmentStatus === "ready_for_pickup").length,
      pickedUp: orders.filter(o => o.fulfillmentStatus === "picked_up").length,
      cancelled: orders.filter(o => o.fulfillmentStatus === "cancelled").length,
    }
  }, [orders])

  // Export to CSV
  function exportToCSV() {
    if (orders.length === 0) {
      toast({
        title: "내보내기 실패",
        description: "내보낼 주문이 없습니다",
        variant: "destructive",
      })
      return
    }

    // CSV headers
    const headers = ["주문번호", "일시", "고객명", "고객이메일", "상품명", "수량", "금액", "결제상태", "처리상태"]

    // CSV rows
    const rows = orders.map(order => [
      order.orderNumber || "",
      order.createdAt ? new Date(order.createdAt).toLocaleString("ko-KR") : "",
      order.customerName || "",
      order.customerEmail || "",
      order.productName || "",
      order.quantity || 0,
      order.totalAmount || 0,
      order.paymentStatus === "completed" ? "완료" :
        order.paymentStatus === "failed" ? "실패" :
          order.paymentStatus === "refunded" ? "환불" : "대기",
      order.fulfillmentStatus === "picked_up" ? "픽업완료" :
        order.fulfillmentStatus === "ready_for_pickup" ? "픽업대기" :
          order.fulfillmentStatus === "cancelled" ? "취소됨" : "준비중"
    ])

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    // Add BOM for Excel UTF-8 support
    const BOM = "\uFEFF"
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })

    // Download
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `주문내역_${branchName}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "내보내기 완료",
      description: `${orders.length}건의 주문을 CSV로 내보냈습니다`,
    })
  }

  // Handle search button click
  function handleSearch() {
    loadOrders()
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">주문 내역</h1>
          <p className="text-gray-600 mt-1">지점의 주문 내역을 확인하세요</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            size="sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`} />
            {autoRefresh ? "자동새로고침 ON" : "자동새로고침 OFF"}
          </Button>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            CSV 내보내기
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">시작일</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">종료일</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">상태</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="preparing">준비중</SelectItem>
                    <SelectItem value="ready_for_pickup">픽업대기</SelectItem>
                    <SelectItem value="picked_up">픽업완료</SelectItem>
                    <SelectItem value="cancelled">취소됨</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">검색 (주문번호/고객명/상품명)</label>
                <Input
                  placeholder="검색어를 입력하세요"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch()
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSearch} className="w-full md:w-auto">
                <Search className="mr-2 h-4 w-4" />
                검색
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-8 flex-wrap">
            <div>
              <p className="text-sm text-gray-600">총 주문</p>
              <p className="text-2xl font-bold">{stats.totalOrders}건</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">총 매출</p>
              <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()}원</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">준비중</p>
              <p className="text-2xl font-bold">{stats.preparing}건</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">픽업대기</p>
              <p className="text-2xl font-bold">{stats.readyForPickup}건</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">픽업완료</p>
              <p className="text-2xl font-bold">{stats.pickedUp}건</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">취소됨</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}건</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <p className="text-lg font-semibold">주문 내역이 없습니다</p>
              <p className="text-sm mt-2">
                {searchQuery || statusFilter !== "all" || dateFrom || dateTo
                  ? "검색 조건에 맞는 주문이 없습니다"
                  : "아직 주문이 없습니다"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">주문번호</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">일시</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">고객</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">상품명</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">수량</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">금액</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">결제</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>{order.customerName || "-"}</div>
                      <div className="text-xs text-gray-500">{order.customerEmail || ""}</div>
                    </td>
                    <td className="px-6 py-4">{order.productName || "-"}</td>
                    <td className="px-6 py-4">{order.quantity}개</td>
                    <td className="px-6 py-4 font-semibold">
                      {order.totalAmount?.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${order.paymentStatus === "completed"
                          ? "bg-green-100 text-green-800"
                          : order.paymentStatus === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {order.paymentStatus === "completed"
                          ? "완료"
                          : order.paymentStatus === "failed"
                            ? "실패"
                            : order.paymentStatus === "refunded"
                              ? "환불"
                              : "대기"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${order.fulfillmentStatus === "picked_up"
                          ? "bg-blue-100 text-blue-800"
                          : order.fulfillmentStatus === "ready_for_pickup"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.fulfillmentStatus === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {order.fulfillmentStatus === "picked_up"
                          ? "픽업완료"
                          : order.fulfillmentStatus === "ready_for_pickup"
                            ? "픽업대기"
                            : order.fulfillmentStatus === "cancelled"
                              ? "취소됨"
                              : "준비중"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
