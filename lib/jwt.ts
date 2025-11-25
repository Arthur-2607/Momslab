import jwt from 'jsonwebtoken'

// JWT configuration
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-secret-key-change-in-production'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production'
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m' // 15 minutes
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d' // 7 days

// Admin JWT payload interface
export interface AdminJWTPayload {
  adminId: string
  username: string
  name: string
  role: 'super_admin' | 'branch_owner'
  branchId?: string
  type: 'admin'
}

// Customer JWT payload interface
export interface CustomerJWTPayload {
  customerId: string
  email: string
  name?: string
  type: 'customer'
}

// Generic JWT payload
export type JWTPayload = AdminJWTPayload | CustomerJWTPayload

// Sign access token
export function signAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
    issuer: 'momslab',
    audience: 'momslab-app'
  })
}

// Sign refresh token
export function signRefreshToken(payload: JWTPayload): string {
  return jwt.sign(
    { 
      id: 'adminId' in payload ? payload.adminId : payload.customerId,
      type: payload.type 
    }, 
    JWT_REFRESH_SECRET, 
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'momslab',
      audience: 'momslab-app'
    }
  )
}

// Verify access token
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET, {
      issuer: 'momslab',
      audience: 'momslab-app'
    }) as JWTPayload
    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('JWT token expired:', error.message)
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error('JWT token invalid:', error.message)
    } else {
      console.error('JWT verification error:', error)
    }
    return null
  }
}

// Verify refresh token
export function verifyRefreshToken(token: string): { id: string; type: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'momslab',
      audience: 'momslab-app'
    }) as { id: string; type: string }
    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('Refresh token expired:', error.message)
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error('Refresh token invalid:', error.message)
    } else {
      console.error('Refresh token verification error:', error)
    }
    return null
  }
}

// Decode token without verification (useful for reading expired tokens)
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload
  } catch (error) {
    console.error('JWT decode error:', error)
    return null
  }
}

// Get token expiration time
export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as { exp?: number }
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000)
    }
    return null
  } catch (error) {
    console.error('Error getting token expiration:', error)
    return null
  }
}

// Check if token is expired
export function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token)
  if (!expiration) return true
  return expiration < new Date()
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null
  
  const parts = authHeader.split(' ')
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1]
  }
  
  return null
}

