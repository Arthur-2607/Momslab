"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StatusBadge } from "@/components/status-badge"
import { MoqProgress } from "@/components/moq-progress"
import { useCountdown } from "@/hooks/use-countdown"
import type { Branch, Product } from "@/lib/server"
import { getCurrentUser } from "@/lib/auth"
import { ArrowLeft, Minus, Plus, Clock, Package, AlertCircle } from "lucide-react"
import { useBranchTheme } from "@/lib/branch-theme-context"

interface ProductDetailClientProps {
  branchSlug: string
  branch: Branch
  product: Product
}

export function ProductDetailClient({ branchSlug, branch, product }: ProductDetailClientProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [stockError, setStockError] = useState<string | null>(null)
  const { getBranchColor } = useBranchTheme()

  const branchId = branch.id
  const branchColor = getBranchColor(branchId)

  const { timeLeft: liveTimeLeft, isExpired } = useCountdown(product.endAt)
  const currentOrders = product.currentOrders || 0
  const images = (product.images && Array.isArray(product.images) && product.images.length > 0)
    ? product.images
    : [product.imageUrl]
  const totalPrice = product.price * quantity

  const isAchieved = currentOrders >= product.moq

  // Calculate remaining quantity until MOQ is reached
  const remainingToGoal = product.moq - currentOrders
  const maxAllowedQuantity = isAchieved ? 0 : remainingToGoal
  const isNearGoal = remainingToGoal <= 10 && currentOrders < product.moq && product.status === "open"

  // Calculate frozen countdown for goal-reached products
  const frozenTimeLeft = useMemo(() => {
    if (!isAchieved) return null
    const now = new Date().getTime()
    const end = new Date(product.endAt).getTime()
    const diff = end - now

    if (diff <= 0) return "마감"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }, [isAchieved, product.endAt])

  const timeLeft = isAchieved ? frozenTimeLeft : liveTimeLeft

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta

    // Check if exceeding remaining MOQ capacity
    if (currentOrders + newQuantity > product.moq) {
      setStockError("재고 초과로 추가할 수 없습니다.")
      return
    }

    if (newQuantity >= 1) {
      setQuantity(newQuantity)
      setStockError(null)
    }
  }

  const handleCheckout = () => {
    const user = getCurrentUser()
    if (!user) {
      router.push(
        `/${branchSlug}/login?redirect=${encodeURIComponent(`/${branchSlug}/checkout?productId=${product.id}&quantity=${quantity}`)}`,
      )
      return
    }
    router.push(`/${branchSlug}/checkout?productId=${product.id}&quantity=${quantity}`)
  }

  const isAvailable = product.status === "open" && !isExpired

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            뒤로가기
          </Button>
        </div>
      </div>

      <div className="container px-4 py-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* 이미지 섹션 */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image
                src={images[selectedImageIndex] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {/* Top-left badge */}
              <div className="absolute top-3 left-3">
                {isAchieved ? (
                  // If achieved: Show "마감" badge (gray)
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-500 text-white">
                    마감
                  </span>
                ) : isNearGoal ? (
                  // If near goal: Show red "마감임박" badge
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#EF4444] text-white">
                    마감임박
                  </span>
                ) : (
                  // Normal: Show "오픈" badge with branch color
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: branchColor }}
                  >
                    오픈
                  </span>
                )}
              </div>
              {/* Top-right badge: Only show for non-achieved products */}
              {!isAchieved && (
                <div className="absolute top-3 right-3">
                  <StatusBadge status={product.status} />
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative aspect-square overflow-hidden rounded-md border-2 transition-colors ${selectedImageIndex === idx
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground/50"
                      }`}
                  >
                    <Image
                      src={img || "/placeholder.svg"}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 상품 정보 섹션 */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-3xl font-bold text-balance">{product.name}</h1>
              </div>
              <p className="text-4xl font-bold text-primary">{product.price.toLocaleString()}원</p>
            </div>

            {/* MOQ 정보 카드 */}
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">최소 주문 수량 정보</h3>
                    <MoqProgress current={currentOrders} moq={product.moq} themeColor={branchColor} />
                    <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                      <Clock className="h-4 w-4" />
                      <span>남은 시간: {timeLeft}</span>
                    </div>
                    <Alert className="bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700">
                      <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <AlertDescription className="text-blue-800 dark:text-blue-200">
                        MOQ 미달 시 자동 취소 및 환불됩니다
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 수량 선택 */}
            <div className="space-y-3">
              <label className="text-sm font-medium">수량</label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                  <Minus className="h-4 w-4" />
                </Button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = Number.parseInt(e.target.value) || 1

                    // Check if exceeding remaining MOQ capacity
                    if (currentOrders + val > product.moq) {
                      setStockError("재고 초과로 추가할 수 없습니다.")
                      return
                    }

                    if (val >= 1) {
                      setQuantity(val)
                      setStockError(null)
                    }
                  }}
                  className="w-20 text-center border rounded-md px-3 py-2 font-semibold"
                  min="1"
                  max={maxAllowedQuantity || undefined}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  disabled={isAchieved || currentOrders + quantity >= product.moq || !!stockError}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Stock error message - inline red text */}
              {stockError && (
                <p className="text-sm font-semibold text-[#EF4444] mt-1">{stockError}</p>
              )}
            </div>

            {/* 구매 버튼 */}
            <div className="sticky bottom-0 bg-background pt-4 border-t">
              <Button
                onClick={handleCheckout}
                disabled={!isAvailable || !!stockError}
                className="w-full h-14 text-lg font-semibold text-white"
                style={{ backgroundColor: isAvailable && !stockError ? branchColor : undefined }}
                size="lg"
              >
                {product.status === "soldout"
                  ? "마감"
                  : isExpired
                    ? "판매가 종료되었습니다"
                    : `구매하기 (${totalPrice.toLocaleString()}원)`}
              </Button>
            </div>
          </div>
        </div>

        {/* 상세 설명 */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">상품 상세</h2>
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: product.description ?? '' }}
          />
        </div>
      </div>
    </div>
  )
}
