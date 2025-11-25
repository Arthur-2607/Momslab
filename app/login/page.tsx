"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn, signInWithKakao } from "@/app/actions/auth"
import { MessageSquare, UserPlus } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isKakaoLoading, setIsKakaoLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { toast } = useToast()

  const branchSlug = searchParams.get("branch") || "beomeo"
  const redirect = searchParams.get("redirect") || `/${branchSlug}/products`

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
      // If successful, user will be redirected
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
      const result = await signInWithKakao(branchSlug, redirect)

      if (result?.error) {
        toast({
          variant: "destructive",
          description: result.error,
        })
        setIsKakaoLoading(false)
      }
      // If successful, user will be redirected by Kakao OAuth flow
    } catch (error) {
      toast({
        variant: "destructive",
        description: "카카오 로그인에 실패했습니다. 다시 시도해주세요.",
      })
      setIsKakaoLoading(false)
    }
  }

  const handleSignupClick = () => {
    router.push(`/signup${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold">로그인</CardTitle>
          <CardDescription className="text-base">공동구매 플랫폼에 오신 것을 환영합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Kakao Login */}
          <Button
            onClick={handleKakaoLogin}
            disabled={isKakaoLoading || isLoading}
            className="w-full h-12 bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] font-semibold text-base"
            size="lg"
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            {isKakaoLoading ? "로그인 중..." : "카카오로 시작하기"}
          </Button>

          {/* Divider */}
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

          {/* Email/Password Login */}
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

          {/* Signup Button */}
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

          {/* Footer Links */}
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
