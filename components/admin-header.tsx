"use client"

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { LogOut, User } from 'lucide-react'
import { signOutAdmin } from "@/app/actions/admin-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"

interface AdminSession {
  adminId: string
  username: string
  name: string
  role: "super_admin" | "branch_owner"
  branchId?: string
}

export function AdminHeader() {
  const router = useRouter()
  const { toast } = useToast()
  const [admin, setAdmin] = useState<AdminSession | null>(null)

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift()
        if (cookieValue) {
          try {
            return JSON.parse(decodeURIComponent(cookieValue))
          } catch {
            return null
          }
        }
      }
      return null
    }

    const session = getCookie("admin_session")
    if (session) {
      setAdmin(session)
    }
  }, [])

  const handleLogout = async () => {
    await signOutAdmin()
    toast({
      title: "로그아웃 완료",
      description: "관리자 계정에서 로그아웃되었습니다.",
    })
  }

  const getRoleLabel = (role: string) => {
    return role === "super_admin" ? "슈퍼 관리자" : "지점 점주"
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-xl font-bold">관리자 페이지</h1>
        </div>

        {admin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">관리자 메뉴</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{admin.name}</p>
                  <p className="text-xs text-muted-foreground">{getRoleLabel(admin.role)}</p>
                  {admin.branchId && (
                    <p className="text-xs text-muted-foreground">
                      {admin.branchId}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
