import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Clock, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-balance">따뜻한자리 그로서리 범어점</h1>
          <p className="text-lg text-muted-foreground text-pretty">공동구매로 더 저렴하게, 함께 구매하는 즐거움</p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
            <div className="flex flex-col items-center gap-2 p-4">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <h3 className="font-semibold">공동구매</h3>
              <p className="text-sm text-muted-foreground text-center">최소 수량 달성 시 할인가로 구매</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4">
              <Clock className="h-8 w-8 text-primary" />
              <h3 className="font-semibold">실시간 현황</h3>
              <p className="text-sm text-muted-foreground text-center">남은 시간과 참여 현황 실시간 확인</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4">
              <Users className="h-8 w-8 text-primary" />
              <h3 className="font-semibold">지점 픽업</h3>
              <p className="text-sm text-muted-foreground text-center">편리한 지점 방문 수령</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/login">로그인</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8">
              <Link href="/beomeo/products">상품 둘러보기</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer with Admin Link */}
      <footer className="border-t py-6 px-4">
        <div className="max-w-7xl mx-auto flex justify-center">
          <Link href="/admin/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            관리자 로그인
          </Link>
        </div>
      </footer>
    </div>
  )
}
