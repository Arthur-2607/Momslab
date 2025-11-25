"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { MoqProgress } from "@/components/moq-progress"
import { useCountdown } from "@/hooks/use-countdown"
import type { Branch, Product } from "@/lib/server"
import { Clock } from "lucide-react"
import Image from "next/image"
import { useBranchTheme } from "@/lib/branch-theme-context"
import { format, isSameDay, addDays, startOfDay } from "date-fns"
import { ko } from "date-fns/locale/ko"

// Compact product card component
function CompactProductCard({ product, branchSlug, branchColor }: { product: Product; branchSlug: string; branchColor: string }) {
  const { timeLeft, isExpired } = useCountdown(product.endAt)
  const currentOrders = product.currentOrders || 0
  const moq = product.moq

  // Calculate remaining items to reach goal (MOQ-based)
  const remainingToGoal = moq - currentOrders
  const isGoalReached = currentOrders >= moq
  const isNearGoal = remainingToGoal <= 10 && currentOrders < moq && product.status === "open"

  // Check if deadline is within 24 hours
  const isDeadlineSoon = useMemo(() => {
    const now = new Date().getTime()
    const end = new Date(product.endAt).getTime()
    const hoursLeft = (end - now) / (1000 * 60 * 60)
    return hoursLeft <= 24 && hoursLeft > 0
  }, [product.endAt])

  // Calculate static countdown for goal-reached products (frozen time)
  const frozenTimeLeft = useMemo(() => {
    if (!isGoalReached) return null
    const now = new Date().getTime()
    const end = new Date(product.endAt).getTime()
    const diff = end - now

    if (diff <= 0) return "마감"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }, [isGoalReached, product.endAt])

  // Show countdown only for open products that haven't reached goal
  const shouldShowLiveCountdown = product.status === "open" && !isGoalReached
  const shouldShowFrozenCountdown = isGoalReached

  return (
    <Link href={`/${branchSlug}/products/${product.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-all cursor-pointer h-full group">
        {/* Compact image - reduced aspect ratio */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={product.imageUrl || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
          {/* Status badge - hide when goal is reached */}
          {!isGoalReached && product.status !== "closed" && (
            <div className="absolute top-1.5 right-1.5">
              <StatusBadge status={product.status} />
            </div>
          )}

          {/* Goal reached badge - "마감" */}
          {isGoalReached && (
            <div className="absolute top-1.5 left-1.5">
              <div className="bg-gray-500 text-white px-2 py-0.5 rounded text-[10px] font-semibold">
                마감
              </div>
            </div>
          )}

          {/* Near goal badge - red "마감임박" when < 10 items to reach MOQ */}
          {!isGoalReached && isNearGoal && (
            <div className="absolute top-1.5 left-1.5">
              <div className="bg-[#EF4444] text-white px-2 py-0.5 rounded text-[10px] font-semibold">
                마감임박
              </div>
            </div>
          )}

          {/* Deadline soon indicator - only show if not near goal and not goal reached */}
          {!isGoalReached && !isNearGoal && isDeadlineSoon && product.status === "open" && (
            <div className="absolute top-1.5 left-1.5">
              <div className="text-white px-2 py-0.5 rounded text-[10px] font-semibold" style={{ backgroundColor: branchColor }}>
                마감임박
              </div>
            </div>
          )}

          {/* Closed badge - for manually closed products */}
          {!isGoalReached && product.status === "closed" && (
            <div className="absolute top-1.5 left-1.5">
              <div className="bg-gray-500 text-white px-2 py-0.5 rounded text-[10px] font-semibold">마감</div>
            </div>
          )}
        </div>

        {/* Compact content */}
        <CardContent className="p-3 space-y-2">
          {/* Product name - more compact */}
          <h3 className="font-semibold text-sm line-clamp-2 leading-tight min-h-[2.5rem]">{product.name}</h3>

          {/* Price - prominent and balanced */}
          <p className="text-xl font-bold">{product.price.toLocaleString()}원</p>

          {/* Stock display - only for near-goal products */}
          {isNearGoal && (
            <p className="text-xs font-semibold text-[#EF4444]">재고 {remainingToGoal}개 남음!</p>
          )}

          {/* MOQ Progress - compact */}
          <MoqProgress current={currentOrders} moq={product.moq} themeColor={branchColor} className="text-xs" />

          {/* Countdown - live for open products, frozen when goal reached */}
          {shouldShowLiveCountdown && (
            <div className="flex items-center text-xs text-muted-foreground pt-0.5">
              <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
              <span
                suppressHydrationWarning
                className={isExpired ? "text-destructive font-medium" : ""}
              >
                {timeLeft}
              </span>
            </div>
          )}

          {/* Frozen countdown when goal is reached */}
          {shouldShowFrozenCountdown && (
            <div className="flex items-center text-xs text-muted-foreground pt-0.5">
              <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
              <span suppressHydrationWarning>{frozenTimeLeft}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

// Day tab component
function DayTab({
  date,
  isActive,
  onClick,
  productCount,
  branchColor
}: {
  date: Date
  isActive: boolean
  onClick: () => void
  productCount: number
  branchColor: string
}) {
  const dayName = format(date, "EEE", { locale: ko }) // 월, 화, 수...
  const dayDate = format(date, "M/d")
  const isToday = isSameDay(date, new Date())

  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 flex flex-col items-center justify-center px-4 py-2.5 rounded-lg transition-all border-2 min-w-[70px] ${isActive
        ? "shadow-sm"
        : "border-transparent hover:border-border"
        }`}
      style={isActive ? {
        backgroundColor: `${branchColor}15`,
        borderColor: branchColor,
        color: branchColor
      } : {}}
    >
      <span
        suppressHydrationWarning
        className={`text-xs font-medium ${isActive ? "" : "text-muted-foreground"}`}
      >
        {isToday ? "오늘" : dayName}
      </span>
      <span className={`text-xs mt-0.5 ${isActive ? "font-semibold" : "text-muted-foreground"}`}>
        {dayDate}
      </span>
      {productCount > 0 && (
        <span
          className={`text-[10px] mt-1 px-1.5 py-0.5 rounded-full ${isActive ? "font-semibold" : "bg-muted text-muted-foreground"
            }`}
          style={isActive ? { backgroundColor: branchColor, color: "white" } : {}}
        >
          {productCount}개
        </span>
      )}
    </button>
  )
}

