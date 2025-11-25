import { branchRepository } from "../repositories/branch.repository"
import type { Branch, CreateBranchDto, UpdateBranchDto, BranchQuery } from "../schemas/branch.schema"

/**
 * Branch Service
 * Business logic for branch operations
 */

export const BranchService = {
    /**
     * Get branch by ID
     */
    async getBranchById(id: string): Promise<Branch> {
        const branch = await branchRepository.findById(id)

        if (!branch) {
            throw new Error("지점을 찾을 수 없습니다.")
        }

        return branch
    },

    /**
     * Get branch by slug
     */
    async getBranchBySlug(slug: string): Promise<Branch> {
        const branch = await branchRepository.findBySlug(slug)

        if (!branch) {
            throw new Error("지점을 찾을 수 없습니다.")
        }

        return branch
    },

    /**
     * List all branches
     */
    async listBranches(query?: BranchQuery): Promise<Branch[]> {
        return await branchRepository.findAll(query)
    },

    /**
     * Get only active branches
     */
    async getActiveBranches(): Promise<Branch[]> {
        return await branchRepository.findActive()
    },

    /**
     * Create new branch
     */
    async createBranch(branchData: CreateBranchDto): Promise<Branch> {
        // Check if slug already exists
        const slugExists = await branchRepository.slugExists(branchData.slug)
        if (slugExists) {
            throw new Error("이미 사용 중인 슬러그입니다.")
        }

        return await branchRepository.create(branchData)
    },

    /**
     * Update existing branch
     */
    async updateBranch(branchData: UpdateBranchDto): Promise<Branch> {
        // Verify branch exists
        const existingBranch = await branchRepository.findById(branchData.id)
        if (!existingBranch) {
            throw new Error("지점을 찾을 수 없습니다.")
        }

        // Check slug uniqueness if slug is being updated
        if (branchData.slug && branchData.slug !== existingBranch.slug) {
            const slugExists = await branchRepository.slugExists(branchData.slug, branchData.id)
            if (slugExists) {
                throw new Error("이미 사용 중인 슬러그입니다.")
            }
        }

        return await branchRepository.update(branchData)
    },

    /**
     * Delete branch
     */
    async deleteBranch(id: string): Promise<void> {
        const branch = await branchRepository.findById(id)
        if (!branch) {
            throw new Error("지점을 찾을 수 없습니다.")
        }

        const success = await branchRepository.delete(id)
        if (!success) {
            throw new Error("지점 삭제에 실패했습니다.")
        }
    },

    /**
     * Toggle branch status
     */
    async toggleBranchStatus(id: string): Promise<Branch> {
        const branch = await branchRepository.findById(id)
        if (!branch) {
            throw new Error("지점을 찾을 수 없습니다.")
        }

        const newStatus = branch.status === "active" ? "inactive" : "active"

        return await branchRepository.update({
            id,
            status: newStatus,
        })
    },
}

