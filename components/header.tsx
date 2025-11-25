"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User, LogOut, Shield } from "lucide-react"
import { getCurrentUser, logoutUser } from "@/lib/auth"
import { getAdminToken, logoutAdmin } from "@/lib/admin-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  branchName: string
  branchSlug: string
  branchAddress?: string
}

export function Header({ branchName, branchSlug, branchAddress }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null)
  const [adminToken, setAdminToken] = useState<ReturnType<typeof getAdminToken>>(null)

  useEffect(() => {
    setUser(getCurrentUser())
    setAdminToken(getAdminToken())
  }, [pathname])

  const handleLogout = () => {
    logoutUser()
    logoutAdmin() // Also clear admin token to prevent conflicts
    setUser(null)
    setAdminToken(null)
    router.push(`/${branchSlug}/products`)
  }

  const handleAdminLogout = () => {
    logoutAdmin()
    logoutUser() // Also clear customer token to prevent conflicts
    setAdminToken(null)
    setUser(null)
    router.push(`/${branchSlug}/products`)
  }

  const handleLogin = () => {
    router.push(`/${branchSlug}/login?redirect=${encodeURIComponent(pathname)}`)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href={`/${branchSlug}/products`} className="flex items-center gap-3">
          <div className="relative h-10 w-10 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-base sm:text-lg font-bold leading-tight">{branchName}</h1>
            {branchAddress && (
              <p className="text-xs text-muted-foreground hidden sm:block">{branchAddress}</p>
            )}
          </div>
        </Link>

        {adminToken ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Shield className="h-5 w-5" />
                <span className="sr-only">관리자 메뉴</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <p className="text-sm font-medium">{adminToken.username}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {adminToken.role === "super_admin" ? "슈퍼 관리자" : "지점 관리자"}
                  </p>
                  {adminToken.branchId && <p className="text-xs text-muted-foreground">{adminToken.branchId}</p>}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard" className="cursor-pointer">
                  <Shield className="mr-2 h-4 w-4" />
                  관리자 대시보드
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleAdminLogout} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">사용자 메뉴</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.phone}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${branchSlug}/mypage`} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  마이페이지
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLogin}>
            <User className="h-5 w-5" />
            <span className="sr-only">로그인</span>
          </Button>
        )}
      </div>
    </header>
  )
}
