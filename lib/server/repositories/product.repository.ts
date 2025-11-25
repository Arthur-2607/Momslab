import { createAdminClient } from "@/lib/supabase/admin"
import type { Product, CreateProductDto, UpdateProductDto, ProductListQuery } from "../schemas/product.schema"

/**
 * Product Repository
 * Handles all database operations for products
 * Abstracts Supabase implementation details
 */

// Helper to map database row to domain model
function mapToProduct(data: any): Product {
    return {
        id: data.id,
        branchId: data.branch_id,
        name: data.name,
        price: data.price,
        moq: data.moq,
        stock: data.stock,
        status: data.status,
        imageUrl: data.image_url,
        images: data.images,
        description: data.description,
        category: data.category,
        categoryId: data.category_id,
        startAt: data.start_at,
        endAt: data.end_at,
        currentOrders: data.current_orders || 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    }
}

export const productRepository = {
    /**
     * Find product by ID
     */
    async findById(id: string): Promise<Product | null> {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("id", id)
            .single()

        if (error || !data) {
            return null
        }

        return mapToProduct(data)
    },

    /**
     * Find all products by branch ID
     */
    async findByBranchId(branchId: string): Promise<Product[]> {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("branch_id", branchId)
            .order("created_at", { ascending: false })

        if (error || !data) {
            return []
        }

        return data.map(mapToProduct)
    },

    /**
     * Find all products by branch slug
     */
    async findByBranchSlug(branchSlug: string): Promise<Product[]> {
        const supabase = createAdminClient()

        console.log("🔍 [ProductRepository] Finding branch with slug:", branchSlug)

        // First get branch by slug
        const { data: branchData, error: branchError } = await supabase
            .from("branches")
            .select("id")
            .eq("slug", branchSlug)
            .single()

        if (branchError || !branchData) {
            console.error("❌ [ProductRepository] Branch not found:", { branchSlug, error: branchError })
            return []
        }

        console.log("✅ [ProductRepository] Found branch ID:", branchData.id)

        // Then get products for that branch
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("branch_id", branchData.id)
            .order("end_at", { ascending: true })

        if (error) {
            console.error("❌ [ProductRepository] Error fetching products:", error)
            return []
        }

        console.log("📦 [ProductRepository] Found", data?.length || 0, "products for branch", branchSlug)

        if (!data) {
            return []
        }

        return data.map(mapToProduct)
    },

    /**
     * List products with filters and pagination
     */
    async list(query: ProductListQuery): Promise<{ products: Product[]; total: number }> {
        const supabase = createAdminClient()

        let queryBuilder = supabase
            .from("products")
            .select("*", { count: "exact" })

        // Apply filters
        if (query.branchId) {
            queryBuilder = queryBuilder.eq("branch_id", query.branchId)
        }

        if (query.status) {
            queryBuilder = queryBuilder.eq("status", query.status)
        }

        if (query.category) {
            queryBuilder = queryBuilder.eq("category", query.category)
        }

        if (query.categoryId) {
            queryBuilder = queryBuilder.eq("category_id", query.categoryId)
        }

        if (query.search) {
            queryBuilder = queryBuilder.ilike("name", `%${query.search}%`)
        }

        // Apply pagination
        queryBuilder = queryBuilder
            .order("created_at", { ascending: false })
            .range(query.offset, query.offset + query.limit - 1)

        const { data, error, count } = await queryBuilder

        if (error || !data) {
            return { products: [], total: 0 }
        }

        return {
            products: data.map(mapToProduct),
            total: count || 0,
        }
    },

    /**
     * Create new product
     */
    async create(productData: CreateProductDto): Promise<Product> {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from("products")
            .insert({
                branch_id: productData.branchId,
                name: productData.name,
                price: productData.price,
                moq: productData.moq,
                stock: productData.stock || null,
                status: productData.status,
                image_url: productData.imageUrl,
                images: productData.images || null,
                description: productData.description || null,
                category: productData.category || null,
                category_id: productData.categoryId || null,
                start_at: productData.startAt,
                end_at: productData.endAt,
                current_orders: 0,
            })
            .select()
            .single()

        if (error || !data) {
            throw new Error(`Failed to create product: ${error?.message}`)
        }

        return mapToProduct(data)
    },

    /**
     * Update existing product
     */
    async update(productData: UpdateProductDto): Promise<Product> {
        const supabase = createAdminClient()

        const updateData: any = {}

        // Only include fields that are provided
        if (productData.name !== undefined) updateData.name = productData.name
        if (productData.price !== undefined) updateData.price = productData.price
        if (productData.moq !== undefined) updateData.moq = productData.moq
        if (productData.stock !== undefined) updateData.stock = productData.stock
        if (productData.status !== undefined) updateData.status = productData.status
        if (productData.imageUrl !== undefined) updateData.image_url = productData.imageUrl
        if (productData.images !== undefined) updateData.images = productData.images
        if (productData.description !== undefined) updateData.description = productData.description
        if (productData.category !== undefined) updateData.category = productData.category
        if (productData.categoryId !== undefined) updateData.category_id = productData.categoryId
        if (productData.startAt !== undefined) updateData.start_at = productData.startAt
        if (productData.endAt !== undefined) updateData.end_at = productData.endAt

        const { data, error } = await supabase
            .from("products")
            .update(updateData)
            .eq("id", productData.id)
            .select()
            .single()

        if (error || !data) {
            throw new Error(`Failed to update product: ${error?.message}`)
        }

        return mapToProduct(data)
    },

    /**
     * Delete product
     */
    async delete(id: string): Promise<boolean> {
        const supabase = createAdminClient()

        const { error } = await supabase
            .from("products")
            .delete()
            .eq("id", id)

        return !error
    },

    /**
     * Update current orders count
     */
    async updateCurrentOrders(id: string, currentOrders: number): Promise<void> {
        const supabase = createAdminClient()

        await supabase
            .from("products")
            .update({ current_orders: currentOrders })
            .eq("id", id)
    },

    /**
     * Get products ending soon (within 24 hours)
     */
    async findEndingSoon(branchId?: string): Promise<Product[]> {
        const supabase = createAdminClient()

        const now = new Date().toISOString()
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

        let query = supabase
            .from("products")
            .select("*")
            .gte("end_at", now)
            .lte("end_at", tomorrow)
            .eq("status", "open")

        if (branchId) {
            query = query.eq("branch_id", branchId)
        }

        const { data, error } = await query.order("end_at", { ascending: true })

        if (error || !data) {
            return []
        }

        return data.map(mapToProduct)
    },

    /**
     * Get products by status
     */
    async findByStatus(status: "open" | "closed" | "soldout", branchId?: string): Promise<Product[]> {
        const supabase = createAdminClient()

        let query = supabase
            .from("products")
            .select("*")
            .eq("status", status)

        if (branchId) {
            query = query.eq("branch_id", branchId)
        }

        const { data, error } = await query.order("created_at", { ascending: false })

        if (error || !data) {
            return []
        }

        return data.map(mapToProduct)
    },
}

