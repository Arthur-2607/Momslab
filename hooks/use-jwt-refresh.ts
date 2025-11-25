"use client"

import { useEffect, useRef } from 'react'
import { setupAdminTokenRefresh, setupCustomerTokenRefresh } from '@/lib/jwt-client'

/**
 * Hook to automatically refresh JWT tokens
 * @param type - 'admin' or 'customer'
 * @param enabled - Whether auto-refresh is enabled (default: true)
 * @param intervalMinutes - Refresh interval in minutes (default: 14)
 */
export function useJWTRefresh(
  type: 'admin' | 'customer',
  enabled: boolean = true,
  intervalMinutes: number = 14
) {
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!enabled) return

    // Setup auto-refresh
    if (type === 'admin') {
      intervalIdRef.current = setupAdminTokenRefresh(intervalMinutes)
    } else {
      intervalIdRef.current = setupCustomerTokenRefresh(intervalMinutes)
    }

    // Cleanup on unmount
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
      }
    }
  }, [type, enabled, intervalMinutes])
}

