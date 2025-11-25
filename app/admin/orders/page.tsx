"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Search, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  listOrders,
  getOrderStats,
  getAllBranches,
  type OrderWithDetails,
  type Branch,
} from "@/lib/server"

export default function OrdersPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)

  // Input filter states (not applied until search button clicked)
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])
  const [branchFilter, setBranchFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Load branches on mount
  useEffect(() => {
    loadBranches()
    handleSearch() // Load orders initially
  }, [])

  async function loadBranches() {
    const result = await getAllBranches()
    if (result.success && result.branches) {
      setBranches(result.branches)
    }
  }

  async function handleSearch() {
    setLoading(true)

    // Build query
    const query: any = {
      limit: 100,
      offset: 0,
    }

    if (branchFilter !== "all") {
      query.branchId = branchFilter
    }

    if (statusFilter !== "all") {
      query.fulfillmentStatus = statusFilter
    }

    if (dateFrom) {
      query.dateFrom = new Date(dateFrom).toISOString()
    }

    if (dateTo) {
      const endDate = new Date(dateTo)
      endDate.setHours(23, 59, 59, 999)
      query.dateTo = endDate.toISOString()
    }

    if (searchQuery) {
      query.search = searchQuery
    }

    // Fetch orders
    const result = await listOrders(query)

    if (result.success && result.orders) {
      setOrders(result.orders)

      // Calculate totals
      const total = result.orders.length
      const revenue = result.orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)

      setTotalOrders(total)
      setTotalRevenue(revenue)
    } else {
      toast({
        title: "오류",
        description: result.error || "주문 목록을 불러올 수 없습니다",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const handleDownloadCSV = () => {
    if (orders.length === 0) {
      toast({
        title: "내보내기 실패",
        description: "내보낼 주문이 없습니다",
        variant: "destructive",
      })
      return
    }

    // CSV headers
    const headers = ["주문번호", "일시", "지점", "고객명", "고객이메일", "상품명", "수량", "금액", "결제상태", "처리상태"]

    // CSV rows
    const rows = orders.map(order => [
      order.orderNumber || "",
      order.createdAt ? new Date(order.createdAt).toLocaleString("ko-KR") : "",
      order.branchName || "",
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
    link.setAttribute("download", `전체주문내역_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "내보내기 완료",
      description: `${orders.length}건의 주문을 CSV로 내보냈습니다`,
    })
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">주문 통합 관리</h1>
          <p className="text-gray-600 mt-1">전체 지점의 주문을 관리하세요</p>
        </div>
        <Button onClick={handleDownloadCSV}>
          <Download className="mr-2 h-4 w-4" />
          CSV 다운로드
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">기간</label>
                <div className="flex gap-2">
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                  <span className="flex items-center">~</span>
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">상품명 검색</label>
                <Input
                  placeholder="상품명을 입력하세요"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">지점</label>
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                  </SelectContent>
                </Select>
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

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-8">
            <div>
              <p className="text-sm text-gray-600">총 주문</p>
              <p className="text-2xl font-bold">{totalOrders}건</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">매출</p>
              <p className="text-2xl font-bold">{totalRevenue.toLocaleString()}원</p>
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
              <p className="text-sm mt-2">검색 조건을 변경해 보세요</p>
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
                  <th className="px-6 py-3 text-left text-sm font-semibold">지점</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">상품명</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">수량</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">금액</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '-'}
                    </td>
                    <td className="px-6 py-4">{order.branchName || '-'}</td>
                    <td className="px-6 py-4">{order.productName || '-'}</td>
                    <td className="px-6 py-4">{order.quantity}개</td>
                    <td className="px-6 py-4 font-semibold">{order.totalAmount?.toLocaleString()}원</td>
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
