import { z } from "zod"

/**
 * Admin Authentication Schemas
 * Single source of truth for validation and typing
 */

// Sign In Schema
export const SignInAdminSchema = z.object({
    username: z.string().min(1, "아이디를 입력하세요").trim(),
    password: z.string().min(1, "비밀번호를 입력하세요"),
})

export type SignInAdminDto = z.infer<typeof SignInAdminSchema>

// Admin Session Schema
export const AdminSessionSchema = z.object({
    adminId: z.string().uuid(),
    username: z.string(),
    name: z.string(),
    role: z.enum(["super_admin", "branch_owner"]),
    branchId: z.string().uuid().optional(),
})

export type AdminSession = z.infer<typeof AdminSessionSchema>

// Admin Response Schema
export const AdminSchema = z.object({
    id: z.string().uuid(),
    username: z.string(),
    name: z.string(),
    role: z.enum(["super_admin", "branch_owner"]),
    branchId: z.string().uuid().nullable(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
})

export type Admin = z.infer<typeof AdminSchema>

// Auth Result Schema
export const AdminAuthResultSchema = z.object({
    success: z.boolean(),
    error: z.string().optional(),
    admin: AdminSchema.omit({ createdAt: true, updatedAt: true })
        .extend({ branchId: z.string().optional() })
        .optional(),
})

export type AdminAuthResult = z.infer<typeof AdminAuthResultSchema>

