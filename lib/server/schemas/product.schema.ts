import { z } from "zod"

/**
 * Product Schemas
 * Single source of truth for product validation and typing
 */

// Product Status Enum
export const ProductStatusSchema = z.enum(["open", "closed", "soldout"])
export type ProductStatus = z.infer<typeof ProductStatusSchema>

// Base Product Schema (from database)
export const ProductSchema = z.object({
    id: z.string().uuid(),
    branchId: z.string().uuid(),
    name: z.string().min(1, "상품명을 입력하세요").max(300),
    price: z.number().int().min(0, "가격은 0 이상이어야 합니다"),
    moq: z.number().int().min(1, "최소 주문 수량은 1 이상이어야 합니다"),
    stock: z.number().int().min(0).nullable(),
    status: ProductStatusSchema,
    imageUrl: z.string().url("올바른 이미지 URL을 입력하세요"),
    images: z.array(z.string().url()).nullable().optional(),
    description: z.string().nullable().optional(),
    category: z.string().max(100).nullable().optional(),
    categoryId: z.string().uuid().nullable().optional(),
    startAt: z.string().datetime(),
    endAt: z.string().datetime(),
    currentOrders: z.number().int().min(0).default(0),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
})

export type Product = z.infer<typeof ProductSchema>

// Create Product Schema (for admin creating new product)
export const CreateProductSchema = z.object({
    branchId: z.string().uuid("지점을 선택하세요"),
    name: z.string().min(1, "상품명을 입력하세요").max(300),
    price: z.number().int().min(0, "가격은 0 이상이어야 합니다"),
    moq: z.number().int().min(1, "최소 주문 수량은 1 이상이어야 합니다"),
    stock: z.number().int().min(0).nullable().optional(),
    status: ProductStatusSchema.default("open"),
    imageUrl: z.string().url("올바른 이미지 URL을 입력하세요"),
    images: z.array(z.string().url()).optional(),
    description: z.string().optional(),
    category: z.string().max(100).optional(),
    categoryId: z.string().uuid().optional(),
    startAt: z.string().datetime("시작 날짜를 입력하세요"),
    endAt: z.string().datetime("종료 날짜를 입력하세요"),
}).refine(
    (data) => new Date(data.endAt) > new Date(data.startAt),
    {
        message: "종료 날짜는 시작 날짜보다 늦어야 합니다",
        path: ["endAt"],
    }
)

export type CreateProductDto = z.infer<typeof CreateProductSchema>

// Update Product Schema (partial update)
export const UpdateProductSchema = z.object({
    id: z.string().uuid("상품 ID가 필요합니다"),
    name: z.string().min(1).max(300).optional(),
    price: z.number().int().min(0).optional(),
    moq: z.number().int().min(1).optional(),
    stock: z.number().int().min(0).nullable().optional(),
    status: ProductStatusSchema.optional(),
    imageUrl: z.string().url().optional(),
    images: z.array(z.string().url()).optional(),
    description: z.string().optional(),
    category: z.string().max(100).optional(),
    categoryId: z.string().uuid().optional(),
    startAt: z.string().datetime().optional(),
    endAt: z.string().datetime().optional(),
})

export type UpdateProductDto = z.infer<typeof UpdateProductSchema>

// Product List Query Schema
export const ProductListQuerySchema = z.object({
    branchId: z.string().uuid().optional(),
    status: ProductStatusSchema.optional(),
    category: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    search: z.string().optional(),
    limit: z.number().int().min(1).max(100).default(20),
    offset: z.number().int().min(0).default(0),
})

export type ProductListQuery = z.infer<typeof ProductListQuerySchema>

// Product with MOQ Progress (for display)
export const ProductWithProgressSchema = ProductSchema.extend({
    moqProgress: z.number().min(0).max(100),
    moqAchieved: z.boolean(),
})

export type ProductWithProgress = z.infer<typeof ProductWithProgressSchema>

// Action Result Schemas
export const ProductActionResultSchema = z.object({
    success: z.boolean(),
    error: z.string().optional(),
    product: ProductSchema.optional(),
})

export type ProductActionResult = z.infer<typeof ProductActionResultSchema>

export const ProductListResultSchema = z.object({
    success: z.boolean(),
    error: z.string().optional(),
    products: z.array(ProductSchema).optional(),
    total: z.number().int().optional(),
})

export type ProductListResult = z.infer<typeof ProductListResultSchema>

