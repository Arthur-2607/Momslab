import { z } from "zod"

/**
 * Branch Schemas
 * Single source of truth for branch validation and typing
 */

// Branch Status Enum
export const BranchStatusSchema = z.enum(["active", "inactive"])
export type BranchStatus = z.infer<typeof BranchStatusSchema>

// Base Branch Schema (from database)
export const BranchSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, "지점명을 입력하세요").max(200),
    slug: z.string().min(1, "슬러그를 입력하세요").max(100),
    kakaoChannelId: z.string().min(1),
    notificationPhone: z.string().min(1),
    status: BranchStatusSchema,
    websiteUrl: z.string().nullable().optional(),
    themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "올바른 색상 코드를 입력하세요").nullable().optional(),
    address: z.string().nullable().optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
})

export type Branch = z.infer<typeof BranchSchema>

// Create Branch Schema
export const CreateBranchSchema = z.object({
    name: z.string().min(1, "지점명을 입력하세요").max(200),
    slug: z.string().min(1, "슬러그를 입력하세요").max(100).regex(/^[a-z0-9-]+$/, "소문자, 숫자, 하이픈만 사용 가능합니다"),
    kakaoChannelId: z.string().min(1, "카카오 채널 ID를 입력하세요"),
    notificationPhone: z.string().min(1, "연락처를 입력하세요"),
    status: BranchStatusSchema.default("active"),
    websiteUrl: z.string().optional(),
    themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#10b981"),
    address: z.string().optional(),
})

export type CreateBranchDto = z.infer<typeof CreateBranchSchema>

// Update Branch Schema
export const UpdateBranchSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(200).optional(),
    slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
    kakaoChannelId: z.string().optional(),
    notificationPhone: z.string().optional(),
    status: BranchStatusSchema.optional(),
    websiteUrl: z.string().optional(),
    themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    address: z.string().optional(),
})

export type UpdateBranchDto = z.infer<typeof UpdateBranchSchema>

// Branch Query Schema
export const BranchQuerySchema = z.object({
    slug: z.string().optional(),
    status: BranchStatusSchema.optional(),
})

export type BranchQuery = z.infer<typeof BranchQuerySchema>

// Action Result Schemas
export const BranchActionResultSchema = z.object({
    success: z.boolean(),
    error: z.string().optional(),
    branch: BranchSchema.optional(),
})

export type BranchActionResult = z.infer<typeof BranchActionResultSchema>

export const BranchListResultSchema = z.object({
    success: z.boolean(),
    error: z.string().optional(),
    branches: z.array(BranchSchema).optional(),
})

export type BranchListResult = z.infer<typeof BranchListResultSchema>

