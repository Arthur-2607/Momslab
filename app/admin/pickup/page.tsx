"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { mockOrders, mockProducts } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import { getAdminToken } from "@/lib/admin-auth"
import { Phone, AlertTriangle } from "lucide-react"

export default function PickupPage() {
  const { toast } = useToast()
  const token = getAdminToken()
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [showConvertDialog, setShowConvertDialog] = useState(false)
  const [convertingOrderId, setConvertingOrderId] = useState<string | null>(null)
  const [pickedUpOrderIds, setPickedUpOrderIds] = useState<string[]>([])

  // Filter orders for the branch owner's branch
  const branchOrders = mockOrders.filter((order) => order.branchId === token?.branchId)

  const readyOrders = branchOrders.filter(
    (o) => o.fulfillmentStatus === "ready_for_pickup" && !pickedUpOrderIds.includes(o.id),
  )
  const pickedUpOrders = branchOrders.filter(
    (o) => o.fulfillmentStatus === "picked_up" || pickedUpOrderIds.includes(o.id),
  )

  // Mock: orders that are 24+ hours old
  const overdueOrders = readyOrders.slice(0, 1) // Simulate one overdue order

  const handlePickupConfirm = (orderId: string) => {
    setPickedUpOrderIds([...pickedUpOrderIds, orderId])
    setSelectedOrders(selectedOrders.filter((id) => id !== orderId))
    toast({
      title: "수령 확인",
      description: "고객의 상품 수령이 확인되었습니다.",
    })
  }

  const handleBulkPickup = () => {
    if (selectedOrders.length === 0) return
    setPickedUpOrderIds([...pickedUpOrderIds, ...selectedOrders])
    toast({
      title: "일괄 수령 확인",
      description: `${selectedOrders.length}건의 주문이 수령 처리되었습니다.`,
    })
    setSelectedOrders([])
  }

  const handleConvertToFloorSale = () => {
    toast({
      title: "현장판매 전환",
      description: "주문이 현장판매로 전환되고 환불 처리되었습니다.",
    })
    setShowConvertDialog(false)
    setConvertingOrderId(null)
  }

  return (
    <>
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">픽업 관리</h1>
          <p className="text-gray-600 mt-1">고객의 상품 수령을 관리하세요</p>
        </div>

        <Tabs defaultValue="ready" className="space-y-6">
          <TabsList>
            <TabsTrigger value="ready">픽업 대기 ({readyOrders.length})</TabsTrigger>
            <TabsTrigger value="picked">픽업 완료 ({pickedUpOrders.length})</TabsTrigger>
            <TabsTrigger value="overdue">미수령 ({overdueOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="ready" className="space-y-4">
            {selectedOrders.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">{selectedOrders.length}건 선택됨</p>
                    <Button onClick={handleBulkPickup}>일괄 수령 확인</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {readyOrders.map((order) => {
              const product = mockProducts.find((p) => p.id === order.productId)
              const hoursAgo = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60))
              return (
                <Card key={order.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedOrders([...selectedOrders, order.id])
                          } else {
                            setSelectedOrders(selectedOrders.filter((id) => id !== order.id))
                          }
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">{order.orderNumber} | 홍길동 (010-1234-5678)</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {product?.name} x {order.quantity}개
                            </p>
                            <p className="text-sm text-gray-500 mt-1">도착: {hoursAgo}시간 전</p>
                          </div>
                          <Button onClick={() => handlePickupConfirm(order.id)}>수령 확인</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="picked" className="space-y-4">
            {pickedUpOrders.map((order) => {
              const product = mockProducts.find((p) => p.id === order.productId)
              return (
                <Card key={order.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{order.orderNumber} | 홍길동</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {product?.name} x {order.quantity}개
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          수령: {new Date(order.pickedUpAt!).toLocaleString()}
                        </p>
                      </div>
                      <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                        픽업완료
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="overdue" className="space-y-4">
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="h-5 w-5" />
                  24시간 경과 주문
                </CardTitle>
              </CardHeader>
            </Card>

            {overdueOrders.map((order) => {
              const product = mockProducts.find((p) => p.id === order.productId)
              const hoursAgo = 28 // Mock: 28 hours
              return (
                <Card key={order.id} className="border-red-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{order.orderNumber} | 홍길동 (010-1234-5678)</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {product?.name} x {order.quantity}개
                        </p>
                        <p className="text-sm text-red-600 mt-1 font-semibold">도착: {hoursAgo}시간 전 🔴</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Phone className="mr-2 h-4 w-4" />
                          고객 연락
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setConvertingOrderId(order.id)
                            setShowConvertDialog(true)
                          }}
                        >
                          현장판매 전환
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>현장판매 전환</DialogTitle>
            <DialogDescription>
              이 주문을 현장판매로 전환하시겠습니까? 고객에게 자동으로 환불 처리됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">사유 (선택)</label>
              <Textarea placeholder="전환 사유를 입력하세요" rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConvertDialog(false)}>
                취소
              </Button>
              <Button variant="destructive" onClick={handleConvertToFloorSale}>
                전환하기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
