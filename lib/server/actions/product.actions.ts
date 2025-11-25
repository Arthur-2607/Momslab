"use server"

import { revalidatePath } from "next/cache"
import {
    CreateProductSchema,
    UpdateProductSchema,
    ProductListQuerySchema,
    type CreateProductDto,
    type UpdateProductDto,
    type ProductListQuery,
    type ProductActionResult,
    type ProductListResult,
} from "../schemas/product.schema"
import { ProductService } from "../internal"

/**
 * Server Actions for Product Management
 * Thin layer - validates input and delegates to service layer
 * 
 * Following Next.js Full-Stack Architecture:
 * - Zod validation at entry point
 * - Business logic in service layer
 * - Data access in repository layer
 * - Minimal code in actions
 */

/**
 * Get product by ID
 */
export async function getProduct(id: string): Promise<ProductActionResult> {
    try {
        const product = await ProductService.getProductById(id)

        if (!product) {
            return {
                success: false,
                error: "상품을 찾을 수 없습니다",
            }
        }

        return {
            success: true,
            product,
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "상품 조회 중 오류가 발생했습니다",
        }
    }
}

/**
 * Get all products for a branch
 */
export async function getProductsByBranch(branchId: string): Promise<ProductListResult> {
    try {
        const products = await ProductService.getProductsByBranch(branchId)

        return {
            success: true,
            products,
            total: products.length,
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "상품 목록 조회 중 오류가 발생했습니다",
        }
    }
}

/**
 * Get all products for a branch by slug (for customer-facing pages)
 */
export async function getProductsByBranchSlug(branchSlug: string): Promise<ProductListResult> {
    try {
        const products = await ProductService.getProductsByBranchSlug(branchSlug)

        return {
            success: true,
            products,
            total: products.length,
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "상품 목록 조회 중 오류가 발생했습니다",
        }
    }
}

/**
 * List products with filters and pagination
 */
export async function listProducts(query: ProductListQuery): Promise<ProductListResult> {
    try {
        // Validate query
        const validatedQuery = ProductListQuerySchema.parse(query)

        // Get products
        const { products, total } = await ProductService.listProducts(validatedQuery)

        return {
            success: true,
            products,
            total,
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "상품 목록 조회 중 오류가 발생했습니다",
        }
    }
}

/**
 * Create new product
 */
export async function createProduct(productData: CreateProductDto): Promise<ProductActionResult> {
    try {
        // 1. Validate input with Zod
        const validatedData = CreateProductSchema.parse(productData)

        // 2. Create via service layer
        const product = await ProductService.createProduct(validatedData)

        // 3. Revalidate relevant paths
        revalidatePath(`/admin/branch-products`)
        revalidatePath(`/admin/catalog`)

        return {
            success: true,
            product,
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "상품 생성 중 오류가 발생했습니다",
        }
    }
}

/**
 * Update existing product
 */
export async function updateProduct(productData: UpdateProductDto): Promise<ProductActionResult> {
    try {
        // 1. Validate input with Zod
        const validatedData = UpdateProductSchema.parse(productData)

        // 2. Update via service layer
        const product = await ProductService.updateProduct(validatedData)

        // 3. Revalidate relevant paths
        revalidatePath(`/admin/branch-products`)
        revalidatePath(`/admin/catalog`)
        revalidatePath(`/admin/branch-products/${product.id}`)

        return {
            success: true,
            product,
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "상품 수정 중 오류가 발생했습니다",
        }
    }
}

/**
 * Delete product
 */
export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const success = await ProductService.deleteProduct(id)

        if (success) {
            // Revalidate relevant paths
            revalidatePath(`/admin/branch-products`)
            revalidatePath(`/admin/catalog`)
        }

        return { success }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "상품 삭제 중 오류가 발생했습니다",
        }
    }
}

/**
 * Update product status
 */
export async function updateProductStatus(
    id: string,
    status: "open" | "closed" | "soldout"
): Promise<ProductActionResult> {
    try {
        const product = await ProductService.updateProductStatus(id, status)

        // Revalidate relevant paths
        revalidatePath(`/admin/branch-products`)
        revalidatePath(`/admin/catalog`)

        return {
            success: true,
            product,
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "상품 상태 변경 중 오류가 발생했습니다",
        }
    }
}

/**
 * Get products with MOQ progress
 */
export async function getProductsWithProgress(branchId: string) {
    try {
        const products = await ProductService.getProductsWithProgress(branchId)

        return {
            success: true,
            products,
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "상품 조회 중 오류가 발생했습니다",
        }
    }
}

/**
 * Get products ending soon
 */
export async function getProductsEndingSoon(branchId?: string) {
    try {
        const products = await ProductService.getProductsEndingSoon(branchId)

        return {
            success: true,
            products,
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "상품 조회 중 오류가 발생했습니다",
        }
    }
}

/**
 * Get product statistics
 */
export async function getProductStats(branchId: string) {
    try {
        const stats = await ProductService.getProductStats(branchId)

        return {
            success: true,
            stats,
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "통계 조회 중 오류가 발생했습니다",
        }
    }
}

