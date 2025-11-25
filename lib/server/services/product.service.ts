import { productRepository } from "../repositories/product.repository"
import type {
    Product,
    CreateProductDto,
    UpdateProductDto,
    ProductListQuery,
    ProductWithProgress,
} from "../schemas/product.schema"

/**
 * Product Service
 * Contains all business logic for product management
 * Independent of transport layer (Server Actions, API Routes, etc.)
 */

export class ProductService {
    /**
     * Get product by ID
     */
    static async getProductById(id: string): Promise<Product | null> {
        return await productRepository.findById(id)
    }

    /**
     * Get all products for a branch
     */
    static async getProductsByBranch(branchId: string): Promise<Product[]> {
        return await productRepository.findByBranchId(branchId)
    }

    /**
     * Get all products for a branch by slug
     */
    static async getProductsByBranchSlug(branchSlug: string): Promise<Product[]> {
        return await productRepository.findByBranchSlug(branchSlug)
    }

    /**
     * List products with filters and pagination
     */
    static async listProducts(
        query: ProductListQuery
    ): Promise<{ products: Product[]; total: number }> {
        return await productRepository.list(query)
    }

    /**
     * Create new product
     * 
     * @throws Error if validation fails or creation fails
     */
    static async createProduct(productData: CreateProductDto): Promise<Product> {
        // Business rule: Validate dates
        const startDate = new Date(productData.startAt)
        const endDate = new Date(productData.endAt)

        if (endDate <= startDate) {
            throw new Error("종료 날짜는 시작 날짜보다 늦어야 합니다")
        }

        // Business rule: Check if product period is reasonable (not more than 1 year)
        const oneYear = 365 * 24 * 60 * 60 * 1000
        if (endDate.getTime() - startDate.getTime() > oneYear) {
            throw new Error("상품 판매 기간은 1년을 초과할 수 없습니다")
        }

        return await productRepository.create(productData)
    }

    /**
     * Update existing product
     * 
     * @throws Error if product not found or update fails
     */
    static async updateProduct(productData: UpdateProductDto): Promise<Product> {
        // Check if product exists
        const existing = await productRepository.findById(productData.id)
        if (!existing) {
            throw new Error("상품을 찾을 수 없습니다")
        }

        // Business rule: Validate dates if both are being updated
        if (productData.startAt && productData.endAt) {
            const startDate = new Date(productData.startAt)
            const endDate = new Date(productData.endAt)

            if (endDate <= startDate) {
                throw new Error("종료 날짜는 시작 날짜보다 늦어야 합니다")
            }
        }

        return await productRepository.update(productData)
    }

    /**
     * Delete product
     * 
     * @throws Error if product has active orders
     */
    static async deleteProduct(id: string): Promise<boolean> {
        // Check if product exists
        const product = await productRepository.findById(id)
        if (!product) {
            throw new Error("상품을 찾을 수 없습니다")
        }

        // Business rule: Cannot delete product with active orders
        if (product.currentOrders > 0) {
            throw new Error("주문이 있는 상품은 삭제할 수 없습니다. 먼저 상품을 종료하세요.")
        }

        return await productRepository.delete(id)
    }

    /**
     * Update product status
     */
    static async updateProductStatus(
        id: string,
        status: "open" | "closed" | "soldout"
    ): Promise<Product> {
        return await productRepository.update({ id, status })
    }

    /**
     * Calculate MOQ progress for products
     */
    static calculateMOQProgress(product: Product): ProductWithProgress {
        const progress = Math.min((product.currentOrders / product.moq) * 100, 100)
        const moqAchieved = product.currentOrders >= product.moq

        return {
            ...product,
            moqProgress: Math.round(progress),
            moqAchieved,
        }
    }

    /**
     * Get products with MOQ progress
     */
    static async getProductsWithProgress(branchId: string): Promise<ProductWithProgress[]> {
        const products = await productRepository.findByBranchId(branchId)
        return products.map((product) => this.calculateMOQProgress(product))
    }

    /**
     * Get products ending soon
     */
    static async getProductsEndingSoon(branchId?: string): Promise<Product[]> {
        return await productRepository.findEndingSoon(branchId)
    }

    /**
     * Get open products
     */
    static async getOpenProducts(branchId?: string): Promise<Product[]> {
        return await productRepository.findByStatus("open", branchId)
    }

    /**
     * Get closed products
     */
    static async getClosedProducts(branchId?: string): Promise<Product[]> {
        return await productRepository.findByStatus("closed", branchId)
    }

    /**
     * Check if product can be ordered
     */
    static canOrder(product: Product): { canOrder: boolean; reason?: string } {
        // Check status
        if (product.status !== "open") {
            return {
                canOrder: false,
                reason: product.status === "soldout" ? "품절된 상품입니다" : "판매가 종료된 상품입니다",
            }
        }

        // Check stock
        if (product.stock !== null && product.stock <= 0) {
            return { canOrder: false, reason: "재고가 부족합니다" }
        }

        // Check period
        const now = new Date()
        const startDate = new Date(product.startAt)
        const endDate = new Date(product.endAt)

        if (now < startDate) {
            return { canOrder: false, reason: "판매 시작 전입니다" }
        }

        if (now > endDate) {
            return { canOrder: false, reason: "판매 기간이 종료되었습니다" }
        }

        return { canOrder: true }
    }

    /**
     * Get product statistics
     */
    static async getProductStats(
        branchId: string
    ): Promise<{
        totalProducts: number
        openProducts: number
        closedProducts: number
        soldoutProducts: number
        moqAchievedCount: number
    }> {
        const allProducts = await productRepository.findByBranchId(branchId)

        return {
            totalProducts: allProducts.length,
            openProducts: allProducts.filter((p) => p.status === "open").length,
            closedProducts: allProducts.filter((p) => p.status === "closed").length,
            soldoutProducts: allProducts.filter((p) => p.status === "soldout").length,
            moqAchievedCount: allProducts.filter((p) => p.currentOrders >= p.moq).length,
        }
    }
}

