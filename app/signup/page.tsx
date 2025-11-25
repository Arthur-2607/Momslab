"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUp, signInWithKakao } from "@/app/actions/auth"
import { MessageSquare, ArrowLeft } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export default function SignupPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const [isKakaoLoading, setIsKakaoLoading] = useState(false)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const { toast } = useToast()

    const branchSlug = searchParams.get("branch") || "beomeo"
    const redirect = searchParams.get("redirect") || `/${branchSlug}/products`

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
            // If successful, user will be redirected
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
                description: "카카오 회원가입에 실패했습니다. 다시 시도해주세요.",
            })
            setIsKakaoLoading(false)
        }
    }

    const handleLoginClick = () => {
        router.push(`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`)
    }

    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">Loading...</div>
            </div>
        }>  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center space-y-2">
                        <CardTitle className="text-3xl font-bold">회원가입</CardTitle>
                        <CardDescription className="text-base">공동구매 플랫폼에 가입하세요</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Kakao Signup */}
                        <Button
                            onClick={handleKakaoSignup}
                            disabled={isKakaoLoading || isLoading}
                            className="w-full h-12 bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] font-semibold text-base"
                            size="lg"
                        >
                            <MessageSquare className="mr-2 h-5 w-5" />
                            {isKakaoLoading ? "가입 중..." : "카카오로 간편가입"}
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

                        {/* Email/Password Signup */}
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
                                className="w-full h-12"
                                variant="outline"
                                size="lg"
                            >
                                {isLoading ? "가입 중..." : "이메일로 가입하기"}
                            </Button>
                        </form>

                        {/* Login Button */}
                        <Button
                            onClick={handleLoginClick}
                            disabled={isLoading || isKakaoLoading}
                            variant="ghost"
                            className="w-full"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            이미 계정이 있으신가요? 로그인
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
            </div></Suspense>

    )
}


