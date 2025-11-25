"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { AuthGuard } from "@/components/auth-guard"
import { getCurrentUser } from "@/lib/auth"
import type { Branch, Product } from "@/lib/server"
import { getProduct, createOrder } from "@/lib/server"
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react"
import { notFound } from "next/navigation"
import { useBranchTheme } from "@/lib/branch-theme-context"
import { useToast } from "@/hooks/use-toast"

interface CheckoutClientProps {
  branchSlug: string
  branch: Branch
}

export function CheckoutClient({ branchSlug, branch }: CheckoutClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [paymentMethod, setPaymentMethod] = useState<"card" | "kakao_pay" | "naver_pay">("card")
  const [agreed, setAgreed] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { getBranchColor } = useBranchTheme()

  const productId = searchParams.get("productId")
  const quantity = Number.parseInt(searchParams.get("quantity") || "1")
  const user = getCurrentUser()

  const branchId = branch.id
  const branchColor = getBranchColor(branchId)

  // Fetch product data on mount
  useEffect(() => {
    async function loadProduct() {
      if (!productId) {
        notFound()
        return
      }

      const result = await getProduct(productId)
      if (!result.success || !result.product) {
        notFound()
        return
      }

      // Verify product belongs to this branch
      if (result.product.branchId !== branch.id) {
        notFound()
        return
      }

      setProduct(result.product)
      setIsLoading(false)
    }

    loadProduct()
  }, [productId, branch.id])

  if (!productId || !quantity) {
    notFound()
  }

  if (isLoading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const totalAmount = product.price * quantity

  const handlePayment = async () => {
    if (!agreed || !user || !productId) return

    setIsProcessing(true)

    try {
      // Create order in database
      const result = await createOrder({
        customerId: user.id,
        branchId: branch.id,
        productId: productId,
        quantity: quantity,
        unitPrice: product!.price,
      })

      if (!result.success || !result.order) {
        toast({
          title: "주문 실패",
          description: result.error || "주문 생성 중 오류가 발생했습니다.",
          variant: "destructive",
        })
        setIsProcessing(false)
        return
      }

      console.log("[Checkout] Order created:", result.order)

      // Redirect to complete page
      router.push(`/${branchSlug}/complete?orderNumber=${result.order.orderNumber}&amount=${result.order.totalAmount}`)
    } catch (error) {
      console.error("[Checkout] Error:", error)
      toast({
        title: "주문 실패",
        description: "주문 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* 헤더 */}
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b">
          <div className="container px-4 py-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              주문하기
            </Button>
          </div>
        </div>

        <div className="container px-4 py-6 max-w-2xl mx-auto space-y-6">
          {/* 주문 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>주문 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="relative w-24 h-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-muted-foreground mt-1">
                    {product.price.toLocaleString()}원 x {quantity}개
                  </p>
                  <p className="font-bold text-lg mt-2">{totalAmount.toLocaleString()}원</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 주문자 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>주문자 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-muted-foreground">이름</Label>
                <p className="font-medium mt-1">{user?.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">연락처</Label>
                <p className="font-medium mt-1">{user?.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* 결제 수단 */}
          <Card>
            <CardHeader>
              <CardTitle>결제 수단</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                <div className="flex items-center space-x-2 p-3 rounded-md hover:bg-muted cursor-pointer">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      카드 결제
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-md hover:bg-muted cursor-pointer">
                  <RadioGroupItem value="kakao_pay" id="kakao_pay" />
                  <Label htmlFor="kakao_pay" className="flex-1 cursor-pointer">
                    카카오페이
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-md hover:bg-muted cursor-pointer">
                  <RadioGroupItem value="naver_pay" id="naver_pay" />
                  <Label htmlFor="naver_pay" className="flex-1 cursor-pointer">
                    네이버페이
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* 결제 금액 */}
          <Card>
            <CardHeader>
              <CardTitle>결제 금액</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-muted-foreground">
                <span>상품 금액</span>
                <span>{totalAmount.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>배송비</span>
                <span>0원</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>총 결제 금액</span>
                <span className="text-primary">{totalAmount.toLocaleString()}원</span>
              </div>
            </CardContent>
          </Card>

          {/* 약관 동의 */}
          <div className="flex items-start space-x-2 p-4 border rounded-md">
            <Checkbox id="agree" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} />
            <Label htmlFor="agree" className="text-sm leading-relaxed cursor-pointer">
              주문 내용을 확인하였으며 결제에 동의합니다
            </Label>
          </div>

          {/* 결제 버튼 */}
          <Button
            onClick={handlePayment}
            disabled={!agreed || isProcessing}
            className="w-full h-14 text-lg font-semibold text-white"
            style={{ backgroundColor: branchColor }}
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                결제 처리 중...
              </>
            ) : (
              `${totalAmount.toLocaleString()}원 결제하기`
            )}
          </Button>
        </div>
      </div>
    </AuthGuard>
  )
}
