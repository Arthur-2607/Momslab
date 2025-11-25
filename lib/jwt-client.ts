"use client"

// Client-side JWT utilities

export interface JWTRefreshResponse {
  success: boolean
  accessToken?: string
  error?: string
  admin?: {
    id: string
    username: string
    name: string
    role: string
    branchId?: string
  }
}

// Refresh admin token
export async function refreshAdminTokenClient(): Promise<JWTRefreshResponse> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'admin' }),
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.error || 'Failed to refresh token'
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error refreshing admin token:', error)
    return {
      success: false,
      error: 'Network error'
    }
  }
}

// Refresh customer token
export async function refreshCustomerTokenClient(): Promise<JWTRefreshResponse> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'customer' }),
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.error || 'Failed to refresh token'
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error refreshing customer token:', error)
    return {
      success: false,
      error: 'Network error'
    }
  }
}

// Setup automatic token refresh for admin
export function setupAdminTokenRefresh(intervalMinutes: number = 14) {
  // Refresh token slightly before it expires (default: every 14 minutes for 15-minute tokens)
  const intervalMs = intervalMinutes * 60 * 1000
  
  const intervalId = setInterval(async () => {
    console.log('Auto-refreshing admin token...')
    const result = await refreshAdminTokenClient()
    
    if (!result.success) {
      console.error('Failed to auto-refresh admin token:', result.error)
      // Token refresh failed - user may need to log in again
      clearInterval(intervalId)
    } else {
      console.log('Admin token refreshed successfully')
    }
  }, intervalMs)

  return intervalId
}

// Setup automatic token refresh for customer
export function setupCustomerTokenRefresh(intervalMinutes: number = 14) {
  // Refresh token slightly before it expires (default: every 14 minutes for 15-minute tokens)
  const intervalMs = intervalMinutes * 60 * 1000
  
  const intervalId = setInterval(async () => {
    console.log('Auto-refreshing customer token...')
    const result = await refreshCustomerTokenClient()
    
    if (!result.success) {
      console.error('Failed to auto-refresh customer token:', result.error)
      // Token refresh failed - user may need to log in again
      clearInterval(intervalId)
    } else {
      console.log('Customer token refreshed successfully')
    }
  }, intervalMs)

  return intervalId
}

// Decode JWT payload without verification (client-side only, for reading claims)
export function decodeJWTPayload(token: string): any | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

// Check if token is expired (client-side check)
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWTPayload(token)
  if (!payload || !payload.exp) return true
  
  const expirationTime = payload.exp * 1000 // Convert to milliseconds
  return Date.now() >= expirationTime
}

// Get token expiration time
export function getTokenExpiration(token: string): Date | null {
  const payload = decodeJWTPayload(token)
  if (!payload || !payload.exp) return null
  
  return new Date(payload.exp * 1000)
}

