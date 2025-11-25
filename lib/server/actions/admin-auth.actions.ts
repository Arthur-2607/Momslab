"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { SignInAdminSchema, type AdminAuthResult, type SignInAdminDto } from "../schemas/admin.schema"
import { AuthService, SessionManager } from "../internal"

/**
 * Server Actions for Admin Authentication
 * Thin layer - validates input and delegates to service layer
 * 
 * Following Next.js Full-Stack Architecture:
 * - Zod validation at entry point
 * - Business logic in service layer
 * - Data access in repository layer
 * - Minimal code in actions
 */

/**
 * Sign in admin user
 * 
 * @param credentials - Username and password
 * @returns AuthResult on failure, redirects on success
 */
export async function signInAdmin(credentials: SignInAdminDto): Promise<AdminAuthResult> {
    try {
        // 1. Validate input with Zod
        const validatedData = SignInAdminSchema.parse(credentials)

        // 2. Authenticate via service layer
        const session = await AuthService.authenticateAdmin(validatedData)

        // 3. Store session
        await SessionManager.setSession(session)

        // 4. Determine redirect URL
        const redirectUrl = AuthService.getRedirectUrl(session.role)

        // 5. Revalidate and redirect
        revalidatePath(redirectUrl, "layout")
        redirect(redirectUrl)
    } catch (error) {
        // IMPORTANT: Rethrow redirect errors so Next.js can handle them
        if (error && typeof error === 'object' && 'digest' in error) {
            const digest = (error as any).digest
            if (typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT')) {
                throw error  // ← Let Next.js handle the redirect
            }
        }

        // Handle validation errors and auth errors
        if (error instanceof Error) {
            return {
                success: false,
                error: error.message,
            }
        }

        return {
            success: false,
            error: "로그인 중 오류가 발생했습니다.",
        }
    }
}

/**
 * Sign out admin user
 */
export async function signOutAdmin(): Promise<void> {
    await SessionManager.clearSession()
    redirect("/admin/login")
}

/**
 * Get current admin session
 */
export async function getAdminSession() {
    return await SessionManager.getSession()
}

/**
 * Check if admin is authenticated
 */
export async function isAdminAuthenticated(): Promise<boolean> {
    return await SessionManager.hasSession()
}

/**
 * Refresh admin session
 */
export async function refreshAdminSession(): Promise<void> {
    await SessionManager.refreshSession()
}

