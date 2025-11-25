"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signInAdmin } from "@/lib/server"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from 'lucide-react'

export default function AdminLoginPage() {
  const { toast } = useToast()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Server action will handle redirect on success
    const result = await signInAdmin({ username, password })

    // If we reach here, login failed (redirect() throws on success)
    if (result && !result.success) {
      toast({
        title: "로그인 실패",
        description: result.error || "아이디 또는 비밀번호가 올바르지 않습니다.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
    // Success case: Server Action redirects automatically - no client-side navigation needed
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">관리자 로그인</CardTitle>
          <CardDescription className="text-center">관리자 계정으로 로그인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">아이디</Label>
              <Input
                id="username"
                type="text"
                placeholder="아이디를 입력하세요"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  로그인 중...
                </>
              ) : (
                "로그인"
              )}
            </Button>
          </form>
          <div className="mt-6 space-y-2 text-sm text-gray-600">
            <p className="font-semibold">테스트 계정:</p>
            <p>슈퍼 관리자: superadmin / admin123</p>
            <p>강남지점: gangnam_owner / owner123</p>
            <p>홍대지점: hongdae_owner / owner123</p>
            <p>잠실지점: jamsil_owner / owner123</p>
            <p>범어지점: beomeo_owner / owner123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
