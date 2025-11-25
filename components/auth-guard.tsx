"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getAdminToken } from "@/lib/admin-auth"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    const adminToken = getAdminToken()

    if (requireAuth && !user && !adminToken) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
    } else {
      setIsChecking(false)
    }
  }, [requireAuth, router, pathname])

  if (isChecking && requireAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">로딩중...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