interface ProductsPageClientProps {
  branchSlug: string
  branch: Branch
  initialProducts: Product[]
}

export default function ProductsPageClient({ branchSlug, branch, initialProducts }: ProductsPageClientProps) {
  const { getBranchColor } = useBranchTheme()

  const branchId = branch?.id || ""
  const branchColor = getBranchColor(branchId)

  // Debug logging
  console.log('[ProductsClient] Initial products count:', initialProducts)

  // Filter products for this branch (safety check even though server filtered)
  const branchProducts = useMemo(() => {
    // The server already filtered by branch, but we double-check here
    const filtered = initialProducts.filter((product) => product.branchId === branchId)
    console.log('[ProductsClient] Filtered products count:', filtered.length)
    return filtered
  }, [initialProducts, branchId])

  // Group products by end date day
  const productsByDay = useMemo(() => {
    const grouped = new Map<string, Product[]>()

    console.log('[ProductsClient] Grouping products by day...')
    branchProducts.forEach((product) => {
      const endDate = startOfDay(new Date(product.endAt))
      const dateKey = endDate.toDateString()

      console.log(`[ProductsClient] Product "${product.name}" ends at:`, product.endAt, '→', dateKey)

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, [])
      }
      grouped.get(dateKey)!.push(product)
    })

    console.log('[ProductsClient] Products grouped:', Array.from(grouped.entries()).map(([key, prods]) => `${key}: ${prods.length} products`))
    return grouped
  }, [branchProducts])

  // Generate next 7 days
  const days = useMemo(() => {
    const generatedDays = Array.from({ length: 7 }, (_, i) => startOfDay(addDays(new Date(), i)))
    console.log('[ProductsClient] Generated days:', generatedDays.map(d => d.toDateString()))
    return generatedDays
  }, [])

  // Pre-calculate first day with products
  const firstDayWithProducts = useMemo(() => {
    console.log('[ProductsClient] Looking for first day with products...')
    for (const day of days) {
      const dateKey = day.toDateString()
      const count = (productsByDay.get(dateKey) ?? []).length
      console.log(`[ProductsClient] Day ${dateKey}: ${count} products`)
      if (count > 0) {
        console.log(`[ProductsClient] First day with products: ${dateKey}`)
        return day
      }
    }
    console.log('[ProductsClient] No products found in any day, defaulting to today')
    return days[0]
  }, [days, productsByDay])

  // Default selected day to first day containing products
  const [selectedDay, setSelectedDay] = useState<Date>(firstDayWithProducts)

  useEffect(() => {
    setSelectedDay(firstDayWithProducts)
  }, [firstDayWithProducts])

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>("전체")
  const categories = ["전체", "정육", "수산", "생필품", "그로서리"]

  // Status filter state
  const [selectedStatus, setSelectedStatus] = useState<string>("전체")
  const statuses = ["전체", "판매중", "마감임박"]

  // Infinite scroll state
  const ITEMS_PER_PAGE = 12
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Get all products for selected day (sorted and filtered by category and status)
  const allDayProducts = useMemo(() => {
    const dateKey = selectedDay.toDateString()
    let products = productsByDay.get(dateKey) || []

    // Filter by category if not "전체"
    if (selectedCategory !== "전체") {
      products = products.filter(p => p.category === selectedCategory)
    }

    // Filter by status if not "전체"
    if (selectedStatus !== "전체") {
      products = products.filter(p => {
        const currentOrders = p.currentOrders || 0
        const remainingToGoal = p.moq - currentOrders
        const isNearGoal = remainingToGoal <= 10 && currentOrders < p.moq && p.status === "open"
        const isGoalReached = currentOrders >= p.moq || p.status === "closed" || p.status === "soldout"

        // Check if deadline is within 24 hours
        const now = new Date().getTime()
        const end = new Date(p.endAt).getTime()
        const hoursLeft = (end - now) / (1000 * 60 * 60)
        const isDeadlineSoon = hoursLeft <= 24 && hoursLeft > 0

        // Determine if product is "마감임박"
        const isClosingSoon = isNearGoal || (isDeadlineSoon && p.status === "open" && !isGoalReached)

        if (selectedStatus === "판매중") {
          // Show only open products that haven't reached MOQ AND are NOT closing soon
          return p.status === "open" && !isGoalReached && !isClosingSoon
        } else if (selectedStatus === "마감임박") {
          // Show only products that are near goal or deadline soon
          return isClosingSoon
        }
        return true
      })
    }

    // Sort by priority: 마감임박 > 판매중 > 마감
    return products.sort((a, b) => {
      // Calculate for product a
      const aCurrentOrders = a.currentOrders || 0
      const aRemainingToGoal = a.moq - aCurrentOrders
      const aIsNearGoal = aRemainingToGoal <= 10 && aCurrentOrders < a.moq && a.status === "open"
      const aIsGoalReached = aCurrentOrders >= a.moq || a.status === "closed" || a.status === "soldout"

      // Calculate for product b
      const bCurrentOrders = b.currentOrders || 0
      const bRemainingToGoal = b.moq - bCurrentOrders
      const bIsNearGoal = bRemainingToGoal <= 10 && bCurrentOrders < b.moq && b.status === "open"
      const bIsGoalReached = bCurrentOrders >= b.moq || b.status === "closed" || b.status === "soldout"

      // Determine priority (0 = highest priority)
      const getPriority = (isNearGoal: boolean, isGoalReached: boolean, status: string) => {
        if (isNearGoal) return 0 // 마감임박
        if (status === "open" && !isGoalReached) return 1 // 판매중
        return 2 // 마감
      }

      const aPriority = getPriority(aIsNearGoal, aIsGoalReached, a.status)
      const bPriority = getPriority(bIsNearGoal, bIsGoalReached, b.status)

      // Sort by priority first
      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }

      // Within same priority, sort by current orders (descending)
      return bCurrentOrders - aCurrentOrders
    })
  }, [selectedDay, productsByDay, selectedCategory, selectedStatus])

  // Display products with infinite scroll pagination
  const displayedProducts = allDayProducts.slice(0, displayCount)
  const hasMore = displayCount < allDayProducts.length

  // Reset display count when selected day, category, or status changes
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE)
  }, [selectedDay, selectedCategory, selectedStatus])

  // Infinite scroll observer
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    // Simulate loading delay for better UX
    setTimeout(() => {
      setDisplayCount((prev) => prev + ITEMS_PER_PAGE)
      setIsLoading(false)
    }, 300)
  }, [isLoading, hasMore])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [loadMore])

  // Get product count for each day
  const getProductCountForDay = (date: Date) => {
    const dateKey = date.toDateString()
    return productsByDay.get(dateKey)?.length || 0
  }

  return (
    <>
      {/* Main content area */}
      <div className="py-4 px-4 space-y-5 max-w-7xl mx-auto w-full min-h-[calc(100vh-200px)]">
        {/* Day tabs - horizontal scroll on mobile */}
        <div className="relative">
          <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <div className="flex gap-2 min-w-max justify-center">
              {days.map((day) => (
                <DayTab
                  key={day.toISOString()}
                  date={day}
                  isActive={isSameDay(day, selectedDay)}
                  onClick={() => setSelectedDay(day)}
                  productCount={getProductCountForDay(day)}
                  branchColor={branchColor}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Selected day indicator */}
        <div className="text-center">
          <h2 className="text-lg font-semibold">
            {format(selectedDay, "M월 d일 (EEE)", { locale: ko })} 마감 상품
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            총 {allDayProducts.length}개의 상품
          </p>
        </div>

        {/* Status filter */}
        <div className="relative">
          <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <div className="flex gap-2 min-w-max justify-center">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg transition-all border-2 ${selectedStatus === status
                    ? "shadow-sm font-semibold"
                    : "border-transparent hover:border-border"
                    }`}
                  style={
                    selectedStatus === status
                      ? {
                        backgroundColor: `${branchColor}15`,
                        borderColor: branchColor,
                        color: branchColor,
                      }
                      : {}
                  }
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category filter */}
        <div className="relative">
          <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <div className="flex gap-2 min-w-max justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg transition-all border-2 ${selectedCategory === category
                    ? "shadow-sm font-semibold"
                    : "border-transparent hover:border-border"
                    }`}
                  style={
                    selectedCategory === category
                      ? {
                        backgroundColor: `${branchColor}15`,
                        borderColor: branchColor,
                        color: branchColor,
                      }
                      : {}
                  }
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product grid or empty state */}
        {allDayProducts.length === 0 ? (
          <div className="flex flex-col justify-center items-center min-h-[400px] py-8">
            <p className="text-muted-foreground text-base">이 날짜에는 마감되는 상품이 없습니다.</p>
            <p className="text-sm text-muted-foreground mt-2">다른 날짜를 선택해보세요.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 w-full max-w-6xl mx-auto">
              {displayedProducts.map((product) => (
                <CompactProductCard
                  key={product.id}
                  product={product}
                  branchSlug={branchSlug}
                  branchColor={branchColor}
                />
              ))}
            </div>

            {/* Sentinel for infinite scroll */}
            {hasMore && (
              <div ref={sentinelRef} className="flex justify-center py-8">
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">상품을 불러오는 중...</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer - Branch Information Section */}
      {branch && (
        <div className="border-t py-3">
          <div className="max-w-4xl mx-auto text-center space-y-1.5">
            <h3 className="text-base font-semibold" style={{ color: branchColor }}>
              {branch.name}
            </h3>
            {branch.address && (
              <p className="text-sm text-muted-foreground">
                {branch.address}
              </p>
            )}
            {branch.notificationPhone && (
              <p className="text-sm text-muted-foreground">
                문의: {branch.notificationPhone}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
