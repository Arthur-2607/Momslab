import { cookies } from "next/headers"
import type { AdminSession } from "../schemas/admin.schema"
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken, type AdminJWTPayload } from "@/lib/jwt"

/**
 * Session Manager
 * Handles JWT-based session management
 * Centralized session operations with JWT tokens
 */

const ACCESS_TOKEN_COOKIE_NAME = "admin_access_token"
const REFRESH_TOKEN_COOKIE_NAME = "admin_refresh_token"
const ACCESS_TOKEN_MAX_AGE = 60 * 15 // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export class SessionManager {
    /**
     * Set admin session with JWT tokens
     */
    static async setSession(session: AdminSession): Promise<void> {
        const cookieStore = await cookies()

        // Create JWT payload
        const jwtPayload: AdminJWTPayload = {
            adminId: session.adminId,
            username: session.username,
            name: session.name,
            role: session.role,
            branchId: session.branchId,
            type: 'admin'
        }

        // Generate JWT tokens
        const accessToken = signAccessToken(jwtPayload)
        const refreshToken = signRefreshToken(jwtPayload)

        // Store access token (short-lived)
        cookieStore.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: ACCESS_TOKEN_MAX_AGE,
            path: "/",
        })

        // Store refresh token (long-lived)
        cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: REFRESH_TOKEN_MAX_AGE,
            path: "/",
        })
    }

    /**
     * Get admin session from JWT token
     */
    static async getSession(): Promise<AdminSession | null> {
        const cookieStore = await cookies()
        const accessTokenCookie = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)

        if (!accessTokenCookie) {
            return null
        }

        try {
            // Verify and decode JWT token
            const payload = verifyAccessToken(accessTokenCookie.value)

            if (!payload || payload.type !== 'admin') {
                return null
            }

            const adminPayload = payload as AdminJWTPayload

            // Convert JWT payload to AdminSession
            return {
                adminId: adminPayload.adminId,
                username: adminPayload.username,
                name: adminPayload.name,
                role: adminPayload.role,
                branchId: adminPayload.branchId
            }
        } catch {
            return null
        }
    }

    /**
     * Clear admin session (delete JWT tokens)
     */
    static async clearSession(): Promise<void> {
        const cookieStore = await cookies()
        cookieStore.delete(ACCESS_TOKEN_COOKIE_NAME)
        cookieStore.delete(REFRESH_TOKEN_COOKIE_NAME)
    }

    /**
     * Check if session exists
     */
    static async hasSession(): Promise<boolean> {
        const session = await this.getSession()
        return session !== null
    }

    /**
     * Refresh session using refresh token
     */
    static async refreshSession(): Promise<AdminSession | null> {
        const cookieStore = await cookies()
        const refreshTokenCookie = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)

        if (!refreshTokenCookie) {
            return null
        }

        try {
            // Verify refresh token
            const decoded = verifyRefreshToken(refreshTokenCookie.value)

            if (!decoded || decoded.type !== 'admin') {
                return null
            }

            // Get current session data
            const session = await this.getSession()

            if (!session) {
                return null
            }

            // Re-set session to generate new access token
            await this.setSession(session)

            return session
        } catch {
            return null
        }
    }
}

