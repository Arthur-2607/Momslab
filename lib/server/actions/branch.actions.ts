"use server"

import { revalidatePath } from "next/cache"
import {
    CreateBranchSchema,
    UpdateBranchSchema,
    BranchQuerySchema,
    type CreateBranchDto,
    type UpdateBranchDto,
    type BranchQuery,
    type BranchActionResult,
    type BranchListResult,
} from "../schemas/branch.schema"
import { BranchService } from "../services/branch.service"

/**
 * Branch Actions
 * Server Actions for branch operations
 * Entry point for client-side calls
 */

/**
 * Get branch by ID
 */
export async function getBranchById(id: string): Promise<BranchActionResult> {
    try {
        const branch = await BranchService.getBranchById(id)
        return { success: true, branch }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "지점을 불러올 수 없습니다.",
        }
    }
}

/**
 * Get branch by slug
 */
export async function getBranchBySlug(slug: string): Promise<BranchActionResult> {
    try {
        const branch = await BranchService.getBranchBySlug(slug)
        return { success: true, branch }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "지점을 불러올 수 없습니다.",
        }
    }
}

/**
 * List all branches
 */
export async function getAllBranches(query?: BranchQuery): Promise<BranchListResult> {
    try {
        const validatedQuery = query ? BranchQuerySchema.parse(query) : undefined
        const branches = await BranchService.listBranches(validatedQuery)
        return { success: true, branches }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "지점 목록을 불러올 수 없습니다.",
        }
    }
}

/**
 * Get active branches only
 */
export async function getActiveBranches(): Promise<BranchListResult> {
    try {
        const branches = await BranchService.getActiveBranches()
        return { success: true, branches }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "활성 지점 목록을 불러올 수 없습니다.",
        }
    }
}

/**
 * Create new branch
 */
export async function createBranch(branchData: CreateBranchDto): Promise<BranchActionResult> {
    try {
        const validatedData = CreateBranchSchema.parse(branchData)
        const branch = await BranchService.createBranch(validatedData)
        revalidatePath("/admin/branches")
        return { success: true, branch }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "지점을 생성할 수 없습니다.",
        }
    }
}

/**
 * Update branch
 */
export async function updateBranch(branchData: UpdateBranchDto): Promise<BranchActionResult> {
    try {
        const validatedData = UpdateBranchSchema.parse(branchData)
        const branch = await BranchService.updateBranch(validatedData)
        revalidatePath("/admin/branches")
        revalidatePath(`/${branch.slug}`)
        return { success: true, branch }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "지점을 수정할 수 없습니다.",
        }
    }
}

/**
 * Delete branch
 */
export async function deleteBranch(id: string): Promise<BranchActionResult> {
    try {
        await BranchService.deleteBranch(id)
        revalidatePath("/admin/branches")
        return { success: true }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "지점을 삭제할 수 없습니다.",
        }
    }
}

/**
 * Toggle branch status (active/inactive)
 */
export async function toggleBranchStatus(id: string): Promise<BranchActionResult> {
    try {
        const branch = await BranchService.toggleBranchStatus(id)
        revalidatePath("/admin/branches")
        revalidatePath(`/${branch.slug}`)
        return { success: true, branch }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "지점 상태를 변경할 수 없습니다.",
        }
    }
}

