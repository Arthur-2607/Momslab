"use server"

import { revalidatePath } from "next/cache"
import {
    CreateOrderSchema,
    UpdateOrderSchema,
    OrderListQuerySchema,
    type CreateOrderDto,
    type UpdateOrderDto,
    type OrderListQuery,
    type OrderActionResult,
    type OrderListResult,
} from "../schemas/order.schema"
import { OrderService } from "../internal"

/**
 * Server Actions for Order Management
 * Thin layer - validates input and delegates to service layer
 * 
 * Following Next.js Full-Stack Architecture:
 * - Zod validation at entry point
 * - Business logic in service layer
 * - Data access in repository layer
 * - Minimal code in actions
 */

/**
 * Get order by ID
 */
export async function getOrder(id: string): Promise<OrderActionResult> {
    try {
        const order = await OrderService.getOrderById(id)

        if (!order) {
            return {
                success: false,
                error: "주문을 찾을 수 없습니다",
            }
        }

        return {
            success: true,
            order: order as any,
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "주문 조회 중 오류가 발생했습니다",
        }
    }
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(orderNumber: string): Promise<OrderActionResult> {
    try {
        const order = await OrderService.getOrderByNumber(orderNumber)

        if (!order) {
            return {
                success: false,
                error: "주문을 찾을 수 없습니다",
            }
        }

        return {
            success: true,
            order: order as any,
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "주문 조회 중 오류가 발생했습니다",
        }
    }
}

/**
 * List orders with filters and pagination
 */
export async function listOrders(query: OrderListQuery): Promise<OrderListResult> {
    try {
        // Validate query
        const validatedQuery = OrderListQuerySchema.parse(query)

        // Get orders
        const { orders, total } = await OrderService.listOrders(validatedQuery)

        return {
            success: true,
            orders: orders as any,
            total,
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "주문 목록 조회 중 오류가 발생했습니다",
        }
    }
}

/**
 * Get orders by branch ID with optional filters
 */
export async function getOrdersByBranch(branchId: string, filters?: Partial<OrderListQuery>): Promise<OrderListResult> {
    try {
        const orders = await OrderService.getOrdersByBranch(branchId, filters)

        return {
            success: true,
            orders: orders as any,
            total: orders.length,
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "주문 목록 조회 중 오류가 발생했습니다",
        }
    }
}

/**
 * Get orders by customer ID with optional filters
 */
export async function getOrdersByCustomer(customerId: string, filters?: Partial<OrderListQuery>): Promise<OrderListResult> {
    try {
        const orders = await OrderService.getOrdersByCustomer(customerId, filters)

        return {
            success: true,
            orders: orders as any,
            total: orders.length,
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "주문 목록 조회 중 오류가 발생했습니다",
        }
    }
}

/**
 * Create new order
 */
export async function createOrder(orderData: CreateOrderDto): Promise<OrderActionResult> {
    try {
        // 1. Validate input with Zod
        const validatedData = CreateOrderSchema.parse(orderData)

        // 2. Create via service layer
        const order = await OrderService.createOrder(validatedData)

        // 3. Revalidate relevant paths
        revalidatePath(`/admin/orders`)
        revalidatePath(`/admin/branch-orders`)

        return {
            success: true,
            order,
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "주문 생성 중 오류가 발생했습니다",
        }
    }
}

/**
 * Update existing order
 */
export async function updateOrder(orderData: UpdateOrderDto): Promise<OrderActionResult> {
    try {
        // 1. Validate input with Zod
        const validatedData = UpdateOrderSchema.parse(orderData)

        // 2. Update via service layer
        const order = await OrderService.updateOrder(validatedData)

        // 3. Revalidate relevant paths
        revalidatePath(`/admin/orders`)
        revalidatePath(`/admin/branch-orders`)
        revalidatePath(`/admin/orders/${order.id}`)

        return {
            success: true,
            order,
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "주문 수정 중 오류가 발생했습니다",
        }
    }
}

/**
 * Update order fulfillment status
 */
export async function updateOrderStatus(
    id: string,
    status: "preparing" | "ready_for_pickup" | "picked_up" | "cancelled"
): Promise<OrderActionResult> {
    try {
        const order = await OrderService.updateOrderStatus(id, status)

        // Revalidate relevant paths
        revalidatePath(`/admin/orders`)
        revalidatePath(`/admin/branch-orders`)
        revalidatePath(`/admin/pickup`)

        return {
            success: true,
            order,
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "주문 상태 변경 중 오류가 발생했습니다",
        }
    }
}

/**
 * Update order payment status
 */
export async function updatePaymentStatus(
    id: string,
    status: "pending" | "completed" | "failed" | "refunded"
): Promise<OrderActionResult> {
    try {
        const order = await OrderService.updatePaymentStatus(id, status)

        // Revalidate relevant paths
        revalidatePath(`/admin/orders`)
        revalidatePath(`/admin/branch-orders`)

        return {
            success: true,
            order,
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "결제 상태 변경 중 오류가 발생했습니다",
        }
    }
}

/**
 * Cancel order
 */
export async function cancelOrder(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const success = await OrderService.cancelOrder(id)

        if (success) {
            // Revalidate relevant paths
            revalidatePath(`/admin/orders`)
            revalidatePath(`/admin/branch-orders`)
        }

        return { success }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "주문 취소 중 오류가 발생했습니다",
        }
    }
}

/**
 * Get order statistics
 */
export async function getOrderStats(branchId?: string) {
    try {
        const stats = await OrderService.getOrderStats(branchId)

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

/**
 * Get recent orders
 */
export async function getRecentOrders(branchId?: string, limit: number = 10) {
    try {
        const orders = await OrderService.getRecentOrders(branchId, limit)

        return {
            success: true,
            orders,
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "주문 조회 중 오류가 발생했습니다",
        }
    }
}

