/**
 * Edge Runtime Compatible JWT Utilities
 * Uses jose library which works with Web Crypto API
 * Safe to use in Next.js middleware and Edge Runtime
 */

import { SignJWT, jwtVerify } from 'jose'

// JWT configuration
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-secret-key-change-in-production'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production'

// Convert secret string to Uint8Array for jose
const getSecretKey = (secret: string) => new TextEncoder().encode(secret)

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

/**
 * Verify access token (Edge Runtime compatible)
 * Use this in middleware and Edge Runtime contexts
 */
export async function verifyAccessTokenEdge(token: string): Promise<JWTPayload | null> {
    try {
        const secret = getSecretKey(JWT_ACCESS_SECRET)
        const { payload } = await jwtVerify(token, secret, {
            issuer: 'momslab',
            audience: 'momslab-app'
        })

        return payload as unknown as JWTPayload
    } catch (error) {
        if (error instanceof Error) {
            console.error('JWT verification error:', error.message)
        }
        return null
    }
}

/**
 * Verify refresh token (Edge Runtime compatible)
 */
export async function verifyRefreshTokenEdge(token: string): Promise<{ id: string; type: string } | null> {
    try {
        const secret = getSecretKey(JWT_REFRESH_SECRET)
        const { payload } = await jwtVerify(token, secret, {
            issuer: 'momslab',
            audience: 'momslab-app'
        })

        return payload as unknown as { id: string; type: string }
    } catch (error) {
        if (error instanceof Error) {
            console.error('Refresh token verification error:', error.message)
        }
        return null
    }
}

/**
 * Sign access token (Edge Runtime compatible)
 */
export async function signAccessTokenEdge(payload: JWTPayload): Promise<string> {
    const secret = getSecretKey(JWT_ACCESS_SECRET)
    const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m'

    const jwt = new SignJWT(payload as unknown as Record<string, unknown>)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setIssuer('momslab')
        .setAudience('momslab-app')
        .setExpirationTime(expiresIn)

    return await jwt.sign(secret)
}

/**
 * Sign refresh token (Edge Runtime compatible)
 */
export async function signRefreshTokenEdge(payload: JWTPayload): Promise<string> {
    const secret = getSecretKey(JWT_REFRESH_SECRET)
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

    const simplePayload = {
        id: 'adminId' in payload ? payload.adminId : payload.customerId,
        type: payload.type
    }

    const jwt = new SignJWT(simplePayload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setIssuer('momslab')
        .setAudience('momslab-app')
        .setExpirationTime(expiresIn)

    return await jwt.sign(secret)
}

/**
 * Decode token without verification (Edge Runtime compatible)
 */
export function decodeTokenEdge(token: string): JWTPayload | null {
    try {
        const parts = token.split('.')
        if (parts.length !== 3) return null

        const payload = parts[1]
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        return JSON.parse(decoded) as JWTPayload
    } catch (error) {
        console.error('JWT decode error:', error)
        return null
    }
}

