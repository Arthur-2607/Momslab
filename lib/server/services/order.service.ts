import { orderRepository } from "../repositories/order.repository"
import type {
    Order,
    OrderWithDetails,
    CreateOrderDto,
    UpdateOrderDto,
    OrderListQuery,
    OrderStats,
} from "../schemas/order.schema"

/**
 * Order Service
 * Business logic layer for order management
 * Handles validation, order number generation, and business rules
 */

export class OrderService {
    /**
     * Generate unique order number
     * Format: ORD-YYYYMMDD-XXXXX (e.g., ORD-20251120-00001)
     */
    private static generateOrderNumber(): string {
        const date = new Date()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        const random = String(Math.floor(Math.random() * 100000)).padStart(5, "0")

        return `ORD-${year}${month}${day}-${random}`
    }

    /**
     * Get order by ID
     */
    static async getOrderById(id: string): Promise<OrderWithDetails | null> {
        return await orderRepository.findById(id)
    }

    /**
     * Get order by order number
     */
    static async getOrderByNumber(orderNumber: string): Promise<OrderWithDetails | null> {
        return await orderRepository.findByOrderNumber(orderNumber)
    }

    /**
     * List orders with filters
     */
    static async listOrders(query: OrderListQuery): Promise<{ orders: OrderWithDetails[]; total: number }> {
        return await orderRepository.list(query)
    }

    /**
     * Get orders by branch ID with optional filters
     */
    static async getOrdersByBranch(branchId: string, filters?: Partial<OrderListQuery>): Promise<OrderWithDetails[]> {
        return await orderRepository.findByBranch(branchId, filters)
    }

    /**
     * Get orders by customer ID with optional filters
     */
    static async getOrdersByCustomer(customerId: string, filters?: Partial<OrderListQuery>): Promise<OrderWithDetails[]> {
        return await orderRepository.findByCustomer(customerId, filters)
    }

    /**
     * Create new order
     */
    static async createOrder(orderData: CreateOrderDto): Promise<Order> {
        // Generate unique order number
        const orderNumber = this.generateOrderNumber()

        // Calculate total amount
        const totalAmount = orderData.quantity * orderData.unitPrice

        // Validate quantity is positive
        if (orderData.quantity <= 0) {
            throw new Error("수량은 1 이상이어야 합니다")
        }

        // Validate price is positive
        if (orderData.unitPrice < 0) {
            throw new Error("단가는 0 이상이어야 합니다")
        }

        // Create order
        const order = await orderRepository.create({
            ...orderData,
            orderNumber,
            totalAmount,
        })

        return order
    }

    /**
     * Update order
     */
    static async updateOrder(orderData: UpdateOrderDto): Promise<Order> {
        const { id, ...updateFields } = orderData

        // Verify order exists
        const existing = await orderRepository.findById(id)
        if (!existing) {
            throw new Error("주문을 찾을 수 없습니다")
        }

        // Update order
        const order = await orderRepository.update(id, updateFields)

        return order
    }

    /**
     * Update order status (fulfillment)
     */
    static async updateOrderStatus(
        id: string,
        fulfillmentStatus: "preparing" | "ready_for_pickup" | "picked_up" | "cancelled"
    ): Promise<Order> {
        // Verify order exists
        const existing = await orderRepository.findById(id)
        if (!existing) {
            throw new Error("주문을 찾을 수 없습니다")
        }

        // Set pickup date if status is picked_up
        const pickupDate = fulfillmentStatus === "picked_up" ? new Date().toISOString() : undefined

        // Update order
        const order = await orderRepository.update(id, {
            fulfillmentStatus,
            pickupDate,
        })

        return order
    }

    /**
     * Update payment status
     */
    static async updatePaymentStatus(
        id: string,
        paymentStatus: "pending" | "completed" | "failed" | "refunded"
    ): Promise<Order> {
        // Verify order exists
        const existing = await orderRepository.findById(id)
        if (!existing) {
            throw new Error("주문을 찾을 수 없습니다")
        }

        // Update order
        const order = await orderRepository.update(id, {
            paymentStatus,
        })

        return order
    }

    /**
     * Cancel order
     */
    static async cancelOrder(id: string): Promise<boolean> {
        // Verify order exists
        const existing = await orderRepository.findById(id)
        if (!existing) {
            throw new Error("주문을 찾을 수 없습니다")
        }

        // Check if order can be cancelled
        if (existing.fulfillmentStatus === "picked_up") {
            throw new Error("픽업 완료된 주문은 취소할 수 없습니다")
        }

        // Cancel order
        return await orderRepository.delete(id)
    }

    /**
     * Get order statistics
     */
    static async getOrderStats(branchId?: string): Promise<OrderStats> {
        const stats = await orderRepository.getStats(branchId)

        // Get recent orders
        const { orders: recentOrders } = await orderRepository.list({
            branchId,
            limit: 10,
            offset: 0,
        })

        return {
            totalOrders: stats.totalOrders,
            totalRevenue: stats.totalRevenue,
            ordersByStatus: stats.ordersByStatus,
            recentOrders: recentOrders as Order[],
        }
    }

    /**
     * Get orders ending soon (for dashboard)
     */
    static async getRecentOrders(branchId?: string, limit: number = 10): Promise<OrderWithDetails[]> {
        const { orders } = await orderRepository.list({
            branchId,
            limit,
            offset: 0,
        })

        return orders
    }
}

