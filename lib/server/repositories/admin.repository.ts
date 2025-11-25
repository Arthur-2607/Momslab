import { createAdminClient } from "@/lib/supabase/admin"
import type { Admin } from "../schemas/admin.schema"

/**
 * Admin Repository
 * Handles all database operations for admins
 * Abstracts Supabase implementation details
 */

export const adminRepository = {
    /**
     * Find admin by username
     */
    async findByUsername(username: string): Promise<Admin | null> {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from("admins")
            .select("id, username, password_hash, name, role, branch_id, created_at, updated_at")
            .eq("username", username)
            .single()

        if (error || !data) {
            return null
        }

        // Map database columns to domain model
        return {
            id: data.id,
            username: data.username,
            passwordHash: data.password_hash,
            name: data.name,
            role: data.role as "super_admin" | "branch_owner",
            branchId: data.branch_id,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        } as any
    },

    /**
     * Find admin by ID
     */
    async findById(id: string): Promise<Admin | null> {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from("admins")
            .select("*")
            .eq("id", id)
            .single()

        if (error || !data) {
            return null
        }

        return {
            id: data.id,
            username: data.username,
            name: data.name,
            role: data.role,
            branchId: data.branch_id,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        } as Admin
    },

    /**
     * Get all admins (super_admin only)
     */
    async findAll(): Promise<Admin[]> {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from("admins")
            .select("id, username, name, role, branch_id, created_at, updated_at")
            .order("created_at", { ascending: false })

        if (error || !data) {
            return []
        }

        return data.map((admin) => ({
            id: admin.id,
            username: admin.username,
            name: admin.name,
            role: admin.role,
            branchId: admin.branch_id,
            createdAt: admin.created_at,
            updatedAt: admin.updated_at,
        })) as Admin[]
    },

    /**
     * Create new admin
     */
    async create(admin: Partial<Admin> & { passwordHash: string }): Promise<Admin> {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from("admins")
            .insert({
                username: admin.username,
                password_hash: admin.passwordHash,
                name: admin.name,
                role: admin.role,
                branch_id: admin.branchId,
            })
            .select()
            .single()

        if (error || !data) {
            throw new Error(`Failed to create admin: ${error?.message}`)
        }

        return {
            id: data.id,
            username: data.username,
            name: data.name,
            role: data.role,
            branchId: data.branch_id,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        } as Admin
    },
}

