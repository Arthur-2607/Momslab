import bcrypt from "bcryptjs"
import { adminRepository } from "../repositories/admin.repository"
import type { AdminSession, SignInAdminDto } from "../schemas/admin.schema"

/**
 * Authentication Service
 * Contains all business logic for admin authentication
 * Independent of transport layer (Server Actions, API Routes, etc.)
 */

export class AuthService {
    /**
     * Authenticate admin user
     * @throws Error with user-friendly message on failure
     */
    static async authenticateAdmin(credentials: SignInAdminDto): Promise<AdminSession> {
        const { username, password } = credentials

        // Find admin by username
        const admin = await adminRepository.findByUsername(username)

        if (!admin) {
            throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.")
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, (admin as any).passwordHash)

        if (!passwordMatch) {
            throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.")
        }

        // Return session data (no sensitive info)
        return {
            adminId: admin.id,
            username: admin.username,
            name: admin.name,
            role: admin.role,
            branchId: admin.branchId || undefined,
        }
    }

    /**
     * Get admin by session data
     */
    static async getAdminById(adminId: string) {
        return await adminRepository.findById(adminId)
    }

    /**
     * Validate session data structure
     */
    static isValidSession(session: any): session is AdminSession {
        return (
            session &&
            typeof session.adminId === "string" &&
            typeof session.username === "string" &&
            typeof session.name === "string" &&
            (session.role === "super_admin" || session.role === "branch_owner")
        )
    }

    /**
     * Determine redirect URL based on role
     */
    static getRedirectUrl(role: "super_admin" | "branch_owner"): string {
        return role === "super_admin" ? "/admin/dashboard" : "/admin/pickup"
    }

    /**
     * Check if user has permission for route
     */
    static hasPermission(session: AdminSession, requiredRole?: "super_admin"): boolean {
        if (!requiredRole) return true
        return session.role === requiredRole
    }
}

