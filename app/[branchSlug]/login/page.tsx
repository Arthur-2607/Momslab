"use client"

import { useEffect, useState, Suspense } from "react"
import { useParams, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn, signInWithKakao } from "@/app/actions/auth"
import { UserPlus } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

function BranchLoginPageContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isKakaoLoading, setIsKakaoLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { toast } = useToast()

  const branchSlug = params.branchSlug as string

  const [branchName, setBranchName] = useState("지점")

  useEffect(() => {
    let isMounted = true

    async function fetchBranch() {
      try {
        const { getBranchBySlug } = await import("@/lib/server")
        const result = await getBranchBySlug(branchSlug)
        if (result.success && result.branch && isMounted) {
          setBranchName(result.branch.name)
        }
      } catch (error) {
        console.error("Failed to load branch info", error)
      }
    }

    fetchBranch()

    return () => {
      isMounted = false
    }
  }, [branchSlug])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)
      formData.append("branchSlug", branchSlug)

      const result = await signIn(formData)

      if (result?.error) {
        console.error('[Login UI] Server returned error:', result.error)
        toast({
          variant: "destructive",
          description: result.error,
        })
      }
    } catch (error) {
      // Re-throw Next.js redirect errors - these are expected
      if (error && typeof error === 'object' && 'digest' in error) {
        const digest = (error as any).digest
        if (typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT')) {
          throw error // Let redirect happen
        }
      }

      console.error('[Login UI] Caught exception:', error)
      toast({
        variant: "destructive",
        description: `로그인에 실패했습니다 (Login failed): ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKakaoLogin = async () => {
    setIsKakaoLoading(true)
    try {
      const redirectUrl = searchParams.get("redirect") || `/${branchSlug}/products`
      const result = await signInWithKakao(branchSlug, redirectUrl)

      if (result?.error) {
        toast({
          variant: "destructive",
          description: result.error,
        })
        setIsKakaoLoading(false)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "카카오 로그인에 실패했습니다. 다시 시도해주세요.",
      })
      setIsKakaoLoading(false)
    }
  }

  const handleSignupClick = () => {
    window.location.href = `/${branchSlug}/signup${searchParams.get("redirect") ? `?redirect=${encodeURIComponent(searchParams.get("redirect")!)}` : ""}`
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold">{branchName}</CardTitle>
          <CardDescription className="text-base">공동구매 플랫폼에 오신 것을 환영합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleKakaoLogin}
            disabled={isKakaoLoading || isLoading}
            className="w-full h-12 bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] font-semibold text-base"
            size="lg"
          >
            {isKakaoLoading ? "로그인 중..." : "카카오로 시작하기"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                또는
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || isKakaoLoading}
              className="w-full h-12"
              variant="outline"
              size="lg"
            >
              {isLoading ? "로그인 중..." : "이메일로 로그인"}
            </Button>
          </form>

          <Button
            onClick={handleSignupClick}
            disabled={isLoading || isKakaoLoading}
            variant="outline"
            className="w-full h-12 border-2"
            size="lg"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            회원가입
          </Button>

          <div className="text-center text-xs text-muted-foreground space-x-4">
            <a href="#" className="hover:underline">
              이용약관
            </a>
            <span>|</span>
            <a href="#" className="hover:underline">
              개인정보처리방침
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BranchLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <BranchLoginPageContent />
    </Suspense>
  )
}
