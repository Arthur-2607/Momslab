"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockOrders, mockProducts, mockBranches } from "@/lib/mock-data"
import { Package, ShoppingCart, TrendingUp, Store } from "lucide-react"

export default function AdminDashboardPage() {
  const totalOrders = mockOrders.length
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.totalAmount, 0)
  const avgMoqRate = Math.round(
    mockProducts.reduce((sum, p) => sum + ((p.currentOrders || 0) / p.moq) * 100, 0) / mockProducts.length,
  )
  const activeBranches = mockBranches.filter((b) => b.status === "active").length

  const stats = [
    {
      title: "총 주문 수",
      value: `${totalOrders}건`,
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "총 매출액",
      value: `${totalRevenue.toLocaleString()}원`,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "평균 MOQ 달성률",
      value: `${avgMoqRate}%`,
      icon: Package,
      color: "text-amber-600",
    },
    {
      title: "활성 지점 수",
      value: `${activeBranches}개`,
      icon: Store,
      color: "text-purple-600",
    },
  ]

  const recentOrders = mockOrders.slice(0, 5)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-gray-600 mt-1">전체 통계를 확인하세요</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <Icon className={cn("h-5 w-5", stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>최근 주문</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => {
              const product = mockProducts.find((p) => p.id === order.productId)
              return (
                <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">{product?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{order.totalAmount.toLocaleString()}원</p>
                    <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
