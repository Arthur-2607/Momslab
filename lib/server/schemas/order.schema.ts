import { z } from "zod"

/**
 * Order Schemas
 * Single source of truth for order validation and typing
 */

// Payment Status Enum
export const PaymentStatusSchema = z.enum(["pending", "completed", "failed", "refunded"])
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>

// Fulfillment Status Enum
export const FulfillmentStatusSchema = z.enum([
    "preparing",
    "ready_for_pickup",
    "picked_up",
    "cancelled"
])
export type FulfillmentStatus = z.infer<typeof FulfillmentStatusSchema>

// Base Order Schema (from database)
export const OrderSchema = z.object({
    id: z.string().uuid(),
    orderNumber: z.string().min(1, "주문번호는 필수입니다"),
    customerId: z.string().uuid("고객 ID가 필요합니다"),
    branchId: z.string().uuid("지점 ID가 필요합니다"),
    productId: z.string().uuid("상품 ID가 필요합니다"),
    quantity: z.number().int().min(1, "수량은 1 이상이어야 합니다"),
    unitPrice: z.number().int().min(0, "단가는 0 이상이어야 합니다"),
    totalAmount: z.number().int().min(0, "총액은 0 이상이어야 합니다"),
    paymentStatus: PaymentStatusSchema,
    fulfillmentStatus: FulfillmentStatusSchema,
    pickupDate: z.string().datetime().nullable().optional(),
    notes: z.string().nullable().optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
})

export type Order = z.infer<typeof OrderSchema>

// Order with Related Data (for display)
export const OrderWithDetailsSchema = OrderSchema.extend({
    customerName: z.string().optional(),
    customerEmail: z.string().optional(),
    branchName: z.string().optional(),
    productName: z.string().optional(),
    productImageUrl: z.string().optional(),
})

export type OrderWithDetails = z.infer<typeof OrderWithDetailsSchema>

// Create Order Schema
export const CreateOrderSchema = z.object({
    customerId: z.string().uuid("고객 ID가 필요합니다"),
    branchId: z.string().uuid("지점 ID가 필요합니다"),
    productId: z.string().uuid("상품 ID가 필요합니다"),
    quantity: z.number().int().min(1, "수량은 1 이상이어야 합니다"),
    unitPrice: z.number().int().min(0, "단가는 0 이상이어야 합니다"),
    notes: z.string().optional(),
})

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>

// Update Order Schema
export const UpdateOrderSchema = z.object({
    id: z.string().uuid("주문 ID가 필요합니다"),
    paymentStatus: PaymentStatusSchema.optional(),
    fulfillmentStatus: FulfillmentStatusSchema.optional(),
    pickupDate: z.string().datetime().nullable().optional(),
    notes: z.string().nullable().optional(),
})

export type UpdateOrderDto = z.infer<typeof UpdateOrderSchema>

// Order List Query Schema
export const OrderListQuerySchema = z.object({
    branchId: z.string().uuid().optional(),
    customerId: z.string().uuid().optional(),
    productId: z.string().uuid().optional(),
    paymentStatus: PaymentStatusSchema.optional(),
    fulfillmentStatus: FulfillmentStatusSchema.optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    search: z.string().optional(), // Search by order number or product name
    limit: z.number().int().min(1).max(100).default(50),
    offset: z.number().int().min(0).default(0),
})

export type OrderListQuery = z.infer<typeof OrderListQuerySchema>

// Order Statistics Schema
export const OrderStatsSchema = z.object({
    totalOrders: z.number().int(),
    totalRevenue: z.number(),
    ordersByStatus: z.record(z.string(), z.number().int()),
    recentOrders: z.array(OrderSchema),
})

export type OrderStats = z.infer<typeof OrderStatsSchema>

// Action Result Schemas
export const OrderActionResultSchema = z.object({
    success: z.boolean(),
    error: z.string().optional(),
    order: OrderSchema.optional(),
})

export type OrderActionResult = z.infer<typeof OrderActionResultSchema>

export const OrderListResultSchema = z.object({
    success: z.boolean(),
    error: z.string().optional(),
    orders: z.array(OrderWithDetailsSchema).optional(),
    total: z.number().int().optional(),
})

export type OrderListResult = z.infer<typeof OrderListResultSchema>

