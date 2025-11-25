"use client"

import { useState, useEffect, Suspense } from "react"
import { useParams, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Store } from 'lucide-react'
import { signUp, signInWithKakao } from "@/app/actions/auth"
import { getBranchBySlug } from "@/lib/server"
import type { Branch } from "@/lib/server"
import { useToast } from "@/hooks/use-toast"

function SignupPageContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const branchSlug = params.branchSlug as string
  const [branch, setBranch] = useState<Branch | null>(null)
  const { toast } = useToast()

  // Fetch branch data
  useEffect(() => {
    async function loadBranch() {
      const result = await getBranchBySlug(branchSlug)
      if (result.success && result.branch) {
        setBranch(result.branch)
      }
    }
    loadBranch()
  }, [branchSlug])

  const [isLoading, setIsLoading] = useState(false)
  const [isKakaoLoading, setIsKakaoLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        variant: "destructive",
        description: "이름을 입력해주세요.",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        description: "비밀번호가 일치하지 않습니다.",
      })
      return
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        description: "비밀번호는 최소 6자 이상이어야 합니다.",
      })
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)
      formData.append("phone", phone)
      formData.append("password", password)
      formData.append("branchSlug", branchSlug)

      const result = await signUp(formData)

      if (result?.error) {
        toast({
          variant: "destructive",
          description: result.error,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "회원가입에 실패했습니다. 다시 시도해주세요.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKakaoSignup = async () => {
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
        description: "카카오 가입에 실패했습니다. 다시 시도해주세요.",
      })
      setIsKakaoLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        {/* Service Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
            <Store className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">{branch?.name || "서비스 명"}</h1>
            <p className="text-sm text-muted-foreground">공동구매 플랫폼</p>
          </div>
        </div>

        <Button
          onClick={handleKakaoSignup}
          disabled={isKakaoLoading || isLoading}
          className="w-full h-12 bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] font-semibold text-base"
          size="lg"
        >
          {isKakaoLoading ? "가입 중..." : "카카오로 시작하기"}
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
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              type="text"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
            <Label htmlFor="phone">전화번호 (선택)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="010-1234-5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="최소 6자"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="비밀번호 재입력"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || isKakaoLoading}
            className="w-full"
            variant="outline"
            size="lg"
          >
            {isLoading ? "가입 중..." : "이메일로 가입하기"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          가입하면{" "}
          <a href="#" className="hover:underline">
            이용약관
          </a>{" "}
          및{" "}
          <a href="#" className="hover:underline">
            개인정보처리방침
          </a>
          에 동의하는 것으로 간주됩니다.
        </p>
      </Card>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <SignupPageContent />
    </Suspense>
  )
}
