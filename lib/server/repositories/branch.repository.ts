import { createAdminClient } from "@/lib/supabase/admin"
import type { Branch, CreateBranchDto, UpdateBranchDto, BranchQuery } from "../schemas/branch.schema"

/**
 * Branch Repository
 * Handles all database operations for branches
 * Abstracts Supabase implementation details
 */

// Helper to map database row to domain model
function mapToBranch(data: any): Branch {
    return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        kakaoChannelId: data.kakao_channel_id,
        notificationPhone: data.notification_phone,
        status: data.status,
        websiteUrl: data.website_url,
        themeColor: data.theme_color,
        address: data.address,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    }
}

export const branchRepository = {
    /**
     * Find branch by ID
     */
    async findById(id: string): Promise<Branch | null> {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from("branches")
            .select("*")
            .eq("id", id)
            .single()

        if (error || !data) {
            return null
        }

        return mapToBranch(data)
    },

    /**
     * Find branch by slug
     */
    async findBySlug(slug: string): Promise<Branch | null> {
        const supabase = createAdminClient()

        console.log("🔍 [BranchRepository] Finding branch with slug:", slug)

        const { data, error } = await supabase
            .from("branches")
            .select("*")
            .eq("slug", slug)
            .single()

        if (error) {
            console.error("❌ [BranchRepository] Error finding branch:", { slug, error })
            return null
        }

        if (!data) {
            console.warn("⚠️ [BranchRepository] No branch found with slug:", slug)
            return null
        }

        console.log("✅ [BranchRepository] Found branch:", { id: data.id, name: data.name, slug: data.slug })

        return mapToBranch(data)
    },

    /**
     * List all branches
     */
    async findAll(query?: BranchQuery): Promise<Branch[]> {
        const supabase = createAdminClient()

        let queryBuilder = supabase
            .from("branches")
            .select("*")
            .order("created_at", { ascending: false })

        // Apply filters
        if (query?.status) {
            queryBuilder = queryBuilder.eq("status", query.status)
        }

        if (query?.slug) {
            queryBuilder = queryBuilder.eq("slug", query.slug)
        }

        const { data, error } = await queryBuilder

        if (error || !data) {
            return []
        }

        return data.map(mapToBranch)
    },

    /**
     * Get active branches
     */
    async findActive(): Promise<Branch[]> {
        return await this.findAll({ status: "active" })
    },

    /**
     * Create new branch
     */
    async create(branchData: CreateBranchDto): Promise<Branch> {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from("branches")
            .insert({
                name: branchData.name,
                slug: branchData.slug,
                kakao_channel_id: branchData.kakaoChannelId,
                notification_phone: branchData.notificationPhone,
                status: branchData.status,
                website_url: branchData.websiteUrl || null,
                theme_color: branchData.themeColor || "#10b981",
                address: branchData.address || null,
            })
            .select()
            .single()

        if (error || !data) {
            throw new Error(`Failed to create branch: ${error?.message}`)
        }

        return mapToBranch(data)
    },

    /**
     * Update existing branch
     */
    async update(branchData: UpdateBranchDto): Promise<Branch> {
        const supabase = createAdminClient()

        const updateData: any = {}

        // Only include fields that are provided
        if (branchData.name !== undefined) updateData.name = branchData.name
        if (branchData.slug !== undefined) updateData.slug = branchData.slug
        if (branchData.kakaoChannelId !== undefined) updateData.kakao_channel_id = branchData.kakaoChannelId
        if (branchData.notificationPhone !== undefined) updateData.notification_phone = branchData.notificationPhone
        if (branchData.status !== undefined) updateData.status = branchData.status
        if (branchData.websiteUrl !== undefined) updateData.website_url = branchData.websiteUrl
        if (branchData.themeColor !== undefined) updateData.theme_color = branchData.themeColor
        if (branchData.address !== undefined) updateData.address = branchData.address

        const { data, error } = await supabase
            .from("branches")
            .update(updateData)
            .eq("id", branchData.id)
            .select()
            .single()

        if (error || !data) {
            throw new Error(`Failed to update branch: ${error?.message}`)
        }

        return mapToBranch(data)
    },

    /**
     * Delete branch
     */
    async delete(id: string): Promise<boolean> {
        const supabase = createAdminClient()

        const { error } = await supabase
            .from("branches")
            .delete()
            .eq("id", id)

        return !error
    },

    /**
     * Check if slug exists
     */
    async slugExists(slug: string, excludeId?: string): Promise<boolean> {
        const supabase = createAdminClient()

        let query = supabase
            .from("branches")
            .select("id")
            .eq("slug", slug)

        if (excludeId) {
            query = query.neq("id", excludeId)
        }

        const { data, error } = await query.single()

        return !error && !!data
    },
}

