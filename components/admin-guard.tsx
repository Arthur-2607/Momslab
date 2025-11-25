"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useJWTRefresh } from '@/hooks/use-jwt-refresh'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Setup automatic JWT token refresh (every 14 minutes for 15-minute tokens)
  useJWTRefresh('admin', isAuthenticated, 14)

  useEffect(() => {
    if (pathname === "/admin/login") {
      setIsChecking(false)
      return
    }

    // Check if admin JWT tokens exist (client-side check)
    const hasAccessToken = document.cookie.includes("admin_access_token")
    const hasRefreshToken = document.cookie.includes("admin_refresh_token")
    
    if (!hasAccessToken && !hasRefreshToken) {
      router.push("/admin/login")
    } else {
      setIsAuthenticated(true)
      setIsChecking(false)
    }
  }, [router, pathname])

  if (isChecking && pathname !== "/admin/login") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return <>{children}</>
}
